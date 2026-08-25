import { useEffect, useRef, useState } from 'react';
import { loadAgriEdgeModel, predictLeaf } from '../ml/classifier';
import { db } from '../db/db';

export default function Scanner() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [modelReady, setModelReady] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [treatment, setTreatment] = useState(null);

  // 1. Load the AI Model and Labels on Mount
  useEffect(() => {
    let isMounted = true;
    async function initModel() {
      try {
        setLoadingError(null);
        await loadAgriEdgeModel();
        if (isMounted) {
          setModelReady(true);
          console.log("AgriEdge MobileNetV2 model loaded and ready.");
        }
      } catch (error) {
        console.error("Failed to load AI model:", error);
        if (isMounted) {
          setLoadingError(error.message || "Failed to load AI model");
        }
      }
    }
    initModel();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Initialize Camera
  useEffect(() => {
    let stream = null;
    async function startCamera() {
      try {
        setCameraError(null);
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            setIsCameraReady(true);
          };
        }
      } catch (err) {
        console.warn("Camera access not available or denied:", err);
        setCameraError("Camera unavailable. You can upload an image below.");
        setIsCameraReady(false);
      }
    }
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // 3. Process Prediction and Fetch Treatment
  const handleInference = async (sourceElement) => {
    if (!modelReady || isAnalyzing) return;
    setIsAnalyzing(true);
    setPredictionResult(null);
    setTreatment(null);

    try {
      const result = await predictLeaf(sourceElement, 3);
      setPredictionResult(result);

      if (result?.top1?.datasetLabel) {
        try {
          const treatmentData = await db.treatments.get(result.top1.datasetLabel);
          if (treatmentData) {
            setTreatment(treatmentData);
          }
        } catch (dbErr) {
          console.warn("Error looking up treatment in DB:", dbErr);
        }
      }
    } catch (err) {
      console.error("Inference failed:", err);
      alert("Analysis failed: " + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 4. Capture from Camera
  const handleCaptureCamera = async () => {
    if (!videoRef.current || !modelReady) return;
    handleInference(videoRef.current);
  };

  // 5. Handle File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setSelectedImage(event.target.result);
        handleInference(img);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="screen-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#e5f5e8' }}>🌿 Diagnostic Scanner</h2>
        <span style={{
          fontSize: '11px',
          padding: '4px 8px',
          borderRadius: '9999px',
          backgroundColor: modelReady ? 'rgba(74, 222, 128, 0.2)' : 'rgba(251, 191, 36, 0.2)',
          color: modelReady ? '#4ade80' : '#fbbf24',
          border: `1px solid ${modelReady ? '#4ade80' : '#fbbf24'}`
        }}>
          {modelReady ? '● AI Engine Ready' : '⏳ Warming up AI...'}
        </span>
      </div>

      {loadingError && (
        <div style={{ padding: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444', fontSize: '13px', marginBottom: '12px' }}>
          ⚠️ {loadingError}
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {selectedImage ? (
          <img
            src={selectedImage}
            alt="Uploaded leaf preview"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
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
          <div style={{ padding: '20px', color: '#8fa394', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', marginBottom: '8px' }}>📷 Camera not active</p>
            <p style={{ fontSize: '12px', opacity: 0.8 }}>Use image upload below to scan leaf samples</p>
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
              width: '40px',
              height: '40px',
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

      {/* Action Controls */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
        <button
          onClick={handleCaptureCamera}
          disabled={!isCameraReady || !modelReady || isAnalyzing}
          style={{
            flex: 1,
            padding: '14px',
            backgroundColor: (isCameraReady && modelReady && !isAnalyzing) ? '#4ade80' : '#2d3748',
            color: (isCameraReady && modelReady && !isAnalyzing) ? '#121816' : '#8fa394',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '15px',
            cursor: (isCameraReady && modelReady && !isAnalyzing) ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease'
          }}
        >
          {isAnalyzing ? 'Scanning...' : (modelReady ? '📸 Scan Live Camera' : 'Warming up AI...')}
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={!modelReady || isAnalyzing}
          style={{
            padding: '14px 18px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            color: '#e5f5e8',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '14px',
            cursor: (modelReady && !isAnalyzing) ? 'pointer' : 'not-allowed'
          }}
        >
          📁 Upload Image
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          style={{ display: 'none' }}
        />
      </div>

      {/* Diagnosis Results Display */}
      {predictionResult && predictionResult.top1 && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: 'rgba(74, 222, 128, 0.08)',
          borderRadius: '10px',
          border: '1px solid rgba(74, 222, 128, 0.3)',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: '700',
              color: predictionResult.top1.isHealthy ? '#4ade80' : '#f87171'
            }}>
              {predictionResult.top1.isHealthy ? '✅ Healthy Plant' : '⚠️ Disease Detected'}
            </span>
            <span style={{ fontSize: '12px', color: '#8fa394' }}>
              Latency: {predictionResult.executionTimeMs}ms
            </span>
          </div>

          <h3 style={{ color: '#ffffff', fontSize: '18px', margin: '6px 0 2px 0' }}>
            {predictionResult.top1.displayName}
          </h3>

          <p style={{ fontSize: '13px', color: '#4ade80', fontWeight: '600', marginBottom: '10px' }}>
            Confidence: {predictionResult.top1.confidencePercent}%
          </p>

          {/* Uncertainty Notice */}
          {!predictionResult.uncertainty?.isAccepted && (
            <div style={{
              padding: '10px',
              backgroundColor: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              borderRadius: '6px',
              color: '#fbbf24',
              fontSize: '12px',
              marginBottom: '12px'
            }}>
              ⚠️ {predictionResult.uncertainty?.guidance}
            </div>
          )}

          {/* Top 3 Predictions Breakdown */}
          {predictionResult.topPredictions?.length > 1 && (
            <div style={{ marginTop: '10px', paddingBottom: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <p style={{ fontSize: '12px', color: '#8fa394', marginBottom: '6px' }}>Top Predictions:</p>
              {predictionResult.topPredictions.map((pred) => (
                <div key={pred.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span>{pred.displayName}</span>
                  <span style={{ color: '#8fa394' }}>{pred.confidencePercent}%</span>
                </div>
              ))}
            </div>
          )}

          {/* Agronomic Treatment Actions */}
          {treatment && (
            <div style={{ marginTop: '12px' }}>
              <h4 style={{ fontSize: '14px', color: '#4ade80', marginBottom: '6px' }}>Recommended Actions:</h4>
              <div style={{ fontSize: '13px', color: '#d1fae5', marginBottom: '6px' }}>
                <strong>🌱 Organic / Cultural:</strong> {treatment.organicAction}
              </div>
              <div style={{ fontSize: '13px', color: '#fed7aa' }}>
                <strong>🧪 Chemical Control:</strong> {treatment.chemicalSpray}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}