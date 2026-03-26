import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Fingerprint } from 'lucide-react';
import LearningHarness from '@/components/ui/LearningHarness';
import { useLearning } from '@/engine/LearningContext';
import { useAntiFrustration } from '@/hooks/useAntiFrustration';
import { cn } from '@/lib/utils';

export default function WhitespaceSimulator() {
  return (
    <LearningHarness moduleId="whitespace-sim" maxLevels={3}>
      <WhitespaceLogic />
    </LearningHarness>
  );
}

function WhitespaceLogic() {
  const { currentLevel, advanceLevel, recordMistake, phase } = useLearning();
  useAntiFrustration(8000); 

  const screenRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<{ id: number; x: number; y: number; group: string }[]>([]);
  const [score, setScore] = useState(0);
  const [pointer, setPointer] = useState({ x: -1000, y: -1000, isActive: false });
  const [levelTransition, setLevelTransition] = useState(false);

  const targetScore = currentLevel === 1 ? 85 : currentLevel === 2 ? 90 : 96;
  const nodeCount = currentLevel === 1 ? 9 : currentLevel === 2 ? 15 : 24;
  const gravityRadius = currentLevel === 1 ? 300 : currentLevel === 2 ? 250 : 200;

  useEffect(() => {
    if (phase !== 'DURING') return;
    
    setLevelTransition(true);
    setTimeout(() => setLevelTransition(false), 2000);
    
    const newNodes = [];
    const limit = Math.floor(nodeCount / 3);
    for (let i = 0; i < nodeCount; i++) {
        const group = i < limit ? 'nav' : i < limit * 2 ? 'content' : 'footer';
        newNodes.push({
            id: i,
            x: Math.random() * (window.innerWidth - 300) + 150,
            y: Math.random() * (window.innerHeight - 400) + 200,
            group
        });
    }
    setNodes(newNodes);
    setScore(0);
  }, [currentLevel, phase]);

  useEffect(() => {
    if (!pointer.isActive || levelTransition || phase !== 'DURING') return;

    const interval = setInterval(() => {
        setNodes(prevNodes => 
            prevNodes.map(node => {
                const dx = pointer.x - node.x;
                const dy = pointer.y - node.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < gravityRadius) {
                    const force = (gravityRadius - dist) / gravityRadius;
                    return { ...node, x: node.x + (dx * force * 0.15), y: node.y + (dy * force * 0.15) };
                }
                return node;
            })
        );
    }, 16);

    return () => clearInterval(interval);
  }, [pointer, levelTransition, phase, gravityRadius]);

  useEffect(() => {
    if (nodes.length === 0 || levelTransition || phase !== 'DURING') return;
    
    let navBox = { minX: 9999, maxX: 0, minY: 9999, maxY: 0 };
    let contentBox = { minX: 9999, maxX: 0, minY: 9999, maxY: 0 };
    let footerBox = { minX: 9999, maxX: 0, minY: 9999, maxY: 0 };

    nodes.forEach(n => {
        let box = n.group === 'nav' ? navBox : n.group === 'content' ? contentBox : footerBox;
        if (n.x < box.minX) box.minX = n.x;
        if (n.x > box.maxX) box.maxX = n.x;
        if (n.y < box.minY) box.minY = n.y;
        if (n.y > box.maxY) box.maxY = n.y;
    });

    const getDensity = (box: any) => ((box.maxX - box.minX) * (box.maxY - box.minY)) / (currentLevel * 5);
    
    const navDensity = getDensity(navBox);
    const contentDensity = getDensity(contentBox);
    const footerDensity = getDensity(footerBox);

    let currentScore = Math.max(0, 100 - ((navDensity + contentDensity + footerDensity) / 1500));
    setScore(currentScore);
    
    if (currentScore >= targetScore) {
       setPointer({ x: -1000, y: -1000, isActive: false });
       advanceLevel();
    }
  }, [nodes, levelTransition, targetScore, advanceLevel, phase]);

  const handlePointerUp = () => {
    setPointer(p => ({ ...p, isActive: false }));
    if (score > 0 && score < targetScore - 20 && phase === 'DURING') {
      recordMistake(); // Track failure to cluster
    }
  };

  return (
    <div 
        ref={screenRef}
        className="flex-1 w-full bg-[#020617] text-white relative overflow-hidden select-none cursor-crosshair"
        onPointerMove={(e) => setPointer(p => ({ ...p, x: e.clientX, y: e.clientY }))}
        onPointerDown={(e) => setPointer({ x: e.clientX, y: e.clientY, isActive: true })}
        onPointerUp={handlePointerUp}
    >
       <AnimatePresence>
         {levelTransition && (
           <motion.div initial={{ opacity: 0, scale: 2 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none text-9xl font-black text-white/5">
             LEVEL {currentLevel}
           </motion.div>
         )}
       </AnimatePresence>

       <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start z-40 pointer-events-none">
          <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-3xl p-6 pointer-events-auto max-w-sm">
             <div className="flex items-center gap-3 mb-2 text-indigo-400">
                <Network size={20} />
                <span className="text-xs font-black uppercase tracking-widest">Level {currentLevel}</span>
             </div>
             <h1 className="text-xl font-black mb-1">Gravity Sync</h1>
             <p className="text-slate-400 text-xs">Target Density: {targetScore}%</p>
          </div>

          <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl px-8 py-4 flex flex-col items-center">
             <span className="text-[10px] uppercase font-bold text-slate-500 mb-1">Live Density</span>
             <span className={cn("text-3xl font-mono font-black", score >= targetScore ? "text-emerald-400" : "text-indigo-300")}>{Math.round(score)}%</span>
          </div>
       </div>

       <motion.div 
         animate={{ x: pointer.x - gravityRadius, y: pointer.y - gravityRadius, scale: pointer.isActive ? 1 : 0.5, opacity: pointer.isActive ? 1 : 0 }}
         transition={{ type: "spring", damping: 20 }}
         style={{ width: gravityRadius*2, height: gravityRadius*2 }}
         className="absolute rounded-full border border-indigo-500/30 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.2)_0%,transparent_100%)] pointer-events-none flex items-center justify-center z-0"
       >
         <div className="w-4 h-4 rounded-full bg-indigo-400 animate-ping" />
       </motion.div>

       {nodes.map(node => (
          <motion.div
             key={`node-${currentLevel}-${node.id}`}
             animate={{ x: node.x, y: node.y }}
             className="absolute w-12 h-12 rounded-full flex items-center justify-center pointer-events-none z-10"
             style={{
                 background: node.group === 'nav' ? 'linear-gradient(to bottom right, #3b82f6, #1d4ed8)' :
                             node.group === 'content' ? 'linear-gradient(to bottom right, #8b5cf6, #5b21b6)' :
                             'linear-gradient(to bottom right, #ec4899, #be185d)',
                 boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
             }}
          >
             {node.group === 'nav' ? <Fingerprint size={16} /> : null}
          </motion.div>
       ))}
    </div>
  );
}
