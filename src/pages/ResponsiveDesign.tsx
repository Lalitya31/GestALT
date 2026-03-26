import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MonitorSmartphone, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import LearningHarness from '@/components/ui/LearningHarness';
import { useLearning } from '@/engine/LearningContext';
import { useAntiFrustration } from '@/hooks/useAntiFrustration';

export default function ResponsiveDesign() {
  return (
    <LearningHarness moduleId="responsive-design" maxLevels={3}>
      <ResponsiveLogic />
    </LearningHarness>
  );
}

function ResponsiveLogic() {
  const { currentLevel, advanceLevel, recordMistake, phase } = useLearning();
  useAntiFrustration(12000);

  const [viewportWidth, setViewportWidth] = useState(800);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [levelTransition, setLevelTransition] = useState(false);

  // Constraints applied by user
  const [flexWrap, setFlexWrap] = useState(false);
  const [clampTypography, setClampTypography] = useState(false);
  
  useEffect(() => {
     if (phase !== 'DURING') return;
     setLevelTransition(true);
     setTimeout(() => setLevelTransition(false), 2000);

     // Reset architecture on level change
     setFlexWrap(false);
     setClampTypography(false);
     setViewportWidth(800);
  }, [currentLevel, phase]);

  const handleDrag = (_: any, info: any) => {
     if (levelTransition || phase !== 'DURING') return;
     const newWidth = Math.max(300, Math.min(1000, viewportWidth + info.delta.x));
     setViewportWidth(newWidth);
  };

  const handleApplyConstraint = (type: 'wrap' | 'clamp') => {
      if (levelTransition || phase !== 'DURING') return;
      
      let isMistake = false;
      if (type === 'wrap' && currentLevel === 2) isMistake = true;
      if (type === 'clamp' && currentLevel === 1) isMistake = true;

      if (isMistake) {
          recordMistake(); // Applying wrong constraint for current level goal
      }

      if (type === 'wrap') setFlexWrap(!flexWrap);
      if (type === 'clamp') setClampTypography(!clampTypography);
  };

  const checkValidation = () => {
      if (levelTransition || phase !== 'DURING') return;

      let valid = false;
      if (currentLevel === 1 && flexWrap && !clampTypography) valid = true;
      if (currentLevel === 2 && !flexWrap && clampTypography) valid = true;
      if (currentLevel === 3 && flexWrap && clampTypography) valid = true;

      if (valid) {
          advanceLevel();
      } else {
          recordMistake();
      }
  };

  return (
    <div className="flex-1 w-full bg-[#020617] text-white flex flex-col relative overflow-hidden select-none">
       <AnimatePresence>
         {levelTransition && (
           <motion.div initial={{ opacity: 0, scale: 2 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none text-9xl font-black text-white/5">
             LEVEL {currentLevel}
           </motion.div>
         )}
       </AnimatePresence>

       <header className="w-full flex justify-between items-center p-8 z-50 pointer-events-none relative drop-shadow-2xl">
          <div className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/5 p-8 max-w-lg pointer-events-auto">
             <div className="flex items-center gap-2 text-sky-400 mb-2">
                <MonitorSmartphone size={20} /> <span className="text-xs font-black uppercase tracking-widest">Level {currentLevel}</span>
             </div>
             <h1 className="text-3xl font-black mb-2">Responsive Constraints</h1>
             <p className="text-slate-400 text-sm leading-relaxed">
               {currentLevel === 1 ? "Components are shattering outside the viewport. Apply horizontal flex constraints." :
                currentLevel === 2 ? "Typography is bleeding out of bounds. Apply mathematical optical scaling." :
                "Combine structural wraps with optical scaling to achieve pure ubiquitous fluidity."}
             </p>
          </div>
       </header>

       {/* Control Panel (Bottom) */}
       <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-center z-40 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none">
           <div className="bg-black/90 backdrop-blur-3xl border border-white/10 rounded-[32px] p-6 flex gap-6 shadow-[0_0_50px_rgba(14,165,233,0.1)] pointer-events-auto">
               <button 
                  onClick={() => handleApplyConstraint('wrap')}
                  disabled={levelTransition || phase !== 'DURING'}
                  className={cn("px-8 py-5 rounded-2xl font-bold font-mono transition-all", flexWrap ? "bg-sky-500/20 border border-sky-500 text-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.3)]" : "bg-slate-900 border border-white/5 text-slate-500 hover:bg-slate-800")}
               >
                  flex-wrap: wrap;
               </button>
               <button 
                  onClick={() => handleApplyConstraint('clamp')}
                  disabled={levelTransition || phase !== 'DURING'}
                  className={cn("px-8 py-5 rounded-2xl font-bold font-mono transition-all", clampTypography ? "bg-sky-500/20 border border-sky-500 text-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.3)]" : "bg-slate-900 border border-white/5 text-slate-500 hover:bg-slate-800")}
               >
                  font-size: clamp(1rem, 5vw, 4rem);
               </button>
               <button 
                  onClick={checkValidation}
                  disabled={levelTransition || phase !== 'DURING'}
                  className="px-10 py-5 bg-white text-black font-black uppercase tracking-widest rounded-3xl hover:bg-sky-100 hover:scale-105 transition-all outline-none"
               >
                  Compile Payload
               </button>
           </div>
       </div>

       {/* The Viewport Simulator Playground */}
       <div className="flex-1 flex items-center justify-center p-8 w-full z-10">
           
           <div ref={containerRef} className="relative h-[65vh] flex">
              {/* Device Window */}
              <div 
                 className="h-full bg-slate-900 border-2 border-slate-700/50 rounded-l-[40px] shadow-2xl overflow-hidden transition-all duration-75 relative flex flex-col p-12"
                 style={{ width: `${viewportWidth}px` }}
              >
                  {/* Warning Overlay when broken */}
                  <AnimatePresence>
                     {((!flexWrap && viewportWidth < 750) || (!clampTypography && viewportWidth < 600)) && (
                         <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 border-[6px] border-rose-500/50 pointer-events-none rounded-l-[35px] z-50 flex items-start justify-center pt-4 shadow-[inset_0_0_50px_rgba(244,63,94,0.3)]">
                             <div className="bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full flex items-center gap-2">
                                <ShieldAlert size={14} /> Structural Fracture Detected
                             </div>
                         </motion.div>
                     )}
                  </AnimatePresence>

                  {/* Internal DOM that needs fixing */}
                  <h2 
                     className="font-black text-white shrink-0 mb-12 whitespace-nowrap transition-all duration-300 drop-shadow-xl"
                     style={{ 
                         fontSize: clampTypography ? `clamp(1rem, ${viewportWidth * 0.05}px, 4rem)` : '4rem',
                         lineHeight: 1.1
                     }}
                  >
                     Fluid Architecture.
                  </h2>

                  <div 
                     className="flex gap-6 transition-all duration-300 w-full"
                     style={{ flexWrap: flexWrap ? 'wrap' : 'nowrap' }}
                  >
                      <div className="h-40 bg-gradient-to-br from-sky-500/40 to-blue-500/20 border border-sky-400/50 rounded-3xl shrink-0 shadow-lg" style={{ flex: '1 1 200px' }} />
                      <div className="h-40 bg-gradient-to-br from-sky-500/40 to-blue-500/20 border border-sky-400/50 rounded-3xl shrink-0 shadow-lg" style={{ flex: '1 1 200px' }} />
                      <div className="h-40 bg-gradient-to-br from-sky-500/40 to-blue-500/20 border border-sky-400/50 rounded-3xl shrink-0 shadow-lg" style={{ flex: '1 1 200px' }} />
                  </div>
                  
                  {/* Width Indicator Badge */}
                  <div className="absolute bottom-6 left-12 bg-black/80 px-4 py-2 rounded-full text-xs font-mono font-bold text-sky-400 tracking-widest border border-white/10 backdrop-blur-xl">
                     <span className="text-slate-500 mr-2">VW</span> {Math.round(viewportWidth)}px
                  </div>
              </div>

              {/* Draggable Handle */}
              <motion.div
                 drag="x"
                 dragConstraints={{ left: -500, right: 200 }}
                 dragElastic={0}
                 dragMomentum={false}
                 onDrag={handleDrag}
                 className="w-20 h-full bg-slate-800 border-y-2 border-r-2 border-slate-700/50 rounded-r-[40px] flex flex-col items-center justify-center cursor-ew-resize hover:bg-slate-700 transition-colors z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] active:bg-sky-900 active:border-sky-500 group"
              >
                 <div className="w-1.5 h-8 bg-slate-500 group-active:bg-sky-400 rounded-full mb-1 transition-colors" />
                 <div className="w-1.5 h-8 bg-slate-500 group-active:bg-sky-400 rounded-full mb-1 transition-colors" />
                 <div className="w-1.5 h-8 bg-slate-500 group-active:bg-sky-400 rounded-full transition-colors" />
              </motion.div>
           </div>
       </div>
    </div>
  );
}
