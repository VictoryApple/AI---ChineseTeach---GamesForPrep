import React, { useState, useEffect } from 'react';
import { CaveCard } from './components/CaveCard';
import { generatePinyinData, generateCharacterImage } from './services/geminiService';
import { generateGridItems } from './utils/pokemonUtils';
import { GridItem, Theme, THEME_CONFIG } from './types';

// Icons
const PrintIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
  </svg>
);

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

export default function App() {
  const [inputText, setInputText] = useState("汉字盲盒");
  const [items, setItems] = useState<GridItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPinyin, setShowPinyin] = useState(true);
  const [viewMode, setViewMode] = useState<'interactive' | 'print'>('interactive');
  const [currentTheme, setCurrentTheme] = useState<Theme>('pokemon');

  // Initial Load
  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once on mount

  const handleGenerate = async () => {
    setIsLoading(true);
    
    // 1. Clean input
    const cleanText = inputText.replace(/[^\u4e00-\u9fa5]/g, '');
    const chars = cleanText.split('').filter(c => c.trim() !== '');

    // 2. Generate Pinyin
    const pinyinData = await generatePinyinData(chars);

    // 3. Create Grid Structure (Texts + Empty Surprise Slots)
    const newItems = generateGridItems(pinyinData, currentTheme, 12);
    setItems(newItems); // Render layout immediately
    setIsLoading(false);

    // 4. If theme requires AI generation (not Pokemon), fetch images in background
    if (currentTheme !== 'pokemon') {
      generateAIImages(newItems, currentTheme);
    }
  };

  const generateAIImages = async (gridItems: GridItem[], theme: Theme) => {
    const stylePrompts: Record<Theme, string> = {
      pokemon: 'pokemon creature',
      ultraman: 'Ultraman superhero, silver and red sci-fi suit, glowing eyes, tokusatsu style, cute chibi version',
      bluey: 'Bluey style cartoon dog, rectangular shape, pastel colors, flat design, cute',
      sanrio: 'Sanrio style cute character, kawaii, Hello Kitty aesthetics, pink and white, soft rounded shapes'
    };

    const prompt = stylePrompts[theme];
    
    // Find items that need images
    const surpriseItems = gridItems.filter(item => item.type === 'surprise' && !item.imageUrl);
    
    // Generate images in parallel for efficiency
    await Promise.all(surpriseItems.map(async (item) => {
      const imageUrl = await generateCharacterImage(theme, prompt);
      if (imageUrl) {
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, imageUrl } : i));
      }
    }));
  };

  const handlePrint = () => {
    setViewMode('print');
  };

  const executePrint = () => {
    window.print();
  };

  const themeConfig = THEME_CONFIG[currentTheme];

  return (
    // Added print:pb-0 and print:h-auto to ensure print layout isn't restricted by screen styles
    <div className="min-h-screen font-sans pb-20 selection:bg-pink-200 print:pb-0 print:h-auto print:overflow-visible">
      
      {/* HEADER / CONTROLS - Hidden when printing */}
      <div className="no-print container mx-auto p-4 md:p-6 max-w-5xl">
        <header className="mb-8 text-center pt-4">
          <h1 className="text-5xl md:text-6xl font-cute tracking-wide mb-3 animate-bounce-in text-slate-800 drop-shadow-sm">
             汉字盲盒 <span className="text-4xl align-top">🎁</span>
          </h1>
          <p className="text-slate-500 font-cute text-lg bg-white/60 inline-block px-4 py-1 rounded-full backdrop-blur-sm">
            让识字变得神奇又可爱！
          </p>
        </header>

        {/* Control Panel - "Cloud" style */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 mb-10 border border-white/50">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left: Input */}
            <div className="flex-1">
              <label className="block text-lg font-cute text-slate-600 mb-3 pl-2">
                ✍️ 在此输入汉字
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full p-5 border-2 border-slate-100 rounded-3xl focus:border-pink-300 focus:ring-4 focus:ring-pink-100 outline-none transition-all resize-none text-xl shadow-inner bg-slate-50 font-kaiti text-slate-700"
                rows={3}
                placeholder="在此输入汉字，例如：天空，学校..."
              />
            </div>

            {/* Right: Controls */}
            <div className="flex flex-col gap-5 lg:w-80">
              
              {/* Theme Selector */}
              <div>
                <label className="block text-lg font-cute text-slate-600 mb-3 pl-2">
                  🎨 选择主题
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(THEME_CONFIG) as Theme[]).map((t) => (
                     <button
                       key={t}
                       onClick={() => setCurrentTheme(t)}
                       className={`px-3 py-3 rounded-2xl text-sm font-cute font-bold transition-all border-b-4 active:border-b-0 active:translate-y-1
                         ${currentTheme === t 
                           ? `${THEME_CONFIG[t].bg} text-white border-black/20 shadow-lg transform scale-105` 
                           : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                         }`}
                     >
                       {THEME_CONFIG[t].icon} {THEME_CONFIG[t].name}
                     </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-3 bg-white p-3 pl-4 rounded-2xl border-2 border-slate-100">
                <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input 
                      type="checkbox" 
                      name="toggle" 
                      id="pinyinToggle" 
                      checked={showPinyin}
                      onChange={(e) => setShowPinyin(e.target.checked)}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300 left-0 checked:left-6 checked:border-green-400"
                      style={{ top: '2px' }}
                    />
                    <label 
                      htmlFor="pinyinToggle" 
                      className={`toggle-label block overflow-hidden h-7 rounded-full cursor-pointer transition-colors ${showPinyin ? 'bg-green-300' : 'bg-gray-200'}`}
                    ></label>
                </div>
                <label htmlFor="pinyinToggle" className="text-slate-600 font-cute text-lg cursor-pointer">显示拼音</label>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className={`w-full py-4 px-6 text-white font-cute text-xl rounded-3xl shadow-lg shadow-orange-200 transition-all border-b-4 border-orange-400 active:border-b-0 active:translate-y-1 active:shadow-none flex items-center justify-center bg-orange-300 hover:bg-orange-400 disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                {isLoading ? '请稍候...' : <><RefreshIcon /> 生成盲盒！</>}
              </button>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex justify-center gap-6 mb-8">
           <button
             onClick={() => setViewMode('interactive')}
             className={`flex items-center px-8 py-3 rounded-full font-cute text-lg transition-all border-b-4 active:border-b-0 active:translate-y-1 ${viewMode === 'interactive' ? 'bg-slate-700 text-white border-slate-900 shadow-xl scale-105' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'}`}
           >
             <PlayIcon /> 互动模式
           </button>
           <button
             onClick={handlePrint}
             className={`flex items-center px-8 py-3 rounded-full font-cute text-lg transition-all border-b-4 active:border-b-0 active:translate-y-1 ${viewMode === 'print' ? 'bg-indigo-500 text-white border-indigo-700 shadow-xl scale-105' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'}`}
           >
             <PrintIcon /> 打印模式
           </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="container mx-auto flex justify-center px-4">
        
        {/* INTERACTIVE MODE */}
        {viewMode === 'interactive' && (
          <div className={`no-print bg-white p-8 rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border-8 max-w-4xl w-full relative ${themeConfig.bg.replace('bg-', 'border-')}`}>
             
             {/* Header Badge */}
             <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-8 py-3 rounded-3xl border-4 border-slate-800 shadow-lg z-20 whitespace-nowrap">
                <span className="font-cute text-3xl text-slate-800">{themeConfig.icon} {themeConfig.name} 派对</span>
             </div>
             
             <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 sm:gap-6 mt-8">
               {items.map((item, index) => (
                 <CaveCard 
                   key={item.id} 
                   item={item} 
                   index={index} 
                   mode="interactive"
                   showPinyin={showPinyin} 
                 />
               ))}
             </div>

             <div className="mt-8 text-center text-slate-400 font-cute text-lg">
               点击盲盒发现汉字和{themeConfig.name}惊喜！
             </div>
          </div>
        )}

        {/* PRINT PREVIEW / MODE */}
        <div className={`print-container flex-col items-center w-full ${viewMode === 'interactive' ? 'hidden' : 'flex'}`}>
          
          {/* Print Preview Toolbar - Sticky Top */}
          <div className="no-print sticky top-4 z-50 w-full max-w-2xl mx-auto mb-8 pointer-events-auto">
            <div className="bg-white/95 backdrop-blur-md border border-indigo-100 shadow-xl rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h3 className="font-cute font-bold text-indigo-900 flex items-center gap-2 justify-center sm:justify-start text-xl">
                  <span>🖨️</span> 打印预览
                </h3>
                <p className="text-sm font-cute text-indigo-400 mt-1">A4 • 2 页 • 双面打印</p>
              </div>
              <div className="flex gap-3">
                 <button 
                    type="button"
                    onClick={() => setViewMode('interactive')}
                    className="px-5 py-2 text-sm font-cute font-bold text-slate-500 bg-slate-100 border-b-2 border-slate-200 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    返回
                  </button>
                  <button 
                    type="button"
                    onClick={executePrint}
                    className="px-6 py-2 text-sm font-cute font-bold text-white bg-indigo-500 border-b-4 border-indigo-700 hover:bg-indigo-600 rounded-xl shadow-lg active:border-b-0 active:translate-y-1 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <PrintIcon /> 立即打印
                  </button>
              </div>
            </div>
          </div>

          <div className="print-preview-wrapper w-full flex flex-col items-center gap-12">
            {/* Page 1: Covers */}
            <div className="relative group">
               <div className="no-print absolute -left-16 top-0 bottom-0 hidden lg:flex flex-col justify-center">
                  <span className="text-slate-300 font-cute text-xl -rotate-90 tracking-widest whitespace-nowrap">第 1 页：封面</span>
               </div>
               <div className="a4-page bg-white relative mx-auto shadow-xl print:shadow-none ring-1 ring-black/5">
                  <div className="absolute top-10 left-10 right-10 text-center border-b-4 border-dashed border-slate-100 pb-4 flex justify-between items-end">
                      <h2 className="text-3xl font-cute text-slate-300 uppercase tracking-widest">汉字盲盒</h2>
                      <div className="text-md font-cute text-slate-400 bg-slate-50 px-3 py-1 rounded-lg">主题: {themeConfig.name}</div>
                  </div>
                  
                  <div className="grid grid-cols-3 grid-rows-4 gap-6 h-full pt-28 pb-16 px-10">
                      {items.map((item, index) => (
                        <CaveCard key={`cover-${item.id}`} item={item} index={index} mode="print-cover" showPinyin={showPinyin} />
                      ))}
                  </div>
                  
                  <div className="absolute bottom-6 right-10 text-slate-300 text-xs font-mono">第 1/2 页：封面层 (需剪裁)</div>
               </div>
            </div>

            {/* Page 2: Content */}
            <div className="relative group">
              <div className="no-print absolute -left-16 top-0 bottom-0 hidden lg:flex flex-col justify-center">
                  <span className="text-slate-300 font-cute text-xl -rotate-90 tracking-widest whitespace-nowrap">第 2 页：内容</span>
               </div>
              <div className="a4-page bg-white relative mx-auto shadow-xl print:shadow-none ring-1 ring-black/5">
                <div className="absolute top-10 left-10 right-10 text-center border-b-4 border-dashed border-slate-100 pb-4 flex justify-between items-end">
                    <h2 className="text-3xl font-cute text-slate-700 uppercase tracking-widest">快乐识字 寓教于乐</h2>
                    <div className="text-md font-cute text-slate-400 bg-slate-50 px-3 py-1 rounded-lg">汉字复习</div>
                </div>

                <div className="grid grid-cols-3 grid-rows-4 gap-6 h-full pt-28 pb-16 px-10">
                    {items.map((item, index) => (
                      <CaveCard key={`content-${item.id}`} item={item} index={index} mode="print-content" showPinyin={showPinyin} />
                    ))}
                </div>
                
                <div className="absolute bottom-6 right-10 text-slate-300 text-xs font-mono">第 2/2 页：内容层</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}