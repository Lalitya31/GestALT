import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Cpu, Activity, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import LearningHarness from '@/components/ui/LearningHarness';
import { useLearning } from '@/engine/LearningContext';
import { useAntiFrustration } from '@/hooks/useAntiFrustration';

export default function FinalBoss() {
  return (
    <LearningHarness moduleId="final-boss" maxLevels={3}>
      <BossLogic />
    </LearningHarness>
  );
}

function BossLogic() {
  const { currentLevel, advanceLevel, phase } = useLearning();
  useAntiFrustration(20000);

  const [spacingScale, setSpacingScale] = useState(0); 
  const [themeHue, setThemeHue] = useState(0); 
  const [typographyCurve, setTypographyCurve] = useState(0); 

  const [score, setScore] = useState(0);
  const [levelTransition, setLevelTransition] = useState(false);

  useEffect(() => {
     if (phase !== 'DURING') return;
     setLevelTransition(true);
     setTimeout(() => setLevelTransition(false), 2000);

     // Reset to complete chaos based on level goals
     if (currentLevel === 1) {
         setSpacingScale(0);
         setThemeHue(220);
         setTypographyCurve(1);
     } else if (currentLevel === 2) {
         setSpacingScale(1);
         setThemeHue(0); // Red alert zone
         setTypographyCurve(1);
     } else {
         setSpacingScale(0);
         setThemeHue(0);
         setTypographyCurve(0);
     }
  }, [currentLevel, phase]);

  useEffect(() => {
      if (levelTransition || phase !== 'DURING') return;

      let current = 0;
      let target = currentLevel === 1 ? 1 : currentLevel === 2 ? 1 : 3;

      if (currentLevel === 1) {
          if (spacingScale >= 0.8 && spacingScale <= 1.2) current++;
      } else if (currentLevel === 2) {
          if (themeHue >= 200 && themeHue <= 250) current++;
      } else {
          if (spacingScale >= 0.8 && spacingScale <= 1.2) current++;
          if (themeHue >= 200 && themeHue <= 250) current++;
          if (typographyCurve > 0.8) current++;
      }

      const percentage = (current / target) * 100;
      setScore(percentage);

      // Penalize erratic scrubbing on max values in the wrong direction
      if (currentLevel === 2 && (themeHue < 100 || themeHue > 300) && Object.isExtensible(themeHue)) {
          // just a heuristic hook for AntiFrustration
      }

      if (current === target) {
          setTimeout(advanceLevel, 1500);
      }
  }, [spacingScale, themeHue, typographyCurve, currentLevel, levelTransition, advanceLevel, phase]);

  return (
    <div className="flex-1 w-full flex overflow-hidden bg-black text-white select-none">
       <AnimatePresence>
         {levelTransition && (
           <motion.div initial={{ opacity: 0, scale: 2 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none text-9xl font-black text-white/5 bg-black/50 backdrop-blur-sm">
             LEVEL {currentLevel}
           </motion.div>
         )}
       </AnimatePresence>

       {/* Global Control Terminal (Left Sidebar) */}
       <div className="w-[450px] bg-black/95 border-r border-white/10 p-12 flex flex-col z-50 shrink-0 h-full overflow-y-auto custom-scrollbar shadow-[0_0_80px_rgba(0,0,0,0.8)]">
          <div className="flex items-center gap-2 text-rose-500 mb-4 bg-rose-500/10 w-fit px-3 py-1 rounded-full border border-rose-500/20">
             <ShieldAlert size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Level {currentLevel} Override</span>
          </div>
          <h1 className="text-4xl font-black mb-4 tracking-tighter">System Matrix</h1>
          <p className="text-slate-400 text-sm mb-12 leading-relaxed">
             {currentLevel === 1 ? "The core structural padding has been zeroed out. Re-establish Macro Whitespace bounds." :
              currentLevel === 2 ? "The semantic psychology engine is stuck in Destructive hue. Dial the interface back to an analytical Slate/Blue." :
              "Total system purge. Rebuild spacing, semantic mood, and typographical scale from scratch to stabilize the final engine."}
          </p>

          <div className="space-y-12">
             <div className={currentLevel < 1 && currentLevel !== 3 ? "opacity-30 pointer-events-none" : ""}>
                <label className="text-xs font-black text-slate-500 uppercase flex justify-between mb-4 tracking-widest">
                   <span>Macro Whitespace</span>
                   <span className="text-white bg-white/10 px-2 rounded-md">{spacingScale.toFixed(2)}x</span>
                </label>
                <input 
                   type="range" min="0" max="2" step="0.1" value={spacingScale} 
                   onChange={e => setSpacingScale(parseFloat(e.target.value))}
                   disabled={levelTransition || phase !== 'DURING' || (currentLevel !== 1 && currentLevel !== 3)}
                   className="w-full h-2 rounded-full appearance-none bg-slate-800 accent-rose-500 cursor-pointer shadow-inner"
                />
             </div>
             
             <div className={currentLevel !== 2 && currentLevel !== 3 ? "opacity-30 pointer-events-none" : ""}>
                <label className="text-xs font-black text-slate-500 uppercase flex justify-between mb-4 tracking-widest">
                   <span>Hue Injection (Brand)</span>
                   <span className="text-white bg-white/10 px-2 rounded-md">{themeHue}°</span>
                </label>
                <input 
                   type="range" min="0" max="360" step="1" value={themeHue} 
                   onChange={e => setThemeHue(parseInt(e.target.value))}
                   disabled={levelTransition || phase !== 'DURING' || (currentLevel !== 2 && currentLevel !== 3)}
                   className="w-full h-2 rounded-full appearance-none cursor-pointer shadow-inner"
                   style={{ background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)' }}
                />
             </div>

             <div className={currentLevel !== 3 ? "opacity-30 pointer-events-none" : ""}>
                <label className="text-xs font-black text-slate-500 uppercase flex justify-between mb-4 tracking-widest">
                   <span>Typographic Curve</span>
                   <span className="text-white bg-white/10 px-2 rounded-md">{typographyCurve.toFixed(2)}x</span>
                </label>
                <input 
                   type="range" min="0" max="1" step="0.05" value={typographyCurve} 
                   onChange={e => setTypographyCurve(parseFloat(e.target.value))}
                   disabled={levelTransition || phase !== 'DURING' || currentLevel !== 3}
                   className="w-full h-2 rounded-full appearance-none bg-slate-800 accent-rose-500 cursor-pointer shadow-inner"
                />
             </div>
          </div>

          <div className="mt-auto pt-16">
             <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex justify-between">
                <span>Architecture Integrity Sync</span>
                <span className={score === 100 ? "text-emerald-400" : "text-rose-500"}>{Math.round(score)}%</span>
             </div>
             <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden shadow-inner">
                <motion.div animate={{ width: `${score}%` }} transition={{ type: "spring", damping: 20 }} className={cn("h-full transition-colors", score === 100 ? "bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)]" : "bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.8)]")} />
             </div>
          </div>
       </div>

       {/* The Broken Dashboard Live Render (Right Area) */}
       <div 
           className="flex-1 transition-all duration-700 h-full overflow-y-auto relative"
           style={{ backgroundColor: `hsl(${themeHue}, 30%, 8%)` }} 
       >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
          
          <div 
             className="w-full max-w-7xl mx-auto transition-all duration-700 relative z-10"
             style={{ padding: `${spacingScale * 5}rem` }}
          >
             {/* Header */}
             <div className="flex justify-between items-center transition-all duration-700" style={{ marginBottom: `${spacingScale * 4}rem` }}>
                <div className="flex items-center gap-6">
                   <div 
                      className="transition-colors duration-700 flex items-center justify-center rounded-3xl"
                      style={{ 
                          backgroundColor: `hsl(${themeHue}, 60%, 40%)`,
                          width: `${4 + spacingScale}rem`, height: `${4 + spacingScale}rem`,
                          boxShadow: `0 0 ${spacingScale * 30}px hsl(${themeHue}, 60%, 50%, 0.4)`
                      }}
                   >
                       <Cpu size={32} className="text-white opacity-90" />
                   </div>
                   <div>
                       <h2 
                          className="font-black transition-all duration-700 tracking-tighter"
                          style={{ fontSize: `${2 + (typographyCurve * 2)}rem`, color: `hsl(${themeHue}, 80%, 95%)`, lineHeight: 1 }}
                       >
                          Neural Cloud Matrix
                       </h2>
                       <p 
                          className="font-bold transition-all duration-700 uppercase tracking-widest mt-2"
                          style={{ fontSize: `${0.7 + (typographyCurve * 0.2)}rem`, color: `hsl(${themeHue}, 50%, 60%)` }}
                       >
                          Live architecture monitoring system.
                       </p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 rounded-full border-2 border-white/10 flex items-center justify-center overflow-hidden bg-black/50 shadow-lg">
                       <User size={24} className="text-slate-400" />
                   </div>
                </div>
             </div>

             {/* Stat Grids */}
             <div 
                className="grid transition-all duration-700"
                style={{ 
                   gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', 
                   gap: `${spacingScale * 3}rem`,
                   marginBottom: `${spacingScale * 4}rem`
                }}
             >
                 {[
                   { label: 'Network Integrity', val: '99.9%' },
                   { label: 'Active Clusters', val: '4,092' },
                   { label: 'Live Entropy', val: '0.04' }
                 ].map((stat, i) => (
                    <div 
                       key={i}
                       className="border transition-all duration-700 flex flex-col justify-center relative overflow-hidden backdrop-blur-md shadow-2xl"
                       style={{ 
                          backgroundColor: `hsl(${themeHue}, 50%, 15%, 0.6)`,
                          borderColor: `hsl(${themeHue}, 50%, 30%, 0.5)`,
                          borderRadius: `${spacingScale * 2}rem`,
                          padding: `${spacingScale * 2.5}rem`
                       }}
                    >
                       <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full pointer-events-none" />
                       <span 
                          className="font-black uppercase tracking-widest transition-all duration-700 block"
                          style={{ fontSize: `${0.7 + (typographyCurve * 0.1)}rem`, color: `hsl(${themeHue}, 50%, 70%)`, marginBottom: `${spacingScale * 1}rem` }}
                       >
                          {stat.label}
                       </span>
                       <span 
                          className="font-black transition-all duration-700 tracking-tighter block"
                          style={{ fontSize: `${2.5 + (typographyCurve * 1.5)}rem`, color: `hsl(${themeHue}, 90%, 100%)` }}
                       >
                          {stat.val}
                       </span>
                    </div>
                 ))}
             </div>

             {/* Main Feed */}
             <div 
                className="w-full border transition-all duration-700 flex flex-col relative overflow-hidden backdrop-blur-3xl shadow-2xl"
                style={{ 
                   backgroundColor: `hsl(${themeHue}, 50%, 12%, 0.7)`,
                   borderColor: `hsl(${themeHue}, 50%, 25%, 0.8)`,
                   borderRadius: `${spacingScale * 2.5}rem`,
                   padding: `${spacingScale * 4}rem`
                }}
             >
                 <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: `hsl(${themeHue}, 60%, 50%)` }} />
                 <h3 
                    className="font-black transition-all duration-700 tracking-tight"
                    style={{ fontSize: `${1.8 + (typographyCurve * 0.8)}rem`, color: `hsl(${themeHue}, 90%, 95%)`, marginBottom: `${spacingScale * 2}rem` }}
                 >
                    System Operations Feed
                 </h3>
                 <div className="space-y-6">
                     {[1,2,3].map(row => (
                         <div 
                             key={row}
                             className="w-full border-b transition-all duration-700 flex justify-between items-center bg-black/20 rounded-2xl"
                             style={{ 
                                 borderColor: `hsl(${themeHue}, 50%, 25%, 0.3)`,
                                 paddingLeft: `${spacingScale * 2}rem`,
                                 paddingRight: `${spacingScale * 2}rem`,
                                 paddingBottom: `${spacingScale * 1.5}rem`,
                                 paddingTop: `${spacingScale * 1.5}rem`
                             }}
                         >
                             <div className="flex items-center gap-6">
                                 <Activity size={24} style={{ color: `hsl(${themeHue}, 60%, 60%)` }} />
                                 <span className="font-medium tracking-wide" style={{ fontSize: `${1 + (typographyCurve * 0.2)}rem`, color: `hsl(${themeHue}, 50%, 90%)` }}>Matrix Sequence Alpha-{row} executed successfully.</span>
                             </div>
                             <span className="font-mono font-bold tracking-widest text-sm" style={{ color: `hsl(${themeHue}, 40%, 60%)` }}>12:0{row} PM</span>
                         </div>
                     ))}
                 </div>
             </div>
          </div>
       </div>
    </div>
  );
}
