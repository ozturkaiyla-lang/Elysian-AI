
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface ProfileSetupProps {
  onComplete: (profile: UserProfile) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onComplete }) => {
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    mainFocus: '',
    context: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile.name && profile.mainFocus) {
      onComplete(profile);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <div className="bg-white/90 backdrop-blur-xl rounded-[3rem] border border-white shadow-2xl p-10 md:p-16">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center mx-auto mb-8 text-white shadow-xl">
            <i className="fa-solid fa-user-astronaut text-3xl"></i>
          </div>
          <h2 className="text-4xl font-serif font-bold text-black mb-4 tracking-tighter">Welcome to Elysian</h2>
          <p className="text-black/50 font-medium text-lg">To provide deep, intelligent guidance, tell me a bit about your current situation.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-black/60 mb-3 ml-2">How should I address you?</label>
            <input 
              required
              type="text" 
              placeholder="Your name"
              value={profile.name}
              onChange={(e) => setProfile({...profile, name: e.target.value})}
              className="w-full bg-white border-2 border-black/5 rounded-[2rem] py-5 px-8 text-lg text-black focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5 transition-all placeholder:text-black/20 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-black/60 mb-3 ml-2">What brings you here today?</label>
            <div className="relative">
              <select 
                required
                value={profile.mainFocus}
                onChange={(e) => setProfile({...profile, mainFocus: e.target.value})}
                className="w-full bg-white border-2 border-black/5 rounded-[2rem] py-5 px-8 text-lg text-black focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5 transition-all appearance-none shadow-sm"
              >
                <option value="" disabled className="text-black/20">Select your primary focus</option>
                <option value="Relationship Repair">Relationship Repair</option>
                <option value="Marriage Counseling">Marriage Counseling</option>
                <option value="Finding Inner Peace">Finding Inner Peace</option>
                <option value="Life Transition Support">Life Transition Support</option>
                <option value="General Happiness">General Happiness</option>
                <option value="Work-Life Balance">Work-Life Balance</option>
              </select>
              <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-black/40">
                <i className="fa-solid fa-chevron-down"></i>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.3em] text-black/60 mb-3 ml-2">Any other context? (Optional)</label>
            <textarea 
              placeholder="e.g., Recently moved, going through a breakup, feeling uninspired..."
              value={profile.context}
              onChange={(e) => setProfile({...profile, context: e.target.value})}
              rows={4}
              className="w-full bg-white border-2 border-black/5 rounded-[2rem] py-5 px-8 text-lg text-black focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5 transition-all placeholder:text-black/20 shadow-sm resize-none"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-black text-white rounded-[2rem] py-6 text-[12px] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-zinc-800 hover:-translate-y-1 transition-all active:scale-95"
          >
            Enter My Sanctuary
          </button>
        </form>

        <div className="mt-12 flex items-center justify-center space-x-4 opacity-30">
          <div className="h-px w-8 bg-black"></div>
          <p className="text-[9px] text-black font-black uppercase tracking-[0.3em]">
            Privacy Guaranteed • Local Storage
          </p>
          <div className="h-px w-8 bg-black"></div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
