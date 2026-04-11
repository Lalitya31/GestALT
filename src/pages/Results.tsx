import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Brain, Focus, CheckCircle, Navigation, ArrowRight, Zap, Target, Layers, Eye } from 'lucide-react';
import { BADGE_DEFS } from '../engine/GamificationSystem';
import Confetti from 'react-confetti';

interface ResultsData {
  score: number;
  timeElapsed: number;
  cognitiveLoadReduction: number;
  constraintImprovement: number;
  xpGained: number;
  rank: 'S'|'A'|'B'|'C';
  metrics: {
    contrast: number;
    fittsLawTarget: number;
    hierarchy: number;
  }
}

const theories = [
  {
    title: "Fitts' Law",
    icon: <Navigation className="text-emerald-400" />,
    explanation: "Larger interactive elements are easier and faster to click. Your button improvements reduced user error likelihood."
  },
  {
    title: "Visual Hierarchy",
    icon: <Focus className="text-blue-400" />,
    explanation: "Proper labeling and capitalization guide user attention to important information first before reading the fine print."
  },
  {
    title: "WCAG Accessibility",
    icon: <CheckCircle className="text-purple-400" />,
    explanation: "Adequate padding and border contrast ensure the interface is usable for everyone, including those with visual impairments."
  }
];

export default function Results() {
  const navigate = useNavigate();
  const [data, setData] = useState<ResultsData | null>(null);
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const raw = localStorage.getItem('gestalt_results');
    if (raw) setData(JSON.parse(raw));
    else setData({ score: 98, timeElapsed: 24, cognitiveLoadReduction: 85, constraintImprovement: 95, xpGained: 1600, rank: 'S', metrics: { contrast: 5.2, fittsLawTarget: 48, hierarchy: 100 } });

    const rawBadges = localStorage.getItem('gestalt_new_badges');
    if (rawBadges) setNewBadges(JSON.parse(rawBadges));
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Draw spectacular heat map simulation based on score
    const scoreMult = (data?.score || 100) / 100;
    
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, 300 * scoreMult
    );
    
    if ((data?.rank || 'C') === 'S') {
      gradient.addColorStop(0, 'rgba(251, 191, 36, 0.8)');   // Gold Focus for S Rank
      gradient.addColorStop(0.4, 'rgba(239, 68, 68, 0.3)');  // Red spread
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.0)');   
    } else {
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.6)');  // Emerald Focus
      gradient.addColorStop(0.4, 'rgba(56, 189, 248, 0.3)'); // Cyan spread
      gradient.addColorStop(1, 'rgba(139, 92, 246, 0.0)');   // Purple fade
    }
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [data]);

  const handleProceed = () => {
    try {
      const rawUser = localStorage.getItem('gestalt_user');
      const user = rawUser ? JSON.parse(rawUser) : { totalXP: 0, completedLessons: [], badges: [] };
      
      user.totalXP += data?.xpGained || 0;
      if (!user.completedLessons.includes('registration-form')) {
        user.completedLessons.push('registration-form');
      }
      
      // Update global badges
      user.badges = Array.from(new Set([...user.badges, ...newBadges]));
      
      localStorage.setItem('gestalt_user', JSON.stringify(user));
      localStorage.removeItem('gestalt_new_badges');
    } catch (e) { console.error('Error saving user data', e); }
    
    navigate('/dashboard');
  };

  if (!data) return null;

  const minutes = Math.floor(data.timeElapsed / 60);
  const seconds = data.timeElapsed % 60;

  const rankColors = {
    'S': 'text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.6)] border-yellow-400/50 bg-yellow-400/10',
    'A': 'text-emerald-400 drop-shadow-[0_0_30px_rgba(52,211,153,0.5)] border-emerald-400/50 bg-emerald-400/10',
    'B': 'text-blue-400 drop-shadow-[0_0_20px_rgba(96,165,250,0.5)] border-blue-400/50 bg-blue-400/10',
    'C': 'text-white/50 border-white/20 bg-white/5'
  };

  return (
    <div className="min-h-screen w-full flex flex-col pt-24 px-6 sm:px-12 relative overflow-hidden pb-20">
      
      {data.rank === 'S' && <Confetti recycle={false} numberOfPieces={500} colors={['#fbbf24', '#f59e0b', '#ef4444', '#10b981']} />}
      
      <div className={cn(
        "absolute top-[0%] left-[-10%] w-[800px] h-[800px] blur-[200px] rounded-full pointer-events-none -z-10",
        data.rank === 'S' ? 'bg-amber-500/20' : 'bg-emerald-500/10'
      )} />
      
      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Metrics & Rank */}
        <div className="lg:col-span-4 space-y-6">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            className="glass-card p-10 rounded-3xl text-center relative overflow-hidden group shadow-2xl flex flex-col items-center justify-center border-t border-white/10"
          >
             <div className="absolute top-4 left-4 inline-block px-3 py-1 bg-white/5 rounded-full border border-white/10 shadow-inner">
               <span className="text-[10px] uppercase font-black tracking-widest text-primary">Mission Complete</span>
             </div>
             
             <h2 className="text-white/50 font-bold tracking-widest uppercase mb-6 mt-6">Evaluation Rank</h2>
             
             <motion.div 
               initial={{ scale: 0, rotate: -45 }}
               animate={{ scale: 1, rotate: 0 }}
               transition={{ type: 'spring', damping: 12, delay: 0.3 }}
               className={cn(
                 "w-40 h-40 rounded-3xl flex items-center justify-center mb-8 border-2 shadow-2xl relative",
                 rankColors[data.rank]
               )}
             >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none rounded-3xl" />
                <span className="text-8xl font-black italic tracking-tighter mix-blend-screen">{data.rank}</span>
             </motion.div>
            
            <div className="w-full bg-black/40 rounded-2xl p-4 border border-white/5 shadow-inner">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-xs font-bold uppercase text-white/50 tracking-wider">Algorithmic Score</span>
                 <span className="text-white font-bold">{data.score}/100</span>
               </div>
               <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }} animate={{ width: `${data.score}%` }} transition={{ duration: 1.5 }}
                   className={cn("h-full rounded-full", data.rank === 'S' ? 'bg-amber-400' : 'bg-emerald-400')}
                 />
               </div>
            </div>
          </motion.div>

          {/* Sub Metrics */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Time Elapsed', value: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`, color: 'text-white' },
              { label: 'XP Reward', value: `+${data.xpGained}`, color: 'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]' },
              { label: 'Cognitive Load', value: `-${Math.round(data.cognitiveLoadReduction)}%`, color: 'text-blue-400' },
              { label: 'Constraints', value: `+${Math.round(data.constraintImprovement)}%`, color: 'text-purple-400' },
            ].map((metric, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + (idx * 0.1) }}
                className="glass-panel p-5 rounded-2xl flex flex-col items-center justify-center border border-white/5"
              >
                <span className="text-[10px] text-white/50 uppercase font-black tracking-widest mb-2 text-center">{metric.label}</span>
                <span className={cn("text-2xl font-black font-mono tracking-tighter", metric.color)}>{metric.value}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column: Heatmap, Badges & Theory */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Heatmap Area */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="glass-panel rounded-3xl p-8 relative overflow-hidden flex flex-col h-[320px]"
            >
              <div className="flex items-center gap-3 mb-4 z-10 relative">
                <Brain className="text-primary" />
                <h3 className="text-lg font-black text-white uppercase tracking-wider">Attention Simulation</h3>
              </div>
              
              <div className="flex-1 bg-[#0a0a0f] rounded-2xl border border-white/10 relative overflow-hidden shadow-inner">
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full mix-blend-screen opacity-90" />
                <div className="absolute bottom-4 left-4 right-4 z-10">
                   <p className="text-emerald-300 text-xs font-bold uppercase tracking-wider bg-black/60 px-4 py-2 rounded-xl backdrop-blur-md border border-emerald-500/20 text-center">
                     Core focus successfully consolidated on primary CTA.
                   </p>
                </div>
              </div>
            </motion.div>
            
            {/* Unlocked Badges */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
              className="glass-card rounded-3xl p-8 h-[320px] flex flex-col relative overflow-hidden"
            >
               <div className="absolute top-[-50px] right-[-50px] w-[150px] h-[150px] bg-amber-500/20 blur-[40px] rounded-full pointer-events-none" />
               <h3 className="text-lg font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                 <Target className="text-amber-400" /> Achievements Unlocked
               </h3>
               
               <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                 {newBadges.length > 0 ? (
                   newBadges.map((badgeId, i) => {
                     // Find badge def
                     const b = Object.values(BADGE_DEFS).find(def => def.id === badgeId);
                     if(!b) return null;
                     return (
                       <motion.div 
                         initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + (i*0.2) }}
                         key={badgeId} 
                         className="bg-gradient-to-r from-amber-500/20 to-amber-500/5 border border-amber-500/30 rounded-2xl p-4 flex gap-4 items-center shadow-lg"
                       >
                         <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.3)] shrink-0">
                           {b.icon === 'Eye' && <Eye size={20} />}
                           {b.icon === 'Target' && <Target size={20} />}
                           {b.icon === 'Zap' && <Zap size={20} />}
                           {b.icon === 'Layers' && <Layers size={20} />}
                         </div>
                         <div>
                           <h4 className="text-amber-400 font-bold mb-0.5 leading-tight">{b.name}</h4>
                           <p className="text-white/70 text-xs font-medium leading-snug">{b.desc}</p>
                         </div>
                       </motion.div>
                     );
                   })
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                     <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3">
                       <Target size={20} className="text-white/50" />
                     </div>
                     <p className="text-sm font-bold">No new badges unlocked.</p>
                     <p className="text-xs text-white/50 mt-1">Try to increase your score or speed next time.</p>
                   </div>
                 )}
               </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="glass-panel rounded-3xl p-8 flex-1"
          >
            <h3 className="text-lg font-black text-white uppercase tracking-wider mb-6 border-b border-white/10 pb-4">Engine Validation Concepts</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {theories.map((theory, idx) => (
                <div key={idx} className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-white/5 p-2 rounded-xl shrink-0 border border-white/10">{theory.icon}</div>
                    <h4 className="text-white font-bold leading-tight">{theory.title}</h4>
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed font-medium">{theory.explanation}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
            <button 
              onClick={handleProceed}
              className="w-full py-5 rounded-3xl bg-white text-black font-black uppercase tracking-widest shadow-[0_15px_30px_rgba(255,255,255,0.2)] hover:shadow-[0_20px_40px_rgba(255,255,255,0.3)] transition-all flex items-center justify-center gap-3 hover:-translate-y-1"
            >
              Update Neural Profile <ArrowRight size={18} />
            </button>
          </motion.div>

        </div>

      </div>
    </div>
  );
}
