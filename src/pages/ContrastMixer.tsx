import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';
import { AIMentor } from '../components/ui/AIMentor';

const CONTRAST_LEVELS = [
  { title: "Level 1: WCAG 4.5:1", subtitle: "Achieve AAA compliance against pure white text.", targetLuminance: 'dark', textCol: '#FFFFFF' },
  { title: "Level 2: The Bright Core", subtitle: "Achieve AAA compliance against pure black text.", targetLuminance: 'light', textCol: '#000000' },
  { title: "Level 3: Muted Elegance", subtitle: "Achieve AAA compliance against an off-white #F3F4F6 text.", targetLuminance: 'dark', textCol: '#F3F4F6' },
] as const;

export default function ContrastMixer() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(0);
  
  // R, G, B channels
  const [r, setR] = useState(128);
  const [g, setG] = useState(128);
  const [b, setB] = useState(128);

  const [score, setScore] = useState(0);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [mentorFeedback, setMentorFeedback] = useState({ issues: [] as string[], suggestions: [] as string[] });

  const level = CONTRAST_LEVELS[currentLevel];

  // Helper to calculate relative luminance
  const getLuminance = (r: number, g: number, b: number) => {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  // Helper to get hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  useEffect(() => {
    if (level.targetLuminance === 'dark') {
      setR(200); setG(200); setB(200); // Start opposite so they have to work
    } else {
      setR(50); setG(50); setB(50);
    }
  }, [currentLevel]);

  useEffect(() => {
    const bgLum = getLuminance(r, g, b);
    const textRgb = hexToRgb(level.textCol);
    const textLum = getLuminance(textRgb.r, textRgb.g, textRgb.b);
    
    const brightest = Math.max(bgLum, textLum);
    const darkest = Math.min(bgLum, textLum);
    const contrastRatio = (brightest + 0.05) / (darkest + 0.05);

    let currentScore = Math.floor((contrastRatio / 4.5) * 100);
    if (currentScore > 100) currentScore = 100;
    
    setScore(currentScore);

    const issues = [];
    const suggestions = [];

    if (contrastRatio < 3.0) {
      issues.push(`Contrast ratio is ${contrastRatio.toFixed(2)}:1 (Fails WCAG AA).`);
      if (level.targetLuminance === 'dark') suggestions.push('Decrease the RGB channel values to darken the background.');
      if (level.targetLuminance === 'light') suggestions.push('Increase the RGB channel values to lighten the background.');
    } else if (contrastRatio < 4.5) {
      issues.push(`Contrast ratio is ${contrastRatio.toFixed(2)}:1. Almost AA compliant.`);
    }

    setMentorFeedback({ issues, suggestions });
    setIsLevelComplete(contrastRatio >= 4.5);
  }, [r, g, b, level]);

  const handleNextLevel = () => {
    if (currentLevel < CONTRAST_LEVELS.length - 1) {
      setCurrentLevel(l => l + 1);
    } else {
      try {
        const rawUser = localStorage.getItem('gestalt_user');
        const user = rawUser ? JSON.parse(rawUser) : { totalXP: 0, completedLessons: [], badges: [] };
        user.totalXP += 1000;
        if (!user.completedLessons.includes('contrast-mixer')) user.completedLessons.push('contrast-mixer');
        if (!user.badges.includes('CONTRAST_GUARDIAN')) user.badges.push('CONTRAST_GUARDIAN');
        localStorage.setItem('gestalt_user', JSON.stringify(user));
      } catch (e) {}
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col pt-24 pb-20 px-4 md:px-12 relative overflow-hidden" style={{ transition: 'background-color 0.5s', backgroundColor: `rgb(${r},${g},${b})` }}>
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 w-full max-w-6xl mx-auto z-10 p-8 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div>
          <div className="inline-block glass-panel px-3 py-1 rounded-full mb-3 shadow-inner border border-white/5">
            <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">Accessibility Standard</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
            {level.title}
          </h1>
          <p className="text-white/80 text-lg mt-2 font-medium">{level.subtitle}</p>
        </div>

        <div className="bg-black/80 px-8 py-4 rounded-2xl flex flex-col items-center justify-center border border-white/10 relative overflow-hidden">
          <span className="text-xs text-white/50 uppercase font-bold tracking-wider mb-1 z-10">Compliance</span>
          <span className={cn("text-3xl font-mono font-black z-10 transition-colors", isLevelComplete ? "text-emerald-400" : "text-white")}>
            {score}%
          </span>
          {isLevelComplete && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 bg-emerald-500/20 z-0" />}
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-12 w-full max-w-6xl mx-auto flex-1 z-10">
        
        {/* Controls */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6">
          <div className="bg-black/60 backdrop-blur-3xl flex-1 rounded-3xl p-8 border border-white/10 shadow-2xl flex flex-col justify-center">
            
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-xs font-bold text-red-400 uppercase tracking-wider flex justify-between">
                  Red Channel <span>{r}</span>
                </label>
                <input type="range" min="0" max="255" value={r} onChange={(e) => setR(parseInt(e.target.value))} className="w-full h-2 bg-red-500/30 rounded-lg appearance-none cursor-pointer" />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-green-400 uppercase tracking-wider flex justify-between">
                  Green Channel <span>{g}</span>
                </label>
                <input type="range" min="0" max="255" value={g} onChange={(e) => setG(parseInt(e.target.value))} className="w-full h-2 bg-green-500/30 rounded-lg appearance-none cursor-pointer" />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-blue-400 uppercase tracking-wider flex justify-between">
                  Blue Channel <span>{b}</span>
                </label>
                <input type="range" min="0" max="255" value={b} onChange={(e) => setB(parseInt(e.target.value))} className="w-full h-2 bg-blue-500/30 rounded-lg appearance-none cursor-pointer" />
              </div>
            </div>

            <AnimatePresence>
              {isLevelComplete && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  onClick={handleNextLevel}
                  className="mt-12 w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-white font-black uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={20} /> Deploy Color
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Preview Viewport */}
        <div className="flex-1 rounded-3xl p-12 relative flex flex-col items-center justify-center text-center">
          <motion.h2 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="text-6xl md:text-8xl font-black mb-6 tracking-tighter drop-shadow-2xl"
            style={{ color: level.textCol }}
          >
            WCAG AA
          </motion.h2>
          <p className="text-xl max-w-md font-medium" style={{ color: level.textCol, opacity: 0.8 }}>
            Ensure your interfaces are legible by people with moderate visual impairments. Design is for everyone.
          </p>
        </div>

      </div>

      {score < 100 && (
        <AIMentor score={score} issues={mentorFeedback.issues} suggestions={mentorFeedback.suggestions} />
      )}
    </div>
  );
}
