/* GlobalUX.js
 * Transition wipe, custom cursor, brief-loading polish, and accessibility helpers.
 */
(function () {
  'use strict';

  let overlay;

  function ensureOverlay() {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'globalPageTransition';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);
    return overlay;
  }

  function runWipe(callback) {
    const wipe = ensureOverlay();
    const current = document.querySelector('.page.active, .game-page.active') || document.body;

    current.classList.add('page-transition-out');
    wipe.classList.add('active');

    setTimeout(() => {
      callback();
      current.classList.remove('page-transition-out');

      const incoming = document.querySelector('.page.active, .game-page.active') || document.body;
      incoming.classList.add('page-transition-in');

      setTimeout(() => {
        incoming.classList.remove('page-transition-in');
        wipe.classList.remove('active');
      }, 300);
    }, 400);
  }

  function navigateTo(pageId, options) {
    const opts = options || {};
    if (opts.href) {
      runWipe(() => { window.location.href = opts.href; });
      return;
    }

    const target = document.getElementById(pageId);
    if (!target) return;

    runWipe(() => {
      document.querySelectorAll('.page').forEach((page) => page.classList.remove('active'));
      target.classList.add('active');
    });
  }

  function setupCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    const move = (x, y) => {
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;
      ring.style.left = `${x}px`;
      ring.style.top = `${y}px`;
    };

    document.addEventListener('mousemove', (e) => move(e.clientX, e.clientY), { passive: true });

    document.addEventListener('mouseover', (e) => {
      const clickable = e.target.closest('button, a, input, select, textarea, [role="button"], .ui-option, .return-btn');
      if (clickable) ring.classList.add('cursor-ring-active');
    });

    document.addEventListener('mouseout', (e) => {
      const clickable = e.target.closest('button, a, input, select, textarea, [role="button"], .ui-option, .return-btn');
      if (clickable) ring.classList.remove('cursor-ring-active');
    });

    document.addEventListener('mousedown', () => {
      dot.classList.add('cursor-click');
      ring.classList.add('cursor-click');
      setTimeout(() => {
        dot.classList.remove('cursor-click');
        ring.classList.remove('cursor-click');
      }, 140);
    });
  }

  function setupBriefLoading() {
    const briefs = document.querySelectorAll('.brief-screen');
    briefs.forEach((brief) => {
      if (brief.querySelector('.brief-loading')) return;

      const loading = document.createElement('div');
      loading.className = 'brief-loading';
      loading.innerHTML = '<span></span><span></span><span></span>';
      brief.appendChild(loading);

      brief.addEventListener('click', function captureStart(ev) {
        if (brief.dataset.briefReady === '1') return;
        ev.preventDefault();
        ev.stopImmediatePropagation();
        brief.dataset.briefReady = '1';
        brief.classList.add('brief-loading-active');
        setTimeout(() => {
          brief.classList.remove('brief-loading-active');
          brief.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        }, 300);
      }, true);
    });
  }

  function setupAccessibility() {
    document.querySelectorAll('.game-page').forEach((page) => {
      const title = page.querySelector('.brief-title') ? page.querySelector('.brief-title').textContent.trim() : 'Game challenge';
      page.querySelectorAll('canvas').forEach((canvas) => {
        if (!canvas.hasAttribute('aria-label')) {
          canvas.setAttribute('aria-label', `${title} challenge canvas`);
        }
      });

      page.querySelectorAll('.vera-commentary').forEach((panel) => {
        panel.setAttribute('role', 'complementary');
        panel.setAttribute('aria-label', 'VERA AI Mentor');
      });
    });
  }

  function setupNodeStagger() {
    const nodes = document.querySelectorAll('[data-game-id]');
    nodes.forEach((node, i) => {
      node.style.opacity = '0';
      node.style.transform = 'translateY(10px)';
      setTimeout(() => {
        node.style.transition = 'transform 280ms ease, opacity 280ms ease';
        node.style.opacity = '1';
        node.style.transform = 'translateY(0)';
      }, 50 * i);
    });
  }

  function setupConstellationResize() {
    const nodes = document.querySelectorAll('[data-constellation-node]');
    if (!nodes.length) return;

    const reposition = () => {
      nodes.forEach((node) => {
        const rx = Number(node.getAttribute('data-rx'));
        const ry = Number(node.getAttribute('data-ry'));
        if (Number.isFinite(rx) && Number.isFinite(ry)) {
          node.style.left = `${rx * 100}%`;
          node.style.top = `${ry * 100}%`;
        }
      });
    };

    window.addEventListener('resize', reposition, { passive: true });
    reposition();
  }

  function refreshDashboardIfNeeded() {
    if (!window.gestaltDataManager) return;
    const mustRefresh = sessionStorage.getItem('gestalt_refresh_dashboard') === '1';
    if (mustRefresh) sessionStorage.removeItem('gestalt_refresh_dashboard');
    if (mustRefresh || document.querySelector('[data-game-id]')) {
      window.gestaltDataManager.syncProgressFromScores();
      window.gestaltDataManager.refreshDashboardUI();
    }
  }

  function setupOneShotObservers() {
    const animated = document.querySelectorAll('[data-observe-once]');
    if (!animated.length) return;

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      });
      if (animated.length > 0) {
        // Disconnect when all tracked elements are observed.
        const pending = Array.from(animated).some((el) => !el.classList.contains('in-view'));
        if (!pending) obs.disconnect();
      }
    }, { threshold: 0.2 });

    animated.forEach((el) => io.observe(el));
  }

  function init() {
    ensureOverlay();
    setupCursor();
    setupBriefLoading();
    setupAccessibility();
    setupNodeStagger();
    setupConstellationResize();
    setupOneShotObservers();
    refreshDashboardIfNeeded();
  }

  window.navigateTo = navigateTo;
  document.addEventListener('DOMContentLoaded', init);
})();
