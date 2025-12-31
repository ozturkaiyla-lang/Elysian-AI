import React, { useState, useRef, useEffect } from 'react';
import { Message, SessionMode, UserProfile } from '../types';
import { gemini } from '../services/geminiService';

interface TherapistChatProps {
  mode: SessionMode;
  profile?: UserProfile;
}

const CollapsibleText: React.FC<{ text: string, threshold?: number }> = ({ text, threshold = 450 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = text.length > threshold;

  if (!isLong) {
    return <p className="text-[16px] leading-relaxed whitespace-pre-wrap font-medium tracking-tight">{text}</p>;
  }

  return (
    <div className="relative">
      <p className={`text-[16px] leading-relaxed whitespace-pre-wrap font-medium tracking-tight transition-all duration-500 ${!isExpanded ? 'max-h-[200px] overflow-hidden' : ''}`}>
        {isExpanded ? text : `${text.slice(0, threshold)}...`}
      </p>
      
      {!isExpanded && (
        <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none"></div>
      )}

      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-2"
      >
        <i className={`fa-solid ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
        {isExpanded ? 'Show Less' : 'Read Full Wisdom'}
      </button>
    </div>
  );
};

const NeuralThinkingIndicator: React.FC = () => {
  const [stage, setStage] = useState(0);
  const stages = [
    "Analyzing emotional patterns...",
    "Synthesizing contextual empathy...",
    "Navigating therapeutic frameworks...",
    "Formulating restorative guidance...",
    "Refining neural pathways..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStage((prev) => (prev + 1) % stages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-start gap-4 animate-in fade-in slide-in-from-left-4 duration-700">
      <div className="w-12 h-12 rounded-2xl bg-white/80 border border-white flex items-center justify-center flex-shrink-0 shadow-sm relative">
        <i className="fa-solid fa-feather-pointed text-zen-300 text-lg relative z-10"></i>
        <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl animate-ping"></div>
      </div>
      <div className="bg-white/40 backdrop-blur-2xl border border-white p-6 rounded-[2.5rem] rounded-tl-none shadow-2xl shadow-black/5 min-w-[280px]">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-duration:1s]"></div>
            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-duration:1s] [animation-delay:0.2s]"></div>
            <div className="w-1.5 h-1.5 bg-indigo-200 rounded-full animate-bounce [animation-duration:1s] [animation-delay:0.4s]"></div>
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-600 animate-pulse">
            Neural Processing
          </span>
        </div>
        <div className="relative h-6 overflow-hidden">
          <p className="text-[13px] font-medium text-zen-900/60 font-serif italic transition-all duration-700">
            {stages[stage]}
          </p>
        </div>
        <div className="mt-4 w-full h-1 bg-zen-900/5 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-600 animate-[loading_10s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
        </div>
      </div>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

const TherapistChat: React.FC<TherapistChatProps> = ({ mode, profile }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const name = profile?.name || 'there';
    const focus = profile?.mainFocus ? ` regarding your focus on ${profile.mainFocus}` : '';
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: `Welcome back, ${name}. I've been reflecting on our previous journey. How is your heart feeling today${focus}?`,
        timestamp: Date.now()
      }
    ]);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setInput(prev => prev + event.results[i][0].transcript);
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [profile]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError("Voice recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    setError(null);

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const response = await gemini.getChatResponse(
        input, 
        history, 
        mode === SessionMode.DEEP ? 'DEEP' : 'FAST',
        profile
      );
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        thinking: response.thinking,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error("Chat Send Error:", err);
      if (err.message === "KEY_RESET_REQUIRED") {
        setError("API configuration needs adjustment. Please ensure a valid API key is selected.");
        if ((window as any).aistudio?.openSelectKey) {
          (window as any).aistudio.openSelectKey();
        }
      } else {
        setError("I'm having trouble connecting to my neural core. Please check your internet and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const speakMessage = async (text: string) => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      const audio = await gemini.generateTTS(text);
      if (audio) {
        await gemini.playAudio(audio);
      }
    } catch (e) {
      console.error("TTS play error:", e);
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex flex-col h-full glass-panel rounded-[3rem] shadow-2xl overflow-hidden relative border border-white/40">
      <div className="px-10 py-5 bg-white/40 backdrop-blur-xl border-b border-white/20 flex justify-between items-center z-10">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className={`w-3 h-3 rounded-full ${mode === SessionMode.DEEP ? 'bg-indigo-600 shadow-[0_0_12px_rgba(79,70,229,0.5)]' : 'bg-zen-600 shadow-[0_0_8px_rgba(117,153,138,0.4)]'}`}></div>
            {mode === SessionMode.DEEP && <div className="absolute inset-0 w-3 h-3 rounded-full bg-indigo-400 animate-ping opacity-75"></div>}
          </div>
          <span className="text-[11px] font-black text-zen-950 uppercase tracking-[0.3em]">
            {mode === SessionMode.DEEP ? 'Deep Therapeutic Reasoning' : 'Mindful Check-in'}
          </span>
        </div>
        {mode === SessionMode.DEEP && (
          <div className="hidden sm:flex items-center space-x-2 bg-indigo-600 text-white px-4 py-1.5 rounded-full shadow-lg shadow-indigo-200/50 transition-all hover:scale-105 cursor-default">
            <i className="fa-solid fa-brain-circuit text-[10px]"></i>
            <span className="text-[10px] font-bold uppercase tracking-widest">Neural Pro</span>
          </div>
        )}
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-8 py-10 space-y-12 custom-scrollbar scroll-smooth"
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
            <div className={`max-w-[75%] group flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              {msg.thinking && (
                <div className="mb-6 relative w-full">
                  <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-12 bg-indigo-500/20 rounded-full"></div>
                  <div className="p-7 bg-gradient-to-br from-indigo-50/50 to-white/30 rounded-[2.5rem] text-[14px] text-indigo-950 border border-indigo-100 backdrop-blur-xl shadow-inner">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-indigo-600 font-black uppercase tracking-[0.25em] text-[8px]">
                        <i className="fa-solid fa-brain-circuit mr-2"></i>
                        AI Path of Reason
                      </div>
                    </div>
                    <p className="italic leading-relaxed font-serif opacity-90 text-indigo-900/80">
                      {msg.thinking}
                    </p>
                  </div>
                </div>
              )}

              <div className={`relative flex items-end gap-4 transition-all duration-500 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-zen-900 to-black flex items-center justify-center flex-shrink-0 shadow-2xl shadow-zen-950/20 transform hover:scale-110 transition-transform">
                    <i className="fa-solid fa-feather-pointed text-white text-lg"></i>
                  </div>
                )}
                
                <div className={`px-7 py-6 shadow-2xl transition-all duration-300 transform group-hover:-translate-y-1 ${
                  msg.role === 'user' 
                  ? 'bg-gradient-to-br from-zen-900 to-black text-white rounded-[2.5rem] rounded-tr-none shadow-zen-950/30' 
                  : 'bg-white text-zen-950 rounded-[2.5rem] rounded-tl-none border border-white shadow-zen-100/50'
                }`}>
                  {msg.role === 'assistant' ? (
                    <CollapsibleText text={msg.content} />
                  ) : (
                    <p className="text-[16px] leading-relaxed whitespace-pre-wrap font-medium tracking-tight">{msg.content}</p>
                  )}
                  
                  {msg.role === 'assistant' && (
                    <button 
                      onClick={() => speakMessage(msg.content)}
                      disabled={isPlaying}
                      className="mt-5 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-zen-400 hover:text-indigo-600 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-30"
                    >
                      <i className={`fa-solid ${isPlaying ? 'fa-spinner-third fa-spin' : 'fa-ear-listen'}`}></i>
                      Vocalize Wisdom
                    </button>
                  )}
                </div>
              </div>

              <div className={`mt-4 px-2 text-[10px] font-black uppercase tracking-[0.3em] text-zen-900/40 ${msg.role === 'user' ? 'text-right' : 'text-left ml-16'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isLoading && <NeuralThinkingIndicator />}

        {error && (
          <div className="flex justify-center p-8 animate-in zoom-in-95 duration-300">
            <div className="bg-white/90 backdrop-blur-xl text-red-600 px-8 py-4 rounded-3xl text-[12px] font-black uppercase tracking-[0.25em] flex items-center border border-red-100 shadow-2xl shadow-red-200/40">
              <i className="fa-solid fa-triangle-exclamation mr-4 text-red-500 text-lg"></i>
              {error}
            </div>
          </div>
        )}
      </div>

      <div className="p-10 bg-gradient-to-t from-white/20 to-transparent">
        <div className="max-w-4xl mx-auto relative group">
          <div className="absolute -inset-2 bg-white/40 rounded-[3rem] blur-2xl opacity-0 group-focus-within:opacity-100 transition duration-1000"></div>
          <div className="relative flex items-center bg-white border border-white/50 rounded-[3rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)] p-3 transition-all duration-500 focus-within:shadow-[0_40px_80px_-10px_rgba(0,0,0,0.25)] focus-within:-translate-y-2">
            <button 
              onClick={toggleListening}
              className={`flex items-center justify-center h-14 w-14 ml-1 rounded-full transition-all duration-300 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-zen-50 text-zen-400 hover:bg-zen-100'}`}
              title={isListening ? "Stop listening" : "Start voice input"}
            >
              <i className={`fa-solid ${isListening ? 'fa-microphone-lines' : 'fa-microphone'}`}></i>
            </button>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isListening ? "Listening..." : "Unburden your mind here..."}
              className="flex-1 bg-transparent py-5 px-6 text-[17px] text-black placeholder:text-zen-300 focus:outline-none font-medium"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="flex items-center justify-center h-14 w-14 bg-black text-white rounded-full hover:bg-zen-900 hover:scale-110 active:scale-90 transition-all duration-300 disabled:opacity-10 shadow-2xl"
            >
              <i className="fa-solid fa-arrow-up text-lg"></i>
            </button>
          </div>
        </div>
        
        <div className="mt-8 flex items-center justify-center space-x-8 opacity-40">
          <p className="text-[10px] text-zen-950 font-black uppercase tracking-[0.4em] flex items-center">
            <i className="fa-solid fa-vault mr-3"></i>
            Neural Encryption
          </p>
          <span className="w-1.5 h-1.5 bg-zen-950 rounded-full"></span>
          <p className="text-[10px] text-zen-950 font-black uppercase tracking-[0.4em]">
            Premium Sanctuary Mode
          </p>
        </div>
      </div>
    </div>
  );
};

export default TherapistChat;