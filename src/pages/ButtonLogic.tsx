import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MousePointerClick, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import LearningHarness from '@/components/ui/LearningHarness';
import { useLearning } from '@/engine/LearningContext';
import { useAntiFrustration } from '@/hooks/useAntiFrustration';

export default function ButtonLogic() {
  return (
    <LearningHarness moduleId="button-logic" maxLevels={3}>
      <LogicEngine />
    </LearningHarness>
  );
}

function LogicEngine() {
  const { currentLevel, advanceLevel, recordMistake, phase } = useLearning();
  useAntiFrustration(15000);

  const [connections, setConnections] = useState<{from: string, to: string}[]>([]);
  const [activeWire, setActiveWire] = useState<{from: string, x: number, y: number} | null>(null);
  const [levelTransition, setLevelTransition] = useState(false);
  const [score, setScore] = useState(0);

  const logicNodes = [
     { id: 'cursor_enter', label: 'Cursor Enter', type: 'trigger', x: 50, y: 150 },
     { id: 'cursor_leave', label: 'Cursor Leave', type: 'trigger', x: 50, y: 250 },
     ...(currentLevel >= 2 ? [{ id: 'mouse_down', label: 'Mouse Down', type: 'trigger', x: 50, y: 350 }] : []),
     ...(currentLevel >= 3 ? [{ id: 'mouse_up', label: 'Mouse Up', type: 'trigger', x: 50, y: 450 }] : []),
     
     { id: 'state_hover', label: 'Hover (Scale 1.05)', type: 'state', x: 450, y: 200 },
     { id: 'state_default', label: 'Default (Scale 1.0)', type: 'state', x: 450, y: 300 },
     ...(currentLevel >= 2 ? [{ id: 'state_active', label: 'Active (Scale 0.95)', type: 'state', x: 450, y: 400 }] : []),
  ];

  useEffect(() => {
     if (phase !== 'DURING') return;
     setLevelTransition(true);
     setTimeout(() => setLevelTransition(false), 2000);
     
     // Reset wires on level change
     setConnections([]);
     setScore(0);
  }, [currentLevel, phase]);

  useEffect(() => {
     if (levelTransition || phase !== 'DURING') return;
     const hasConnection = (from: string, to: string) => connections.some(c => c.from === from && c.to === to);
     
     let maxScore = currentLevel === 1 ? 2 : currentLevel === 2 ? 3 : 4;
     let current = 0;

     if (currentLevel >= 1) {
         if (hasConnection('cursor_enter', 'state_hover')) current++;
         if (hasConnection('cursor_leave', 'state_default')) current++;
     }
     if (currentLevel >= 2) {
         if (hasConnection('mouse_down', 'state_active')) current++;
     }
     if (currentLevel >= 3) {
         if (hasConnection('mouse_up', 'state_hover') || hasConnection('mouse_up', 'state_default')) current++;
     }

     const percentage = (current / maxScore) * 100;
     setScore(percentage);

     if (percentage === 100) {
        setTimeout(advanceLevel, 1000);
     }
  }, [connections, currentLevel, levelTransition, advanceLevel, phase]);

  const handlePointerDown = (id: string, e: React.PointerEvent) => {
      e.stopPropagation();
      if (levelTransition || phase !== 'DURING') return;
      const node = logicNodes.find(n => n.id === id);
      if (node && node.type === 'trigger') {
          setActiveWire({ from: id, x: e.clientX, y: e.clientY });
      }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
      if (activeWire && !levelTransition && phase === 'DURING') {
          setActiveWire(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
      }
  };

  const handlePointerUp = () => setActiveWire(null);

  const handleNodeDrop = (id: string) => {
      if (activeWire && levelTransition === false && phase === 'DURING') {
          const targetNode = logicNodes.find(n => n.id === id);
          if (targetNode?.type === 'state') {
              // Verify correct logic mapping immediately for frustration engine
              let isMistake = false;
              if (activeWire.from === 'cursor_enter' && id !== 'state_hover') isMistake = true;
              if (activeWire.from === 'cursor_leave' && id !== 'state_default') isMistake = true;
              if (activeWire.from === 'mouse_down' && id !== 'state_active') isMistake = true;
              if (activeWire.from === 'mouse_up' && (id !== 'state_hover' && id !== 'state_default')) isMistake = true;

              if (isMistake) recordMistake();

              setConnections(prev => {
                 const cleaned = prev.filter(c => c.from !== activeWire.from);
                 return [...cleaned, { from: activeWire.from, to: id }];
              });
          }
      }
      setActiveWire(null);
  };

  return (
    <div 
        className="flex-1 w-full bg-[#020617] text-white flex flex-col relative overflow-hidden select-none touch-none"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
    >
       <AnimatePresence>
         {levelTransition && (
           <motion.div initial={{ opacity: 0, scale: 2 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none text-9xl font-black text-white/5">
             LEVEL {currentLevel}
           </motion.div>
         )}
       </AnimatePresence>

       <header className="w-full flex justify-between items-center p-8 z-50 pointer-events-none relative shadow-2xl bg-black/50">
          <div className="bg-black/80 backdrop-blur-md rounded-2xl border border-white/5 p-8 max-w-lg pointer-events-auto">
             <div className="flex items-center gap-2 text-yellow-400 mb-2">
                <MousePointerClick size={20} /> <span className="text-xs font-black uppercase tracking-widest">Level {currentLevel}</span>
             </div>
             <h1 className="text-3xl font-black mb-2">State Machine Wireboard</h1>
             <p className="text-slate-400 text-sm leading-relaxed">
               {currentLevel === 1 ? "Connect basic Pointer events to their CSS pseudo-class states." :
                currentLevel === 2 ? "Add Active/Pressed depth physics to the interaction model." :
                "Complete the full interaction loop. What happens when the mouse is released while hovering?"}
             </p>
          </div>

          <div className="bg-black/50 backdrop-blur-xl border border-white/10 px-8 py-6 rounded-2xl flex flex-col items-center pointer-events-auto shrink-0 shadow-[0_0_30px_rgba(250,204,21,0.2)]">
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Compiler Sync</span>
             <span className={cn("text-5xl font-mono font-black", score === 100 ? "text-emerald-400" : "text-yellow-500")}>{Math.round(score)}%</span>
          </div>
       </header>

       {/* Interactive SVG Wiring Board */}
       <div className="absolute inset-0 z-10 top-32">
          {/* Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-50" />

          <svg className="absolute inset-0 w-full h-full pointer-events-none">
             {/* Render Active Dragging Wire */}
             {activeWire && phase === 'DURING' && (() => {
                 const srcNode = logicNodes.find(n => n.id === activeWire.from);
                 if (!srcNode) return null;
                 return (
                    <path 
                       d={`M ${srcNode.x + 200} ${srcNode.y + 25} C ${srcNode.x + 300} ${srcNode.y + 25}, ${activeWire.x - 50} ${activeWire.y - 128}, ${activeWire.x} ${activeWire.y - 128}`}
                       fill="none" stroke="rgba(250, 204, 21, 0.5)" strokeWidth="4" strokeDasharray="5 5"
                    />
                 );
             })()}

             {/* Render Established Connections */}
             {connections.map((conn, idx) => {
                 const srcNode = logicNodes.find(n => n.id === conn.from);
                 const destNode = logicNodes.find(n => n.id === conn.to);
                 if (!srcNode || !destNode) return null;
                 return (
                    <motion.path 
                       key={`${currentLevel}-${idx}`}
                       initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                       d={`M ${srcNode.x + 200} ${srcNode.y + 25} C ${srcNode.x + 300} ${srcNode.y + 25}, ${destNode.x - 100} ${destNode.y + 25}, ${destNode.x} ${destNode.y + 25}`}
                       fill="none" stroke={score === 100 ? "rgba(16, 185, 129, 0.9)" : "rgba(250, 204, 21, 0.9)"} strokeWidth="6" strokeLinecap="round"
                       filter={`drop-shadow(0 0 10px ${score === 100 ? 'rgba(16,185,129,0.8)' : 'rgba(250,204,21,0.6)'})`}
                    />
                 );
             })}
          </svg>

          {/* Logic Nodes DOM rendered over SVG */}
          <AnimatePresence>
          {logicNodes.map(node => (
             <motion.div 
                key={`${currentLevel}-${node.id}`}
                initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}
                className={cn(
                    "absolute w-[200px] h-[50px] flex items-center px-4 rounded-xl border-2 select-none shadow-xl",
                    node.type === 'trigger' ? "bg-slate-800 border-slate-600 cursor-grab active:cursor-grabbing hover:border-yellow-500 hover:shadow-[0_0_20px_rgba(250,204,21,0.4)]" : "bg-slate-900 border-slate-700 pointer-events-auto hover:bg-slate-800 transition-colors cursor-crosshair"
                )}
                style={{ left: node.x, top: node.y }}
                onPointerDown={e => node.type === 'trigger' ? handlePointerDown(node.id, e) : undefined}
                onPointerUp={() => node.type === 'state' ? handleNodeDrop(node.id) : undefined}
             >
                {node.type === 'trigger' && <Zap size={14} className="text-yellow-500 mr-2 shrink-0" />}
                <span className="text-xs font-bold leading-tight truncate">{node.label}</span>
                
                {/* Connection Points */}
                <div className={cn("absolute w-3 h-3 bg-slate-900 border-2 rounded-full", node.type === 'trigger' ? "-right-1.5 border-yellow-500" : "-left-1.5 border-slate-500 bg-slate-800")} />
             </motion.div>
          ))}
          </AnimatePresence>

          {/* Live Button Preview running via standard DOM logic */}
          <div className="absolute top-[250px] right-[100px] flex flex-col items-center pointer-events-auto z-50">
             <span className="text-[10px] uppercase font-black text-slate-500 mb-4 tracking-widest bg-black/50 px-4 py-2 rounded-full border border-white/5">Compiled Output Matrix</span>
             <button className={cn(
                 "px-16 py-8 rounded-3xl bg-white text-black font-black text-2xl outline-none select-none transition-transform duration-[50ms]",
                 score === 100 ? "shadow-[0_0_50px_rgba(16,185,129,0.6)]" : "shadow-[0_0_30px_rgba(255,255,255,0.2)]"
             )}>
                 {score === 100 ? "Fully Operational" : "Awaiting Matrix"}
             </button>
          </div>
       </div>

    </div>
  );
}
