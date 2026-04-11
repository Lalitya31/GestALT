import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GripHorizontal } from 'lucide-react';
import LearningHarness from '@/components/ui/LearningHarness';
import { useLearning } from '@/engine/LearningContext';
import { useAntiFrustration } from '@/hooks/useAntiFrustration';

export default function GridMaster() {
  return (
    <LearningHarness moduleId="grid-master" maxLevels={3}>
      <GridLogic />
    </LearningHarness>
  );
}

function GridLogic() {
  const { currentLevel, advanceLevel, recordMistake, phase } = useLearning();
  useAntiFrustration(8000);

  const containerRef = useRef<HTMLDivElement>(null);
  const [levelTransition, setLevelTransition] = useState(false);
  
  // Level 1: 2 cols, Level 2: 3 cols, Level 3: 4 cols
  const blockCount = currentLevel === 1 ? 2 : currentLevel === 2 ? 3 : 4;
  const colSize = 12 / blockCount; 

  const [blocks, setBlocks] = useState<{id: number, w: number, colStart: number, currentX: number}[]>([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
     if (phase !== 'DURING') return;
     setLevelTransition(true);
     setTimeout(() => setLevelTransition(false), 2000);

     // Scramble initial layout heavily
     const newBlocks = Array.from({length: blockCount}).map((_, i) => ({
        id: i + 1,
        w: colSize,
        colStart: Math.floor(Math.random() * (12 - colSize)),
        currentX: Math.random() * 400 + 100 // Visual scramble x
     }));
     setBlocks(newBlocks);
     setScore(0);
  }, [currentLevel, colSize, blockCount, phase]);

  const handleDragEnd = (id: number, info: any) => {
      if (levelTransition || phase !== 'DURING') return;
      const container = containerRef.current;
      if (!container) return;

      const width = container.clientWidth;
      const colWidth = width / 12;

      // Magnetic Snapping logic
      const rawX = info.point.x - container.getBoundingClientRect().left;
      const nearestCol = Math.max(0, Math.min(12 - colSize, Math.round(rawX / colWidth)));
      const snappedX = nearestCol * colWidth;

      setBlocks(prev => {
          const newBlocks = prev.map(b => b.id === id ? { ...b, currentX: snappedX, colStart: nearestCol } : b);
          
          const cols = newBlocks.map(b => b.colStart).sort((a,b) => a-b);
          
          // Check if blocks overlap (frustration trigger)
          let overlaps = false;
          for (let i = 0; i < cols.length - 1; i++) {
              if (cols[i] + colSize > cols[i+1]) overlaps = true; 
          }
          if (overlaps) recordMistake();

          // Scoring logic: 100% means perfectly dispersed evenly from 0
          let currentScore = 0;
          for (let i = 0; i < blockCount; i++) {
             if (cols[i] === i * colSize) currentScore += (100 / blockCount);
          }
          setScore(Math.round(currentScore));

          if (Math.round(currentScore) >= 99) {
             setTimeout(advanceLevel, 800);
          }
          return newBlocks;
      });
  };

  return (
    <div className="flex-1 w-full bg-[#020617] text-white overflow-hidden flex flex-col items-center relative p-8 select-none">
       
       <AnimatePresence>
         {levelTransition && (
           <motion.div initial={{ opacity: 0, scale: 2 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none text-9xl font-black text-white/5">
             LEVEL {currentLevel}
           </motion.div>
         )}
       </AnimatePresence>

       <header className="absolute top-12 left-1/2 -translate-x-1/2 w-full max-w-5xl z-50 flex justify-between pointer-events-none">
          <div className="bg-black/50 backdrop-blur-md rounded-2xl border border-white/5 p-8 w-[500px] pointer-events-auto shadow-2xl">
             <div className="flex items-center gap-2 text-cyan-400 mb-2">
                <GripHorizontal size={20} /> <span className="text-xs font-black uppercase tracking-widest">Level {currentLevel}</span>
             </div>
             <h1 className="text-3xl font-black mb-1 tracking-tight">Magnetic Grid Map</h1>
             <p className="text-slate-400 text-sm leading-relaxed">Drag the {blockCount} blocks to establish a flawless {blockCount}-column masonry layout. Avoid geometric overlap.</p>
          </div>

          <div className="bg-black/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex flex-col items-center pointer-events-auto shrink-0 h-min">
             <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Structural Integrity</span>
             <span className="text-5xl font-mono font-black text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">{score}%</span>
          </div>
       </header>

       {/* The Physical Grid Engine */}
       <div ref={containerRef} className="relative w-full max-w-6xl h-[600px] mt-48 border-x border-white/10 bg-black/40 shadow-inner rounded-3xl overflow-hidden">
          
          {/* Laser Guide Spectral Grid (Always visible for clarity) */}
          <div className="absolute inset-0 flex">
             {Array.from({ length: 12 }).map((_, i) => (
                <div key={`guide-${i}`} className="flex-1 border-r border-cyan-500/20 border-dashed relative">
                   <div className="absolute bottom-4 left-2 text-[10px] font-mono text-cyan-500/50 mix-blend-screen">C{i+1}</div>
                </div>
             ))}
          </div>

          {/* Render the Draggable Blocks */}
          {blocks.map(block => (
             <motion.div
                key={`block-${currentLevel}-${block.id}`}
                drag="x"
                dragConstraints={containerRef}
                dragElastic={0}
                dragMomentum={false}
                onDragEnd={(_, info) => handleDragEnd(block.id, info)}
                animate={{ x: block.currentX }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="absolute top-1/2 -translate-y-1/2 h-[400px] bg-slate-800/80 backdrop-blur-md border border-slate-600 rounded-3xl cursor-grab active:cursor-grabbing hover:border-cyan-400 hover:bg-slate-700/80 transition-colors shadow-2xl flex flex-col items-center justify-center group"
                style={{ width: `calc(100% / 12 * ${block.w})` }}
             >
                <div className="w-16 h-1.5 rounded-full bg-cyan-500/30 group-hover:bg-cyan-400 mb-8 transition-colors" />
                <div className="font-mono text-cyan-500/50 font-black text-4xl opacity-50 group-hover:opacity-100 transition-opacity">{block.w} COL</div>
             </motion.div>
          ))}
       </div>

    </div>
  );
}
