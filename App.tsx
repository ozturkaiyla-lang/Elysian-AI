
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { SessionMode, UserProfile } from './types';
import TherapistChat from './components/TherapistChat';
import AdviceHub from './components/AdviceHub';
import ProfileSetup from './components/ProfileSetup';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-zen-900 selection:text-white">
      {/* Premium Glass Nav */}
      <nav className="bg-white/30 backdrop-blur-3xl sticky top-0 z-50 border-b border-white/20">
        <div className="max-w-6xl mx-auto px-10 h-28 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-5 group">
            <div className="w-14 h-14 rounded-[1.5rem] bg-black flex items-center justify-center shadow-2xl shadow-black/30 group-hover:rotate-[15deg] transition-all duration-700">
              <i className="fa-solid fa-feather-pointed text-white text-xl"></i>
            </div>
            <span className="text-3xl font-serif font-bold text-black tracking-tighter">Elysian</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-16 text-[12px] font-black uppercase tracking-[0.4em] text-black/40">
            <Link to="/" className={`${location.pathname === '/' ? 'text-black' : 'hover:text-black/80 transition-colors'} py-3 relative group`}>
              Home
              {location.pathname === '/' && <div className="absolute -bottom-1 left-0 w-full h-1 bg-black rounded-full"></div>}
            </Link>
            <Link to="/session" className={`${location.pathname === '/session' ? 'text-black' : 'hover:text-black/80 transition-colors'} py-3 relative group`}>
              Sanctuary
              {location.pathname === '/session' && <div className="absolute -bottom-1 left-0 w-full h-1 bg-black rounded-full"></div>}
            </Link>
          </div>

          <Link 
            to="/session" 
            className="bg-black text-white px-10 py-4.5 rounded-full text-[11px] font-black uppercase tracking-[0.3em] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] hover:-translate-y-1 transition-all active:scale-95"
          >
            Start Healing
          </Link>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl mx-auto w-full px-8 py-16">
        {children}
      </main>

      <footer className="bg-black py-32 mt-20">
        <div className="max-w-6xl mx-auto px-10 text-center">
          <div className="flex justify-center items-center space-x-8 mb-16 opacity-20">
             <div className="w-32 h-px bg-white"></div>
             <i className="fa-solid fa-leaf text-white text-2xl"></i>
             <div className="w-32 h-px bg-white"></div>
          </div>
          <h2 className="text-5xl font-serif italic text-white mb-10 tracking-tight leading-tight">Quiet restoration for the <br/>complex mind.</h2>
          <p className="text-zen-400 text-sm max-w-xl mx-auto mb-20 leading-[2.5] font-medium tracking-widest uppercase text-opacity-60">
            Harnessing neural intelligence to guide you back to self-worth, trust, and fundamental happiness.
          </p>
          <div className="text-[10px] text-zen-800 font-black uppercase tracking-[0.5em]">
            Elysian Intelligence Lab • Restoring Humanity • {new Date().getFullYear()}
          </div>
        </div>
      </footer>
    </div>
  );
};

