export type TumorClass = 'glioma' | 'meningioma' | 'pituitary' | 'no_tumor';

export interface ClassProbability {
  className: TumorClass;
  label: string;
  probability: number;
  description: string;
  typicalLocation: string;
  riskLevel: 'Critical' | 'High' | 'Moderate' | 'Low';
  color: string;
}

export interface ModelPrediction {
  predictedClass: TumorClass;
  label: string;
  confidence: number;
  uncertaintyScore: number;
  triagePriority: 'STAT (Immediate Review)' | 'Semi-Urgent' | 'Routine' | 'Normal Priority';
  triageColor: string;
  probabilities: ClassProbability[];
  inferenceTimeMs: number;
  modelUsed: string;
  gradCamRoi: {
    x: number;
    y: number;
    width: number;
    height: number;
    estimatedAreaMm2: number;
    estimatedDiameterMm: number;
    maxIntensityCoord: { x: number; y: number };
  };
}

export interface SampleMri {
  id: string;
  name: string;
  patientId: string;
  age: number;
  gender: 'M' | 'F';
  groundTruth: TumorClass;
  slicePlane: 'Axial' | 'Sagittal' | 'Coronal';
  sequence: 'T1-CE (Contrast Enhanced)' | 'T2-Weighted' | 'FLAIR';
  imageUrl: string;
  findings: string;
}

export interface PatientInfo {
  patientId: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  scanDate: string;
  sequence: string;
  institution: string;
  referringPhysician: string;
}

export interface ModelMetrics {
  id: string;
  name: string;
  type: 'Custom CNN' | 'Transfer Learning';
  backbone: string;
  parameters: string;
  modelSizeMb: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  latencyMs: number;
  epochsTrained: number;
  bestValidationLoss: number;
  description: string;
  pros: string[];
  cons: string[];
}

export interface ConfusionMatrixData {
  classes: TumorClass[];
  labels: string[];
  matrix: number[][]; // [Actual][Predicted]
  perClassMetrics: Record<TumorClass, {
    precision: number;
    recall: number;
    f1: number;
    support: number;
  }>;
}

export interface EpochLog {
  epoch: number;
  trainLoss: number;
  valLoss: number;
  trainAcc: number;
  valAcc: number;
}
