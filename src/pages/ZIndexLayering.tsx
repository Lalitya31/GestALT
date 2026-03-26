import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box } from 'lucide-react';
import LearningHarness from '@/components/ui/LearningHarness';
import { useLearning } from '@/engine/LearningContext';
import { useAntiFrustration } from '@/hooks/useAntiFrustration';

export default function ZIndexLayering() {
  return (
    <LearningHarness moduleId="z-index" maxLevels={3}>
      <ZIndexLogic />
    </LearningHarness>
  );
}

function ZIndexLogic() {
  const { currentLevel, advanceLevel, recordMistake, phase } = useLearning();
  useAntiFrustration(12000);

  const [rotationX, setRotationX] = useState(60);
  const [rotationZ, setRotationZ] = useState(45);
  const [isDragging, setIsDragging] = useState(false);

  // Z-Index Layer Control states. 5 available layers. 
  // Levels map to unlocking layers that must be stacked correctly.
  const [zIndexes, setZIndexes] = useState({ 
     bg: 10, 
     canvas: 20, 
     modal: 5, // Initially wrong
     overlay: 0, // Initially wrong
     popup: 2 // Initially wrong
  });

  const [score, setScore] = useState(0);
  const [levelTransition, setLevelTransition] = useState(false);

  const activeLayers = currentLevel === 1 
      ? ['bg', 'modal'] 
      : currentLevel === 2 
      ? ['bg', 'modal', 'popup'] 
      : ['bg', 'canvas', 'modal', 'overlay', 'popup'];

  useEffect(() => {
     if (phase !== 'DURING') return;
     setLevelTransition(true);
     setTimeout(() => setLevelTransition(false), 2000);

     // Scramble
     setZIndexes({ bg: 10, canvas: 15, modal: 2, overlay: 0, popup: 5 });
  }, [currentLevel, phase]);

  useEffect(() => {
      if (levelTransition || phase !== 'DURING') return;
      // Objective: BG < CANVAS < OVERLAY < MODAL < POPUP
      // For current level logic
      let maxScore = 0;
      let currentScore = 0;

      if (currentLevel === 1) {
          maxScore = 1;
          if (zIndexes.modal > zIndexes.bg) currentScore++;
      } else if (currentLevel === 2) {
          maxScore = 2;
          if (zIndexes.modal > zIndexes.bg) currentScore++;
          if (zIndexes.popup > zIndexes.modal) currentScore++;
      } else {
          maxScore = 4;
          if (zIndexes.canvas > zIndexes.bg) currentScore++;
          if (zIndexes.overlay > zIndexes.canvas) currentScore++;
          if (zIndexes.modal > zIndexes.overlay) currentScore++;
          if (zIndexes.popup > zIndexes.modal) currentScore++;
      }

      const percentage = (currentScore / maxScore) * 100;
      setScore(percentage);
      
      // Delay advance to let the rotation effect settle visually
      if (percentage === 100) {
         setTimeout(advanceLevel, 1500);
      }
  }, [zIndexes, currentLevel, levelTransition, advanceLevel, phase]);

  const handlePointerDown = () => setIsDragging(true);
  const handlePointerUp = () => setIsDragging(false);
  const handlePointerMove = (e: React.PointerEvent) => {
      if (!isDragging || levelTransition || phase !== 'DURING') return;
      setRotationZ(prev => prev - e.movementX * 0.5);
      setRotationX(prev => Math.max(0, Math.min(90, prev - e.movementY * 0.5)));
  };

  const handleZChange = (key: string, val: number) => {
      setZIndexes(p => ({...p, [key]: val}));

      // Basic frustration trigger: if someone sets a negative UI layer depth
      if (val < 0) recordMistake();
  };

  return (
    <div 
       className="flex-1 w-full bg-[#020617] text-white overflow-hidden flex flex-col items-center justify-center relative touch-none cursor-grab active:cursor-grabbing select-none"
       onPointerDown={handlePointerDown}
       onPointerMove={handlePointerMove}
       onPointerUp={handlePointerUp}
       onPointerLeave={handlePointerUp}
    >
       <AnimatePresence>
         {levelTransition && (
           <motion.div initial={{ opacity: 0, scale: 2 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none text-9xl font-black text-white/5">
             LEVEL {currentLevel}
           </motion.div>
         )}
       </AnimatePresence>

       <header className="absolute top-12 left-12 max-w-lg z-50 pointer-events-none">
          <div className="bg-black/50 backdrop-blur-md rounded-2xl border border-white/5 p-8 pointer-events-auto">
             <div className="flex items-center gap-2 text-fuchsia-400 mb-2">
                <Box size={20} /> <span className="text-xs font-black uppercase tracking-widest">Level {currentLevel}</span>
             </div>
             <h1 className="text-3xl font-black mb-1 tracking-tight">Dimensional Layering</h1>
             <p className="text-slate-400 text-sm mb-6">Interfaces exist in physical 3D space. Drag the canvas to rotate the camera, then fix the depth collisions below to establish absolute Z-order.</p>
             
             <div className="flex flex-wrap bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                 {activeLayers.map((layer, i) => (
                    <div key={layer} className={`flex-1 min-w-[30%] p-4 ${i !== activeLayers.length - 1 ? 'border-r border-white/10 border-b relative' : ''}`}>
                       <span className="block text-[10px] uppercase font-bold text-slate-500 mb-1">{layer}</span>
                       <input 
                         type="number" 
                         value={zIndexes[layer as keyof typeof zIndexes]} 
                         onChange={e => handleZChange(layer, parseInt(e.target.value) || 0)} 
                         disabled={levelTransition || phase !== 'DURING'}
                         className="w-full bg-slate-950 font-mono font-bold text-lg text-white outline-none rounded p-1 text-center" 
                       />
                    </div>
                 ))}
             </div>
          </div>
       </header>

       {/* Subliminal Feedback */}
       <div className="absolute top-12 right-12 bg-black/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex flex-col items-center pointer-events-none">
           <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Architecture Integrity</span>
           <span className={`text-5xl font-mono font-black drop-shadow-[0_0_15px_rgba(217,70,239,0.5)] ${score === 100 ? 'text-emerald-400' : 'text-fuchsia-400'}`}>{score}%</span>
       </div>

       {/* The Physical 3D Render Environment */}
       <div className="relative w-full h-[80vh] flex items-center justify-center [perspective:1500px] z-10 pointer-events-auto">
          <motion.div 
             className="relative w-[500px] h-[500px] [transform-style:preserve-3d]"
           style={{ pointerEvents: 'all', cursor: 'grab', position: 'relative', zIndex: 2 }}
             animate={{ rotateX: rotationX, rotateZ: rotationZ }}
             transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
             {/* Base Background Grid Always present */}
             <div 
                 className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm border-2 border-slate-700 rounded-3xl [transform:translateZ(0px)] transition-all duration-700 flex items-center justify-center overflow-hidden"
                 style={{ zIndex: zIndexes.bg }}
             >
                 <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:2rem_2rem]" />
                 <span className="font-black text-slate-700 text-6xl opacity-50 tracking-widest">DOM</span>
             </div>

             {/* Canvas Application (Level 3) */}
             <AnimatePresence>
               {activeLayers.includes('canvas') && (
                 <motion.div 
                     initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                     className="absolute inset-8 bg-blue-900/30 backdrop-blur-sm border-2 border-dashed border-blue-500 rounded-2xl [transform:translateZ(50px)] transition-all duration-700 flex p-6 shadow-xl"
                     style={{ zIndex: zIndexes.canvas }}
                 >
                    <span className="font-bold text-blue-300/50 uppercase tracking-widest text-xs">Canvas App Render</span>
                 </motion.div>
               )}
             </AnimatePresence>

             {/* Overlay scrim (Level 3) */}
             <AnimatePresence>
               {activeLayers.includes('overlay') && (
                 <motion.div 
                     initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                     className="absolute -inset-10 bg-black/60 shadow-2xl [transform:translateZ(100px)] transition-all duration-700"
                     style={{ zIndex: zIndexes.overlay }}
                 />
               )}
             </AnimatePresence>

             {/* The Modal Layer (Level 1+) */}
             <div 
                 className="absolute inset-16 bg-fuchsia-900/60 backdrop-blur-2xl border-4 border-fuchsia-500 rounded-2xl [transform:translateZ(150px)] transition-all duration-700 flex flex-col p-8 items-center justify-center shadow-[0_0_80px_rgba(217,70,239,0.4)]"
                 style={{ zIndex: zIndexes.modal }}
             >
                 <span className="font-bold text-fuchsia-200 tracking-widest uppercase mb-6 text-xl">Core Modal</span>
                 <div className="w-full h-8 bg-fuchsia-500/20 rounded-xl mb-3 border border-fuchsia-500/30" />
                 <div className="w-full flex gap-3"><div className="w-1/2 h-8 bg-fuchsia-500/20 rounded-xl" /><div className="w-1/2 h-8 bg-fuchsia-500/50 rounded-xl" /></div>
             </div>

             {/* The Context Popup (Level 2+) */}
             <AnimatePresence>
                {activeLayers.includes('popup') && (
                  <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute -top-12 -right-12 w-64 h-32 bg-amber-900/90 backdrop-blur-3xl border-4 border-amber-500 rounded-2xl [transform:translateZ(250px)] transition-all duration-700 flex flex-col p-6 items-center justify-center shadow-[0_0_60px_rgba(245,158,11,0.6)]"
                      style={{ zIndex: zIndexes.popup }}
                  >
                      <span className="font-black text-amber-200 tracking-widest uppercase mb-2">Toast Event</span>
                      <p className="text-xs text-amber-500/80 text-center font-bold">Absolute top depth required.</p>
                  </motion.div>
                )}
             </AnimatePresence>

          </motion.div>
       </div>
    </div>
  );
}
