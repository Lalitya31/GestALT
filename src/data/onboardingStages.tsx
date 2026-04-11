import { ChevronDown, Bell, User, Settings } from 'lucide-react';

export interface StageOption {
  id: number;
  content: React.ReactNode;
  isCorrect: boolean;
  issues?: string[];
}

export interface StageReason {
  id: number;
  text: string;
  correct: boolean;
}

export interface AssessmentStage {
  title: string;
  subtitle: string;
  principle: string;
  explanation: string;
  options: StageOption[];
  reasons: StageReason[];
}

export const onboardingStages: AssessmentStage[] = [
  // STAGE 1: Fitts' Law (The original registration form)
  {
    title: "Which form follows best practices?",
    subtitle: "Click the design that minimizes cognitive load and maximizes accessibility.",
    principle: "Fitts' Law & Accessibility",
    explanation: "Larger touch targets, clear labels, good contrast, and appropriate spacing reduce cognitive load and errors.",
    options: [
      {
        id: 1,
        content: (
          <div className="space-y-1 p-2 w-full text-left font-sans">
            <input type="text" placeholder="email" className="w-full text-xs p-1 border border-white/10 rounded bg-white/5 text-white" />
            <input type="password" placeholder="password" className="w-full text-xs p-1 border border-white/10 rounded bg-white/5 text-white" />
            <button className="w-full text-xs p-1 bg-white/10 rounded text-white/50 font-semibold mt-1">login</button>
          </div>
        ),
        isCorrect: false,
        issues: ['Poor contrast', 'Small touch targets', 'No labels']
      },
      {
        id: 2,
        content: (
          <div className="space-y-1 w-full text-left font-sans">
            <div className="text-[10px] text-white/70">Email</div>
            <input type="text" className="w-full text-[10px] p-0.5 border border-white/20 rounded bg-white/10 text-white" />
            <div className="text-[10px] text-white/70">Password</div>
            <input type="password" className="w-full text-[10px] p-0.5 border border-white/20 rounded bg-white/10 text-white" />
            <button className="w-full text-[10px] p-0.5 bg-white/20 rounded text-white font-semibold mt-2">Submit</button>
          </div>
        ),
        isCorrect: false,
        issues: ['Text too small', 'Touch targets too small']
      },
      {
        id: 3,
        content: (
          <div className="w-full text-left font-sans flex flex-col items-center">
            <input type="text" placeholder="email/username/phone" className="w-[80%] text-sm p-1.5 border border-white/20 rounded-md bg-white/10 text-white placeholder:text-white/40 mb-2" />
            <input type="password" placeholder="password" className="w-[80%] text-sm p-1.5 border border-white/20 rounded-md bg-white/10 text-white mb-2" />
            <button className="w-[80%] text-sm p-1.5 bg-white/20 rounded-md text-white font-bold mt-1">GO</button>
          </div>
        ),
        isCorrect: false,
        issues: ['Ambiguous placeholder', 'Poor button label', 'Inconsistent widths']
      },
      {
        id: 4,
        content: (
          <div className="w-full space-y-3 text-left font-sans p-2">
            <div>
              <label className="block text-sm font-semibold mb-1 text-white/90">Email</label>
              <input type="email" className="w-full p-2.5 bg-white/5 border border-white/20 rounded-lg text-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-white/90">Password</label>
              <input type="password" className="w-full p-2.5 bg-white/5 border border-white/20 rounded-lg text-white" />
            </div>
            <button className="w-full mt-2 p-3 bg-indigo-500 hover:bg-indigo-600 focus:ring-4 ring-indigo-500/30 text-white font-bold rounded-lg transition-colors">
              Sign In
            </button>
          </div>
        ),
        isCorrect: true,
      }
    ],
    reasons: [
      { id: 1, text: 'It has extremely complex animations', correct: false },
      { id: 2, text: 'It uses 44px+ touch targets and clear contrast', correct: true },
      { id: 3, text: 'It hides labels to save space', correct: false },
      { id: 4, text: 'It uses multiple colors for every input field', correct: false }
    ]
  },
  
  // STAGE 2: Law of Proximity
  {
    title: "Which layout properly associates elements?",
    subtitle: "Select the card where spacing indicates relationship.",
    principle: "Law of Proximity",
    explanation: "Elements that are close together are perceived as related. Grouping related UI elements reduces cognitive load.",
    options: [
      {
        id: 1,
        content: (
          <div className="w-full h-full flex flex-col justify-between py-6 px-4">
            <div className="h-4 w-1/3 bg-white/20 rounded" />
            <div className="h-10 w-full bg-white/10 border border-white/20 rounded" />
            <div className="h-4 w-1/3 bg-white/20 rounded" />
            <div className="h-10 w-full bg-white/10 border border-white/20 rounded" />
          </div>
        ),
        isCorrect: false,
        issues: ['Labels are equidistant from all inputs', 'Ambiguous relationships']
      },
      {
        id: 2,
        content: (
          <div className="w-full h-full flex flex-col justify-center gap-6 p-4">
            <div className="space-y-1">
              <div className="h-4 w-1/3 bg-white/80 rounded" />
              <div className="h-10 w-full bg-white/10 border border-white/20 rounded" />
            </div>
            <div className="space-y-1">
              <div className="h-4 w-1/3 bg-white/80 rounded" />
              <div className="h-10 w-full bg-white/10 border border-white/20 rounded" />
            </div>
          </div>
        ),
        isCorrect: true,
      },
      {
        id: 3,
        content: (
          <div className="w-full h-full flex flex-col justify-start gap-2 p-4">
            <div className="h-4 w-1/3 bg-white/20 rounded" />
            <div className="h-4 w-1/3 bg-white/20 rounded" />
            <div className="h-10 w-full bg-white/10 border border-white/20 rounded" />
            <div className="h-10 w-full bg-white/10 border border-white/20 rounded" />
          </div>
        ),
        isCorrect: false,
        issues: ['Grouped labels away from inputs', 'Forces eye movement']
      },
      {
        id: 4,
        content: (
          <div className="w-full h-full flex flex-col justify-center p-4 relative">
             <div className="absolute top-4 left-4 h-4 w-1/3 bg-white/20 rounded" />
             <div className="h-10 w-full bg-white/10 border border-white/20 rounded mt-4" />
             <div className="absolute bottom-16 right-4 h-4 w-1/3 bg-white/20 rounded" />
             <div className="h-10 w-full bg-white/10 border border-white/20 rounded mt-8" />
          </div>
        ),
        isCorrect: false,
        issues: ['Chaotic spacing', 'No discernible alignment']
      }
    ],
    reasons: [
      { id: 1, text: 'The labels and inputs are packed tightly in one block', correct: false },
      { id: 2, text: 'Spacing perfectly separates distinct form fields', correct: true },
      { id: 3, text: 'Elements are perfectly symmetrical', correct: false },
    ]
  },

  // STAGE 3: Visual Hierarchy
  {
    title: "Which card demonstrates strong hierarchy?",
    subtitle: "Select the layout that guides the eye naturally from most to least important.",
    principle: "Visual Hierarchy",
    explanation: "Size, weight, and color contrast should be used to establish reading order. Without it, everything fights for attention.",
    options: [
      {
        id: 1,
        content: (
          <div className="w-full space-y-2 text-left p-4">
            <p className="text-white text-sm">March 25, 2026</p>
            <p className="text-white text-sm">New GestALT Update Released</p>
            <p className="text-white text-sm">The highly anticipated curriculum expansion has finally dropped.</p>
            <p className="text-white text-sm">Read more...</p>
          </div>
        ),
        isCorrect: false,
        issues: ['Monotone weight', 'No size variation', 'Flat reading path']
      },
      {
        id: 2,
        content: (
          <div className="w-full space-y-2 text-left p-4">
            <h2 className="text-3xl font-bold text-white leading-tight">New GestALT Update Released</h2>
            <p className="text-xs uppercase tracking-widest text-primary font-bold">March 25, 2026</p>
            <p className="text-sm text-white/60 leading-relaxed">The highly anticipated curriculum expansion has finally dropped today.</p>
            <button className="text-xs font-bold text-white bg-white/10 px-4 py-2 rounded-full mt-2">Read Article</button>
          </div>
        ),
        isCorrect: true,
      },
      {
        id: 3,
        content: (
          <div className="w-full space-y-2 text-left p-4">
            <p className="text-3xl font-bold text-white/40">New GestALT Update</p>
            <h2 className="text-3xl font-bold text-white">Read more...</h2>
            <p className="text-xl text-primary">March 25, 2026</p>
          </div>
        ),
        isCorrect: false,
        issues: ['Inverted hierarchy', 'Action is larger than headline']
      },
      {
        id: 4,
        content: (
          <div className="w-full space-y-4 text-center p-4">
             <div className="w-full h-12 bg-gradient-to-r from-red-500 to-blue-500 rounded" />
             <h3 className="text-lg bg-white text-black font-black p-2 rounded">BREAKING NEWS</h3>
             <p className="text-xs text-white">Click here</p>
          </div>
        ),
        isCorrect: false,
        issues: ['Overwhelming visual noise', 'Conflicting focal points']
      }
    ],
    reasons: [
      { id: 1, text: 'It uses 4 different unrelated colors', correct: false },
      { id: 2, text: 'The headline is the largest and heaviest element', correct: true },
      { id: 3, text: 'Every element is centered', correct: false }
    ]
  },

  // STAGE 4: Hick's Law
  {
    title: "Which navigation reduces decision time?",
    subtitle: "Identify the menu that minimizes cognitive overload.",
    principle: "Hick's Law",
    explanation: "The more options, the longer the decision time. Breaking choices into categories speeds up cognition.",
    options: [
      {
        id: 1,
        content: (
          <div className="flex flex-wrap gap-2 p-2">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="text-[9px] bg-white/5 border border-white/10 px-2 py-1 rounded">Option {i}</div>
            ))}
          </div>
        ),
        isCorrect: false,
        issues: ['Too many flat choices', 'Overwhelming array']
      },
      {
        id: 2,
        content: (
          <div className="w-full flex justify-between p-4 border border-white/20 rounded bg-white/5">
             <div className="flex items-center gap-1 text-xs text-white/80"><Settings size={14} /> Settings</div>
             <div className="flex items-center gap-1 text-xs text-white/80"><User size={14} /> Profile</div>
             <div className="flex items-center gap-1 text-xs text-white/80"><Bell size={14} /> Alerts</div>
          </div>
        ),
        isCorrect: true,
      },
      {
        id: 3,
        content: (
          <div className="w-full grid grid-cols-2 gap-2 p-2">
             <div className="bg-red-500/20 text-red-500 text-[10px] p-2 text-center rounded">Action</div>
             <div className="bg-blue-500/20 text-blue-500 text-[10px] p-2 text-center rounded">Action</div>
             <div className="bg-green-500/20 text-green-500 text-[10px] p-2 text-center rounded">Action</div>
             <div className="bg-yellow-500/20 text-yellow-500 text-[10px] p-2 text-center rounded">Action</div>
             <div className="bg-purple-500/20 text-purple-500 text-[10px] p-2 text-center rounded">Action</div>
             <div className="bg-pink-500/20 text-pink-500 text-[10px] p-2 text-center rounded">Action</div>
          </div>
        ),
        isCorrect: false,
        issues: ['Irrelevant color coding', 'Grid noise']
      },
      {
        id: 4,
        content: (
          <div className="w-full flex items-center justify-between p-4 border-b border-white/20">
            <span className="text-xl font-bold">MENU</span>
            <ChevronDown />
          </div>
        ),
        isCorrect: false,
        issues: ['Hides core options entirely', 'Requires interaction to discover']
      }
    ],
    reasons: [
      { id: 1, text: 'It groups elements under intuitive icons', correct: true },
      { id: 2, text: 'It displays all 12 options at once', correct: false },
      { id: 3, text: 'It hides everything inside a hamburger menu', correct: false }
    ]
  },

  // STAGE 5: Color Contrast (Accessibility)
  {
    title: "Which banner passes WCAG AA?",
    subtitle: "Select the component with at least a 4.5:1 contrast ratio.",
    principle: "Accessibility (WCAG 2.1)",
    explanation: "If contrast is too low, visually impaired or low-brightness screen users cannot read the text.",
    options: [
      {
        id: 1,
        content: (
          <div className="w-full h-full bg-[#111111] flex items-center justify-center p-4 rounded text-center">
             <h3 className="text-[#333333] font-bold text-lg">System Update Ready</h3>
          </div>
        ),
        isCorrect: false,
        issues: ['Contrast ~1.5:1 (Fails)']
      },
      {
        id: 2,
        content: (
          <div className="w-full h-full bg-[#34d399] flex items-center justify-center p-4 rounded text-center">
             <h3 className="text-[#ffffff] font-bold text-lg">System Update Ready</h3>
          </div>
        ),
        isCorrect: false,
        issues: ['White on light green is only ~2.5:1 (Fails)']
      },
      {
        id: 3,
        content: (
          <div className="w-full h-full bg-[#fcd34d] flex items-center justify-center p-4 rounded text-center">
             <h3 className="text-[#ffffff] font-bold text-lg">System Update Ready</h3>
          </div>
        ),
        isCorrect: false,
        issues: ['White on yellow is ~1.2:1 (Fails severely)']
      },
      {
        id: 4,
        content: (
          <div className="w-full h-full bg-[#1e1b4b] flex items-center justify-center p-4 rounded text-center border border-indigo-500/50">
             <h3 className="text-[#c7d2fe] font-bold text-lg">System Update Ready</h3>
          </div>
        ),
        isCorrect: true,
      }
    ],
    reasons: [
      { id: 1, text: 'It uses a vibrant yellow', correct: false },
      { id: 2, text: 'Light indigo text on a very dark midnight background', correct: true },
      { id: 3, text: 'White on light green is a modern aesthetic', correct: false }
    ]
  },

  // STAGE 6: Law of Similarity
  {
    title: "Which buttons communicate proper semantics?",
    subtitle: "Similar looking elements are perceived as having similar functions.",
    principle: "Law of Similarity",
    explanation: "Primary actions should look distinctly different from secondary or destructive actions to prevent user errors.",
    options: [
      {
        id: 1,
        content: (
          <div className="flex gap-2 justify-center w-full">
            <button className="px-4 py-2 bg-blue-500 text-white rounded text-xs font-bold">Save</button>
            <button className="px-4 py-2 bg-blue-500 text-white rounded text-xs font-bold">Cancel</button>
            <button className="px-4 py-2 bg-blue-500 text-white rounded text-xs font-bold">Delete</button>
          </div>
        ),
        isCorrect: false,
        issues: ['All buttons look identical', 'High chance of deleting by mistake']
      },
      {
        id: 2,
        content: (
          <div className="flex gap-2 justify-center w-full">
            <button className="px-4 py-2 bg-primary text-white rounded text-xs font-bold shadow-lg">Save Changes</button>
            <button className="px-4 py-2 border border-white/20 text-white/70 hover:bg-white/5 rounded text-xs font-bold">Cancel</button>
            <button className="px-4 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded text-xs font-bold">Delete</button>
          </div>
        ),
        isCorrect: true,
      },
      {
        id: 3,
        content: (
          <div className="flex flex-col gap-2 w-full px-6">
            <button className="px-4 py-2 bg-emerald-500 text-white rounded-full text-xs font-bold">Save</button>
            <button className="px-4 py-2 bg-emerald-500 text-white rounded-md text-xs font-bold">Cancel</button>
            <button className="px-4 py-2 bg-emerald-500 text-white rounded-none text-xs font-bold">Delete</button>
          </div>
        ),
        isCorrect: false,
        issues: ['Inconsistent shapes', 'Same colors for opposing actions']
      },
      {
        id: 4,
        content: (
          <div className="flex gap-2 justify-center w-full">
            <button className="px-4 py-2 text-white text-xs font-bold">Save</button>
            <button className="px-4 py-2 text-white text-xs font-bold">Cancel</button>
            <button className="px-4 py-2 text-white text-xs font-bold">Delete</button>
          </div>
        ),
        isCorrect: false,
        issues: ['No button affordance', 'Looks like plain text']
      }
    ],
    reasons: [
      { id: 1, text: 'Delete is explicitly styled as a destructive ghost button (red)', correct: true },
      { id: 2, text: 'All buttons share exactly the same blue color', correct: false },
      { id: 3, text: 'They use different border radius for variety', correct: false }
    ]
  }
];
