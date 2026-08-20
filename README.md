<div align="center">

# 🌿 AgriEdge: Offline-First Crop Health Intelligence
### Edge AI Diagnostics, Disease Severity Grading & Real-Time NGO Command Center
**Zero-Cloud Edge Crop Diagnostics for Smallholder Farmers**

[![Hackathon](https://img.shields.io/badge/OMNIKON-National%20Hackathon%202026-6366F1?style=for-the-badge&logo=target&logoColor=white)](https://github.com/Sahil-web01/AgriEdge)
[![Track](https://img.shields.io/badge/Track-Software%20%7C%20AgriTech%20%26%20FoodTech-10B981?style=for-the-badge&logo=leaf&logoColor=white)](https://github.com/Sahil-web01/AgriEdge)
[![Inference](https://img.shields.io/badge/Inference-100%25%20Offline%20(Zero--Cloud)-059669?style=for-the-badge&logo=speedtest&logoColor=white)](https://github.com/Sahil-web01/AgriEdge)
[![Severity Engine](https://img.shields.io/badge/Severity%20Grading-OpenCV.js%20%2B%20CV%20Segmentation-F59E0B?style=for-the-badge&logo=opencv&logoColor=white)](https://github.com/Sahil-web01/AgriEdge)
[![Voice UI](https://img.shields.io/badge/Voice%20UI-Web%20Speech%20API%20(Hindi%2FEnglish)-8B5CF6?style=for-the-badge&logo=soundcharts&logoColor=white)](https://github.com/Sahil-web01/AgriEdge)
[![Command Center](https://img.shields.io/badge/Command%20Center-Leaflet%20%2F%20Mapbox%20Heatmap-3B82F6?style=for-the-badge&logo=leaflet&logoColor=white)](https://github.com/Sahil-web01/AgriEdge)
[![License](https://img.shields.io/badge/License-MIT-10B981?style=for-the-badge)](LICENSE)

---

</div>

## 📌 Hackathon Project Overview

- **Event:** OMNIKON National Hackathon 2026 (Software Track)
- **Theme:** AgriTech & FoodTech
- **Problem Statement Code:** `Omni_AgriTech_2: Offline-Capable Crop Disease Detection`
- **Core Challenge:** Smallholder farmers in connectivity-deprived rural zones lack real-time diagnostic support when crop disease strikes, risking up to **35% total harvest loss**.
- **Motto:** *One Mission. Build the Impossible.*

---

## 👥 Team: LOGIC LEGION (Contributors & Responsibilities)

In compliance with the official **OMNIKON 2026 Hackathon Eligibility & Documentation Guidelines**, the registered team members, their roles, and their key technical ownership areas are documented below:

| Contributor | GitHub Username | Role | Key Architectural Ownership |
|:---|:---|:---|:---|
| **Sahil** | [`@Sahil-web01`](https://github.com/Sahil-web01) | **MERN Full-Stack Architect** | **Level 2 Lead:** NGO & Government Command Center architecture, React dashboard with interactive Leaflet.js / Mapbox GL live India outbreak heatmap, Node.js + Express REST backend, IndexedDB/Dexie.js deferred background sync pipeline, and Service Worker offline caching. |
| **Lakshay Gauniyal** | [`@Lakshay030105`](https://github.com/Lakshay030105) | **AI & Deep Learning Lead** | **Level 1 Lead:** MobileNetV2 fine-tuning on PlantVillage dataset (38 categories), INT8 post-training quantization, secondary Computer Vision edge segmentation filter (OpenCV.js / Canvas) for precise leaf surface area severity grading, and Grad-CAM class activation mapping. |

---

## 🚀 Round 2 Elite Feature Upgrades (Levels 1, 2 & 3)

```
                                 AGRIEDGE THREE-TIER UPGRADE ARCHITECTURE
┌───────────────────────────────────────┬───────────────────────────────────────┬───────────────────────────────────────┐
│     LEVEL 1: AI UPGRADE (Lakshay)     │     LEVEL 2: MERN UPGRADE (Sahil)     │     LEVEL 3: ACCESSIBILITY UPGRADE    │
├───────────────────────────────────────┼───────────────────────────────────────┼───────────────────────────────────────┤
│ • Computer Vision Severity Grading    │ • NGO & Govt Admin Command Center     │ • Frictionless Voice-Driven UI        │
│ • OpenCV.js Edge & Color Segmentation │ • Live Outbreak Heatmap (Leaflet.js)  │ • Web Speech API (STT & TTS)          │
│ • Exact % Infected Leaf Surface Area  │ • Silent PWA Deferred Telemetry Sync  │ • Regional Language Audio (Hindi/Eng) │
│ • Dynamic 3-Tier IPM Action Engine    │ • Express.js + Node REST Ingestion    │ • Sun-Optimized Pulsing Voice Trigger │
└───────────────────────────────────────┴───────────────────────────────────────┴───────────────────────────────────────┘
```

---

### 🔬 Level 1: AI Upgrade — Disease Severity Grading (Lakshay)

> *"Telling a farmer they have 'Early Blight' is good. Telling them 'Early Blight is detected, and it has currently infected 28% of the leaf surface area' is Top 10 material."*

- **The Concept:** Move beyond binary or basic image classification. Introduce a secondary computer vision pipeline that computes the exact severity of the foliar infection directly on-device.
- **The Execution:** Once the quantized **MobileNetV2** model identifies the pathogen class (e.g. *Alternaria solani*), the image is immediately piped through an edge-based segmentation filter (using **OpenCV.js / HTML5 Canvas pixel analysis** directly in browser memory).
- **The Logic:**
  1. **Leaf Isolation:** Isolate the leaf contour from the background using adaptive HSV vegetation bounds and Otsu thresholding.
  2. **Lesion Extraction:** Isolate discolored necrotic spots, chlorosis halos, and fungal lesions from healthy green chlorophyll tissue.
  3. **Severity Calculation:** Compute the exact mathematical ratio of infected pixels to total leaf pixels:
     $$\text{Severity Percentage (\%)} = \left( \frac{\text{Infected Pixels}}{\text{Total Leaf Pixels}} \right) \times 100$$
- **The Impact:** The offline database then provides **dynamic, severity-tiered IPM advice**:
  - 🟢 **Under 10% (Mild / Tier 1):** Recommends localized organic pruning, cold-pressed Neem oil spray, and cultural spacing adjustments.
  - 🟡 **10% – 30% (Moderate / Tier 2):** Recommends targeted bio-fungicides (*Trichoderma viride*, *Bacillus subtilis*), bio-copper formulations, and canopy isolation.
  - 🔴 **Over 30% (Severe / Tier 3):** Immediately advises emergency systemic chemical intervention (e.g. Azoxystrobin + Difenoconazole, Mancozeb alternation), stem quarantine, and regional telemetry broadcasting.

---

### 🛰️ Level 2: MERN Upgrade — The NGO & Government Command Center (Sahil)

> *"The core app is offline, but smartphones eventually reconnect to Wi-Fi. We leverage Sahil's full-stack skills to build a stunning secondary platform that wows the judges."*

- **The Concept:** A secure, web-based Admin Command Dashboard built for government agricultural departments, extension officers, and NGOs to monitor crop disease outbreaks in real-time.
- **The Execution:** When the farmer's PWA detects an active internet connection (via `navigator.onLine` / Service Worker Background Sync), a background worker silently POSTs the encrypted local IndexedDB telemetry logs (**Disease Class, Severity Score %, GPS Coordinates, Crop, and Timestamp**) to Sahil's **Express/Node.js backend**.
- **The Visuals:** Sahil builds a React dashboard integrating **Leaflet.js / Mapbox GL**:
  - **Live Interactive India Outbreak Heatmap:** Displays color-coded risk clusters (Red = Critical Outbreak >30%, Amber = Active Alert 10–30%, Green = Monitored <10%) showing where Early Blight and other pathogens are actively spreading.
  - **Real-Time Telemetry Feed:** Streaming log of rural farmer field diagnoses.
  - **Emergency Relief Dispatch:** One-click action for government bodies to broadcast regional advisories, deploy drone bio-fungicide units, and alert neighboring agrarian cooperatives before a localized infection escalates into a regional famine.

---

### 🎙️ Level 3: Accessibility Upgrade — Voice-Driven UI

> *"Make the application completely frictionless for illiterate or visually impaired users in rural agrarian areas."*

- **The Concept:** The app speaks to the farmer and listens to voice commands completely hands-free.
- **The Execution:** Integrates the browser's native **Web Speech API** (`SpeechRecognition` for STT and `SpeechSynthesis` for TTS).
  - **Regional Audio Narration:** When diagnosis and severity grading complete, the app automatically reads the crop condition, severity score, and treatment steps out loud in regional languages (**Hindi / हिंदी** and **English**).
- **The UX:**
  - **Pulsing High-Visibility Microphone Button:** Large, solar-optimized voice trigger designed for use under intense rural sunlight where small buttons and glare cause friction.
  - **Voice Commands Supported:**
    - *"Take Photo"* / *"Scan Leaf"* / *"फोटो खींचो"* / *"स्कैन"* $\rightarrow$ triggers camera capture & analysis.
    - *"Read Advice"* / *"इलाज बताओ"* / *"आवाज़ सुनाओ"* $\rightarrow$ reads out the multi-tier treatment plan.
    - *"Switch to Hindi"* / *"Switch to English"* $\rightarrow$ toggles bilingual interface & speech synthesis.

---

## 🌾 Why This Problem Matters — Theoretical Grounding

```
  +---------------------------------------------------------------------------------------------------+
  |                                 THE RURAL CONNECTIVITY PARADOX                                    |
  |                                                                                                   |
  |   70%+ Agrarian Belts           Foliar Pathogens Spread               Conventional Solutions      |
  |   📵 Zero / Unstable 4G    +   ⚡ Sporulation in 2-4 days       =   ❌ Cloud CV APIs Fail         |
  |      Broadband Coverage            Exponential Yield Loss               (Latency / Connection)    |
  |                                                                                                   |
  |   💡 AGRIEDGE SOLUTION: 100% On-Device Edge AI + CV Severity + Voice UI + NGO Command Center     |
  +---------------------------------------------------------------------------------------------------+
```

1. **Epidemiological Lag:** Foliar pathogens such as *Phytophthora infestans* (Late Blight) and *Alternaria solani* (Early Blight) progress from initial infection to visible sporulation within 48–72 hours. Classical epidemiology proves disease severity compounds exponentially once past the **"economic injury threshold"** — diagnostic speed directly determines crop yield saved.
2. **Connectivity-First vs. Cloud-First Design Theory:** A large share of agrarian belts globally remain outside dependable mobile broadband coverage. Compute on-device (edge inference) eliminates network round-trips and guarantees resilience during total cellular blackouts.
3. **Diagnostic Democratization:** Formal diagnosis conventionally requires agronomists or expensive laboratory assays (ELISA/PCR). Lightweight convolutional vision models combined with computer vision severity grading act as a zero-cost visual-symptom proxy, putting expert-level diagnosis in the farmer's pocket.

---

## 🏗️ End-to-End System Architecture & Execution Pipeline

```mermaid
flowchart TD
    subgraph Farmer_Edge_PWA["📱 Farmer Edge PWA (100% Offline)"]
        A["📷 1. CAPTURE / VOICE\nPWA Viewfinder / Pulsing Mic\n'Take Photo' Voice Command"] --> B["⚙️ 2. PREPROCESS\nHTML5 Canvas API\n224x224x3 Normalization"]
        B --> C["🧠 3. EDGE AI CLASSIFIER\nTensorFlow.js WebGL/WASM\nMobileNetV2 INT8 (<150ms)"]
        C --> D["🔬 4. LEVEL 1 SEVERITY CV\nOpenCV.js / Canvas Segmentation\nExact % Infected Area Ratio"]
        D --> E["🎙️ 5. LEVEL 3 VOICE UI\nWeb Speech API (Hindi/Eng)\nAutomated Treatment TTS"]
        E --> F["📋 6. ACTION ENGINE\nDexie.js IndexedDB\nDynamic 3-Tier IPM Advice"]
    end

    subgraph Deferred_Sync_Pipeline["🔄 Deferred Cloud Telemetry Sync"]
        F --> G["💾 Local IndexedDB Queue\nEncrypted Outbreak Records\n(Disease, Severity %, GPS)"]
        G -->|Network Restored / Background Sync| H["📡 Express.js REST API\nPOST /api/telemetry/sync"]
    end

    subgraph NGO_Command_Center["🛰️ Level 2: NGO & Govt Command Center"]
        H --> I["🗺️ Interactive India Heatmap\nLeaflet.js / Mapbox GL\nLive Outbreak Clusters & Alerts"]
        I --> J["🚨 Emergency Resource Dispatch\nCo-op Advisories & Drone Units"]
    end

    style Farmer_Edge_PWA fill:#0b1a14,stroke:#10b981,stroke-width:2px;
    style Deferred_Sync_Pipeline fill:#0f172a,stroke:#64748b,stroke-width:2px;
    style NGO_Command_Center fill:#18181b,stroke:#3b82f6,stroke-width:2px;
```

---

## 💻 Technical Stack

```
                                       AGRIEDGE TECH STACK
┌────────────────────────────────┬────────────────────────────────┬────────────────────────────────┐
│      FRONTEND CLIENT (PWA)     │         EDGE AI & CV           │      STORAGE & TELEMETRY       │
├────────────────────────────────┼────────────────────────────────┼────────────────────────────────┤
│ • React 18 & Vite              │ • TensorFlow.js (@tfjs)        │ • IndexedDB (Browser NoSQL)    │
│ • Web Speech API (STT & TTS)   │ • MobileNetV2 (INT8 Quantized) │ • Dexie.js API Wrapper         │
│ • Leaflet.js / React-Leaflet   │ • OpenCV.js & Canvas CV        │ • Background Sync API          │
│ • Mapbox GL Vector Tiles       │ • WebGL Fragment Shaders       │ • Node.js & Express.js REST    │
│ • Lucide Icons & Canvas FX     │ • Grad-CAM XAI Saliency Engine │ • GeoJSON Outbreak Schema      │
└────────────────────────────────┴────────────────────────────────┴────────────────────────────────┘
```

---

## 🎯 Target Crops & 38 Supported Disease Classes

AgriEdge classifies 38 distinct crop-disease combinations across major agricultural staples:

| Crop Family | Target Crops | Representative Conditions Detected |
|:---|:---|:---|
| **Solanaceae** | Tomato, Potato, Bell Pepper | Early Blight (*A. solani*), Late Blight (*P. infestans*), Bacterial Spot, Leaf Mold, Septoria Leaf Spot, Target Spot, Yellow Leaf Curl Virus, Mosaic Virus, Healthy |
| **Rosaceae** | Apple, Peach, Cherry, Strawberry | Apple Scab, Black Rot, Cedar Apple Rust, Powdery Mildew, Leaf Scorch, Healthy |
| **Vitaceae** | Grape | Black Rot, Esca (Black Measles), Leaf Blight (*Isariopsis*), Healthy |
| **Poaceae & Others** | Corn (Maize), Soybean, Squash, Orange | Northern Leaf Blight, Common Rust, Cercospora Leaf Spot, Citrus Greening (Huanglongbing), Powdery Mildew, Healthy |

---

## 🛡️ Feasibility Analysis & Risk Mitigation Matrix

| Potential Risk / Challenge | Impact | Mitigation Strategy Implemented in AgriEdge | Supporting Theory |
|:---|:---|:---|:---|
| **Memory Overhead on Budget Devices** | High DL memory causing browser crashes on 2GB/3GB RAM phones. | **INT8 Quantization:** Compresses model from ~50MB to **<10MB**, cutting RAM footprint by ~75%. | *Post-training quantization:* Maps float32 to int8 with minimal accuracy degradation. |
| **Field Lighting & Glare Variance** | Direct sunlight/blur degrading classification confidence. | **Guided Viewfinder UI & Voice UI:** Large pulsing mic + dynamic bounding guides user without glare friction. | *Human-factors design:* Multimodal speech/visual input eliminates bright-sun touch errors. |
| **Illiteracy & Accessibility Gaps** | Smallholder farmers unable to read text diagnostics. | **Level 3 Bilingual Web Speech API:** Automatic Hindi/English speech readout of diagnosis and treatment. | *Universal Design:* Voice-first interface removes literacy barriers in rural farming. |
| **Outbreak Lag for Regional Agencies** | Isolated farm outbreaks spreading before government awareness. | **Level 2 NGO Command Heatmap:** Silent deferred sync aggregates regional outbreaks into live cluster heatmaps. | *Epidemiological Surveillance:* Automated telemetry aggregation prevents famine-scale outbreaks. |
| **Device GPU Fragmentation** | Inconsistent WebGL shader drivers on low-cost devices. | **Automatic WASM/SIMD Fallback:** TF.js detects WebGL support and gracefully falls back to CPU WASM. | *Graceful degradation:* Maintains application availability across 100% of web hardware. |

---

## 📅 The 10-Day Sprint Strategy

```
  DAYS 1–3                   DAYS 4–7                   DAYS 8–10
┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐
│ ML Model & CV Engine    │ │ PWA & Voice Interface   │ │ NGO Command & Testing   │
├─────────────────────────┤ ├─────────────────────────┤ ├─────────────────────────┤
│ • MobileNetV2 INT8 TFJS │ │ • React + Vite UI build │ │ • Sahil's NGO Dashboard │
│ • Class-weighted loss   │ │ • Level 3 Voice STT/TTS │ │ • Leaflet/Mapbox Heatmap│
│ • Lakshay's OpenCV.js   │ │ • Dexie.js Tiered IPM DB│ │ • Express Sync Backend  │
│   Severity Grading math │ │ • Canvas guided camera  │ │ • Cross-device stress   │
└─────────────────────────┘ └─────────────────────────┘ └─────────────────────────┘
```

- **Days 1–3 (Lakshay):** Fine-tune MobileNetV2 on PlantVillage dataset, export quantized INT8 graph shards, build the OpenCV.js / Canvas edge segmentation pipeline for Level 1 severity percentage calculation.
- **Days 4–7 (Sahil & Lakshay):** Build the offline PWA shell, configure Dexie.js 3-tier dynamic IPM advisory database, integrate Level 3 Web Speech API for Hindi/English voice control & narration.
- **Days 8–10 (Sahil):** Build Level 2 NGO Command Center dashboard with live Leaflet.js India outbreak heatmap, implement Express telemetry sync backend, conduct offline stress testing and field validation.

---

## 🌍 Real-World Impact & UN SDG Alignment

<div align="center">

| Economic Impact | Social Impact | Environmental Impact |
|:---:|:---:|:---:|
| **📉 -35% Crop Loss** | **🆓 Zero-Cost & Voice Access** | **🌱 Targeted Spraying** |
| Early Stage-1 detection & severity grading prevents field contagion and secures farmer income. | Hands-free Hindi/English voice UI democratizes expert agronomy to illiterate and rural growers. | Replaces blind chemical overuse with severity-tiered organic remedies, cutting soil toxicity. |

</div>

### Alignment with United Nations Sustainable Development Goals (SDGs)
- 🌾 **SDG 2: Zero Hunger** — Protects smallholder crop yields and strengthens food security in vulnerable agrarian zones.
- 🔬 **SDG 9: Industry, Innovation & Infrastructure** — Implements frugal, cutting-edge edge AI without requiring expensive rural infrastructure.
- ♻️ **SDG 12: Responsible Consumption & Production** — Promotes Integrated Pest Management (IPM), drastically lowering toxic chemical pesticide usage.

---

## 📚 Research Foundation & Technical Citations

1. **Hughes, D. & Salathé, M.** — *An open access repository of images on plant health to enable the development of mobile disease diagnostics.* (PlantVillage Dataset, 54,300+ annotated leaves across 38 classes).
2. **Sandler, M. et al. (Google Research)** — *MobileNetV2: Inverted Residuals and Linear Bottlenecks.* (CVPR 2018).
3. **Selvaraju, R. R. et al.** — *Grad-CAM: Visual Explanations from Deep Networks via Gradient-based Localization.* (ICCV 2017).
4. **Bradski, G.** — *The OpenCV Library.* (Dr. Dobb's Journal of Software Tools, Computer Vision Segmentation).
5. **W3C Web Application Working Group** — *Web Speech API & Indexed Database API 3.0 Specifications.*
6. **Food and Agriculture Organization (FAO)** — *Integrated Pest Management (IPM) Principles and Guidelines.*
7. **Jacob, B. et al.** — *Quantization and Training of Neural Networks for Efficient Integer-Arithmetic-Only Inference.* (CVPR 2018).

---

## 📁 Repository Structure

```
AgriEdge/
├── .github/                   # CI/CD workflows and issue templates
├── client/                    # Offline-First React + Vite Progressive Web App (PWA)
│   ├── public/
│   │   ├── models/            # Quantized INT8 MobileNetV2 TF.js model shards
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/        # Scanner, Severity Card, Treatment Plan, Voice Button, NGO Map
│   │   ├── db/                # Dexie.js IndexedDB schema & 38-class IPM dynamic treatment tiers
│   │   ├── ml/                # TF.js inference runtime, OpenCV.js severity grading & Grad-CAM
│   │   ├── services/          # Web Speech API voice assistant & telemetry background sync
│   │   ├── utils/             # Canvas preprocessors (224x224x3) & image helpers
│   │   ├── App.jsx            # Main app shell & Farmer / NGO navigation switch
│   │   ├── main.jsx           # React root & service worker registration
│   │   └── index.css          # Design system, dark glassmorphism & voice pulse animations
│   ├── index.html
│   ├── vite.config.js         # Vite configuration with proxy & PWA options
│   └── package.json
├── server/                    # Level 2 Deferred Cloud Telemetry Sync & NGO Command Server
│   ├── src/
│   │   ├── config/            # Database connection configuration
│   │   ├── controllers/       # Telemetry sync & outbreak cluster aggregation
│   │   ├── models/            # GeoJSON outbreak telemetry schema
│   │   └── routes/            # REST API endpoints (/api/telemetry/sync, /api/telemetry/outbreaks)
│   ├── server.js              # Express.js application entry
│   └── package.json
├── ml/                        # Model Training & TF.js INT8 Quantization Pipeline
│   ├── notebooks/             # MobileNetV2 fine-tuning, OpenCV severity & Grad-CAM validation
│   ├── scripts/               # PlantVillage data prep, class weighting & export scripts
│   └── requirements.txt       # Python training dependencies
├── docs/                      # Architectural specs, sprint strategies & research notes
├── .gitignore
├── LICENSE                    # MIT License
└── README.md                  # Project Documentation
```

---

## 🚀 Quickstart & Local Development

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn** / **pnpm**
- **Modern Browser**: Chrome, Edge, Safari, or Firefox with WebGL & Web Speech support

### 1. Clone the Repository
```bash
git clone https://github.com/Sahil-web01/AgriEdge.git
cd AgriEdge
```

### 2. Run Frontend Client (Farmer PWA & NGO Command Center)
```bash
cd client
npm install
npm run dev
```
Visit `http://localhost:5173` in your browser.

### 3. Run Deferred Telemetry Sync Server
```bash
cd ../server
npm install
npm run dev
```
Server runs at `http://localhost:5000`.

---

## 🔍 Reviewer Notes

> [!NOTE]
> **Notes Prepared for OMNIKON 2026 Evaluation Panel:**

1. **Zero-Cloud & Offline Edge Verification:**
   - Open Chrome DevTools, navigate to **Network** tab, select **Offline**, and trigger a scan or voice command. The entire pipeline (MobileNetV2 classification, OpenCV.js severity grading, Grad-CAM generation, and IndexedDB lookup) executes with 0 network calls.
2. **Level 1 Severity Grading:**
   - Inspect the leaf segmentation mask and percentage calculation (`Infected Area / Leaf Area * 100%`) on the diagnostic report to verify dynamic tier switching (<10% organic pruning vs >30% chemical intervention).
3. **Level 2 NGO Command Center:**
   - Switch to the **NGO Command Center** view to inspect live outbreak cluster heatmaps across India and test background telemetry sync from local farmer scans.
4. **Level 3 Voice Accessibility:**
   - Click the large pulsing mic button or use hands-free voice commands (*"Take Photo"*, *"फोटो खींचो"*, *"Read Advice"*) to experience hands-free operation and regional bilingual speech synthesis in Hindi and English.

---

## 📜 Documentation & Governance Links

- 📄 **[LICENSE (MIT)](LICENSE)** — Open Source License
- 🔒 **[SECURITY.md](SECURITY.md)** — Data Protection, Edge Privacy & Vulnerability Policy
- 🤝 **[CONTRIBUTING.md](CONTRIBUTING.md)** — Hackathon Contribution & Branching Guidelines
- 📜 **[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)** — Community Standards & Pledges
- 📐 **[docs/architecture.md](docs/architecture.md)** — Technical Architecture Specification & 38-Class Taxonomy

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
<b>LOGIC LEGION — OMNIKON NATIONAL HACKATHON 2026</b><br/>
<i>Empowering 120M+ Smallholder Farmers with Zero-Cloud Edge AI</i>
</div>
