import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Settings2, Paintbrush, BoxSelect, Sparkles, Send, Lightbulb, Eye } from 'lucide-react';
import { PerceptionEngine, UIElementProps, EvaluationResult } from '../engine/PerceptionEngine';
import { GamificationSystem } from '../engine/GamificationSystem';
import { AIMentor } from '../components/ui/AIMentor';

type ElementType = 'label' | 'input' | 'button';

type FilterType = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'grayscale';

const defaultProps: Record<ElementType, UIElementProps> = {
  label: { fontSize: 12, padding: 0, borderRadius: 0, background: 'transparent', color: '#9ca3af', borderWidth: 0, text: 'name' },
  input: { fontSize: 14, padding: 6, borderRadius: 4, background: '#1f2937', color: '#ffffff', borderWidth: 1, text: '' },
  button: { fontSize: 14, padding: 8, borderRadius: 4, background: '#374151', color: '#9ca3af', borderWidth: 0, text: 'submit' }
};

export default function Challenge() {
  const navigate = useNavigate();
  const [selectedElement, setSelectedElement] = useState<ElementType | null>(null);
  const [props, setProps] = useState(defaultProps);
  const [cluesUsed, setCluesUsed] = useState(0);
  const [showClue, setShowClue] = useState<string | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [visionFilter, setVisionFilter] = useState<FilterType>('none');
  const [engineResult, setEngineResult] = useState<EvaluationResult | null>(null);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setTimeElapsed(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Run Real-time Engine Evaluation
  useEffect(() => {
    // Evaluate distinct parts
    const btnEval = PerceptionEngine.evaluateButton(props.button);
    const hierEval = PerceptionEngine.evaluateHierarchy(props.label, props.input, props.button);
    
    // Merge scores and issues
    let finalScore = (btnEval.score + hierEval.hierarchyScore) / 2;
    finalScore -= (cluesUsed * 5); // Clue penalty
    
    const issues = [...btnEval.issues, ...hierEval.issues];
    const suggestions = [...btnEval.suggestions, ...hierEval.suggestions];

    setEngineResult({
      score: Math.max(0, Math.min(100, Math.round(finalScore))),
      issues,
      suggestions,
      metrics: btnEval.metrics
    });
  }, [props, cluesUsed]);

  const handlePropChange = (key: keyof UIElementProps, value: any) => {
    if (!selectedElement) return;
    setProps(p => ({
      ...p,
      [selectedElement]: { ...p[selectedElement], [key]: value }
    }));
  };

  const handleClue = () => {
    if (cluesUsed >= 3) return;
    const clues = [
      "The button is the primary action. Evaluate its WCAG contrast and ensure it uses an action-oriented label.",
      "Inputs need larger padding (try 12-16px) to meet Apple's 44x44 pt minimum touch target guidelines.",
      "Labels must guide the eye: capitalize them and boost brightness for visual hierarchy."
    ];
    setShowClue(clues[cluesUsed]);
    setCluesUsed(c => c + 1);
    setTimeout(() => setShowClue(null), 8000);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    
    if (!engineResult) return;
    const score = engineResult.score;
    const rank = GamificationSystem.calculateRank(score, timeElapsed);
    const xpGained = GamificationSystem.calculateXPReward(score, rank, timeElapsed);

    const results = {
      score,
      timeElapsed,
      rank,
      xpGained,
      cognitiveLoadReduction: score * 0.8, // Derived simulated stat
      constraintImprovement: score * 0.9,
      metrics: engineResult.metrics
    };
    
    // Save to challenge results temp storage
    localStorage.setItem('gestalt_results', JSON.stringify(results));
    
    // Check for badges
    try {
      const rawUser = localStorage.getItem('gestalt_user');
      const user = rawUser ? JSON.parse(rawUser) : { badges: [] };
      const newBadges = GamificationSystem.evaluateBadges(user, results);
      
      // Store newly earned badges globally temporary
      localStorage.setItem('gestalt_new_badges', JSON.stringify(newBadges));
    } catch(e) {}

    setTimeout(() => {
      navigate('/results');
    }, 2000);
  };

  const minutes = Math.floor(timeElapsed / 60);
  const seconds = timeElapsed % 60;

  return (
    <div className="min-h-[100dvh] w-full flex flex-col pt-24 px-6 sm:px-12 relative overflow-hidden">
      
      {/* SVG Filters for Color Blindness Simulation */}
      <svg width="0" height="0" className="absolute pointer-events-none">
        <filter id="protanopia">
          <feColorMatrix type="matrix" values="0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0" />
        </filter>
        <filter id="deuteranopia">
          <feColorMatrix type="matrix" values="0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0" />
        </filter>
        <filter id="tritanopia">
          <feColorMatrix type="matrix" values="0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0" />
        </filter>
        <filter id="grayscale">
          <feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0" />
        </filter>
      </svg>

      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 blur-[200px] rounded-full pointer-events-none -z-10" />
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 w-full max-w-[1400px] mx-auto">
        <div>
          <div className="inline-block glass-panel px-3 py-1 rounded-full mb-3 shadow-inner border border-white/5">
            <span className="text-xs font-bold tracking-widest text-[#f59e0b] uppercase">Intermediate Module</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
            Fix the Registration Form
          </h1>
          <p className="text-white/60 text-lg mt-2 font-medium">Use the AI mentor to guide your decisions. Build for all users.</p>
        </div>

        <div className="flex gap-4">
          
          {/* Vision Simulator Toggle */}
          <div className="glass-panel px-4 py-2 rounded-2xl flex flex-col justify-center border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Eye size={14} className="text-blue-400" />
              <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Vision Simulator</span>
            </div>
            <select 
              value={visionFilter}
              onChange={(e) => setVisionFilter(e.target.value as FilterType)}
              className="bg-black/50 text-white text-xs border border-white/10 rounded px-2 py-1 outline-none focus:border-primary w-32 cursor-pointer"
            >
              <option value="none">Normal Vision</option>
              <option value="protanopia">Protanopia (Red-Blind)</option>
              <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
              <option value="tritanopia">Tritanopia (Blue-Blind)</option>
              <option value="grayscale">Achromatopsia (Grayscale)</option>
            </select>
          </div>

          <div className="glass-panel px-6 py-3 rounded-2xl flex flex-col items-center justify-center">
            <span className="text-xs text-white/50 uppercase font-bold tracking-wider mb-1">Time Elapsed</span>
            <span className="text-2xl font-mono text-white font-black">{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
          </div>
          
          <button 
            onClick={handleClue}
            disabled={cluesUsed >= 3}
            className="glass-card hover:bg-white/10 px-6 py-3 rounded-2xl flex flex-col items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed group border border-white/5 outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            <Lightbulb className={cn("mb-1 transition-all", cluesUsed < 3 ? "text-amber-400 group-hover:scale-110" : "text-white/30")} size={20} />
            <span className="text-xs text-white/70 font-bold">{3 - cluesUsed} Hints Left</span>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {showClue && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-28 left-1/2 -translate-x-1/2 z-[100] glass-card border-amber-500/50 bg-amber-500/10 backdrop-blur-3xl px-6 py-4 rounded-2xl shadow-[0_20px_60px_rgba(245,158,11,0.2)] flex items-center gap-4 max-w-lg"
          >
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex flex-shrink-0 items-center justify-center text-amber-400">
              <Lightbulb size={20} />
            </div>
            <p className="text-white break-words text-sm font-medium leading-relaxed">{showClue}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-[1400px] mx-auto flex-1 pb-12">
        
        {/* Playground Canvas with Vision Filter Applied */}
        <div className="glass-panel flex-1 rounded-3xl p-8 flex items-center justify-center relative min-h-[500px] border border-white/10 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
          
          <div className="absolute top-6 left-6 flex items-center gap-2 z-10">
            <BoxSelect size={16} className="text-primary" />
            <span className="text-xs uppercase tracking-widest font-bold text-white/50">Live Canvas</span>
          </div>

          <div 
            className="w-[80%] max-w-[400px] flex flex-col bg-white/5 p-12 rounded-3xl border border-white/10 shadow-2xl relative"
            style={{ filter: visionFilter !== 'none' ? `url(#${visionFilter})` : 'none', transition: 'filter 0.5s ease' }}
          >
            {visionFilter !== 'none' && (
              <div className="absolute -top-4 -right-4 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                Simulation Active
              </div>
            )}
            
            <motion.div 
              onClick={() => setSelectedElement('label')}
              style={{
                fontSize: props.label.fontSize,
                padding: props.label.padding,
                color: props.label.color,
                marginBottom: 8
              }}
              className={cn(
                "cursor-pointer transition-shadow rounded font-sans leading-none w-fit",
                selectedElement === 'label' ? "ring-2 ring-primary ring-offset-4 ring-offset-[#111116]" : "hover:ring-1 hover:ring-white/30 hover:ring-offset-2 hover:ring-offset-[#111116]"
              )}
            >
              {props.label.text}
            </motion.div>

            <motion.input 
              readOnly
              onClick={() => setSelectedElement('input')}
              placeholder="user@example.com"
              style={{
                fontSize: props.input.fontSize,
                padding: props.input.padding,
                color: props.input.color,
                background: props.input.background,
                borderRadius: props.input.borderRadius,
                borderWidth: props.input.borderWidth,
                borderColor: 'rgba(255,255,255,0.2)',
                marginBottom: 24,
                width: '100%',
                outline: 'none'
              }}
              className={cn(
                "cursor-pointer transition-shadow font-sans",
                selectedElement === 'input' ? "ring-2 ring-primary ring-offset-4 ring-offset-[#111116]" : "hover:ring-1 hover:ring-white/30 hover:ring-offset-2 hover:ring-offset-[#111116]"
              )}
            />

            <motion.button 
              onClick={() => setSelectedElement('button')}
              style={{
                fontSize: props.button.fontSize,
                padding: props.button.padding,
                color: props.button.color,
                background: props.button.background,
                borderRadius: props.button.borderRadius,
                borderWidth: props.button.borderWidth,
                width: '100%',
                fontWeight: 600
              }}
              className={cn(
                "cursor-pointer transition-shadow font-sans text-center relative",
                selectedElement === 'button' ? "ring-2 ring-primary ring-offset-4 ring-offset-[#111116] shadow-[0_0_30px_rgba(109,40,217,0.3)]" : "hover:ring-1 hover:ring-white/30 hover:ring-offset-2 hover:ring-offset-[#111116]"
              )}
            >
              {props.button.text}
              
              {/* Overlay hit-box outline visualization if target is too small */}
              {engineResult?.metrics?.fittsLawTarget && engineResult.metrics.fittsLawTarget < 44 && (
                <div className="absolute inset-0 border border-rose-500/50 scale-110 pointer-events-none border-dashed rounded opacity-50 flex items-center justify-end pr-2">
                   <span className="text-[10px] text-rose-500 font-mono -translate-y-4 translate-x-12 whitespace-nowrap bg-black/80 px-1 py-0.5 rounded">&lt;44px Hitbox</span>
                </div>
              )}
            </motion.button>
          </div>
        </div>

        {/* Dynamic Property Editor Sidebar */}
        <div className="w-full lg:w-[420px] flex flex-col gap-6">
          <div className="glass-card flex-1 rounded-3xl p-6 shadow-2xl relative overflow-hidden bg-black/40 backdrop-blur-2xl border-white/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none z-0" />
            
            <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4 relative z-10">
              <Settings2 className="text-white/60" />
              <h2 className="text-xl font-bold text-white tracking-tight">Inspector Grid</h2>
            </div>
            
            {selectedElement ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                key={selectedElement}
                className="space-y-6 relative z-10"
              >
                <div className="inline-block px-3 py-1 bg-white/5 rounded-full border border-white/10 mb-2 shadow-inner">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">Targeting: {selectedElement}</span>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">
                      Content String
                    </label>
                    <input 
                      type="text" 
                      value={props[selectedElement].text}
                      onChange={(e) => handlePropChange('text', e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/80 transition-all font-mono"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 flex items-center justify-between">
                      Typography Scale 
                      <span className="text-white/90 font-mono bg-white/10 px-1.5 py-0.5 rounded">{props[selectedElement].fontSize}px</span>
                    </label>
                    <input 
                      type="range" min="10" max="32" 
                      value={props[selectedElement].fontSize}
                      onChange={(e) => handlePropChange('fontSize', parseInt(e.target.value))}
                      className="w-full h-1.5 bg-white/10 rounded-md appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  {selectedElement !== 'label' && (
                    <>
                      <div>
                        <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 flex items-center justify-between">
                          Internal Padding (Fitts' Law)
                          <span className="text-white/90 font-mono bg-white/10 px-1.5 py-0.5 rounded">{props[selectedElement].padding}px</span>
                        </label>
                        <input 
                          type="range" min="4" max="32" 
                          value={props[selectedElement].padding}
                          onChange={(e) => handlePropChange('padding', parseInt(e.target.value))}
                          className="w-full h-1.5 bg-white/10 rounded-md appearance-none cursor-pointer accent-primary"
                        />
                      </div>
                      
                      <div>
                        <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 flex items-center justify-between">
                          Border Radius
                          <span className="text-white/90 font-mono bg-white/10 px-1.5 py-0.5 rounded">{props[selectedElement].borderRadius}px</span>
                        </label>
                        <input 
                          type="range" min="0" max="24" 
                          value={props[selectedElement].borderRadius}
                          onChange={(e) => handlePropChange('borderRadius', parseInt(e.target.value))}
                          className="w-full h-1.5 bg-white/10 rounded-md appearance-none cursor-pointer accent-primary"
                        />
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    {selectedElement !== 'label' && (
                      <div>
                        <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2 block">Fill Color</label>
                        <div className="flex bg-black/60 rounded-lg overflow-hidden border border-white/10 h-10">
                          <input 
                            type="color" 
                            value={props[selectedElement].background}
                            onChange={(e) => handlePropChange('background', e.target.value)}
                            className="w-10 h-10 p-0 border-0 outline-none cursor-pointer bg-transparent"
                          />
                          <input 
                            type="text" 
                            value={props[selectedElement].background}
                            onChange={(e) => handlePropChange('background', e.target.value)}
                            className="w-full bg-transparent px-2 text-xs text-white/80 font-mono outline-none uppercase"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider mb-2 block">Text Color</label>
                      <div className="flex bg-black/60 rounded-lg overflow-hidden border border-white/10 h-10">
                        <input 
                          type="color" 
                          value={props[selectedElement].color}
                          onChange={(e) => handlePropChange('color', e.target.value)}
                          className="w-10 h-10 p-0 border-0 outline-none cursor-pointer bg-transparent"
                        />
                        <input 
                          type="text" 
                          value={props[selectedElement].color}
                          onChange={(e) => handlePropChange('color', e.target.value)}
                          className="w-full bg-transparent px-2 text-xs text-white/80 font-mono outline-none uppercase"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-center px-6 relative z-10">
                <Paintbrush className="text-white/10 mb-5" size={56} />
                <p className="text-white/40 text-sm font-medium leading-relaxed">Select any interface node in the Canvas Simulator to access its architecture matrix.</p>
              </div>
            )}
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-white font-black uppercase tracking-widest shadow-[0_15px_30px_rgba(16,185,129,0.3)] hover:shadow-[0_20px_40px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-3 relative overflow-hidden group border border-emerald-400/50"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            <span className="relative z-10 flex items-center gap-2">
              {isSubmitting ? (
                <>Simulating UX Flow <Sparkles className="animate-pulse" size={18} /></>
              ) : (
                <>Compile Architecture <Send size={18} /></>
              )}
            </span>
          </motion.button>
        </div>

      </div>

      {/* Render the AI Mentor Component overlay linked to the live evaluation array */}
      {engineResult && (
        <AIMentor 
           score={engineResult.score} 
           issues={engineResult.issues} 
           suggestions={engineResult.suggestions} 
           metrics={engineResult.metrics} 
        />
      )}
      
    </div>
  );
}
