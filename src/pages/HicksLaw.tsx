import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import LearningHarness from '@/components/ui/LearningHarness';
import { useLearning } from '@/engine/LearningContext';
import { useAntiFrustration } from '@/hooks/useAntiFrustration';

export default function HicksLaw() {
  return (
    <LearningHarness moduleId="hicks-law" maxLevels={3}>
      <HicksLogic />
    </LearningHarness>
  );
}

function HicksLogic() {
  const { currentLevel, advanceLevel, recordMistake, phase } = useLearning();
  useAntiFrustration(8000); // 8s idle limit on Hick's is super bad (supposed to be fast)

  const [timeLeft, setTimeLeft] = useState(10);
  const [items, setItems] = useState<{ id: string, isTarget: boolean }[]>([]);
  const [levelTransition, setLevelTransition] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  const difficultyGridSizes = [8, 24, 64]; // L1, L2, L3

  useEffect(() => {
     if (phase !== 'DURING') return;
     setLevelTransition(true);
     setTimeout(() => setLevelTransition(false), 2000);

     const count = difficultyGridSizes[currentLevel - 1];
     const targetIndex = Math.floor(Math.random() * count);
     
     const newItems = Array.from({ length: count }).map((_, i) => ({
         id: `item-${currentLevel}-${i}`,
         isTarget: i === targetIndex
     }));
     
     setItems(newItems);
     setTimeLeft(currentLevel === 1 ? 5 : currentLevel === 2 ? 4.5 : 4);
  }, [currentLevel, phase]);

  useEffect(() => {
     if (levelTransition || phase !== 'DURING') return;
     
     timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
            if (prev <= 0.1) {
                // Time ran out! The user succumbed to decision fatigue
                recordMistake(); 
                return currentLevel === 1 ? 5 : currentLevel === 2 ? 4.5 : 4; // Reset time so game keeps running
            }
            return prev - 0.1;
        });
     }, 100);

     return () => clearInterval(timerRef.current);
  }, [levelTransition, phase, currentLevel, recordMistake]);

  const handleItemClick = (isTarget: boolean) => {
      if (levelTransition || phase !== 'DURING') return;
      
      if (isTarget) {
          advanceLevel();
      } else {
          // Penalty
          setTimeLeft(prev => Math.max(0, prev - 1.5));
          recordMistake(); // Log a wrong click as a frustration metric
      }
  };

  const initialTime = currentLevel === 1 ? 5 : currentLevel === 2 ? 4.5 : 4;

  return (
    <div className="flex-1 w-full bg-[#020617] text-white overflow-hidden flex flex-col items-center justify-center relative p-8">
       
       <AnimatePresence>
         {levelTransition && (
           <motion.div initial={{ opacity: 0, scale: 2 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none text-9xl font-black text-white/5">
             LEVEL {currentLevel}
           </motion.div>
         )}
       </AnimatePresence>

       <header className="absolute top-12 left-1/2 -translate-x-1/2 w-full max-w-5xl flex justify-between items-center z-50">
          <div className="flex items-center gap-3 bg-black/50 backdrop-blur-md rounded-2xl border border-white/5 p-6 pointer-events-auto">
             <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400">
                <Brain size={24} />
             </div>
             <div>
                <h1 className="text-xl font-black tracking-tight">Hick's Law Stress Test (Level {currentLevel})</h1>
                <p className="text-slate-400 text-xs mt-1 max-w-xs leading-relaxed">Decision time increases logarithmically with choice count.</p>
             </div>
          </div>

          <div className="flex flex-col items-end pointer-events-auto bg-black/50 backdrop-blur-md p-6 rounded-2xl border border-white/5">
             <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-2">Target Identity</span>
             <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 px-6 py-3 rounded-lg font-black tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <Zap size={16} /> EMERALD NODE
             </div>
          </div>
       </header>

       {/* Intense Center Threat Meter */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none select-none z-0 opacity-10 flex items-center justify-center">
          <span className="text-[400px] font-black text-rose-500">{Math.ceil(timeLeft)}</span>
       </div>

       {/* The Noise Grid (The problem of Choice Overload) */}
       <div className="relative w-full max-w-7xl h-[60vh] z-10 p-8 mt-16">
          <motion.div 
             key={currentLevel}
             initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
             className={cn(
                 "grid w-full h-full gap-2 md:gap-4",
                 currentLevel === 1 ? "grid-cols-4 grid-rows-2" : currentLevel === 2 ? "grid-cols-8 grid-rows-3" : "grid-cols-12 grid-rows-6"
             )}
          >
             {items.map(item => (
                <button
                   key={item.id}
                   onClick={() => handleItemClick(item.isTarget)}
                   disabled={levelTransition}
                   className={cn(
                       "w-full h-full rounded-md md:rounded-xl border transition-all active:scale-90",
                       item.isTarget ? "bg-emerald-500/20 border-emerald-500/50 hover:bg-emerald-500/40" : "bg-white/5 border-white/5 hover:bg-white/10"
                   )}
                />
             ))}
          </motion.div>
       </div>

       {/* Visual Progress Bar HUD */}
       <div className="absolute bottom-12 w-full max-w-3xl bg-black/80 p-3 rounded-full border border-white/10 backdrop-blur-md z-40">
           <div className="h-3 w-full rounded-full overflow-hidden bg-rose-950 flex shadow-inner">
               <motion.div 
                  className="h-full bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.8)]"
                  style={{ width: `${(timeLeft / initialTime) * 100}%` }}
               />
           </div>
       </div>

    </div>
  );
}
