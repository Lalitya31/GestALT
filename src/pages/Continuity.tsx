import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Route, CheckCircle2 } from 'lucide-react';
import LearningHarness from '@/components/ui/LearningHarness';
import { useLearning } from '@/engine/LearningContext';
import { useAntiFrustration } from '@/hooks/useAntiFrustration';

export default function Continuity() {
  return (
    <LearningHarness moduleId="continuity" maxLevels={3}>
      <ContinuityLogic />
    </LearningHarness>
  );
}

function ContinuityLogic() {
  const { currentLevel, advanceLevel, recordMistake, phase } = useLearning();
  useAntiFrustration(8000);

  const containerRef = useRef<HTMLDivElement>(null);
  
  const [nodes, setNodes] = useState<{ id: number, x: number, y: number }[]>([]);
  const [pathPositions, setPathPositions] = useState<{ x: number, y: number }[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [score, setScore] = useState(0);
  const [levelTransition, setLevelTransition] = useState(false);

  useEffect(() => {
    if (phase !== 'DURING') return;
    setLevelTransition(true);
    setTimeout(() => setLevelTransition(false), 2000);
    
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    // Changing paths based on level
    if (currentLevel === 1) {
      setNodes([
          { id: 1, x: w * 0.2, y: h * 0.5 },
          { id: 2, x: w * 0.5, y: h * 0.5 },
          { id: 3, x: w * 0.8, y: h * 0.5 }
      ]);
    } else if (currentLevel === 2) {
      setNodes([
          { id: 1, x: w * 0.2, y: h * 0.8 },
          { id: 2, x: w * 0.4, y: h * 0.5 },
          { id: 3, x: w * 0.7, y: h * 0.2 },
          { id: 4, x: w * 0.9, y: h * 0.6 }
      ]);
    } else {
      setNodes([
          { id: 1, x: w * 0.1, y: h * 0.2 },
          { id: 2, x: w * 0.3, y: h * 0.8 },
          { id: 3, x: w * 0.6, y: h * 0.2 },
          { id: 4, x: w * 0.8, y: h * 0.8 }
      ]);
    }
    setScore(0);
    setPathPositions([]);
  }, [currentLevel, phase]);

  const handlePointerDown = (e: React.PointerEvent) => {
      if (nodes.length === 0 || phase !== 'DURING' || levelTransition) return;
      const dx = e.clientX - nodes[0].x;
      const dy = e.clientY - nodes[0].y;
      if (Math.hypot(dx, dy) < 100) {
          setIsDrawing(true);
          setPathPositions([{ x: e.clientX, y: e.clientY }]);
      } else {
          recordMistake(); // User failed to find the start node
      }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
      if (!isDrawing || phase !== 'DURING' || levelTransition) return;
      const newPos = { x: e.clientX, y: e.clientY };
      setPathPositions(prev => [...prev, newPos]);

      if (pathPositions.length % 5 === 0) {
          let nodesHit = 0;
          nodes.forEach(n => {
              if (pathPositions.some(p => Math.hypot(p.x - n.x, p.y - n.y) < 80)) {
                  nodesHit++;
              }
          });
          const newScore = (nodesHit / nodes.length) * 100;
          setScore(newScore);
          
          if (newScore > 90) {
             setIsDrawing(false);
             setTimeout(advanceLevel, 500);
          }
      }
  };

  const handlePointerUp = () => {
      setIsDrawing(false);
      // Releasing too early or deviating resets the path and counts as a mistake
      if (score < 90 && pathPositions.length > 10 && phase === 'DURING') {
          setPathPositions([]);
          setScore(0);
          recordMistake();
      }
  };

  return (
    <div 
        ref={containerRef}
        className="flex-1 w-full bg-[#020617] text-white relative overflow-hidden select-none touch-none cursor-crosshair"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
    >
       <AnimatePresence>
         {levelTransition && (
           <motion.div initial={{ opacity: 0, scale: 2 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none text-9xl font-black text-white/5">
             LEVEL {currentLevel}
           </motion.div>
         )}
       </AnimatePresence>

       <header className="absolute top-12 left-12 z-50 pointer-events-none flex items-start justify-between w-[calc(100%-6rem)]">
          <div className="bg-black/50 backdrop-blur-md rounded-2xl border border-white/5 p-8 max-w-sm pointer-events-auto shadow-2xl">
             <div className="flex items-center gap-2 text-cyan-400 mb-2">
                <Route size={20} /> <span className="text-xs font-black uppercase tracking-widest">Level {currentLevel}</span>
             </div>
             <h1 className="text-3xl font-black mb-2 tracking-tight">Fluid Continuity</h1>
             <p className="text-slate-400 text-sm">Draw a continuous path through the narrative nodes. Releasing the flow breaks continuity.</p>
          </div>

          <div className="bg-black/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex flex-col items-center pointer-events-auto">
             <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Flow Cohesion</span>
             <span className="text-5xl font-mono font-black text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">{Math.round(score)}%</span>
          </div>
       </header>

       {/* Guide Path visible only on level 1 and 2 */}
       <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {currentLevel < 3 && nodes.length > 1 && (
              <path 
                 d={`M ${nodes[0]?.x} ${nodes[0]?.y} ` + (
                   currentLevel === 1 
                   ? `L ${nodes[1]?.x} ${nodes[1]?.y} L ${nodes[2]?.x} ${nodes[2]?.y}`
                   : `Q ${nodes[1]?.x-100} ${nodes[1]?.y+100} ${nodes[1]?.x} ${nodes[1]?.y} T ${nodes[2]?.x} ${nodes[2]?.y} T ${nodes[3]?.x} ${nodes[3]?.y}`
                 )}
                 stroke="rgba(255,255,255,0.05)" strokeWidth={40} fill="none" strokeLinecap="round" strokeLinejoin="round" 
              />
          )}
          
          {pathPositions.length > 1 && (
             <polyline
                points={pathPositions.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="rgba(34, 211, 238, 0.8)" 
                strokeWidth={16}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="drop-shadow(0 0 10px rgba(34,211,238,0.5))"
             />
          )}
       </svg>

       {/* Obstacle for Level 3 */}
       {currentLevel === 3 && (
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-full max-h-[400px] bg-rose-500/10 border-4 border-dashed border-rose-500/30 rounded-full flex flex-col items-center justify-center p-8 pointer-events-none z-0">
            <span className="text-rose-400/50 font-black uppercase text-2xl text-center">Visual Obstruction</span>
         </div>
       )}

       {nodes.map((node, i) => {
           const isHit = pathPositions.some(p => Math.hypot(p.x - node.x, p.y - node.y) < 80);
           return (
             <motion.div
               key={`node-${currentLevel}-${node.id}`}
               initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1, type: "spring" }}
               className="absolute w-24 h-24 rounded-full flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
               style={{ left: node.x, top: node.y }}
             >
                <div className={`w-8 h-8 rounded-full border-4 transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center ${isHit ? 'bg-cyan-500 border-cyan-300 scale-125' : 'bg-slate-800 border-slate-600'}`}>
                   {isHit && <CheckCircle2 size={12} className="text-white" />}
                   {i === 0 && !isHit && <span className="absolute -bottom-8 whitespace-nowrap text-xs text-cyan-500 font-bold uppercase tracking-widest">Start Here</span>}
                </div>
             </motion.div>
           )
       })}
    </div>
  );
}
