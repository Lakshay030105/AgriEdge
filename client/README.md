# AgriEdge Frontend Progressive Web App (PWA)

Offline-first client application powered by **React 18 + Vite**, executing on-device **TensorFlow.js** inference and **Dexie.js** IndexedDB persistence.

## Key Modules
- `src/components/`:
  - `CameraViewfinder.jsx`: Guided viewfinder bounding box for capturing leaf photos.
  - `GradCamOverlay.jsx`: Real-time WebGL canvas overlay displaying diagnostic heatmaps.
  - `TreatmentCard.jsx`: Multi-tier Integrated Pest Management (IPM) advisory card.
  - `OutbreakStatus.jsx`: Local sync queue status and offline indicator.
- `src/db/`: Dexie.js database schema and pre-populated 38-class treatment knowledge base.
- `src/ml/`: TensorFlow.js model loader, WebGL shader execution, and Grad-CAM back-propagation logic.
- `src/utils/`: HTML5 Canvas tensor shaping ($224 \times 224 \times 3$) and normalization helpers.

## Scripts
```bash
npm install     # Install dependencies
npm run dev     # Start local Vite development server
npm run build   # Build production PWA bundle with service workers
```
