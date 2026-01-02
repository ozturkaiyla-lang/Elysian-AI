import React, { useState, useRef, useEffect } from 'react';
import { Message, SessionMode, UserProfile, RestorationBlueprint } from '../types';
import { gemini } from '../services/geminiService';

interface TherapistChatProps {
  mode: SessionMode;
  profile?: UserProfile;
}

const RestorationBlueprintView: React.FC<{ blueprint: RestorationBlueprint, onClose: () => void }> = ({ blueprint, onClose }) => {
  return (
    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-xl flex items-center justify-center p-4 sm:p-12 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl flex flex-col custom-scrollbar border border-white/20">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm px-8 py-6 border-b border-zen-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
              <i className="fa-solid fa-compass-drafting"></i>
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold">Restoration Blueprint</h2>
              <p className="text-[9px] font-black uppercase tracking-widest text-zen-400">Personalized Healing Plan</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-zen-50 transition-colors flex items-center justify-center text-zen-950">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="p-8 sm:p-12 space-y-10">
          <section className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
            <h3 className="text-[9px] font-black uppercase tracking-widest text-indigo-600 mb-3">Neural Core Analysis</h3>
            <p className="text-lg font-serif italic text-indigo-950 leading-relaxed">{blueprint.rootAnalysis}</p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-zen-50 rounded-3xl border border-zen-100">
              <h3 className="text-[9px] font-black uppercase tracking-widest text-zen-400 mb-3">Perspective Shift</h3>
              <p className="text-sm font-medium text-zen-900 leading-relaxed">{blueprint.coreShift}</p>
            </div>
            <div className="p-6 bg-zen-950 rounded-3xl text-white">
              <h3 className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-3">Daily Ritual</h3>
              <p className="text-sm font-medium leading-relaxed opacity-90">{blueprint.suggestedRitual}</p>
            </div>
          </div>

          <section>
            <h3 className="text-[9px] font-black uppercase tracking-widest text-zen-400 mb-6">Structural Action Steps</h3>
            <div className="space-y-4">
              {blueprint.actionSteps.map((step, idx) => (
                <div key={idx} className="flex gap-6 p-5 border border-zen-50 rounded-2xl hover:bg-zen-50/50 transition-colors">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-zen-950 mb-1">{step.title}</h4>
                    <p className="text-sm text-zen-600 mb-2">{step.description}</p>
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-tighter">Fix Logic: {step.whyItWorks}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const TherapistChat: React.FC<TherapistChatProps> = ({ mode, profile }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blueprint, setBlueprint] = useState<RestorationBlueprint | null>(() => {
    const saved = localStorage.getItem('elysian_blueprint');
    return saved ? JSON.parse(saved) : null;
  });
  const [showBlueprint, setShowBlueprint] = useState(false);
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const welcome = `Welcome back, ${profile?.name || 'friend'}. I've prepared this sanctuary for our reflection today. How can I help you find clarity and restoration?`;
    setMessages([{ id: '1', role: 'assistant', content: welcome, timestamp: Date.now() }]);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [profile]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (blueprint) {
      localStorage.setItem('elysian_blueprint', JSON.stringify(blueprint));
    }
  }, [blueprint]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    setError(null);
    const text = input;
    setInput('');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await gemini.getChatResponse(text, history, mode === SessionMode.DEEP ? 'DEEP' : 'FAST', profile);
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        thinking: response.thinking,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMsg]);

      if (messages.length >= 2) {
        updateBlueprint([...messages, userMsg, assistantMsg]);
      }
    } catch (err: any) {
      console.error("Chat Send Error:", err);
      if (err.message === "API_KEY_MISSING") {
        setError("AUTHENTICATION FAILED: PLEASE CONFIGURE THE API_KEY IN VERCEL SETTINGS.");
      } else {
        setError("I'M HAVING TROUBLE CONNECTING TO MY RESTORATIVE CORE. PLEASE CHECK YOUR API KEY CONFIGURATION.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateBlueprint = async (currentHistory: Message[]) => {
    setIsGeneratingBlueprint(true);
    try {
      const history = currentHistory.map(m => ({ role: m.role, content: m.content }));
      const newBlueprint = await gemini.generateBlueprint(history, profile);
      setBlueprint(newBlueprint);
    } catch (err) {
      console.error("Blueprint update failed", err);
    } finally {
      setIsGeneratingBlueprint(false);
    }
  };

  return (
    <div className="flex flex-col h-[80vh] glass-panel rounded-[2rem] shadow-2xl overflow-hidden relative border border-white/40">
      <div className="px-8 py-4 bg-white/50 backdrop-blur-md border-b border-white/20 flex justify-between items-center z-20">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${mode === SessionMode.DEEP ? 'bg-indigo-600 animate-pulse' : 'bg-green-500'}`}></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-zen-950">
            {mode === SessionMode.DEEP ? 'Deep Reasoning Active' : 'Sanctuary Mode'}
          </span>
        </div>
        
        {blueprint && (
          <button 
            onClick={() => setShowBlueprint(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-1.5 rounded-full shadow-lg hover:bg-indigo-700 transition-all text-[10px] font-black uppercase tracking-widest"
          >
            <i className={`fa-solid fa-compass-drafting ${isGeneratingBlueprint ? 'animate-spin' : ''}`}></i>
            View Blueprint
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 space-y-8 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in-up`}>
            {msg.thinking && (
              <div className="max-w-[80%] mb-4 p-4 bg-indigo-50/30 border border-indigo-100/50 rounded-2xl text-[12px] italic text-indigo-900/60 font-serif">
                <div className="flex items-center gap-2 mb-2 not-italic font-sans font-black text-[8px] uppercase tracking-widest text-indigo-400">
                  <i className="fa-solid fa-brain"></i> Neural Path
                </div>
                {msg.thinking}
              </div>
            )}
            <div className={`max-w-[85%] px-5 py-4 rounded-2xl shadow-sm ${
              msg.role === 'user' 
              ? 'bg-zen-950 text-white rounded-tr-none' 
              : 'bg-white text-zen-950 rounded-tl-none border border-zen-50'
            }`}>
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3 p-4 bg-white/40 rounded-2xl w-fit">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
              <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-4 bg-white/95 p-6 rounded-3xl border border-red-100 shadow-2xl text-red-600 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-2">
            <i className="fa-solid fa-triangle-exclamation text-xl"></i>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-center flex-1">{error}</span>
            <button onClick={() => window.location.reload()} className="text-[9px] font-black underline uppercase tracking-widest text-red-400 hover:text-red-700">Try Again</button>
          </div>
        )}
      </div>

      <div className="p-6 bg-white/30 backdrop-blur-xl border-t border-white/20">
        <div className="max-w-4xl mx-auto flex items-center gap-3 bg-white p-2 rounded-full shadow-xl border border-zen-50 overflow-hidden">
          <button 
            onClick={toggleListening}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-zen-50 text-zen-300 hover:text-zen-600'}`}
          >
            <i className={`fa-solid ${isListening ? 'fa-microphone-lines' : 'fa-microphone'}`}></i>
          </button>
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Share what's on your mind..."
            className="flex-1 bg-transparent px-4 py-2 focus:outline-none text-[15px] text-zen-950 font-medium"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 bg-zen-950 text-white rounded-full flex items-center justify-center disabled:opacity-20 hover:scale-105 active:scale-95 transition-all"
          >
            <i className="fa-solid fa-arrow-up"></i>
          </button>
        </div>
      </div>

      {showBlueprint && blueprint && (
        <RestorationBlueprintView blueprint={blueprint} onClose={() => setShowBlueprint(false)} />
      )}
    </div>
  );
};

export default TherapistChat;