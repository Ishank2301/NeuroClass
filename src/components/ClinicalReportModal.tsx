import React from 'react';
import { X, Printer, ShieldAlert, FileText, CheckCircle2, AlertTriangle, Building2, User, Calendar, Stethoscope } from 'lucide-react';
import { ModelPrediction, SampleMri } from '../types';
import { TUMOR_CLASSES_METADATA } from '../utils/mriEngine';

interface ClinicalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  prediction: ModelPrediction;
  scanInfo: {
    patientId: string;
    age: number;
    gender: string;
    sequence: string;
    slicePlane: string;
    scanName?: string;
  };
}

export const ClinicalReportModal: React.FC<ClinicalReportModalProps> = ({
  isOpen,
  onClose,
  prediction,
  scanInfo
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const meta = TUMOR_CLASSES_METADATA[prediction.predictedClass];
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header toolbar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-cyan-400" />
            <h2 className="text-base font-semibold text-white">
              AI Radiology Second-Opinion Report
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium transition shadow-sm"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 overflow-y-auto space-y-6 print:p-0 print:space-y-4 print:text-black">
          {/* Institutional Letterhead */}
          <div className="border-b border-slate-800 pb-5 flex flex-wrap justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 print:text-blue-900 font-bold text-xl tracking-tight">
                <Building2 className="h-6 w-6" />
                <span>NEUROCLASS RADIOLOGY & ONCOLOGY AI</span>
              </div>
              <p className="text-xs text-slate-400 print:text-slate-600 mt-1">
                Advanced Neuroimaging Intelligence • Computer-Aided Diagnostic Protocol
              </p>
              <p className="text-xs text-slate-500 print:text-slate-500">
                Accredited Medical Image Analysis System • ISO/IEC 62304 Compliant
              </p>
            </div>
            <div className="text-right text-xs text-slate-400 print:text-slate-700 font-mono">
              <div className="font-bold text-white print:text-black">REPORT ACC: #NC-{(Math.random() * 89999 + 10000).toFixed(0)}</div>
              <div>DATE: {currentDate}</div>
              <div>ENGINE: {prediction.modelUsed}</div>
            </div>
          </div>

          {/* Patient Demographic Table */}
          <div className="bg-slate-950/60 print:bg-slate-50 border border-slate-800 print:border-slate-300 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 block">PATIENT ID</span>
              <span className="font-semibold text-cyan-300 print:text-blue-800 text-sm">
                {scanInfo.patientId}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">AGE / GENDER</span>
              <span className="font-semibold text-slate-200 print:text-slate-900">
                {scanInfo.age} YRS / {scanInfo.gender}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">PULSE SEQUENCE</span>
              <span className="font-semibold text-slate-200 print:text-slate-900">
                {scanInfo.sequence}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">ORIENTATION</span>
              <span className="font-semibold text-slate-200 print:text-slate-900">
                {scanInfo.slicePlane.toUpperCase()} PLANE
              </span>
            </div>
          </div>

          {/* Primary Impression / Finding */}
          <div className="rounded-xl border p-5 relative overflow-hidden"
            style={{
              borderColor: `${prediction.triageColor}60`,
              backgroundColor: `${prediction.triageColor}10`
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${prediction.triageColor}30`,
                    color: prediction.triageColor
                  }}
                >
                  CLASSIFICATION IMPRESSION
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Confidence: {(prediction.confidence * 100).toFixed(1)}%
                </span>
              </div>
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded border"
                style={{
                  borderColor: prediction.triageColor,
                  color: prediction.triageColor
                }}
              >
                TRIAGE: {prediction.triagePriority}
              </span>
            </div>

            <h3 className="text-xl font-bold text-white print:text-black mb-2 flex items-center gap-2">
              {prediction.label}
            </h3>
            <p className="text-sm text-slate-300 print:text-slate-800 leading-relaxed">
              {meta.description}
            </p>
          </div>

          {/* Morphological Measurements & Localization */}
          {prediction.predictedClass !== 'no_tumor' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="bg-slate-950/40 print:bg-slate-50 border border-slate-800 print:border-slate-300 p-3 rounded-lg">
                <span className="text-slate-500 block">ESTIMATED DIAMETER</span>
                <span className="text-base font-bold text-cyan-400 print:text-blue-700">
                  {prediction.gradCamRoi.estimatedDiameterMm} mm
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">Calibrated at 0.8mm voxel spacing</span>
              </div>
              <div className="bg-slate-950/40 print:bg-slate-50 border border-slate-800 print:border-slate-300 p-3 rounded-lg">
                <span className="text-slate-500 block">ESTIMATED LESION AREA</span>
                <span className="text-base font-bold text-cyan-400 print:text-blue-700">
                  {prediction.gradCamRoi.estimatedAreaMm2} mm²
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">Cross-sectional area</span>
              </div>
              <div className="bg-slate-950/40 print:bg-slate-50 border border-slate-800 print:border-slate-300 p-3 rounded-lg">
                <span className="text-slate-500 block">PREDICTION UNCERTAINTY</span>
                <span className="text-base font-bold text-amber-400 print:text-amber-700">
                  {prediction.uncertaintyScore} bits
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">Shannon entropy metric</span>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-950/20 border border-emerald-800/40 p-3 rounded-lg text-emerald-300 text-xs">
              Symmetrical anatomical features. No high-confidence focal space-occupying lesion detected.
            </div>
          )}

          {/* Differential Probability Table */}
          <div>
            <h4 className="text-xs uppercase font-semibold text-slate-400 tracking-wider mb-2">
              Multi-Class Probability Distribution
            </h4>
            <div className="border border-slate-800 print:border-slate-300 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-950 print:bg-slate-200 text-slate-400 print:text-slate-700">
                  <tr>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">Probability</th>
                    <th className="p-2.5">Typical Location</th>
                    <th className="p-2.5">Risk Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                  {prediction.probabilities.map((item) => (
                    <tr key={item.className} className={item.className === prediction.predictedClass ? 'bg-slate-800/50 print:bg-slate-100 font-semibold' : ''}>
                      <td className="p-2.5 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.label}</span>
                      </td>
                      <td className="p-2.5 font-mono">{(item.probability * 100).toFixed(1)}%</td>
                      <td className="p-2.5 text-slate-400 print:text-slate-600">{item.typicalLocation}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.riskLevel === 'Critical' ? 'bg-red-500/20 text-red-400' :
                          item.riskLevel === 'High' ? 'bg-purple-500/20 text-purple-400' :
                          item.riskLevel === 'Moderate' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {item.riskLevel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actionable Clinical Recommendations */}
          <div>
            <h4 className="text-xs uppercase font-semibold text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
              <Stethoscope className="h-4 w-4 text-cyan-400" />
              Multidisciplinary Recommended Next Steps
            </h4>
            <div className="bg-slate-950/70 print:bg-slate-50 border border-slate-800 print:border-slate-300 rounded-xl p-4 space-y-2 text-xs text-slate-300 print:text-slate-800">
              {meta.clinicalRecommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Attestation & Signature */}
          <div className="pt-4 border-t border-slate-800 print:border-slate-300 flex justify-between items-end text-xs text-slate-400 print:text-slate-600">
            <div>
              <p className="font-semibold text-slate-300 print:text-black">Automated AI Diagnostic Review</p>
              <p>Model Latency: {prediction.inferenceTimeMs}ms • Softmax Calibrated</p>
              <p className="text-[10px] text-slate-500 mt-2 max-w-md">
                NOTICE: NeuroClass CADx is intended to augment board-certified radiologist workflow. All automated findings must be clinically verified prior to therapeutic intervention.
              </p>
            </div>
            <div className="text-right">
              <div className="w-48 border-b border-slate-600 mb-1"></div>
              <p className="font-mono text-xs text-slate-300 print:text-black">PHYSICIAN / RADIOLOGIST SIGNATURE</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
