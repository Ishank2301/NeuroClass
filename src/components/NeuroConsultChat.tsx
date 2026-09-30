import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Zap,
  Brain,
  Stethoscope,
  Scissors,
  HeartHandshake,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  FileText,
  AlertCircle
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  modelUsed?: string;
  timestamp: string;
}

interface NeuroConsultChatProps {
  activeScanContext?: {
    id: string;
    prediction: string;
    confidence: number;
    sequence: string;
    description: string;
  } | null;
}

export const NeuroConsultChat: React.FC<NeuroConsultChatProps> = ({ activeScanContext }) => {
  // Model selection: gemini-3.5-flash (general), gemini-3.1-flash-lite (fast), gemini-3.1-pro-preview (complex)
  const [selectedModel, setSelectedModel] = useState<'gemini-3.5-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.1-pro-preview'>('gemini-3.5-flash');
  const [selectedRole, setSelectedRole] = useState<'neuroradiologist' | 'neurosurgeon' | 'patient_counselor'>('neuroradiologist');
  const [attachContext, setAttachContext] = useState<boolean>(true);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `Hello, I am **NeuroConsult AI**, your specialized clinical neuro-oncology consultant powered by Gemini.\n\nI can assist with:\n• Differential diagnosis across Glioma, Meningioma, Pituitary Adenoma, and Normal scans\n• Neuroimaging correlation (T1+Gd ring enhancement, T2/FLAIR hyperintensity, dural tail signs)\n• Surgical resection planning and WHO tumor grading protocols.\n\nHow can I assist your case review today?`,
      modelUsed: 'gemini-3.5-flash',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setInputMessage('');
    setIsLoading(true);

    try {
      // Build conversation payload for the server-side Gemini API
      const conversationHistory = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const contextData = attachContext && activeScanContext ? activeScanContext : undefined;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory,
          role: selectedRole,
          model: selectedModel,
          contextData,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'No response returned from model.',
        modelUsed: data.modelUsed || selectedModel,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Clinical Communication Error:** Could not contact the consultation endpoint. (${err.message}). Please verify the server connection.`,
        modelUsed: selectedModel,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    if (confirm('Clear clinical consultation thread?')) {
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          role: 'assistant',
          content: 'Consultation history cleared. Please submit a new case query.',
          modelUsed: selectedModel,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  const samplePrompts = [
    'Explain the radiological hallmark features of High-Grade Glioma vs. Meningioma',
    'What are the key neurosurgical considerations for a parasellar pituitary lesion?',
    'Interpret the active case scan findings and suggest next diagnostic steps',
    'Draft a clear patient-friendly summary of an incidental brain MRI finding',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[580px] bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Header Bar */}
      <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/40">
            <Brain className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide">NeuroConsult AI</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                Multi-Turn Gemini
              </span>
            </div>
            <p className="text-xs text-slate-400">Neuroradiology & Neurosurgical Multi-Disciplinary Consultant</p>
          </div>
        </div>

        {/* Controls: Role Selector & Model Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Role selector */}
          <div className="flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedRole('neuroradiologist')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                selectedRole === 'neuroradiologist'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Neuroradiologist: Focuses on imaging characteristics, differential diagnosis, and Grad-CAM correlation"
            >
              <Stethoscope className="h-3.5 w-3.5" />
              <span>Radiologist</span>
            </button>
            <button
              onClick={() => setSelectedRole('neurosurgeon')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                selectedRole === 'neurosurgeon'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Neurosurgeon: Focuses on surgical feasibility, craniotomy trajectory, and eloquent cortex proximity"
            >
              <Scissors className="h-3.5 w-3.5" />
              <span>Surgeon</span>
            </button>
            <button
              onClick={() => setSelectedRole('patient_counselor')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
                selectedRole === 'patient_counselor'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Patient Counselor: Reassuring, clear, jargon-free medical explanation"
            >
              <HeartHandshake className="h-3.5 w-3.5" />
              <span>Counselor</span>
            </button>
          </div>

          {/* Model selector dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1 text-xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as any)}
              className="bg-transparent text-slate-200 font-mono focus:outline-none cursor-pointer"
              aria-label="Select Gemini Model Tier"
            >
              <option value="gemini-3.5-flash" className="bg-slate-900 text-slate-200">
                gemini-3.5-flash (General)
              </option>
              <option value="gemini-3.1-flash-lite" className="bg-slate-900 text-slate-200">
                gemini-3.1-flash-lite (Fast Triage)
              </option>
              <option value="gemini-3.1-pro-preview" className="bg-slate-900 text-slate-200">
                gemini-3.1-pro-preview (Complex Staging)
              </option>
            </select>
          </div>

          {/* Clear history button */}
          <button
            onClick={handleClearHistory}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition-colors"
            title="Clear Chat Thread"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Patient Scan Context Indicator */}
      {activeScanContext && (
        <div className="px-5 py-2 bg-cyan-950/30 border-b border-cyan-900/30 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-slate-400 font-mono">Active PACS Scan:</span>
            <span className="font-semibold text-cyan-300 capitalize">{activeScanContext.prediction}</span>
            <span className="text-slate-500">|</span>
            <span className="font-mono text-slate-400">{activeScanContext.confidence}% confidence</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">{activeScanContext.sequence}</span>
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-slate-200">
            <input
              type="checkbox"
              checked={attachContext}
              onChange={(e) => setAttachContext(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-cyan-500"
            />
            <span className="text-[11px]">Include Scan Context</span>
          </label>
        </div>
      )}

      {/* Scrollable Message Thread */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-white ${
                  isUser
                    ? 'bg-blue-600 shadow-md shadow-blue-500/20'
                    : 'bg-gradient-to-tr from-cyan-600 to-indigo-600 shadow-md shadow-cyan-500/20'
                }`}
              >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              {/* Message Content Bubble */}
              <div
                className={`group relative max-w-[82%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-lg leading-relaxed ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-sm'
                    : 'bg-slate-800/80 text-slate-200 border border-slate-700/60 rounded-tl-sm backdrop-blur-md'
                }`}
              >
                {/* Text formatting (bold headers, bullet points) */}
                <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm">
                  {message.content}
                </div>

                {/* Bubble Footer */}
                <div
                  className={`mt-2 flex items-center gap-2 text-[10px] ${
                    isUser ? 'text-blue-200 justify-end' : 'text-slate-400 justify-between'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{message.timestamp}</span>
                    {message.modelUsed && !isUser && (
                      <span className="font-mono px-1.5 py-0.5 rounded bg-slate-900/80 text-cyan-300 border border-slate-700/50">
                        {message.modelUsed}
                      </span>
                    )}
                  </div>

                  {!isUser && (
                    <button
                      onClick={() => handleCopyText(message.content, message.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-slate-200 rounded"
                      title="Copy response"
                    >
                      {copiedId === message.id ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shrink-0 text-white animate-pulse">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl rounded-tl-sm px-4 py-3 text-slate-300 text-xs flex items-center gap-3">
              <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" />
              <span>NeuroConsult is analyzing case data using {selectedModel}...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Pills */}
      <div className="px-5 py-2 bg-slate-950/60 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
        <span className="text-slate-500 font-mono shrink-0">Quick Prompts:</span>
        {samplePrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="shrink-0 px-3 py-1 rounded-full bg-slate-800/80 hover:bg-cyan-950/60 hover:text-cyan-300 border border-slate-700 hover:border-cyan-800 text-slate-300 transition-all text-left"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Composer */}
      <div className="p-4 bg-slate-900/90 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Ask ${selectedRole === 'neuroradiologist' ? 'Neuroradiology' : selectedRole === 'neurosurgeon' ? 'Neurosurgical' : 'Patient Care'} question...`}
            disabled={isLoading}
            className="flex-1 bg-slate-950/90 border border-slate-800 focus:border-cyan-500 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-md shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
