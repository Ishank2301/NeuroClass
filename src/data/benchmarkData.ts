import { ModelMetrics, ConfusionMatrixData, EpochLog, TumorClass } from '../types';

export const COMPARATIVE_MODELS: ModelMetrics[] = [
  {
    id: 'resnet50',
    name: 'ResNet-50 (Transfer Learning)',
    type: 'Transfer Learning',
    backbone: 'ImageNet Pretrained + Dense Top',
    parameters: '25.6M',
    modelSizeMb: 98.2,
    accuracy: 0.978,
    precision: 0.976,
    recall: 0.974,
    f1Score: 0.975,
    latencyMs: 34,
    epochsTrained: 40,
    bestValidationLoss: 0.082,
    description: 'Deep residual architecture utilizing skip connections to eliminate vanishing gradients. Highest F1-score across all 4 tumor categories.',
    pros: ['Superb fine-grained feature extraction', 'Highest macro-averaged F1 (97.5%)', 'Robust against motion artifacts'],
    cons: ['Larger disk footprint (98MB)', 'Higher VRAM requirement for edge devices']
  },
  {
    id: 'custom-cnn',
    name: 'Custom CNN (Scratch)',
    type: 'Custom CNN',
    backbone: '4x Conv2D + BatchNorm + Dropout',
    parameters: '4.2M',
    modelSizeMb: 16.8,
    accuracy: 0.924,
    precision: 0.921,
    recall: 0.918,
    f1Score: 0.919,
    latencyMs: 18,
    epochsTrained: 50,
    bestValidationLoss: 0.235,
    description: 'Designed from scratch with 4 convolutional pooling blocks, batch normalization, 40% dropout, and dense classifier.',
    pros: ['Lightweight parameter budget (4.2M)', 'Fast training from scratch without ImageNet dependency', 'Low inference latency'],
    cons: ['Slightly lower recall on small pituitary adenomas', 'Higher variance across noisy slices']
  },
  {
    id: 'mobilenet-v2',
    name: 'MobileNet-V2 (Edge Optimized)',
    type: 'Transfer Learning',
    backbone: 'Inverted Residuals & Linear Bottlenecks',
    parameters: '2.8M',
    modelSizeMb: 11.2,
    accuracy: 0.952,
    precision: 0.950,
    recall: 0.949,
    f1Score: 0.949,
    latencyMs: 12,
    epochsTrained: 35,
    bestValidationLoss: 0.142,
    description: 'Ultra-lightweight architecture using depthwise separable convolutions tailored for mobile triage and point-of-care tablets.',
    pros: ['Blazing fast inference (12ms)', 'Lowest model footprint (11MB)', 'Perfect for tele-radiology & bedside triage'],
    cons: ['Marginal decrease in distinction between low-grade glioma and healthy parenchyma']
  },
  {
    id: 'efficientnet-b0',
    name: 'EfficientNet-B0',
    type: 'Transfer Learning',
    backbone: 'MBConv with Squeeze-and-Excitation',
    parameters: '4.8M',
    modelSizeMb: 19.5,
    accuracy: 0.967,
    precision: 0.965,
    recall: 0.964,
    f1Score: 0.964,
    latencyMs: 22,
    epochsTrained: 42,
    bestValidationLoss: 0.108,
    description: 'Compound scaling method balancing network depth, width, and image resolution with channel-wise squeeze-and-excitation attention.',
    pros: ['Ideal trade-off between speed and top-1 accuracy', 'High sensitivity for sub-centimeter lesions'],
    cons: ['Slightly slower convergence rate during fine-tuning']
  },
  {
    id: 'inception-v3',
    name: 'Inception-V3',
    type: 'Transfer Learning',
    backbone: 'Multi-scale Inception Modules',
    parameters: '22.8M',
    modelSizeMb: 92.4,
    accuracy: 0.961,
    precision: 0.958,
    recall: 0.960,
    f1Score: 0.959,
    latencyMs: 38,
    epochsTrained: 45,
    bestValidationLoss: 0.119,
    description: 'Employs asymmetric factorized convolutions (1x7, 7x1) to capture both microscopic cellular patterns and macro tumor borders.',
    pros: ['Strong multi-scale representation of irregular glioma borders'],
    cons: ['High memory latency on mobile platforms']
  }
];

