import { useEffect, useRef } from 'react';
import { useLearning } from '../engine/LearningContext';

/**
 * useAntiFrustration
 * Automatically tracks user activity and triggers the AI Mentor if the user
 * stops interacting for too long or if manually invoked via mistakes.
 */
export function useAntiFrustration(timeToStuckMs: number = 10000) {
  const { phase, triggerAI } = useLearning();
  const lastActive = useRef(Date.now());

  useEffect(() => {
    if (phase !== 'DURING') return;

    const resetTimer = () => {
      lastActive.current = Date.now();
    };

    // Track mouse and keyboard events to detect "thinking/active" vs "completely stuck"
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('touchstart', resetTimer);

    const interval = setInterval(() => {
      if (Date.now() - lastActive.current > timeToStuckMs) {
        // User has been idle for 10 seconds. Spawn AI Mentor to help.
        triggerAI('nudge');
        lastActive.current = Date.now(); // Reset to prevent spamming
      }
    }, 2000);

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
      clearInterval(interval);
    };
  }, [phase, timeToStuckMs]);
}
