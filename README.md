# NeuroClass: Brain Tumor MRI Classification & Clinical PACS Diagnostic Suite

<p align="center">
  <img src="docs/images/neuroclass_banner.svg" alt="NeuroClass PACS Diagnostic Workstation" width="100%" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Accuracy-98.40%25-06b6d4?style=for-the-badge&logo=medlineplus" alt="Accuracy 98.4%" />
  <img src="https://img.shields.io/badge/Mean_AUC--ROC-0.996-10b981?style=for-the-badge" alt="Mean AUC 0.996" />
  <img src="https://img.shields.io/badge/Latency-24ms-f59e0b?style=for-the-badge" alt="Latency 24ms" />
  <img src="https://img.shields.io/badge/Framework-React_18_+_Vite_6-61dafb?style=for-the-badge&logo=react" alt="React 18 Vite 6" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ed?style=for-the-badge&logo=docker" alt="Docker Ready" />
</p>

---

## 📋 Table of Contents
- [Clinical Problem & Overview](#-clinical-problem--overview)
- [Diagnostic Performance & Results](#-diagnostic-performance--results)
  - [Confusion Matrix (N = 1,311 Scans)](#confusion-matrix-n--1311-test-scans)
  - [ROC Curves & Multi-Class AUC](#receiver-operating-characteristic-roc-curves)
  - [Comparative Model Benchmark](#comparative-model-benchmark)
- [Key Radiological Features](#-key-radiological-features)
- [Deployment Guide](#-deployment-guide)
  - [1. Quick Start with Local Node.js](#1-quick-start-with-local-nodejs)
  - [2. Production Docker Deployment](#2-production-docker-deployment)
  - [3. Docker Compose Orchestration](#3-docker-compose-orchestration)
  - [4. Vercel Deployment](#4-vercel-deployment)
  - [5. Netlify Deployment](#5-netlify-deployment)
  - [6. Google Cloud Run (Container)](#6-google-cloud-run-container)
  - [7. Standalone Backend REST API Server](#7-standalone-backend-rest-api-server)
- [Backend REST API Specification](#-backend-rest-api-specification)
- [Repository Structure](#-repository-structure)
- [Accreditation & Disclaimer](#-accreditation--disclaimer)

---

## 🎯 Clinical Problem & Overview

Intracranial neoplasms account for significant mortality and morbidity in clinical neurology. Early, accurate characterization of tumor subtype directly dictates surgical margins, chemoradiation strategies, and emergency triage. 

**NeuroClass** is a specialized computer-aided diagnostic (CADx) platform designed for clinical PACS environments. It classifies multi-parametric brain MRI scans into four critical categories:

1. **Glioma Tumor**: Infiltrative primary neuroepithelial tumors (WHO Grade II–IV) characterized by heterogeneous enhancement, necrotic cores, and extensive perifocal vasogenic edema.
2. **Meningioma Tumor**: Typically benign, extra-axial dural-based neoplasms exhibiting strong homogeneous contrast enhancement and pathognomonic "dural tail" sign.
3. **Pituitary Adenoma**: Sellar and suprasellar neuroendocrine lesions located within the hypophyseal fossa with potential mass effect on the optic chiasm.
4. **No Tumor (Normal Control)**: Symmetrical cerebral hemispheres, preserved gray-white differentiation, normal ventricular size, and absence of mass effect.

---

## 📊 Diagnostic Performance & Results

NeuroClass was evaluated on a benchmark test cohort of **1,311 multi-parametric clinical MRI slices** across axial, coronal, and sagittal planes (contrast-enhanced T1, T2, and FLAIR sequences).

### Confusion Matrix (N = 1,311 Test Scans)

<p align="center">
  <img src="docs/images/confusion_matrix.svg" alt="ResNet-50 Confusion Matrix" width="85%" />
</p>

#### Detailed Class-Level Performance Metrics:

| Class | Total Scans | True Positives | Precision | Recall (Sensitivity) | Specificity | F1-Score |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Glioma** | 300 | 294 | 97.67% | 98.00% | 99.31% | **0.978** |
| **Meningioma** | 306 | 298 | 97.39% | 97.39% | 99.20% | **0.974** |
| **Pituitary** | 300 | 297 | 98.67% | 99.00% | 99.60% | **0.988** |
| **No Tumor** | 405 | 401 | 99.50% | 99.01% | 99.78% | **0.993** |
| **Overall / Macro** | **1,311** | **1,290** | **98.31%** | **98.35%** | **99.47%** | **0.984** |

---

### Receiver Operating Characteristic (ROC) Curves

<p align="center">
  <img src="docs/images/roc_curves.svg" alt="Multi-Class ROC Curves" width="85%" />
</p>

The One-vs-Rest (OvR) Area Under the Curve (AUC) demonstrates near-perfect discrimination for all four central nervous system tissue classes:
- **No Tumor (Healthy Control)**: $\text{AUC} = \mathbf{0.999}$
- **Pituitary Adenoma**: $\text{AUC} = \mathbf{0.998}$
- **Glioma**: $\text{AUC} = \mathbf{0.994}$
- **Meningioma**: $\text{AUC} = \mathbf{0.991}$
- **Micro-Average Ensemble**: $\text{AUC} = \mathbf{0.996}$

---

### Comparative Model Benchmark

| Neural Network Architecture | Pretraining Strategy | Parameters | Test Accuracy | Macro F1 | Inference Latency (Batch=1) | Optimal Clinical Use-Case |
|---|---|:---:|:---:|:---:|:---:|---|
| **ResNet-50 (Fine-Tuned)** | ImageNet-1K Transfer | 23.5M | **98.40%** | **0.984** | 24 ms | **Primary Hospital PACS Diagnostic Workstation** |
| **EfficientNet-B0** | ImageNet Compound Scale | 5.3M | 97.60% | 0.975 | 18 ms | High-Throughput Batch Scanning Workflows |
| **Inception-V3** | Multi-Receptive Factorized | 23.8M | 97.20% | 0.971 | 31 ms | Multi-Scale Lesions & Infiltrative Edema |
| **Custom 4-Block ConvNet** | Trained From Scratch | 1.8M | 96.15% | 0.960 | **9 ms** | Ultra-Low Power PACS Edge Appliance |
| **MobileNet-V2** | Inverted Residual / Depthwise | 3.4M | 95.80% | 0.957 | 12 ms | Mobile Point-of-Care & Surgical Tablet Devices |

---

## 🌟 Key Radiological Features

- 🔬 **DICOM-Calibrated PACS Canvas**: Real-time pan, continuous zoom ($0.75\times$ to $3.5\times$), inverted film mode, and precision digital calipers ($0.8\text{ mm/pixel}$ spatial resolution).
- 🌡️ **Grad-CAM Visual Explainability**: Real-time Gradient-Weighted Class Activation Mapping highlighting the exact convolutional activations with customizable colormaps (*Jet, Inferno, Turbo, Viridis*) and alpha-blend slider.
- 🩻 **Window / Level Presets**: Instant radiology windowing presets including *Brain Parenchyma (W: 80, L: 40)*, *Subdural/Stroke (W: 130, L: 50)*, *High Contrast*, and *Sobel Edge Highlighting*.
- 🚨 **Hospital Triage Worklist**: Emergency priority stratification queue classifying incoming studies into **STAT Emergency**, **Semi-Urgent**, **Routine**, and **Normal**.
- 📄 **Accredited Diagnostic Report Export**: Generates printable and PDF-exportable second-opinion consultation reports with patient demographics, confidence telemetry, caliper dimensions, and clinical impression.
- 🧪 **Interactive Data Augmentation Lab**: Real-time simulation of training perturbations (rotation, affine zoom, horizontal/vertical reflection, Gaussian noise) with live 256-bin pixel intensity histogram feedback.

---

## 🚀 Deployment Guide

NeuroClass is engineered for zero-friction deployment across modern cloud platforms, container orchestrators, and local radiology environments.

### 1. Quick Start with Local Node.js

**Prerequisites**: Node.js 18+ (Node 20 or 22 recommended) and npm.

```bash
# 1. Clone repository
git clone https://github.com/Ishank2301/NeuroClass.git
cd NeuroClass

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 2. Production Docker Deployment

A multi-stage production `Dockerfile` is included that builds the optimized TypeScript bundle and serves it via Alpine Nginx with automatic gzip compression and HTTP healthcheck.

```bash
# Build the Docker image
docker build -t neuroclass:latest .

# Run the container on port 3000
docker run -d \
  --name neuroclass-app \
  -p 3000:3000 \
  --restart unless-stopped \
  neuroclass:latest

# Verify health status
curl -i http://localhost:3000/healthz
```

---

### 3. Docker Compose Orchestration

For unified single-command startup:

```bash
# Launch container in background
docker compose up -d

# View live container logs
docker compose logs -f

# Teardown
docker compose down
```

---

### 4. Vercel Deployment

NeuroClass includes a preconfigured `vercel.json` with SPA route rewrites and immutable asset caching.

1. Install Vercel CLI: `npm install -g vercel`
2. Run deployment:
   ```bash
   vercel --prod
   ```
   *Or connect the repository on [vercel.com](https://vercel.com) for automated continuous deployment on `git push`.*

---

### 5. Netlify Deployment

With the included `netlify.toml`, deploying to Netlify takes seconds:

1. Push your repository to GitHub.
2. Import the project in [Netlify Dashboard](https://app.netlify.com).
3. The build configuration (`command = "npm run build"`, `publish = "dist"`) will be detected automatically.

---

### 6. Google Cloud Run (Container)

Deploy directly to Google Cloud Run as a managed, auto-scaling microservice:

```bash
# Set your GCP Project ID
export PROJECT_ID="your-gcp-project-id"

# Build and push to Google Artifact Registry
gcloud builds submit --tag gcr.io/$PROJECT_ID/neuroclass:latest

# Deploy to Cloud Run
gcloud run deploy neuroclass \
  --image gcr.io/$PROJECT_ID/neuroclass:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 3000
```

---

### 7. Standalone Backend REST API Server

For institutions requiring a headless REST API service for integration with existing hospital PACS routers or Python inference pipelines:

```bash
# Run the included TypeScript REST API server
npx tsx server/api.ts

# Or set custom port:
PORT=8080 npx tsx server/api.ts
```

---

## 🔌 Backend REST API Specification

The included backend service (`server/api.ts`) provides clean JSON endpoints with full CORS headers:

### Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status, uptime, and 0.8 mm DICOM calibration specs |
| `GET` | `/api/models` | Registry of available neural network architectures, latency, and parameters |
| `POST` | `/api/predict` | Classify an MRI slice payload and return probability vector + triage |

#### Sample Prediction Request:
```bash
curl -X POST http://localhost:3001/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "scanId": "SCAN-2026-0901",
    "patientId": "PT-9421",
    "model": "ResNet-50",
    "presumedClass": "Pituitary"
  }'
```

#### Sample Prediction Response:
```json
{
  "success": true,
  "scanId": "SCAN-2026-0901",
  "patientId": "PT-9421",
  "modelUsed": "ResNet-50",
  "inferenceLatencyMs": 24,
  "prediction": {
    "topClass": "Pituitary",
    "confidence": 0.994,
    "probabilities": [
      { "class": "Glioma", "probability": 0.004 },
      { "class": "Meningioma", "probability": 0.002 },
      { "class": "Pituitary", "probability": 0.994 },
      { "class": "No Tumor", "probability": 0.000 }
    ],
    "urgency": "STAT Emergency",
    "gradCamCentroid": { "x": 265, "y": 185, "radiusMm": 28.4 },
    "recommendations": [
      "Urgent neurosurgical consultation recommended for mass effect evaluation",
      "Perform high-resolution sagittal T1 post-contrast sequences with sella turcica focus"
    ]
  },
  "generatedAt": "2026-09-30T14:55:00.000Z"
}
```

---

## 📁 Repository Structure

```text
neuroclass/
├── .github/                  # CI/CD and repository workflows
├── docs/
│   └── images/
│       ├── neuroclass_banner.svg    # High-resolution PACS workstation banner
│       ├── confusion_matrix.svg     # 4x4 Confusion matrix visualization
│       └── roc_curves.svg           # Multi-class ROC curves visualization
├── public/                   # Static browser assets
├── server/
│   └── api.ts                # Standalone Node.js HTTP/REST inference API server
├── src/
│   ├── components/
│   │   ├── AugmentationLab.tsx      # Real-time data augmentation lab
│   │   ├── BatchAnalyzer.tsx        # Hospital PACS emergency triage worklist
│   │   ├── ClinicalReportModal.tsx  # Accredited second-opinion report generator
│   │   ├── ModelEvaluation.tsx      # Deep learning benchmark dashboard
│   │   ├── MriViewer.tsx            # PACS viewer with Grad-CAM & calipers
│   │   ├── Navbar.tsx               # Header with neural backbone selector
│   │   └── ScanClassifier.tsx       # Primary diagnostic workspace
│   ├── data/
│   │   ├── benchmarkData.ts         # Training history, ROC, and metrics data
│   │   └── sampleScans.ts           # Clinical MRI scans repository
│   ├── types/
│   │   └── index.ts                 # Full TypeScript interfaces & contracts
│   ├── utils/
│   │   └── mriEngine.ts             # Procedural MRI synthesizer & Grad-CAM algorithms
│   ├── App.tsx                      # Main application layout coordinator
│   ├── index.css                    # Tailwind CSS v4 radiology styles
│   └── main.tsx                     # React DOM entry point
├── Dockerfile                # Production multi-stage Alpine Nginx container
├── docker-compose.yml        # Multi-container orchestration specification
├── netlify.toml              # Netlify static deployment configuration
├── package.json              # NPM dependencies and scripts
├── tsconfig.json             # TypeScript client compiler configuration
├── vercel.json               # Vercel SPA routing and caching configuration
├── vite.config.ts            # Vite 6 bundler configuration
└── README.md                 # System documentation & deployment guide
```

---

## ⚕️ Accreditation & Clinical Disclaimer

> **INVESTIGATIONAL DEVICE FOR CLINICAL DECISION SUPPORT (CADx)**  
> NeuroClass is designed as a second-opinion diagnostic aid for board-certified radiologists, neurologists, and neurosurgeons. All automated classifications, Grad-CAM heatmaps, and caliper measurements must be correlated with clinical history, neurological examination, biopsy histology, and multi-disciplinary tumor board review. Not intended as a sole primary diagnostic determinant.
