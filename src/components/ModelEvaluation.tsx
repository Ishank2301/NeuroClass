import React, { useState } from 'react';
import {
  BarChart2,
  TrendingUp,
  Cpu,
  Layers,
  Award,
  Zap,
  Info,
  CheckCircle2,
  Table,
  LineChart,
  Grid
} from 'lucide-react';
import {
  COMPARATIVE_MODELS,
  CONFUSION_MATRICES,
  ROC_CURVES,
  TRAINING_HISTORY_RESNET,
  DATASET_DISTRIBUTION
} from '../data/benchmarkData';
import { TumorClass } from '../types';

export const ModelEvaluation: React.FC = () => {
  const [selectedModelId, setSelectedModelId] = useState<string>('resnet50');
  const [hoveredMatrixCell, setHoveredMatrixCell] = useState<{
    trueClass: string;
    predClass: string;
    count: number;
    pct: string;
  } | null>(null);

  const activeModel = COMPARATIVE_MODELS.find((m) => m.id === selectedModelId) || COMPARATIVE_MODELS[0];
  const activeConfusionMatrix = CONFUSION_MATRICES[selectedModelId] || CONFUSION_MATRICES['resnet50'];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-[#111114] border border-[rgba(240,240,242,0.08)] p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="label-precision text-[10px]">
              EVALUATION BENCHMARK SUITE
            </span>
            <span className="text-[10px] text-[#f0f0f2]/40 font-mono uppercase tracking-wider">
              5,546 VERIFIED MRI SLICES
            </span>
          </div>
          <h1 className="font-syne text-xl sm:text-2xl font-bold text-[#f0f0f2] mt-1.5 uppercase tracking-tight">
            Deep Learning Performance & Comparative Analytics
          </h1>
          <p className="font-sans text-xs text-[#f0f0f2]/60 mt-1 max-w-3xl">
            Evaluate models trained from scratch versus transfer learning backbones across multi-class precision, recall, confusion matrices, ROC characteristics, and epoch loss histories.
          </p>
        </div>

        {/* Model Selector Pills */}
        <div className="flex items-center gap-1.5 bg-[#080809] p-1 border border-[rgba(240,240,242,0.08)] font-mono overflow-x-auto">
          {COMPARATIVE_MODELS.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedModelId(m.id)}
              className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition whitespace-nowrap ${
                selectedModelId === m.id
                  ? 'bg-[#00ffa3] text-[#080809] font-bold'
                  : 'text-[#f0f0f2]/50 hover:text-[#f0f0f2] hover:bg-white/[0.03]'
              }`}
            >
              {m.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Model Spec & KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-slate-500 text-[11px] block font-mono">TEST ACCURACY</span>
          <span className="text-2xl font-extrabold text-cyan-400 font-mono">
            {(activeModel.accuracy * 100).toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">1,311 test scans</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-slate-500 text-[11px] block font-mono">MACRO F1-SCORE</span>
          <span className="text-2xl font-extrabold text-emerald-400 font-mono">
            {(activeModel.f1Score * 100).toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">Balanced harmonic mean</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-slate-500 text-[11px] block font-mono">AVERAGE RECALL</span>
          <span className="text-2xl font-extrabold text-indigo-400 font-mono">
            {(activeModel.recall * 100).toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">High lesion sensitivity</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-slate-500 text-[11px] block font-mono">INFERENCE LATENCY</span>
          <span className="text-2xl font-extrabold text-amber-400 font-mono">
            {activeModel.latencyMs} ms
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">NVIDIA T4 / Edge</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-slate-500 text-[11px] block font-mono">PARAMETERS</span>
          <span className="text-2xl font-extrabold text-purple-400 font-mono">
            {activeModel.parameters}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">Weights size: {activeModel.modelSizeMb}MB</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <span className="text-slate-500 text-[11px] block font-mono">VALIDATION LOSS</span>
          <span className="text-2xl font-extrabold text-sky-400 font-mono">
            {activeModel.bestValidationLoss.toFixed(3)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1">Cross-entropy optimal</span>
        </div>
      </div>

      {/* Row 2: Confusion Matrix & ROC Curves */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Confusion Matrix (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Grid className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">
                  Multi-Class Confusion Matrix: {activeModel.name}
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                1,311 Test Samples
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Rows represent the Ground Truth pathological classification; Columns represent AI predicted classes. High diagonal saturation indicates near-zero diagnostic confusion.
            </p>

            {/* Matrix Grid */}
            <div className="mt-4 overflow-x-auto">
              <div className="min-w-[420px]">
                {/* Column Headers (Predicted) */}
                <div className="text-center font-mono text-[11px] text-cyan-400 font-bold mb-1">
                  PREDICTED CLASS →
                </div>
                <div className="grid grid-cols-5 gap-1.5 text-center text-xs font-mono">
                  <div className="p-2 font-bold text-slate-400 flex items-center justify-center">
                    TRUE ↓
                  </div>
                  {activeConfusionMatrix.labels.map((lbl) => (
                    <div key={lbl} className="p-2 bg-slate-950 font-semibold text-slate-300 rounded border border-slate-800/80">
                      {lbl}
                    </div>
                  ))}

                  {/* Rows */}
                  {activeConfusionMatrix.matrix.map((row, rIdx) => {
                    const rowClass = activeConfusionMatrix.labels[rIdx];
                    const rowSum = row.reduce((a, b) => a + b, 0);

                    return (
                      <React.Fragment key={rIdx}>
                        <div className="p-2 bg-slate-950 font-semibold text-slate-300 rounded border border-slate-800/80 flex items-center justify-center">
                          {rowClass}
                        </div>
                        {row.map((val, cIdx) => {
                          const isDiagonal = rIdx === cIdx;
                          const intensity = val / rowSum;
                          const predClass = activeConfusionMatrix.labels[cIdx];

                          return (
                            <div
                              key={cIdx}
                              onMouseEnter={() =>
                                setHoveredMatrixCell({
                                  trueClass: rowClass,
                                  predClass,
                                  count: val,
                                  pct: `${(intensity * 100).toFixed(1)}%`
                                })
                              }
                              onMouseLeave={() => setHoveredMatrixCell(null)}
                              className={`p-3 rounded border font-bold flex flex-col items-center justify-center transition cursor-pointer ${
                                isDiagonal
                                  ? 'bg-cyan-500/25 border-cyan-500/50 text-cyan-200 hover:bg-cyan-500/40'
                                  : val > 0
                                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                                  : 'bg-slate-950/40 border-slate-800/60 text-slate-600'
                              }`}
                            >
                              <span className="text-sm">{val}</span>
                              <span className="text-[10px] opacity-75 font-normal">
                                {(intensity * 100).toFixed(0)}%
                              </span>
                            </div>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Matrix Cell Inspector Callout */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs font-mono flex items-center justify-between text-slate-400">
            {hoveredMatrixCell ? (
              <span className="text-cyan-300">
                True: <strong>{hoveredMatrixCell.trueClass}</strong> | Predicted: <strong>{hoveredMatrixCell.predClass}</strong> → {hoveredMatrixCell.count} scans ({hoveredMatrixCell.pct})
              </span>
            ) : (
              <span>Hover over any matrix cell to inspect specific class pairs and support counts.</span>
            )}
          </div>
        </div>

        {/* Multi-Class ROC Curves (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">
                  Receiver Operating Characteristic (ROC)
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Multi-Class AUC
              </span>
            </div>

            {/* SVG ROC Plot */}
            <div className="mt-4 bg-slate-950 border border-slate-800 rounded-xl p-4 relative">
              <svg viewBox="0 0 280 200" className="w-full h-44 overflow-visible">
                {/* Grid lines */}
                <line x1="30" y1="20" x2="30" y2="180" stroke="#334155" strokeWidth="1" />
                <line x1="30" y1="180" x2="260" y2="180" stroke="#334155" strokeWidth="1" />
                <line x1="30" y1="100" x2="260" y2="100" stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="145" y1="20" x2="145" y2="180" stroke="#1e293b" strokeDasharray="3 3" />

                {/* Diagonal Chance Line */}
                <line x1="30" y1="180" x2="260" y2="20" stroke="#475569" strokeDasharray="4 4" strokeWidth="1" />

                {/* Plot curves */}
                {(['glioma', 'meningioma', 'pituitary', 'no_tumor'] as TumorClass[]).map((cls) => {
                  const data = ROC_CURVES[cls];
                  const color =
                    cls === 'glioma' ? '#ef4444' :
                    cls === 'meningioma' ? '#f59e0b' :
                    cls === 'pituitary' ? '#8b5cf6' : '#10b981';

                  const pointsStr = data.points
                    .map(([fpr, tpr]) => `${30 + fpr * 230},${180 - tpr * 160}`)
                    .join(' ');

                  return (
                    <polyline
                      key={cls}
                      fill="none"
                      stroke={color}
                      strokeWidth="2.5"
                      points={pointsStr}
                    />
                  );
                })}

                {/* Axis Labels */}
                <text x="145" y="198" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">
                  False Positive Rate (1 - Specificity)
                </text>
                <text x="15" y="100" fill="#94a3b8" fontSize="9" textAnchor="middle" transform="rotate(-90 15,100)" fontFamily="monospace">
                  Sensitivity (TPR)
                </text>
              </svg>

              {/* Legend with AUC values */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800 text-[11px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-slate-300">Glioma (AUC {ROC_CURVES.glioma.auc})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-slate-300">Meningioma (AUC {ROC_CURVES.meningioma.auc})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span className="text-slate-300">Pituitary (AUC {ROC_CURVES.pituitary.auc})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-300">No Tumor (AUC {ROC_CURVES.no_tumor.auc})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Training History & Model Comparison Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Training Loss & Accuracy Convergence History (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <LineChart className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">
                Training & Validation Convergence (40 Epochs)
              </h3>
            </div>
            <span className="text-[11px] text-cyan-400 font-mono bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              EarlyStopping Enabled (Patience=8)
            </span>
          </div>

          <div className="mt-4 bg-slate-950 border border-slate-800 rounded-xl p-4">
            <svg viewBox="0 0 320 180" className="w-full h-44 overflow-visible">
              <line x1="30" y1="20" x2="30" y2="160" stroke="#334155" strokeWidth="1" />
              <line x1="30" y1="160" x2="310" y2="160" stroke="#334155" strokeWidth="1" />

              {/* Accuracy curve (Cyan: Val, Blue: Train) */}
              {/* Training Acc line */}
              <polyline
                fill="none"
                stroke="#0284c7"
                strokeWidth="2"
                points={TRAINING_HISTORY_RESNET.map(
                  (d) => `${30 + (d.epoch / 40) * 270},${160 - d.trainAcc * 140}`
                ).join(' ')}
              />
              {/* Validation Acc line */}
              <polyline
                fill="none"
                stroke="#22d3ee"
                strokeWidth="2.5"
                points={TRAINING_HISTORY_RESNET.map(
                  (d) => `${30 + (d.epoch / 40) * 270},${160 - d.valAcc * 140}`
                ).join(' ')}
              />

              {/* Loss curve (Orange: Val loss, Red: Train loss) */}
              <polyline
                fill="none"
                stroke="#f97316"
                strokeWidth="2"
                strokeDasharray="4 2"
                points={TRAINING_HISTORY_RESNET.map(
                  (d) => `${30 + (d.epoch / 40) * 270},${160 - Math.min(1.0, d.valLoss) * 130}`
                ).join(' ')}
              />

              <text x="170" y="176" fill="#94a3b8" fontSize="9" textAnchor="middle" fontFamily="monospace">
                Training Epochs (Checkpoint at Epoch 40)
              </text>
            </svg>

            <div className="flex items-center justify-between text-[11px] font-mono mt-2 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-cyan-400">
                  <span className="w-2.5 h-0.5 bg-cyan-400"></span> Val Accuracy (97.8%)
                </span>
                <span className="flex items-center gap-1 text-orange-400">
                  <span className="w-2.5 h-0.5 bg-orange-400 border-dashed"></span> Val Loss (0.082)
                </span>
              </div>
              <span className="text-slate-500">AdamW (lr=1e-4)</span>
            </div>
          </div>
        </div>

        {/* Dataset Distribution (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">
                Dataset Stratification & Class Balance
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              70% Train / 10% Val / 20% Test
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {DATASET_DISTRIBUTION.map((item) => (
              <div key={item.className} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-semibold text-slate-200">{item.className}</span>
                  <span className="text-slate-400">
                    {item.total} scans (Train: {item.trainCount} | Val: {item.valCount} | Test: {item.testCount})
                  </span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2.5 flex overflow-hidden border border-slate-800">
                  <div
                    style={{ width: `${(item.trainCount / item.total) * 100}%`, backgroundColor: item.color }}
                    title={`Train: ${item.trainCount}`}
                  />
                  <div
                    style={{ width: `${(item.valCount / item.total) * 100}%`, backgroundColor: `${item.color}90` }}
                    title={`Val: ${item.valCount}`}
                  />
                  <div
                    style={{ width: `${(item.testCount / item.total) * 100}%`, backgroundColor: `${item.color}50` }}
                    title={`Test: ${item.testCount}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400">
            <p>
              Balanced stratification across 5,546 magnetic resonance imaging slices ensures zero class bias during loss backpropagation.
            </p>
          </div>
        </div>
      </div>

      {/* Model Benchmark Comparison Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Table className="h-4 w-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              Complete Model Benchmark Comparison Table
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Evaluating Scratch vs Pretrained ImageNet Weights
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Model Architecture</th>
                <th className="p-3">Type</th>
                <th className="p-3">Parameters</th>
                <th className="p-3">Size</th>
                <th className="p-3">Accuracy</th>
                <th className="p-3">Precision</th>
                <th className="p-3">Recall</th>
                <th className="p-3">F1-Score</th>
                <th className="p-3">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {COMPARATIVE_MODELS.map((m) => (
                <tr
                  key={m.id}
                  className={`hover:bg-slate-800/40 transition ${
                    selectedModelId === m.id ? 'bg-cyan-950/30 font-bold' : ''
                  }`}
                >
                  <td className="p-3 flex items-center gap-2 text-white">
                    {selectedModelId === m.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    )}
                    <span>{m.name}</span>
                  </td>
                  <td className="p-3 text-slate-400">{m.type}</td>
                  <td className="p-3 text-slate-300">{m.parameters}</td>
                  <td className="p-3 text-slate-300">{m.modelSizeMb} MB</td>
                  <td className="p-3 text-cyan-400 font-bold">{(m.accuracy * 100).toFixed(1)}%</td>
                  <td className="p-3 text-slate-300">{(m.precision * 100).toFixed(1)}%</td>
                  <td className="p-3 text-slate-300">{(m.recall * 100).toFixed(1)}%</td>
                  <td className="p-3 text-emerald-400 font-bold">{(m.f1Score * 100).toFixed(1)}%</td>
                  <td className="p-3 text-amber-400">{m.latencyMs} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
