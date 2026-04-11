import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Compass, CheckCircle2, X } from 'lucide-react';
import { AIMentor } from '../components/ui/AIMentor';

export default function MegaMenu() {
  const navigate = useNavigate();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [mentorFeedback, setMentorFeedback] = useState({ issues: [] as string[], suggestions: [] as string[] });

  // Initial messy menus
  const initialMenus = [
    ["Home", "About", "Contact", "Privacy", "Terms", "Products", "Services", "Blog", "Careers", "FAQ", "Support", "Investors"],
    ["Shoes", "Shirts", "Pants", "Hats", "Socks", "Underwear", "Jackets", "Coats", "Gloves", "Scarves", "Belts", "Watches", "Wallets", "Ties", "Sunglasses", "Bags", "Suitcases", "Backpacks"],
    ["Dashboard", "Profile", "Settings", "Billing", "Invoices", "Payment Methods", "Subscription", "Notifications", "Security", "API Keys", "Webhooks", "Team", "Members", "Roles", "Permissions", "Audit Logs"]
  ];

  const targetCount = [5, 6, 5]; // Maximum items allowed for Hicks Law
  const [menuItems, setMenuItems] = useState<string[]>(initialMenus[0]);

  const levels = [
    { title: "Level 1: The Corporate Clutter", subtitle: "Trim the massive primary navigation down to 5 essential nodes." },
    { title: "Level 2: The E-Commerce Explosion", subtitle: "Consolidate the 18-item clothing list into 6 core categories." },
    { title: "Level 3: The SaaS Settings Labyrinth", subtitle: "Extract the 5 primary dashboard pillars from the scattered array." },
  ];
  const level = levels[currentLevel];

  useEffect(() => {
    setMenuItems(initialMenus[currentLevel]);
    setIsLevelComplete(false);
  }, [currentLevel]);

  useEffect(() => {
    const current = menuItems.length;
    const target = targetCount[currentLevel];
    
    // Hick's Law logarithmic penalty
    const hicksTimeCurrent = Math.log2(current + 1);
    
    // Grading
    let currentScore = 100 - Math.max(0, (current - target) * 10);
    if (currentScore < 0) currentScore = 0;
    
    setScore(currentScore);

    const issues = [];
    const suggestions = [];

    if (current > target) {
      issues.push(`Cognitive load is too high (Currently taking ~${hicksTimeCurrent.toFixed(1)}s to process).`);
      suggestions.push(`Delete ${current - target} more items to satisfy Hick's Law.`);
    }

    setMentorFeedback({ issues, suggestions });
    setIsLevelComplete(currentScore >= 100);
  }, [menuItems, currentLevel]);

  const removeItem = (item: string) => {
    setMenuItems(menuItems.filter(i => i !== item));
  };
  
  const resetMenu = () => {
    setMenuItems(initialMenus[currentLevel]);
  };

  const handleNextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(l => l + 1);
    } else {
      try {
        const rawUser = localStorage.getItem('gestalt_user');
        const user = rawUser ? JSON.parse(rawUser) : { totalXP: 0, completedLessons: [], badges: [] };
        user.totalXP += 1000;
        if (!user.completedLessons.includes('mega-menu')) user.completedLessons.push('mega-menu');
        if (!user.badges.includes('HICKS_HERO')) user.badges.push('HICKS_HERO');
        localStorage.setItem('gestalt_user', JSON.stringify(user));
      } catch (e) {}
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col pt-24 pb-20 px-4 md:px-12 relative overflow-hidden">
      <div 
        className="absolute top-1/2 left-0 w-[600px] h-[600px] blur-[150px] rounded-full opacity-20 pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: isLevelComplete ? '#10b981' : '#ec4899' }}
      />
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 w-full max-w-6xl mx-auto z-10">
        <div>
          <div className="inline-block glass-panel px-3 py-1 rounded-full mb-3 shadow-inner border border-white/5">
            <span className="text-xs font-bold tracking-widest text-pink-400 uppercase">Hick's Law</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
            {level.title}
          </h1>
          <p className="text-white/60 text-lg mt-2 font-medium">{level.subtitle}</p>
        </div>

        <div className="glass-panel px-8 py-4 rounded-2xl flex flex-col items-center justify-center border border-white/10 relative overflow-hidden">
          <span className="text-xs text-white/50 uppercase font-bold tracking-wider mb-1 z-10">Cognitive Simplicity</span>
          <span className={cn("text-3xl font-mono font-black z-10 transition-colors", isLevelComplete ? "text-emerald-400" : "text-white")}>
            {score}%
          </span>
          {isLevelComplete && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 bg-emerald-500/20 z-0" />}
        </div>
      </header>

      <div className="flex flex-col w-full max-w-6xl mx-auto flex-1 z-10">
        
        {/* Preview Viewport */}
        <div className="glass-panel flex-1 rounded-3xl border border-white/5 p-8 relative overflow-hidden bg-black/50 shadow-inner flex flex-col">
          <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <Compass className="text-pink-400" />
              <h2 className="text-xl font-bold text-white tracking-tight">Navigation Architecture</h2>
            </div>
            <button onClick={resetMenu} className="text-xs font-bold text-white/50 hover:text-white uppercase tracking-widest transition-colors">
              Reset Array
            </button>
          </div>

          <div className="flex flex-wrap gap-4 items-center justify-center flex-1 content-center">
            <AnimatePresence>
              {menuItems.map((item) => (
                <motion.button
                  key={item}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5, y: -20 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => removeItem(item)}
                  className="group px-6 py-3 rounded-full bg-white/10 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/50 text-white font-semibold flex items-center gap-2 transition-colors"
                >
                  {item}
                  <X size={16} className="text-white/30 group-hover:text-rose-400 transition-colors" />
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
          
          <AnimatePresence>
            {isLevelComplete && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mt-12">
                <button
                  onClick={handleNextLevel}
                  className="px-12 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-white font-black uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={20} /> Next Simplification
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {score < 100 && (
        <AIMentor score={score} issues={mentorFeedback.issues} suggestions={mentorFeedback.suggestions} />
      )}
    </div>
  );
}