const Home: React.FC = () => {
  return (
    <div className="space-y-40 pb-20">
      <header className="text-center py-24 px-6">
        <div className="inline-flex items-center px-6 py-2.5 mb-14 bg-white/40 backdrop-blur-xl rounded-full border border-white shadow-2xl text-black text-[10px] font-black uppercase tracking-[0.4em] animate-in slide-in-from-top duration-1000">
          <span className="w-2 h-2 rounded-full bg-black mr-4 animate-pulse"></span>
          Intelligent Emotional Support
        </div>
        <h1 className="text-7xl md:text-9xl font-serif font-bold text-black mb-14 leading-[1] tracking-tighter">
          Clarity through <br />
          <span className="text-white italic font-normal drop-shadow-sm">gentle reasoning.</span>
        </h1>
        <p className="text-2xl text-black/60 max-w-3xl mx-auto mb-20 leading-relaxed font-medium">
          A premium AI emotional consultant specialized in the delicate art of relationship repair, marital healing, and inner peace.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-10">
          <Link to="/session" className="w-full sm:w-auto px-14 py-7 bg-black text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-[0_35px_70px_-15px_rgba(0,0,0,0.6)] hover:-translate-y-2 hover:shadow-black transition-all duration-500">
            Open Your Sanctuary
          </Link>
          <a href="#advice" className="w-full sm:w-auto px-14 py-7 bg-white/40 backdrop-blur-xl border border-white text-black rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.3em] shadow-2xl hover:bg-white/60 transition-all duration-500">
            Explore Protocols
          </a>
        </div>
      </header>

      <section id="advice" className="pt-32 border-t border-black/10">
        <div className="flex flex-col lg:flex-row items-end justify-between mb-24 gap-10">
          <div className="max-w-2xl">
            <h2 className="text-5xl font-serif font-bold text-black mb-6 tracking-tighter">Support Frameworks</h2>
            <p className="text-xl text-black/50 font-medium leading-relaxed">Select a specialized focus area to receive deep, non-judgmental guidance designed by experts.</p>
          </div>
          <Link to="/session" className="text-[11px] font-black uppercase tracking-[0.5em] text-black/40 hover:text-black flex items-center group transition-all">
            All Protocols <i className="fa-solid fa-arrow-right-long ml-4 group-hover:translate-x-4 transition-transform"></i>
          </Link>
        </div>
        <AdviceHub onSelectPrompt={(p) => window.location.hash = `#/session?q=${encodeURIComponent(p)}`} />
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-16">
        {[
          { icon: 'fa-brain-circuit', title: 'Contextual Depth', text: 'Gemini 3 Pro identifies the unspoken dynamics within your most complex relationships.' },
          { icon: 'fa-shield-halved', title: 'Sacred Privacy', text: 'Your confessions are private, encrypted, and heard only by a non-judgmental mind.' },
          { icon: 'fa-sun-haze', title: 'Joy Rebirth', text: 'Step-by-step neural strategies to reclaim your happiness after life-altering shifts.' }
        ].map((item, i) => (
          <div key={i} className="group p-12 bg-white/20 backdrop-blur-3xl rounded-[3.5rem] border border-white/40 hover:shadow-2xl hover:shadow-black/5 transition-all duration-700 hover:-translate-y-4">
            <div className="w-20 h-20 bg-black rounded-[2rem] flex items-center justify-center mb-12 text-white shadow-2xl group-hover:scale-110 transition-all">
              <i className={`fa-solid ${item.icon} text-2xl`}></i>
            </div>
            <h3 className="text-2xl font-serif font-bold text-black mb-6">{item.title}</h3>
            <p className="text-[16px] text-black/60 leading-[2] font-medium">{item.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

const Session: React.FC<{ userProfile?: UserProfile, setProfile: (p: UserProfile) => void }> = ({ userProfile, setProfile }) => {
  const [mode, setMode] = useState<SessionMode>(SessionMode.FAST);
  const [hasKey, setHasKey] = useState(true);

  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio?.hasSelectedApiKey) {
        const selected = await (window as any).aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleDeepModeClick = async () => {
    if ((window as any).aistudio?.hasSelectedApiKey) {
      const selected = await (window as any).aistudio.hasSelectedApiKey();
      if (!selected) {
        await (window as any).aistudio.openSelectKey();
        setHasKey(true);
      }
    }
    setMode(SessionMode.DEEP);
  };

  if (!userProfile) {
    return <ProfileSetup onComplete={setProfile} />;
  }

  return (
    <div className="flex flex-col space-y-12 h-[85vh] min-h-[750px]">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-12">
        <div className="flex items-center space-x-8 animate-in slide-in-from-left-8 duration-1000">
          <div className="w-20 h-20 rounded-[2rem] bg-black flex items-center justify-center text-white text-2xl font-serif font-bold shadow-2xl uppercase transform hover:rotate-6 transition-transform">
            {userProfile.name ? userProfile.name[0] : '?'}
          </div>
          <div>
            <h1 className="text-5xl font-serif font-bold text-black tracking-tighter">{userProfile.name || 'Your'}'s Space</h1>
            <div className="flex items-center mt-3">
              <div className="w-2 h-2 rounded-full bg-black/20 mr-3"></div>
              <p className="text-[11px] text-black/40 font-black uppercase tracking-[0.3em]">Protocol: {userProfile.mainFocus}</p>
            </div>
          </div>
        </div>
        
        <div className="flex bg-white/20 backdrop-blur-2xl p-2.5 rounded-[3rem] border border-white/50 shadow-2xl relative group transition-all">
          <button 
            onClick={() => setMode(SessionMode.FAST)}
            className={`px-10 py-4.5 rounded-full text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-700 ${mode === SessionMode.FAST ? 'bg-black shadow-2xl text-white' : 'text-black/40 hover:text-black'}`}
          >
            Light Session
          </button>
          <button 
            onClick={handleDeepModeClick}
            className={`px-10 py-4.5 rounded-full text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-700 ${mode === SessionMode.DEEP ? 'bg-indigo-600 shadow-2xl text-white' : 'text-black/40 hover:text-black'}`}
          >
            Deep Reflection
          </button>
          {!hasKey && (
            <div className="absolute -bottom-10 right-6 text-[9px] text-indigo-700 font-black uppercase tracking-[0.3em] flex items-center animate-pulse">
              <i className="fa-solid fa-key mr-3"></i> Select Key for Reflection
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1 min-h-0 animate-in fade-in zoom-in-95 duration-1000">
        <TherapistChat mode={mode} profile={userProfile} />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | undefined>(() => {
    try {
      const saved = localStorage.getItem('elysian_profile');
      return saved ? JSON.parse(saved) : undefined;
    } catch (e) {
      return undefined;
    }
  });

  const handleProfileUpdate = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem('elysian_profile', JSON.stringify(newProfile));
  };

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/session" element={<Session userProfile={profile} setProfile={handleProfileUpdate} />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
