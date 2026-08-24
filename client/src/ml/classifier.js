import * as tf from '@tensorflow/tfjs';

const MODEL_ROOT = '/models/agrieedge-v2';

let modelInstance = null;
let labelsCache = null;
let metadataCache = null;
let isInitializing = false;
let initPromise = null;

/**
 * Initializes TensorFlow.js backend (WebGL preferred, CPU fallback)
 * and loads the MobileNetV2 Float32 model and metadata.
 */
export async function loadAgriEdgeModel() {
  if (modelInstance && labelsCache) {
    return {
      model: modelInstance,
      labels: labelsCache,
      metadata: metadataCache,
    };
  }

  if (isInitializing) {
    return initPromise;
  }

  isInitializing = true;
  initPromise = (async () => {
    try {
      // Set backend to WebGL for GPU acceleration, fallback to CPU
      try {
        await tf.setBackend('webgl');
      } catch (backendErr) {
        console.warn('WebGL backend unavailable, falling back to CPU:', backendErr);
        await tf.setBackend('cpu');
      }
      await tf.ready();

      // Load model graph & shards along with class metadata
      const [model, labels, metadata] = await Promise.all([
        tf.loadLayersModel(`${MODEL_ROOT}/model.json`),
        fetch(`${MODEL_ROOT}/labels.json`).then((res) => {
          if (!res.ok) throw new Error(`Failed to load labels.json: ${res.statusText}`);
          return res.json();
        }),
        fetch(`${MODEL_ROOT}/metadata.json`).then((res) => {
          if (!res.ok) throw new Error(`Failed to load metadata.json: ${res.statusText}`);
          return res.json();
        }),
      ]);

      modelInstance = model;
      labelsCache = labels;
      metadataCache = metadata;

      // Warmup model to compile WebGL shaders
      await warmupModel(model);

      return { model, labels, metadata };
    } finally {
      isInitializing = false;
    }
  })();

  return initPromise;
}

/**
 * Executes a dummy tensor through the model to compile WebGL shaders.
 * This eliminates the 1-2 second first-scan freeze for users.
 */
async function warmupModel(model) {
  try {
    tf.tidy(() => {
      const dummyInput = tf.zeros([1, 224, 224, 3], 'float32');
      model.predict(dummyInput);
    });
  } catch (err) {
    console.warn('Model warmup non-critical error:', err);
  }
}

/**
 * Preprocesses an HTML Image, Canvas, or Video element to 224x224x3 Float32 tensor.
 * 
 * CRITICAL ML PREPROCESSING SPEC:
 * - Pixel values are preserved in the [0, 255] float range.
 * - DO NOT divide by 255.
 * - Internal model layer performs Rescaling(1/127.5, offset=-1).
 */
export function preprocessImage(imageElement) {
  return tf.tidy(() => {
    return tf.browser
      .fromPixels(imageElement, 3)
      .resizeBilinear([224, 224], true)
      .toFloat()
      .expandDims(0);
  });
}

/**
 * Evaluates the model prediction against uncertainty thresholds.
 * @param {Array} topPredictions 
 * @param {Object} policy 
 */
export function evaluateUncertainty(topPredictions, policy = { minimumConfidence: 0.60, minimumMargin: 0.10 }) {
  const top1 = topPredictions[0] || null;
  const top2 = topPredictions[1] || null;

  const confidence = top1 ? top1.probability : 0;
  const margin = top2 ? confidence - top2.probability : confidence;

  const isAccepted = confidence >= policy.minimumConfidence && margin >= policy.minimumMargin;

  return {
    isAccepted,
    confidence,
    margin,
    threshold: policy.minimumConfidence,
    marginThreshold: policy.minimumMargin,
    guidance: isAccepted
      ? 'Diagnosis verified with high statistical certainty.'
      : 'Result uncertain. Retake one clear photo of a single leaf in natural lighting, keep the leaf centered, and avoid strong shadows or blur.',
  };
}

/**
 * Runs offline edge inference on an image element and returns top predictions.
 * 
 * @param {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} imageElement
 * @param {number} topK - Number of top results to return (default 3)
 * @returns {Promise<Object>} Object containing top3, topPrediction, uncertainty assessment, and inference execution time (ms)
 */
export async function predictLeaf(imageElement, topK = 3) {
  if (!imageElement) {
    throw new Error('predictLeaf requires a valid image, canvas, or video element.');
  }

  const { model, labels, metadata } = await loadAgriEdgeModel();
  const inputTensor = preprocessImage(imageElement);
  const startTime = performance.now();

  try {
    const outputTensor = model.predict(inputTensor);
    const probabilities = Array.from(await outputTensor.data());
    outputTensor.dispose();

    const executionTimeMs = Math.round(performance.now() - startTime);

    // Map probabilities to 38 PlantVillage labels by exact index
    const sortedPredictions = probabilities
      .map((probability, id) => {
        const meta = labels[id] || {};
        return {
          id,
          datasetLabel: meta.datasetLabel || `Class_${id}`,
          displayName: meta.displayName || `Class ${id}`,
          crop: meta.crop || 'Unknown Crop',
          condition: meta.condition || 'Unknown Condition',
          isHealthy: meta.isHealthy ?? false,
          probability,
          confidencePercent: (probability * 100).toFixed(1),
        };
      })
      .sort((a, b) => b.probability - a.probability);

    const topPredictions = sortedPredictions.slice(0, topK);
    const policy = metadata?.decisionPolicy || { minimumConfidence: 0.60, minimumMargin: 0.10 };
    const uncertainty = evaluateUncertainty(topPredictions, policy);

    return {
      topPredictions,
      top1: topPredictions[0],
      uncertainty,
      executionTimeMs,
      allProbabilities: probabilities,
    };
  } finally {
    inputTensor.dispose();
  }
}
