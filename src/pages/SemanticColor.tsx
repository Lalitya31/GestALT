import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, AlertTriangle, ShieldCheck, XCircle } from 'lucide-react';
import LearningHarness from '@/components/ui/LearningHarness';
import { useLearning } from '@/engine/LearningContext';
import { useAntiFrustration } from '@/hooks/useAntiFrustration';

export default function SemanticColor() {
  return (
    <LearningHarness moduleId="semantic-color" maxLevels={3}>
      <ColorLogic />
    </LearningHarness>
  );
}

function ColorLogic() {
  const { currentLevel, advanceLevel, recordMistake, phase } = useLearning();
  useAntiFrustration(8000);

  const targetIntent = currentLevel === 1 ? 'destructive' : currentLevel === 2 ? 'warning' : 'success';
  const [hue, setHue] = useState(200); 
  const [saturation, setSaturation] = useState(50);
  const [levelTransition, setLevelTransition] = useState(false);

  useEffect(() => {
     if (phase !== 'DURING') return;
     setLevelTransition(true);
     setTimeout(() => setLevelTransition(false), 2000);
     
     // Randomize starting values to force them to scrub
     setHue(Math.floor(Math.random() * 360));
     setSaturation(Math.floor(Math.random() * 40) + 20);
  }, [currentLevel, phase]);

  const evaluateColor = (intent: string, h: number, s: number) => {
      if (s < 60) return false; 
      switch (intent) {
          case 'success': return (h > 100 && h < 160); // Green
          case 'warning': return (h > 25 && h < 65); // Orange/Yellow
          case 'destructive': return (h < 20 || h > 340); // Red
          default: return false;
      }
  };

  const isMatched = evaluateColor(targetIntent, hue, saturation);

  const confirmMapping = () => {
      if (levelTransition || phase !== 'DURING') return;
      if (!isMatched) {
          recordMistake(); // Submitted wrong emotional intent
          return;
      }
      advanceLevel();
  };

  return (
    <div className="flex-1 w-full bg-[#020617] text-white flex flex-col items-center justify-center relative overflow-hidden p-8 select-none">
       
       <AnimatePresence>
         {levelTransition && (
           <motion.div initial={{ opacity: 0, scale: 2 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none text-9xl font-black text-white/5">
             LEVEL {currentLevel}
           </motion.div>
         )}
       </AnimatePresence>

       <header className="absolute top-12 left-1/2 -translate-x-1/2 w-full max-w-5xl z-50 flex justify-between pointer-events-none">
          <div className="bg-black/50 backdrop-blur-md rounded-2xl border border-white/5 p-8 max-w-lg pointer-events-auto">
             <div className="flex items-center gap-2 text-pink-400 mb-2">
                <Palette size={20} /> <span className="text-xs font-black uppercase tracking-widest">Level {currentLevel}</span>
             </div>
             <h1 className="text-3xl font-black mb-2 tracking-tight">Emotional Mapping</h1>
             <p className="text-slate-400 text-sm">Color conveys intent prior to cognition. Dial the HSL values to physically map the conceptual intent.</p>
          </div>
          
          <div className="flex flex-col items-end pointer-events-auto">
             <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500 mb-3 bg-black/50 px-4 py-2 rounded-full border border-white/5">Current Target Sequence {currentLevel}/3</span>
             <motion.div 
                key={targetIntent}
                initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
                className="bg-black/80 backdrop-blur-xl border border-white/10 px-10 py-5 rounded-2xl font-black text-3xl uppercase tracking-widest shadow-2xl flex items-center gap-4"
             >
                {targetIntent === 'destructive' && <XCircle size={32} className="text-rose-500" />}
                {targetIntent === 'warning' && <AlertTriangle size={32} className="text-amber-500" />}
                {targetIntent === 'success' && <ShieldCheck size={32} className="text-emerald-500" />}
                <span className={targetIntent === 'destructive' ? 'text-rose-100' : targetIntent === 'warning' ? 'text-amber-100' : 'text-emerald-100'}>{targetIntent}</span>
             </motion.div>
          </div>
       </header>

       {/* Interactive Tuning Interface */}
       <div className="relative z-10 flex gap-16 items-center w-full max-w-5xl mt-24">
          
          {/* Live Preview Element */}
          <div className="flex-1 flex flex-col items-center">
             <motion.div 
                animate={{ 
                   backgroundColor: `hsl(${hue}, ${saturation}%, 50%)`,
                   boxShadow: `0 0 ${isMatched ? '80px' : '20px'} hsl(${hue}, ${saturation}%, 50%, 0.5)`
                }}
                className={`w-72 h-72 rounded-full flex items-center justify-center border-8 ${isMatched ? 'border-white transition-all duration-300 scale-110' : 'border-transparent'}`}
             >
                 {isMatched && <span className="font-black text-white/50 mix-blend-overlay tracking-widest uppercase">Aligned</span>}
             </motion.div>
             <div className="mt-12 bg-black/50 px-6 py-3 rounded-full border border-white/10 font-mono font-bold tracking-widest text-slate-300">
               HSL( {hue}°, {saturation}%, 50% )
             </div>
          </div>

          {/* Control Dials */}
          <div className="flex-1 bg-black/60 border border-white/10 rounded-[32px] p-12 backdrop-blur-2xl shadow-2xl space-y-12">
             <div>
                <label className="text-sm uppercase font-black tracking-widest text-slate-500 mb-6 block flex justify-between">
                   <span>Hue Vector</span>
                   <span className="text-white bg-white/10 px-3 py-1 rounded">{hue}°</span>
                </label>
                <input 
                   type="range" min="0" max="360" value={hue} 
                   onChange={e => setHue(parseInt(e.target.value))}
                   disabled={levelTransition || phase !== 'DURING'}
                   className="w-full h-6 rounded-full appearance-none outline-none cursor-pointer shadow-inner"
                   style={{ background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)' }}
                />
             </div>
             
             <div>
                <label className="text-sm uppercase font-black tracking-widest text-slate-500 mb-6 block flex justify-between">
                   <span>Saturation Matrix</span>
                   <span className="text-white bg-white/10 px-3 py-1 rounded">{saturation}%</span>
                </label>
                <input 
                   type="range" min="0" max="100" value={saturation} 
                   onChange={e => setSaturation(parseInt(e.target.value))}
                   disabled={levelTransition || phase !== 'DURING'}
                   className="w-full h-6 rounded-full appearance-none outline-none bg-slate-800 cursor-pointer shadow-inner border border-white/5"
                />
             </div>

             <motion.button
                onClick={confirmMapping}
                disabled={levelTransition || phase !== 'DURING'}
                className={`w-full py-6 rounded-2xl font-black text-lg uppercase tracking-widest transition-all ${isMatched ? 'bg-white text-black shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:scale-105' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
             >
               Confirm Validation
             </motion.button>
          </div>

       </div>

       {/* Global Ambient Reflection */}
       <div 
          className="absolute inset-0 z-0 opacity-20 pointer-events-none transition-colors duration-500"
          style={{ background: `radial-gradient(circle at center, hsl(${hue}, ${saturation}%, 50%) 0%, transparent 70%)` }}
       />

       {/* Grid Background */}
       <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0 mix-blend-overlay" />

    </div>
  );
}
