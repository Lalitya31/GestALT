/* GameRouter.js — routes sessionStorage activeGame to the correct game page */
(function () {
  const GAME_MAP = {
    G01: 'g1ProximityField',
    G02: 'g2SimilarityMatch',
    G03: 'g3ClosureChamber',
    G04: 'g4FigureGround',
    G05: 'g5ContinuityRiver',
    G06: 'g6LoadReducer',
    G07: 'g7MentalModel',
    G08: 'g8HicksLaw',
    G09: 'g9FittsLaw',
    G10: 'g10MillersVault',
    G11: 'g11TypeHierarchy',
    G12: 'g12RhythmBaseline',
    G13: 'g13ContrastCalibration',
    G14: 'g14PaletteArchitect',
    G15: 'g15AccessibilityAuditor',
    G16: 'g16AffordanceForge',
    G17: 'g17MotionLawStudio',
    G18: 'g18FeedbackLoop',
    G19: 'g19InformationArchitect',
    G20: 'g20DarkPatternDetective',
  };

  function showGame(id) {
    document.querySelectorAll('.game-page').forEach(p => p.classList.remove('active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  }

  document.addEventListener('DOMContentLoaded', () => {
    const active = sessionStorage.getItem('activeGame') || 'G01';
    const pageId = GAME_MAP[active] || GAME_MAP['G01'];
    showGame(pageId);
  });

  // Expose for external navigation
  window.navigateToGame = function (gameId) {
    sessionStorage.setItem('activeGame', gameId);
    const pageId = GAME_MAP[gameId];
    if (pageId) showGame(pageId);
  };

  window.returnToDashboard = function () {
    if (window.gestaltDataManager) {
      window.gestaltDataManager.syncProgressFromScores();
      window.gestaltDataManager.markPlayActivity();
    }
    sessionStorage.setItem('gestalt_refresh_dashboard', '1');
    if (typeof window.navigateTo === 'function') {
      window.navigateTo('', { href: 'index.html' });
      return;
    }
    window.location.href = 'index.html';
  };
})();
