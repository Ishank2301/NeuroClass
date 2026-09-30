// MRI Image Processing & Deep Learning Simulation Utilities
import { TumorClass, ModelPrediction, ClassProbability } from '../types';

export const TUMOR_CLASSES_METADATA: Record<TumorClass, {
  label: string;
  description: string;
  typicalLocation: string;
  riskLevel: 'Critical' | 'High' | 'Moderate' | 'Low';
  color: string;
  clinicalRecommendations: string[];
}> = {
  glioma: {
    label: 'Glioma Tumor',
    description: 'Infiltrative intra-axial neuroepithelial neoplasm originating from glial cells. Exhibits heterogeneous T2/FLAIR hyperintensity with mass effect and surrounding vasogenic edema.',
    typicalLocation: 'Frontal and temporal cerebral hemispheres (intra-axial)',
    riskLevel: 'Critical',
    color: '#ef4444', // Red
    clinicalRecommendations: [
      'Urgent neurosurgical consultation for stereotactic biopsy or maximal safe resection',
      'Recommend advanced multi-parametric MRI (Perfusion-weighted PWI and MR Spectroscopy)',
      'Molecular marker testing: IDH1/IDH2 mutation status, 1p/19q codeletion, MGMT promoter methylation',
      'Initiate anti-edema regimen (Dexamethasone) if significant mass effect or midline shift is observed'
    ]
  },
  meningioma: {
    label: 'Meningioma Tumor',
    description: 'Typically slow-growing, extra-axial mass arising from arachnoid cap cells of the meninges. Characterized by uniform contrast enhancement and classic "dural tail" sign.',
    typicalLocation: 'Parasagittal, convexity dura, sphenoid wing, or cerebellopontine angle',
    riskLevel: 'Moderate',
    color: '#f59e0b', // Amber
    clinicalRecommendations: [
      'Evaluate Simpson grade feasibility with neurosurgery team',
      'Assess cranial nerve involvement and venous sinus patency (MR Venography if abutting sagittal sinus)',
      'Consider stereotactic radiosurgery (Gamma Knife / CyberKnife) for skull base lesions or surgical candidates with co-morbidities',
      'Follow-up MRI in 3–6 months for surveillance if asymptomatic and non-compressive'
    ]
  },
  pituitary: {
    label: 'Pituitary Tumor',
    description: 'Sellar/parasellar neuroendocrine neoplasm (pituitary adenoma/PitNET). May exert superior mass effect on the optic chiasm causing bitemporal hemianopsia.',
    typicalLocation: 'Sella turcica with potential suprasellar extension into optic apparatus',
    riskLevel: 'High',
    color: '#8b5cf6', // Violet
    clinicalRecommendations: [
      'Immediate ophthalmology consult for formal visual field perimetry testing (Humphrey visual fields)',
      'Comprehensive endocrine panel: Prolactin, IGF-1, morning cortisol, ACTH, TSH, free T4, LH, FSH',
      'If prolactinoma is confirmed biochemically, initiate Dopamine Agonist therapy (Cabergoline)',
      'Evaluate for transsphenoidal endoscopic endonasal surgical decompression if visual compromise is present'
    ]
  },
  no_tumor: {
    label: 'No Tumor (Normal)',
    description: 'Bilateral brain parenchyma demonstrates normal architecture with symmetric cerebral hemispheres, sharp gray-white matter differentiation, and unremarkable ventricles.',
    typicalLocation: 'Normal physiological brain parenchyma',
    riskLevel: 'Low',
    color: '#10b981', // Emerald
    clinicalRecommendations: [
      'No evidence of intracranial space-occupying lesion, abnormal enhancement, or mass effect',
      'Routine clinical follow-up as clinically indicated by referring physician',
      'Correlate with non-neoplastic differentials if patient presents with focal neurological deficit'
    ]
  }
};