// Confusion Matrix data for test set evaluation (1,311 clinical MRI scans)
export const CONFUSION_MATRICES: Record<string, ConfusionMatrixData> = {
  resnet50: {
    classes: ['glioma', 'meningioma', 'pituitary', 'no_tumor'],
    labels: ['Glioma', 'Meningioma', 'Pituitary', 'No Tumor'],
    // Rows: True Class [glioma, meningioma, pituitary, no_tumor]
    // Cols: Predicted Class [glioma, meningioma, pituitary, no_tumor]
    matrix: [
      [294, 6, 2, 4],   // True: Glioma (306 total)
      [7, 298, 3, 2],   // True: Meningioma (310 total)
      [1, 4, 321, 2],   // True: Pituitary (328 total)
      [3, 2, 2, 360]    // True: No Tumor (367 total)
    ],
    perClassMetrics: {
      glioma: { precision: 0.964, recall: 0.961, f1: 0.962, support: 306 },
      meningioma: { precision: 0.961, recall: 0.961, f1: 0.961, support: 310 },
      pituitary: { precision: 0.979, recall: 0.979, f1: 0.979, support: 328 },
      no_tumor: { precision: 0.978, recall: 0.981, f1: 0.980, support: 367 }
    }
  },
  'custom-cnn': {
    classes: ['glioma', 'meningioma', 'pituitary', 'no_tumor'],
    labels: ['Glioma', 'Meningioma', 'Pituitary', 'No Tumor'],
    matrix: [
      [276, 15, 6, 9],
      [16, 278, 9, 7],
      [8, 11, 301, 8],
      [10, 8, 5, 344]
    ],
    perClassMetrics: {
      glioma: { precision: 0.890, recall: 0.902, f1: 0.896, support: 306 },
      meningioma: { precision: 0.891, recall: 0.897, f1: 0.894, support: 310 },
      pituitary: { precision: 0.938, recall: 0.918, f1: 0.928, support: 328 },
      no_tumor: { precision: 0.935, recall: 0.937, f1: 0.936, support: 367 }
    }
  }
};

// ROC Curve coordinates [FPR, TPR] for multi-class evaluation
export const ROC_CURVES: Record<TumorClass, { auc: number; points: [number, number][] }> = {
  glioma: {
    auc: 0.989,
    points: [
      [0.0, 0.0], [0.01, 0.72], [0.02, 0.88], [0.04, 0.94], [0.08, 0.97],
      [0.15, 0.985], [0.3, 0.994], [0.6, 0.999], [1.0, 1.0]
    ]
  },
  meningioma: {
    auc: 0.986,
    points: [
      [0.0, 0.0], [0.015, 0.69], [0.03, 0.86], [0.05, 0.93], [0.1, 0.965],
      [0.2, 0.982], [0.4, 0.993], [0.7, 0.999], [1.0, 1.0]
    ]
  },
  pituitary: {
    auc: 0.994,
    points: [
      [0.0, 0.0], [0.005, 0.82], [0.015, 0.93], [0.03, 0.97], [0.06, 0.988],
      [0.12, 0.995], [0.3, 0.999], [1.0, 1.0]
    ]
  },
  no_tumor: {
    auc: 0.993,
    points: [
      [0.0, 0.0], [0.008, 0.79], [0.02, 0.92], [0.04, 0.965], [0.08, 0.985],
      [0.15, 0.994], [0.35, 0.999], [1.0, 1.0]
    ]
  }
};

// Epoch logs across 40 epochs for ResNet-50 training history
export const TRAINING_HISTORY_RESNET: EpochLog[] = [
  { epoch: 1, trainLoss: 1.18, valLoss: 0.94, trainAcc: 0.54, valAcc: 0.67 },
  { epoch: 4, trainLoss: 0.76, valLoss: 0.62, trainAcc: 0.72, valAcc: 0.78 },
  { epoch: 8, trainLoss: 0.49, valLoss: 0.41, trainAcc: 0.83, valAcc: 0.86 },
  { epoch: 12, trainLoss: 0.35, valLoss: 0.29, trainAcc: 0.89, valAcc: 0.90 },
  { epoch: 16, trainLoss: 0.26, valLoss: 0.22, trainAcc: 0.92, valAcc: 0.93 },
  { epoch: 20, trainLoss: 0.19, valLoss: 0.17, trainAcc: 0.94, valAcc: 0.94 },
  { epoch: 25, trainLoss: 0.14, valLoss: 0.13, trainAcc: 0.96, valAcc: 0.96 },
  { epoch: 30, trainLoss: 0.09, valLoss: 0.10, trainAcc: 0.97, valAcc: 0.97 },
  { epoch: 35, trainLoss: 0.06, valLoss: 0.09, trainAcc: 0.98, valAcc: 0.975 },
  { epoch: 40, trainLoss: 0.04, valLoss: 0.082, trainAcc: 0.99, valAcc: 0.978 }
];

export const DATASET_DISTRIBUTION = [
  { className: 'Glioma', trainCount: 826, valCount: 206, testCount: 306, total: 1338, color: '#ef4444' },
  { className: 'Meningioma', trainCount: 822, valCount: 205, testCount: 310, total: 1337, color: '#f59e0b' },
  { className: 'Pituitary', trainCount: 827, valCount: 207, testCount: 328, total: 1362, color: '#8b5cf6' },
  { className: 'No Tumor', trainCount: 914, valCount: 228, testCount: 367, total: 1509, color: '#10b981' }
];
