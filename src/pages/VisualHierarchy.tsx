import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye } from 'lucide-react';
import LearningHarness from '@/components/ui/LearningHarness';
import { useLearning } from '@/engine/LearningContext';
import { useAntiFrustration } from '@/hooks/useAntiFrustration';
import { cn } from '@/lib/utils';

export default function VisualHierarchy() {
  return (
    <LearningHarness moduleId="visual-hierarchy" maxLevels={3}>
      <HierarchyLogic />
    </LearningHarness>
  );
}

function HierarchyLogic() {
  const { currentLevel, advanceLevel, recordMistake, phase } = useLearning();
  useAntiFrustration(10000);

  const screenRef = useRef<HTMLDivElement>(null);
  
  const [heatmapPoints, setHeatmapPoints] = useState<{ x: number, y: number, intensity: number }[]>([]);
  const [score, setScore] = useState(0);
  const [levelTransition, setLevelTransition] = useState(false);

  // Layout variables
  const [titleSize, setTitleSize] = useState(1); 
  const [contrastActive, setContrastActive] = useState(false);
  const [spacingActive, setSpacingActive] = useState(false);

  useEffect(() => {
     if (phase !== 'DURING') return;
     setLevelTransition(true);
     setTimeout(() => setLevelTransition(false), 2000);

     setTitleSize(1);
     setContrastActive(false);
     setSpacingActive(false);
     setScore(0);
     setHeatmapPoints([]);
  }, [currentLevel, phase]);

  useEffect(() => {
     if (levelTransition || phase !== 'DURING') return;
     const interval = setInterval(() => {
        let hierarchyScore = 0;
        
        if (currentLevel === 1) {
            if (titleSize > 2.5) hierarchyScore = 100;
        } else if (currentLevel === 2) {
            if (titleSize > 2.5) hierarchyScore += 50;
            if (contrastActive) hierarchyScore += 50;
        } else {
            if (titleSize > 2.5) hierarchyScore += 33.3;
            if (contrastActive) hierarchyScore += 33.3;
            if (spacingActive) hierarchyScore += 33.3;
        }
        
        setScore(Math.min(100, Math.round(hierarchyScore)));
        
        if (hierarchyScore >= 98) {
           setTimeout(advanceLevel, 1000);
        }
     }, 1000);
     return () => clearInterval(interval);
  }, [titleSize, contrastActive, spacingActive, currentLevel, levelTransition, advanceLevel, phase]);

  const handlePointerMove = (e: React.PointerEvent) => {
      if (levelTransition || phase !== 'DURING') return;
      setHeatmapPoints(prev => [...prev.slice(-40), { x: e.clientX, y: e.clientY, intensity: 1 }]);
  };

  const handleApplyMistake = () => {
      if (score < 50) recordMistake();
  };

  return (
    <div 
        ref={screenRef}
        onPointerMove={handlePointerMove}
        className="flex-1 w-full bg-[#020617] text-white flex overflow-hidden relative select-none"
    >
       <AnimatePresence>
         {levelTransition && (
           <motion.div initial={{ opacity: 0, scale: 2 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none text-9xl font-black text-white/5">
             LEVEL {currentLevel}
           </motion.div>
         )}
       </AnimatePresence>

       {/* Live Rendered Blur Map (Simulated Foveated Vision) */}
       <div className="absolute inset-0 z-50 pointer-events-none opacity-40 mix-blend-screen" style={{ filter: 'blur(30px)' }}>
          {heatmapPoints.map((pt, i) => (
             <div 
                key={i}
                className="absolute w-32 h-32 rounded-full"
                style={{
                   left: pt.x - 64,
                   top: pt.y - 64,
                   background: `radial-gradient(circle, rgba(239,68,68,0.8) 0%, rgba(245,158,11,0.5) 40%, transparent 80%)`,
                   transform: `scale(${1 + (i / 40)})`
                }}
             />
          ))}
       </div>

       {/* Control Sidebar */}
       <div className="w-96 bg-black/90 border-r border-white/5 p-8 flex flex-col z-40 backdrop-blur-3xl shrink-0 shadow-2xl">
          <div className="flex items-center gap-2 text-rose-400 mb-6">
             <Eye size={20} /> <span className="text-xs font-black uppercase tracking-widest">Level {currentLevel}</span>
          </div>
          <p className="text-slate-400 text-sm mb-12">
            {currentLevel === 1 ? "Establish absolute typographic scale to guide the eye." : 
             currentLevel === 2 ? "Combine typographical scale with color contrast." :
             "Unite scale, contrast, and whitespace to achieve perfect cognitive dominance."}
          </p>

          <div className="space-y-8">
             <div>
                <label className="text-xs font-bold text-slate-500 uppercase flex justify-between mb-4">
                   <span>Typographical Scale</span>
                   <span>{titleSize.toFixed(1)}rem</span>
                </label>
                <input 
                   type="range" min="1" max="5" step="0.1" value={titleSize} 
                   onChange={e => { setTitleSize(parseFloat(e.target.value)); handleApplyMistake(); }}
                   disabled={levelTransition || phase !== 'DURING'}
                   className="w-full h-2 rounded-lg appearance-none bg-slate-800 accent-rose-500 cursor-pointer"
                />
             </div>
             
             <AnimatePresence>
               {currentLevel >= 2 && (
                 <motion.button
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    onClick={() => { setContrastActive(!contrastActive); handleApplyMistake(); }}
                    disabled={levelTransition || phase !== 'DURING'}
                    className={`w-full py-4 px-6 rounded-xl border flex justify-between items-center transition-all ${contrastActive ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]' : 'bg-slate-900 border-white/10 text-slate-400 hover:bg-white/5'}`}
                 >
                    <span className="font-bold">Color Contrast</span>
                    <div className={`w-4 h-4 rounded-full ${contrastActive ? 'bg-rose-500' : 'bg-white/10'}`} />
                 </motion.button>
               )}
             </AnimatePresence>

             <AnimatePresence>
               {currentLevel >= 3 && (
                 <motion.button
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    onClick={() => { setSpacingActive(!spacingActive); handleApplyMistake(); }}
                    disabled={levelTransition || phase !== 'DURING'}
                    className={`w-full py-4 px-6 rounded-xl border flex justify-between items-center transition-all ${spacingActive ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]' : 'bg-slate-900 border-white/10 text-slate-400 hover:bg-white/5'}`}
                 >
                    <span className="font-bold">Macro Whitespace</span>
                    <div className={`w-4 h-4 rounded-full ${spacingActive ? 'bg-rose-500' : 'bg-white/10'}`} />
                 </motion.button>
               )}
             </AnimatePresence>
          </div>

          <div className="mt-auto">
             <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden shadow-inner flex">
                <motion.div animate={{ width: `${score}%` }} transition={{ type: "spring", damping: 20 }} className="h-full bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.8)]" />
             </div>
             <div className="flex justify-between mt-3">
               <span className="text-[10px] uppercase font-bold tracking-widest text-slate-600">Cognitive Focus</span>
               <span className={cn("text-[10px] uppercase font-black tracking-widest", score === 100 ? "text-emerald-400" : "text-rose-500")}>{score}%</span>
             </div>
          </div>
       </div>

       {/* The Target UI to fix */}
       <div className="flex-1 flex items-center justify-center p-12 bg-slate-950 relative z-10">
          <motion.div 
             layout
             className={`max-w-xl w-full flex flex-col items-start transition-all duration-500 ${spacingActive ? 'gap-12' : 'gap-2'}`}
          >
             <motion.h1 
                layout
                style={{ fontSize: `${titleSize}rem`, lineHeight: 1.1 }}
                className={`font-black tracking-tight transition-colors duration-500 ${contrastActive ? 'text-white' : 'text-slate-600'} drop-shadow-2xl`}
             >
                Deploy Neural Core
             </motion.h1>
             <motion.p layout className="text-slate-400 text-lg leading-relaxed max-w-lg">
                Initialize the background training sequences to map parameters to the GestALT visual recognition matrix.
             </motion.p>
             <motion.button 
                layout
                className={`px-10 py-5 rounded-xl font-black uppercase tracking-widest transition-all duration-500 ${contrastActive ? 'bg-rose-500 text-white shadow-[0_10px_40px_rgba(244,63,94,0.4)] hover:bg-rose-400' : 'bg-slate-800 text-slate-500'}`}
             >
                Execute Sequence
             </motion.button>
          </motion.div>
       </div>

       {/* Grid Background */}
       <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
    </div>
  );
}
