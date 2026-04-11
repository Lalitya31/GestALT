import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Send, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const hintsByPath: Record<string, string[]> = {
  '/whitespace-sim': ['Group related elements with tighter spacing.', 'Keep unrelated controls visually separated.'],
  '/similarity': ['Use consistent styles for items with the same meaning.', 'Avoid random color or shape shifts.'],
  '/closure-puzzle': ['Reveal only enough structure for recognition.', 'Let the user complete patterns mentally.'],
  '/figure-ground': ['Increase contrast between primary and background layers.', 'Reduce competing visual noise.'],
  '/continuity': ['Keep flow left-to-right and top-to-bottom.', 'Avoid abrupt directional breaks.'],
  '/hicks-law': ['Reduce visible choices before selection.', 'Use progressive disclosure for complex options.'],
  '/cognitive-load': ['Remove non-essential UI first.', 'Chunk information into meaningful groups.'],
  '/visual-hierarchy': ['Prioritize one clear focal point.', 'Use size and contrast intentionally.'],
  '/semantic-color': ['Keep semantic color meanings consistent.', 'Reserve danger colors for destructive actions.'],
  '/accessibility': ['Check contrast first.', 'Avoid color-only meaning.'],
  '/grid-master': ['Align elements to a stable rhythm.', 'Respect spacing and baseline consistency.'],
  '/typo-scale': ['Use clear heading-to-body scale ratios.', 'Ensure readable line height and spacing.'],
  '/contrast-mixer': ['Aim for WCAG-safe contrast.', 'Balance visual weight without eye strain.'],
  '/mega-menu': ['Group choices by user intent.', 'Reduce scanning effort with hierarchy.'],
  '/mobile-tab': ['Make touch targets easy to hit.', 'Place primary actions in natural thumb zones.'],
  '/flexbox-sandbox': ['Use layout rules consistently.', 'Avoid brittle fixed sizing patterns.'],
  '/button-logic': ['Give immediate feedback on interaction.', 'Communicate disabled/loading states clearly.'],
  '/responsive-design': ['Test extremes: very narrow and very wide.', 'Use fluid sizing before hard breakpoints.'],
  '/z-index-layering': ['Keep depth hierarchy predictable.', 'Use overlays only when necessary.'],
  '/final-boss': ['Start with structure, then hierarchy, then polish.', 'Optimize for clarity before decoration.']
};

export default function VERAOverlay() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);

  const hints = useMemo(() => {
    return hintsByPath[location.pathname] ?? ['Focus on clarity, hierarchy, and user confidence.'];
  }, [location.pathname]);

  const currentHint = hints[hintIndex % hints.length];

  return (
    <div className="vera-container">
      <AnimatePresence>
        {open && (
          <motion.div
            className="vera-panel rounded-2xl border border-[#2f4b45] bg-[#0a1312] shadow-[0_18px_40px_rgba(0,0,0,0.55)]"
            initial={{ clipPath: 'inset(100% 0 0 0)' }}
            animate={{ clipPath: 'inset(0 0 0 0)' }}
            exit={{ clipPath: 'inset(100% 0 0 0)' }}
            transition={{ duration: open ? 0.3 : 0.2, ease: open ? 'easeOut' : 'easeIn' }}
          >
            <div className="vera-header">
              <div className="vera-header-main">
                <svg className="vera-robot" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" width="48" height="48" style={{ transform: 'rotate(-12deg)', flexShrink: 0 }}>
                  <line x1="24" y1="2" x2="24" y2="8" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="24" cy="2" r="2" fill="#6366F1"/>
                  <rect x="14" y="8" width="20" height="14" rx="3" fill="#1A1A1A" stroke="#6366F1" strokeWidth="1.2"/>
                  <circle cx="20" cy="14" r="2.5" fill="#6366F1"/>
                  <circle cx="28" cy="14" r="2.5" fill="#6366F1"/>
                  <circle cx="21" cy="13" r="0.8" fill="#E0E0FF"/>
                  <circle cx="29" cy="13" r="0.8" fill="#E0E0FF"/>
                  <rect x="19" y="18" width="10" height="2" rx="1" fill="#6366F1" opacity="0.6"/>
                  <rect x="21" y="22" width="6" height="3" rx="1" fill="#1A1A1A" stroke="#2A2A2A" strokeWidth="1"/>
                  <rect x="12" y="25" width="24" height="16" rx="3" fill="#1A1A1A" stroke="#6366F1" strokeWidth="1.2"/>
                  <circle cx="24" cy="31" r="3" fill="#6366F1" opacity="0.9"/>
                  <circle cx="24" cy="31" r="1.5" fill="#E0E0FF"/>
                  <rect x="15" y="36" width="5" height="2" rx="1" fill="#2A2A2A" stroke="#6366F1" strokeWidth="0.8"/>
                  <rect x="28" y="36" width="5" height="2" rx="1" fill="#2A2A2A" stroke="#6366F1" strokeWidth="0.8"/>
                  <rect x="5" y="26" width="6" height="12" rx="3" fill="#1A1A1A" stroke="#6366F1" strokeWidth="1"/>
                  <circle cx="8" cy="40" r="2.5" fill="#1A1A1A" stroke="#6366F1" strokeWidth="1"/>
                  <rect x="37" y="26" width="6" height="12" rx="3" fill="#1A1A1A" stroke="#6366F1" strokeWidth="1"/>
                  <circle cx="40" cy="40" r="2.5" fill="#1A1A1A" stroke="#6366F1" strokeWidth="1"/>
                  <rect x="16" y="41" width="6" height="6" rx="2" fill="#1A1A1A" stroke="#6366F1" strokeWidth="1"/>
                  <rect x="26" y="41" width="6" height="6" rx="2" fill="#1A1A1A" stroke="#6366F1" strokeWidth="1"/>
                </svg>
                <div className="vera-title-wrap">
                  <div className="vera-title">VERA</div>
                  <div className="vera-subtitle">Visual Experience Research Assistant</div>
                </div>
              </div>
              <button aria-label="Close VERA" onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <motion.div
              className="h-[1px] bg-[#6366F1]"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />

            <div className="px-4 py-3">
              <p className="text-[13px] leading-relaxed text-white/85">{currentHint}</p>
            </div>

            <div className="flex items-center justify-between border-t border-[#223835] px-3 py-2">
              <button
                onClick={() => setHintIndex((prev) => (prev + 1) % hints.length)}
                className="rounded-lg border border-[#35584f] bg-[#0e1f1d] px-3 py-1.5 text-[11px] font-jetbrains text-[#86f6d8]"
              >
                NEXT HINT
              </button>
              <button
                onClick={() => setOpen(false)}
                className="flex items-center gap-1 rounded-lg border border-[#35584f] bg-[#0e1f1d] px-3 py-1.5 text-[11px] font-jetbrains text-[#86f6d8]"
              >
                DONE <Send size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        aria-label={open ? 'Close VERA' : 'Open VERA'}
        onClick={() => setOpen((prev) => !prev)}
        className="vera-orb flex items-center justify-center rounded-full border border-[#2c4a43] bg-[#0f1918] text-[#74f7d5] shadow-[0_8px_24px_rgba(0,0,0,0.45)] transition-transform hover:scale-105"
      >
        <Bot size={20} />
      </button>
    </div>
  );
}