// Procedural realistic MRI scan generator for authentic visualization
export function generateSyntheticMriDataUrl(
  type: TumorClass,
  slicePlane: 'Axial' | 'Sagittal' | 'Coronal' = 'Axial',
  seedOffset: number = 0
): string {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const cx = 200;
  const cy = 200;

  // Background - dark air
  ctx.fillStyle = '#06090e';
  ctx.fillRect(0, 0, 400, 400);

  // Skull outline & scalp (T1/T2 MRI appearance)
  const rx = slicePlane === 'Sagittal' ? 140 : 130;
  const ry = slicePlane === 'Sagittal' ? 160 : 155;

  // Scalp subcutaneous fat (bright on T1)
  const scalpGrad = ctx.createRadialGradient(cx, cy, rx * 0.8, cx, cy, rx * 1.05);
  scalpGrad.addColorStop(0, '#1c2430');
  scalpGrad.addColorStop(0.85, '#475569');
  scalpGrad.addColorStop(0.95, '#94a3b8');
  scalpGrad.addColorStop(1, '#06090e');

  ctx.beginPath();
  ctx.ellipse(cx, cy, rx * 1.05, ry * 1.05, 0, 0, Math.PI * 2);
  ctx.fillStyle = scalpGrad;
  ctx.fill();

  // Cranium bone (dark cortical bone on MRI)
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx * 0.98, ry * 0.98, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0f16';
  ctx.fill();

  // Brain Parenchyma base
  const brainGrad = ctx.createRadialGradient(cx, cy, 20, cx, cy, rx * 0.92);
  brainGrad.addColorStop(0, '#334155');
  brainGrad.addColorStop(0.7, '#243042');
  brainGrad.addColorStop(0.95, '#192231');
  brainGrad.addColorStop(1, '#0f172a');

  ctx.beginPath();
  ctx.ellipse(cx, cy, rx * 0.92, ry * 0.92, 0, 0, Math.PI * 2);
  ctx.fillStyle = brainGrad;
  ctx.fill();

  // Sulci & Gyri convolutional patterns
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.7)';
  ctx.lineWidth = 2.5;
  for (let a = 0; a < Math.PI * 2; a += 0.25) {
    const r1 = (rx * 0.5) + Math.sin(a * 7 + seedOffset) * 15;
    const r2 = (rx * 0.88) + Math.cos(a * 5 + seedOffset) * 10;
    const x1 = cx + Math.cos(a) * r1;
    const y1 = cy + Math.sin(a) * r1;
    const x2 = cx + Math.cos(a) * r2;
    const y2 = cy + Math.sin(a) * r2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.bezierCurveTo(
      x1 + Math.sin(a) * 12, y1 - Math.cos(a) * 12,
      x2 - Math.sin(a) * 12, y2 + Math.cos(a) * 12,
      x2, y2
    );
    ctx.stroke();
  }

  // Midline interhemispheric fissure (Falx Cerebri)
  if (slicePlane === 'Axial' || slicePlane === 'Coronal') {
    ctx.strokeStyle = '#0d1522';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy - ry * 0.88);
    ctx.lineTo(cx, cy + ry * 0.88);
    ctx.stroke();

    // Lateral Ventricles (CSF - dark on T1, bright on T2)
    ctx.fillStyle = '#090d14';
    // Left ventricle
    ctx.beginPath();
    ctx.ellipse(cx - 24, cy - 10, 12, 38, -0.15, 0, Math.PI * 2);
    ctx.fill();
    // Right ventricle
    ctx.beginPath();
    ctx.ellipse(cx + 24, cy - 10, 12, 38, 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Anterior horns
    ctx.beginPath();
    ctx.ellipse(cx - 16, cy - 42, 7, 18, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 16, cy - 42, 7, 18, -0.2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Sagittal view structures (Corpus callosum, cerebellum, brainstem)
    ctx.fillStyle = '#475569';
    // Corpus callosum arch
    ctx.beginPath();
    ctx.arc(cx - 10, cy, 55, Math.PI * 1.1, Math.PI * 1.9);
    ctx.lineWidth = 9;
    ctx.strokeStyle = '#64748b';
    ctx.stroke();

    // Cerebellum
    ctx.beginPath();
    ctx.ellipse(cx + 40, cy + 85, 36, 26, 0.2, 0, Math.PI * 2);
    ctx.fillStyle = '#2d3b4e';
    ctx.fill();

    // Brainstem
    ctx.beginPath();
    ctx.ellipse(cx - 5, cy + 65, 18, 45, 0.1, 0, Math.PI * 2);
    ctx.fillStyle = '#38475c';
    ctx.fill();
  }

  // Inject Tumor Patches according to diagnosis
  if (type === 'glioma') {
    // Glioma: Infiltrative, irregular margins, hyperintense necrotic core + vasogenic edema
    const tx = cx + 55 + (seedOffset % 15);
    const ty = cy - 25 - (seedOffset % 10);
    const rad = 42;

    // Peritumoral vasogenic edema (hyperintense border)
    const edemaGrad = ctx.createRadialGradient(tx, ty, rad * 0.3, tx, ty, rad * 1.5);
    edemaGrad.addColorStop(0, 'rgba(226, 232, 240, 0.95)');
    edemaGrad.addColorStop(0.5, 'rgba(148, 163, 184, 0.8)');
    edemaGrad.addColorStop(0.85, 'rgba(71, 85, 105, 0.5)');
    edemaGrad.addColorStop(1, 'transparent');

    ctx.beginPath();
    ctx.ellipse(tx, ty, rad * 1.4, rad * 1.1, 0.35, 0, Math.PI * 2);
    ctx.fillStyle = edemaGrad;
    ctx.fill();

    // Infiltrative lobulated mass
    ctx.beginPath();
    ctx.fillStyle = '#f8fafc';
    ctx.ellipse(tx, ty, rad * 0.85, rad * 0.7, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Central necrosis
    ctx.beginPath();
    ctx.fillStyle = '#334155';
    ctx.ellipse(tx + 4, ty - 3, rad * 0.35, rad * 0.3, -0.2, 0, Math.PI * 2);
    ctx.fill();

  } else if (type === 'meningioma') {
    // Meningioma: Sharp, round/oval extra-axial lesion abutting the skull dural boundary
    const tx = cx - (slicePlane === 'Sagittal' ? 65 : 75);
    const ty = cy + 20;
    const rad = 34;

    // Dural tail attachment
    ctx.beginPath();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#e2e8f0';
    ctx.moveTo(tx - 30, ty - 45);
    ctx.bezierCurveTo(tx - 25, ty - 15, tx - 25, ty + 25, tx - 30, ty + 50);
    ctx.stroke();

    // Well-circumscribed hyperintense enhancing mass
    const meningGrad = ctx.createRadialGradient(tx, ty, 5, tx, ty, rad);
    meningGrad.addColorStop(0, '#ffffff');
    meningGrad.addColorStop(0.8, '#cbd5e1');
    meningGrad.addColorStop(1, '#64748b');

    ctx.beginPath();
    ctx.ellipse(tx, ty, rad, rad * 0.95, -0.1, 0, Math.PI * 2);
    ctx.fillStyle = meningGrad;
    ctx.fill();

    // Calcification speckles
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(tx - 6, ty - 5, 3, 3);
    ctx.fillRect(tx + 8, ty + 4, 2, 2);

  } else if (type === 'pituitary') {
    // Pituitary: Central sellar/suprasellar mass at skull base
    const tx = cx;
    const ty = cy + 45;
    const rad = 28;

    // Sellar enlargement
    const pitGrad = ctx.createRadialGradient(tx, ty, 4, tx, ty, rad);
    pitGrad.addColorStop(0, '#ffffff');
    pitGrad.addColorStop(0.7, '#e2e8f0');
    pitGrad.addColorStop(1, '#94a3b8');

    ctx.beginPath();
    ctx.ellipse(tx, ty, rad * 1.1, rad * 0.88, 0, 0, Math.PI * 2);
    ctx.fillStyle = pitGrad;
    ctx.fill();

    // Suprasellar extension notch
    ctx.beginPath();
    ctx.ellipse(tx, ty - 14, rad * 0.55, rad * 0.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#f1f5f9';
    ctx.fill();

  } else {
    // Normal / No tumor: clear anatomical symmetry, no abnormal contrast enhancement
    // Slightly highlight clear normal CSF ventricles
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - 50, cy - 50, 100, 100);
  }

  // Scan noise / texture (MRI Rician / Gaussian noise simulation)
  const imgData = ctx.getImageData(0, 0, 400, 400);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 0) {
      const noise = (Math.random() - 0.5) * 12;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
  }
  ctx.putImageData(imgData, 0, 0);

  // Add radiological orientation labels (R, L, A, P, S, I)
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
  if (slicePlane === 'Axial' || slicePlane === 'Coronal') {
    ctx.fillText('R', 15, 204);
    ctx.fillText('L', 375, 204);
    ctx.fillText('A', 196, 25);
    ctx.fillText('P', 196, 385);
  } else {
    ctx.fillText('A', 15, 204);
    ctx.fillText('P', 375, 204);
    ctx.fillText('S', 196, 25);
    ctx.fillText('I', 196, 385);
  }

  // Acquisition metadata watermark in corner
  ctx.font = '9px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(100, 116, 139, 0.6)';
  ctx.fillText('NEUROCLASS MR-3T', 15, 30);
  ctx.fillText(`SEQ: ${slicePlane.toUpperCase()}`, 15, 42);

  return canvas.toDataURL('image/png');
}

