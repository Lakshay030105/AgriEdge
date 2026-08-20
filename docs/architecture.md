# AgriEdge Architecture & Technical Specification Document

## 1. System Overview
AgriEdge is an offline-first Edge AI Progressive Web App (PWA) designed for smallholder farmers to diagnose crop diseases, calculate exact infection severity percentages, listen to treatments in regional languages, and silently synchronize outbreak telemetry to an NGO Command Center upon network restoration.

### Core Architectural Pillars
- **Zero-Cloud Edge AI:** 100% on-device TensorFlow.js WebGL/WASM MobileNetV2 INT8 inference (<150ms latency).
- **Level 1: AI Disease Severity Grading:** Secondary computer vision pipeline (OpenCV.js / Canvas) isolating leaf boundaries and necrotic lesions to calculate exact infected surface area percentage.
- **Level 2: NGO & Government Command Center:** React + Leaflet.js / Mapbox GL live India outbreak heatmap and Node.js/Express deferred sync REST ingestion.
- **Level 3: Accessibility Voice-Driven UI:** Hands-free Web Speech API integration (SpeechRecognition + SpeechSynthesis) supporting English and Hindi (हिंदी).
- **Offline Action Engine:** IndexedDB + Dexie.js 38-class Integrated Pest Management (IPM) repository with dynamic severity-based tiers (Tier 1 <10%, Tier 2 10-30%, Tier 3 >30%).

---

## 2. Component Architecture & Directory Layout

### `client/` (Frontend PWA & NGO Dashboard)
- Progressive Web App built with React 18 and Vite.
- In-browser model execution (`@tensorflow/tfjs`) with WebGL shaders & WASM fallback.
- **Level 1 Severity Engine:** Edge-based HSV color thresholding, contour detection, and pixel ratio math.
- **Level 2 Command Center:** Interactive Leaflet.js map with cluster markers, severity rings, and real-time telemetry feed.
- **Level 3 Voice Assistant:** Web Speech API STT/TTS engine with solar-optimized pulsing mic trigger.
- **Offline Storage & Sync:** Dexie.js (IndexedDB) with automatic batch upload upon network reconnection.

### `server/` (Deferred Sync Backend)
- Node.js + Express REST API.
- GeoJSON schema for anonymized regional disease outbreak mapping.
- Endpoints:
  - `POST /api/telemetry/sync`: Ingests queued farmer diagnostic logs.
  - `GET /api/telemetry/outbreaks`: Returns GeoJSON clusters for the NGO map.
  - `GET /api/telemetry/stats`: Global summary metrics and high-risk districts.
  - `POST /api/alerts/dispatch`: Emergency relief and advisory broadcast trigger.

### `ml/` (Machine Learning & Quantization)
- Transfer learning pipeline for MobileNetV2 on PlantVillage dataset (38 classes).
- Class-weighted cross-entropy loss calculation for imbalanced categories.
- Post-training INT8 quantization converting float32 weights (~50MB) to INT8 (<10MB).
- Secondary computer vision segmentation algorithms for severity ratio grading.

---

## 3. Level 1: Computer Vision Severity Grading Pipeline

$$\text{Severity Percentage} = \left( \frac{\sum \text{Necrotic / Diseased Pixels}}{\sum \text{Total Leaf Foliage Pixels}} \right) \times 100$$

### Algorithmic Workflow:
1. **Background Segmentation:** Converts RGB image to HSV color space. Identifies non-background pixels by filtering out neutral dark/light background regions.
2. **Foliage vs. Lesion Classification:**
   - **Healthy Green:** Hue in range $[65^\circ, 170^\circ]$ with healthy saturation and value.
   - **Necrotic / Chlorotic Lesions:** Hue in range $[10^\circ, 60^\circ]$ (yellow halos, chlorosis), dark necrotic rots ($V < 0.28$), and fungal sporulation haze.
3. **Severity Tier Assignment:**
   - **Tier 1 (Mild <10%):** Localized pruning, cold-pressed Neem oil spray, cultural adjustments.
   - **Tier 2 (Moderate 10–30%):** Targeted bio-fungicides (*Trichoderma viride*), bio-copper formulations.
   - **Tier 3 (Severe >30%):** Emergency systemic chemical intervention (Azoxystrobin, Mancozeb), isolation protocols.

---

## 4. Level 2: NGO & Government Outbreak Command Center

- **Eventual Consistency Model:** When a farmer's device reconnects to Wi-Fi or cellular networks, the Background Sync API silently serializes all pending IndexedDB diagnostic logs and dispatches an HTTP POST request to `/api/telemetry/sync`.
- **Outbreak GeoJSON Schema:**
  - `farmerId`: Anonymized identifier (`FARM-PB-8841`)
  - `coordinates`: `{ lat: Float, lng: Float }`
  - `diseaseClass` & `diseaseName`: e.g. `Potato___Early_Blight`
  - `severityScore`: e.g. `28.4%`
  - `severityTier`: e.g. `Tier 2: Moderate`
  - `timestamp`: ISO 8601 UTC string
  - `status`: `Critical Outbreak` | `Active Alert` | `Monitored`
- **Visualization:** Interactive Leaflet.js layer rendering red/amber/green pulsing rings based on disease severity.

---

## 5. Level 3: Voice-Driven Accessibility UI

- **Speech-to-Text (STT):** `SpeechRecognition` listening for commands:
  - *"Take Photo"* / *"Scan"* / *"फोटो खींचो"* $\rightarrow$ triggers camera capture.
  - *"Read Advice"* / *"इलाज बताओ"* $\rightarrow$ reads out multi-tier treatment.
  - *"Switch to Hindi"* / *"Switch to English"* $\rightarrow$ language toggle.
- **Text-to-Speech (TTS):** `SpeechSynthesisUtterance` reading out the crop diagnosis, severity score, and specific tier remedies in regional Hindi (`hi-IN`) and English (`en-IN`).
- **Solar-Optimized UI:** High-contrast pulsing microphone button designed for visibility under direct sunlight in agrarian fields.

---

## 6. Supported Crops & Classes (PlantVillage 38 Categories)

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
