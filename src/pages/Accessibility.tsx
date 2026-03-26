import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Glasses, AlertOctagon } from 'lucide-react';
import { cn } from '@/lib/utils';
import LearningHarness from '@/components/ui/LearningHarness';
import { useLearning } from '@/engine/LearningContext';
import { useAntiFrustration } from '@/hooks/useAntiFrustration';

export default function Accessibility() {
  return (
    <LearningHarness moduleId="accessibility" maxLevels={3}>
      <AccessibilityLogic />
    </LearningHarness>
  );
}

function AccessibilityLogic() {
  const { currentLevel, advanceLevel, recordMistake, phase } = useLearning();
  useAntiFrustration(12000);

  const [filterMode, setFilterMode] = useState<'normal' | 'protanopia' | 'blur'>('blur');
  const [contrastScale, setContrastScale] = useState(1); 
  const [fontSizeRatio, setFontSizeRatio] = useState(1); 
  const [levelTransition, setLevelTransition] = useState(false);

  useEffect(() => {
     if (phase !== 'DURING') return;
     setLevelTransition(true);
     setTimeout(() => setLevelTransition(false), 2000);

     // Reset values per level so user has to work
     setContrastScale(1);
     setFontSizeRatio(1);

     if (currentLevel === 1) setFilterMode('protanopia');
     else if (currentLevel === 2) setFilterMode('blur');
     else setFilterMode('normal'); // For level 3, maybe strict contrast rules
  }, [currentLevel, phase]);

  const isAccessible = (() => {
      // Different passing logic based on level constraint
      if (currentLevel === 1) return contrastScale >= 4; // Fix color blind
      if (currentLevel === 2) return fontSizeRatio >= 2; // Fix blurry vision
      return contrastScale >= 4.5 && fontSizeRatio >= 2; // Fix WCAG AAA
  })();

  const simulateAccessibilityFix = () => {
     if (levelTransition || phase !== 'DURING') return;
     
     if (isAccessible) {
         advanceLevel();
     } else {
         recordMistake(); // Submitted inaccessible UI
     }
  };

  return (
    <div className="flex-1 w-full bg-[#020617] text-white flex overflow-hidden relative select-none">
       <AnimatePresence>
         {levelTransition && (
           <motion.div initial={{ opacity: 0, scale: 2 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none text-9xl font-black text-white/5">
             LEVEL {currentLevel}
           </motion.div>
         )}
       </AnimatePresence>
       
       <svg className="hidden">
           <filter id="protanopia">
              <feColorMatrix type="matrix" values="0.567, 0.433, 0, 0, 0, 0.558, 0.442, 0, 0, 0, 0, 0.242, 0.758, 0, 0, 0, 0, 0, 1, 0"/>
           </filter>
       </svg>

       {/* Live UI Playground passing through Lens Filter */}
       <div 
          className="flex-1 bg-white flex items-center justify-center p-12 transition-all duration-700 relative"
          style={{
             filter: filterMode === 'protanopia' ? 'url(#protanopia)' : filterMode === 'blur' ? 'blur(5px) contrast(1.1)' : 'none'
          }}
       >
          <div className="max-w-lg w-full flex flex-col items-center text-center">
             <AlertOctagon size={80} className="mb-8" style={{ color: `rgba(220, 38, 38, ${0.1 + (contrastScale * 0.18)})` }} />
             
             <h2 
               className="font-black tracking-tight mb-6"
               style={{ 
                   fontSize: `${1.5 * fontSizeRatio}rem`,
                   color: `rgba(0, 0, 0, ${0.1 + (contrastScale * 0.18)})` 
               }}
             >
                Critical Data Loss Detected
             </h2>
             
             <p 
               className="font-medium mb-12 leading-relaxed"
               style={{ 
                   fontSize: `${1 * fontSizeRatio}rem`,
                   color: `rgba(0, 0, 0, ${0.1 + (contrastScale * 0.18)})` 
               }}
             >
                14% of the global population experiences some form of visual impairment. If this text is illegible, the interface fails to serve humanity. Adjust the rendering scalars until cognition is restored.
             </p>

             <button 
                className="px-10 py-5 rounded-2xl font-black tracking-widest w-full uppercase"
                style={{
                    backgroundColor: `rgba(220, 38, 38, ${0.1 + (contrastScale * 0.18)})`,
                    color: `rgba(255, 255, 255, ${0.3 + (contrastScale * 0.14)})`,
                    fontSize: `${1 * fontSizeRatio}rem`
                }}
             >
                Acknowledge Alert
             </button>
          </div>
       </div>

       {/* Architect Control Panel */}
       <div className="w-[480px] bg-black/95 border-l border-white/5 p-12 flex flex-col z-40 backdrop-blur-3xl shrink-0 shadow-2xl">
          
          <div className="flex items-center gap-2 text-violet-400 mb-4">
             <Glasses size={24} /> <span className="text-xs font-black uppercase tracking-widest">Level {currentLevel}</span>
          </div>
          <h1 className="text-3xl font-black mb-3 tracking-tight">Accessibility (WCAG)</h1>
          <p className="text-slate-400 text-sm mb-12 leading-relaxed">
            {currentLevel === 1 ? "Simulating Protanopia (Red-Blind). The warning is invisible. Adjust the Luminosity Contrast Factor." :
             currentLevel === 2 ? "Simulating Cataract Blur. High contrast isn't enough; the target size must increase." :
             "Standard Audit: Achieve WCAG AAA standard by pushing both contrast and size simultaneously."}
          </p>

          <div className="space-y-4 mb-16">
             <span className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-3 border-b border-white/10 pb-2">Active Optical Simulation</span>
             <button disabled className={cn("w-full p-4 rounded-xl border text-left font-bold transition-all", filterMode === 'normal' ? "bg-violet-500/20 border-violet-500 text-violet-400 shadow-inner" : "bg-white/5 border-white/10 text-slate-500")}>
                20/20 Vision (Control)
             </button>
             <button disabled className={cn("w-full p-4 rounded-xl border text-left font-bold transition-all", filterMode === 'blur' ? "bg-violet-500/20 border-violet-500 text-violet-400 shadow-inner" : "bg-white/5 border-white/10 text-slate-500")}>
                Low Acuity (Cataract Blur)
             </button>
             <button disabled className={cn("w-full p-4 rounded-xl border text-left font-bold transition-all", filterMode === 'protanopia' ? "bg-violet-500/20 border-violet-500 text-violet-400 shadow-inner" : "bg-white/5 border-white/10 text-slate-500")}>
                Protanopia (Red-Blind)
             </button>
          </div>

          <div className="space-y-12 mt-auto mb-16">
             <div>
                <label className="text-xs font-black text-slate-400 uppercase flex justify-between mb-4 tracking-widest">
                   <span>Luminosity Contrast</span>
                   <span className="text-white bg-white/10 px-2 py-1 rounded">{(contrastScale * 2.1).toFixed(1)}:1</span>
                </label>
                <input 
                   type="range" min="1" max="5" step="0.5" value={contrastScale} 
                   onChange={e => setContrastScale(parseFloat(e.target.value))}
                   disabled={levelTransition || phase !== 'DURING'}
                   className="w-full h-3 bg-slate-800 rounded-full appearance-none accent-violet-500 cursor-pointer shadow-inner"
                />
             </div>
             
             <div>
                <label className="text-xs font-black text-slate-400 uppercase flex justify-between mb-4 tracking-widest">
                   <span>Base Target Size</span>
                   <span className="text-white bg-white/10 px-2 py-1 rounded">{(fontSizeRatio * 16).toFixed(0)}px</span>
                </label>
                <input 
                   type="range" min="1" max="3" step="0.2" value={fontSizeRatio} 
                   onChange={e => setFontSizeRatio(parseFloat(e.target.value))}
                   disabled={levelTransition || phase !== 'DURING'}
                   className="w-full h-3 bg-slate-800 rounded-full appearance-none accent-violet-500 cursor-pointer shadow-inner"
                />
             </div>
          </div>

          <button 
             onClick={simulateAccessibilityFix}
             disabled={levelTransition || phase !== 'DURING'}
             className={cn("w-full py-6 rounded-2xl font-black uppercase tracking-widest transition-all", isAccessible ? "bg-white text-black shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:scale-105" : "bg-white/5 text-slate-600 hover:bg-white/10")}
          >
             Commit Audit
          </button>
       </div>

    </div>
  );
}
