import { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/* --- Helper Components for the Landing Page --- */

// Moment 2: Manifesto Shapes
function ManifestoCanvas() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });
  
  // 6 circles self organizing into a face when scrolled into view
  const positions = [
    { start: { x: '-20%', y: '-40%' }, end: { x: '30%', y: '20%' } }, // Left eye
    { start: { x: '120%', y: '-10%' }, end: { x: '70%', y: '20%' } }, // Right eye
    { start: { x: '-50%', y: '100%' }, end: { x: '50%', y: '50%' }, scale: 0.5 }, // Nose
    { start: { x: '50%', y: '150%' }, end: { x: '40%', y: '75%' } }, // Mouth L
    { start: { x: '100%', y: '150%' }, end: { x: '50%', y: '80%' } }, // Mouth M
    { start: { x: '-10%', y: '150%' }, end: { x: '60%', y: '75%' } }, // Mouth R
  ];

  return (
    <div ref={ref} className="w-full h-full relative overflow-hidden bg-[#111111] border-l border-[#2A2A2A]">
       {positions.map((pos, i) => (
         <motion.div
           key={i}
           initial={false}
           animate={{
              left: isInView ? pos.end.x : pos.start.x,
              top: isInView ? pos.end.y : pos.start.y,
              scale: pos.scale || 1
           }}
           transition={{ type: "spring", stiffness: 40, damping: 12, delay: i * 0.1 }}
           className="absolute w-12 h-12 rounded-full bg-slate-500/50 -translate-x-1/2 -translate-y-1/2"
           style={{ filter: "drop-shadow(0 0 10px rgba(0,0,0,0.5))" }}
         />
       ))}
    </div>
  );
}

// Moment 3: Strip 1 (Contrast Slider)
function ContrastStrip() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.5 });
  const [lightness, setLightness] = useState(50);
  
  // Calculate a fake contrast ratio for demo (white text on grey bg)
  // Contrast ratio formula is complex, simulating here:
  const l1 = 1; // white
  const l2 = Math.pow((lightness + 5) / 105, 2.4);
  const ratio = (l1 + 0.05) / (l2 + 0.05);

  return (
    <div ref={ref} className="w-full h-[60vh] bg-[#111111] flex overflow-hidden border-b border-[#2A2A2A]">
       <div className="w-[40%] flex items-center justify-end p-12 z-10">
          <motion.h2 
             initial={{ x: -100, opacity: 0 }}
             animate={isInView ? { x: 0, opacity: 1 } : {}}
             transition={{ duration: 0.8, ease: "easeOut" }}
             className="font-fraunces text-white text-7xl font-black"
          >
             CONTRAST
          </motion.h2>
       </div>
       <motion.div 
          initial={{ clipPath: 'inset(0 0 0 100%)' }}
          animate={isInView ? { clipPath: 'inset(0 0 0 0%)' } : {}}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="w-[60%] flex flex-col items-center justify-center p-12 bg-[#1A1A1A] relative"
       >
          <div 
             className="w-full max-w-md h-32 flex items-center justify-center rounded-xl mb-8"
             style={{ backgroundColor: `hsl(0, 0%, ${lightness}%)` }}
          >
             <span className="font-inter font-bold text-white text-2xl tracking-widest drop-shadow-md">LEGIBILITY</span>
          </div>
          <input 
             type="range" min="0" max="100" value={lightness} onChange={e => setLightness(Number(e.target.value))}
             className="w-full max-w-md accent-[#6366F1] h-1 bg-[#2A2A2A] appearance-none rounded-full cursor-ew-resize"
          />
          <div className="mt-8 font-jetbrains text-[#E0E0FF] text-xl flex items-center gap-4">
             {ratio.toFixed(2)} : 1 
             {ratio >= 4.5 ? <span className="text-[#4ADE80]">✓ WCAG AA</span> : <span className="text-[#EF4444]">✗ Fails</span>}
          </div>
       </motion.div>
    </div>
  );
}

