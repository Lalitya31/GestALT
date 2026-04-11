import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface Layer {
  id: string;
  name: string;
  color: string;
  borderColor: string;
  correctZ: number;
  currentZ: number;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  layers: Layer[];
}

const challenges: Challenge[] = [
  {
    id: 1,
    title: 'Basic Modal Stack',
    description: 'A modal should always appear above the background. Set correct z-index values.',
    layers: [
      { id: 'bg', name: 'BG', color: '#1a1f3a', borderColor: '#2a3060', correctZ: 1, currentZ: 10 },
      { id: 'modal', name: 'CORE MODAL', color: 'rgba(99,66,241,0.8)', borderColor: '#8b5cf6', correctZ: 10, currentZ: 5 },
    ],
  },
  {
    id: 2,
    title: 'Tooltip Depth',
    description: 'Tooltips must float above all content including modals.',
    layers: [
      { id: 'bg', name: 'PAGE', color: '#1a1f3a', borderColor: '#2a3060', correctZ: 1, currentZ: 1 },
      { id: 'modal', name: 'MODAL', color: 'rgba(99,66,241,0.7)', borderColor: '#8b5cf6', correctZ: 10, currentZ: 10 },
      { id: 'tooltip', name: 'TOOLTIP', color: 'rgba(79,209,197,0.8)', borderColor: '#4fd1c5', correctZ: 50, currentZ: 5 },
    ],
  },
  {
    id: 3,
    title: 'Navigation Layer',
    description: 'Sticky nav must stay above content but below modals.',
    layers: [
      { id: 'bg', name: 'CONTENT', color: '#1a1f3a', borderColor: '#2a3060', correctZ: 1, currentZ: 1 },
      { id: 'nav', name: 'STICKY NAV', color: 'rgba(59,130,246,0.8)', borderColor: '#3b82f6', correctZ: 100, currentZ: 50 },
      { id: 'modal', name: 'MODAL', color: 'rgba(99,66,241,0.7)', borderColor: '#8b5cf6', correctZ: 200, currentZ: 100 },
    ],
  },
  {
    id: 4,
    title: 'Dropdown Trap',
    description: 'Dropdown menus are often trapped behind other elements. Fix the stack.',
    layers: [
      { id: 'bg', name: 'PAGE BG', color: '#1a1f3a', borderColor: '#2a3060', correctZ: 0, currentZ: 5 },
      { id: 'card', name: 'CARD', color: 'rgba(30,41,59,0.9)', borderColor: '#475569', correctZ: 1, currentZ: 1 },
      { id: 'dropdown', name: 'DROPDOWN', color: 'rgba(245,158,11,0.8)', borderColor: '#f59e0b', correctZ: 10, currentZ: 0 },
    ],
  },
  {
    id: 5,
    title: 'Toast Notification',
    description: 'Toasts must appear above everything - even modals.',
    layers: [
      { id: 'bg', name: 'PAGE', color: '#1a1f3a', borderColor: '#2a3060', correctZ: 1, currentZ: 1 },
      { id: 'modal', name: 'MODAL', color: 'rgba(99,66,241,0.7)', borderColor: '#8b5cf6', correctZ: 100, currentZ: 100 },
      { id: 'overlay', name: 'OVERLAY', color: 'rgba(0,0,0,0.5)', borderColor: '#374151', correctZ: 99, currentZ: 200 },
      { id: 'toast', name: 'TOAST', color: 'rgba(74,222,128,0.9)', borderColor: '#4ade80', correctZ: 9999, currentZ: 50 },
    ],
  },
  {
    id: 6,
    title: 'Popover Stack',
    description: 'Popover must sit above its trigger card.',
    layers: [
      { id: 'bg', name: 'BACKGROUND', color: '#1a1f3a', borderColor: '#2a3060', correctZ: 0, currentZ: 0 },
      { id: 'card', name: 'TRIGGER CARD', color: 'rgba(30,41,59,0.9)', borderColor: '#475569', correctZ: 1, currentZ: 10 },
      { id: 'popover', name: 'POPOVER', color: 'rgba(239,68,68,0.8)', borderColor: '#ef4444', correctZ: 50, currentZ: 1 },
    ],
  },
  {
    id: 7,
    title: 'Sticky Header + Sidebar',
    description: 'Both nav and sidebar must layer correctly.',
    layers: [
      { id: 'bg', name: 'CONTENT', color: '#1a1f3a', borderColor: '#2a3060', correctZ: 0, currentZ: 0 },
      { id: 'sidebar', name: 'SIDEBAR', color: 'rgba(59,130,246,0.7)', borderColor: '#3b82f6', correctZ: 10, currentZ: 20 },
      { id: 'header', name: 'HEADER', color: 'rgba(99,66,241,0.7)', borderColor: '#8b5cf6', correctZ: 20, currentZ: 10 },
    ],
  },
  {
    id: 8,
    title: 'Loading Overlay',
    description: 'Loading screen must cover everything.',
    layers: [
      { id: 'bg', name: 'APP', color: '#1a1f3a', borderColor: '#2a3060', correctZ: 1, currentZ: 1 },
      { id: 'modal', name: 'MODAL', color: 'rgba(99,66,241,0.7)', borderColor: '#8b5cf6', correctZ: 100, currentZ: 100 },
      { id: 'loader', name: 'LOADER', color: 'rgba(15,15,25,0.95)', borderColor: '#6366f1', correctZ: 9000, currentZ: 5 },
    ],
  },
  {
    id: 9,
    title: 'Context Menu',
    description: 'Right-click context menu must float above all content.',
    layers: [
      { id: 'bg', name: 'PAGE', color: '#1a1f3a', borderColor: '#2a3060', correctZ: 0, currentZ: 0 },
      { id: 'card', name: 'CONTENT CARD', color: 'rgba(30,41,59,0.9)', borderColor: '#475569', correctZ: 1, currentZ: 5 },
      { id: 'nav', name: 'STICKY NAV', color: 'rgba(59,130,246,0.7)', borderColor: '#3b82f6', correctZ: 100, currentZ: 100 },
      { id: 'ctx', name: 'CONTEXT MENU', color: 'rgba(245,158,11,0.9)', borderColor: '#f59e0b', correctZ: 999, currentZ: 2 },
    ],
  },
  {
    id: 10,
    title: 'Full Stack Chaos',
    description: 'All layers are wrong. Fix the entire z-index stack.',
    layers: [
      { id: 'bg', name: 'BACKGROUND', color: '#1a1f3a', borderColor: '#2a3060', correctZ: 0, currentZ: 500 },
      { id: 'content', name: 'CONTENT', color: 'rgba(30,41,59,0.9)', borderColor: '#475569', correctZ: 1, currentZ: 0 },
      { id: 'nav', name: 'NAV', color: 'rgba(59,130,246,0.7)', borderColor: '#3b82f6', correctZ: 100, currentZ: 1 },
      { id: 'modal', name: 'MODAL', color: 'rgba(99,66,241,0.7)', borderColor: '#8b5cf6', correctZ: 200, currentZ: 100 },
      { id: 'toast', name: 'TOAST', color: 'rgba(74,222,128,0.9)', borderColor: '#4ade80', correctZ: 9999, currentZ: 200 },
    ],
  },
];

