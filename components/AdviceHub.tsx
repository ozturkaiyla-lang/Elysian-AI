
import React from 'react';
import { AdviceCategory } from '../types';

const CATEGORIES: AdviceCategory[] = [
  {
    title: "Restoring the Union",
    icon: "fa-rings-wedding",
    description: "Navigate marital storms, revive intimacy, and bridge communication gaps.",
    prompt: "I want deep advice on how to start repairing a marriage where we feel like strangers."
  },
  {
    title: "Trust Reclamation",
    icon: "fa-shield-heart",
    description: "Strategies for healing after betrayal or deep disappointment.",
    prompt: "How can I begin to rebuild trust when it has been fundamentally broken by a partner?"
  },
  {
    title: "Inner Equanimity",
    icon: "fa-cloud-sun",
    description: "Rediscover joy and self-worth during isolated life phases.",
    prompt: "I've lost my sense of self. How do I cultivate happiness from within?"
  },
  {
    title: "The Path Ahead",
    icon: "fa-compass-slate",
    description: "Clarity for career shifts, major losses, and personal rebirths.",
    prompt: "I am at a crossroads in life and feel paralyzed. What is the path to clarity?"
  }
];

interface AdviceHubProps {
  onSelectPrompt: (prompt: string) => void;
}

const AdviceHub: React.FC<AdviceHubProps> = ({ onSelectPrompt }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {CATEGORIES.map((cat, idx) => (
        <button
          key={idx}
          onClick={() => onSelectPrompt(cat.prompt)}
          className="group p-8 bg-white border border-white rounded-[2rem] text-left hover:shadow-2xl hover:shadow-zen-200 transition-all duration-500 hover:-translate-y-1 relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-zen-50 flex items-center justify-center mb-6 group-hover:bg-zen-950 group-hover:text-white transition-all duration-300">
              <i className={`fa-solid ${cat.icon} text-lg text-zen-700 group-hover:text-white transition-colors`}></i>
            </div>
            <h3 className="text-lg font-serif font-bold text-zen-950 mb-2">{cat.title}</h3>
            <p className="text-sm text-zen-500 leading-relaxed font-medium">{cat.description}</p>
          </div>
          <div className="absolute right-0 top-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
             <i className="fa-solid fa-arrow-up-right text-4xl text-zen-950"></i>
          </div>
        </button>
      ))}
      <div className="md:col-span-2 p-10 bg-gradient-to-br from-zen-900 to-zen-950 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <h2 className="text-2xl font-serif italic mb-4">Immediate Resonance</h2>
          <p className="text-sm text-zen-400 max-w-lg leading-loose font-medium opacity-80">Our advanced reasoning mode is tailored for the complexities of the human heart. If you are facing a crisis of trust or direction, begin a Deep Session below.</p>
        </div>
        <div className="absolute right-[-40px] bottom-[-40px] opacity-5 rotate-12">
          <i className="fa-solid fa-feather-pointed text-[200px]"></i>
        </div>
      </div>
    </div>
  );
};

export default AdviceHub;