// Compute Real-Time Deep Learning Simulation Prediction & Feature Activation
export function predictMriScan(
  imageElement: HTMLImageElement | HTMLCanvasElement,
  selectedModel: string = 'ResNet-50'
): Promise<ModelPrediction> {
  return new Promise((resolve) => {
    // Read pixel data from image
    const canvas = document.createElement('canvas');
    canvas.width = 224;
    canvas.height = 224;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(imageElement, 0, 0, 224, 224);
    const imgData = ctx.getImageData(0, 0, 224, 224);
    const pixels = imgData.data;

    // Feature analysis based on intensity quadrants, central brightness, and perimeter density
    let totalIntensity = 0;
    let centralIntensity = 0;
    let leftQuadrantIntensity = 0;
    let rightQuadrantIntensity = 0;
    let lowerCentralIntensity = 0;
    let maxPixelVal = 0;
    let maxCoord = { x: 112, y: 112 };

    const cx = 112;
    const cy = 112;

    for (let y = 0; y < 224; y++) {
      for (let x = 0; x < 224; x++) {
        const idx = (y * 224 + x) * 4;
        const val = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;
        totalIntensity += val;

        const distFromCenter = Math.hypot(x - cx, y - cy);
        if (distFromCenter < 50) {
          centralIntensity += val;
        }

        if (x < cx - 15) {
          leftQuadrantIntensity += val;
        } else if (x > cx + 15) {
          rightQuadrantIntensity += val;
        }

        if (Math.abs(x - cx) < 35 && y > cy + 10 && y < cy + 60) {
          lowerCentralIntensity += val;
        }

        if (val > maxPixelVal && distFromCenter < 90) {
          maxPixelVal = val;
          maxCoord = { x, y };
        }
      }
    }

    const asymmetry = Math.abs(leftQuadrantIntensity - rightQuadrantIntensity) / (leftQuadrantIntensity + rightQuadrantIntensity + 1);
    const sellarRatio = lowerCentralIntensity / (centralIntensity + 1);

    // Classification scores logic
    let gliomaScore = 0.15;
    let meningiomaScore = 0.15;
    let pituitaryScore = 0.15;
    let noTumorScore = 0.15;

    // Asymmetry is characteristic of hemispheric Glioma or Meningioma
    if (asymmetry > 0.08) {
      if (maxCoord.x > cx) {
        gliomaScore += 0.55 + asymmetry * 2;
        meningiomaScore += 0.2;
      } else {
        meningiomaScore += 0.6 + asymmetry * 2;
        gliomaScore += 0.15;
      }
    } else if (sellarRatio > 0.45 && maxCoord.y > cy) {
      pituitaryScore += 0.65;
      gliomaScore += 0.1;
      meningiomaScore += 0.1;
    } else {
      noTumorScore += 0.65;
      gliomaScore += 0.1;
      meningiomaScore += 0.1;
      pituitaryScore += 0.1;
    }

    // Model specific boost/tuning
    let modelLatency = 34;
    let modelConfidenceBoost = 0.05;
    if (selectedModel === 'Custom CNN') {
      modelLatency = 18;
      modelConfidenceBoost = -0.02;
    } else if (selectedModel === 'MobileNet-V2') {
      modelLatency = 12;
      modelConfidenceBoost = 0.01;
    } else if (selectedModel === 'EfficientNet-B0') {
      modelLatency = 22;
      modelConfidenceBoost = 0.03;
    }

    // Apply Softmax normalization
    const expG = Math.exp(gliomaScore * 3.5);
    const expM = Math.exp(meningiomaScore * 3.5);
    const expP = Math.exp(pituitaryScore * 3.5);
    const expN = Math.exp(noTumorScore * 3.5);
    const sumExp = expG + expM + expP + expN;

    let pG = Math.round((expG / sumExp) * 1000) / 1000;
    let pM = Math.round((expM / sumExp) * 1000) / 1000;
    let pP = Math.round((expP / sumExp) * 1000) / 1000;
    let pN = Math.round((expN / sumExp) * 1000) / 1000;

    const probMap: Record<TumorClass, number> = {
      glioma: pG,
      meningioma: pM,
      pituitary: pP,
      no_tumor: pN
    };

    // Determine top class
    let bestClass: TumorClass = 'no_tumor';
    let bestProb = 0;
    for (const cls of Object.keys(probMap) as TumorClass[]) {
      if (probMap[cls] > bestProb) {
        bestProb = probMap[cls];
        bestClass = cls;
      }
    }

    // Uncertainty via Shannon Entropy
    const entropy = -(
      (pG * Math.log2(pG + 0.0001)) +
      (pM * Math.log2(pM + 0.0001)) +
      (pP * Math.log2(pP + 0.0001)) +
      (pN * Math.log2(pN + 0.0001))
    ) / 2.0;

    // ROI bounding box estimation from coordinates
    const scaleFactor = 400 / 224;
    const roiCenterX = Math.round(maxCoord.x * scaleFactor);
    const roiCenterY = Math.round(maxCoord.y * scaleFactor);

    let roiW = 60;
    let roiH = 60;
    if (bestClass === 'glioma') {
      roiW = 84;
      roiH = 74;
    } else if (bestClass === 'meningioma') {
      roiW = 68;
      roiH = 64;
    } else if (bestClass === 'pituitary') {
      roiW = 56;
      roiH = 48;
    } else {
      roiW = 0;
      roiH = 0;
    }

    const estimatedAreaMm2 = Math.round(roiW * roiH * 0.8 * 0.8 * 0.785); // ellipse approx
    const estimatedDiameterMm = Math.round(Math.max(roiW, roiH) * 0.8 * 10) / 10;

    // Priority tier
    let triagePriority: ModelPrediction['triagePriority'] = 'Normal Priority';
    let triageColor = '#10b981';
    if (bestClass === 'glioma' && bestProb > 0.7) {
      triagePriority = 'STAT (Immediate Review)';
      triageColor = '#ef4444';
    } else if (bestClass === 'pituitary' || (bestClass === 'glioma' && bestProb <= 0.7)) {
      triagePriority = 'Semi-Urgent';
      triageColor = '#f59e0b';
    } else if (bestClass === 'meningioma') {
      triagePriority = 'Routine';
      triageColor = '#3b82f6';
    }

    const probabilities: ClassProbability[] = (['glioma', 'meningioma', 'pituitary', 'no_tumor'] as TumorClass[]).map((cls) => {
      const meta = TUMOR_CLASSES_METADATA[cls];
      return {
        className: cls,
        label: meta.label,
        probability: probMap[cls],
        description: meta.description,
        typicalLocation: meta.typicalLocation,
        riskLevel: meta.riskLevel,
        color: meta.color
      };
    }).sort((a, b) => b.probability - a.probability);

    // Simulate inference delay
    setTimeout(() => {
      resolve({
        predictedClass: bestClass,
        label: TUMOR_CLASSES_METADATA[bestClass].label,
        confidence: bestProb,
        uncertaintyScore: Math.round(entropy * 100) / 100,
        triagePriority,
        triageColor,
        probabilities,
        inferenceTimeMs: modelLatency,
        modelUsed: selectedModel,
        gradCamRoi: {
          x: Math.max(10, roiCenterX - roiW / 2),
          y: Math.max(10, roiCenterY - roiH / 2),
          width: roiW,
          height: roiH,
          estimatedAreaMm2,
          estimatedDiameterMm,
          maxIntensityCoord: { x: roiCenterX, y: roiCenterY }
        }
      });
    }, 280);
  });
}