// Moment 3: Strip 2 (Fitts Law)
function FittsStrip() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.5 });
  const [distance, setDistance] = useState(500);
  const [ms, setMs] = useState(240);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
       if (!isInView || !btnRef.current) return;
       const rect = btnRef.current.getBoundingClientRect();
       const centerX = rect.left + rect.width / 2;
       const centerY = rect.top + rect.height / 2;
       const dist = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2));
       setDistance(dist);
       setMs(Math.max(120, Math.floor(dist * 0.8)));
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, [isInView]);

  // Size inversely proportional to distance
  const scale = Math.max(1, Math.min(2.5, 500 / Math.max(distance, 50)));

  return (
    <div ref={ref} className="w-full h-[60vh] bg-[#0D0D1A] flex overflow-hidden border-b border-[#2A2A2A]">
       <div className="w-[60%] flex items-center p-16 z-10">
          <motion.h2 
             initial={{ x: -100, opacity: 0 }}
             animate={isInView ? { x: 0, opacity: 1 } : {}}
             transition={{ duration: 0.8, ease: "easeOut" }}
             className="font-fraunces text-white text-7xl font-black text-left"
          >
             FITTS LAW
          </motion.h2>
       </div>
       <motion.div 
          initial={{ clipPath: 'inset(100% 0 0 0)' }}
          animate={isInView ? { clipPath: 'inset(0% 0 0 0)' } : {}}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="w-[40%] flex flex-col items-center justify-center bg-[#111116] relative overflow-hidden"
       >
          <button 
             ref={btnRef}
             className="bg-[#6366F1] text-white font-inter font-black px-6 py-3 tracking-widest absolute"
             style={{ transform: `scale(${scale})` }}
          >
             TARGET
          </button>
          <div className="absolute bottom-8 font-jetbrains text-[#E0E0FF] text-sm opacity-50">
             acquisition time: {ms}ms
          </div>
       </motion.div>
    </div>
  );
}

// Moment 3: Strip 3 (Cognitive Load)
function CognitiveStrip() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.5 });
  const [clean, setClean] = useState(false);

  useEffect(() => {
     if (!isInView) return;
     const interval = setInterval(() => setClean(c => !c), 3000);
     return () => clearInterval(interval);
  }, [isInView]);

  return (
    <div ref={ref} className="w-full h-[60vh] bg-[#080808] flex overflow-hidden border-b border-[#2A2A2A]">
       <div className="w-[40%] flex items-center justify-end p-16 z-10">
          <motion.h2 
             initial={{ x: -100, opacity: 0 }}
             animate={isInView ? { x: 0, opacity: 1 } : {}}
             transition={{ duration: 0.8, ease: "easeOut" }}
             className="font-fraunces text-[#E0E0FF] text-7xl font-black text-right leading-[0.9]"
          >
             COGNITIVE<br/>LOAD
          </motion.h2>
       </div>
       <motion.div 
          initial={{ clipPath: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)' }}
          animate={isInView ? { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' } : {}}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="w-[60%] flex flex-col items-center justify-center bg-[#111111] relative"
       >
          <div className="w-full max-w-lg h-64 border border-[#2A2A2A] relative overflow-hidden flex items-center justify-center p-8 bg-[#080808] transition-all duration-500">
             {clean ? (
                 <div className="w-full flex justify-between">
                    {[1,2,3,4].map(i => (
                       <div key={i} className="w-16 h-12 bg-[#6366F1]/20 border border-[#6366F1]/50 text-[#6366F1] flex items-center justify-center font-inter text-xs font-bold">Menu {i}</div>
                    ))}
                 </div>
             ) : (
                 <div className="w-full grid grid-cols-4 gap-2">
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                       <div key={i} className="h-8 bg-[#2A2A2A] text-[#888] flex items-center justify-center font-inter text-[10px] border border-[#333]">Option {i}</div>
                    ))}
                 </div>
             )}
          </div>
          <div className="mt-8 font-jetbrains text-[#E0E0FF] text-xl">
             7±2 items. No more.
          </div>
       </motion.div>
    </div>
  );
}

