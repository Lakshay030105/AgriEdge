# AgriEdge Architecture & Specification Document

## 1. System Overview
AgriEdge is an offline-first Edge AI Progressive Web App (PWA) designed for smallholder farmers to diagnose crop diseases directly on mobile devices without any cloud connectivity.

### Core Pillars
- **Zero-Cloud Inference:** 100% on-device TensorFlow.js WebGL/WASM compute.
- **Explainable AI (XAI):** Real-time Grad-CAM saliency heatmaps highlighting leaf lesions.
- **Action Engine:** IndexedDB + Dexie.js 38-class Integrated Pest Management (IPM) advisory repository.
- **Eventual Consistency:** Deferred cloud telemetry sync via Service Worker Background Sync API to MongoDB Atlas.

---

## 2. Directory Layout & Module Responsibilities

### `client/` (Frontend PWA)
- Progressive Web App built with React 18 and Vite.
- Offline caching using `vite-plugin-pwa` and Service Worker Cache API.
- HTML5 Canvas image preprocessor ($224 \times 224 \times 3$, normalization to $[-1, 1]$).
- In-browser model execution (`@tensorflow/tfjs`) with WebGL shaders & WASM fallback.
- Client-side data store with Dexie.js (IndexedDB).

### `server/` (Deferred Sync Backend)
- Node.js + Express REST API.
- GeoJSON schema for anonymized regional disease outbreak mapping.
- Receives queued telemetry when network connectivity is re-established.

### `ml/` (Machine Learning & Quantization)
- Transfer learning pipeline for MobileNetV2 on PlantVillage dataset (38 classes).
- Class-weighted cross-entropy loss calculation for imbalanced categories.
- Post-training INT8 quantization converting float32 weights (~50MB) to INT8 (<10MB).
- TF.js model shard generation.

---

## 3. Supported Crops & Classes (PlantVillage 38 Categories)
1. Apple — Apple Scab
2. Apple — Black Rot
3. Apple — Cedar Apple Rust
4. Apple — Healthy
5. Blueberry — Healthy
6. Cherry (including sour) — Powdery Mildew
7. Cherry (including sour) — Healthy
8. Corn (maize) — Cercospora Leaf Spot / Gray Leaf Spot
9. Corn (maize) — Common Rust
10. Corn (maize) — Northern Leaf Blight
11. Corn (maize) — Healthy
12. Grape — Black Rot
13. Grape — Esca (Black Measles)
14. Grape — Leaf Blight (Isariopsis Leaf Spot)
15. Grape — Healthy
16. Orange — Haunglongbing (Citrus Greening)
17. Peach — Bacterial Spot
18. Peach — Healthy
19. Pepper, bell — Bacterial Spot
20. Pepper, bell — Healthy
21. Potato — Early Blight
22. Potato — Late Blight
23. Potato — Healthy
24. Raspberry — Healthy
25. Soybean — Healthy
26. Squash — Powdery Mildew
27. Strawberry — Leaf Scorch
28. Strawberry — Healthy
29. Tomato — Bacterial Spot
30. Tomato — Early Blight
31. Tomato — Late Blight
32. Tomato — Leaf Mold
33. Tomato — Septoria Leaf Spot
34. Tomato — Spider Mites (Two-spotted spider mite)
35. Tomato — Target Spot
36. Tomato — Tomato Yellow Leaf Curl Virus
37. Tomato — Tomato Mosaic Virus
38. Tomato — Healthy
