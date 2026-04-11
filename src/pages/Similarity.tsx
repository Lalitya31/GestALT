import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import LearningHarness from '@/components/ui/LearningHarness';
import { useLearning } from '@/engine/LearningContext';
import { useAntiFrustration } from '@/hooks/useAntiFrustration';
import { cn } from '@/lib/utils';

export default function Similarity() {
  return (
    <LearningHarness moduleId="similarity" maxLevels={3}>
      <SimilarityLogic />
    </LearningHarness>
  );
}

function SimilarityLogic() {
  const { currentLevel, advanceLevel, recordMistake, phase } = useLearning();
  useAntiFrustration(8000);

  const [score, setScore] = useState(0);
  const [levelTransition, setLevelTransition] = useState(false);

  // Level scaling: 16 -> 24 -> 36 nodes
  const nodeCount = currentLevel === 1 ? 16 : currentLevel === 2 ? 24 : 36;
  const cols = currentLevel === 1 ? 'grid-cols-4' : currentLevel === 2 ? 'grid-cols-6' : 'grid-cols-6';

  const [nodes, setNodes] = useState<{ id: number, type: 'primary' | 'secondary', shape: 'square' | 'circle', color: 'slate' | 'purple' }[]>([]);

  useEffect(() => {
    if (phase !== 'DURING') return;
    setLevelTransition(true);
    setTimeout(() => setLevelTransition(false), 2000);

    const freshNodes = Array.from({ length: nodeCount }).map((_, i) => ({
       id: i,
       type: i % Math.max(3, 5 - currentLevel) === 0 ? 'primary' : 'secondary',
       shape: Math.random() > 0.5 ? 'square' : 'circle',
       color: Math.random() > 0.5 ? 'slate' : 'purple'
    })) as any;
    setNodes(freshNodes);
    setScore(0);
  }, [currentLevel, nodeCount, phase]);

  useEffect(() => {
    if (nodes.length === 0 || levelTransition || phase !== 'DURING') return;
    let errors = 0;
    nodes.forEach(n => {
       // Target logic: Primary = Circle + Purple. Secondary = Square + Slate.
       if (n.type === 'primary') {
           if (n.shape !== 'circle') errors += 1;
           if (n.color !== 'purple') errors += 1;
       } else {
           if (n.shape !== 'square') errors += 1;
           if (n.color !== 'slate') errors += 1;
       }
    });
    
    const possibleErrors = nodeCount * 2;
    const currentScore = Math.max(0, 100 - (errors / possibleErrors) * 100);
    setScore(currentScore);
    
    if (currentScore >= 100) {
      setTimeout(advanceLevel, 500); 
    }
  }, [nodes, nodeCount, levelTransition, advanceLevel, phase]);

  const morphShape = (id: number) => {
    setNodes(prev => {
      const target = prev.find(n => n.id === id);
      if (target) {
        // Did they make a wrong move that decreases score? Track it as frustration
        const isWrong = (target.type === 'primary' && target.shape === 'circle') || (target.type === 'secondary' && target.shape === 'square');
        if (isWrong) recordMistake();
        
        return prev.map(n => n.id === id ? { ...n, shape: n.shape === 'circle' ? 'square' : 'circle' } : n);
      }
      return prev;
    });
  };
  
  const paintColor = (id: number) => {
    setNodes(prev => {
      const target = prev.find(n => n.id === id);
      if (target) {
        const isWrong = (target.type === 'primary' && target.color === 'purple') || (target.type === 'secondary' && target.color === 'slate');
        if (isWrong) recordMistake();

        return prev.map(n => n.id === id ? { ...n, color: n.color === 'purple' ? 'slate' : 'purple' } : n);
      }
      return prev;
    });
  };

  return (
    <div className="h-screen w-full bg-[#020617] text-white p-8 md:p-16 relative overflow-hidden flex flex-col items-center">
       
       <AnimatePresence>
         {levelTransition && (
           <motion.div initial={{ opacity: 0, scale: 2 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none text-9xl font-black text-white/5">
             LEVEL {currentLevel}
           </motion.div>
         )}
       </AnimatePresence>

       <header className="w-full max-w-5xl flex justify-between items-end mb-16 relative z-10">
          <div className="bg-black/50 backdrop-blur-md rounded-2xl border border-white/5 p-8 max-w-xl">
             <div className="flex items-center gap-2 text-purple-400 mb-2">
                <Sparkles size={20} /> <span className="text-xs font-black uppercase tracking-widest">Level {currentLevel}</span>
             </div>
             <h1 className="text-3xl font-black mb-2 tracking-tight">Pattern Morphing</h1>
             <p className="text-slate-400 text-sm">Elements that share visual characteristics are perceived as related. Click a node to morph its shape, right-click to morph its color. <br/><br/><strong className="text-purple-300">Target:</strong> Primary Actions must be Purple Circles. Secondary Actions must be Slate Squares.</p>
          </div>

          <div className="bg-black/50 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex flex-col items-center">
             <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Similarity Array</span>
             <span className={cn("text-5xl font-mono font-black drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]", score === 100 ? "text-emerald-400" : "text-purple-400")}>{Math.round(score)}%</span>
          </div>
       </header>

       <div className="w-full max-w-3xl flex-1 min-h-0 overflow-y-auto pr-1 pb-4">
         <div className={cn("w-full grid gap-4 relative z-10 transition-all", cols)}>
            <AnimatePresence>
              {nodes.map((node) => (
                <motion.button
                  layout
                  key={node.id}
                  onClick={() => morphShape(node.id)}
                  onContextMenu={(e) => { e.preventDefault(); paintColor(node.id); }}
                  className={cn(
                      "w-full aspect-square transition-all duration-300 flex items-center justify-center relative group",
                      node.shape === 'circle' ? "rounded-full" : "rounded-xl",
                      node.color === 'purple' ? "bg-gradient-to-br from-purple-500 to-indigo-600 shadow-[0_0_20px_rgba(168,85,247,0.4)] border-transparent" : "bg-slate-800 border-slate-600 border-2"
                  )}
                >
                    <span className={cn("text-[10px] uppercase font-bold tracking-widest", node.color === 'purple' ? 'text-white' : 'text-slate-400')}>
                        {node.type}
                    </span>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-1.5 h-1.5 bg-white/50 rounded-full" />
                    </div>
                </motion.button>
              ))}
            </AnimatePresence>
         </div>
       </div>
    </div>
  );
}
