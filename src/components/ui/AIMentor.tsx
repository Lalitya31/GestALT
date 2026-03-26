import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, AlertTriangle, CheckCircle2, X, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLearning } from '@/engine/LearningContext';
import { learningContentData } from '@/data/learningContent';

export interface AIMentorProps {
  score: number;
  issues: string[];
  suggestions: string[];
  metrics?: {
    contrast: number;
    fittsLawTarget: number;
    hierarchy: number;
  };
}

export function AIMentor({ score, issues, suggestions, metrics }: AIMentorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [tab, setTab] = useState<'hint' | 'analyze'>('hint');
  
  const { phase, aiEvent, activeModuleId, currentLevel } = useLearning();
  const content = activeModuleId ? learningContentData[activeModuleId] : null;

  // React to AI Events (Autonomously slide in when stuck)
  useEffect(() => {
    if (aiEvent) {
      setIsOpen(true);
      setTab('hint');
      setIsAnimating(true);
      const timeout = setTimeout(() => setIsAnimating(false), 800);
      return () => clearTimeout(timeout);
    }
  }, [aiEvent]);

  // Also react to issues locally
  useEffect(() => {
    if (issues.length > 0) {
      setIsAnimating(true);
      const timeout = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [issues.length]);

  // Hide completely during cinematic phases
  if (phase !== 'DURING') return null;

  const hasCritical = issues.some(i => i.toLowerCase().includes('critical') || i.toLowerCase().includes('usability'));
  const isPerfect = score >= 100;

  // Fetch the contextual hints based on Current Level
  const currentHints = content ? content.hints[`level${currentLevel}` as keyof typeof content.hints] || [] : suggestions;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 pointer-events-none">
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-[340px] glass-card rounded-2xl overflow-hidden shadow-2xl pointer-events-auto border border-white/10"
          >
            {/* Header */}
            <div className={cn(
              "px-4 py-3 flex items-center justify-between border-b",
              aiEvent ? "bg-indigo-500/20 border-indigo-500/30" :
              isPerfect ? "bg-emerald-500/20 border-emerald-500/30" :
              hasCritical ? "bg-rose-500/20 border-rose-500/30" : "bg-primary/20 border-primary/30"
            )}>
              <div className="flex items-center gap-2">
                <motion.div
                  animate={isAnimating ? { rotate: [0, -10, 10, -10, 10, 0] } : {}}
                  transition={{ duration: 0.5 }}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shadow-inner",
                    aiEvent ? "bg-indigo-500/30 text-indigo-400" :
                    isPerfect ? "bg-emerald-500/30 text-emerald-400" :
                    hasCritical ? "bg-rose-500/30 text-rose-400" : "bg-primary/30 text-primary-foreground"
                  )}
                >
                  <Bot size={18} />
                </motion.div>
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">GestALT Contextual AI</h4>
                  <p className="text-[10px] text-white/50 uppercase tracking-widest font-black">
                    {aiEvent ? 'Mentorship Assist' : isPerfect ? 'Architecture Perfect' : hasCritical ? 'Critical Issues Detected' : 'Live Analysis'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/40 hover:text-white/80 p-1 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Tabs */}
            <div className="flex w-full bg-black/60 border-b border-white/10 text-[10px] uppercase font-bold tracking-widest text-slate-500">
               <button onClick={() => setTab('hint')} className={cn("flex-1 py-3 transition-colors flex items-center justify-center gap-2", tab === 'hint' && "text-indigo-400 bg-indigo-500/10")}><Lightbulb size={12}/> Guidance</button>
               <button onClick={() => setTab('analyze')} className={cn("flex-1 py-3 transition-colors flex items-center justify-center gap-2", tab === 'analyze' && "text-rose-400 bg-rose-500/10")}><AlertTriangle size={12}/> Analysis</button>
            </div>

            {/* Content */}
            <div className="p-4 bg-black/40 backdrop-blur-xl max-h-[300px] min-h-[140px] overflow-y-auto custom-scrollbar flex flex-col gap-4">
              
              <AnimatePresence mode="wait">
                {tab === 'hint' && (
                  <motion.div key="hint" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                     <p className="text-sm text-indigo-100 leading-relaxed bg-indigo-500/20 p-3 rounded-lg border border-indigo-500/20 shadow-inner">
                        {aiEvent 
                          ? "It looks like you're determining the next step. Here's a structural hint based on this cognitive phase."
                          : "You can request hints from me if you get stuck mapping this principle."}
                     </p>
                     
                     {currentHints.length > 0 ? (
                       <ul className="space-y-3">
                         {currentHints.map((hint, i) => (
                           <li key={i} className="text-xs text-slate-300 flex items-start gap-2 bg-black/40 p-2 rounded-lg border border-white/5">
                             <span className="text-indigo-400 shrink-0"><Lightbulb size={14} /></span> {hint}
                           </li>
                         ))}
                       </ul>
                     ) : (
                       <p className="text-xs text-slate-500 italic">No specific guidance loaded for current context.</p>
                     )}
                  </motion.div>
                )}

                {tab === 'analyze' && (
                  <motion.div key="analyze" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                     {/* Metrics Readout */}
                     {metrics && !isPerfect && (
                       <div className="grid grid-cols-2 gap-2 mb-3">
                         <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                           <span className="text-[9px] text-white/50 uppercase tracking-wider block mb-1">Contrast</span>
                           <span className={cn(
                             "text-xs font-mono font-bold",
                             metrics.contrast >= 4.5 ? "text-emerald-400" : "text-rose-400"
                           )}>{metrics.contrast.toFixed(1)}:1</span>
                         </div>
                         <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                           <span className="text-[9px] text-white/50 uppercase tracking-wider block mb-1">Touch Target</span>
                           <span className={cn(
                             "text-xs font-mono font-bold",
                             metrics.fittsLawTarget >= 44 ? "text-emerald-400" : "text-rose-400"
                           )}>{metrics.fittsLawTarget}px</span>
                         </div>
                       </div>
                     )}

                     {isPerfect ? (
                       <div className="flex items-start gap-3 text-emerald-300 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                         <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                         <p className="text-sm font-medium">Exceptional. The cognitive load is minimized, and the visual hierarchy is flawless.</p>
                       </div>
                     ) : (
                       <>
                         {issues.length > 0 ? (
                           <div className="space-y-2">
                             <h5 className="text-[10px] uppercase font-bold text-rose-400 tracking-widest flex items-center gap-1">
                               <AlertTriangle size={12} /> Live Violations
                             </h5>
                             <ul className="space-y-2">
                               {issues.map((iss, i) => (
                                 <li key={i} className="text-xs text-white/80 leading-relaxed flex items-start gap-2 bg-rose-500/5 p-2 rounded border border-rose-500/10">
                                   <span className="w-1 h-1 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                                   {iss}
                                 </li>
                               ))}
                             </ul>
                           </div>
                         ) : (
                            <p className="text-xs text-slate-500 italic">No structural violations detected. Proceed with optimization.</p>
                         )}
                       </>
                     )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Live Score Foot */}
            <div className="bg-black/80 px-4 py-2 flex items-center justify-between border-t border-white/5 relative overflow-hidden">
               <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest z-10 relative">Est. Score</span>
               <span className={cn(
                 "text-sm font-black font-mono z-10 relative",
                 score >= 90 ? "text-emerald-400" : score >= 70 ? "text-amber-400" : "text-rose-400"
               )}>{score}</span>
               
               {/* Progress bar background */}
               <motion.div 
                 initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.5 }}
                 className={cn(
                   "absolute top-0 left-0 h-full opacity-20",
                   score >= 90 ? "bg-emerald-500" : score >= 70 ? "bg-amber-500" : "bg-rose-500"
                 )}
               />
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.5)] pointer-events-auto border border-white/10 relative",
            aiEvent ? "bg-indigo-500 text-white animate-pulse" :
            hasCritical ? "bg-rose-500/20 text-rose-400" : "bg-primary text-white"
          )}
        >
          {hasCritical && !aiEvent && <div className="absolute top-0 right-0 w-4 h-4 rounded-full bg-rose-500 animate-pulse border-2 border-black" />}
          {aiEvent && <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-indigo-400 animate-ping opacity-75" />}
          <Bot size={24} />
        </motion.button>
      )}

    </div>
  );
}
