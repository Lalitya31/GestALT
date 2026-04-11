import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Settings, Unlock } from 'lucide-react';

interface DashboardSettings {
  soundFx: boolean;
  compactMode: boolean;
  reducedMotion: boolean;
}

interface Progress {
  completedGames: string[];
  currentGame: string;
  totalXP: number;
  level: number;
  streak: number;
  skillLevels?: Record<string, number>;
}

interface QuizResults {
  skillLevels?: Record<string, number>;
}

type NavId = 'dashboard' | 'gestalt' | 'cognitive' | 'typography' | 'color' | 'interaction' | 'strategy';

interface GameNode {
  id: string;
  title: string;
  principle: string;
  cluster: Exclude<NavId, 'dashboard'>;
  path: string;
}

const navItems: Array<{ id: NavId; label: string; subtitle: string }> = [
  { id: 'dashboard', label: 'Dashboard', subtitle: 'Overview' },
  { id: 'gestalt', label: 'Gestalt Laws', subtitle: 'G1-G5' },
  { id: 'cognitive', label: 'Cognitive Load', subtitle: 'G6-G10' },
  { id: 'typography', label: 'Typography', subtitle: 'G11-G13' },
  { id: 'color', label: 'Color Theory', subtitle: 'G14-G15' },
  { id: 'interaction', label: 'Interaction', subtitle: 'G16-G18' },
  { id: 'strategy', label: 'UX Strategy', subtitle: 'G19-G20' }
];

const nodes: GameNode[] = [
  { id: 'G01', title: 'Whitespace Simulator', principle: 'Law of Proximity', cluster: 'gestalt', path: '/whitespace-sim' },
  { id: 'G02', title: 'Similarity Engine', principle: 'Law of Similarity', cluster: 'gestalt', path: '/similarity' },
  { id: 'G03', title: 'Closure Puzzle', principle: 'Law of Closure', cluster: 'gestalt', path: '/closure-puzzle' },
  { id: 'G04', title: 'Figure Ground Arena', principle: 'Figure-Ground', cluster: 'gestalt', path: '/figure-ground' },
  { id: 'G05', title: 'Continuity River', principle: 'Law of Continuity', cluster: 'gestalt', path: '/continuity' },
  { id: 'G06', title: 'Load Reducer', principle: 'Cognitive Load', cluster: 'cognitive', path: '/cognitive-load' },
  { id: 'G07', title: 'Mental Model Mapper', principle: 'Mental Models', cluster: 'cognitive', path: '/mega-menu' },
  { id: 'G08', title: "Hick's Law Duel", principle: 'Decision Complexity', cluster: 'cognitive', path: '/hicks-law' },
  { id: 'G09', title: "Fitts' Law Forge", principle: 'Target Acquisition', cluster: 'cognitive', path: '/mobile-tab' },
  { id: 'G10', title: 'Feedback Loop', principle: 'Response Clarity', cluster: 'cognitive', path: '/button-logic' },
  { id: 'G11', title: 'Type Hierarchy Sculptor', principle: 'Visual Hierarchy', cluster: 'typography', path: '/visual-hierarchy' },
  { id: 'G12', title: 'Rhythm and Baseline', principle: 'Typographic Rhythm', cluster: 'typography', path: '/typo-scale' },
  { id: 'G13', title: 'Information Architect', principle: 'Structural Layout', cluster: 'typography', path: '/grid-master' },
  { id: 'G14', title: 'Semantic Color Lab', principle: 'Color Semantics', cluster: 'color', path: '/semantic-color' },
  { id: 'G15', title: 'Accessibility Auditor', principle: 'Inclusive Design', cluster: 'color', path: '/accessibility' },
  { id: 'G16', title: 'Contrast Mixer', principle: 'Visual Contrast', cluster: 'interaction', path: '/contrast-mixer' },
  { id: 'G17', title: 'Responsive Command', principle: 'Adaptive Systems', cluster: 'interaction', path: '/responsive-design' },
  { id: 'G18', title: 'Layering Control', principle: 'Depth Management', cluster: 'interaction', path: '/z-index-layering' },
  { id: 'G19', title: 'Flexbox Sandbox', principle: 'Flow Architecture', cluster: 'strategy', path: '/flexbox-sandbox' },
  { id: 'G20', title: 'The Architect', principle: 'Holistic Integration', cluster: 'strategy', path: '/final-boss' }
];