// Colormap mapping for Grad-CAM
export function getColormapRgb(val: number, map: 'jet' | 'inferno' | 'turbo' | 'viridis'): [number, number, number] {
  const t = Math.max(0, Math.min(1, val));

  if (map === 'jet') {
    // 0: Blue, 0.35: Cyan, 0.5: Green, 0.75: Yellow, 1.0: Red
    let r = 0, g = 0, b = 0;
    if (t < 0.125) {
      r = 0; g = 0; b = 0.5 + t * 4;
    } else if (t < 0.375) {
      r = 0; g = (t - 0.125) * 4; b = 1;
    } else if (t < 0.625) {
      r = (t - 0.375) * 4; g = 1; b = 1 - (t - 0.375) * 4;
    } else if (t < 0.875) {
      r = 1; g = 1 - (t - 0.625) * 4; b = 0;
    } else {
      r = 1 - (t - 0.875) * 2; g = 0; b = 0;
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  if (map === 'inferno') {
    const r = Math.min(255, Math.round(Math.pow(t, 0.7) * 255 * 1.1));
    const g = Math.min(255, Math.round(Math.pow(t, 1.7) * 240));
    const b = Math.min(255, Math.round(Math.sin(t * Math.PI) * 160 + t * 40));
    return [r, g, b];
  }

  if (map === 'turbo') {
    const r = Math.min(255, Math.round(Math.sin((t - 0.2) * Math.PI) * 200 + 55));
    const g = Math.min(255, Math.round(Math.sin(t * Math.PI) * 255));
    const b = Math.min(255, Math.round(Math.sin((1 - t) * Math.PI) * 230));
    return [Math.max(0, r), Math.max(0, g), Math.max(0, b)];
  }

  // Viridis default
  const r = Math.round((0.26 + 0.7 * t) * 255);
  const g = Math.round((0.15 + 0.8 * Math.sin(t * Math.PI * 0.8)) * 255);
  const b = Math.round((0.33 + 0.5 * (1 - t)) * 255);
  return [Math.min(255, r), Math.min(255, g), Math.min(255, b)];
}

// Generate Grad-CAM Heatmap overlay onto a canvas
export function renderGradCamOverlay(
  targetCanvas: HTMLCanvasElement,
  roi: ModelPrediction['gradCamRoi'],
  hasTumor: boolean,
  colormap: 'jet' | 'inferno' | 'turbo' | 'viridis' = 'jet',
  opacity: number = 0.65
) {
  const ctx = targetCanvas.getContext('2d');
  if (!ctx) return;

  const w = targetCanvas.width;
  const h = targetCanvas.height;

  ctx.clearRect(0, 0, w, h);

  if (!hasTumor || opacity <= 0.01) return;

  const heatImg = ctx.createImageData(w, h);
  const data = heatImg.data;

  const { maxIntensityCoord, width: rw, height: rh } = roi;
  const spreadX = Math.max(25, rw * 0.7);
  const spreadY = Math.max(25, rh * 0.7);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (x - maxIntensityCoord.x) / spreadX;
      const dy = (y - maxIntensityCoord.y) / spreadY;
      const distSq = dx * dx + dy * dy;
      
      // Gaussian distribution for CAM activation map
      const activation = Math.exp(-distSq * 1.8);

      if (activation > 0.08) {
        const [r, g, b] = getColormapRgb(activation, colormap);
        const idx = (y * w + x) * 4;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = Math.round(activation * opacity * 255);
      }
    }
  }

  ctx.putImageData(heatImg, 0, 0);
}

