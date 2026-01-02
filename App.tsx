import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { SessionMode, UserProfile } from './types';
import TherapistChat from './components/TherapistChat';
import AdviceHub from './components/AdviceHub';
import ProfileSetup from './components/ProfileSetup';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-zen-900 selection:text-white">
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
        <h1 className="text-7xl md:text-9xl font-serif font-bold text-black mb-14 leading-[1] tracking-