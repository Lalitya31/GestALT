import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';   

type SkillKey = 'gestalt' | 'cognitive' | 'typography' | 'color' | 'interaction' | 'strategy';

interface SkillLevels {
  gestalt: number;
  cognitive: number;
  typography: number;
  color: number;
  interaction: number;
  strategy: number;
}

interface LayoutItem {
  id: string;
  element: string;
  x: number;
  y: number;
}

interface UserData {
  name: string;
  email: string;
  design_era: string;
  role: string;
  instinct_layout: Array<{ element: string; x: number; y: number }>;
  colour_personality: string;
  work_style: number;
  goal: string;
  availability_pattern: string[];
  streak_goal: number;
  design_philosophy: string;
  problem_detection_score: number;
}

const SCREEN_COUNT = 12;

const initialSkillLevels: SkillLevels = {
  gestalt: 50,
  cognitive: 50,
  typography: 50,
  color: 50,
  interaction: 50,
  strategy: 50
};

const defaultUserData: UserData = {
  name: '',
  email: '',
  design_era: '',
  role: '',
  instinct_layout: [],
  colour_personality: '',
  work_style: 50,
  goal: '',
  availability_pattern: [],
  streak_goal: 3,
  design_philosophy: '',
  problem_detection_score: 0
};

const clipTransition = { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const };

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...(JSON.parse(raw) as T) };
  } catch {
    return fallback;
  }
}

function pointInRect(pointX: number, pointY: number, rect: DOMRect | undefined) {
  if (!rect) return false;
  return pointX >= rect.left && pointX <= rect.right && pointY >= rect.top && pointY <= rect.bottom;
}

function AmbientBackdrop() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 10% 12%, rgba(99,102,241,0.30), transparent 28%), radial-gradient(circle at 80% 82%, rgba(56,189,248,0.16), transparent 36%), radial-gradient(circle at 52% 46%, rgba(139,92,246,0.10), transparent 26%)'
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)',
          backgroundSize: '44px 44px'
        }}
      />
      <motion.div
        className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.34), transparent 72%)' }}
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.28), transparent 72%)' }}
        animate={{ y: [0, 18, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
    </>
  );
}

function ScreenFrame({
  id,
  children
}: {
  id: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      key={id}
      className="h-full w-full"
      initial={{ clipPath: 'inset(0 100% 0 0)' }}
      animate={{ clipPath: 'inset(0 0 0 0)' }}
      exit={{ clipPath: 'inset(0 0 0 100%)' }}
      transition={clipTransition}
    >
      {children}
    </motion.div>
  );
}

function IdentityDrop({ onComplete }: { onComplete: (payload: Pick<UserData, 'name' | 'email'>) => void }) {
  const nameZoneRef = useRef<HTMLDivElement | null>(null);
  const emailZoneRef = useRef<HTMLDivElement | null>(null);

  const [hovered, setHovered] = useState<'name' | 'email' | null>(null);
  const [nameDropped, setNameDropped] = useState(false);
  const [emailDropped, setEmailDropped] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const detectHover = (x: number, y: number) => {
    const overName = pointInRect(x, y, nameZoneRef.current?.getBoundingClientRect());
    const overEmail = pointInRect(x, y, emailZoneRef.current?.getBoundingClientRect());
    if (overName) setHovered('name');
    else if (overEmail) setHovered('email');
    else setHovered(null);
  };

  return (
    <ScreenFrame id={1}>
      <div className="relative flex h-full flex-col items-center justify-center px-4">
        <h1 className="text-center font-fraunces text-[42px] text-white md:text-[56px]">Who's designing today?</h1>

        <div className="mt-8 flex w-full max-w-[760px] flex-col items-center gap-4">
          {!nameDropped && (
            <motion.div
              drag
              dragMomentum={false}
              onDrag={(_, info) => detectHover(info.point.x, info.point.y)}
              onDragEnd={(_, info) => {
                detectHover(info.point.x, info.point.y);
                if (pointInRect(info.point.x, info.point.y, nameZoneRef.current?.getBoundingClientRect())) setNameDropped(true);
                setHovered(null);
              }}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
              className="cursor-grab border border-[#6366F1] bg-[#111733] px-4 py-2 font-jetbrains text-[12px] tracking-[0.18em] text-[#E0E0FF] active:cursor-grabbing"
            >
              YOUR NAME
            </motion.div>
          )}
          {!emailDropped && (
            <motion.div
              drag
              dragMomentum={false}
              onDrag={(_, info) => detectHover(info.point.x, info.point.y)}
              onDragEnd={(_, info) => {
                detectHover(info.point.x, info.point.y);
                if (pointInRect(info.point.x, info.point.y, emailZoneRef.current?.getBoundingClientRect())) setEmailDropped(true);
                setHovered(null);
              }}
              animate={{ y: [0, 11, 0] }}
              transition={{ duration: 5.1, repeat: Infinity, ease: 'easeInOut' }}
              className="cursor-grab border border-[#6366F1] bg-[#111733] px-4 py-2 font-jetbrains text-[12px] tracking-[0.18em] text-[#E0E0FF] active:cursor-grabbing"
            >
              YOUR EMAIL
            </motion.div>
          )}
        </div>

        <div className="mt-10 flex w-full max-w-[760px] flex-col items-center gap-4">
          <div
            ref={nameZoneRef}
            className={`flex h-16 w-[280px] items-center justify-center border-2 border-dashed text-[12px] font-jetbrains tracking-[0.18em] transition-all ${
              hovered === 'name' ? 'border-[#6366F1] bg-[#1A2150] text-[#E0E0FF]' : 'border-[#6366F1] bg-[#0E1228] text-[#7E86C8]'
            }`}
          >
            {nameDropped ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Type your name"
                className="w-[220px] border-b border-[#6366F1] bg-transparent px-1 py-1 text-center font-inter text-[16px] text-[#E0E0FF] outline-none"
              />
            ) : (
              'DROP NAME HERE'
            )}
          </div>

          <div
            ref={emailZoneRef}
            className={`flex h-16 w-[280px] items-center justify-center border-2 border-dashed text-[12px] font-jetbrains tracking-[0.18em] transition-all ${
              hovered === 'email' ? 'border-[#6366F1] bg-[#1A2150] text-[#E0E0FF]' : 'border-[#6366F1] bg-[#0E1228] text-[#7E86C8]'
            }`}
          >
            {emailDropped ? (
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Type your email"
                className="w-[220px] border-b border-[#6366F1] bg-transparent px-1 py-1 text-center font-inter text-[16px] text-[#E0E0FF] outline-none"
              />
            ) : (
              'DROP EMAIL HERE'
            )}
          </div>
        </div>

        {(name.trim().length > 0 || email.trim().length > 0) && (
          <motion.div
            initial={{ clipPath: 'inset(0 100% 0 0)' }}
            animate={{ clipPath: 'inset(0 0 0 0)' }}
            className="mt-8 border border-[#2A3261] bg-[#111733] px-8 py-5 text-center"
          >
            <div className="font-fraunces text-[32px] text-white">{name || 'GESTALT LEARNER'}</div>
            <div className="mt-1 font-jetbrains text-[11px] tracking-[0.2em] text-[#7E86C8]">GESTALT LEARNER</div>
          </motion.div>
        )}
        <button
          onClick={() => onComplete({ name: name.trim(), email: email.trim() })}
          className="mt-6 border border-[#5A60A8] bg-[#6366F1] px-6 py-2 font-jetbrains text-[12px] tracking-[0.16em] text-white"
        >
          CONTINUE
        </button>
      </div>
    </ScreenFrame>
  );
}