export default function ZIndexLayering() {
  const navigate = useNavigate();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const rotX = useRef(-20);
  const rotY = useRef(30);

  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [layerValues, setLayerValues] = useState<Record<string, number>>({});
  const [score, setScore] = useState(0);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const applyRotation = () => {
    if (containerRef.current) {
      containerRef.current.style.transform = `rotateX(${rotX.current}deg) rotateY(${rotY.current}deg)`;
    }
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastX.current;
      const dy = e.clientY - lastY.current;
      rotY.current += dx * 0.5;
      rotX.current -= dy * 0.5;
      rotX.current = Math.max(-60, Math.min(60, rotX.current));
      lastX.current = e.clientX;
      lastY.current = e.clientY;
      applyRotation();
    };

    const onMouseUp = () => {
      isDragging.current = false;
      if (wrapperRef.current) {
        wrapperRef.current.style.cursor = 'grab';
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const t = e.touches[0];
      if (!t) return;
      const dx = t.clientX - lastX.current;
      const dy = t.clientY - lastY.current;
      rotY.current += dx * 0.5;
      rotX.current -= dy * 0.5;
      rotX.current = Math.max(-60, Math.min(60, rotX.current));
      lastX.current = t.clientX;
      lastY.current = t.clientY;
      applyRotation();
    };

    const onTouchEnd = () => {
      isDragging.current = false;
      if (wrapperRef.current) {
        wrapperRef.current.style.cursor = 'grab';
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastX.current = e.clientX;
    lastY.current = e.clientY;
    if (wrapperRef.current) {
      wrapperRef.current.style.cursor = 'grabbing';
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    isDragging.current = true;
    lastX.current = t.clientX;
    lastY.current = t.clientY;
    if (wrapperRef.current) {
      wrapperRef.current.style.cursor = 'grabbing';
    }
  };

  useEffect(() => {
    applyRotation();
  }, []);

  useEffect(() => {
    const initial: Record<string, number> = {};
    challenges[currentChallengeIndex].layers.forEach((l) => {
      initial[l.id] = l.currentZ;
    });
    setLayerValues(initial);
    setChecked(false);
    setIsCorrect(false);
    setShowHint(false);
  }, [currentChallengeIndex]);

  const checkSolution = () => {
    if (checked && isCorrect) return;

    const challenge = challenges[currentChallengeIndex];
    const allCorrect = challenge.layers.every((layer) => layerValues[layer.id] === layer.correctZ);

    setChecked(true);
    setIsCorrect(allCorrect);

    if (allCorrect) {
      setScore((prev) => prev + 1);
      setTimeout(() => {
        if (currentChallengeIndex < challenges.length - 1) {
          setCurrentChallengeIndex((prev) => prev + 1);
        }
      }, 1500);
    }
  };

  const challenge = challenges[currentChallengeIndex];
  const integrity = Math.round((score / challenges.length) * 100);
  const hintOrder = challenge.layers
    .slice()
    .sort((a, b) => a.correctZ - b.correctZ)
    .map((l) => l.name)
    .join(' -> ');

  const displayLayers = challenge.layers
    .slice()
    .sort((a, b) => (layerValues[a.id] ?? a.currentZ) - (layerValues[b.id] ?? b.currentZ));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{ display: 'flex', height: '100vh', width: '100vw', background: '#05060C', overflow: 'hidden' }}
    >
      <div
        style={{
          width: '380px',
          flexShrink: 0,
          background: '#0E1228',
          borderRight: '1px solid #1E2845',
          padding: '32px 24px',
          overflowY: 'auto',
          zIndex: 10,
          position: 'relative',
          boxSizing: 'border-box',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
        }}
      >
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            border: '1px solid #2A3261',
            background: '#111733',
            color: '#C7CEFF',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '12px',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            padding: '8px 12px',
            cursor: 'pointer',
            marginBottom: '20px',
          }}
        >
          {'<- DASHBOARD'}
        </button>

        <div
          style={{
            display: 'inline-block',
            border: '1px solid #2A3261',
            color: '#9AA3E8',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '11px',
            letterSpacing: '2px',
            padding: '6px 10px',
            marginBottom: '14px',
          }}
        >
          LEVEL {currentChallengeIndex + 1}
        </div>

        <h1
          style={{
            margin: 0,
            fontFamily: 'Fraunces, serif',
            fontSize: '32px',
            lineHeight: '1.1',
            color: '#E8EBFF',
            marginBottom: '10px',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            maxWidth: '100%',
          }}
        >
          {challenge.title}
        </h1>

        <p
          style={{
            margin: 0,
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            lineHeight: 1.5,
            color: '#9FA8D8',
            marginBottom: '20px',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            maxWidth: '100%',
          }}
        >
          {challenge.description}
        </p>

        <button
          onClick={() => setShowHint((prev) => !prev)}
          style={{
            border: '1px solid #2A3261',
            background: '#111733',
            color: '#C7CEFF',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '12px',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            padding: '8px 12px',
            cursor: 'pointer',
            width: '100%',
            marginBottom: '12px',
          }}
        >
          SHOW HINT
        </button>

        {showHint && (
          <div
            style={{
              border: '1px solid #2A3261',
              background: '#0B1024',
              color: '#9FA8D8',
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              lineHeight: 1.5,
              padding: '10px 12px',
              marginBottom: '16px',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              maxWidth: '100%',
            }}
          >
            Correct order (bottom to top): {hintOrder}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          {challenge.layers.map((layer) => (
            <div key={layer.id} style={{ marginBottom: '10px' }}>
              <label
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '10px',
                  color: '#7E86C8',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  display: 'block',
                  marginBottom: '6px',
                }}
              >
                {layer.name}
              </label>
              <input
                type="number"
                value={layerValues[layer.id] ?? layer.currentZ}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10) || 0;
                  setLayerValues((prev) => ({ ...prev, [layer.id]: val }));
                }}
                style={{
                  background: '#111733',
                  border: `1px solid ${
                    checked && layerValues[layer.id] === layer.correctZ ? '#4ADE80' : checked ? '#EF4444' : '#2A3261'
                  }`,
                  color: 'white',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '18px',
                  padding: '8px 12px',
                  width: '100%',
                  outline: 'none',
                }}
              />
            </div>
          ))}
        </div>

        <button
          onClick={checkSolution}
          style={{
            width: '100%',
            background: '#6366F1',
            color: 'white',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            border: 'none',
            borderRadius: 0,
            padding: '12px',
            cursor: 'pointer',
            marginBottom: '12px',
          }}
        >
          CHECK STACK
        </button>

        {checked && isCorrect && (
          <div
            style={{
              color: '#4ADE80',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '13px',
              letterSpacing: '1px',
              marginBottom: '14px',
            }}
          >
            ✓ CORRECT
          </div>
        )}

        {checked && !isCorrect && (
          <div
            style={{
              color: '#EF4444',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '13px',
              letterSpacing: '1px',
              marginBottom: '14px',
            }}
          >
            ✗ Try again
          </div>
        )}

        <div style={{ marginTop: '12px', paddingBottom: '78px' }}>
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '11px',
              color: '#7E86C8',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            Architecture Integrity
          </div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: '48px', color: '#6366F1', lineHeight: 1 }}>{integrity}%</div>
        </div>

        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '18px',
            transform: 'translateX(-50%)',
            width: '30px',
            height: '30px',
            borderRadius: '999px',
            background: 'radial-gradient(circle at 35% 35%, #a5b4fc, #6366f1 48%, #312e81 100%)',
            boxShadow: '0 0 18px rgba(99,102,241,0.55)',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />
      </div>

      <div
        ref={wrapperRef}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        style={{
          flex: 1,
          position: 'relative',
          cursor: 'grab',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          overflow: 'hidden',
          pointerEvents: 'auto',
          touchAction: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 24,
            right: 24,
            zIndex: 5,
            pointerEvents: 'none',
            background: '#0E1228',
            border: '1px solid #1E2845',
            padding: '16px 24px',
            textAlign: 'right',
          }}
        >
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '10px',
              color: '#7E86C8',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            ARCHITECTURE INTEGRITY
          </div>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: '48px', color: '#6366F1', lineHeight: 1 }}>{integrity}%</div>
        </div>

        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            perspective: '1200px',
            perspectiveOrigin: '50% 50%',
            pointerEvents: 'none',
          }}
        >
          <div
            ref={containerRef}
            style={{
              width: '500px',
              height: '300px',
              position: 'relative',
              transformStyle: 'preserve-3d',
              transform: 'rotateX(-20deg) rotateY(30deg)',
              pointerEvents: 'none',
            }}
          >
            {displayLayers.map((layer) => {
              const depth = (layerValues[layer.id] ?? layer.currentZ) * 0.6;
              return (
                <div
                  key={layer.id}
                  style={{
                    position: 'absolute',
                    width: '440px',
                    height: '260px',
                    left: '30px',
                    top: '20px',
                    transformStyle: 'preserve-3d',
                    transform: `translateZ(${depth}px)`,
                    background: layer.color,
                    border: `2px solid ${layer.borderColor}`,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none',
                    boxShadow: `0 0 30px ${layer.borderColor}44`,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: '12px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      pointerEvents: 'none',
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '14px',
                      color: 'white',
                      letterSpacing: '3px',
                      opacity: 0.9,
                    }}
                  >
                    {layer.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 32,
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '11px',
            color: '#4A5280',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            pointerEvents: 'none',
          }}
        >
          ↔ DRAG TO ROTATE
        </div>
      </div>
    </motion.div>
  );
}