// Image Filters: Sobel Edge, Window/Level adjustments
export function applyRadiologyFilter(
  sourceCanvas: HTMLCanvasElement,
  destinationCanvas: HTMLCanvasElement,
  filterType: 'standard' | 'contrast' | 'bone' | 'sobel' | 'invert'
) {
  const sCtx = sourceCanvas.getContext('2d');
  const dCtx = destinationCanvas.getContext('2d');
  if (!sCtx || !dCtx) return;

  const w = sourceCanvas.width;
  const h = sourceCanvas.height;
  destinationCanvas.width = w;
  destinationCanvas.height = h;

  const srcData = sCtx.getImageData(0, 0, w, h);
  const dstData = dCtx.createImageData(w, h);
  const src = srcData.data;
  const dst = dstData.data;

  if (filterType === 'invert') {
    for (let i = 0; i < src.length; i += 4) {
      dst[i] = 255 - src[i];
      dst[i + 1] = 255 - src[i + 1];
      dst[i + 2] = 255 - src[i + 2];
      dst[i + 3] = src[i + 3];
    }
  } else if (filterType === 'contrast') {
    // High contrast window
    const factor = 1.6;
    for (let i = 0; i < src.length; i += 4) {
      dst[i] = Math.min(255, Math.max(0, (src[i] - 128) * factor + 128));
      dst[i + 1] = Math.min(255, Math.max(0, (src[i + 1] - 128) * factor + 128));
      dst[i + 2] = Math.min(255, Math.max(0, (src[i + 2] - 128) * factor + 128));
      dst[i + 3] = src[i + 3];
    }
  } else if (filterType === 'bone') {
    // Bone window / threshold
    for (let i = 0; i < src.length; i += 4) {
      const lum = 0.299 * src[i] + 0.587 * src[i + 1] + 0.114 * src[i + 2];
      const val = lum > 130 ? Math.min(255, (lum - 130) * 2.2) : lum * 0.3;
      dst[i] = val;
      dst[i + 1] = val;
      dst[i + 2] = val;
      dst[i + 3] = src[i + 3];
    }
  } else if (filterType === 'sobel') {
    // 3x3 Sobel edge filter to inspect lesion boundaries
    const grayscale = new Float32Array(w * h);
    for (let i = 0; i < src.length; i += 4) {
      grayscale[i / 4] = (src[i] + src[i + 1] + src[i + 2]) / 3;
    }

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = y * w + x;
        // Gx
        const gx =
          -1 * grayscale[idx - w - 1] + 1 * grayscale[idx - w + 1] +
          -2 * grayscale[idx - 1]     + 2 * grayscale[idx + 1] +
          -1 * grayscale[idx + w - 1] + 1 * grayscale[idx + w + 1];
        // Gy
        const gy =
          -1 * grayscale[idx - w - 1] - 2 * grayscale[idx - w] - 1 * grayscale[idx - w + 1] +
           1 * grayscale[idx + w - 1] + 2 * grayscale[idx + w] + 1 * grayscale[idx + w + 1];

        const mag = Math.min(255, Math.hypot(gx, gy) * 1.4);
        const pIdx = idx * 4;
        // Cyan-tinted edge for medical HUD look
        dst[pIdx] = mag * 0.4;
        dst[pIdx + 1] = mag * 0.9;
        dst[pIdx + 2] = mag;
        dst[pIdx + 3] = 255;
      }
    }
  } else {
    // Standard passthrough
    dst.set(src);
  }

  dCtx.putImageData(dstData, 0, 0);
}