// Moment 4: Games Preview Ticker
function GamesTicker() {
  const games = [
    "PROXIMITY FIELD", "SIMILARITY MATCH", "CLOSURE CHAMBER", "FIGURE GROUND ARENA", 
    "CONTINUITY RIVER", "LOAD REDUCER", "MENTAL MODEL MAPPER", "HICK'S LAW DUEL", 
    "FITTS LAW FORGE", "MILLER'S VAULT", "TYPE HIERARCHY SCULPTOR", "RHYTHM & BASELINE", 
    "CONTRAST CALIBRATION LAB", "PALETTE ARCHITECT", "ACCESSIBILITY AUDITOR", 
    "AFFORDANCE FORGE", "MOTION LAW STUDIO", "FEEDBACK LOOP", "INFORMATION ARCHITECT", 
    "DARK PATTERN DETECTIVE"
  ];
  
  const [speed, setSpeed] = useState(40); // Seconds for full infinite scroll
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
     const handleMouse = (e: MouseEvent) => {
        // Calculate speed modifier based on horizontal position (-20s to +80s)
        const pct = e.clientX / window.innerWidth;
        setSpeed(20 + (1 - pct) * 80);
     };
     window.addEventListener('mousemove', handleMouse);
     return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <div className="w-full h-[80vh] bg-[#111111] flex flex-col justify-center relative overflow-hidden border-b border-[#2A2A2A]">
       <div className="absolute top-12 left-12 font-inter text-[12px] font-bold uppercase tracking-[4px] text-[#E0E0FF] opacity-50">
          20 GAMES. EVERY PRINCIPLE.
       </div>

       <div className="w-full flex relative whitespace-nowrap items-center select-none" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
           <motion.div 
               animate={{ x: [0, -4000] }}
               transition={{ ease: "linear", duration: speed, repeat: Infinity }}
               className="flex items-center"
           >
               {/* Need two copies to make infinite seamlessly */}
               {[...games, ...games].map((g, i) => (
                  <div 
                    key={i} 
                    className="flex items-center px-4 group cursor-pointer"
                    onMouseEnter={() => setHoveredNode(g)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                     <span className="font-fraunces text-5xl text-[#E0E0FF] hover:text-[#6366F1] transition-colors">{g}</span>
                     <span className="w-2 h-2 rounded-full bg-[#6366F1] mx-8 opacity-50" />
                  </div>
               ))}
           </motion.div>
       </div>

       {/* Floating Tooltip Placeholder for Principles */}
       <AnimatePresence>
         {hoveredNode && (
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-[#6366F1] text-white px-6 py-2 font-jetbrains uppercase text-sm tracking-widest pointer-events-none drop-shadow-lg"
            >
               TEACHES: {hoveredNode.split(' ')[0]} PRINCIPLE
            </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
}


export default function Home() {
  const navigate = useNavigate();
  const [wipeActive, setWipeActive] = useState(false);
  const [introDone, setIntroDone] = useState(false);

  // Custom Cursor
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  useEffect(() => {
     const handler = (e: MouseEvent) => setCursorPos({ x: e.clientX, y: e.clientY });
     window.addEventListener('mousemove', handler);
     return () => window.removeEventListener('mousemove', handler);
  }, []);

  // Moment 1 Sequence
  const [typingText, setTypingText] = useState('');
  const [shattering, setShattering] = useState(false);
  
  useEffect(() => {
     const fullText = "GESTALT";
     let i = 0;
     const typeInt = setInterval(() => {
        setTypingText(fullText.slice(0, i+1));
        i++;
        if (i === fullText.length) {
            clearInterval(typeInt);
            setTimeout(() => setShattering(true), 1000);
            setTimeout(() => setIntroDone(true), 2500); // Intro finished
        }
     }, 150);
     return () => clearInterval(typeInt);
  }, []);

  const handleBegin = () => {
      setWipeActive(true);
      setTimeout(() => {
          navigate('/onboarding');
      }, 500); // wait for 400ms wipe
  };

  return (
    <div className="relative bg-[#080808] text-[#E0E0FF] selection:bg-[#6366F1]/30 cursor-none min-h-screen">
      
      {/* 🔴 Global Film Grain Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03] mix-blend-overlay" style={{ filter: "url(#grain)" }}>
         <div className="w-full h-full bg-[#E0E0FF]" />
      </div>

      {/* 🔴 Custom Cursor */}
      <motion.div 
         animate={{ x: cursorPos.x - 3, y: cursorPos.y - 3 }}
         transition={{ type: "tween", ease: "linear", duration: 0.05 }}
         className="fixed top-0 left-0 w-[6px] h-[6px] bg-[#6366F1] rounded-full pointer-events-none z-[9999] mix-blend-screen overflow-visible"
      >
         {/* CSS Crosshair extensions */}
         <div className="absolute top-1/2 left-[-10px] w-5 h-[1px] bg-[#6366F1]/30 -translate-y-1/2" />
         <div className="absolute left-1/2 top-[-10px] h-5 w-[1px] bg-[#6366F1]/30 -translate-x-1/2" />
      </motion.div>

      {/* 🔴 Page Wipe Transition */}
      <motion.div 
         initial={{ x: '-100%' }}
         animate={wipeActive ? { x: 0 } : { x: '-100%' }}
         transition={{ duration: 0.4, ease: "easeIn" }}
         className="fixed inset-0 bg-[#6366F1] z-[10000] pointer-events-none"
      />

      {/* ======================================= */}
      {/* MOMENT 1: ENTRY SCREEN */}
      {/* ======================================= */}
      <AnimatePresence>
        {!introDone && (
           <motion.div 
              exit={{ clipPath: 'inset(100% 0 0 0)' }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="fixed inset-0 z-[1000] bg-[#080808] flex items-center justify-center font-fraunces text-[140px] font-black tracking-tight"
           >
              <div className="flex relative items-center justify-center">
                 {!shattering && <span className="text-[#E0E0FF]">{typingText}</span>}
                 {shattering && (
                    <>
                       {/* Shattering G */}
                       <div className="relative w-[1em] h-[1em]">
                          {Array.from({length: 20}).map((_, i) => (
                             <motion.div 
                                key={i}
                                initial={{ top: '50%', left: '50%', scale: 1, opacity: 1 }}
                                animate={{ 
                                   top: `${Math.random() * 100}%`, 
                                   left: `${Math.random() * 100}%`,
                                   scale: 0.2 + Math.random() * 0.3
                                }}
                                transition={{ duration: 1.5, ease: "backOut" }}
                                className="absolute w-4 h-4 rounded-full bg-[#E0E0FF] -translate-x-1/2 -translate-y-1/2"
                             />
                          ))}
                       </div>
                       <span className="text-[#E0E0FF]">ESTALT</span>
                    </>
                 )}
              </div>
           </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 hidden sm:block">

         {/* ======================================= */}
         {/* MOMENT 2: THE MANIFESTO */}
         {/* ======================================= */}
         <div className="w-full h-[100vh] bg-[#080808] flex relative border-b border-[#2A2A2A]">
             <div className="absolute top-12 left-12 font-inter text-[8px] font-black uppercase tracking-[4px] text-[#6366F1]">
                DESIGN PHILOSOPHY
             </div>
             
             {/* Staggered load for manifesto content */}
             <div className="w-[60%] flex items-center p-24">
                 <motion.h1 
                    initial={{ opacity: 0, y: 50 }}
                    animate={introDone ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="font-fraunces text-8xl xl:text-[96px] text-white font-black leading-[0.9] tracking-tighter"
                 >
                    Design is not decoration. <motion.span initial={{ opacity: 0 }} animate={introDone ? {opacity: 1} : {}} transition={{ delay: 0.8 }} className="text-[#6366F1] drop-shadow-lg">It is cognition made visible.</motion.span>
                 </motion.h1>
             </div>
             <div className="w-[40%] bg-[#111111]">
                 {introDone && <ManifestoCanvas />}
             </div>
         </div>

         {/* ======================================= */}
         {/* MOMENT 3: THE PLATFORM PITCH */}
         {/* ======================================= */}
         <ContrastStrip />
         <FittsStrip />
         <CognitiveStrip />

         {/* ======================================= */}
         {/* MOMENT 4: GAMES PREVIEW TICKER */}
         {/* ======================================= */}
         <GamesTicker />

         {/* ======================================= */}
         {/* MOMENT 5: CTA */}
         {/* ======================================= */}
         <div className="w-full h-[100vh] bg-[#080808] relative flex flex-col items-center justify-center overflow-hidden">
             
             {/* Background Particles (Animated CSS Properties simulated with framer) */}
             <div className="absolute inset-0 z-0">
               {Array.from({length: 40}).map((_, i) => (
                  <motion.div
                     key={i}
                     initial={{ 
                        left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
                        scale: 0, opacity: 0
                     }}
                     animate={{ 
                        scale: [0, Math.random() + 0.5, 0],
                        opacity: [0, 0.4, 0],
                        top: [`${Math.random() * 100}%`, `${Math.random() * 100}%`]
                     }}
                     transition={{ duration: 10 + Math.random() * 10, repeat: Infinity, ease: "linear" }}
                     className="absolute w-2 h-2 rounded-full bg-[#6366F1] blur-[2px]"
                  />
               ))}
             </div>

             <div className="relative z-10 flex flex-col items-center text-center px-8">
                 <motion.h2 
                    initial={{ clipPath: 'inset(100% 0 0 0)' }}
                    whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="font-fraunces text-6xl md:text-[64px] text-white font-black max-w-[800px] leading-[0.9] mb-16 tracking-tighter"
                 >
                    READY TO SEE DESIGN DIFFERENTLY?
                 </motion.h2>

                 <motion.button 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    onClick={handleBegin}
                    className="group relative bg-[#6366F1] text-[#E0E0FF] hover:bg-[#080808] hover:text-[#6366F1] px-16 py-6 font-inter text-xl uppercase font-black tracking-[6px] uppercase border border-transparent hover:border-[#6366F1] transition-all duration-300 pointer-events-auto cursor-none"
                 >
                    BEGIN
                 </motion.button>
             </div>

             <div className="absolute bottom-12 right-12 font-jetbrains text-[#E0E0FF] text-[11px] opacity-40">
                20 GAMES • 200+ CHALLENGES • EVERY UX PRINCIPLE
             </div>
         </div>

      </div>

    </div>
  );
}
