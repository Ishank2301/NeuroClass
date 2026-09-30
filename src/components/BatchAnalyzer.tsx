import React, { useState } from 'react';
import {
  ListFilter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpDown,
  Download,
  Search,
  ExternalLink,
  ShieldAlert,
  Play
} from 'lucide-react';
import { SAMPLE_SCANS } from '../data/sampleScans';
import { TumorClass } from '../types';
import { TUMOR_CLASSES_METADATA } from '../utils/mriEngine';

interface BatchAnalyzerProps {
  onSelectScanForDiagnosis: (scanId: string) => void;
}

interface BatchItem {
  id: string;
  patientId: string;
  age: number;
  gender: string;
  sequence: string;
  plane: string;
  prediction: TumorClass;
  confidence: number;
  triage: 'STAT (Immediate Review)' | 'Semi-Urgent' | 'Routine' | 'Normal Priority';
  triageColor: string;
  lesionSizeMm: number;
  admissionTime: string;
}

export const BatchAnalyzer: React.FC<BatchAnalyzerProps> = ({ onSelectScanForDiagnosis }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'triage' | 'confidence' | 'age'>('triage');

  // Realistic mock batch PACS worklist based on our sample data + simulated patient cohort
  const batchWorklist: BatchItem[] = [
    {
      id: 'case-glioma-01',
      patientId: 'PT-9021-GL',
      age: 58,
      gender: 'M',
      sequence: 'T1-CE',
      plane: 'Axial',
      prediction: 'glioma',
      confidence: 0.984,
      triage: 'STAT (Immediate Review)',
      triageColor: '#ef4444',
      lesionSizeMm: 38.4,
      admissionTime: '08:14 AM'
    },
    {
      id: 'case-pituitary-01',
      patientId: 'PT-6614-PA',
      age: 46,
      gender: 'M',
      sequence: 'T1-CE',
      plane: 'Coronal',
      prediction: 'pituitary',
      confidence: 0.972,
      triage: 'Semi-Urgent',
      triageColor: '#f59e0b',
      lesionSizeMm: 22.8,
      admissionTime: '08:45 AM'
    },
    {
      id: 'case-meningioma-01',
      patientId: 'PT-7832-MN',
      age: 62,
      gender: 'F',
      sequence: 'T1-CE',
      plane: 'Axial',
      prediction: 'meningioma',
      confidence: 0.965,
      triage: 'Routine',
      triageColor: '#3b82f6',
      lesionSizeMm: 27.2,
      admissionTime: '09:20 AM'
    },
    {
      id: 'case-glioma-02',
      patientId: 'PT-4109-GL',
      age: 39,
      gender: 'F',
      sequence: 'T2-Weighted',
      plane: 'Coronal',
      prediction: 'glioma',
      confidence: 0.941,
      triage: 'STAT (Immediate Review)',
      triageColor: '#ef4444',
      lesionSizeMm: 34.0,
      admissionTime: '09:55 AM'
    },
    {
      id: 'case-pituitary-02',
      patientId: 'PT-3308-PA',
      age: 54,
      gender: 'F',
      sequence: 'T2-Weighted',
      plane: 'Sagittal',
      prediction: 'pituitary',
      confidence: 0.958,
      triage: 'Semi-Urgent',
      triageColor: '#f59e0b',
      lesionSizeMm: 19.5,
      admissionTime: '10:12 AM'
    },
    {
      id: 'case-normal-01',
      patientId: 'PT-1002-NL',
      age: 32,
      gender: 'F',
      sequence: 'T1-CE',
      plane: 'Axial',
      prediction: 'no_tumor',
      confidence: 0.989,
      triage: 'Normal Priority',
      triageColor: '#10b981',
      lesionSizeMm: 0,
      admissionTime: '10:30 AM'
    },
    {
      id: 'case-meningioma-02',
      patientId: 'PT-2290-MN',
      age: 51,
      gender: 'M',
      sequence: 'T1-CE',
      plane: 'Sagittal',
      prediction: 'meningioma',
      confidence: 0.952,
      triage: 'Routine',
      triageColor: '#3b82f6',
      lesionSizeMm: 24.1,
      admissionTime: '11:05 AM'
    },
    {
      id: 'case-normal-02',
      patientId: 'PT-1008-NL',
      age: 41,
      gender: 'M',
      sequence: 'T2-Weighted',
      plane: 'Sagittal',
      prediction: 'no_tumor',
      confidence: 0.992,
      triage: 'Normal Priority',
      triageColor: '#10b981',
      lesionSizeMm: 0,
      admissionTime: '11:40 AM'
    }
  ];

  // Filtering
  const filteredList = batchWorklist.filter((item) => {
    const matchesSearch =
      item.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.prediction.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'all' || item.prediction === filterClass;
    return matchesSearch && matchesClass;
  });

  // Sorting
  const sortedList = [...filteredList].sort((a, b) => {
    if (sortBy === 'triage') {
      const priorityOrder: Record<string, number> = {
        'STAT (Immediate Review)': 4,
        'Semi-Urgent': 3,
        'Routine': 2,
        'Normal Priority': 1
      };
      return (priorityOrder[b.triage] || 0) - (priorityOrder[a.triage] || 0);
    }
    if (sortBy === 'confidence') return b.confidence - a.confidence;
    return b.age - a.age;
  });

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['PatientID', 'Age', 'Gender', 'Sequence', 'Plane', 'Diagnosis', 'Confidence', 'TriagePriority', 'LesionDiameterMm', 'AdmissionTime'];
    const rows = sortedList.map((i) => [
      i.patientId,
      i.age,
      i.gender,
      i.sequence,
      i.plane,
      i.prediction,
      (i.confidence * 100).toFixed(1) + '%',
      i.triage,
      i.lesionSizeMm,
      i.admissionTime
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `neuroclass_triage_manifest_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statCount = batchWorklist.filter((i) => i.triage.includes('STAT')).length;
  const urgentCount = batchWorklist.filter((i) => i.triage === 'Semi-Urgent').length;
  const normalCount = batchWorklist.filter((i) => i.prediction === 'no_tumor').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono font-semibold border border-cyan-500/30">
              HOSPITAL PACS TRIAGE WORKLIST
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Queue: {batchWorklist.length} Studies Received Today
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Automated Patient Neuroimaging Triage
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Prioritizes incoming magnetic resonance brain scans by risk severity. Gliomas and compressive suprasellar masses automatically escalate to STAT priority for urgent radiological review.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium border border-slate-700 transition"
        >
          <Download className="h-4 w-4 text-cyan-400" />
          <span>Export Triage Manifest (CSV)</span>
        </button>
      </div>

      {/* KPI stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-slate-400 block">STAT PRIORITY</span>
            <span className="text-2xl font-bold text-red-400 font-mono">{statCount} Cases</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-slate-400 block">SEMI-URGENT</span>
            <span className="text-2xl font-bold text-amber-400 font-mono">{urgentCount} Cases</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-slate-400 block">NORMAL / HEALTHY</span>
            <span className="text-2xl font-bold text-emerald-400 font-mono">{normalCount} Cases</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-slate-400 block">AVG INFERENCE</span>
            <span className="text-2xl font-bold text-cyan-400 font-mono">28 ms/study</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Patient ID or diagnosis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-full"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Class:</span>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none"
            >
              <option value="all">All Classes</option>
              <option value="glioma">Glioma</option>
              <option value="meningioma">Meningioma</option>
              <option value="pituitary">Pituitary</option>
              <option value="no_tumor">No Tumor</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none"
            >
              <option value="triage">Triage Urgency</option>
              <option value="confidence">Confidence Score</option>
              <option value="age">Patient Age</option>
            </select>
          </div>
        </div>
      </div>

      {/* Triage Worklist Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5">Patient ID</th>
                <th className="p-3.5">Time</th>
                <th className="p-3.5">Sequence</th>
                <th className="p-3.5">Predicted Diagnosis</th>
                <th className="p-3.5">Confidence</th>
                <th className="p-3.5">Est. Diameter</th>
                <th className="p-3.5">Triage Level</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sortedList.map((item) => {
                const meta = TUMOR_CLASSES_METADATA[item.prediction];
                return (
                  <tr key={item.patientId} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-bold text-white flex items-center gap-2">
                      <span className="text-cyan-400">{item.patientId}</span>
                      <span className="text-slate-500 font-normal text-[10px]">
                        ({item.age}y/{item.gender})
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400">{item.admissionTime}</td>
                    <td className="p-3.5 text-slate-300">
                      {item.sequence} • {item.plane}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
                        <span className="font-semibold text-slate-200">{meta.label}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-white">
                      {(item.confidence * 100).toFixed(1)}%
                    </td>
                    <td className="p-3.5 text-slate-300">
                      {item.lesionSizeMm > 0 ? `${item.lesionSizeMm} mm` : '—'}
                    </td>
                    <td className="p-3.5">
                      <span
                        className="px-2.5 py-1 rounded text-[11px] font-bold inline-block"
                        style={{
                          backgroundColor: `${item.triageColor}20`,
                          color: item.triageColor,
                          border: `1px solid ${item.triageColor}40`
                        }}
                      >
                        {item.triage}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => onSelectScanForDiagnosis(item.id)}
                        className="px-3 py-1 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white rounded border border-cyan-500/40 transition text-xs font-semibold flex items-center gap-1.5 ml-auto"
                      >
                        <span>Open Viewer</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
