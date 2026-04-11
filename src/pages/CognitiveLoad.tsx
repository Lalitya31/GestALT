import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, LayoutTemplate } from 'lucide-react';
import { cn } from '@/lib/utils';
import LearningHarness from '@/components/ui/LearningHarness';
import { useLearning } from '@/engine/LearningContext';
import { useAntiFrustration } from '@/hooks/useAntiFrustration';

export default function CognitiveLoad() {
  return (
    <LearningHarness moduleId="cognitive-load" maxLevels={3}>
      <ChunkingLogic />
    </LearningHarness>
  );
}

const GLOBAL_ITEMS = [
   { id: '1', text: 'Wi-Fi Network', category: 'network' },
   { id: '2', text: 'Bluetooth', category: 'network' },
   { id: '3', text: 'Cellular Data', category: 'network' },
   { id: '4', text: 'VPN Config', category: 'network' },
   { id: '5', text: 'Dark Mode', category: 'display' },
   { id: '6', text: 'Brightness', category: 'display' },
   { id: '7', text: 'Text Size', category: 'display' },
   { id: '8', text: 'Auto-Lock', category: 'display' },
   { id: '9', text: 'Face ID', category: 'security' },
   { id: '10', text: 'Passcode', category: 'security' },
   { id: '11', text: 'Find My Device', category: 'security' },
   { id: '12', text: 'Location Svcs', category: 'privacy' },
   { id: '13', text: 'App Tracking', category: 'privacy' },
   { id: '14', text: 'Mic Access', category: 'privacy' },
   { id: '15', text: 'DNS Profile', category: 'network' }
];

