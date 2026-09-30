import { SampleMri } from '../types';
import { generateSyntheticMriDataUrl } from '../utils/mriEngine';

// Pre-generated clinical case library
export const SAMPLE_SCANS: SampleMri[] = [
  {
    id: 'case-glioma-01',
    name: 'Case GL-104: High-Grade Glioblastoma',
    patientId: 'PT-9021-GL',
    age: 58,
    gender: 'M',
    groundTruth: 'glioma',
    slicePlane: 'Axial',
    sequence: 'T1-CE (Contrast Enhanced)',
    imageUrl: generateSyntheticMriDataUrl('glioma', 'Axial', 12),
    findings: 'Right fronto-parietal heterogeneously enhancing infiltrative mass with irregular rim enhancement, central necrotic core, and surrounding vasogenic edema with 4mm midline shift.'
  },
  {
    id: 'case-glioma-02',
    name: 'Case GL-209: Low-Grade Diffuse Astrocytoma',
    patientId: 'PT-4109-GL',
    age: 39,
    gender: 'F',
    groundTruth: 'glioma',
    slicePlane: 'Coronal',
    sequence: 'T2-Weighted',
    imageUrl: generateSyntheticMriDataUrl('glioma', 'Coronal', 44),
    findings: 'Left temporal lobe hyperintense mass without marked nodular enhancement; mild effacement of the temporal horn of the lateral ventricle.'
  },
  {
    id: 'case-meningioma-01',
    name: 'Case MN-301: Parasagittal Meningioma',
    patientId: 'PT-7832-MN',
    age: 62,
    gender: 'F',
    groundTruth: 'meningioma',
    slicePlane: 'Axial',
    sequence: 'T1-CE (Contrast Enhanced)',
    imageUrl: generateSyntheticMriDataUrl('meningioma', 'Axial', 18),
    findings: 'Extra-axial sharply delineated, homogenously enhancing dural-based mass along the right convexity with prominent dural tail sign and broad cortical indentation.'
  },
  {
    id: 'case-meningioma-02',
    name: 'Case MN-415: Sphenoid Wing Meningioma',
    patientId: 'PT-2290-MN',
    age: 51,
    gender: 'M',
    groundTruth: 'meningioma',
    slicePlane: 'Sagittal',
    sequence: 'T1-CE (Contrast Enhanced)',
    imageUrl: generateSyntheticMriDataUrl('meningioma', 'Sagittal', 81),
    findings: 'Circumscribed extra-axial lesion abutting the left sphenoid ridge, exerting mild mass effect upon the adjacent anterior temporal pole.'
  },
  {
    id: 'case-pituitary-01',
    name: 'Case PT-501: Pituitary Macroadenoma',
    patientId: 'PT-6614-PA',
    age: 46,
    gender: 'M',
    groundTruth: 'pituitary',
    slicePlane: 'Coronal',
    sequence: 'T1-CE (Contrast Enhanced)',
    imageUrl: generateSyntheticMriDataUrl('pituitary', 'Coronal', 5),
    findings: 'Enlarged sella turcica filled with soft-tissue isointense mass extending superiorly into the suprasellar cistern, causing compression and elevation of the optic chiasm.'
  },
  {
    id: 'case-pituitary-02',
    name: 'Case PT-612: Invasive Pituitary Adenoma',
    patientId: 'PT-3308-PA',
    age: 54,
    gender: 'F',
    groundTruth: 'pituitary',
    slicePlane: 'Sagittal',
    sequence: 'T2-Weighted',
    imageUrl: generateSyntheticMriDataUrl('pituitary', 'Sagittal', 37),
    findings: 'Sellar/parasellar lesion exhibiting focal Knosp Grade 2 cavernous sinus engagement, minimal sphenoid sinus invasion, and visual pathway abutment.'
  },
  {
    id: 'case-normal-01',
    name: 'Case NL-001: Unremarkable Brain MRI',
    patientId: 'PT-1002-NL',
    age: 32,
    gender: 'F',
    groundTruth: 'no_tumor',
    slicePlane: 'Axial',
    sequence: 'T1-CE (Contrast Enhanced)',
    imageUrl: generateSyntheticMriDataUrl('no_tumor', 'Axial', 0),
    findings: 'Symmetrical cerebral hemispheres. No abnormal parenchymal signal intensity, mass effect, or pathological intracranial enhancement. Ventricles and basal cisterns are within normal limits.'
  },
  {
    id: 'case-normal-02',
    name: 'Case NL-002: Healthy Brain Control',
    patientId: 'PT-1008-NL',
    age: 41,
    gender: 'M',
    groundTruth: 'no_tumor',
    slicePlane: 'Sagittal',
    sequence: 'T2-Weighted',
    imageUrl: generateSyntheticMriDataUrl('no_tumor', 'Sagittal', 9),
    findings: 'Normal midline sagittal anatomy. Midline structures, corpus callosum, cerebellum, and 4th ventricle demonstrate preserved morphology without compression.'
  }
];
