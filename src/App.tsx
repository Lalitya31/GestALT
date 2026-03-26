import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Ideas from './pages/IdeasPage';
import Architecture from './pages/ArchitecturePage';
import Onboarding from './pages/Onboarding';
import Challenge from './pages/Challenge';
import Results from './pages/Results';
import Dashboard from './pages/Dashboard';
import WhitespaceSimulator from './pages/WhitespaceSimulator';
import Similarity from './pages/Similarity';
import Continuity from './pages/Continuity';
import HicksLaw from './pages/HicksLaw';
import VisualHierarchy from './pages/VisualHierarchy';
import SemanticColor from './pages/SemanticColor';
import Accessibility from './pages/Accessibility';
import GridMaster from './pages/GridMaster';
import TypoScale from './pages/TypoScale';
import ContrastMixer from './pages/ContrastMixer';
import MegaMenu from './pages/MegaMenu';
import MobileTab from './pages/MobileTab';
import ClosurePuzzle from './pages/ClosurePuzzle';
import FigureGround from './pages/FigureGround';
import FlexboxSandbox from './pages/FlexboxSandbox';
import ButtonLogic from './pages/ButtonLogic';
import ResponsiveDesign from './pages/ResponsiveDesign';
import ZIndexLayering from './pages/ZIndexLayering';
import CognitiveLoad from './pages/CognitiveLoad';
import FinalBoss from './pages/FinalBoss';

import { motion } from 'framer-motion';
import { LearningProvider } from './engine/LearningContext';
import VERAOverlay from './components/ui/VERAOverlay';

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link to={to} className="relative px-5 py-2.5 rounded-full transition-all font-semibold text-sm tracking-widest uppercase">
      {isActive ? (
        <span className="text-white z-10 relative">{children}</span>
      ) : (
        <span className="text-white/50 hover:text-white/90 z-10 relative transition-colors">{children}</span>
      )}
      {isActive && (
        <motion.div
          layoutId="nav-bg"
          className="absolute inset-0 bg-white/10 rounded-full"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
    </Link>
  );
}

function Navbar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-center pt-8 pointer-events-none">
      <div className="glass-panel px-3 py-2 flex items-center gap-1 pointer-events-auto rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
        <div className="font-extrabold text-xl mr-6 ml-4 tracking-tight">Gest<span className="text-gradient">ALT</span></div>
        <NavLink to="/">Learn</NavLink>
        <NavLink to="/ideas">Ideas</NavLink>
        <NavLink to="/architecture">Architecture</NavLink>
      </div>
    </nav>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<Home />} />
      <Route path="/ideas" element={<Ideas />} />
      <Route path="/architecture" element={<Architecture />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/challenge" element={<Challenge />} />
      <Route path="/results" element={<Results />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/whitespace-sim" element={<WhitespaceSimulator />} />
      <Route path="/similarity" element={<Similarity />} />
      <Route path="/continuity" element={<Continuity />} />
      <Route path="/hicks-law" element={<HicksLaw />} />
      <Route path="/visual-hierarchy" element={<VisualHierarchy />} />
      <Route path="/semantic-color" element={<SemanticColor />} />
      <Route path="/accessibility" element={<Accessibility />} />
      <Route path="/grid-master" element={<GridMaster />} />
      <Route path="/typo-scale" element={<TypoScale />} />
      <Route path="/contrast-mixer" element={<ContrastMixer />} />
      <Route path="/mega-menu" element={<MegaMenu />} />
      <Route path="/mobile-tab" element={<MobileTab />} />
      <Route path="/closure-puzzle" element={<ClosurePuzzle />} />
      <Route path="/figure-ground" element={<FigureGround />} />
      <Route path="/flexbox-sandbox" element={<FlexboxSandbox />} />
      <Route path="/button-logic" element={<ButtonLogic />} />
      <Route path="/responsive-design" element={<ResponsiveDesign />} />
      <Route path="/z-index-layering" element={<ZIndexLayering />} />
      <Route path="/cognitive-load" element={<CognitiveLoad />} />
      <Route path="/final-boss" element={<FinalBoss />} />
    </Routes>
  );
}

function AppLayout() {
  const location = useLocation();
  const fullScreenRoutes = new Set([
    '/onboarding',
    '/dashboard',
    '/whitespace-sim',
    '/similarity',
    '/continuity',
    '/hicks-law',
    '/visual-hierarchy',
    '/semantic-color',
    '/accessibility',
    '/grid-master',
    '/typo-scale',
    '/contrast-mixer',
    '/mega-menu',
    '/mobile-tab',
    '/closure-puzzle',
    '/figure-ground',
    '/flexbox-sandbox',
    '/button-logic',
    '/responsive-design',
    '/z-index-layering',
    '/cognitive-load',
    '/final-boss'
  ]);
  const isDashboardRoute = location.pathname === '/dashboard';
  const isGameRoute = fullScreenRoutes.has(location.pathname) && !isDashboardRoute;
  const isFullScreenRoute = fullScreenRoutes.has(location.pathname);
  const routesWithNativeMentor = new Set([
    '/mega-menu',
    '/contrast-mixer',
    '/typo-scale',
    '/flexbox-sandbox',
    '/figure-ground'
  ]);
  const shouldShowGlobalVera = isGameRoute && !routesWithNativeMentor.has(location.pathname);

  if (isFullScreenRoute) {
    return (
      <div className="h-screen w-full overflow-hidden">
        <AnimatedRoutes />
        {shouldShowGlobalVera && <VERAOverlay />}
      </div>
    );
  }

  return (
    <div className="min-h-screen relative z-10 p-4 sm:p-8 max-w-[100vw] pb-32">
      <Navbar />
      <AnimatedRoutes />
    </div>
  );
}

export default function App() {
  return (
    <LearningProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </LearningProvider>
  );
}
