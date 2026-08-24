# AgriEdge Frontend Integration Guide

## 1. Place the release files

Extract the approved release package and copy its contents into:

```text
client/public/models/agrieedge-v2/
```

The browser-visible files should be directly inside that directory, not inside another nested `agrieedge-v2` folder.

```text
client/public/models/agrieedge-v2/
├── model.json
├── group1-shard1of5.bin
├── group1-shard2of5.bin
├── group1-shard3of5.bin
├── group1-shard4of5.bin
├── group1-shard5of5.bin
├── labels.json
├── metadata.json
├── integration_contract.json
├── artifact_manifest.json
└── parity_report.json
```

Use the filenames referenced by `model.json` if the generated shard names differ. Do not rename individual shards.

## 2. Install the matching browser runtime

The release was validated with TensorFlow.js 4.22.0.

```bash
npm install @tensorflow/tfjs@4.22.0
```

If the project explicitly uses the WASM fallback, also install and configure `@tensorflow/tfjs-backend-wasm`.

## 3. Load the model and metadata

Files placed in a Vite or React `public` directory are requested from the site root.

```ts
import * as tf from '@tensorflow/tfjs';

const MODEL_ROOT = '/models/agrieedge-v2';

export async function loadAgriEdgeModel() {
  try {
    await tf.setBackend('webgl');
  } catch {
    await tf.setBackend('cpu');
  }
  await tf.ready();

  const [model, labels, metadata, contract] = await Promise.all([
    tf.loadLayersModel(`${MODEL_ROOT}/model.json`),
    fetch(`${MODEL_ROOT}/labels.json`).then((r) => r.json()),
    fetch(`${MODEL_ROOT}/metadata.json`).then((r) => r.json()),
    fetch(`${MODEL_ROOT}/integration_contract.json`).then((r) => r.json()),
  ]);

  const inputShape = model.inputs[0].shape;
  const outputShape = model.outputs[0].shape;

  if (JSON.stringify(inputShape) !== JSON.stringify([null, 224, 224, 3])) {
    throw new Error(`Unexpected AgriEdge input shape: ${inputShape}`);
  }
  if (JSON.stringify(outputShape) !== JSON.stringify([null, 38])) {
    throw new Error(`Unexpected AgriEdge output shape: ${outputShape}`);
  }

  return { model, labels, metadata, contract };
}
```

## 4. Preprocess an image correctly

The model contains its own MobileNetV2 normalization. Send RGB pixel values in the `0–255` range. Do not divide by 255 and do not apply `x / 127.5 - 1` in the frontend.

```ts
function makeInput(image: HTMLImageElement | HTMLCanvasElement) {
  return tf.tidy(() =>
    tf.browser
      .fromPixels(image, 3)
      .resizeBilinear([224, 224], true)
      .toFloat()
      .expandDims(0)
  );
}
```

Before inference, correct the phone-camera orientation and use a center crop or crop-to-fill transformation. Avoid stretching a portrait image directly into a square.

## 5. Run inference and return Top-3

```ts
type Prediction = {
  id: number;
  probability: number;
  label: unknown;
};

export async function predictLeaf(
  model: tf.LayersModel,
  labels: unknown[],
  image: HTMLImageElement | HTMLCanvasElement
): Promise<Prediction[]> {
  const input = makeInput(image);

  try {
    const output = model.predict(input) as tf.Tensor;
    const probabilities = Array.from(await output.data());
    output.dispose();

    return probabilities
      .map((probability, id) => ({ id, probability, label: labels[id] }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 3);
  } finally {
    input.dispose();
  }
}
```

The numeric output index must map to the same numeric ID in `labels.json`. Do not alphabetically sort the labels in frontend code.

## 6. Apply the uncertainty policy

```ts
export function classifyDecision(top3: Prediction[]) {
  const confidence = top3[0]?.probability ?? 0;
  const margin = confidence - (top3[1]?.probability ?? 0);
  const accepted = confidence >= 0.60 && margin >= 0.10;

  return { accepted, confidence, margin };
}
```

When `accepted` is false, show guidance such as:

> Result uncertain. Retake one clear photo of a single leaf in natural light, keep the leaf centered, and avoid blur or strong shadows.

Still display the Top-3 as possibilities, but do not present the Top-1 result as confirmed.

## 7. UI and product safeguards

- Show model-loading progress; the release is approximately 9.36 MB.
- Disable the Analyze button until `tf.ready()` and model loading finish.
- Reject empty, unreadable, or extremely small images before inference.
- Show the crop and disease label separately when those fields are available in `labels.json`.
- Keep all agronomic treatment text outside the model and review it with a domain expert.
- Store no farmer image unless the user explicitly agrees.
- Make offline status visible and cache the release files with the application's service worker.

## 8. Integration smoke test

Before merging the frontend:

1. Open `/models/agrieedge-v2/model.json` in the browser and confirm HTTP 200.
2. Check that all five shard requests return HTTP 200.
3. Confirm the model shapes are `[null,224,224,3]` and `[null,38]`.
4. Run one image and confirm exactly 38 finite probabilities are returned.
5. Confirm their sum is approximately 1.0.
6. Verify Top-3 labels use the original label IDs.
7. Test the uncertain state with a blurry or unrelated image.
8. Reload without a network connection and confirm the cached model still loads.

## 9. Common integration mistakes

- Copying a parent folder and creating `models/agrieedge-v2/agrieedge-v2/model.json`.
- Deploying the rejected UINT8 artifact instead of the approved Float32 release.
- Dividing pixels by 255 even though normalization is embedded.
- Omitting one `.bin` shard.
- Renaming shards without updating `model.json`.
- Sorting labels alphabetically.
- Treating softmax confidence as a guaranteed diagnosis.