const eras = [
  { year: 1990, name: 'Skeuomorphic', desc: 'You value tactile realism and familiar metaphors.' },
  { year: 2000, name: 'Gradient Web', desc: 'You enjoy expressive depth and visual energy.' },
  { year: 2008, name: 'Flat Design', desc: 'You prefer clarity, speed, and reduced noise.' },
  { year: 2013, name: 'Material', desc: 'You see hierarchy through deliberate motion and depth.' },
  { year: 2017, name: 'Neumorphic', desc: 'You gravitate to softness, surfaces, and restraint.' },
  { year: 2020, name: 'Glassmorphism', desc: 'You think in layers, context, and translucency.' },
  { year: 2023, name: 'Dark Minimal', desc: 'You seek precision, contrast, and editorial calm.' },
  { year: 2025, name: 'AI Native', desc: 'You design adaptive systems that evolve with users.' }
];

function DesignEraSelector({ onComplete }: { onComplete: (payload: Pick<UserData, 'design_era'>) => void }) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(6);
  const [handleX, setHandleX] = useState(0);

  useEffect(() => {
    const rect = railRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pos = (selectedIndex / (eras.length - 1)) * rect.width;
    setHandleX(pos);
  }, [selectedIndex]);

  const updateFromPoint = (pointX: number) => {
    const rect = railRef.current?.getBoundingClientRect();
    if (!rect) return;
    const localX = clamp(pointX - rect.left, 0, rect.width);
    const ratio = localX / Math.max(1, rect.width);
    const nextIndex = clamp(Math.round(ratio * (eras.length - 1)), 0, eras.length - 1);
    setHandleX(localX);
    setSelectedIndex(nextIndex);
  };

  const selected = eras[selectedIndex];

  return (
    <ScreenFrame id={2}>
      <div className="relative flex h-full flex-col px-6 py-10 md:px-12">
        <h2 className="font-fraunces text-[36px] text-white md:text-[48px]">Which era shaped your eye?</h2>

        <div className="relative mt-8 flex flex-1 flex-col justify-center">
          <motion.div
            className="pointer-events-none absolute inset-x-[10%] top-8 h-52 border border-[#2A3261]"
            style={{
              background:
                selectedIndex % 2 === 0
                  ? 'linear-gradient(135deg, #111733 0%, #161F4A 100%)'
                  : 'linear-gradient(135deg, #1A2146 0%, #0E1228 100%)'
            }}
            animate={{ clipPath: 'inset(0 0 0 0)' }}
            initial={{ clipPath: 'inset(0 100% 0 0)' }}
            transition={{ duration: 0.2 }}
          />

          <div ref={railRef} className="relative mx-auto mt-20 h-28 w-full max-w-[980px] overflow-x-auto">
            <div className="relative h-full min-w-[980px]">
              <div className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 bg-[#2B3261]" />
              {eras.map((era, idx) => {
                const left = `${(idx / (eras.length - 1)) * 100}%`;
                const active = idx === selectedIndex;
                return (
                  <button
                    key={era.year}
                    onClick={() => setSelectedIndex(idx)}
                    className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
                    style={{ left }}
                  >
                    <div className={`mx-auto h-3 w-3 rounded-full ${active ? 'bg-[#6366F1]' : 'bg-[#58609A]'}`} />
                    <div className={`mt-2 font-jetbrains text-[10px] tracking-[0.16em] ${active ? 'text-[#E0E0FF]' : 'text-[#7E86C8]'}`}>{era.year}</div>
                  </button>
                );
              })}

              <motion.div
                drag="x"
                dragConstraints={railRef}
                dragMomentum={false}
                onDrag={(_, info) => updateFromPoint(info.point.x)}
                onDragEnd={(_, info) => updateFromPoint(info.point.x)}
                className="absolute top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border border-[#8790E6] bg-[#6366F1] active:cursor-grabbing"
                animate={{ x: handleX, y: '-50%' }}
                style={{ left: 0 }}
              />
            </div>
          </div>

          <div className="mt-10 text-center">
            <motion.div
              key={selected.name}
              initial={{ clipPath: 'inset(0 100% 0 0)' }}
              animate={{ clipPath: 'inset(0 0 0 0)' }}
              className="font-fraunces text-[44px] text-white md:text-[64px]"
            >
              {selected.name}
            </motion.div>
            <p className="mt-2 font-inter text-[15px] text-[#E0E0FF]">{selected.desc}</p>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => onComplete({ design_era: selected.name })}
            className="border border-[#5A60A8] bg-[#6366F1] px-6 py-2 font-jetbrains text-[12px] tracking-[0.16em] text-white"
          >
            LOCK ERA
          </button>
        </div>
      </div>
    </ScreenFrame>
  );
}

const roles = [
  { id: 'DESIGNER', desc: 'You think in systems and feel in pixels.' },
  { id: 'DEVELOPER', desc: 'You shape logic into experiences people can trust.' },
  { id: 'PM', desc: 'You align outcomes, constraints, and momentum.' },
  { id: 'STUDENT', desc: 'You are building foundations that will compound fast.' },
  { id: 'FOUNDER', desc: 'You design for leverage, velocity, and clarity.' },
  { id: 'RESEARCHER', desc: 'You spot patterns before the product does.' }
];

