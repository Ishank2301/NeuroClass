# NeuroClass: Brain Tumor MRI Image Classification & Clinical Triage

NeuroClass is a deep learning-powered medical imaging web platform for multi-class brain tumor classification, visual explainability (Grad-CAM heatmaps), and clinical radiology triage.

## 🎯 Clinical Problem Statement
Brain tumors represent one of the most critical central nervous system pathologies requiring rapid and highly sensitive detection. NeuroClass provides radiologists and neuro-oncologists with automated computer-aided diagnosis (CADx) to classify brain MRI scans into four distinct categories:
1. **Glioma Tumor**: Infiltrative high- or low-grade neuroepithelial neoplasms with necrotic core and vasogenic edema.
2. **Meningioma Tumor**: Extra-axial dural-based lesions with classic "dural tail" attachment.
3. **Pituitary Tumor**: Sellar and suprasellar neuroendocrine neoplasms with potential optic chiasm impingement.
4. **No Tumor (Normal)**: Healthy control parenchyma with symmetrical ventricles and preserved morphology.

## 🧠 Deep Learning Architecture & Benchmarks
The platform compares models trained from scratch against ImageNet pretrained transfer learning backbones across a test dataset of 1,311 clinical MRI scans:

| Model Architecture | Type | Parameters | Accuracy | Macro F1 | Latency |
|---|---|---|---|---|---|
| **ResNet-50** | Transfer Learning | 25.6M | **97.8%** | **97.5%** | 34 ms |
| **EfficientNet-B0** | Transfer Learning | 4.8M | 96.7% | 96.4% | 22 ms |
| **Inception-V3** | Transfer Learning | 22.8M | 96.1% | 95.9% | 38 ms |
| **MobileNet-V2** | Transfer Learning | 2.8M | 95.2% | 94.9% | **12 ms** |
| **Custom CNN** | Trained from Scratch | 4.2M | 92.4% | 91.9% | 18 ms |

## 🌟 Core Features
- **Interactive Radiology PACS Viewer**: Pan, zoom (0.75x–3.5x), measurement calipers (0.8 mm/voxel calibration), and crosshairs.
- **Grad-CAM Activation Heatmaps**: Real-time visual explanation with selectable colormaps (*Jet, Inferno, Turbo, Viridis*) and opacity control.
- **Window/Level Presets**: Brain Standard, High Contrast, Bone/Sellar Window, Sobel Edge Detection, and Inverted Film.
- **Automated Clinical Triage**: Stratifies cases into *STAT (Immediate Review)*, *Semi-Urgent*, *Routine*, and *Normal Priority*.
- **Accredited Diagnostic Report Export**: Formal print/PDF second-opinion report generation.
- **Model Evaluation Dashboard**: 4×4 Confusion Matrix, ROC curves with multi-class AUC, and training/validation loss curves over 40 epochs.
- **Data Augmentation Lab**: Interactive simulation of random rotation, zoom, flips, and brightness shifts.
