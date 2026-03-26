import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

type SkillCat = 'gestalt' | 'cognitive' | 'typography' | 'color' | 'interaction' | 'strategy';

interface Answer {
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

interface Question {
  id: number;
  text: string;
  category: string;
  skill: SkillCat;
  answers: Answer[];
}

const quizData: Question[] = [
  {
    id: 1,
    text: "When elements are placed close to each other, the human brain perceives them as related. What law defines this behavior?",
    category: "Gestalt Principles",
    skill: "gestalt",
    answers: [
      { text: "Law of Similarity", isCorrect: false, explanation: "Similarity groups by appearance, not physical distance." },
      { text: "Law of Proximity", isCorrect: true },
      { text: "Law of Continuity", isCorrect: false, explanation: "Continuity creates lines/paths, not groups based on closeness." },
      { text: "Law of Closure", isCorrect: false, explanation: "Closure fills in missing gaps in incomplete shapes." }
    ]
  },
  {
    id: 2,
    text: "Which principle states that the time to acquire a target is a function of the distance to and size of the target?",
    category: "Interaction Metrics",
    skill: "interaction",
    answers: [
      { text: "Fitts's Law", isCorrect: true },
      { text: "Hick's Law", isCorrect: false, explanation: "Hick's Law relates to decision time based on the number of choices." },
      { text: "Miller's Law", isCorrect: false, explanation: "Miller's Law concerns working memory capacity (7±2 items)." },
      { text: "Jakob's Law", isCorrect: false, explanation: "Jakob's Law states users prefer your site to work like others they know." }
    ]
  },
  {
    id: 3,
    text: "To reduce cognitive load in a complex form, you break it into 3 distinct steps. Which law are you actively applying to prevent overwhelm?",
    category: "Cognitive Load",
    skill: "cognitive",
    answers: [
      { text: "Tesler's Law", isCorrect: false, explanation: "Tesler's Law is about the conservation of complexity." },
      { text: "Parkinson's Law", isCorrect: false, explanation: "Parkinson's Law states work expands to fill available time." },
      { text: "Hick's Law", isCorrect: true },
      { text: "Postel's Law", isCorrect: false, explanation: "Postel's Law is about being robust in what you accept, strict in what you send." }
    ]
  },
  {
    id: 4,
    text: "When establishing visual hierarchy in typography, what is the most effective variable to change first to indicate a headline over body text?",
    category: "Typography",
    skill: "typography",
    answers: [
      { text: "Color", isCorrect: false, explanation: "Color can indicate links or status, but scale/weight define structural hierarchy best." },
      { text: "Font Family", isCorrect: false, explanation: "Mixing fonts without scale changes just creates noise." },
      { text: "Scale & Weight", isCorrect: true },
      { text: "Letter-spacing", isCorrect: false, explanation: "Tracking affects texture, not primary structural importance." }
    ]
  },
  {
    id: 5,
    text: "According to WCAG 2.1 guidelines, what is the minimum contrast ratio required for standard text (14pt) to pass AA accessibility?",
    category: "Accessibility & Color",
    skill: "color",
    answers: [
      { text: "3.0 : 1", isCorrect: false, explanation: "3:1 is only acceptable for large text (18pt+) or UI components." },
      { text: "4.5 : 1", isCorrect: true },
      { text: "7.0 : 1", isCorrect: false, explanation: "7:1 is the strictest standard for AAA, not AA." },
      { text: "2.5 : 1", isCorrect: false, explanation: "2.5:1 is deeply inaccessible for almost all users." }
    ]
  },
  {
    id: 6,
    text: "A button that looks like it can be pushed provides a visual clue to its function. What is this concept called in UX?",
    category: "Interaction Design",
    skill: "interaction",
    answers: [
      { text: "Signifier", isCorrect: false, explanation: "A signifier points to an affordance, but the property itself is an Affordance." },
      { text: "Affordance", isCorrect: true },
      { text: "Mental Model", isCorrect: false, explanation: "Mental models are internal beliefs about how a system works." },
      { text: "Skeuomorphism", isCorrect: false, explanation: "Skeuomorphism mimics real-world textures, but affordances exist without it." }
    ]
  },
  {
    id: 7,
    text: "When designing a global navigation menu, why is it recommended to group items into categories rather than listing 15 items sequentially?",
    category: "Information Architecture",
    skill: "strategy",
    answers: [
      { text: "Miller's Law (Chunking)", isCorrect: true },
      { text: "Von Restorff Effect", isCorrect: false, explanation: "This effect says items that stand out are remembered better." },
      { text: "Zeigarnik Effect", isCorrect: false, explanation: "People remember uncompleted tasks better than completed ones." },
      { text: "Aesthetic-Usability Effect", isCorrect: false, explanation: "People perceive attractive design as more usable." }
    ]
  },
  {
    id: 8,
    text: "A user expects the 'cart' icon to be in the top right corner of an e-commerce site. What drives this specific expectation?",
    category: "Mental Models",
    skill: "strategy",
    answers: [
      { text: "Brand Identity", isCorrect: false, explanation: "Brand dictates style, not structural component placement expectations." },
      { text: "Jakob's Law", isCorrect: true },
      { text: "Fitts's Law", isCorrect: false, explanation: "Fitts's Law explains how fast they can click it, not why they look there." },
      { text: "The Goal-Gradient Effect", isCorrect: false, explanation: "This states people work harder as they get closer to a goal." }
    ]
  },
  {
    id: 9,
    text: "If a user interface relies entirely on color to communicate an error state (e.g., a green vs. red dot), who are you directly excluding?",
    category: "Accessibility & Color",
    skill: "color",
    answers: [
      { text: "Users with motor impairments", isCorrect: false, explanation: "Motor impairments affect physical interaction, not visual color perception." },
      { text: "Protanopia / Deuteranopia users", isCorrect: true },
      { text: "Users with cognitive load", isCorrect: false, explanation: "Color might confuse them, but it doesn't mechanically exclude them like blindness." },
      { text: "Screen reader users only", isCorrect: false, explanation: "Screen readers miss color, but colorblind sighted users are also fully excluded." }
    ]
  },
  {
    id: 10,
    text: "Which Gestalt principle explains why we see a completed circle, even if part of the stroke is missing or dashed?",
    category: "Gestalt Principles",
    skill: "gestalt",
    answers: [
      { text: "Law of Closure", isCorrect: true },
      { text: "Law of Figure/Ground", isCorrect: false, explanation: "Figure/Ground separates subject from background." },
      { text: "Law of Common Region", isCorrect: false, explanation: "Common region puts elements inside a boundary." },
      { text: "Law of Symmetry", isCorrect: false, explanation: "Symmetry balances objects around a center point." }
    ]
  },
  {
    id: 11,
    text: "When selecting a primary typeface for a dashboard loaded with data tables, what structural feature is most critical?",
    category: "Typography",
    skill: "typography",
    answers: [
      { text: "High contrast serifs", isCorrect: false, explanation: "Serifs can clutter dense numeric data." },
      { text: "Tabular figures (monospaced numbers)", isCorrect: true },
      { text: "Tight tracking", isCorrect: false, explanation: "Tight tracking reduces legibility in dense tables." },
      { text: "Display weights", isCorrect: false, explanation: "Display weights are for massive headlines, not data." }
    ]
  },
  {
    id: 12,
    text: "Which metric accurately identifies when a user interface is presenting too much information at once, degrading decision-making quality?",
    category: "Cognitive Psychology",
    skill: "cognitive",
    answers: [
      { text: "Extraneous Cognitive Load", isCorrect: true },
      { text: "Intrinsic Cognitive Load", isCorrect: false, explanation: "Intrinsic load is the inherent difficulty of the task itself, not the UI." },
      { text: "Interaction Cost", isCorrect: false, explanation: "Interaction cost measures physical and mental effort to reach a goal." },
      { text: "Germane Cognitive Load", isCorrect: false, explanation: "Germane load is the good effort used to construct mental schemas." }
    ]
  }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  
  // Scoring per category
  const [skills, setSkills] = useState<Record<SkillCat, number>>({
    gestalt: 0, cognitive: 0, typography: 0, color: 0, interaction: 0, strategy: 0
  });

  const question = quizData[currentIndex];

  const seenCount = selectedAnswer !== null ? currentIndex + 1 : currentIndex;
  const projectedScore = score + (selectedAnswer !== null && question.answers[selectedAnswer]?.isCorrect ? 1 : 0);
  const knowledgePct = seenCount > 0 ? Math.round((projectedScore / seenCount) * 100) : 0;
  const knowledgeLevel = knowledgePct >= 80 ? 'ADVANCED' : knowledgePct >= 55 ? 'INTERMEDIATE' : 'BEGINNER';

  useEffect(() => {
    // Keyboard listener for 1/2/3/4
    const handleKeyDown = (e: KeyboardEvent) => {
       if (isTransitioning || quizFinished || selectedAnswer !== null) return;
       const key = e.key;
       if (['1','2','3','4'].includes(key)) {
          const idx = parseInt(key) - 1;
          if (question.answers[idx]) handleSelect(idx);
       }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTransitioning, quizFinished, selectedAnswer, question]);

  const handleSelect = (index: number) => {
    if (selectedAnswer !== null || isTransitioning) return;
    
    setSelectedAnswer(index);
    const answer = question.answers[index];
    
    if (answer.isCorrect) {
       setScore(prev => prev + 1);
       setSkills(prev => ({ ...prev, [question.skill]: prev[question.skill] + 1 }));
       setTimeout(() => nextQuestion(), 400);
    } else {
       setTimeout(() => nextQuestion(), 2000);
    }
  };

  const nextQuestion = () => {
     setIsTransitioning(true);
     // 350ms to wipe out, 80ms gap -> 430ms before index change
     setTimeout(() => {
         if (currentIndex < quizData.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsTransitioning(false);
         } else {
            finishQuiz();
         }
     }, 430);
  };

  const finishQuiz = () => {
    setQuizFinished(true);
    // Calculation of percentages: 
    // Gestalt: 2, Cognitive: 2, Typography: 2, Color: 2, Interaction: 2, Strategy: 2
    // We'll calculate % correctly in the results view
    
    const results = {
      score: score + (question.answers[selectedAnswer!]?.isCorrect ? 1 : 0), 
      totalQuestions: quizData.length,
      skillLevels: { ...skills },
      completedAt: new Date().toISOString()
    };
    
    // Add final answer into skills correctly if it was right
    if (question.answers[selectedAnswer!]?.isCorrect) {
       results.skillLevels[question.skill] += 1;
    }
    
    // Convert to rough percentages for dashboard
    const maxPerCat = 2; // Exact 2 per cat in this 12q set
    const processedSkills = {
      gestalt: (results.skillLevels.gestalt / maxPerCat) * 100,
      cognitive: (results.skillLevels.cognitive / maxPerCat) * 100,
      typography: (results.skillLevels.typography / maxPerCat) * 100,
      color: (results.skillLevels.color / maxPerCat) * 100,
      interaction: (results.skillLevels.interaction / maxPerCat) * 100,
      strategy: (results.skillLevels.strategy / maxPerCat) * 100,
    };
    
    const userPayload = {
      score: results.score,
      totalQuestions: results.totalQuestions,
      skillLevels: processedSkills,
      completedAt: results.completedAt
    };
    
    try {
      localStorage.setItem('gestalt_quiz_results', JSON.stringify(userPayload));
    } catch(e) {}
  };



  const variants = {
    enter: { clipPath: 'inset(0 0 0 0)', transition: { duration: 0.35, ease: 'easeOut', delay: 0.08 } },
    initial: { clipPath: 'inset(0 100% 0 0)' },
    exit: { clipPath: 'inset(0 0 0 100%)', transition: { duration: 0.35, ease: 'easeIn' } }
  };

  if (quizFinished) {
    return <ResultsScreen score={score} total={quizData.length} onEnter={() => navigate('/dashboard')} />;
  }

  // Calculate Progress
  const progressPct = ((currentIndex) / quizData.length) * 100;

  return (
    <div className="w-screen h-screen bg-[#080808] text-[#E0E0FF] relative overflow-hidden font-inter select-none">
      
      {/* Progress Line */}
      <div className="absolute top-0 left-0 h-[1px] bg-[#6366F1] transition-all duration-500 ease-out z-50" style={{ width: `${progressPct}%` }} />

      {!isTransitioning && (
      <motion.div 
        key={question.id}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={variants}
        className="absolute inset-0 w-full h-full flex"
      >
        {/* Diagnostic context */}
        <div className="absolute top-4 left-1/2 z-20 -translate-x-1/2 rounded-full border border-[#2A2A2A] bg-[#0F0F0F]/95 px-5 py-2 text-center">
          <div className="font-jetbrains text-[10px] tracking-[0.16em] text-[#6366F1]">UI/UX KNOWLEDGE DIAGNOSTIC</div>
          <div className="mt-1 text-[11px] text-white/75">This test estimates your current level. Beginner-friendly and used for personalization.</div>
        </div>

        {/* HUD */}
        <div className="absolute top-12 left-12 font-jetbrains text-[#6366F1] text-[13px] z-20">
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0 }}>
             {String(currentIndex + 1).padStart(2, '0')} / {quizData.length}
           </motion.div>
        </div>
        <div className="absolute top-12 right-12 font-jetbrains text-[#E0E0FF] text-[13px] z-20 opacity-50">
           {String(score).padStart(2, '0')} correct / {String(currentIndex).padStart(2, '0')} seen
        </div>
        <div className="absolute top-20 right-12 z-20 rounded-full border border-[#2A2A2A] bg-[#0F0F0F]/90 px-3 py-1.5 font-jetbrains text-[11px] tracking-[0.12em] text-[#A7F3D0]">
          KNOWLEDGE: {knowledgeLevel} ({knowledgePct}%)
        </div>

        {/* Left Area (55%) */}
        <div className="w-[55%] h-full flex flex-col justify-center px-24 z-10 border-r border-[#1E1E1E]">
            <motion.h1 
               initial={{ clipPath: 'inset(0 100% 0 0)' }}
               animate={{ clipPath: 'inset(0 0 0 0)' }}
               transition={{ duration: 0.6, delay: 0.08, ease: "easeOut" }}
               className="font-fraunces text-[64px] leading-[1.1] mb-12 tracking-tight text-white"
            >
               {question.text}
            </motion.h1>
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: 40 }}
               transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
               className="h-[1px] bg-[#6366F1]"
            />
        </div>

        {/* Right Area (45%) */}
        <div className="w-[45%] h-full flex flex-col justify-center bg-[#111111] z-10 px-16 relative">
            <div className="absolute top-12 left-16 flex items-center gap-3">
               <div className="w-[6px] h-[6px] bg-[#6366F1] rounded-full" />
               <span className="font-inter text-[10px] tracking-[2px] uppercase text-[#6366F1] font-bold">
                 {question.category}
               </span>
            </div>

            <div className="flex flex-col w-full max-w-xl">
               {question.answers.map((ans, idx) => {
                  const isSelected = selectedAnswer === idx;
                  const isWrong = isSelected && !ans.isCorrect;
                  const isRight = isSelected && ans.isCorrect;
                  
                  return (
                    <div key={idx} className="relative w-full">
                      <motion.button
                         initial={{ y: 20, opacity: 0 }}
                         animate={{ y: 0, opacity: 1 }}
                         transition={{ duration: 0.4, delay: 0.2 + (idx * 0.06) }}
                         onClick={() => handleSelect(idx)}
                         disabled={selectedAnswer !== null}
                         className={cn(
                           "group w-full h-[72px] flex items-center justify-between px-8 border-b border-[#1E1E1E] transition-colors duration-200 outline-none text-left",
                           selectedAnswer === null ? "hover:bg-[#6366F1] cursor-pointer" : "cursor-default",
                           isRight ? "bg-[#6366F1]" : "",
                           isWrong ? "bg-[#EF4444] animate-shake" : ""
                         )}
                         style={isWrong ? { animation: 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both' } : {}}
                      >
                         <span className={cn(
                            "font-inter text-[18px] transition-colors duration-200",
                            (isRight || isWrong) ? "text-white" : "text-[#E0E0FF] group-hover:text-white"
                         )}>
                            <span className="opacity-20 mr-4 font-jetbrains">{idx + 1}</span>
                            {ans.text}
                         </span>
                         
                         <span className="font-jetbrains text-white transition-opacity">
                            {isRight ? "A ✓" : isWrong ? "✗" : <span className="opacity-0 group-hover:opacity-100">A →</span>}
                         </span>
                      </motion.button>
                      
                      {/* Explanation Panel for wrong answers */}
                      <AnimatePresence>
                        {isWrong && ans.explanation && (
                           <motion.div 
                              initial={{ clipPath: 'inset(0 0 100% 0)', opacity: 0 }}
                              animate={{ clipPath: 'inset(0 0 0% 0)', opacity: 1 }}
                              transition={{ duration: 0.3, ease: 'easeOut' }}
                              className="w-full bg-[#EF4444]/10 border-l-2 border-[#EF4444] px-8 py-4 font-inter text-[14px] italic text-[#EF4444] mt-2 mb-4"
                           >
                              WHY IT'S WRONG: {ans.explanation}
                           </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
               })}
            </div>
            
            <style>{`
              @keyframes shake {
                10%, 90% { transform: translate3d(-1px, 0, 0); }
                20%, 80% { transform: translate3d(2px, 0, 0); }
                30%, 50%, 70% { transform: translate3d(-8px, 0, 0); }
                40%, 60% { transform: translate3d(8px, 0, 0); }
              }
            `}</style>
        </div>
      </motion.div>
      )}
    </div>
  );
}

// =============================================
// RESULTS SCREEN COMPONENT
// =============================================
function ResultsScreen({ score, total, onEnter }: { score: number, total: number, onEnter: () => void }) {
  const [displayScore, setDisplayScore] = useState(0);
  const [showSkills, setShowSkills] = useState(false);
  const [wipeActive, setWipeActive] = useState(false);
  
  // Read exactly what we saved
  const savedStr = localStorage.getItem('gestalt_quiz_results');
  const savedData = savedStr ? JSON.parse(savedStr) : null;
  const skills = savedData ? savedData.skillLevels : { gestalt: 0, cognitive: 0, typography: 0, color: 0, interaction: 0, strategy: 0 };

  useEffect(() => {
    // Count up animation
    let start = 0;
    const interval = setInterval(() => {
       start += 1;
       if (start >= score) {
          setDisplayScore(score);
          clearInterval(interval);
          setTimeout(() => setShowSkills(true), 1500);
       } else {
          setDisplayScore(start);
       }
    }, 70);
    if (score === 0) {
       clearInterval(interval);
       setTimeout(() => setShowSkills(true), 1500);
    }
    return () => clearInterval(interval);
  }, [score]);

  const handleBegin = () => {
    setWipeActive(true);
    setTimeout(onEnter, 400);
  };

  return (
    <div className="w-screen h-screen bg-[#080808] text-[#E0E0FF] relative flex flex-col items-center justify-center font-inter select-none">
       {/* Full page wipe */}
       <motion.div 
         initial={{ x: '-100%' }}
         animate={wipeActive ? { x: 0 } : { x: '-100%' }}
         transition={{ duration: 0.4, ease: "easeIn" }}
         className="fixed inset-0 bg-[#6366F1] z-[1000] pointer-events-none"
       />

       <div className="flex flex-col items-center z-10 relative mt-[-10vh]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-fraunces text-[200px] leading-none text-white tracking-tighter">
             {String(displayScore).padStart(2, '0')}
          </motion.div>
          <div className="font-jetbrains text-[16px] text-[#6366F1] tracking-widest uppercase mt-4">
             {total} / {total} AVAILABLE POINT POOL
          </div>
       </div>

       <div className="h-[300px] w-full max-w-2xl mt-16 relative">
          <AnimatePresence>
            {showSkills && (
               <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full flex flex-col items-center gap-6"
               >
                  <div className="font-inter text-[12px] uppercase tracking-[4px] text-white/40 mb-4 border-b border-white/10 pb-4 w-full text-center">
                    Skill Profiling Complete
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-16 gap-y-6 w-full px-8">
                     {(Object.entries(skills) as [string, number][]).map(([key, val], i) => (
                        <div key={key} className="w-full">
                           <div className="flex justify-between w-full mb-2">
                             <span className="text-[11px] font-bold uppercase tracking-widest text-white/80">{key}</span>
                             <span className="text-[11px] font-jetbrains text-[#6366F1]">{val}%</span>
                           </div>
                           <div className="w-full h-1 bg-[#1A1A1A] overflow-hidden">
                              <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${val}%` }}
                                 transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                                 className="h-full bg-[#6366F1]"
                              />
                           </div>
                        </div>
                     ))}
                  </div>

                  <motion.button 
                     initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                     onClick={handleBegin}
                     className="mt-16 bg-[#6366F1] hover:bg-white hover:text-black text-white px-12 py-4 font-inter text-sm uppercase tracking-[4px] font-black transition-colors duration-300"
                  >
                     ENTER YOUR DASHBOARD
                  </motion.button>
               </motion.div>
            )}
          </AnimatePresence>
       </div>
    </div>
  );
}
