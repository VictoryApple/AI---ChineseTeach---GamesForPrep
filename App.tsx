import React, { useState, useEffect } from 'react';
import { CaveCard } from './components/CaveCard';
import { generatePinyinData, generateCharacterImage } from './services/geminiService';
import { generateGridItems } from './utils/pokemonUtils';
import { GridItem, Theme, THEME_CONFIG } from './types';

// Icons
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const GridIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const BellIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
const PrintIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;

export default function App() {
  const [inputText, setInputText] = useState("汉字盲盒");
  const [items, setItems] = useState<GridItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPinyin, setShowPinyin] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<Theme>('pokemon');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  // Track active page logic for UI
  const [activeTab, setActiveTab] = useState<'interactive' | 'print'>('interactive');

  // Initial Load
  useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const handleGenerate = async () => {
    setIsLoading(true);
    const cleanText = inputText.replace(/[^\u4e00-\u9fa5]/g, '');
    const chars = cleanText.split('').filter(c => c.trim() !== '');
    const pinyinData = await generatePinyinData(chars);
    const newItems = generateGridItems(pinyinData, currentTheme, 12);
    setItems(newItems);
    setIsLoading(false);

    if (currentTheme !== 'pokemon') {
      generateAIImages(newItems, currentTheme);
    }
  };

  const generateAIImages = async (gridItems: GridItem[], theme: Theme) => {
    const stylePrompts: Record<Theme, string> = {
      pokemon: 'pokemon creature',
      ultraman: 'Ultraman superhero, silver and red sci-fi suit, glowing eyes, chibi style',
      bluey: 'Bluey style cartoon dog, pastel colors, flat design, cute',
      sanrio: 'Sanrio style cute character, kawaii, Hello Kitty aesthetics, soft rounded shapes'
    };
    const prompt = stylePrompts[theme];
    const surpriseItems = gridItems.filter(item => item.type === 'surprise' && !item.imageUrl);
    await Promise.all(surpriseItems.map(async (item) => {
      const imageUrl = await generateCharacterImage(theme, prompt);
      if (imageUrl) {
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, imageUrl } : i));
      }
    }));
  };

  const handleDownloadPDF = async () => {
    if (!(window as any).html2pdf) {
      alert("PDF 组件未加载，请刷新页面重试");
      return;
    }
    setIsGeneratingPdf(true);
    await new Promise(resolve => setTimeout(resolve, 200));
    const element = document.getElementById('pdf-content');
    if (element) {
      const opt = {
        margin: 0,
        filename: `汉字盲盒-${THEME_CONFIG[currentTheme].name}-${new Date().toISOString().slice(0,10)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      try {
        await (window as any).html2pdf().set(opt).from(element).save();
      } catch (err) {
        console.error("PDF generation error:", err);
        alert("生成 PDF 失败，请重试");
      }
    }
    setIsGeneratingPdf(false);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#FDFBF8] text-slate-800 font-sans overflow-x-hidden print:bg-white">
      
      {/* 1. LEFT SIDEBAR - NAVIGATION */}
      <aside className="no-print lg:w-24 bg-[#FDFBF8] flex lg:flex-col items-center justify-between lg:justify-start py-4 lg:py-8 px-4 border-b lg:border-b-0 lg:border-r border-slate-100 z-10">
        <div className="mb-0 lg:mb-12">
           <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-bold text-xl font-cute">
             盒
           </div>
        </div>
        
        <nav className="flex lg:flex-col gap-6">
           <button 
             onClick={() => setActiveTab('interactive')}
             className={`p-3 rounded-2xl transition-all ${activeTab === 'interactive' ? 'bg-black text-white shadow-lg' : 'bg-white text-slate-400 hover:bg-slate-100'}`}
           >
             <HomeIcon />
           </button>
           <button 
             onClick={() => setActiveTab('print')}
             className={`p-3 rounded-2xl transition-all ${activeTab === 'print' ? 'bg-black text-white shadow-lg' : 'bg-white text-slate-400 hover:bg-slate-100'}`}
           >
             <PrintIcon />
           </button>
           <button className="p-3 rounded-2xl bg-white text-slate-400 hover:bg-slate-100 hidden lg:block">
             <GridIcon />
           </button>
        </nav>

        <div className="hidden lg:block mt-auto">
          <button className="p-3 rounded-2xl bg-white text-slate-400 hover:bg-slate-100">
             <SettingsIcon />
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto no-scrollbar">
        
        {/* Header */}
        <header className="no-print mb-8">
          <h1 className="text-4xl lg:text-5xl font-cute text-slate-800 mb-6">
            快乐识字 <br className="hidden lg:block"/>
            <span className="text-slate-400">汉字盲盒</span>
          </h1>
          
          {/* Theme Pills */}
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
             <button className="px-5 py-2 rounded-full bg-black text-white font-bold text-sm whitespace-nowrap">
               全部
             </button>
             {(Object.keys(THEME_CONFIG) as Theme[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setCurrentTheme(t)}
                  className={`px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all border border-transparent
                    ${currentTheme === t 
                      ? 'bg-white border-slate-200 shadow-md text-slate-800' 
                      : 'bg-[#F2F0EB] text-slate-400 hover:bg-[#e8e6e1]'
                    }`}
                >
                  {THEME_CONFIG[t].icon} {THEME_CONFIG[t].name}
                </button>
             ))}
          </div>
        </header>

        {/* --- INTERACTIVE GRID VIEW --- */}
        <div className={activeTab === 'interactive' ? 'block' : 'hidden'}>
          <div className="no-print mb-4 flex justify-between items-center">
             <h2 className="text-xl font-bold font-cute text-slate-700">盲盒列表</h2>
             <span className="text-sm text-slate-400 bg-white px-3 py-1 rounded-full">共 {items.length} 个</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 animate-fade-in pb-20 lg:pb-0">
             {items.map((item, index) => (
               <CaveCard 
                 key={item.id} 
                 item={item} 
                 index={index} 
                 mode="interactive"
                 showPinyin={showPinyin} 
               />
             ))}
             {items.length === 0 && !isLoading && (
               <div className="col-span-full py-20 text-center text-slate-400 font-cute">
                 输入汉字并点击“生成”开始游戏！
               </div>
             )}
          </div>
        </div>

        {/* --- PRINT PREVIEW VIEW --- */}
        <div className={activeTab === 'print' ? 'block' : 'hidden'}>
           <div className="no-print bg-black text-white rounded-3xl p-6 mb-8 flex justify-between items-center shadow-xl">
             <div>
               <h3 className="text-2xl font-cute">准备打印?</h3>
               <p className="text-slate-400 text-sm mt-1">生成 A4 PDF 文件，包含封面和内容页。</p>
             </div>
             <button 
               onClick={handleDownloadPDF}
               disabled={isGeneratingPdf}
               className="bg-white text-black px-6 py-3 rounded-xl font-bold font-cute hover:bg-slate-200 disabled:opacity-50 flex items-center gap-2"
             >
               {isGeneratingPdf ? '生成中...' : <><DownloadIcon /> 下载 PDF</>}
             </button>
           </div>
           
           {/* PDF Content Wrapper */}
           <div id="pdf-content" className={`flex flex-col items-center ${isGeneratingPdf ? '' : 'gap-8'}`}>
              {/* Cover Page */}
              <div className={`a4-page bg-white p-10 ${isGeneratingPdf ? '' : 'shadow-lg'}`}>
                  <div className="text-center border-b-2 border-dashed border-slate-100 pb-4 mb-8 flex justify-between items-end">
                      <h2 className="text-2xl font-cute text-slate-300">汉字盲盒封面</h2>
                      <div className="text-sm font-cute text-slate-400">主题: {THEME_CONFIG[currentTheme].name}</div>
                  </div>
                  <div className="grid grid-cols-3 grid-rows-4 gap-4 h-[230mm]">
                      {items.map((item, index) => (
                        <CaveCard key={`cover-${item.id}`} item={item} index={index} mode="print-cover" showPinyin={showPinyin} />
                      ))}
                  </div>
              </div>

              {/* Content Page */}
              <div className={`a4-page bg-white p-10 ${isGeneratingPdf ? '' : 'shadow-lg'}`}>
                <div className="text-center border-b-2 border-dashed border-slate-100 pb-4 mb-8 flex justify-between items-end">
                    <h2 className="text-2xl font-cute text-slate-700">汉字内容页</h2>
                    <div className="text-sm font-cute text-slate-400">请沿虚线剪开封面粘贴</div>
                </div>
                <div className="grid grid-cols-3 grid-rows-4 gap-4 h-[230mm]">
                    {items.map((item, index) => (
                      <CaveCard key={`content-${item.id}`} item={item} index={index} mode="print-content" showPinyin={showPinyin} />
                    ))}
                </div>
              </div>
           </div>
        </div>
      </main>

      {/* 3. RIGHT SIDEBAR - CONTROLS */}
      <aside className="no-print w-full lg:w-80 bg-[#FDFBF8] p-4 lg:p-8 border-l border-slate-100 flex flex-col gap-6">
        
        {/* User Profile / Top Bar */}
        <div className="flex justify-between items-center">
           <button className="p-2 rounded-full hover:bg-slate-100 relative">
             <BellIcon />
             <span className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full"></span>
           </button>
           <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
               <div className="font-bold text-sm text-slate-800">语文老师</div>
               <div className="text-xs text-slate-400">Admin</div>
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
             </div>
           </div>
        </div>

        {/* Input Card */}
        <div className="bg-white p-5 rounded-[2rem] shadow-sm">
           <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-slate-700">输入汉字</h3>
             <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-400">Activity</span>
           </div>
           
           <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-4 bg-[#F8F6F4] rounded-2xl border-none resize-none text-slate-700 font-kaiti text-lg focus:ring-2 focus:ring-slate-200 outline-none mb-4"
              rows={4}
              placeholder="例如：天空，学校..."
            />
            
            <button
               onClick={handleGenerate}
               disabled={isLoading}
               className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
               {isLoading ? '生成中...' : '重新生成'}
            </button>
        </div>

        {/* Toggle Widget */}
        <div className="bg-[#E0F2FE] p-5 rounded-[2rem] flex items-center justify-between">
           <div>
             <div className="font-bold text-sky-800">显示拼音</div>
             <div className="text-xs text-sky-600/70">辅助识字</div>
           </div>
           
           <button 
             onClick={() => setShowPinyin(!showPinyin)}
             className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${showPinyin ? 'bg-sky-500' : 'bg-sky-200'}`}
           >
             <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${showPinyin ? 'translate-x-5' : 'translate-x-0'}`}></div>
           </button>
        </div>

        {/* My Courses / Featured (Just Decoration or History) */}
        <div className="bg-[#FCE7F3] p-5 rounded-[2rem] flex-1 min-h-[150px] relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-5 opacity-20 transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
              <span className="text-6xl">🎁</span>
           </div>
           <h3 className="font-bold text-pink-900 mb-1">精选主题</h3>
           <p className="text-xs text-pink-700/70 mb-4">来自 AI 的创意生成</p>
           
           <div className="flex gap-2">
             <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-xs">⚡</div>
             <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-xs">🎀</div>
             <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-xs">🦴</div>
           </div>
        </div>

      </aside>

    </div>
  );
}
