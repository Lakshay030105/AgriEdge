import { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import { db } from '../db/db';

export default function Scanner() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [model, setModel] = useState(null);
  const [labels, setLabels] = useState([]);
  const [loadingError, setLoadingError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [treatment, setTreatment] = useState(null);

  // 1. Load Model & Labels (LayersModel format)
  useEffect(() => {
    let isMounted = true;
    async function loadModelAndLabels() {
      try {
        setLoadingError(null);
        await tf.ready();
        // Model was exported from Keras as a layers-model, not a graph-model
        const loadedModel = await tf.loadLayersModel('/models/agrieedge-v2/model.json');

        const response = await fetch('/models/agrieedge-v2/labels.json');
        if (!response.ok) throw new Error(`HTTP ${response.status} loading labels.json`);
        const loadedLabels = await response.json();

        if (isMounted) {
          setModel(loadedModel);
          setLabels(loadedLabels);
        }
      } catch (error) {
        console.error("Failed to load AI model:", error);
        if (isMounted) {
          setLoadingError(error.message || "Failed to load AI model");
        }
      }
    }
    loadModelAndLabels();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Initialize Camera with desktop-friendly constraints & auto-play
  const startCamera = async () => {
    try {
      setCameraError(null);
      setIsCameraReady(false);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError({
          type: 'NotSupported',
          title: 'Camera API Not Supported / Insecure Context',
          message: 'The Camera API is unavailable. Ensure you are accessing via http://localhost:5173 or HTTPS.'
        });
        return;
      }

      // Stop any existing stream
      if (videoRef.current && videoRef.current.srcObject) {
        const currentTracks = videoRef.current.srcObject.getTracks();
        currentTracks.forEach(track => track.stop());
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
        });
      } catch (firstErr) {
        if (firstErr.name === 'NotAllowedError' || firstErr.name === 'PermissionDeniedError') {
          throw firstErr;
        }
        // Fallback for laptops/desktops without rear camera
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      if (videoRef.current) {
        videoRef.current.muted = true;
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current.play();
            setIsCameraReady(true);
            setCameraError(null);
          } catch (playErr) {
            console.warn("Video play interrupted:", playErr);
          }
        };
      }
    } catch (err) {
      console.error("Camera access failed:", err);
      let title = "Camera Access Blocked / Unavailable";
      let message = "Unable to access the camera.";

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        title = "Permission Denied in Browser";
        message = "Camera access was denied. Click the lock/camera icon in your address bar (next to the URL), change Camera to 'Allow', and click 'Retry Camera' below.";
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        title = "No Camera Hardware Detected";
        message = "No webcam or camera was found on your computer. You can upload a photo of a leaf using 'Upload Image' below to test diagnosis.";
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        title = "Camera In Use By Another Application";
        message = "Your webcam is currently locked by another program (such as Zoom, Microsoft Teams, Discord, or the Windows Camera app). Close that program and click 'Retry Camera'.";
      } else if (err.name === 'OverconstrainedError') {
        title = "Resolution / Facing Mode Not Supported";
        message = "The requested camera resolution was not supported by your hardware.";
      }

      setCameraError({ type: err.name, title, message });
      setIsCameraReady(false);
    }
  };

  useEffect(() => {
    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  // 3. Process Prediction and Query Treatment Database
  const runInference = async (sourceElement) => {
    if (!sourceElement || !model || isAnalyzing) return;
    setIsAnalyzing(true);
    setPrediction(null);
    setTreatment(null);

    try {
      const { predictedClassIndex, confidenceScore } = tf.tidy(() => {
        // MobileNet expects 224x224x3 float32 in [0, 255] range (internal Rescaling layer normalizes)
        const tensor = tf.browser.fromPixels(sourceElement)
          .resizeBilinear([224, 224])
          .expandDims(0)
          .toFloat();
        
        const logits = model.predict(tensor);
        const probabilities = tf.softmax(logits);
        const maxConfidence = probabilities.max().dataSync()[0];
        const classIdx = logits.argMax(1).dataSync()[0];

        return {
          predictedClassIndex: classIdx,
          confidenceScore: (maxConfidence * 100).toFixed(1)
        };
      });

      // labels is an array of objects: { datasetLabel, displayName, crop, condition, isHealthy }
      const rawLabel = labels[predictedClassIndex];
      const classKey = typeof rawLabel === 'object' && rawLabel !== null
        ? rawLabel.datasetLabel
        : (rawLabel || `Class_${predictedClassIndex}`);

      const displayName = typeof rawLabel === 'object' && rawLabel?.displayName
        ? rawLabel.displayName
        : classKey.replace(/___/g, ' — ').replace(/_/g, ' ');

      const isHealthy = typeof rawLabel === 'object' && rawLabel?.isHealthy !== undefined
        ? rawLabel.isHealthy
        : classKey.toLowerCase().includes('healthy');

      setPrediction({
        label: displayName,
        classId: classKey,
        confidence: confidenceScore,
        isHealthy
      });

      // Query IndexedDB treatments
      let treatmentData = null;
      try {
        treatmentData = await db.treatments.get(classKey);
      } catch (dbErr) {
        console.warn("IndexedDB query error:", dbErr);
      }

      if (!treatmentData) {
        treatmentData = {
          classId: classKey,
          organicAction: isHealthy
            ? 'Crop appears healthy. Maintain regular monitoring and drip irrigation.'
            : 'Isolate infected foliage immediately and prevent leaf wetness.',
          chemicalSpray: isHealthy
            ? 'No chemical treatment required.'
            : 'Consult local agricultural extension center for targeted broad-spectrum control.'
        };
      }

      setTreatment(treatmentData);
    } catch (err) {
      console.error("Inference failed:", err);
      alert("Analysis failed: " + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCapture = () => {
    if (selectedImage) {
      const img = new Image();
      img.onload = () => runInference(img);
      img.src = selectedImage;
    } else if (videoRef.current) {
      runInference(videoRef.current);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target.result);
      const img = new Image();
      img.onload = () => runInference(img);
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleLoadSample = () => {
    const sampleUrl = '/sample-leaf.jpg';
    setSelectedImage(sampleUrl);
    const img = new Image();
    img.onload = () => runInference(img);
    img.src = sampleUrl;
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setPrediction(null);
    setTreatment(null);
    startCamera();
  };

  return (
    <div className="screen-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <h2>🌿 Diagnostic Scanner</h2>
        <span style={{
          fontSize: '11px',
          padding: '4px 8px',
          borderRadius: '9999px',
          backgroundColor: model ? 'rgba(74, 222, 128, 0.2)' : 'rgba(251, 191, 36, 0.2)',
          color: model ? '#4ade80' : '#fbbf24',
          border: `1px solid ${model ? '#4ade80' : '#fbbf24'}`
        }}>
          {model ? '● AI Engine Ready' : '⏳ Loading AI Engine...'}
        </span>
      </div>

      {loadingError && (
        <div style={{ padding: '8px 12px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '8px', color: '#f87171', fontSize: '13px', marginBottom: '12px' }}>
          ⚠️ {loadingError}
        </div>
      )}

      {cameraError && !selectedImage && (
        <div style={{
          padding: '12px 14px',
          backgroundColor: 'rgba(251, 191, 36, 0.1)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          borderRadius: '10px',
          color: '#fbbf24',
          fontSize: '13px',
          marginBottom: '12px',
          textAlign: 'left'
        }}>
          <div style={{ fontWeight: '700', marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>📷 {cameraError.title}</span>
            <button
              onClick={startCamera}
              style={{
                backgroundColor: '#fbbf24',
                color: '#121816',
                border: 'none',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              🔄 Retry Camera
            </button>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: '#e5f5e8', lineHeight: '1.4' }}>
            {cameraError.message}
          </p>
        </div>
      )}

      {/* Camera / Image Viewport */}
      <div style={{
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '2px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: '#0a0f0d',
        aspectRatio: '1/1',
        marginTop: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {selectedImage ? (
          <>
            <img
              src={selectedImage}
              alt="Uploaded leaf preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <button
              onClick={handleClearImage}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: 'rgba(0, 0, 0, 0.65)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                backdropFilter: 'blur(4px)'
              }}
            >
              ✕ Switch to Camera
            </button>
          </>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: isCameraReady ? 'block' : 'none',
              transform: 'scaleX(-1)'
            }}
          />
        )}

        {!isCameraReady && !selectedImage && (
          <div style={{ padding: '24px', color: '#8fa394', textAlign: 'center', maxWidth: '300px' }}>
            <p style={{ fontSize: '15px', fontWeight: '600', color: '#e5f5e8', marginBottom: '8px' }}>
              📷 Camera Not Active
            </p>
            <p style={{ fontSize: '12px', opacity: 0.85, marginBottom: '14px', lineHeight: '1.4' }}>
              Click <strong>Retry Camera</strong> after enabling permissions in your address bar, or test immediately with a sample leaf:
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                onClick={startCamera}
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                🔄 Retry Camera
              </button>
              <button
                onClick={handleLoadSample}
                disabled={!model || isAnalyzing}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#4ade80',
                  color: '#121816',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: (model && !isAnalyzing) ? 'pointer' : 'not-allowed'
                }}
              >
                🧪 Test Sample Leaf
              </button>
            </div>
          </div>
        )}

        {isAnalyzing && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(4px)'
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              border: '3px solid rgba(74, 222, 128, 0.2)',
              borderTopColor: '#4ade80',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ marginTop: '12px', color: '#4ade80', fontSize: '14px', fontWeight: 600 }}>
              Analyzing Leaf...
            </p>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
        <button
          onClick={handleCapture}
          disabled={(!isCameraReady && !selectedImage) || !model || isAnalyzing}
          style={{
            flex: 1,
            padding: '14px',
            backgroundColor: ((isCameraReady || selectedImage) && model && !isAnalyzing) ? '#4ade80' : '#2d3748',
            color: ((isCameraReady || selectedImage) && model && !isAnalyzing) ? '#121816' : '#8fa394',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '15px',
            cursor: ((isCameraReady || selectedImage) && model && !isAnalyzing) ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease'
          }}
        >
          {isAnalyzing ? 'Scanning...' : (model ? (selectedImage ? '🔍 Analyze Leaf' : '📸 Scan Leaf') : 'Warming up AI...')}
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={!model || isAnalyzing}
          style={{
            padding: '14px 18px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            color: '#e5f5e8',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '14px',
            cursor: (model && !isAnalyzing) ? 'pointer' : 'not-allowed'
          }}
        >
          📁 Upload Image
        </button>

        <button
          onClick={handleLoadSample}
          disabled={!model || isAnalyzing}
          title="Load test tomato bacterial spot leaf"
          style={{
            padding: '14px 16px',
            backgroundColor: 'rgba(74, 222, 128, 0.15)',
            color: '#4ade80',
            border: '1px solid rgba(74, 222, 128, 0.3)',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '14px',
            cursor: (model && !isAnalyzing) ? 'pointer' : 'not-allowed',
            whiteSpace: 'nowrap'
          }}
        >
          🧪 Sample
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          style={{ display: 'none' }}
        />
      </div>

      {/* Diagnosis & Treatment Results */}
      {prediction && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px',
            borderBottom: '1px solid rgba(74, 222, 128, 0.2)',
            paddingBottom: '8px'
          }}>
            <h3 style={{ color: prediction.isHealthy ? '#4ade80' : '#f87171', fontSize: '15px', margin: 0, textAlign: 'left' }}>
              {prediction.label}
            </h3>
            <span style={{
              backgroundColor: '#4ade80',
              color: '#121816',
              fontWeight: 'bold',
              fontSize: '12px',
              padding: '4px 8px',
              borderRadius: '12px',
              whiteSpace: 'nowrap'
            }}>
              {prediction.confidence}% Match
            </span>
          </div>

          {treatment && (
            <div style={{ textAlign: 'left', marginTop: '12px' }}>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontWeight: 'bold', color: '#fbbf24', display: 'block', marginBottom: '4px' }}>
                  🌱 Organic Action:
                </span>
                <span style={{ color: '#e5f5e8', fontSize: '14px', lineHeight: '1.4' }}>
                  {treatment.organicAction}
                </span>
              </div>
              <div>
                <span style={{ fontWeight: 'bold', color: '#f87171', display: 'block', marginBottom: '4px' }}>
                  🧪 Chemical Spray:
                </span>
                <span style={{ color: '#e5f5e8', fontSize: '14px', lineHeight: '1.4' }}>
                  {treatment.chemicalSpray}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}