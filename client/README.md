# AgriEdge Frontend Progressive Web App (PWA) & NGO Dashboard

Offline-first client application powered by **React 18 + Vite**, executing on-device **TensorFlow.js** inference, **OpenCV.js / Canvas** disease severity grading, **Web Speech API** voice control, and **Dexie.js** IndexedDB persistence.

## Key Modules & Feature Upgrades

### 🔬 Level 1: AI Upgrade — Disease Severity Grading (Lakshay)
- `src/ml/severityEngine.js`: Secondary edge computer vision pipeline isolating leaf foliage and necrotic lesions to calculate exact infected surface area percentage.
- `src/ml/classifier.js`: MobileNetV2 INT8 inference engine (<150ms WebGL) and Grad-CAM class activation heatmap generator.
- `src/components/SeverityAnalyzerCard.jsx`: Interactive severity breakdown with segmentation masks (Leaf Mask, Lesion Mask, Blended Overlay, Heatmap).

### 🛰️ Level 2: MERN Upgrade — The NGO Command Center (Sahil)
- `src/components/NgoDashboard.jsx`: Command center overview with real-time stats and regional vulnerability metrics.
- `src/components/OutbreakMap.jsx`: Interactive Leaflet.js India outbreak heatmap showing live clusters and severity alerts.
- `src/services/syncService.js`: Background sync manager silently uploading queued offline IndexedDB telemetry logs when reconnected.

### 🎙️ Level 3: Accessibility Upgrade — Voice-Driven UI
- `src/services/voiceAssistant.js`: Web Speech API (`SpeechRecognition` + `SpeechSynthesis`) supporting English and Hindi (हिंदी).
- `src/components/VoiceCommandButton.jsx`: Solar-optimized pulsing microphone button for hands-free scanning under bright rural sunlight.
- `src/components/DynamicTreatmentPlan.jsx`: 3-Tier IPM advisory card with dynamic severity routing and audio narration.

## Scripts
```bash
npm install     # Install dependencies
npm run dev     # Start local Vite development server
npm run build   # Build production PWA bundle with service workers
```
