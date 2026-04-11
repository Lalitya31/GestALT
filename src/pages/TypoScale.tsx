import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Type, CheckCircle2 } from 'lucide-react';
import { AIMentor } from '../components/ui/AIMentor';

export default function TypoScale() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [scaleRatio, setScaleRatio] = useState(1.0); // Perfect is typically 1.250 (Major Third) or 1.618 (Golden Ratio)
  const [score, setScore] = useState(0);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [mentorFeedback, setMentorFeedback] = useState({ issues: [] as string[], suggestions: [] as string[] });

  const levels = [
    { title: "Level 1: The Minor Third", subtitle: "Find the 1.200 typography scale multiplier.", target: 1.20 },
    { title: "Level 2: The Perfect Fourth", subtitle: "Scale up the impact to a 1.333 multiplier.", target: 1.33 },
    { title: "Level 3: The Golden Ratio", subtitle: "Achieve divine proportion at 1.618.", target: 1.62 },
  ];
  const level = levels[currentLevel];

  useEffect(() => {
    setScaleRatio(1.0);
    setIsLevelComplete(false);
  }, [currentLevel]);

  useEffect(() => {
    // Grade the scale
    const diff = Math.abs(scaleRatio - level.target);
    let currentScore = 100;
    const issues = [];
    const suggestions = [];

    if (diff > 0.1) {
      currentScore -= 40;
      issues.push(`The hierarchy is broken. Ratio: ${scaleRatio.toFixed(3)}`);
      suggestions.push(`Slide to approximate ${level.target.toFixed(3)}`);
    } else if (diff > 0.02) {
      currentScore -= 10;
      issues.push(`Close, but lacks mathematical perfection.`);
    }

    setScore(Math.max(0, currentScore));
    setMentorFeedback({ issues, suggestions });

    setIsLevelComplete(currentScore >= 95);
  }, [scaleRatio, level.target]);

  const handleNextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(l => l + 1);
    } else {
      try {
        const rawUser = localStorage.getItem('gestalt_user');
        const user = rawUser ? JSON.parse(rawUser) : { totalXP: 0, completedLessons: [], badges: [] };
        user.totalXP += 1000;
        if (!user.completedLessons.includes('typo-scale')) user.completedLessons.push('typo-scale');
        if (!user.badges.includes('TYPO_SNOB')) user.badges.push('TYPO_SNOB');
        localStorage.setItem('gestalt_user', JSON.stringify(user));
      } catch (e) {}
      navigate('/dashboard');
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard', { replace: true });
  };

  const baseSize = 1; // 1rem

  return (
    <div className="min-h-screen w-full flex flex-col pt-24 pb-20 px-4 md:px-12 relative overflow-hidden">
      <button
        onClick={handleBackToDashboard}
        className="fixed left-5 top-5 z-[80] inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/55 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white/85 backdrop-blur-md transition-colors hover:bg-black/75"
      >
        Back to Dashboard
      </button>
      <div 
        className="absolute top-1/2 left-0 w-[600px] h-[600px] blur-[150px] rounded-full opacity-20 pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: isLevelComplete ? '#10b981' : '#f59e0b' }}
      />
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 w-full max-w-6xl mx-auto z-10">
        <div>
          <div className="inline-block glass-panel px-3 py-1 rounded-full mb-3 shadow-inner border border-white/5">
            <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">Visual Hierarchy</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
            {level.title}
          </h1>
          <p className="text-white/60 text-lg mt-2 font-medium">{level.subtitle}</p>
        </div>

        <div className="glass-panel px-8 py-4 rounded-2xl flex flex-col items-center justify-center border border-white/10 relative overflow-hidden">
          <span className="text-xs text-white/50 uppercase font-bold tracking-wider mb-1 z-10">Scale Match</span>
          <span className={cn("text-3xl font-mono font-black z-10 transition-colors", isLevelComplete ? "text-emerald-400" : "text-white")}>
            {score}%
          </span>
          {isLevelComplete && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 bg-emerald-500/20 z-0" />}
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-12 w-full max-w-6xl mx-auto flex-1 z-10">
        
        {/* Controls */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6">
          <div className="glass-card flex-1 rounded-3xl p-8 border-white/10 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-10 border-b border-white/10 pb-4">
              <Type className="text-amber-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">Scale Multiplier</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-4xl font-black text-white font-mono">{scaleRatio.toFixed(3)}<span className="text-white/30 text-xl">x</span></span>
              </div>
              <input 
                type="range" min="1.0" max="2.0" step="0.01"
                value={scaleRatio} onChange={(e) => setScaleRatio(parseFloat(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-white/10 to-amber-500/50 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <AnimatePresence>
              {isLevelComplete && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  onClick={handleNextLevel}
                  className="mt-12 w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-white font-black uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={20} /> Next Scale
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Preview Viewport */}
        <div className="glass-panel flex-1 rounded-3xl border border-white/5 p-12 relative overflow-hidden bg-black/50 shadow-inner flex flex-col justify-center">
          <motion.h1 layout style={{ fontSize: `${baseSize * Math.pow(scaleRatio, 3)}rem` }} className="font-black text-white leading-tight mb-4 tracking-tighter">
            The Future of Interfaces
          </motion.h1>
          <motion.h2 layout style={{ fontSize: `${baseSize * Math.pow(scaleRatio, 2)}rem` }} className="font-bold text-white/80 leading-snug mb-4">
            A comprehensive guide to spatial awareness and cognitive computing.
          </motion.h2>
          <motion.h3 layout style={{ fontSize: `${baseSize * scaleRatio}rem` }} className="font-semibold text-white/60 mb-6 uppercase tracking-widest">
            Chapter 1: The Core
          </motion.h3>
          <motion.p layout style={{ fontSize: `${baseSize}rem` }} className="text-white/50 leading-relaxed font-serif max-w-2xl">
            Typography is not merely about selecting a beautiful font. It is the mathematical arrangement of language to establish an effortless hierarchy. When humans scan a document, their eyes gravitate toward massive weight variations...
          </motion.p>
        </div>

      </div>

      {score < 100 && (
        <AIMentor score={score} issues={mentorFeedback.issues} suggestions={mentorFeedback.suggestions} />
      )}
    </div>
  );
}
