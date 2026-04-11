import React, { createContext, useContext, useState } from 'react';

interface LearningContextType {
  activeModuleId: string | null;
  currentLevel: number;
  maxLevel: number;
  metrics: {
    mistakes: number;
    timeSpentMs: number;
    isStuck: boolean;
  };
  phase: 'BEFORE' | 'DURING' | 'AFTER';
  
  // Actions
  initializeModule: (id: string, maxLevels: number) => void;
  advanceLevel: () => void;
  recordMistake: () => void;
  setPhase: (phase: 'BEFORE' | 'DURING' | 'AFTER') => void;
  triggerAI: (hintType: 'nudge' | 'solution') => void;
  
  // AI State
  aiEvent: { timestamp: number; type: 'nudge' | 'solution'; hintLevel: number } | null;
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

export const LearningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [maxLevel, setMaxLevel] = useState(3);
  const [metrics, setMetrics] = useState({ mistakes: 0, timeSpentMs: 0, isStuck: false });
  const [phase, setPhase] = useState<'BEFORE' | 'DURING' | 'AFTER'>('BEFORE');
  const [aiEvent, setAiEvent] = useState<LearningContextType['aiEvent']>(null);

  const initializeModule = (id: string, levels: number) => {
    setActiveModuleId(id);
    setCurrentLevel(1);
    setMaxLevel(levels);
    setMetrics({ mistakes: 0, timeSpentMs: 0, isStuck: false });
    setPhase('BEFORE');
    setAiEvent(null);
  };

  const advanceLevel = () => {
    if (currentLevel < maxLevel) {
      setCurrentLevel(l => l + 1);
      setMetrics({ mistakes: 0, timeSpentMs: 0, isStuck: false }); // Reset metrics per level
    } else {
      setPhase('AFTER'); // Trigger Outro
    }
  };

  const recordMistake = () => {
    setMetrics(prev => {
      const newMistakes = prev.mistakes + 1;
      if (newMistakes >= 3) {
        // Automatically spawn AI mentor if they fail repeatedly
        setAiEvent({ timestamp: Date.now(), type: 'nudge', hintLevel: currentLevel });
        return { ...prev, mistakes: newMistakes, isStuck: true };
      }
      return { ...prev, mistakes: newMistakes };
    });
  };

  const triggerAI = (type: 'nudge' | 'solution') => {
    setAiEvent({ timestamp: Date.now(), type, hintLevel: currentLevel });
  };

  return (
    <LearningContext.Provider value={{
      activeModuleId, currentLevel, maxLevel, metrics, phase,
      initializeModule, advanceLevel, recordMistake, setPhase, triggerAI, aiEvent
    }}>
      {children}
    </LearningContext.Provider>
  );
};

export const useLearning = () => {
  const context = useContext(LearningContext);
  if (!context) throw new Error("useLearning must be used within a LearningProvider");
  return context;
};
