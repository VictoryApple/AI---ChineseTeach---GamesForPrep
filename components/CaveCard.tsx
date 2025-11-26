import React, { useState } from 'react';
import { GridItem, THEME_CONFIG } from '../types';
import { playTTS } from '../services/geminiService';

interface CaveCardProps {
  item: GridItem;
  mode: 'interactive' | 'print-cover' | 'print-content';
  index: number;
  showPinyin: boolean;
}

// Helper to get darker shadow color based on background color class
const getShadowColor = (bgClass: string) => {
  switch (bgClass) {
    case 'bg-[#facbbd]': return '#e6a693'; // Pink darker
    case 'bg-[#fceccb]': return '#e6ce99'; // Yellow darker
    case 'bg-[#d6f2e4]': return '#a6dabb'; // Green darker
    case 'bg-[#e2dbf8]': return '#c4b6ea'; // Purple darker
    case 'bg-[#d0e8ff]': return '#9dc4e8'; // Blue darker
    default: return '#cbd5e1';
  }
};

// Simple Pop Sound Generator using Web Audio API
const playPopSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Sound Design: A quick pitch sweep up (Bloop/Pop)
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(400, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.15);
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

export const CaveCard: React.FC<CaveCardProps> = ({ item, mode, index, showPinyin }) => {
  const [isRevealed, setIsRevealed] = useState(item.isRevealed);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const themeConfig = THEME_CONFIG[item.theme];

  const handleReveal = () => {
    if (mode === 'interactive' && !isRevealed && !isAnimating) {
      playPopSound(); // Play Sound
      setIsAnimating(true);
      
      // Delay the actual state change slightly to allow the "anticipation" animation to play
      setTimeout(() => {
        setIsRevealed(true);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleSpeak = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking) return;
    setIsSpeaking(true);
    await playTTS(item.content);
    setIsSpeaking(false);
  };

  // --- PRINT MODE STYLES (Simple & Clean) ---
  if (mode === 'print-cover') {
    return (
      <div className="w-full h-full p-2">
        <div className="w-full h-full rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center relative bg-gray-50">
           <span className="text-3xl text-gray-300 font-cute">?</span>
           <div className="absolute bottom-2 text-[10px] text-gray-400 font-cute">剪裁线</div>
        </div>
      </div>
    );
  }

  if (mode === 'print-content') {
    return (
      <div className="w-full h-full p-2">
         {item.type === 'text' ? (
           <div className={`w-full h-full rounded-2xl border-4 ${item.color.replace('bg-', 'border-').replace('100', '200').replace('200', '300')} bg-white flex flex-col items-center justify-center`}>
              {showPinyin && <div className="text-xl text-gray-500 font-bold mb-2 font-cute">{item.subContent}</div>}
              <div className="text-6xl font-kaiti font-bold text-black">{item.content}</div>
           </div>
         ) : (
           <div className={`w-full h-full rounded-2xl border-4 border-dashed border-gray-200 bg-white flex items-center justify-center`}>
              {item.imageUrl ? <img src={item.imageUrl} className="w-24 h-24 object-contain" /> : null}
           </div>
         )}
      </div>
    );
  }

  // --- INTERACTIVE MODE (3D Block Style) ---
  const shadowColor = getShadowColor(item.color);
  const isPressed = isRevealed; // The card stays "pressed" once revealed

  return (
    <div className="w-full aspect-square relative select-none">
        <div 
        onClick={handleReveal}
        style={{
            boxShadow: isPressed 
            ? 'none' 
            : `0 10px 0 ${shadowColor}`,
            transform: isPressed 
            ? 'translateY(10px)' 
            : 'translateY(0)',
        }}
        className={`
            relative w-full h-full rounded-[2rem] cursor-pointer 
            transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
            ${item.color}
            ${isPressed ? 'shadow-inner border-t-4 border-black/5' : 'border-b-4 border-white/20'}
        `}
        >
        {/* CARD CONTENT */}
        <div className="absolute inset-0 p-5 flex flex-col justify-between">
            
            {/* HEADER: Category / Rating lookalike */}
            <div className="flex justify-between items-start">
            <div className="bg-white/40 backdrop-blur-sm rounded-full p-2 w-10 h-10 flex items-center justify-center">
                <span className="text-lg">
                {isRevealed 
                    ? (item.type === 'text' ? '📖' : '🎁')
                    : themeConfig.icon
                }
                </span>
            </div>
            
            {/* Fake Rating Pill */}
            <div className="bg-white px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                <span className="text-yellow-400 text-xs">★</span>
                <span className="text-xs font-bold text-slate-700">4.{8 + (index % 2)}</span>
            </div>
            </div>

            {/* BODY: Main Content */}
            <div className="flex-1 flex items-center justify-center relative">
            
            {/* UNREVEALED STATE */}
            <div className={`transition-all duration-300 absolute inset-0 flex flex-col items-center justify-center
                ${isRevealed ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 scale-100'}
            `}>
                <span className="text-lg font-cute text-slate-700/60 mb-1">盲盒</span>
                <span className="text-4xl font-cute text-slate-800 opacity-20">?</span>
            </div>

            {/* REVEALED STATE */}
            <div className={`transition-all duration-500 delay-100 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex flex-col items-center justify-center w-full z-10
                ${isRevealed ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
            `}>
                {item.type === 'text' ? (
                    <>
                    {showPinyin && (
                        <span className="text-sm sm:text-lg text-slate-600 font-bold font-cute mb-1 tracking-wider bg-white/30 px-3 rounded-full">{item.subContent}</span>
                    )}
                    <div className="relative group/text">
                        <span className="text-5xl sm:text-6xl font-kaiti font-bold text-slate-800 drop-shadow-sm">{item.content}</span>
                        
                        {/* TTS Button */}
                        <button 
                        onClick={handleSpeak}
                        className="absolute -right-8 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white hover:scale-110 transition-all shadow-sm opacity-0 group-hover/text:opacity-100"
                        >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-slate-600 ${isSpeaking ? 'animate-pulse text-pink-400' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                        </button>
                    </div>
                    </>
                ) : (
                    <div className="w-24 h-24 sm:w-28 sm:h-28 relative">
                    {item.imageUrl ? (
                        <img src={item.imageUrl} className="w-full h-full object-contain drop-shadow-md animate-pop" alt="surprise" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                    )}
                    </div>
                )}
            </div>
            </div>

            {/* FOOTER: Just Index now, avatars removed */}
            <div className="flex justify-end items-end h-6">
                <span className="text-xs font-bold text-slate-500/50 font-mono">#{index + 1}</span>
            </div>

        </div>
        </div>
    </div>
  );
};