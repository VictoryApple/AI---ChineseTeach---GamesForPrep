import React, { useState } from 'react';
import { GridItem, THEME_CONFIG } from '../types';
import { playTTS } from '../services/geminiService';

interface CaveCardProps {
  item: GridItem;
  mode: 'interactive' | 'print-cover' | 'print-content';
  index: number;
  showPinyin: boolean;
}

export const CaveCard: React.FC<CaveCardProps> = ({ item, mode, index, showPinyin }) => {
  const [isRevealed, setIsRevealed] = useState(item.isRevealed);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const themeConfig = THEME_CONFIG[item.theme];

  const handleReveal = () => {
    if (mode === 'interactive' && !isRevealed && !isAnimating) {
      // Trigger animation
      setIsAnimating(true);
      
      // Delay reveal to allow animation to play partway through
      setTimeout(() => {
        setIsRevealed(true);
        setIsAnimating(false);
      }, 350);
    }
  };

  const handleSpeak = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking) return;
    setIsSpeaking(true);
    await playTTS(item.content);
    setIsSpeaking(false);
  };

  // --- PRINT MODE: PAGE 1 (Cover / Holes) ---
  if (mode === 'print-cover') {
    return (
      <div className="w-full h-full flex items-center justify-center p-2">
        {/* The Blind Box "Box" Look */}
        <div className={`relative w-full h-full rounded-2xl border-4 border-dashed border-gray-300 flex flex-col items-center justify-center bg-white overflow-hidden`}>
          
          {/* Colorful Pattern Background */}
          <div className={`absolute inset-0 opacity-20 ${themeConfig.pattern} ${themeConfig.bg}`}></div>

          {/* Hole Cutting Guide */}
          <div className="absolute inset-2 border-2 border-gray-200 border-dashed rounded-full flex items-center justify-center bg-gray-50">
             <span className="text-4xl font-cute font-black text-gray-300 opacity-50">?</span>
          </div>

          {/* Label */}
          <div className={`absolute -top-3 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm z-10`}>
             <span className="text-sm font-cute text-gray-400">Box #{index + 1}</span>
          </div>

          <div className="absolute bottom-2 text-[10px] text-gray-400 font-bold tracking-widest z-10 font-cute">
             ✂️ CUT OUT
          </div>
        </div>
      </div>
    );
  }

  // --- PRINT MODE: PAGE 2 (Content) ---
  if (mode === 'print-content') {
    return (
      <div className="w-full h-full p-2">
        <div className={`w-full h-full rounded-3xl flex flex-col items-center justify-center border-4 ${item.color.replace('bg-', 'border-').replace('500', '200').replace('400', '200')} bg-white relative overflow-hidden`}>
          
          {/* Background decoration */}
          <div className={`absolute top-0 left-0 w-full h-4 ${item.color.replace('bg-', 'bg-').replace('500', '100').replace('400', '100')}`}></div>
          <div className={`absolute bottom-0 left-0 w-full h-4 ${item.color.replace('bg-', 'bg-').replace('500', '100').replace('400', '100')}`}></div>

          {item.type === 'text' ? (
            <div className="flex flex-col items-center z-10">
              {showPinyin && <div className="text-xl text-gray-400 font-bold mb-1 font-cute tracking-widest">{item.subContent}</div>}
              {/* Using font-kaiti for standard KaiTi font */}
              <div className="text-6xl font-kaiti text-gray-800 font-bold">{item.content}</div>
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-full w-full p-2">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt="Surprise" className="w-full h-full object-contain drop-shadow-sm" />
                ) : (
                  <span className="text-xs text-gray-400 font-cute">Loading AI...</span>
                )}
             </div>
          )}
          <div className="absolute bottom-1 right-3 text-xs text-gray-300 font-cute">#{index + 1}</div>
        </div>
      </div>
    );
  }

  // --- INTERACTIVE MODE ---
  // A cute, bouncy, 3D-ish card style
  return (
    <div 
      onClick={handleReveal}
      className={`relative w-full aspect-square rounded-[2rem] transition-all duration-300 transform cursor-pointer overflow-hidden group select-none
        ${isAnimating ? 'animate-pop' : ''}
        ${!isRevealed && !isAnimating ? 'hover:scale-105 hover:-rotate-1 hover:shadow-2xl' : 'shadow-md'}
        ${isRevealed ? 'bg-white ring-4 ring-offset-2 ' + item.color.replace('bg-', 'ring-') : 'shadow-xl'}
      `}
    >
      {/* The Cover (Blind Box Lid) */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 z-20
        ${isRevealed ? 'opacity-0 pointer-events-none scale-150' : 'opacity-100'}
        ${themeConfig.bg}
      `}>
        {/* Pattern Overlay */}
        <div className={`absolute inset-0 opacity-30 ${themeConfig.pattern}`}></div>
        
        {/* 3D Reflection Highlight */}
        <div className="absolute top-4 left-4 right-4 h-1/3 bg-gradient-to-b from-white/30 to-transparent rounded-t-[1.5rem]"></div>

        {/* Center Badge */}
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center shadow-[0_4px_0_rgba(0,0,0,0.1)] border-4 border-white/50 group-hover:scale-110 transition-transform duration-300">
            <span className={`text-3xl sm:text-4xl font-cute select-none ${themeConfig.bg.replace('bg-', 'text-')}`}>?</span>
        </div>

        <div className="absolute bottom-4 px-4 py-1 bg-black/10 rounded-full backdrop-blur-sm">
          <span className="text-white font-cute font-bold text-xs uppercase tracking-widest">Tap Me!</span>
        </div>

        <div className="absolute top-3 right-3 bg-white/20 w-8 h-8 rounded-full flex items-center justify-center text-white font-cute font-bold shadow-sm">
          {index + 1}
        </div>
      </div>

      {/* The Content */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center p-2 sm:p-3 z-10 bg-white
         ${isRevealed ? 'animate-bounce-in' : 'opacity-0'}
      `}>
        {item.type === 'text' ? (
          <div className="flex flex-col items-center justify-center h-full w-full relative">
            {showPinyin && (
              <span className="text-xl sm:text-2xl text-gray-400 font-bold mb-1 font-cute tracking-wide">{item.subContent}</span>
            )}
            
            {/* The main character - big and bold KaiTi */}
            <span className="text-6xl sm:text-7xl font-kaiti font-bold text-gray-800 drop-shadow-sm">{item.content}</span>
            
            {/* Play Button - Cute floating style */}
            <button 
              onClick={handleSpeak}
              disabled={isSpeaking}
              className={`absolute -bottom-1 -right-1 sm:bottom-0 sm:right-0 p-3 rounded-full transition-all shadow-sm
                 ${isSpeaking ? 'bg-gray-100 text-gray-400 scale-95' : 'bg-blue-50 text-blue-400 hover:bg-blue-100 hover:scale-110 hover:shadow-md'}
              `}
              title="Read Aloud"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isSpeaking ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full h-full justify-center relative rounded-xl overflow-hidden">
             {/* Simple colorful background for surprise */}
             <div className={`absolute inset-0 opacity-20 ${item.color}`}></div>
             
             {item.imageUrl ? (
                <img src={item.imageUrl} alt="Surprise" className="w-full h-full object-contain relative z-10 drop-shadow-md animate-pulse-slow transform hover:scale-110 transition-transform duration-500" />
             ) : (
               <div className="flex flex-col items-center text-gray-400 animate-pulse z-10">
                 <div className="w-12 h-12 rounded-full bg-gray-100 mb-2 border-4 border-gray-50"></div>
                 <span className="text-xs font-cute">Loading...</span>
               </div>
             )}
             <span className={`absolute bottom-2 font-cute text-white text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md z-20 ${themeConfig.accent}`}>
               Surprise!
             </span>
          </div>
        )}
      </div>
    </div>
  );
};