const skillMeta = [
  { key: 'gestalt', label: 'GESTALT', color: '#6366F1' },
  { key: 'cognitive', label: 'COGNITIVE', color: '#4ADE80' },
  { key: 'typography', label: 'TYPOGRAPHY', color: '#F59E0B' },
  { key: 'color', label: 'COLOR', color: '#EF4444' },
  { key: 'interaction', label: 'INTERACTION', color: '#E0E0FF' },
  { key: 'strategy', label: 'STRATEGY', color: '#6366F1' }
] as const;

function safeJSON<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function clamp(v: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, v));
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [activeNav, setActiveNav] = useState<NavId>('dashboard');
  const [search, setSearch] = useState('');
  const [userName, setUserName] = useState('Designer');
  const [tooltip, setTooltip] = useState<{ id: string; text: string } | null>(null);
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const [dashboardSettings, setDashboardSettings] = useState<DashboardSettings>({
    soundFx: true,
    compactMode: false,
    reducedMotion: false
  });

  const [progress, setProgress] = useState<Progress>({
    completedGames: [],
    currentGame: 'G01',
    totalXP: 0,
    level: 1,
    streak: 0,
    skillLevels: {}
  });

  const [quizResults, setQuizResults] = useState<QuizResults>({ skillLevels: {} });
  const [animatedStats, setAnimatedStats] = useState({ xp: 0, completed: 0, avg: 0, streak: 0 });

  const loadDashboardState = useCallback(() => {
    const defaultProgress: Progress = {
      completedGames: [],
      currentGame: 'G01',
      totalXP: 0,
      level: 1,
      streak: 0,
      skillLevels: {
        gestalt: 10,
        cognitive: 10,
        typography: 10,
        color: 10,
        interaction: 10,
        strategy: 10
      }
    };
    const parsedProgress = safeJSON<Progress>(localStorage.getItem('gestalt_progress'), defaultProgress);
    setProgress({ ...defaultProgress, ...parsedProgress, completedGames: parsedProgress.completedGames ?? [] });

    const parsedQuiz = safeJSON<QuizResults>(localStorage.getItem('gestalt_quiz_results'), { skillLevels: {} });
    setQuizResults(parsedQuiz);

    const user = safeJSON<{ name?: string }>(localStorage.getItem('gestalt_user'), {});
    if (user.name) setUserName(user.name);

    const settingsData = safeJSON<DashboardSettings>(
      localStorage.getItem('gestalt_dashboard_settings'),
      { soundFx: true, compactMode: false, reducedMotion: false }
    );
    setDashboardSettings(settingsData);
  }, []);

  useEffect(() => {
    loadDashboardState();
    const handleRefresh = () => loadDashboardState();
    window.addEventListener('focus', handleRefresh);
    window.addEventListener('pageshow', handleRefresh);
    window.addEventListener('popstate', handleRefresh);
    window.addEventListener('storage', handleRefresh);
    return () => {
      window.removeEventListener('focus', handleRefresh);
      window.removeEventListener('pageshow', handleRefresh);
      window.removeEventListener('popstate', handleRefresh);
      window.removeEventListener('storage', handleRefresh);
    };
  }, [loadDashboardState]);

  const scoreMap = useMemo(() => {
    const keyCandidates = [
      'gestalt_game_scores',
      'cognitive_game_scores',
      'typography_game_scores',
      'color_game_scores',
      'interaction_game_scores',
      'strategy_game_scores',
      'gestalt_scores'
    ];
    const combined: Record<string, number> = {};
    keyCandidates.forEach((k) => {
      const parsed = safeJSON<Record<string, number | { score?: number }>>(localStorage.getItem(k), {});
      Object.entries(parsed).forEach(([id, val]) => {
        const score = typeof val === 'number' ? val : typeof val?.score === 'number' ? val.score : undefined;
        if (typeof score === 'number') combined[id.toUpperCase()] = clamp(Math.round(score));
      });
    });
    return combined;
  }, [progress.totalXP, progress.completedGames.length]);

  const skillLevels = useMemo(() => {
    const base = {
      gestalt: 10,
      cognitive: 10,
      typography: 10,
      color: 10,
      interaction: 10,
      strategy: 10
    };
    return {
      ...base,
      ...(quizResults.skillLevels ?? {}),
      ...(progress.skillLevels ?? {})
    };
  }, [progress.skillLevels, quizResults.skillLevels]);

  const avgScore = useMemo(() => {
    const vals = Object.values(scoreMap);
    if (!vals.length) return 0;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [scoreMap]);

  useEffect(() => {
    const target = {
      xp: progress.totalXP,
      completed: progress.completedGames.length,
      avg: avgScore,
      streak: progress.streak
    };
    const duration = 800;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedStats({
        xp: Math.round(target.xp * eased),
        completed: Math.round(target.completed * eased),
        avg: Math.round(target.avg * eased),
        streak: Math.round(target.streak * eased)
      });
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [progress.totalXP, progress.completedGames.length, progress.streak, avgScore]);

  const gameState = useCallback((node: GameNode) => {
    const completed = progress.completedGames.includes(node.id);
    const available = true;
    const locked = false;
    return { completed, available, locked };
  }, [progress.completedGames]);

  const filteredGrid = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return nodes.filter((node) => {
      const byNav = activeNav === 'dashboard' ? true : node.cluster === activeNav;
      if (!byNav) return false;
      if (!needle) return true;
      return (
        node.id.toLowerCase().includes(needle) ||
        node.title.toLowerCase().includes(needle) ||
        node.principle.toLowerCase().includes(needle)
      );
    });
  }, [activeNav, search]);

  const continueGames = useMemo(() => {
    const current = nodes.find((n) => n.id === progress.currentGame);
    const available = nodes.filter((node) => gameState(node).available);
    const ordered = [current, ...available].filter(Boolean) as GameNode[];
    const uniq = ordered.filter((node, idx) => ordered.findIndex((x) => x.id === node.id) === idx);
    return uniq.slice(0, 3);
  }, [gameState, progress.currentGame]);

  const recommendedGames = useMemo(() => {
    const weakest = [...skillMeta].sort((a, b) => (skillLevels[a.key] ?? 10) - (skillLevels[b.key] ?? 10)).slice(0, 2);
    return weakest.map((s) => {
      const pick = nodes.find((n) => n.cluster === (s.key === 'strategy' ? 'strategy' : s.key)) ?? nodes[0];
      return {
        ...pick,
        reason: `You can improve ${s.label.toLowerCase()} by practicing this mission next.`
      };
    });
  }, [skillLevels]);

  const bestSkill = useMemo(() => {
    const sorted = [...skillMeta].sort((a, b) => (skillLevels[b.key] ?? 10) - (skillLevels[a.key] ?? 10));
    const top = sorted[0];
    return { label: top.label, value: Math.round(skillLevels[top.key] ?? 10) };
  }, [skillLevels]);

  const nextMilestone = Math.max(0, (progress.level * 1000) - progress.totalXP);
  const levelProgress = clamp(((progress.totalXP % 1000) / 1000) * 100);
  const notifications = useMemo(() => {
    const defaults = [
      'You unlocked Game G07 - Mental Model Mapper',
      'Your Cognitive score improved by 12%',
      `${progress.streak} day streak - keep going!`,
      `${nextMilestone} XP to reach Level ${progress.level + 1}`
    ];
    const fromStore = safeJSON<string[]>(localStorage.getItem('gestalt_notifications'), []);
    return (Array.isArray(fromStore) && fromStore.length ? fromStore : defaults).slice(0, 5);
  }, [progress.level, progress.streak, nextMilestone]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const launchGame = (node: GameNode) => {
    sessionStorage.setItem('activeGame', node.id);
    navigate(node.path);
  };

  const onTileClick = (node: GameNode) => {
    const state = gameState(node);
    if (state.locked) {
      setShakeId(node.id);
      setTooltip({ id: node.id, text: 'Complete previous game first' });
      window.setTimeout(() => setShakeId(null), 350);
      window.setTimeout(() => setTooltip((t) => (t?.id === node.id ? null : t)), 1300);
      return;
    }
    launchGame(node);
  };

  return (
    <div className="h-full w-full overflow-hidden bg-[#080808] text-[#E0E0FF]">
      <div className="flex h-full w-full">
        <aside className="hidden h-full w-[220px] shrink-0 border-r border-[#1E1E1E] bg-[#0D0D0D] lg:flex lg:flex-col">
          <div className="border-b border-[#1E1E1E] px-5 py-5">
            <h1 className="font-fraunces text-[24px] text-white">GestALT</h1>
            <p className="font-fraunces text-[16px] text-[#9FA6FF]">LEARN UI/UX</p>
            <div className="mt-5 flex items-center gap-3 border border-[#1E1E1E] bg-[#111111] px-3 py-2">
              <div className="flex h-9 w-9 items-center justify-center border border-[#2A2A2A] bg-[#0B0B0B] font-jetbrains text-[12px] text-[#6366F1]">
                {userName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-[13px] font-medium text-white">{userName}</p>
                <p className="font-jetbrains text-[11px] text-[#4ADE80]">LV.{String(progress.level).padStart(2, '0')}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-0 py-2">
            {navItems.map((item) => {
              const active = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={`relative flex h-[44px] w-full items-center justify-between border-l-2 px-4 text-left transition-transform hover:translate-x-[2px] ${active ? 'border-l-[#6366F1] bg-[#111111] text-[#6366F1]' : 'border-l-transparent text-[#B9B9D6] hover:border-l-[#6366F1] hover:bg-[#111111]'}`}
                >
                  <span className="text-[13px]">{item.label}</span>
                  <span className="font-jetbrains text-[10px] text-[#77779A]">{item.subtitle}</span>
                </button>
              );
            })}
          </nav>

          <div className="border-t border-[#1E1E1E] px-4 py-4">
            <div className="mb-1 flex items-center justify-between text-[11px] text-[#A9AAD0]">
              <span className="font-jetbrains">LV.{String(progress.level).padStart(2, '0')} -&gt; LV.{String(progress.level + 1).padStart(2, '0')}</span>
            </div>
            <div className="h-2 border border-[#2A2A2A] bg-[#0B0B0B]">
              <div className="h-full bg-[#6366F1]" style={{ width: `${Math.max(3, levelProgress)}%` }} />
            </div>
            <div className="mt-3 flex items-center justify-between text-[12px]">
              <span className="font-jetbrains text-[#F59E0B]">🔥 {progress.streak} day streak</span>
              <button onClick={() => setSettingsOpen(true)} className="border border-[#2A2A2A] bg-[#111111] p-1.5 text-[#D8D9FF]">
                <Settings size={14} />
              </button>
            </div>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="h-16 border-b border-[#1E1E1E] bg-[#080808] px-4 lg:px-6">
            <div className="flex h-full items-center justify-between gap-3">
              <h2 className="font-fraunces text-[24px] text-white">Dashboard</h2>

              <div className="hidden items-center gap-2 xl:flex">
                <div className="border border-[#2A2A2A] bg-[#111111] px-3 py-1.5 font-jetbrains text-[12px]">{animatedStats.xp.toLocaleString()} XP</div>
                <div className="border border-[#2A2A2A] bg-[#111111] px-3 py-1.5 font-jetbrains text-[12px]">{animatedStats.completed} / 20 Games</div>
                <div className="border border-[#2A2A2A] bg-[#111111] px-3 py-1.5 font-jetbrains text-[12px]">{animatedStats.avg}% Avg Score</div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 border border-[#2A2A2A] bg-[#111111] px-2.5 py-1.5">
                  <Search size={14} className="text-[#9FA6FF]" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search games"
                    className="w-[150px] bg-transparent text-[12px] text-white outline-none placeholder:text-[#73739A] sm:w-[200px]"
                  />
                </div>
                <div ref={notifRef} className="relative">
                  <button onClick={() => setShowNotifications((prev) => !prev)} className="relative border border-[#2A2A2A] bg-[#111111] p-2 text-[#D7D8FF]">
                    <Bell size={14} />
                    {!showNotifications && <span className="absolute right-1 top-1 h-1.5 w-1.5 bg-[#EF4444]" />}
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 top-full mt-2 w-[280px] z-[1000] border border-[#1E1E1E] bg-[#111111]">
                      {notifications.map((item, idx) => (
                        <div key={`${item}-${idx}`} className="h-[44px] border-b border-[#1E1E1E] px-3 py-2 text-[13px] text-[#E0E0FF] last:border-b-0">
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex h-8 w-8 items-center justify-center border border-[#2A2A2A] bg-[#111111] font-jetbrains text-[11px] text-[#6366F1]">
                  {userName.slice(0, 2).toUpperCase()}
                </div>
              </div>
            </div>
          </header>

          <section className="min-h-0 flex-1 overflow-y-auto bg-[#080808] p-4 lg:p-6">
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-4">
              <div className="h-[120px] border border-[#1E1E1E] bg-[#111111] p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#8A8DB8]">TOTAL XP</p>
                <p className="mt-2 font-jetbrains text-[40px] leading-none text-white">{animatedStats.xp.toLocaleString()}</p>
                <p className="mt-2 font-jetbrains text-[11px] text-[#4ADE80]">+120 today</p>
              </div>
              <div className="h-[120px] border border-[#1E1E1E] bg-[#111111] p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#8A8DB8]">GAMES COMPLETE</p>
                <p className="mt-2 font-jetbrains text-[40px] leading-none text-white">{animatedStats.completed} / 20</p>
                <div className="mt-3 h-2 border border-[#2A2A2A] bg-[#0D0D0D]">
                  <div className="h-full bg-[#6366F1]" style={{ width: `${(animatedStats.completed / 20) * 100}%` }} />
                </div>
              </div>
              <div className="h-[120px] border border-[#1E1E1E] bg-[#111111] p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#8A8DB8]">CURRENT STREAK</p>
                <p className="mt-2 font-jetbrains text-[40px] leading-none text-white">{animatedStats.streak} DAYS</p>
                <p className="mt-2 text-[12px] text-[#F59E0B]">🔥 Momentum rising</p>
              </div>
              <div className="h-[120px] border border-[#1E1E1E] bg-[#111111] p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#8A8DB8]">BEST SKILL</p>
                <p className="mt-2 font-fraunces text-[34px] uppercase leading-none text-white">{bestSkill.label}</p>
                <p className="mt-2 font-jetbrains text-[12px] text-[#4ADE80]">{bestSkill.value}%</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[65%_35%]">
              <div className="border border-[#1E1E1E] bg-[#111111] p-4">
                <p className="font-jetbrains text-[11px] uppercase tracking-[0.3em] text-[#6366F1]">CONTINUE LEARNING</p>
                <div className="mt-3 space-y-2">
                  {continueGames.map((node) => {
                    const state = gameState(node);
                    const score = scoreMap[node.id] ?? Math.max(58, avgScore);
                    return (
                      <div key={node.id} className="group grid h-[100px] grid-cols-[88px_1fr_130px] border border-[#1E1E1E] bg-[#111111] transition-transform hover:translate-x-[2px] hover:border-l-2 hover:border-l-[#6366F1] hover:bg-[#141414]">
                        <div className="flex items-center justify-center font-jetbrains text-[28px] text-[#6366F1]">{node.id}</div>
                        <div className="flex flex-col justify-center pr-2">
                          <p className="font-fraunces text-[20px] text-white">{node.title}</p>
                          <p className="text-[13px] text-[#E0E0FF]">{node.principle}</p>
                          <div className="mt-2 h-1.5 border border-[#2A2A2A] bg-[#0D0D0D]">
                            <div className="h-full bg-[#6366F1]" style={{ width: `${Math.min(100, (score / 100) * 100)}%` }} />
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-center pr-4">
                          <p className="font-jetbrains text-[32px] leading-none text-white">{score}%</p>
                          <button
                            onClick={() => launchGame(node)}
                            disabled={state.locked}
                            className="mt-2 border border-[#2A2A2A] bg-[#6366F1] px-2.5 py-1 font-jetbrains text-[11px] text-white disabled:cursor-not-allowed disabled:bg-[#2A2A2A]"
                          >
                            RESUME -&gt;
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border border-[#1E1E1E] bg-[#111111] p-4">
                <p className="font-jetbrains text-[11px] uppercase tracking-[0.3em] text-[#6366F1]">SKILL LEVELS</p>
                <div className="mt-4 space-y-3">
                  {skillMeta.map((skill, index) => {
                    const value = clamp(Math.round(skillLevels[skill.key] ?? 10));
                    return (
                      <div key={skill.key}>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-[12px] text-[#C6C8F2]">{skill.label}</span>
                          <span className="font-jetbrains text-[12px] text-white">{value}%</span>
                        </div>
                        <div className="h-2 border border-[#2A2A2A] bg-[#0D0D0D]">
                          <motion.div
                            className="h-full"
                            style={{ background: skill.color }}
                            initial={{ width: 0, clipPath: 'inset(0 100% 0 0)' }}
                            animate={{ width: `${value}%`, clipPath: 'inset(0 0% 0 0)' }}
                            transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[40%_60%]">
              <div className="border border-[#1E1E1E] bg-[#111111] p-4">
                <p className="font-jetbrains text-[11px] uppercase tracking-[0.3em] text-[#6366F1]">RECOMMENDED FOR YOU</p>
                <div className="mt-3 space-y-2">
                  {recommendedGames.map((node) => {
                    const state = gameState(node);
                    return (
                      <div key={node.id} className="border border-[#1E1E1E] bg-[#0D0D0D] p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-fraunces text-[18px] text-white">{node.title}</p>
                            <p className="mt-1 text-[12px] text-[#B6B8D9]">{node.reason}</p>
                          </div>
                          <span className="border border-[#2A2A2A] bg-[#111111] p-1 text-[#4ADE80]">
                            <Unlock size={12} />
                          </span>
                        </div>
                        <button
                          onClick={() => launchGame(node)}
                          disabled={state.locked}
                          className="mt-3 border border-[#2A2A2A] bg-[#6366F1] px-3 py-1.5 font-jetbrains text-[11px] text-white disabled:bg-[#2A2A2A]"
                        >
                          START -&gt;
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border border-[#1E1E1E] bg-[#111111] p-4">
                <p className="font-jetbrains text-[11px] uppercase tracking-[0.3em] text-[#6366F1]">ALL 20 GAMES</p>
                <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-5">
                  {filteredGrid.map((node) => {
                    const state = gameState(node);
                    const score = scoreMap[node.id];
                    const leftBorder = state.completed ? '#4ADE80' : state.available ? '#6366F1' : '#2A2A2A';
                    return (
                      <motion.button
                        key={node.id}
                        onClick={() => onTileClick(node)}
                        animate={shakeId === node.id ? { x: [0, -6, 6, -5, 5, 0] } : { x: 0 }}
                        transition={{ duration: 0.32 }}
                        className={`relative h-[78px] border border-[#1E1E1E] bg-[#0D0D0D] px-2 py-1.5 text-left ${state.available ? 'hover:bg-[#141420]' : 'text-[#444444]'}`}
                        style={{ borderLeft: `3px solid ${leftBorder}` }}
                      >
                        <div className="font-jetbrains text-[10px] text-[#A3A7D4]">{node.id}</div>
                        <div className="mt-1 line-clamp-2 text-[12px] text-inherit">{node.title}</div>
                        {state.completed && typeof score === 'number' && (
                          <div className="absolute bottom-1.5 right-2 font-jetbrains text-[11px] text-[#E0E0FF]">{score}%</div>
                        )}
                        {tooltip?.id === node.id && (
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 border border-[#2A2A2A] bg-[#111111] px-2 py-1 font-jetbrains text-[10px] text-[#E0E0FF]">
                            {tooltip.text}
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-4 grid h-[80px] grid-cols-1 border border-[#1E1E1E] bg-[#0D0D0D] md:grid-cols-4">
              <div className="flex items-center border-b border-[#1E1E1E] px-3 text-[12px] md:border-b-0 md:border-r">
                💪 STRENGTH: <span className="ml-2 font-jetbrains">Gestalt Laws - {Math.max(10, skillLevels.gestalt)}% avg</span>
              </div>
              <div className="flex items-center border-b border-[#1E1E1E] px-3 text-[12px] md:border-b-0 md:border-r">
                📈 IMPROVING: <span className="ml-2 font-jetbrains">Cognitive Load - +12% this week</span>
              </div>
              <div className="flex items-center border-b border-[#1E1E1E] px-3 text-[12px] md:border-b-0 md:border-r">
                🎯 FOCUS: <span className="ml-2 font-jetbrains">Typography - needs work</span>
              </div>
              <div className="flex items-center px-3 text-[12px]">
                ⚡ NEXT MILESTONE: <span className="ml-2 font-jetbrains">{nextMilestone} XP to Level {progress.level + 1}</span>
              </div>
            </div>
          </section>
        </main>
      </div>

      {settingsOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-[420px] border border-[#1E1E1E] bg-[#0D0D0D] p-4">
            <h3 className="font-fraunces text-[24px] text-white">Settings</h3>
            <div className="mt-3 space-y-2">
              {[
                { key: 'soundFx', label: 'Sound FX' },
                { key: 'compactMode', label: 'Compact Mode' },
                { key: 'reducedMotion', label: 'Reduced Motion' }
              ].map((item) => {
                const key = item.key as keyof DashboardSettings;
                return (
                  <label key={item.key} className="flex items-center justify-between border border-[#1E1E1E] bg-[#111111] px-3 py-2 text-[13px]">
                    <span>{item.label}</span>
                    <input
                      type="checkbox"
                      checked={dashboardSettings[key]}
                      onChange={(e) => setDashboardSettings((prev) => ({ ...prev, [key]: e.target.checked }))}
                    />
                  </label>
                );
              })}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setSettingsOpen(false)} className="border border-[#2A2A2A] bg-[#111111] px-3 py-1.5 text-[12px]">
                Cancel
              </button>
              <button
                onClick={() => {
                  localStorage.setItem('gestalt_dashboard_settings', JSON.stringify(dashboardSettings));
                  setSettingsOpen(false);
                }}
                className="border border-[#2A2A2A] bg-[#6366F1] px-3 py-1.5 font-jetbrains text-[12px]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
