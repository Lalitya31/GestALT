import React, { useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLearning } from '@/engine/LearningContext';
import { learningContentData } from '@/data/learningContent';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Target } from 'lucide-react';

interface LearningHarnessProps {
  moduleId: string;
  maxLevels?: number;
  children: React.ReactNode;
}

/**
 * LearningHarness
 * Wraps every game. Reads the Global Learning Context.
 * Intercepts the mount to show Phase 1 (Before).
 * Renders Children for Phase 2 (During).
 * Intercepts the end to show Phase 3 (After).
 */
export default function LearningHarness({ moduleId, maxLevels = 3, children }: LearningHarnessProps) {
  const { activeModuleId, initializeModule, phase, setPhase } = useLearning();
  const navigate = useNavigate();

  const exitToDashboard = useCallback(() => {
    setPhase('BEFORE');
    navigate('/dashboard', { replace: true });
  }, [navigate, setPhase]);

  useEffect(() => {
    if (activeModuleId !== moduleId) {
      initializeModule(moduleId, maxLevels);
    }
  }, [moduleId, activeModuleId, maxLevels, initializeModule]);

  useEffect(() => {
    const handleBrowserBack = () => {
      exitToDashboard();
    };

    window.addEventListener('popstate', handleBrowserBack);
    return () => window.removeEventListener('popstate', handleBrowserBack);
  }, [exitToDashboard]);

  const content = learningContentData[moduleId];
  if (!content) return <>{children}</>;

  const handleFinish = () => {
    // Save to DB
    try {
      const rawUser = localStorage.getItem('gestalt_user');
      const user = rawUser ? JSON.parse(rawUser) : { totalXP: 0, completedLessons: [], badges: [] };
      user.totalXP += 1000 * maxLevels;
      if (!user.completedLessons.includes(moduleId)) user.completedLessons.push(moduleId);
      localStorage.setItem('gestalt_user', JSON.stringify(user));
    } catch(e) {}
    exitToDashboard();
  };

  return (
    <div className="relative w-full min-h-screen">
      {phase === 'DURING' && (
        <button
          onClick={exitToDashboard}
          className="fixed left-5 top-5 z-[110] inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/55 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/85 backdrop-blur-md transition-colors hover:bg-black/75"
        >
          <ChevronLeft size={14} />
          Back to Dashboard
        </button>
      )}
      
      {/* PHASE 2: The Actual Game plays in the background/foreground depending on state */}
      <div className={`transition-all duration-1000 flex flex-col min-h-screen ${phase !== 'DURING' ? 'blur-xl grayscale opacity-30 pointer-events-none' : ''}`}>
         {children}
      </div>

      {/* OVERLAYS */}
      <AnimatePresence>
        {/* PHASE 1: BEFORE CUE */}
        {phase === 'BEFORE' && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-2xl p-6"
          >
             <div className="bg-slate-900 border border-white/10 rounded-[32px] p-12 max-w-2xl w-full shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6">
                   <BookOpen size={32} />
                </div>
                <h3 className="text-indigo-400 font-bold tracking-widest uppercase text-xs mb-2">Fundamental Theory</h3>
                <h1 className="text-4xl font-black text-white mb-6">{content.before.title}</h1>
                
                <div className="space-y-6 text-slate-300">
                   <p className="text-lg leading-relaxed"><strong className="text-white">The Concept:</strong> {content.before.description}</p>
                   <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20">
                     <p className="text-sm"><strong className="text-indigo-300 gap-2 flex items-center mb-1"><Target size={16}/> Real World Example:</strong> {content.before.realWorldExample}</p>
                   </div>
                </div>

                <div className="mt-12 flex items-center justify-between border-t border-white/10 pt-8">
                   <p className="text-xs text-slate-500 font-mono tracking-widest">{maxLevels} Progressive Levels</p>
                   <button 
                     onClick={() => setPhase('DURING')}
                     className="bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-4 rounded-full font-bold tracking-wide flex items-center gap-2 group transition-all"
                   >
                     Initiate Simulation <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                   </button>
                </div>
             </div>
          </motion.div>
        )}

        {/* PHASE 3: AFTER ANALYSIS */}
        {phase === 'AFTER' && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-2xl p-6"
          >
             <div className="bg-slate-900 border border-emerald-500/20 rounded-[32px] p-12 max-w-3xl w-full shadow-[0_0_100px_rgba(16,185,129,0.1)]">
                <div className="flex justify-between items-start mb-8">
                   <div>
                     <h3 className="text-emerald-400 font-bold tracking-widest uppercase text-xs mb-2">Simulation Passed</h3>
                     <h1 className="text-4xl font-black text-white">{content.after.title}</h1>
                   </div>
                   <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                     <CheckCircle2 size={32} />
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                   <div>
                      <h4 className="text-sm font-bold text-white mb-3">Why it Matters</h4>
                      <p className="text-slate-400 text-sm leading-relaxed">{content.after.whyItMatters}</p>
                   </div>
                   <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/10">
                      <h4 className="text-sm font-bold text-rose-300 mb-3">Common Architect Mistakes</h4>
                      <ul className="space-y-2">
                         {content.after.commonMistakes.map((mistake: string, i: number) => (
                           <li key={i} className="text-slate-400 text-xs flex items-start gap-2">
                              <span className="text-rose-500">•</span> {mistake}
                           </li>
                         ))}
                      </ul>
                   </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-8">
                   <div className="flex gap-2">
                     {content.after.relatedLaws.map((law: string) => (
                       <span key={law} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-slate-400">{law}</span>
                     ))}
                   </div>
                   <button 
                     onClick={handleFinish}
                     className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-4 rounded-full font-bold tracking-wide flex items-center gap-2 group transition-all"
                   >
                     Return to Dashboard <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                   </button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
