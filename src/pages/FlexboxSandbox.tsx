import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Columns, CheckCircle2 } from 'lucide-react';
import { AIMentor } from '../components/ui/AIMentor';

const FLEXBOX_LEVELS = [
  { title: "Level 1: The Centered Block", subtitle: "Achieve the classic horizontally and vertically centered card layout.", targetDir: 'row', targetJustify: 'center', targetAlign: 'center', targetWrap: 'nowrap' },
  { title: "Level 2: The Header Spread", subtitle: "Spread the elements out to the absolute edges.", targetDir: 'row', targetJustify: 'space-between', targetAlign: 'center', targetWrap: 'nowrap' },
  { title: "Level 3: The Responsive Grid", subtitle: "Force the items to wrap across a column stream.", targetDir: 'row', targetJustify: 'flex-start', targetAlign: 'flex-start', targetWrap: 'wrap' },
] as const;

export default function FlexboxSandbox() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(0);
  
  // Flexbox CSS Controls
  const [flexDir, setFlexDir] = useState('row');
  const [justify, setJustify] = useState('flex-start');
  const [align, setAlign] = useState('stretch');
  const [wrap, setWrap] = useState('nowrap');

  const [score, setScore] = useState(0);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [mentorFeedback, setMentorFeedback] = useState({ issues: [] as string[], suggestions: [] as string[] });

  const level = FLEXBOX_LEVELS[currentLevel];

  useEffect(() => {
    setFlexDir('row'); setJustify('flex-start'); setAlign('stretch'); setWrap('nowrap');
    setIsLevelComplete(false);
  }, [currentLevel]);

  useEffect(() => {
    let currentScore = 100;
    const issues = [];
    const suggestions = [];

    if (flexDir !== level.targetDir) { currentScore -= 25; issues.push(`Direction must be ${level.targetDir}`); }
    if (justify !== level.targetJustify) { currentScore -= 25; issues.push(`Main axis distribution is incorrect.`); suggestions.push(`Try modifying justify-content to ${level.targetJustify}.`); }
    if (align !== level.targetAlign) { currentScore -= 25; issues.push(`Cross axis distribution is failing alignment.`); suggestions.push(`Try modifying align-items to ${level.targetAlign}.`); }
    if (wrap !== level.targetWrap) { currentScore -= 25; issues.push(`Wrap state breaks the viewport intent.`); }

    setScore(Math.max(0, currentScore));
    setMentorFeedback({ issues, suggestions });
    setIsLevelComplete(currentScore === 100);
  }, [flexDir, justify, align, wrap, level]);

  const handleNextLevel = () => {
    if (currentLevel < FLEXBOX_LEVELS.length - 1) {
      setCurrentLevel(l => l + 1);
    } else {
      try {
        const rawUser = localStorage.getItem('gestalt_user');
        const user = rawUser ? JSON.parse(rawUser) : { totalXP: 0, completedLessons: [], badges: [] };
        user.totalXP += 1000;
        if (!user.completedLessons.includes('flexbox-sandbox')) user.completedLessons.push('flexbox-sandbox');
        if (!user.badges.includes('FLEX_WIZARD')) user.badges.push('FLEX_WIZARD');
        localStorage.setItem('gestalt_user', JSON.stringify(user));
      } catch (e) {}
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col pt-24 pb-20 px-4 md:px-12 relative overflow-hidden">
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 w-full max-w-6xl mx-auto z-10">
        <div>
          <div className="inline-block glass-panel px-3 py-1 rounded-full mb-3 shadow-inner border border-white/5">
            <span className="text-xs font-bold tracking-widest text-orange-400 uppercase">Fluid Systems</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
            {level.title}
          </h1>
          <p className="text-white/60 text-lg mt-2 font-medium">{level.subtitle}</p>
        </div>

        <div className="glass-panel px-8 py-4 rounded-2xl flex flex-col items-center justify-center border border-white/10 relative overflow-hidden">
          <span className="text-xs text-white/50 uppercase font-bold tracking-wider mb-1 z-10">Structure Metric</span>
          <span className={cn("text-3xl font-mono font-black z-10 transition-colors", isLevelComplete ? "text-emerald-400" : "text-white")}>
            {score}%
          </span>
          {isLevelComplete && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 bg-emerald-500/20 z-0" />}
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-12 w-full max-w-6xl mx-auto flex-1 z-10">
        
        {/* CSS Flexbox Controls */}
        <div className="w-full lg:w-[400px] flex flex-col gap-4">
          <div className="bg-black/80 backdrop-blur-3xl flex-1 rounded-3xl p-8 border border-white/10 shadow-2xl overflow-y-auto">
            
            <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
              <Columns className="text-orange-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">CSS Node Properties</h2>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/50 uppercase tracking-widest font-mono">flex-direction</label>
                <div className="flex bg-white/5 rounded-lg border border-white/10 p-1">
                  {['row', 'column'].map(opt => (
                    <button key={opt} onClick={() => setFlexDir(opt)} className={cn("flex-1 py-2 text-sm font-bold uppercase rounded-md transition-colors", flexDir === opt ? "bg-orange-500 text-white" : "text-white/50 hover:bg-white/5")}>{opt}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/50 uppercase tracking-widest font-mono">justify-content</label>
                <div className="grid grid-cols-2 gap-1 bg-white/5 rounded-lg border border-white/10 p-1">
                  {['flex-start', 'center', 'flex-end', 'space-between', 'space-around'].map(opt => (
                    <button key={opt} onClick={() => setJustify(opt)} className={cn("py-2 text-[10px] sm:text-xs font-bold uppercase rounded-md transition-colors", justify === opt ? "bg-orange-500 text-white" : "text-white/50 hover:bg-white/5")}>
                       {opt.replace('space-', 'spc-')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/50 uppercase tracking-widest font-mono">align-items</label>
                <div className="grid grid-cols-2 gap-1 bg-white/5 rounded-lg border border-white/10 p-1">
                  {['flex-start', 'center', 'flex-end', 'stretch'].map(opt => (
                    <button key={opt} onClick={() => setAlign(opt)} className={cn("py-2 text-xs font-bold uppercase rounded-md transition-colors", align === opt ? "bg-orange-500 text-white" : "text-white/50 hover:bg-white/5")}>{opt}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-white/50 uppercase tracking-widest font-mono">flex-wrap</label>
                <div className="flex bg-white/5 rounded-lg border border-white/10 p-1">
                  {['nowrap', 'wrap'].map(opt => (
                    <button key={opt} onClick={() => setWrap(opt)} className={cn("flex-1 py-2 text-sm font-bold uppercase rounded-md transition-colors", wrap === opt ? "bg-orange-500 text-white" : "text-white/50 hover:bg-white/5")}>{opt}</button>
                  ))}
                </div>
              </div>
            </div>

            <AnimatePresence>
              {isLevelComplete && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  onClick={handleNextLevel}
                  className="mt-8 w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-white font-black uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={20} /> Deploy Layout
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Live CSS DOM Mapping Node */}
        <div 
          className="flex-1 rounded-3xl p-4 bg-white/5 shadow-inner border-[4px] border-dashed border-white/20 transition-all duration-500 flex"
          style={{ flexDirection: flexDir as any, justifyContent: justify, alignItems: align, flexWrap: wrap as any }}
        >
          <motion.div layout className="w-[120px] h-[80px] m-2 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl shadow-[0_0_30px_rgba(249,115,22,0.3)] flex items-center justify-center font-black text-white text-3xl">1</motion.div>
          <motion.div layout className="w-[180px] h-[100px] m-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-[0_0_30px_rgba(245,158,11,0.3)] flex items-center justify-center font-black text-white text-3xl">2</motion.div>
          <motion.div layout className="w-[150px] h-[60px] m-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-[0_0_30px_rgba(225,29,72,0.3)] flex items-center justify-center font-black text-white text-3xl">3</motion.div>
          {currentLevel === 2 && (
             <>
               <motion.div layout className="w-[200px] h-[90px] m-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl shadow-[0_0_30px_rgba(236,72,153,0.3)] flex items-center justify-center font-black text-white text-3xl">4</motion.div>
               <motion.div layout className="w-[140px] h-[110px] m-2 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-xl shadow-[0_0_30px_rgba(168,85,247,0.3)] flex items-center justify-center font-black text-white text-3xl">5</motion.div>
             </>
          )}
        </div>

      </div>

      {score < 100 && (
        <AIMentor score={score} issues={mentorFeedback.issues} suggestions={mentorFeedback.suggestions} />
      )}
    </div>
  );
}
