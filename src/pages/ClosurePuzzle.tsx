import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Aperture } from 'lucide-react';
import LearningHarness from '@/components/ui/LearningHarness';
import { useLearning } from '@/engine/LearningContext';
import { useAntiFrustration } from '@/hooks/useAntiFrustration';
import { cn } from '@/lib/utils';

export default function ClosurePuzzle() {
  return (
    <LearningHarness moduleId="closure-puzzle" maxLevels={3}>
      <ClosureLogic />
    </LearningHarness>
  );
}

function ClosureLogic() {
  const { currentLevel, advanceLevel, recordMistake, phase } = useLearning();
  useAntiFrustration(8000);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [isScratching, setIsScratching] = useState(false);
  const [levelTransition, setLevelTransition] = useState(false);

  // Level thresholds: The higher the level, the LESS you should need to scratch to recognize it.
  const targetThreshold = currentLevel === 1 ? 25 : currentLevel === 2 ? 15 : 10;
  
  useEffect(() => {
     if (phase !== 'DURING') return;
     setLevelTransition(true);
     setTimeout(() => setLevelTransition(false), 2000);

     const canvas = canvasRef.current;
     if (!canvas) return;
     const ctx = canvas.getContext('2d');
     if (!ctx) return;

     // Reset canvas with full opaque cover
     ctx.globalCompositeOperation = 'source-over';
     ctx.fillStyle = "#0f172a";
     ctx.fillRect(0, 0, canvas.width, canvas.height);
     
     // Noise for perceptual texturing
     for (let i=0; i<1500; i++) {
        ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.5)";
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
     }
     
     setScore(0);
  }, [currentLevel, phase]);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!isScratching || levelTransition || phase !== 'DURING') return;
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      // Calculate scaled coordinates since canvas width/height attributes differ from CSS
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Scratching (destination-out)
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 50, 0, Math.PI * 2);
      ctx.fill();

      // Estimate pixel clear area simply by bounding box accumulation for performance
      setScore(prev => {
          const newScore = Math.min(100, prev + 0.15); // Add score per drag event
          return newScore;
      });
  };

  useEffect(() => {
    // If the user over-scratched (revealed more than 50% on Level 2/3), it means they failed Closure
    if (score > 50 && phase === 'DURING') {
       recordMistake(); // AI should yell at them
    }
  }, [score, phase, recordMistake]);

  const declareClosure = () => {
    // If they revealed enough to pass the threshold but didn't over-scratch!
    if (score >= targetThreshold / 2) {
       advanceLevel();
    } else {
       recordMistake(); // They guessed too early
    }
  };

  return (
    <div className="flex-1 w-full bg-[#020617] text-white p-8 md:p-16 relative overflow-hidden flex flex-col items-center">
       
       <AnimatePresence>
         {levelTransition && (
           <motion.div initial={{ opacity: 0, scale: 2 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none text-9xl font-black text-white/5">
             LEVEL {currentLevel}
           </motion.div>
         )}
       </AnimatePresence>

       <header className="w-full max-w-5xl flex justify-between items-end mb-12 relative z-[50]">
          <div className="bg-black/50 backdrop-blur-md rounded-2xl border border-white/5 p-8 max-w-md pointer-events-auto">
             <div className="flex items-center gap-2 text-rose-400 mb-2">
                <Aperture size={20} /> <span className="text-xs font-black uppercase tracking-widest">Level {currentLevel}</span>
             </div>
             <h1 className="text-3xl font-black mb-2 tracking-tight">Perceptual Reconstruction</h1>
             <p className="text-slate-400 text-sm mb-6">Humans perceive shapes before fully rendering them. Scratch to reveal the underlying UI elements. <strong className="text-rose-300">Clicking 'I See It' before revealing too much proves your architectural insight.</strong></p>
             
             <button onClick={declareClosure} className="w-full py-3 bg-rose-500 hover:bg-rose-400 text-white font-bold tracking-widest uppercase rounded-xl shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all">
                I See It
             </button>
          </div>

          <div className="bg-black/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex flex-col items-center pointer-events-auto">
             <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Target Revealed Range</span>
             <span className={cn("text-5xl font-mono font-black drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]", score > 50 ? "text-rose-600" : score > targetThreshold / 2 ? "text-emerald-400" : "text-rose-400")}>
                {Math.round(score)}%
             </span>
             <span className="text-[10px] text-slate-500 mt-2">Max allowed: 50%</span>
          </div>
       </header>

       {/* Interactive Scratch-Off Canvas */}
       <div className="relative w-full max-w-4xl aspect-video rounded-[32px] overflow-hidden border-4 border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10">
           
           {/* Background Hidden Image (The Target) */}
           <div className="absolute inset-0 bg-slate-900 flex flex-col p-12 overflow-hidden shadow-inner">
               {currentLevel === 1 && (
                 <div className="w-full h-full border-8 border-rose-500/20 rounded-[40px] flex gap-4 p-8 items-center">
                     <div className="w-32 h-32 aspect-square rounded-full border-8 border-rose-500/40" />
                     <div className="flex-1 flex flex-col gap-4 p-4 border border-rose-500/10 rounded-2xl">
                         <div className="w-3/4 h-8 bg-rose-500/20 rounded-lg" />
                         <div className="w-full h-24 bg-rose-500/10 rounded-xl" />
                     </div>
                 </div>
               )}
               {currentLevel === 2 && (
                 <div className="w-full h-full flex items-center justify-between gap-8 py-10 px-20">
                    <div className="flex flex-col gap-4">
                       <div className="w-64 h-12 bg-indigo-500/20 rounded border-l-4 border-indigo-500" />
                       <div className="w-48 h-12 bg-indigo-500/10 rounded" />
                       <div className="w-48 h-12 bg-indigo-500/10 rounded" />
                    </div>
                    <div className="flex-1 max-w-sm rounded-[40px] border-4 border-indigo-500/20 aspect-[9/16] flex justify-center p-4">
                       <div className="w-1/2 h-2 bg-indigo-500/40 rounded-full" />
                    </div>
                 </div>
               )}
               {currentLevel === 3 && (
                 <div className="w-full h-full grid grid-cols-4 grid-rows-3 gap-6">
                    <div className="col-span-1 row-span-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex flex-col p-4 gap-4">
                       <div className="w-full aspect-square rounded-full bg-emerald-500/20" />
                       <div className="w-full h-8 bg-emerald-500/20 rounded mt-auto" />
                    </div>
                    <div className="col-span-3 row-span-1 bg-emerald-500/15 rounded-2xl flex items-center p-6 justify-between border border-emerald-500/20">
                       <div className="w-1/3 h-12 bg-emerald-500/30 rounded-xl" />
                       <div className="flex gap-2"><div className="w-10 h-10 rounded bg-emerald-500/20"/><div className="w-10 h-10 rounded bg-emerald-500/20"/></div>
                    </div>
                    <div className="col-span-2 row-span-2 bg-emerald-500/5 rounded-2xl border border-emerald-500/20" />
                    <div className="col-span-1 row-span-2 bg-emerald-500/10 rounded-2xl flex flex-col justify-end p-4"><div className="w-full h-1/2 bg-emerald-500/20 rounded" /></div>
                 </div>
               )}
           </div>

           {/* Foreground Scratchable Canvas */}
           <canvas
             ref={canvasRef}
             width={1200} height={800}
             className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
             onPointerDown={() => setIsScratching(true)}
             onPointerUp={() => setIsScratching(false)}
             onPointerLeave={() => setIsScratching(false)}
             onPointerMove={handlePointerMove}
           />
       </div>

    </div>
  );
}