function RoleConstellation({ onComplete }: { onComplete: (payload: Pick<UserData, 'role'>) => void }) {
  const [selected, setSelected] = useState<string>('');
  const selectedRole = selected || 'Designer';

  return (
    <ScreenFrame id={3}>
      <div className="relative flex h-full flex-col items-center justify-center px-4">
        <h2 className="font-fraunces text-[38px] text-white md:text-[52px]">What brings you here?</h2>

        <div className="relative mt-10 h-[420px] w-full max-w-[820px]">
          {roles.map((role, idx) => {
            const angle = (idx / roles.length) * Math.PI * 2;
            const radius = 130 + idx * 9;
            const isSelected = selected === role.id;
            const othersDimmed = selected.length > 0 && !isSelected;
            return (
              <motion.div
                key={role.id}
                className="absolute left-1/2 top-1/2"
                animate={selected ? { x: 0, y: 0 } : { rotate: 360 }}
                transition={selected ? { duration: 0.5 } : { duration: 18 + idx * 2, repeat: Infinity, ease: 'linear' }}
              >
                <motion.button
                  onClick={() => setSelected(role.id)}
                  className="-translate-x-1/2 -translate-y-1/2 rounded-full border border-[#6366F1] bg-[#111733] px-4 text-center font-inter text-[13px] text-[#E0E0FF]"
                  style={{
                    width: isSelected ? 160 : othersDimmed ? 60 : 100,
                    height: isSelected ? 160 : othersDimmed ? 60 : 100,
                    transform: selected
                      ? 'translate(-50%, -50%)'
                      : `translate(calc(-50% + ${Math.cos(angle) * radius}px), calc(-50% + ${Math.sin(angle) * radius}px))`
                  }}
                  animate={isSelected ? { scale: [1, 1.06, 1] } : { scale: 1, opacity: othersDimmed ? 0.3 : 1 }}
                  transition={{ duration: 1.8, repeat: isSelected ? Infinity : 0, ease: 'easeInOut' }}
                >
                  {role.id}
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: 'inset(0 0 0 0)' }}
          className="mt-2 text-center"
        >
          <p className="font-inter text-[16px] text-[#E0E0FF]">{roles.find((r) => r.id === selected)?.desc || 'You think in systems and feel in pixels.'}</p>
          <button
            onClick={() => onComplete({ role: selectedRole })}
            className="mt-6 border border-[#5A60A8] bg-[#6366F1] px-6 py-2 font-jetbrains text-[12px] tracking-[0.16em] text-white"
          >
            CONTINUE
          </button>
        </motion.div>
      </div>
    </ScreenFrame>
  );
}

const skillKeys: SkillKey[] = ['gestalt', 'cognitive', 'typography', 'color', 'interaction', 'strategy'];

function SkillHorizon({ onComplete }: { onComplete: (payload: { skillLevels: SkillLevels }) => void }) {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const [sun, setSun] = useState({ x: 60, y: 180 });
  const [activeSkill, setActiveSkill] = useState<SkillKey>('gestalt');
  const [skills, setSkills] = useState<SkillLevels>(initialSkillLevels);

  const updateSun = (pointX: number, pointY: number) => {
    const rect = sceneRef.current?.getBoundingClientRect();
    if (!rect) return;
    const localX = clamp(pointX - rect.left, 0, rect.width);
    const localY = clamp(pointY - rect.top, 0, rect.height);
    setSun({ x: localX, y: localY });

    const idx = clamp(Math.round((localX / Math.max(1, rect.width)) * (skillKeys.length - 1)), 0, skillKeys.length - 1);
    const skill = skillKeys[idx];
    setActiveSkill(skill);
    const value = clamp(Math.round((1 - localY / Math.max(1, rect.height)) * 100), 0, 100);

    setSkills((prev) => ({ ...prev, [skill]: value }));
  };

  return (
    <ScreenFrame id={4}>
      <div className="flex h-full flex-col px-4 py-8 md:px-10">
        <h2 className="font-fraunces text-[34px] text-white md:text-[48px]">Where does your sun rise?</h2>

        <div className="mt-4 grid min-h-0 flex-1 gap-4 lg:grid-cols-[1fr_320px]">
          <div ref={sceneRef} className="relative min-h-[420px] overflow-hidden border border-[#28305D] bg-[#0E1228]">
            <svg viewBox="0 0 1200 500" className="absolute bottom-0 left-0 h-[70%] w-full">
              {skillKeys.map((k, i) => {
                const startX = i * 200;
                const peakX = startX + 100;
                const endX = startX + 200;
                const peakY = 140 + (i % 3) * 35;
                const isActive = activeSkill === k;
                return (
                  <g key={k}>
                    <path
                      d={`M ${startX} 500 L ${peakX} ${peakY} L ${endX} 500 Z`}
                      fill={isActive ? '#202963' : '#111733'}
                      stroke="#2A3261"
                      strokeWidth="2"
                    />
                    <text
                      x={peakX}
                      y={470}
                      textAnchor="middle"
                      fill={isActive ? '#E0E0FF' : '#7E86C8'}
                      fontSize="14"
                      style={{ letterSpacing: '0.15em', fontFamily: 'JetBrains Mono' }}
                    >
                      {k.toUpperCase()}
                    </text>
                  </g>
                );
              })}
            </svg>

            <motion.div
              drag
              dragMomentum={false}
              dragConstraints={sceneRef}
              onDrag={(_, info) => updateSun(info.point.x, info.point.y)}
              className="absolute h-12 w-12 cursor-grab rounded-full border border-[#F59E0B] bg-[#F59E0B] shadow-[0_0_50px_12px_rgba(245,158,11,0.35)] active:cursor-grabbing"
              animate={{ x: sun.x - 24, y: sun.y - 24 }}
            />
          </div>

          <div className="border border-[#28305D] bg-[#111733] p-4">
            <div className="font-jetbrains text-[11px] tracking-[0.18em] text-[#7E86C8]">LIVE SKILL VALUES</div>
            <div className="mt-4 space-y-3">
              {skillKeys.map((k) => (
                <div key={k} className="flex items-center justify-between border-b border-[#20284F] pb-2">
                  <span className="font-jetbrains text-[11px] tracking-[0.16em] text-[#E0E0FF]">{k.toUpperCase()}</span>
                  <span className="font-jetbrains text-[13px] text-white">{skills[k]}%</span>
                </div>
              ))}
            </div>
            <button
              disabled={false}
              onClick={() => onComplete({ skillLevels: skills })}
              className="mt-6 w-full border border-[#5A60A8] bg-[#6366F1] px-4 py-2 font-jetbrains text-[12px] tracking-[0.16em] text-white"
            >
              LOCK SKILL HORIZON
            </button>
          </div>
        </div>
      </div>
    </ScreenFrame>
  );
}

const elementTypes = ['H1', 'BTN', 'IMG', 'NAV', 'FORM', 'LABEL'];

function renderPlacedElement(type: string) {
  if (type === 'H1') return <div className="font-fraunces text-[26px] text-white">Headline</div>;
  if (type === 'BTN') return <button className="bg-[#6366F1] px-4 py-2 text-[12px] font-jetbrains tracking-[0.14em] text-white">CTA</button>;
  if (type === 'IMG') return <div className="h-20 w-28 border border-[#3A4280] bg-[#1A2147]" />;
  if (type === 'NAV') return <div className="font-jetbrains text-[10px] tracking-[0.14em] text-[#E0E0FF]">HOME · PRICING · ABOUT</div>;
  if (type === 'FORM') return <div className="w-36 border border-[#3A4280] bg-[#121735] px-2 py-1 text-[12px] text-[#E0E0FF]">Email Input</div>;
  return <div className="font-inter text-[13px] text-[#E0E0FF]">Field Label</div>;
}

function InstinctCanvas({
  userName,
  onComplete
}: {
  userName: string;
  onComplete: (payload: Pick<UserData, 'instinct_layout'>) => void;
}) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const [placed, setPlaced] = useState<LayoutItem[]>([]);
  const [captured, setCaptured] = useState(false);

  const addFromSidebar = (type: string, pointX: number, pointY: number) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect || !pointInRect(pointX, pointY, rect)) return;
    const localX = clamp(pointX - rect.left - 60, 0, rect.width - 120);
    const localY = clamp(pointY - rect.top - 30, 0, rect.height - 80);
    setPlaced((prev) => [...prev, { id: `${type}-${Date.now()}-${Math.random()}`, element: type, x: localX, y: localY }]);
  };

  const updatePlacedPosition = (id: string, pointX: number, pointY: number) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const localX = clamp(pointX - rect.left - 60, 0, rect.width - 120);
    const localY = clamp(pointY - rect.top - 30, 0, rect.height - 80);
    setPlaced((prev) => prev.map((item) => (item.id === id ? { ...item, x: localX, y: localY } : item)));
  };

  return (
    <ScreenFrame id={5}>
      <div className="flex h-full flex-col px-4 py-6 md:px-8">
        <h2 className="font-fraunces text-[32px] text-white md:text-[40px]">Build a screen. No rules.</h2>
        <p className="mt-1 font-inter text-[14px] text-[#E0E0FF]">Drag elements where they feel right.</p>

        <div className="mt-4 grid min-h-0 flex-1 gap-4 lg:grid-cols-[80px_1fr_220px]">
          <div className="space-y-3 border border-[#28305D] bg-[#0E1228] p-2">
            {elementTypes.map((type) => (
              <motion.button
                key={type}
                drag
                dragMomentum={false}
                onDragEnd={(_, info) => addFromSidebar(type, info.point.x, info.point.y)}
                className="w-full border border-[#6366F1] bg-[#111733] py-2 font-jetbrains text-[11px] text-[#E0E0FF]"
              >
                [{type}]
              </motion.button>
            ))}
          </div>

          <div className="flex items-center justify-center border border-[#28305D] bg-[#0E1228]">
            <div ref={frameRef} className="relative h-[680px] w-[375px] border border-[#6366F1] bg-[#0A0F22]">
              <div className="border-b border-[#28305D] px-3 py-2 font-jetbrains text-[10px] tracking-[0.16em] text-[#7E86C8]">YOUR SCREEN</div>
              {placed.map((item) => (
                <motion.div
                  key={item.id}
                  drag
                  dragConstraints={frameRef}
                  dragMomentum={false}
                  onDragEnd={(_, info) => updatePlacedPosition(item.id, info.point.x, info.point.y)}
                  className="absolute cursor-grab border border-[#2E376A] bg-[#111733] p-2 active:cursor-grabbing"
                  animate={{ x: item.x, y: item.y }}
                >
                  {renderPlacedElement(item.element)}
                </motion.div>
              ))}
            </div>
          </div>

          <div className="border border-[#28305D] bg-[#111733] p-3">
            <div className="font-jetbrains text-[11px] tracking-[0.16em] text-[#7E86C8]">CAPTURE PANEL</div>
            {!captured && (
              <button
                onClick={() => setCaptured(true)}
                className="mt-4 w-full border border-[#5A60A8] bg-[#6366F1] px-3 py-2 font-jetbrains text-[12px] tracking-[0.16em] text-white"
              >
                CAPTURE LAYOUT
              </button>
            )}

            {captured && (
              <motion.div
                initial={{ clipPath: 'inset(0 100% 0 0)' }}
                animate={{ clipPath: 'inset(0 0 0 0)' }}
                className="mt-4 border border-[#36418A] bg-[#0F1532] p-3"
              >
                <div className="h-24 border border-[#2A3261] bg-[#131A3A]" />
                <div className="mt-2 font-fraunces text-[16px] text-white">{userName || 'GESTALT LEARNER'}</div>
                <button
                  onClick={() =>
                    onComplete({
                      instinct_layout: placed.map((item) => ({ element: item.element, x: Math.round(item.x), y: Math.round(item.y) }))
                    })
                  }
                  className="mt-3 w-full border border-[#5A60A8] bg-[#6366F1] px-3 py-2 font-jetbrains text-[12px] tracking-[0.16em] text-white"
                >
                  CONTINUE
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </ScreenFrame>
  );
}

const palettes = [
  { name: 'Precision', colors: ['#E8F4FD', '#2196F3', '#FFFFFF'], line: 'Clinical' },
  { name: 'Energy', colors: ['#FFF3E0', '#FF6B35', '#2C1810'], line: 'Warm' },
  { name: 'Growth', colors: ['#E8F5E8', '#2E7D32', '#1B4332'], line: 'Forest' },
  { name: 'Focus', colors: ['#080808', '#6366F1', '#E0E0FF'], line: 'Dark Minimal' },
  { name: 'Emotion', colors: ['#FFE4E1', '#FF6B9D', '#4A1942'], line: 'Sunset' },
  { name: 'Trust', colors: ['#F5F5F5', '#1565C0', '#212121'], line: 'Corporate' },
  { name: 'Bold', colors: ['#0A0A0A', '#00FF87', '#7B2FBE'], line: 'Neon' },
  { name: 'Calm', colors: ['#F5F0E8', '#8B7355', '#2C2416'], line: 'Sand' }
];

function ColourFingerprint({ onComplete }: { onComplete: (payload: Pick<UserData, 'colour_personality'>) => void }) {
  const [dwell, setDwell] = useState<number[]>(Array.from({ length: palettes.length }, () => 0));
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoverStart, setHoverStart] = useState<number>(0);
  const [revealed, setRevealed] = useState(false);
  const [winner, setWinner] = useState(0);

  const applyHoverDelta = () => {
    if (hoveredIndex === null) return;
    const delta = Date.now() - hoverStart;
    setDwell((prev) => prev.map((v, i) => (i === hoveredIndex ? v + delta : v)));
  };

  const reveal = () => {
    setDwell((prev) => {
      let merged = prev;
      if (hoveredIndex !== null) {
        const delta = Date.now() - hoverStart;
        merged = prev.map((v, i) => (i === hoveredIndex ? v + delta : v));
      }
      const totalDwell = merged.reduce((acc, v) => acc + v, 0);
      if (totalDwell === 0) {
        setWinner(3);
        return merged;
      }
      let maxIdx = 0;
      merged.forEach((value, idx) => {
        if (value > merged[maxIdx]) maxIdx = idx;
      });
      setWinner(maxIdx);
      return merged;
    });
    setHoveredIndex(null);
    setRevealed(true);
  };

  return (
    <ScreenFrame id={6}>
      <div className="flex h-full flex-col">
        <div className="px-4 pt-6 md:px-10">
          <h2 className="font-fraunces text-[38px] text-white md:text-[52px]">Don't choose. Just look.</h2>
          <p className="font-inter text-[14px] text-[#E0E0FF]">We'll read where you linger.</p>
        </div>

        <div className="mt-4 flex min-h-0 flex-1 flex-col">
          {palettes.map((palette, idx) => {
            const expanded = revealed && idx === winner;
            return (
              <motion.div
                key={palette.name}
                onMouseEnter={() => {
                  if (revealed) return;
                  setHoveredIndex(idx);
                  setHoverStart(Date.now());
                }}
                onMouseLeave={() => {
                  if (revealed) return;
                  if (hoveredIndex === idx) {
                    applyHoverDelta();
                    setHoveredIndex(null);
                  }
                }}
                className="relative overflow-hidden"
                animate={{ height: revealed ? (expanded ? '60vh' : 'calc(40vh / 7)') : '12.5vh' }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className="h-full w-full"
                  style={{
                    background: `linear-gradient(90deg, ${palette.colors[0]} 0%, ${palette.colors[1]} 50%, ${palette.colors[2]} 100%)`
                  }}
                />
                {revealed && (
                  <motion.div
                    initial={{ clipPath: 'inset(0 100% 0 0)' }}
                    animate={{ clipPath: 'inset(0 0 0 0)' }}
                    className="absolute inset-0 flex items-center justify-between bg-black/25 px-6"
                  >
                    <div className="font-jetbrains text-[11px] tracking-[0.16em] text-white">{palette.line.toUpperCase()}</div>
                    {expanded && (
                      <div className="text-right">
                        <div className="font-jetbrains text-[12px] tracking-[0.2em] text-[#E0E0FF]">YOUR PALETTE</div>
                        <div className="font-fraunces text-[32px] text-white">{palette.name}</div>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="flex justify-center gap-3 px-4 py-4">
          {!revealed && (
            <button
              onClick={reveal}
              className="border border-[#5A60A8] bg-[#111733] px-5 py-2 font-jetbrains text-[12px] tracking-[0.16em] text-[#E0E0FF]"
            >
              REVEAL
            </button>
          )}
          {revealed && (
            <button
              onClick={() =>
                onComplete({
                  colour_personality: dwell.reduce((acc, v) => acc + v, 0) === 0 ? 'Dark Minimal' : palettes[winner].name
                })
              }
              className="border border-[#5A60A8] bg-[#6366F1] px-5 py-2 font-jetbrains text-[12px] tracking-[0.16em] text-white"
            >
              CONTINUE
            </button>
          )}
        </div>
      </div>
    </ScreenFrame>
  );
}

function SpeedCraftDial({ onComplete }: { onComplete: (payload: Pick<UserData, 'work_style'>) => void }) {
  const dialRef = useRef<HTMLDivElement | null>(null);
  const [value, setValue] = useState(50);
  const updateFromPoint = (x: number, y: number) => {
    const rect = dialRef.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(y - centerY, x - centerX);
    const mapped = clamp(Math.round(((Math.cos(angle) + 1) / 2) * 100), 0, 100);
    setValue(mapped);
  };

  const r = 170;
  const theta = Math.PI * (1 - value / 100);
  const handleX = 200 + Math.cos(theta) * r;
  const handleY = 200 + Math.sin(theta) * r;

  const personality = value < 34
    ? 'You ship, learn, and iterate fast.'
    : value > 66
      ? 'Every pixel earns its place.'
      : 'You balance speed with intention.';

  return (
    <ScreenFrame id={7}>
      <div className="relative flex h-full flex-col items-center justify-center px-4">
        <motion.div className="pointer-events-none absolute inset-0" animate={{ clipPath: `inset(0 ${value}% 0 0)` }} style={{ background: 'linear-gradient(90deg, rgba(99,102,241,0.16), transparent)' }} />
        <motion.div className="pointer-events-none absolute inset-0" animate={{ clipPath: `inset(0 0 0 ${value}%)` }} style={{ background: 'linear-gradient(90deg, transparent, rgba(74,222,128,0.14))' }} />

        <h2 className="font-fraunces text-[38px] text-white md:text-[52px]">How do you design?</h2>

        <div className="mt-8 flex w-full max-w-[960px] items-center justify-between">
          <div className="font-jetbrains text-[12px] tracking-[0.16em] text-[#7E86C8]">SHIP IT</div>
          <div className="font-jetbrains text-[12px] tracking-[0.16em] text-[#7E86C8]">CRAFT IT</div>
        </div>

        <div ref={dialRef} className="relative mt-4 h-[400px] w-[400px] rounded-full border border-[#2E376A] bg-[#111733]">
          <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full">
            <circle cx="200" cy="200" r="170" fill="none" stroke="#2E376A" strokeWidth="8" />
            <circle cx="200" cy="200" r="120" fill="none" stroke="#202A57" strokeWidth="1" />
          </svg>
          <motion.div
            drag
            dragMomentum={false}
            onPan={(_, info) => updateFromPoint(info.point.x, info.point.y)}
            onDrag={(_, info) => updateFromPoint(info.point.x, info.point.y)}
            className="absolute h-8 w-8 cursor-grab rounded-full border border-[#E0E0FF] bg-[#6366F1] active:cursor-grabbing"
            animate={{ x: handleX - 16, y: handleY - 16 }}
          />
        </div>

        <div className="mt-6 text-center">
          <div className="font-jetbrains text-[13px] text-[#E0E0FF]">{value}%</div>
          <div className="mt-1 font-inter text-[16px] text-white">{personality}</div>
        </div>

        <button
          disabled={false}
          onClick={() => onComplete({ work_style: value })}
          className="mt-6 border border-[#5A60A8] bg-[#6366F1] px-6 py-2 font-jetbrains text-[12px] tracking-[0.16em] text-white"
        >
          LOCK STYLE
        </button>
      </div>
    </ScreenFrame>
  );
}

const problemIds = ['contrast', 'label-order', 'nav-count', 'error-only-red', 'touch-target'];

function BrokenUIGutCheck({
  onComplete
}: {
  onComplete: (payload: Pick<UserData, 'problem_detection_score'> & { cognitiveScore: number }) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [revealing, setRevealing] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const toggle = (id: string) => {
    if (revealing || revealed) return;
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const score = selected.filter((id) => problemIds.includes(id)).length;

  return (
    <ScreenFrame id={8}>
      <div className="flex h-full flex-col px-4 py-6 md:px-10">
        <h2 className="font-fraunces text-[32px] text-white md:text-[40px]">Something's wrong. Trust your gut.</h2>
        <p className="mt-1 font-inter text-[14px] text-[#E0E0FF]">Tap anything that feels off. No rules.</p>

        <div className="mt-6 flex min-h-0 flex-1 items-center justify-center">
          <div className="relative h-[78%] w-[90%] border border-[#28305D] bg-[#111733] p-5">
            <div className="mb-4 flex items-center justify-between border-b border-[#28305D] pb-3">
              <button
                onClick={() => toggle('touch-target')}
                className={`h-5 w-5 border ${selected.includes('touch-target') ? 'border-red-400' : 'border-[#5B63A2]'} bg-[#6366F1]`}
              />
              <div className="flex gap-2">
                {['Home', 'Explore', 'Features', 'Pricing', 'About', 'Team', 'Roadmap', 'Blog', 'Help'].map((item) => (
                  <button
                    key={item}
                    onClick={() => toggle('nav-count')}
                    className={`px-2 py-1 text-[11px] ${selected.includes('nav-count') ? 'ring-1 ring-red-400' : ''}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid h-[80%] grid-cols-2 gap-4">
              <div className="space-y-3 border border-[#2A3261] p-3">
                <div className="font-fraunces text-[28px] text-white">Try GestALT Pro</div>
                <button
                  onClick={() => toggle('contrast')}
                  className={`px-4 py-2 text-[12px] ${selected.includes('contrast') ? 'ring-1 ring-red-400' : ''}`}
                  style={{ background: '#6F72A3', color: '#7781C0' }}
                >
                  Start Free Trial
                </button>
              </div>

              <div className="space-y-3 border border-[#2A3261] p-3">
                <input className="w-full border border-[#31396C] bg-[#0E1228] p-2 text-white" placeholder="Email" />
                <button
                  onClick={() => toggle('label-order')}
                  className={`text-[12px] ${selected.includes('label-order') ? 'ring-1 ring-red-400' : ''}`}
                >
                  Label placed here instead of above input
                </button>

                <button
                  onClick={() => toggle('error-only-red')}
                  className={`rounded border border-red-500 bg-[#2A0F16] px-3 py-2 text-red-400 ${selected.includes('error-only-red') ? 'ring-1 ring-red-400' : ''}`}
                >
                  •
                </button>
              </div>
            </div>

            {revealed && (
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-6 top-3 h-9 w-9 border-2 border-[#F59E0B]" />
                <div className="absolute right-6 top-3 h-10 w-[68%] border-2 border-[#F59E0B]" />
                <div className="absolute left-9 top-28 h-14 w-48 border-2 border-[#F59E0B]" />
                <div className="absolute right-12 top-56 h-12 w-44 border-2 border-[#F59E0B]" />
                <div className="absolute right-[56%] top-[62%] h-10 w-[42%] border-2 border-[#F59E0B]" />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center gap-3 pb-2">
          {!revealing && !revealed && (
            <button
              disabled={false}
              onClick={() => {
                setRevealing(false);
                setRevealed(true);
              }}
              className="border border-[#5A60A8] bg-[#6366F1] px-6 py-2 font-jetbrains text-[12px] tracking-[0.16em] text-white"
            >
              THAT'S WHAT I SEE
            </button>
          )}
          {revealed && !revealing && (
            <button
              onClick={() => onComplete({ problem_detection_score: score, cognitiveScore: Math.round((score / 5) * 100) })}
              className="border border-[#5A60A8] bg-[#6366F1] px-6 py-2 font-jetbrains text-[12px] tracking-[0.16em] text-white"
            >
              CONTINUE
            </button>
          )}
        </div>
      </div>
    </ScreenFrame>
  );
}

const goals = [
  { id: 'GET HIRED', message: 'Your path is focused. Every game builds your portfolio.' },
  { id: 'BUILD IT', message: 'Your games unlock real product thinking.' },
  { id: 'JUST LEARN', message: 'Curiosity is the best teacher. Explore freely.' }
];

function GoalVault({ onComplete }: { onComplete: (payload: Pick<UserData, 'goal'>) => void }) {
  const [selected, setSelected] = useState<string>('');

  return (
    <ScreenFrame id={9}>
      <div className="flex h-full flex-col px-4 py-8 md:px-10">
        <h2 className="text-center font-fraunces text-[40px] text-white md:text-[52px]">What's the mission?</h2>

        <div className="mt-8 grid min-h-0 flex-1 gap-4 md:grid-cols-3">
          {goals.map((goal) => {
            const isSelected = selected === goal.id;
            return (
              <button
                key={goal.id}
                onClick={() => setSelected(goal.id)}
                className="relative overflow-hidden border border-[#2A3261] bg-[#111733] p-4 text-left"
                style={{ perspective: '1200px' }}
              >
                <motion.div
                  animate={{ rotateY: isSelected ? -110 : 0 }}
                  transition={{ duration: 0.7 }}
                  className="h-full w-full origin-left border border-[#323A73] bg-gradient-to-b from-[#141B3F] to-[#0F1532] p-4"
                >
                  <div className="font-fraunces text-[32px] text-white">{goal.id}</div>
                  <div className="mt-6 h-16 w-16 rounded-full border border-[#4B54A3]" />
                </motion.div>
                {isSelected && (
                  <motion.div
                    initial={{ clipPath: 'inset(0 100% 0 0)' }}
                    animate={{ clipPath: 'inset(0 0 0 0)' }}
                    className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#1A2050]/70 px-4"
                  >
                    <div className="font-fraunces text-[24px] text-white">{goal.message}</div>
                  </motion.div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex justify-center">
          <button
            onClick={() => onComplete({ goal: selected || 'JUST LEARN' })}
            className="border border-[#5A60A8] bg-[#6366F1] px-6 py-2 font-jetbrains text-[12px] tracking-[0.16em] text-white"
          >
            CONTINUE
          </button>
        </div>
      </div>
    </ScreenFrame>
  );
}

function TimeRitual({
  onComplete
}: {
  onComplete: (payload: Pick<UserData, 'availability_pattern' | 'streak_goal'>) => void;
}) {
  const [painted, setPainted] = useState<Set<string>>(new Set());
  const [painting, setPainting] = useState(false);

  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const paintCell = (dayIdx: number, hour: number) => {
    const key = `${dayIdx}-${hour}`;
    setPainted((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  };

  const paintedHours = painted.size;
  const streakGoal = paintedHours < 3 ? 3 : paintedHours <= 7 ? 5 : 7;
  const streakText = paintedHours < 3
    ? '3-day streak is your sweet spot'
    : paintedHours <= 7
      ? '5-day streak - consistent growth'
      : 'Daily learner - full immersion';

  return (
    <ScreenFrame id={10}>
      <div
        className="flex h-full flex-col px-4 py-6 md:px-8"
        onMouseUp={() => setPainting(false)}
        onMouseLeave={() => setPainting(false)}
      >
        <h2 className="font-fraunces text-[36px] text-white md:text-[48px]">When do you learn?</h2>
        <p className="mt-1 font-inter text-[14px] text-[#E0E0FF]">Paint your hours.</p>

        <div className="mt-4 min-h-0 flex-1 overflow-auto border border-[#28305D] bg-[#0E1228] p-3">
          <div className="grid grid-cols-[48px_repeat(7,minmax(40px,1fr))] gap-[2px]">
            <div />
            {days.map((day) => (
              <div key={day} className="text-center font-jetbrains text-[10px] tracking-[0.14em] text-[#7E86C8]">{day}</div>
            ))}
            {Array.from({ length: 24 }, (_, hour) => (
              <>
                <div key={`label-${hour}`} className="flex items-center justify-center font-jetbrains text-[10px] text-[#7E86C8]">
                  {String(hour).padStart(2, '0')}:00
                </div>
                {Array.from({ length: 7 }, (_, dayIdx) => {
                  const key = `${dayIdx}-${hour}`;
                  const active = painted.has(key);
                  return (
                    <div
                      key={key}
                      onMouseDown={() => {
                        setPainting(true);
                        paintCell(dayIdx, hour);
                      }}
                      onMouseEnter={() => {
                        if (painting) paintCell(dayIdx, hour);
                      }}
                      className={`h-5 cursor-crosshair border ${active ? 'border-[#6366F1] bg-[#6366F1]/45 shadow-[0_0_12px_0_rgba(99,102,241,0.5)]' : 'border-[#1E1E1E] bg-[#0A0A12]'}`}
                    />
                  );
                })}
              </>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div>
            <div className="font-jetbrains text-[11px] tracking-[0.16em] text-[#7E86C8]">YOUR WEEKLY STREAK GOAL</div>
            <div className="mt-1 font-inter text-[14px] text-[#E0E0FF]">{streakText}</div>
          </div>
          <button
            disabled={false}
            onClick={() => onComplete({ availability_pattern: Array.from(painted), streak_goal: streakGoal })}
            className="border border-[#5A60A8] bg-[#6366F1] px-5 py-2 font-jetbrains text-[12px] tracking-[0.16em] text-white"
          >
            SET MY RITUAL
          </button>
        </div>
      </div>
    </ScreenFrame>
  );
}

function FirstPrinciple({ onComplete }: { onComplete: (payload: Pick<UserData, 'design_philosophy'>) => void }) {
  const [text, setText] = useState('');
  const [phase, setPhase] = useState(0);
  const lineA = 'Before anything else -';
  const lineB = 'what do you believe good design is?';

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 1200);
    const t2 = setTimeout(() => setPhase(2), 2000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <ScreenFrame id={11}>
      <div className="flex h-full flex-col items-center justify-center px-4">
        <div className="max-w-[980px] text-center">
          <motion.div initial={{ clipPath: 'inset(0 100% 0 0)' }} animate={{ clipPath: 'inset(0 0 0 0)' }} className="font-fraunces text-[34px] text-white md:text-[40px]">
            {lineA}
          </motion.div>
          {phase >= 2 && (
            <motion.div initial={{ clipPath: 'inset(0 100% 0 0)' }} animate={{ clipPath: 'inset(0 0 0 0)' }} className="mt-2 font-fraunces text-[34px] text-white md:text-[40px]">
              {lineB}
            </motion.div>
          )}

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mt-8 h-44 w-full resize-none bg-transparent p-2 text-center font-fraunces text-[28px] text-white outline-none"
            style={{ textShadow: '0 0 20px rgba(99,102,241,0.4)' }}
          />

          <button
            onClick={() => onComplete({ design_philosophy: text })}
            className="mt-4 border border-[#5A60A8] bg-[#6366F1] px-5 py-2 font-jetbrains text-[12px] tracking-[0.16em] text-white"
          >
            THAT'S MY BELIEF →
          </button>
        </div>
      </div>
    </ScreenFrame>
  );
}

function SignalTransmission({
  userData,
  skillLevels,
  onFinish
}: {
  userData: UserData;
  skillLevels: SkillLevels;
  onFinish: () => void;
}) {
  const [ready, setReady] = useState(false);
  const [wipe, setWipe] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!wipe) return;
    const t = setTimeout(onFinish, 420);
    return () => clearTimeout(t);
  }, [wipe, onFinish]);

  return (
    <ScreenFrame id={12}>
      <div className="relative flex h-full flex-col items-center justify-center overflow-hidden px-4 text-center">
        <motion.div
          className="pointer-events-none absolute inset-0"
          animate={{ backgroundPosition: ['0px 0px', '140px 80px'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          style={{
            backgroundImage: 'radial-gradient(rgba(224,224,255,0.18) 1px, transparent 1px)',
            backgroundSize: '26px 26px'
          }}
        />

        <motion.div initial={{ clipPath: 'inset(0 100% 0 0)' }} animate={{ clipPath: 'inset(0 0 0 0)' }} transition={{ delay: 0 }} className="font-fraunces text-[42px] tracking-[0.08em] text-white md:text-[72px]">
          {userData.name || 'GESTALT LEARNER'}
        </motion.div>

        <motion.div
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: 'inset(0 0 0 0)' }}
          transition={{ delay: 0.3 }}
          className="mt-2 border border-[#6366F1] bg-[#111733] px-3 py-1 font-jetbrains text-[12px] tracking-[0.16em] text-[#6366F1]"
        >
          {userData.role || 'LEARNER'}
        </motion.div>

        <div className="mt-6 w-full max-w-[620px] space-y-2">
          {(Object.keys(skillLevels) as SkillKey[]).map((key, idx) => (
            <div key={key} className="text-left">
              <div className="mb-1 flex justify-between font-jetbrains text-[10px] tracking-[0.14em] text-[#E0E0FF]">
                <span>{key.toUpperCase()}</span>
                <span>{skillLevels[key]}%</span>
              </div>
              <div className="h-2 border border-[#2A3261] bg-[#0E1228]">
                <motion.div
                  className="h-full bg-[#6366F1]"
                  initial={{ clipPath: 'inset(0 100% 0 0)' }}
                  animate={{ clipPath: 'inset(0 0 0 0)', width: `${skillLevels[key]}%` }}
                  transition={{ delay: 0.5 + idx * 0.06, duration: 0.2 }}
                />
              </div>
            </div>
          ))}
        </div>

        <motion.div
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: 'inset(0 0 0 0)' }}
          transition={{ delay: 0.9 }}
          className="mt-6 max-w-[620px] font-fraunces text-[20px] italic text-[#E0E0FF]"
        >
          {userData.design_philosophy}
        </motion.div>

        <motion.div
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: 'inset(0 0 0 0)' }}
          transition={{ delay: 1.3 }}
          className="mt-6 h-[1px] w-full max-w-[700px] bg-[#6366F1]"
        />

        <motion.div
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: 'inset(0 0 0 0)' }}
          transition={{ delay: 1.5 }}
          className="mt-5 font-jetbrains text-[11px] tracking-[0.2em] text-[#6366F1]"
        >
          TRANSMISSION COMPLETE
        </motion.div>

        {ready && (
          <button
            onClick={() => setWipe(true)}
            className="mt-4 bg-[#6366F1] px-6 py-3 font-inter text-[16px] tracking-[0.36em] text-white"
          >
            ENTER GESTALT
          </button>
        )}

        {wipe && (
          <motion.div
            className="absolute inset-0 z-20 bg-[#6366F1]"
            initial={{ clipPath: 'inset(0 100% 0 0)' }}
            animate={{ clipPath: 'inset(0 0 0 0)' }}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>
    </ScreenFrame>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentScreen, setCurrentScreen] = useState(0);
  const [userData, setUserData] = useState<UserData>(defaultUserData);
  const [skillLevels, setSkillLevels] = useState<SkillLevels>(initialSkillLevels);

  const progress = ((currentScreen + 1) / SCREEN_COUNT) * 100;

  const detectionScore = userData.problem_detection_score;

  const mergeUserData = (patch: Partial<UserData>) => {
    setUserData((prev) => ({ ...prev, ...patch }));
  };

  const handleIdentityComplete = (payload: Pick<UserData, 'name' | 'email'>) => {
    mergeUserData(payload);

    const existingUser = readJSON<UserData>('gestalt_user', defaultUserData);
    localStorage.setItem('gestalt_user', JSON.stringify({ ...existingUser, ...payload }));

    const existingProgress = readJSON('gestalt_progress', {
      userName: '',
      totalXP: 0,
      level: 1,
      streak: 0,
      completedGames: [] as string[],
      currentGame: 'G01',
      skillLevels: initialSkillLevels
    });
    localStorage.setItem('gestalt_progress', JSON.stringify({ ...existingProgress, userName: payload.name }));

    setCurrentScreen(1);
  };

  const completeFlow = () => {
    const quizResults = {
      score: detectionScore,
      totalQuestions: 12,
      skillLevels,
      completedAt: new Date().toISOString()
    };

    localStorage.setItem('gestalt_user', JSON.stringify(userData));
    localStorage.setItem('gestalt_quiz_results', JSON.stringify(quizResults));
    localStorage.setItem(
      'gestalt_progress',
      JSON.stringify({
        userName: userData.name,
        totalXP: 0,
        level: 1,
        streak: 0,
        completedGames: [],
        currentGame: 'G01',
        skillLevels
      })
    );

    navigate('/dashboard');
  };

  const counterText = `${String(currentScreen + 1).padStart(2, '0')} / 12`;

  const screen = useMemo(() => {
    if (currentScreen === 0) return <IdentityDrop onComplete={handleIdentityComplete} />;
    if (currentScreen === 1) return <DesignEraSelector onComplete={(data) => { mergeUserData(data); setCurrentScreen(2); }} />;
    if (currentScreen === 2) return <RoleConstellation onComplete={(data) => { mergeUserData(data); setCurrentScreen(3); }} />;
    if (currentScreen === 3) {
      return (
        <SkillHorizon
          onComplete={(data) => {
            setSkillLevels(data.skillLevels);
            setCurrentScreen(4);
          }}
        />
      );
    }
    if (currentScreen === 4) {
      return (
        <InstinctCanvas
          userName={userData.name}
          onComplete={(data) => {
            mergeUserData(data);
            setCurrentScreen(5);
          }}
        />
      );
    }
    if (currentScreen === 5) return <ColourFingerprint onComplete={(data) => { mergeUserData(data); setCurrentScreen(6); }} />;
    if (currentScreen === 6) return <SpeedCraftDial onComplete={(data) => { mergeUserData(data); setCurrentScreen(7); }} />;
    if (currentScreen === 7) {
      return (
        <BrokenUIGutCheck
          onComplete={(data) => {
            mergeUserData({ problem_detection_score: data.problem_detection_score });
            setSkillLevels((prev) => ({ ...prev, cognitive: data.cognitiveScore }));
            setCurrentScreen(8);
          }}
        />
      );
    }
    if (currentScreen === 8) return <GoalVault onComplete={(data) => { mergeUserData(data); setCurrentScreen(9); }} />;
    if (currentScreen === 9) return <TimeRitual onComplete={(data) => { mergeUserData(data); setCurrentScreen(10); }} />;
    if (currentScreen === 10) return <FirstPrinciple onComplete={(data) => { mergeUserData(data); setCurrentScreen(11); }} />;
    return <SignalTransmission userData={userData} skillLevels={skillLevels} onFinish={completeFlow} />;
  }, [currentScreen, userData, skillLevels]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#05060C] text-[#E0E0FF]">
      <AmbientBackdrop />

      <div className="absolute left-0 top-0 z-40 h-[2px] w-full bg-[#1A1D31]">
        <motion.div
          className="h-full bg-gradient-to-r from-[#6366F1] to-[#38BDF8]"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.2 }}
        />
      </div>

      <div className="absolute right-5 top-4 z-40 font-jetbrains text-[12px] tracking-[0.14em] text-[#E0E0FF]">{counterText}</div>

      <div className="relative z-10 h-full w-full">
        <AnimatePresence mode="wait">{screen}</AnimatePresence>
      </div>
    </div>
  );
}