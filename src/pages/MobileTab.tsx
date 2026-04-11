import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target } from 'lucide-react';
import LearningHarness from '@/components/ui/LearningHarness';
import { useLearning } from '@/engine/LearningContext';
import { useAntiFrustration } from '@/hooks/useAntiFrustration';

export default function MobileTab() {
  return (
    <LearningHarness moduleId="mobile-tab" maxLevels={3}>
      <FittsLogic />
    </LearningHarness>
  );
}

function FittsLogic() {
  const { currentLevel, advanceLevel, recordMistake, phase } = useLearning();
  useAntiFrustration(8000);

  const [score, setScore] = useState(0);
  const [hitCount, setHitCount] = useState(0);
  const [levelTransition, setLevelTransition] = useState(false);
  const [hitEffects, setHitEffects] = useState<{ id: number; x: number; y: number }[]>([]);

  // Fitts's parameters per level
  const [targetConfig, setTargetConfig] = useState({ size: 120, x: 50, y: 50, speed: 0 }); 
  
  const containerRef = useRef<HTMLDivElement>(null);

  const requiredHits = currentLevel === 1 ? 2 : currentLevel === 2 ? 3 : 5;

  useEffect(() => {
     if (phase !== 'DURING') return;
     setLevelTransition(true);
     setTimeout(() => setLevelTransition(false), 2000);
     
     setHitCount(0); // Reset hits per level

     if (currentLevel === 1) setTargetConfig({ size: 140, x: 20, y: 70, speed: 1200 });
     else if (currentLevel === 2) setTargetConfig({ size: 80, x: 80, y: 20, speed: 800 });
     else setTargetConfig({ size: 44, x: Math.random() * 80 + 10, y: Math.random() * 80 + 10, speed: 500 }); // Super tiny and fast
  }, [currentLevel, phase]);

  useEffect(() => {
     if (currentLevel < 2 || levelTransition || phase !== 'DURING') return;
     const interval = setInterval(() => {
         setTargetConfig(prev => ({
             ...prev,
             x: Math.random() * 80 + 10,
             y: Math.random() * 80 + 10
         }));
     }, targetConfig.speed);
     return () => clearInterval(interval);
  }, [currentLevel, targetConfig.speed, levelTransition, phase]);

  const handlePointerDown = (e: React.PointerEvent) => {
      if (levelTransition || phase !== 'DURING') return;
      if (e.target === containerRef.current) {
         setScore(s => Math.max(0, s - 10));
         recordMistake(); // Penalty for missing target
      }
  };

  const executeTargetHit = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (levelTransition || phase !== 'DURING') return;

      setHitEffects(prev => [...prev, { id: Date.now(), x: e.clientX, y: e.clientY }]);
      setScore(s => s + 50);
      
      const newHitCount = hitCount + 1;
      setHitCount(newHitCount);
      
      if (newHitCount >= requiredHits) {
          setTimeout(() => advanceLevel(), 300);
      }
  };

  return (
    <div 
        ref={containerRef}
        onPointerDown={handlePointerDown}
        className="flex-1 w-full bg-[#020617] text-white overflow-hidden flex flex-col items-center relative select-none"
    >
       <AnimatePresence>
         {levelTransition && (
           <motion.div initial={{ opacity: 0, scale: 2 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none text-9xl font-black text-white/5">
             LEVEL {currentLevel}
           </motion.div>
         )}
       </AnimatePresence>

       <header className="absolute top-12 left-1/2 -translate-x-1/2 w-full max-w-5xl flex justify-between items-end z-50 pointer-events-none">
          <div className="bg-black/50 backdrop-blur-md rounded-2xl border border-white/5 p-8 max-w-sm pointer-events-auto">
             <div className="flex items-center gap-2 text-indigo-400 mb-2">
                <Target size={20} /> <span className="text-xs font-black uppercase tracking-widest">Level {currentLevel}</span>
             </div>
             <h1 className="text-3xl font-black mb-2 tracking-tight">Kinetic Targeting</h1>
             <p className="text-slate-400 text-sm">Strike the erratic target. Hits required: {requiredHits}.</p>
          </div>

          <div className="bg-black/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex flex-col items-center pointer-events-auto">
             <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Fitts Profile</span>
             <span className="text-5xl font-mono font-black text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">{hitCount} / {requiredHits}</span>
             <span className="text-sm font-mono text-indigo-300 mt-2">Score: {score}</span>
          </div>
       </header>

       {/* Subliminal Fitts Info */}
       {currentLevel === 3 && (
          <div className="absolute top-[30%] left-1/2 -translate-x-1/2 pointer-events-none opacity-20 text-center uppercase tracking-widest font-black text-2xl">
             44px Touch Targets Minimum
          </div>
       )}

       {/* The Live Target */}
       <motion.button
          layout
          onClick={executeTargetHit}
          disabled={levelTransition || phase !== 'DURING'}
          transition={{ type: "spring", damping: 15 }}
          className="absolute z-20 flex items-center justify-center rounded-full bg-indigo-500 border border-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.6)] cursor-crosshair hover:bg-indigo-400 focus:outline-none"
          style={{
              width: targetConfig.size,
              height: targetConfig.size,
              left: `${targetConfig.x}%`,
              top: `${targetConfig.y}%`,
              marginLeft: -targetConfig.size / 2,
              marginTop: -targetConfig.size / 2,
          }}
       >
          <div className="w-1/2 h-1/2 rounded-full border-2 border-white/30" />
       </motion.button>

       {/* Visual Hit Effects */}
       <AnimatePresence>
          {hitEffects.map(hit => (
             <motion.div
                key={hit.id}
                initial={{ opacity: 1, scale: 0 }}
                animate={{ opacity: 0, scale: 3 }}
                transition={{ duration: 0.5 }}
                className="absolute w-32 h-32 border border-indigo-500 rounded-full z-10 pointer-events-none"
                style={{ left: hit.x - 64, top: hit.y - 64 }}
             />
          ))}
       </AnimatePresence>

       {/* Grid Background */}
       <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

    </div>
  );
}