function ChunkingLogic() {
  const { currentLevel, advanceLevel, recordMistake, phase } = useLearning();
  useAntiFrustration(10000);

  const [items, setItems] = useState<{id: string, text: string, category: string, currentZone: string}[]>([]);
  const [score, setScore] = useState(0);
  const [levelTransition, setLevelTransition] = useState(false);

  // L1: 2 categories (8 items)
  // L2: 3 categories (11 items)
  // L3: 4 categories (15 items)
  const activeCategories = currentLevel === 1 ? ['network', 'display'] : currentLevel === 2 ? ['network', 'display', 'security'] : ['network', 'display', 'security', 'privacy'];

  useEffect(() => {
     if (phase !== 'DURING') return;
     setLevelTransition(true);
     setTimeout(() => setLevelTransition(false), 2000);

     const pool = GLOBAL_ITEMS.filter(i => activeCategories.includes(i.category))
                    .map(i => ({ ...i, currentZone: 'pool' }));
     
     // Shuffle the pool visually
     setItems(pool.sort(() => Math.random() - 0.5));
     setScore(0);
  }, [currentLevel, phase]);

  useEffect(() => {
     if (items.length === 0 || levelTransition || phase !== 'DURING') return;
     
     let correct = 0;
     items.forEach(item => {
         if (item.category === item.currentZone) correct++;
     });
     
     const currentScore = Math.round((correct / items.length) * 100);
     setScore(currentScore);
     
     if (currentScore >= 100) {
        setTimeout(advanceLevel, 800);
     }
  }, [items, levelTransition, advanceLevel, phase]);

  const handleDragEnd = (id: string, info: any) => {
      if (levelTransition || phase !== 'DURING') return;
      const y = info.point.y;
      const h = window.innerHeight;
      
      // Calculate dynamic drop zones based on the array slice
      const zoneCount = activeCategories.length;
      const zoneHeight = (h * 0.8) / zoneCount; // Assuming right side uses ~80% of screen height
      const startY = h * 0.1; // Top padding

      let newZone = 'pool';
      for (let i = 0; i < zoneCount; i++) {
         if (y > startY + (i * zoneHeight) && y < startY + ((i+1) * zoneHeight)) {
             newZone = activeCategories[i];
         }
      }

      setItems(prev => {
          const target = prev.find(i => i.id === id);
          if (target && newZone !== 'pool' && target.category !== newZone) {
             // Dropped in the WRONG zone
             recordMistake();
          }
          return prev.map(item => item.id === id ? { ...item, currentZone: newZone } : item)
      });
  };

  return (
   <div className="h-screen w-full bg-[#020617] text-white overflow-hidden relative select-none">
       
       <AnimatePresence>
         {levelTransition && (
           <motion.div initial={{ opacity: 0, scale: 2 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none text-9xl font-black text-white/5">
             LEVEL {currentLevel}
           </motion.div>
         )}
       </AnimatePresence>

          <div className="grid h-screen w-full grid-cols-[300px_1fr] gap-0">
             <aside className="z-[1] border-r border-white/10 bg-[#050A1A] p-6 pt-8 overflow-y-auto">
                <div className="bg-black/50 backdrop-blur-md rounded-2xl border border-white/5 p-6">
                   <div className="flex items-center gap-2 text-violet-400 mb-2">
                      <Layers size={20} /> <span className="text-xs font-black uppercase tracking-widest">Level {currentLevel}</span>
                   </div>
                   <h1 className="text-2xl font-black mb-1 tracking-tight">Data Chunking</h1>
                   <p className="text-slate-400 text-sm">Working memory capacity is strictly limited. Drag the raw settings into logical psychological chunks.</p>
                </div>

                <div className="mt-4 bg-black/50 backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex flex-col items-center">
                   <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Cognitive Efficiency</span>
                   <span className={cn("text-5xl font-mono font-black drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]", score === 100 ? "text-emerald-400" : "text-violet-400")}>{score}%</span>
                </div>

                <div className="mt-6">
                   <h3 className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-3">Raw Data Stream</h3>
                   <div className="flex flex-wrap gap-2">
                      {items.filter(i => i.currentZone === 'pool').map(item => (
                         <motion.div
                            key={item.id}
                            layoutId={item.id}
                            drag
                            dragMomentum={false}
                            onDragEnd={(_, info) => handleDragEnd(item.id, info)}
                            whileDrag={{ scale: 1.1, zIndex: 100, rotate: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                            className="bg-slate-800 border-2 border-slate-600 rounded-xl px-3 py-2 cursor-grab active:cursor-grabbing hover:bg-slate-700 transition-colors shadow-xl"
                         >
                            <span className="font-bold text-sm tracking-wide">{item.text}</span>
                         </motion.div>
                      ))}
                   </div>
                </div>
             </aside>

             <section className="z-[1] h-full overflow-y-auto p-8">
                <div className="h-full flex flex-col justify-center gap-6">
                   {activeCategories.map(zone => (
                      <div key={zone} className="w-full flex-1 min-h-[140px] bg-white/5 border-2 border-dashed border-white/10 rounded-3xl flex flex-col p-6 relative backdrop-blur-sm">
                         <div className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 mb-4">
                            <LayoutTemplate size={16} /> {zone} Group
                         </div>

                         <div className="w-full flex gap-3 flex-wrap">
                            {items.filter(i => i.currentZone === zone).map(item => (
                               <motion.div
                                  key={item.id}
                                  layoutId={item.id}
                                  drag
                                  dragMomentum={false}
                                  onDragEnd={(_, info) => handleDragEnd(item.id, info)}
                                  className={cn(
                                     "border-2 rounded-xl px-4 py-2 cursor-grab shadow-lg backdrop-blur-md",
                                     item.category === zone ? "bg-violet-500/20 border-violet-500 text-violet-200" : "bg-rose-500/20 border-rose-500 text-rose-200"
                                  )}
                               >
                                  <span className="font-bold text-sm tracking-wide">{item.text}</span>
                               </motion.div>
                            ))}
                         </div>
                      </div>
                   ))}
                </div>
             </section>
          </div>

    </div>
  );
}
