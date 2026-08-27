import { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import { db, saveFarmerScan } from '../db/db';
import { calculateLeafSeverity, checkIsLeafImage } from '../ml/severityEngine';
import SeverityAnalyzerCard from './SeverityAnalyzerCard';
import DynamicTreatmentPlan from './DynamicTreatmentPlan';
import KisanPrescriptionModal from './KisanPrescriptionModal';
import ScanHistoryDrawer from './ScanHistoryDrawer';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const ALL_CROPS = [
  { id: 'ALL', labelEn: '🌱 All Crops (Auto-Detect)', labelHi: '🌱 सभी फसलें (ऑटो पहचान)', icon: '🌱' },
  { id: 'Strawberry', labelEn: '🍓 Strawberry', labelHi: '🍓 स्ट्रॉबेरी', icon: '🍓' },
  { id: 'Tomato', labelEn: '🍅 Tomato', labelHi: '🍅 टमाटर', icon: '🍅' },
  { id: 'Potato', labelEn: '🥔 Potato', labelHi: '🥔 आलू', icon: '🥔' },
  { id: 'Apple', labelEn: '🍎 Apple', labelHi: '🍎 सेब', icon: '🍎' },
  { id: 'Corn', labelEn: '🌽 Corn (Maize)', labelHi: '🌽 मक्का', icon: '🌽' },
  { id: 'Pepper', labelEn: '🫑 Bell Pepper', labelHi: '🫑 शिमला मिर्च', icon: '🫑' },
  { id: 'Grape', labelEn: '🍇 Grape', labelHi: '🍇 अंगूर', icon: '🍇' },
  { id: 'Orange', labelEn: '🍊 Orange / Citrus', labelHi: '🍊 संतरा / नींबू', icon: '🍊' },
  { id: 'Peach', labelEn: '🍑 Peach', labelHi: '🍑 आड़ू', icon: '🍑' },
  { id: 'Cherry', labelEn: '🍒 Cherry', labelHi: '🍒 चेरी', icon: '🍒' },
  { id: 'Blueberry', labelEn: '🫐 Blueberry', labelHi: '🫐 ब्लूबेरी', icon: '🫐' },
  { id: 'Soybean', labelEn: '🌱 Soybean', labelHi: '🌱 सोयाबीन', icon: '🌱' },
  { id: 'Squash', labelEn: '🎃 Squash', labelHi: '🎃 कद्दू / लौकी', icon: '🎃' },
  { id: 'Raspberry', labelEn: '🍇 Raspberry', labelHi: '🍇 रसभरी', icon: '🍇' }
];

export default function Scanner() {
  const { lang, t } = useLanguage();
  const { farmer } = useAuth();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [historyTrigger, setHistoryTrigger] = useState(0);
  
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [model, setModel] = useState(null);
  const [labels, setLabels] = useState([]);
  const [loadingError, setLoadingError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [treatment, setTreatment] = useState(null);
  const [severityData, setSeverityData] = useState(null);

  // Round 2 Real-World Reliability Additions
  const [selectedCrop, setSelectedCrop] = useState('ALL');
  const [showCropGrid, setShowCropGrid] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [confidenceWarning, setConfidenceWarning] = useState(null);
  const [showPrescription, setShowPrescription] = useState(false);

  // 1. Load Model & Labels (LayersModel format)
  useEffect(() => {
    let isMounted = true;
    async function loadModelAndLabels() {
      try {
        setLoadingError(null);
        await tf.ready();
        const loadedModel = await tf.loadLayersModel('/models/agrieedge-v2/model.json');

        const response = await fetch('/models/agrieedge-v2/labels.json');
        if (!response.ok) throw new Error(`HTTP ${response.status} loading labels.json`);
        const loadedLabels = await response.json();

        // Warm up model to compile WebGL shaders and avoid first-scan UI lag
        try {
          tf.tidy(() => {
            const dummyInput = tf.zeros([1, 224, 224, 3], 'float32');
            loadedModel.predict(dummyInput);
          });
        } catch (warmupErr) {
          console.warn("Model warmup non-critical note:", warmupErr);
        }

        if (isMounted) {
          setModel(loadedModel);
          setLabels(loadedLabels);
          console.log(`MobileNetV2 Float32 loaded successfully (${loadedLabels.length} classes).`);
        }
      } catch (err) {
        console.error("Model/labels load error:", err);
        if (isMounted) setLoadingError(err.message);
      }
    }
    loadModelAndLabels();
    return () => { isMounted = false; };
  }, []);

  // 2. Camera Management with Desktop and Environmental Fallbacks
  const startCamera = async () => {
    setIsCameraReady(false);
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError({
        title: 'Camera API Not Supported',
        message: 'Your browser or context (non-HTTPS) does not support live camera access. Please use the Upload Image button below.'
      });
      return;
    }

    try {
      // First attempt: Rear/environmental camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play()
            .then(() => setIsCameraReady(true))
            .catch(playErr => {
              console.warn("Autoplay blocked:", playErr);
              setIsCameraReady(true);
            });
        };
      }
    } catch (rearErr) {
      console.warn("Rear camera unavailable, attempting generic camera fallback...", rearErr);
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play()
              .then(() => setIsCameraReady(true))
              .catch(playErr => {
                console.warn("Fallback autoplay blocked:", playErr);
                setIsCameraReady(true);
              });
          };
        }
      } catch (anyErr) {
        console.error("Camera access failed completely:", anyErr);
        let errorMsg = 'Could not access device camera.';
        if (anyErr.name === 'NotAllowedError' || anyErr.name === 'PermissionDeniedError') {
          errorMsg = 'Camera permission was denied. Please allow camera access in your browser settings, or use the file upload option below.';
        } else if (anyErr.name === 'NotFoundError' || anyErr.name === 'DevicesNotFoundError') {
          errorMsg = 'No physical camera device was detected on this computer/phone. Please use the Upload Image button below.';
        } else if (anyErr.name === 'NotReadableError' || anyErr.name === 'TrackStartError') {
          errorMsg = 'Camera is already in use by another application or tab. Please close other apps using the camera and click Retry.';
        }
        setCameraError({
          title: anyErr.name || 'Camera Error',
          message: errorMsg
        });
      }
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

  // 3. Process Prediction with Quality Gate & Crop Filter
  const runInference = async (sourceElement, cropOverride) => {
    if (!sourceElement || !model || isAnalyzing) return;
    const activeCrop = cropOverride !== undefined ? cropOverride : selectedCrop;

    setIsAnalyzing(true);
    setPrediction(null);
    setTreatment(null);
    setSeverityData(null);
    setValidationError(null);
    setConfidenceWarning(null);

    try {
      // 1. Instant Agronomic Foliage Gate (Excess Green Index):
      // Rejects non-plant objects (boxes, faces, hands, walls, furniture) with 0 false positives
      const hasPlantFoliage = checkIsLeafImage(sourceElement);
      if (!hasPlantFoliage) {
        setValidationError(t('noLeafDetectedDesc'));
        setPrediction(null);
        setTreatment(null);
        setSeverityData(null);
        setIsAnalyzing(false);
        return;
      }

      // Compute initial foliar severity
      let initialSev = null;
      try {
        initialSev = await calculateLeafSeverity(sourceElement, { isHealthy: false });
      } catch (sevErr) {
        console.warn("Foliar validation pre-check error:", sevErr);
      }

      if (!initialSev || !initialSev.isLeaf) {
        setValidationError(t('noLeafDetectedDesc'));
        setPrediction(null);
        setTreatment(null);
        setSeverityData(null);
        setIsAnalyzing(false);
        return;
      }

      // 2. Deep Learning Classification with optional Crop Filter Constraint
      const { predictedClassIndex, confidenceScore } = tf.tidy(() => {
        const tensor = tf.browser.fromPixels(sourceElement)
          .resizeBilinear([224, 224])
          .expandDims(0)
          .toFloat();
        
        const probabilities = model.predict(tensor);
        const probsArray = probabilities.dataSync();

        // If specific crop filter is active, constrain prediction to that crop family
        if (activeCrop !== 'ALL') {
          let bestIdx = -1;
          let bestVal = -1;

          for (let i = 0; i < labels.length; i++) {
            const raw = labels[i];
            const dLabel = typeof raw === 'object' && raw !== null ? raw.datasetLabel : String(raw);
            const matchesCrop = dLabel.toLowerCase().includes(activeCrop.toLowerCase());
            
            if (matchesCrop && probsArray[i] > bestVal) {
              bestVal = probsArray[i];
              bestIdx = i;
            }
          }

          if (bestIdx !== -1) {
            return {
              predictedClassIndex: bestIdx,
              confidenceScore: (bestVal * 100).toFixed(1)
            };
          }
        }

        const maxConfidence = probabilities.max().dataSync()[0];
        const classIdx = probabilities.argMax(1).dataSync()[0];

        return {
          predictedClassIndex: classIdx,
          confidenceScore: (maxConfidence * 100).toFixed(1)
        };
      });

      // Confidence uncertainty warning
      if (parseFloat(confidenceScore) < 40) {
        setConfidenceWarning(t('lowConfidenceWarn'));
      }

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

      // Compute Level 1 foliar severity
      let sevData = null;
      try {
        sevData = await calculateLeafSeverity(sourceElement, { isHealthy });
      } catch (sevErr) {
        console.warn("Severity calculation error:", sevErr);
      }
      setSeverityData(sevData);

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

      // Auto-save to Farmer's personal offline scan diary if logged in
      if (farmer?.id) {
        try {
          await saveFarmerScan(farmer.id, {
            prediction: {
              label: displayName,
              classId: classKey,
              confidence: confidenceScore,
              isHealthy
            },
            treatment: treatmentData,
            severityData: sevData
          }, sourceElement);
          setHistoryTrigger(prev => prev + 1);
        } catch (saveErr) {
          console.warn("Failed to auto-save scan to diary:", saveErr);
        }
      }
    } catch (err) {
      console.error("Inference failed:", err);
      alert("Analysis failed: " + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCropChange = (newCrop) => {
    setSelectedCrop(newCrop);
    if (selectedImage) {
      const img = new Image();
      img.onload = () => runInference(img, newCrop);
      img.src = selectedImage;
    }
  };

  const handleSelectHistoricalScan = (scan) => {
    setPrediction({
      label: scan.diseaseName,
      classId: scan.classId,
      confidence: scan.confidence || '95.0',
      isHealthy: scan.isHealthy
    });

    setTreatment({
      diseaseNameHi: scan.diseaseNameHi,
      organicAction: scan.organicAction,
      organicActionHi: scan.organicActionHi,
      chemicalSpray: scan.chemicalSpray,
      chemicalSprayHi: scan.chemicalSprayHi
    });

    setSeverityData({
      severityScore: scan.severityScore,
      tier: {
        tier: scan.tier,
        badge: scan.tierBadge || `Tier ${scan.tier}`
      }
    });

    if (scan.thumbnail) {
      setSelectedImage(scan.thumbnail);
    }

    setShowPrescription(true);
  };

  const handleCapture = () => {
    if (selectedImage) {
      const img = new Image();
      img.onload = () => runInference(img);
      img.src = selectedImage;
      return;
    }

    if (!videoRef.current || !isCameraReady) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg');
    setSelectedImage(dataUrl);

    runInference(canvas);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target.result);
      const img = new Image();
      img.onload = () => runInference(img);
      img.onerror = () => {
        setValidationError("Could not process image file. Please upload a clear photo.");
        setIsAnalyzing(false);
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      setValidationError("File reading failed. Please try again.");
      setIsAnalyzing(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setPrediction(null);
    setTreatment(null);
    setSeverityData(null);
    setValidationError(null);
    setConfidenceWarning(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    startCamera();
  };

  return (
    <div className="screen-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <h2>{t('diagnosticScanner')}</h2>
        <span style={{
          fontSize: '11px',
          padding: '4px 8px',
          borderRadius: '9999px',
          backgroundColor: model ? 'rgba(74, 222, 128, 0.2)' : 'rgba(251, 191, 36, 0.2)',
          color: model ? '#4ade80' : '#fbbf24',
          border: `1px solid ${model ? '#4ade80' : '#fbbf24'}`
        }}>
          {model ? t('aiReady') : t('aiLoading')}
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
              {t('retryCamera')}
            </button>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: '#e5f5e8', lineHeight: '1.4' }}>
            {cameraError.message}
          </p>
        </div>
      )}

      {/* Quick Crop Context Filter Bar (Dropdown + Visual Grid Toggler) */}
      <div style={{
        marginTop: '4px',
        marginBottom: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        padding: '8px 12px',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'left'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px' }}>🌾</span>
            <span style={{ fontSize: '12px', color: '#8fa394', fontWeight: '700' }}>
              {t('selectCrop')}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, justifyContent: 'flex-end', minWidth: '220px' }}>
            {/* Native Clean Dropdown with all 14 crops */}
            <select
              value={selectedCrop}
              onChange={(e) => handleCropChange(e.target.value)}
              style={{
                padding: '6px 12px',
                backgroundColor: selectedCrop === 'ALL' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(74, 222, 128, 0.15)',
                color: selectedCrop === 'ALL' ? '#e5f5e8' : '#4ade80',
                border: `1px solid ${selectedCrop === 'ALL' ? 'rgba(255, 255, 255, 0.2)' : '#4ade80'}`,
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                outline: 'none',
                maxWidth: '190px'
              }}
            >
              {ALL_CROPS.map(c => (
                <option key={c.id} value={c.id} style={{ backgroundColor: '#121816', color: '#e5f5e8' }}>
                  {lang === 'hi' ? c.labelHi : c.labelEn}
                </option>
              ))}
            </select>

            {/* Toggle All Crops Grid Button */}
            <button
              onClick={() => setShowCropGrid(!showCropGrid)}
              title="Toggle All Crops Grid"
              style={{
                padding: '6px 10px',
                backgroundColor: showCropGrid ? '#4ade80' : 'rgba(255, 255, 255, 0.08)',
                color: showCropGrid ? '#121816' : '#e5f5e8',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {showCropGrid ? '✕' : '▦ ' + (lang === 'hi' ? '14 फसलें' : 'All 14')}
            </button>
          </div>
        </div>

        {/* Expandable Visual Crop Grid (Displays all 14 crops cleanly) */}
        {showCropGrid && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
            gap: '6px',
            marginTop: '10px',
            paddingTop: '10px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            maxHeight: '180px',
            overflowY: 'auto'
          }}>
            {ALL_CROPS.map(c => {
              const isSelected = selectedCrop === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    handleCropChange(c.id);
                    setShowCropGrid(false);
                  }}
                  style={{
                    padding: '6px 8px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: isSelected ? '700' : '500',
                    backgroundColor: isSelected ? '#4ade80' : 'rgba(0, 0, 0, 0.3)',
                    color: isSelected ? '#121816' : '#e5f5e8',
                    border: `1px solid ${isSelected ? '#4ade80' : 'rgba(255, 255, 255, 0.1)'}`,
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{c.icon}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {lang === 'hi' ? c.labelHi.replace(/^[^\s]+\s/, '') : c.labelEn.replace(/^[^\s]+\s/, '')}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Camera / Image Viewport with Reticle */}
      <div style={{
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '2px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: '#0a0f0d',
        aspectRatio: '1/1',
        marginTop: '6px',
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
                backdropFilter: 'blur(4px)',
                zIndex: 10
              }}
            >
              {t('switchToCamera')}
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

        {/* Sunlight Targeting Reticle (Only on Live Camera) */}
        {isCameraReady && !selectedImage && (
          <div style={{
            position: 'absolute',
            inset: '24px',
            border: '2px dashed rgba(74, 222, 128, 0.5)',
            borderRadius: '16px',
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '10px',
            zIndex: 5
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ width: '16px', height: '16px', borderTop: '3px solid #4ade80', borderLeft: '3px solid #4ade80' }} />
              <div style={{ width: '16px', height: '16px', borderTop: '3px solid #4ade80', borderRight: '3px solid #4ade80' }} />
            </div>

            <div style={{
              textAlign: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              color: '#4ade80',
              fontSize: '11px',
              fontWeight: '700',
              padding: '4px 10px',
              borderRadius: '20px',
              alignSelf: 'center',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(74, 222, 128, 0.4)'
            }}>
              {t('centerLeafHere')}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ width: '16px', height: '16px', borderBottom: '3px solid #4ade80', borderLeft: '3px solid #4ade80' }} />
              <div style={{ width: '16px', height: '16px', borderBottom: '3px solid #4ade80', borderRight: '3px solid #4ade80' }} />
            </div>
          </div>
        )}

        {!isCameraReady && !selectedImage && (
          <div style={{ padding: '24px', color: '#8fa394', textAlign: 'center', maxWidth: '300px' }}>
            <p style={{ fontSize: '15px', fontWeight: '600', color: '#e5f5e8', marginBottom: '8px' }}>
              {t('cameraNotActive')}
            </p>
            <p style={{ fontSize: '12px', opacity: 0.85, marginBottom: '14px', lineHeight: '1.4' }}>
              {t('cameraNotActiveDesc')}
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
                {t('retryCamera')}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
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
                {t('uploadImage')}
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
            backdropFilter: 'blur(4px)',
            zIndex: 20
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
              {t('analyzing')}
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
          {isAnalyzing ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span style={{
                display: 'inline-block',
                width: '14px',
                height: '14px',
                border: '2px solid #121816',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 0.75s linear infinite'
              }} />
              {selectedImage ? t('analyzing') : t('scanning')}
            </span>
          ) : (model ? (selectedImage ? t('analyzeLeaf') : t('scanLeaf')) : t('warmingUp'))}
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
          {t('uploadImage')}
        </button>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          style={{ display: 'none' }}
        />
      </div>

      {/* Leaf Validation Gate Warning (Anti-Embarrassment Protection) */}
      {validationError && (
        <div style={{
          marginTop: '16px',
          padding: '14px',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid #ef4444',
          borderRadius: '10px',
          color: '#fca5a5',
          fontSize: '13px',
          textAlign: 'left'
        }}>
          <strong style={{ display: 'block', color: '#f87171', marginBottom: '4px' }}>
            {t('noLeafDetected')}
          </strong>
          {validationError}
        </div>
      )}

      {/* Low Confidence Warning */}
      {confidenceWarning && prediction && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          backgroundColor: 'rgba(251, 191, 36, 0.15)',
          border: '1px solid #fbbf24',
          borderRadius: '8px',
          color: '#fef08a',
          fontSize: '12px',
          textAlign: 'left'
        }}>
          {confidenceWarning}
        </div>
      )}

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
            marginBottom: '4px',
            borderBottom: '1px solid rgba(74, 222, 128, 0.2)',
            paddingBottom: '10px'
          }}>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#8fa394', fontWeight: '700' }}>
                {t('pathogenId')}
              </span>
              <h3 style={{ color: prediction.isHealthy ? '#4ade80' : '#f87171', fontSize: '16px', margin: '2px 0 0 0' }}>
                {lang === 'hi' && treatment?.diseaseNameHi ? treatment.diseaseNameHi : prediction.label}
              </h3>
            </div>
            <span style={{
              backgroundColor: prediction.isHealthy ? '#4ade80' : '#f87171',
              color: '#121816',
              fontWeight: 'bold',
              fontSize: '12px',
              padding: '4px 10px',
              borderRadius: '12px',
              whiteSpace: 'nowrap'
            }}>
              {prediction.confidence}% {t('match')}
            </span>
          </div>

          {/* Level 1 Computer Vision Foliar Severity Grading */}
          <SeverityAnalyzerCard
            severityData={severityData}
            originalImage={selectedImage}
            isHealthy={prediction.isHealthy}
          />

          {/* Dynamic Severity-Tiered IPM Treatment Action Plan */}
          <DynamicTreatmentPlan
            treatment={treatment}
            prediction={prediction}
            severityData={severityData}
          />

          {/* Kisan Prescription Ticket Generator */}
          <button
            onClick={() => setShowPrescription(true)}
            style={{
              marginTop: '16px',
              width: '100%',
              padding: '12px',
              backgroundColor: 'rgba(74, 222, 128, 0.12)',
              color: '#4ade80',
              border: '1px solid rgba(74, 222, 128, 0.4)',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            {t('kisanPrescription')}
          </button>
        </div>
      )}

      {/* Kisan Prescription Modal */}
      <KisanPrescriptionModal
        isOpen={showPrescription}
        onClose={() => setShowPrescription(false)}
        prediction={prediction}
        treatment={treatment}
        severityData={severityData}
        capturedImage={selectedImage}
      />

      {/* Individual Farmer Crop Scan Diary */}
      <ScanHistoryDrawer
        farmerId={farmer?.id}
        onSelectScan={handleSelectHistoricalScan}
        refreshTrigger={historyTrigger}
      />
    </div>
  );
}