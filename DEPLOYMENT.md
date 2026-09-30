# 🚀 NeuroClass: Website Deployment & Setup Guide

This guide provides end-to-step instructions for running **NeuroClass** locally and deploying the web application to major cloud platforms (**Vercel**, **Netlify**, **Docker**, **Google Cloud Run**, and **GitHub Pages**).

---

## 📋 Table of Contents
1. [Prerequisites](#1-prerequisites)
2. [Local Setup (Web + Python ML)](#2-local-setup-web--python-ml)
3. [Deploying the Web Application](#3-deploying-the-web-application)
   - [Option A: Vercel (Recommended - Fastest)](#option-a-vercel-recommended)
   - [Option B: Netlify](#option-b-netlify)
   - [Option C: Docker Container](#option-c-docker-container)
   - [Option D: Google Cloud Run](#option-d-google-cloud-run)
   - [Option E: GitHub Pages](#option-e-github-pages)
4. [Connecting the Python ML Model to the Web App](#4-connecting-the-python-ml-model-to-the-web-app)
5. [Environment Variables](#5-environment-variables)
6. [Troubleshooting & FAQ](#6-troubleshooting--faq)

---

## 1. Prerequisites

Before starting, ensure you have the following installed on your machine:

| Tool | Minimum Version | Purpose | Download Link |
|---|---|---|---|
| **Node.js** | `v18.0.0+` (LTS recommended) | Runs Vite development server & builds the web app | [nodejs.org](https://nodejs.org) |
| **npm** | `v9.0.0+` | Node package manager (comes with Node.js) | - |
| **Python** | `3.10+` | Runs PyTorch model training, evaluation & Grad-CAM | [python.org](https://python.org) |
| **Git** | `2.30+` | Version control & deployment | [git-scm.com](https://git-scm.com) |
| **Docker** *(Optional)* | `20.10+` | Containerized deployment | [docker.com](https://docker.com) |

---

## 2. Local Setup (Web + Python ML)

### Step 1: Clone the Repository
```bash
git clone https://github.com/Ishank2301/NeuroClass.git
cd NeuroClass
```

### Step 2: Start the Web Application
```bash
# 1. Install frontend Node.js dependencies
npm install

# 2. Launch the local Vite development server
npm run dev
```
Open your browser and navigate to:
👉 **`http://localhost:5173`** (or `http://localhost:3000`)

You can now interact with the diagnostic PACS viewer, test preset clinical cases (Glioma, Meningioma, Pituitary, Normal), manipulate real-time Grad-CAM heatmaps, adjust DICOM windowing, and measure lesions using digital calipers.

---

### Step 3: Setup the Python Deep Learning Pipeline
If you want to train models, evaluate test sets, or generate Grad-CAM heatmaps locally:

```bash
# 1. Create a Python virtual environment
python3 -m venv venv

# 2. Activate the virtual environment
# On macOS / Linux:
source venv/bin/activate
# On Windows:
.\venv\Scripts\activate

# 3. Install scientific and deep learning dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 4: Add Your Dataset
Place your MRI image slices (`.jpg`, `.png`) into the pre-configured subfolders:
```text
dataset/
├── train/
│   ├── glioma/
│   ├── meningioma/
│   ├── notumor/
│   └── pituitary/
├── val/
│   ├── glioma/
│   ├── meningioma/
│   ├── notumor/
│   └── pituitary/
└── test/
    ├── glioma/
    ├── meningioma/
    ├── notumor/
    └── pituitary/
```

*(Tip: If you have raw unsplit data, run `python ml/split_data.py --source /path/to/raw --output ./dataset`)*

### Step 5: Run PyTorch Training & Evaluation
```bash
# Train ResNet-50
python train.py --data-dir ./dataset --arch resnet50 --epochs 25 --batch-size 32

# Evaluate on test set
python ml/evaluate.py --data-dir ./dataset --weights ./models/neuroclass_resnet50_best.pth

# Generate a Grad-CAM overlay
python ml/gradcam.py --image ./dataset/test/glioma/sample.jpg --weights ./models/neuroclass_resnet50_best.pth

# Export to ONNX & TorchScript
python ml/export.py --weights ./models/neuroclass_resnet50_best.pth
```

---

## 3. Deploying the Web Application

### Option A: Vercel (Recommended)
Vercel is the easiest and fastest way to deploy the NeuroClass web frontend with free automatic SSL, CDN edge caching, and preview environments.

#### Method 1: Using the Vercel Dashboard (1-Click)
1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New Project"** $\to$ **"Project"**.
3. Select the **`Ishank2301/NeuroClass`** repository and click **Import**.
4. Configure the project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Click **"Deploy"**.
6. In ~45 seconds, your site will be live at `https://neuroclass.vercel.app`!

#### Method 2: Using the Vercel CLI
```bash
# Install Vercel CLI globally
npm install -g vercel

# Log in and deploy
vercel

# Deploy to production
vercel --prod
```
*(The repository already includes [`vercel.json`](vercel.json) with single-page application rewrites and immutable static asset headers).*

---

### Option B: Netlify
Netlify provides continuous integration directly from your GitHub repository.

#### Method 1: Netlify Web Dashboard
1. Log in to [netlify.com](https://netlify.com) with GitHub.
2. Click **"Add new site"** $\to$ **"Import an existing project"**.
3. Choose **GitHub** and select **`NeuroClass`**.
4. Netlify will automatically detect settings from [`netlify.toml`](netlify.toml):
   - **Base directory**: (empty)
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Click **"Deploy NeuroClass"**.

#### Method 2: Netlify CLI
```bash
npm install -g netlify-cli
netlify login
netlify init
netlify deploy --prod --dir=dist
```

---

### Option C: Docker Container
For on-premise clinical networks, hospital PACS servers, or self-hosted cloud instances:

```bash
# 1. Build the production Docker image
docker build -t neuroclass:latest .

# 2. Run the container on port 80 (or port 3000)
docker run -d -p 80:80 --name neuroclass-app neuroclass:latest

# Or run using Docker Compose:
docker compose up -d
```
Visit **`http://localhost`** in your browser.

The [`Dockerfile`](Dockerfile) uses a multi-stage Alpine build:
- Stage 1 compiles TypeScript and builds optimized production bundles via Vite.
- Stage 2 serves the assets using a lightweight, hardened Nginx server with Gzip compression and security headers.
- Total container footprint is under **25 MB**!

---

### Option D: Google Cloud Run
Deploy scalable, serverless container instances on Google Cloud Platform:

```bash
# 1. Authenticate with Google Cloud
gcloud auth login
gcloud config set project YOUR_GCP_PROJECT_ID

# 2. Build and deploy container directly to Cloud Run
gcloud run deploy neuroclass \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```
Cloud Run will provide a secure HTTPS endpoint (e.g. `https://neuroclass-xxxx-uc.a.run.app`).

---

### Option E: GitHub Pages
To host directly on GitHub's free static hosting:

1. In `vite.config.ts`, verify the base path:
   ```ts
   export default defineConfig({
     base: './', // Ensures relative assets resolve on GitHub Pages subpaths
     // ...
   });
   ```
2. Build the project:
   ```bash
   npm run build
   ```
3. Use the `gh-pages` package to publish:
   ```bash
   npm install --save-dev gh-pages
   npx gh-pages -d dist
   ```
4. In your GitHub repository settings, go to **Pages** and set the source branch to `gh-pages`.

---

## 4. Connecting the Python ML Model to the Web App

NeuroClass is designed with a **dual-engine architecture**:
1. **Interactive Client Engine**: Out of the box, the frontend includes a zero-latency client-side PACS vision engine (`src/utils/mriEngine.ts`) that runs 60 FPS Grad-CAM heatmap rendering and caliper diagnostics right in the user's browser without requiring an external GPU server.
2. **Production Backend Inference API**: When you train your PyTorch model (`best_model.pth` or `neuroclass.onnx`), you can launch the included REST API server:

```bash
# Run the backend REST API service (port 3001)
npx tsx server/api.ts
```

### Endpoints Available:
- `GET /api/health`: Health status and GPU availability.
- `GET /api/models`: Lists active weights and architectures.
- `POST /api/predict`: Accepts base64 MRI slice image and returns class probabilities, bounding boxes, and Grad-CAM coordinate fields.

To connect your deployed frontend to your custom inference API, configure `VITE_API_URL` in your environment.

---

## 5. Environment Variables

Create a `.env` file in the root directory if you want to customize runtime settings:

```bash
# Frontend Vite variables (must start with VITE_)
VITE_APP_TITLE=NeuroClass PACS CADx
VITE_API_URL=https://api.yourdomain.com
VITE_CALIBRATION_MM_PER_PIXEL=0.8

# Backend Server port (optional)
PORT=3000
NODE_ENV=production
```

*(Note: Sensitive keys should never be committed to Git. `.env` is already safely excluded in `.gitignore`)*.

---

## 6. Troubleshooting & FAQ

### Q: `npm run build` fails with TypeScript error?
Run `npm run lint` or `npx tsc --noEmit` locally to check for type mismatches. Ensure you are running Node.js 18 or newer.

### Q: My Docker build fails or is too slow?
Ensure `.dockerignore` exists. Without `.dockerignore`, Docker will attempt to copy gigabytes of datasets and python virtual environments. The included `.dockerignore` ensures builds finish in seconds.

### Q: Where do I upload my MRI dataset?
Drop your images into:
- `dataset/train/{glioma, meningioma, notumor, pituitary}`
- `dataset/val/{glioma, meningioma, notumor, pituitary}`
- `dataset/test/{glioma, meningioma, notumor, pituitary}`

### Q: Will pushing my dataset exceed GitHub's 100 MB file limit?
No! Our `.gitignore` is specifically crafted to track the **subfolder structure** while automatically excluding heavy image binaries (`*.jpg`, `*.png`, `*.dcm`, `*.nii`). Your GitHub repository stays lightweight and clean!

---

### 🏥 Need Support?
Open an issue on [GitHub Issues](https://github.com/Ishank2301/NeuroClass/issues) or consult the interactive notebook in [`notebooks/Brain_Tumor_Classification_GradCAM.ipynb`](notebooks/Brain_Tumor_Classification_GradCAM.ipynb).
