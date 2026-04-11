import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Focus, CheckCircle2 } from 'lucide-react';
import { AIMentor } from '../components/ui/AIMentor';

const FIGURE_GROUND_LEVELS = [
  { title: "Level 1: Modal Prominence", subtitle: "Extract the modal from the background noise.", targetBlur: 8, targetOpacity: 50 },
  { title: "Level 2: Pure Focus", subtitle: "Achieve deep focus with maximum opacity dimming, no blur.", targetBlur: 0, targetOpacity: 80 },
  { title: "Level 3: Apple Glass", subtitle: "Isolate the figure purely through aggressive background diffraction (blur).", targetBlur: 20, targetOpacity: 10 },
] as const;

export default function FigureGround() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(0);
  
  // Game state: blur radius of the background and opacity of an overlay to pop the modal/figure
  const [blurRadius, setBlurRadius] = useState(0);
  const [overlayOpacity, setOverlayOpacity] = useState(0);

  const [score, setScore] = useState(0);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [mentorFeedback, setMentorFeedback] = useState({ issues: [] as string[], suggestions: [] as string[] });

  const level = FIGURE_GROUND_LEVELS[currentLevel];

  useEffect(() => {
    setBlurRadius(0);
    setOverlayOpacity(0);
    setIsLevelComplete(false);
  }, [currentLevel]);

  useEffect(() => {
    const blurDiff = Math.abs(blurRadius - level.targetBlur);
    const opacDiff = Math.abs(overlayOpacity - level.targetOpacity);
    
    let currentScore = 100 - (blurDiff * 2) - (opacDiff);
    if (currentScore < 0) currentScore = 0;
    
    setScore(currentScore);

    const issues: string[] = [];
    const suggestions: string[] = [];

    if (currentScore < 95) {
      if (blurRadius < level.targetBlur - 2) issues.push(`The background noise is too sharp to establish Figure-Ground separation.`);
      if (blurRadius > level.targetBlur + 2) issues.push(`The blur is artificially aggressive for this environment.`);
      
      if (overlayOpacity < level.targetOpacity - 10) issues.push(`The figure lacks shadow emphasis against the environment.`);
      if (overlayOpacity > level.targetOpacity + 10) issues.push(`The dark overlay is suffocating the interface.`);
    }

    setMentorFeedback({ issues, suggestions });
    setIsLevelComplete(currentScore >= 95);
  }, [blurRadius, overlayOpacity, level]);

  const handleNextLevel = () => {
    if (currentLevel < FIGURE_GROUND_LEVELS.length - 1) {
      setCurrentLevel(l => l + 1);
    } else {
      try {
        const rawUser = localStorage.getItem('gestalt_user');
        const user = rawUser ? JSON.parse(rawUser) : { totalXP: 0, completedLessons: [], badges: [] };
        user.totalXP += 1000;
        if (!user.completedLessons.includes('figure-ground')) user.completedLessons.push('figure-ground');
        if (!user.badges.includes('FIGURE_SAVANT')) user.badges.push('FIGURE_SAVANT');
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
            <span className="text-xs font-bold tracking-widest text-fuchsia-400 uppercase">Perceptual Depth</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
            {level.title}
          </h1>
          <p className="text-white/60 text-lg mt-2 font-medium">{level.subtitle}</p>
        </div>

        <div className="glass-panel px-8 py-4 rounded-2xl flex flex-col items-center justify-center border border-white/10 relative overflow-hidden">
          <span className="text-xs text-white/50 uppercase font-bold tracking-wider mb-1 z-10">Separation Index</span>
          <span className={cn("text-3xl font-mono font-black z-10 transition-colors", isLevelComplete ? "text-emerald-400" : "text-white")}>
            {score}%
          </span>
          {isLevelComplete && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 bg-emerald-500/20 z-0" />}
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-12 w-full max-w-6xl mx-auto flex-1 z-10">
        
        {/* Controls */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6">
          <div className="glass-card flex-1 rounded-3xl p-8 border-white/10 flex flex-col justify-center bg-black/40">
            
            <div className="flex items-center gap-3 mb-10 border-b border-white/10 pb-4">
              <Focus className="text-fuchsia-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">Focus Parameters</h2>
            </div>
            
            <div className="space-y-10">
              <div className="space-y-4">
                <label className="text-xs font-bold text-white/70 uppercase tracking-wider flex justify-between">
                  Diffraction (Blur) <span>{blurRadius}px</span>
                </label>
                <input type="range" min="0" max="40" value={blurRadius} onChange={(e) => setBlurRadius(parseInt(e.target.value))} className="w-full h-2 bg-gradient-to-r from-fuchsia-500/10 to-fuchsia-500/60 rounded-lg appearance-none cursor-pointer" />
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-white/70 uppercase tracking-wider flex justify-between">
                  Atmosphere (Opacity) <span>{overlayOpacity}%</span>
                </label>
                <input type="range" min="0" max="100" value={overlayOpacity} onChange={(e) => setOverlayOpacity(parseInt(e.target.value))} className="w-full h-2 bg-gradient-to-r from-black/10 to-black/80 rounded-lg appearance-none cursor-pointer border border-white/10" />
              </div>
            </div>

            <AnimatePresence>
              {isLevelComplete && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  onClick={handleNextLevel}
                  className="mt-12 w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-white font-black uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={20} /> Next Environment
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Preview Viewport */}
        <div className="flex-1 rounded-3xl relative overflow-hidden border border-white/20 shadow-[-10px_-10px_30px_rgba(255,255,255,0.05),_10px_10px_30px_rgba(0,0,0,0.8)]">
          
          {/* Background Layer (Ground) */}
          <div 
            className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550439062-609e1531270e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center transition-all duration-300"
            style={{ filter: `blur(${blurRadius}px)` }}
          >
            {/* Extremely dense mock UI noise to make the task hard */}
            <div className="grid grid-cols-4 gap-4 p-8 opacity-70">
               {[...Array(16)].map((_, i) => <div key={i} className="h-32 bg-white/10 rounded-xl border border-white/5" />)}
            </div>
          </div>
          
          {/* Overlay Layer */}
          <div className="absolute inset-0 transition-opacity duration-300 bg-black" style={{ opacity: overlayOpacity / 100 }} />

          {/* Foreground Layer (Figure) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="w-[350px] bg-white/10 backdrop-blur-3xl border border-white/20 shadow-2xl p-8 rounded-2xl flex flex-col items-center pointer-events-auto shadow-[0_30px_60px_rgba(0,0,0,0.6)]">
                <div className="w-16 h-16 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-full mb-6 shadow-glow" />
                <h3 className="text-2xl font-black text-white mb-2">System Upgrade</h3>
                <p className="text-center text-white/60 mb-8 font-medium">Please confirm the extraction of the background matrix.</p>
                <div className="w-full flex gap-3">
                  <button className="flex-1 py-3 rounded-lg bg-white/5 text-white font-bold hover:bg-white/10 border border-white/10">Cancel</button>
                  <button className="flex-1 py-3 rounded-lg bg-white text-black font-black uppercase hover:bg-white/90 shadow-lg">Confirm</button>
                </div>
             </div>
          </div>
          
        </div>

      </div>

      {score < 100 && (
        <AIMentor score={score} issues={mentorFeedback.issues} suggestions={mentorFeedback.suggestions} />
      )}
    </div>
  );
}
