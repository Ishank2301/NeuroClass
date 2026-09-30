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
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[580px] bg-[#080809] border border-[rgba(240,240,242,0.08)] shadow-2xl overflow-hidden">
      {/* Top Header Bar */}
      <div className="px-5 py-3.5 bg-[#080809] border-b border-[rgba(240,240,242,0.08)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 border-2 border-[#00ffa3] flex items-center justify-center font-syne font-extrabold text-[#00ffa3] text-xs shrink-0">
            <span>AI</span>
            <span className="absolute -inset-1 border border-[#00ffa3]/30 pointer-events-none" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-syne text-sm font-bold text-[#f0f0f2] tracking-wide uppercase">NeuroConsult AI</h2>
              <span className="font-mono text-[9px] px-2 py-0.5 bg-[#00ffa3]/10 text-[#00ffa3] border border-[#00ffa3]/30">
                MULTI-TURN GEMINI
              </span>
            </div>
            <p className="font-mono text-[10px] text-[#f0f0f2]/40 uppercase tracking-wider">Neuroradiology & Neurosurgical Consultant</p>
          </div>
        </div>

        {/* Controls: Role Selector & Model Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Role selector */}
          <div className="flex items-center bg-[#111114] p-0.5 border border-[rgba(240,240,242,0.08)] font-mono text-[10px] uppercase">
            <button
              onClick={() => setSelectedRole('neuroradiologist')}
              className={`flex items-center gap-1.5 px-2.5 py-1 transition-all ${
                selectedRole === 'neuroradiologist'
                  ? 'bg-[#00ffa3]/15 text-[#00ffa3] font-semibold border-b border-[#00ffa3]'
                  : 'text-[#f0f0f2]/50 hover:text-[#f0f0f2]'
              }`}
            >
              <Stethoscope className="h-3 w-3" />
              <span>Radiologist</span>
            </button>
            <button
              onClick={() => setSelectedRole('neurosurgeon')}
              className={`flex items-center gap-1.5 px-2.5 py-1 transition-all ${
                selectedRole === 'neurosurgeon'
                  ? 'bg-[#00ffa3]/15 text-[#00ffa3] font-semibold border-b border-[#00ffa3]'
                  : 'text-[#f0f0f2]/50 hover:text-[#f0f0f2]'
              }`}
            >
              <Scissors className="h-3 w-3" />
              <span>Surgeon</span>
            </button>
            <button
              onClick={() => setSelectedRole('patient_counselor')}
              className={`flex items-center gap-1.5 px-2.5 py-1 transition-all ${
                selectedRole === 'patient_counselor'
                  ? 'bg-[#00ffa3]/15 text-[#00ffa3] font-semibold border-b border-[#00ffa3]'
                  : 'text-[#f0f0f2]/50 hover:text-[#f0f0f2]'
              }`}
            >
              <HeartHandshake className="h-3 w-3" />
              <span>Counselor</span>
            </button>
          </div>

          {/* Model selector dropdown */}
          <div className="flex items-center gap-1.5 bg-[#111114] border border-[rgba(240,240,242,0.08)] px-2.5 py-1 text-xs">
            <Sparkles className="h-3 w-3 text-[#00ffa3]" />
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as any)}
              className="bg-transparent text-[#f0f0f2] font-mono text-[11px] focus:outline-none cursor-pointer"
            >
              <option value="gemini-3.5-flash" className="bg-[#111114] text-slate-200">
                gemini-3.5-flash (General)
              </option>
              <option value="gemini-3.1-flash-lite" className="bg-[#111114] text-slate-200">
                gemini-3.1-flash-lite (Fast Triage)
              </option>
              <option value="gemini-3.1-pro-preview" className="bg-[#111114] text-slate-200">
                gemini-3.1-pro-preview (Complex Staging)
              </option>
            </select>
          </div>

          {/* Clear history button */}
          <button
            onClick={handleClearHistory}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-[#111114] transition-colors"
            title="Clear Chat Thread"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Patient Scan Context Indicator */}
      {activeScanContext && (
        <div className="px-5 py-2 bg-[#00ffa3]/5 border-b border-[#00ffa3]/20 flex items-center justify-between text-xs text-[#f0f0f2]/80 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ffa3] animate-pulse" />
            <span className="text-[#f0f0f2]/40">ACTIVE SCAN:</span>
            <span className="font-semibold text-[#00ffa3] uppercase">{activeScanContext.prediction}</span>
            <span className="text-white/20">|</span>
            <span>{activeScanContext.confidence}% CONFIDENCE</span>
            <span className="text-white/20">|</span>
            <span className="text-[#f0f0f2]/60">{activeScanContext.sequence}</span>
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer text-[#f0f0f2]/60 hover:text-[#f0f0f2]">
            <input
              type="checkbox"
              checked={attachContext}
              onChange={(e) => setAttachContext(e.target.checked)}
              className="accent-[#00ffa3]"
            />
            <span className="text-[10px] tracking-wider uppercase">Include Context</span>
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
                className={`h-7 w-7 flex items-center justify-center shrink-0 text-xs font-mono font-bold ${
                  isUser
                    ? 'bg-[#111114] text-[#00ffa3] border border-[#00ffa3]/40'
                    : 'bg-[#00ffa3] text-[#080809]'
                }`}
              >
                {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
              </div>

              {/* Message Content Bubble */}
              <div
                className={`group relative max-w-[82%] sm:max-w-[75%] px-4 py-3 text-xs sm:text-sm leading-relaxed border ${
                  isUser
                    ? 'bg-[#111114] text-[#f0f0f2] border-[#00ffa3]/30'
                    : 'bg-[#111114]/90 text-[#f0f0f2]/90 border-[rgba(240,240,242,0.08)]'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">
                  {message.content}
                </div>

                {/* Bubble Footer */}
                <div
                  className={`mt-2 flex items-center gap-2 font-mono text-[9px] ${
                    isUser ? 'text-[#00ffa3]/70 justify-end' : 'text-[#f0f0f2]/40 justify-between'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{message.timestamp}</span>
                    {message.modelUsed && !isUser && (
                      <span className="px-1.5 py-0.2 bg-[#080809] text-[#00ffa3] border border-[#00ffa3]/20">
                        {message.modelUsed}
                      </span>
                    )}
                  </div>

                  {!isUser && (
                    <button
                      onClick={() => handleCopyText(message.content, message.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 text-slate-400 hover:text-white"
                      title="Copy response"
                    >
                      {copiedId === message.id ? (
                        <Check className="h-3 w-3 text-[#00ffa3]" />
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
            <div className="h-7 w-7 bg-[#00ffa3] text-[#080809] flex items-center justify-center shrink-0">
              <Bot className="h-3.5 w-3.5" />
            </div>
            <div className="bg-[#111114] border border-[rgba(240,240,242,0.08)] px-4 py-3 text-[#f0f0f2]/70 text-xs flex items-center gap-3 font-mono">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#00ffa3]" />
              <span>CONSULTING {selectedModel.toUpperCase()}...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Pills */}
      <div className="px-5 py-2 bg-[#080809] border-t border-[rgba(240,240,242,0.08)] flex items-center gap-2 overflow-x-auto text-[11px] font-mono no-scrollbar">
        <span className="text-[#f0f0f2]/40 uppercase tracking-widest text-[9px] shrink-0">Prompts:</span>
        {samplePrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="shrink-0 px-3 py-1 bg-[#111114] hover:bg-white/[0.05] hover:text-[#00ffa3] border border-[rgba(240,240,242,0.08)] text-[#f0f0f2]/70 transition-all text-left text-[11px]"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Composer */}
      <div className="p-4 bg-[#080809] border-t border-[rgba(240,240,242,0.08)]">
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
            placeholder={`Ask ${selectedRole === 'neuroradiologist' ? 'Neuroradiology' : selectedRole === 'neurosurgeon' ? 'Neurosurgical' : 'Patient Care'} consultation...`}
            disabled={isLoading}
            className="flex-1 bg-[#111114] border border-[rgba(240,240,242,0.12)] focus:border-[#00ffa3] px-4 py-3 text-xs sm:text-sm text-[#f0f0f2] placeholder-[#f0f0f2]/30 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="btn-cut px-6 py-3 bg-[#00ffa3] hover:bg-white text-[#080809] font-mono font-bold text-xs uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition-all cursor-pointer"
          >
            <Send className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Submit</span>
          </button>
        </form>
      </div>
    </div>
  );
};
