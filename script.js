/* ═══════════════════════════════════════════════════
   BORDENT — script.js
   Particles · Scroll reveals · Nav · Slider · Tweaks
   ═══════════════════════════════════════════════════ */

/* ─── TWEAK DEFAULTS ─── */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "colorTheme": "gold",
  "particleCount": 22,
  "animationsEnabled": true,
  "heroVariant": "En Değerli"
}/*EDITMODE-END*/;

let state = Object.assign({}, TWEAK_DEFAULTS);
let particleCount = state.particleCount;
let animEnabled = state.animationsEnabled;

/* ═══════════════════════════════════════════════════
   PARTICLE SYSTEM
   ═══════════════════════════════════════════════════ */
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let raf;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function makeParticle() {
  return {
    x: Math.random() * canvas.width,
    y: canvas.height + Math.random() * 60,
    r: Math.random() * 1.8 + 0.5,
    speed: Math.random() * 0.5 + 0.2,
    drift: (Math.random() - 0.5) * 0.3,
    opacity: 0,
    maxOp: Math.random() * 0.5 + 0.15,
    phase: Math.random() * Math.PI * 2,
    freq: Math.random() * 0.008 + 0.004,
    // Gold hues logic ensuring correct RGB values
    hue: Math.random() > 0.5 ? '212,175,55' : '197,155,42'
  };
}

function initParticles() {
  particles = [];
  for (let i = 0; i < particleCount; i++) {
    const p = makeParticle();
    p.y = Math.random() * canvas.height; // scatter on init
    particles.push(p);
  }
}

function animateParticles(ts) {
  if (!animEnabled) { ctx.clearRect(0, 0, canvas.width, canvas.height); raf = requestAnimationFrame(animateParticles); return; }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p, i) => {
    p.y -= p.speed;
    p.x += p.drift + Math.sin(ts * p.freq + p.phase) * 0.3;
    p.opacity = p.y < canvas.height * 0.7
      ? Math.min(p.opacity + 0.008, p.maxOp)
      : Math.max(p.opacity - 0.003, 0);
    if (p.y < -10) {
      particles[i] = makeParticle();
    }
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.hue},${p.opacity})`;
    ctx.fill();
  });
  raf = requestAnimationFrame(animateParticles);
}

function startParticles() {
  resizeCanvas();
  initParticles();
  if (raf) cancelAnimationFrame(raf);
  raf = requestAnimationFrame(animateParticles);
}

window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });

/* ═══════════════════════════════════════════════════
   SCROLL REVEALS (IntersectionObserver)
   ═══════════════════════════════════════════════════ */
function initReveal() {
  const els = document.querySelectorAll('.reveal-up, .reveal-left');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
}

/* ═══════════════════════════════════════════════════
   NAV — blur on scroll
   ═══════════════════════════════════════════════════ */
function initNav() {
  const nav = document.getElementById('nav');
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ═══════════════════════════════════════════════════
   MOBILE MENU (UPDATED)
   ═══════════════════════════════════════════════════ */
function initMobileMenu() {
  const btn = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  });
  menu.querySelectorAll('.mm-link, .mm-cta').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', false);
    });
  });
}

/* ═══════════════════════════════════════════════════
   BEFORE / AFTER COMPARISON SLIDER
   ═══════════════════════════════════════════════════ */
function initComparison() {
  const wrapper = document.getElementById('comparison');
  const before = document.getElementById('cmp-before');
  const handle = document.getElementById('cmp-handle');
  if (!wrapper) return;

  let dragging = false;
  let pct = 50;

  function setPos(clientX) {
    const rect = wrapper.getBoundingClientRect();
    pct = Math.max(2, Math.min(98, (clientX - rect.left) / rect.width * 100));
    before.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    handle.style.left = pct + '%';
    handle.style.transform = 'translateX(-50%)';
  }

  // Init at 50%
  setPos(wrapper.getBoundingClientRect().left + wrapper.offsetWidth * 0.5);

  wrapper.addEventListener('mousedown', e => { dragging = true; setPos(e.clientX); });
  document.addEventListener('mouseup', () => { dragging = false; });
  document.addEventListener('mousemove', e => { if (dragging) setPos(e.clientX); });

  wrapper.addEventListener('touchstart', e => { dragging = true; setPos(e.touches[0].clientX); }, { passive: true });
  document.addEventListener('touchend', () => { dragging = false; });
  document.addEventListener('touchmove', e => { if (dragging) setPos(e.touches[0].clientX); }, { passive: true });

  // Click anywhere on wrapper also moves (for desktop single-click)
  wrapper.addEventListener('click', e => setPos(e.clientX));
}

/* ═══════════════════════════════════════════════════
   COLOUR THEMES (UPDATED TO LUXURY NAVY/GOLD)
   ═══════════════════════════════════════════════════ */
const themes = {
  cyan: { acc: '#53D8FB', acc2: '#2FD6C7', accBr: '#7EEBFF' },
  gold: { acc: '#D4AF37', acc2: '#C59B2A', accBr: '#F5D37F' },
  violet: { acc: '#A78BFA', acc2: '#8B5CF6', accBr: '#C4B5FD' },
  rose: { acc: '#F472B6', acc2: '#EC4899', accBr: '#FBCFE8' },
};

function applyTheme(name) {
  const t = themes[name] || themes.gold;
  const r = document.documentElement.style;
  r.setProperty('--acc', t.acc);
  r.setProperty('--acc2', t.acc2);
  r.setProperty('--acc-br', t.accBr);

  // Update gradient-text on hero badge floats (Safely re-applying the style properties if needed)
  document.querySelectorAll('.btn-primary, .nav-cta, .logo-mark, .mm-cta, .loader-fill, .t-avatar').forEach(el => {
    el.style.background = `linear-gradient(135deg,${t.acc},${t.acc2})`;
  });
}

/* ═══════════════════════════════════════════════════
   TWEAKS PANEL
   ═══════════════════════════════════════════════════ */
function initTweaks() {
  const panel = document.getElementById('tweaks-panel');

  // 1. Register listener BEFORE announcing availability
  window.addEventListener('message', e => {
    if (!e.data || !e.data.type) return;
    if (e.data.type === '__activate_edit_mode') panel.classList.remove('hidden');
    if (e.data.type === '__deactivate_edit_mode') panel.classList.add('hidden');
  });

  // 2. Announce availability
  window.parent.postMessage({ type: '__edit_mode_available' }, '*');

  // Close button
  document.getElementById('tp-close').addEventListener('click', () => {
    panel.classList.add('hidden');
    window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*');
  });

  // Colour swatches
  document.querySelectorAll('.tp-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tp-swatch').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const theme = btn.dataset.theme;
      applyTheme(theme);
      window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { colorTheme: theme } }, '*');
    });
  });

  // Hero text radio
  document.querySelectorAll('#hero-text-options .tp-radio').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#hero-text-options .tp-radio').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const el = document.getElementById('hero-line2');
      if (el) el.textContent = btn.dataset.value;
      window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { heroVariant: btn.dataset.value } }, '*');
    });
  });

  // Particle density
  const densitySlider = document.getElementById('particle-density');
  const densityVal = document.getElementById('particle-val');
  densitySlider.addEventListener('input', () => {
    densityVal.textContent = densitySlider.value;
    particleCount = parseInt(densitySlider.value, 10);
    initParticles();
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { particleCount: particleCount } }, '*');
  });

  // Animations toggle
  document.getElementById('anim-toggle').addEventListener('change', e => {
    animEnabled = e.target.checked;
    if (!animEnabled) ctx.clearRect(0, 0, canvas.width, canvas.height);
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { animationsEnabled: animEnabled } }, '*');
  });

  // Apply persisted tweaks on load
  applyTheme(state.colorTheme);
  if (state.heroVariant) {
    const el = document.getElementById('hero-line2');
    if (el) el.textContent = state.heroVariant;
  }
  densitySlider.value = state.particleCount;
  densityVal.textContent = state.particleCount;
  particleCount = state.particleCount;
  document.getElementById('anim-toggle').checked = state.animationsEnabled;
  animEnabled = state.animationsEnabled;

  // Mark active colour swatch
  document.querySelectorAll('.tp-swatch').forEach(b => {
    b.classList.toggle('active', b.dataset.theme === state.colorTheme);
  });
}

/* ═══════════════════════════════════════════════════
   SMOOTH HOVER GLOW on service cards (mouse-track)
   ═══════════════════════════════════════════════════ */
function initCardGlow() {
  document.querySelectorAll('.svc-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width * 100).toFixed(1);
      const y = ((e.clientY - r.top) / r.height * 100).toFixed(1);
      card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(212,175,55,0.07) 0%, rgba(255,255,255,0.02) 60%)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.background = '';
    });
  });
}

/* ═══════════════════════════════════════════════════
   COUNTING ANIMATION for stat numbers
   ═══════════════════════════════════════════════════ */
function initCounters() {
  const counters = document.querySelectorAll('.sp-num, .as-num');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const text = el.textContent;
      const num = parseInt(text.replace(/\D/g, ''), 10);
      if (isNaN(num)) return;
      const prefix = text.startsWith('%') ? '%' : '';
      const suffix = el.querySelector('sup') ? el.querySelector('sup').textContent : '';
      let start = 0;
      const dur = 1400;
      const t0 = performance.now();
      const tick = now => {
        const prog = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - prog, 3);
        const val = Math.round(eased * num);
        el.innerHTML = prefix + val + (suffix ? `<sup>${suffix}</sup>` : '');
        if (prog < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => io.observe(c));
}


/* ═══════════════════════════════════════════════════
   SITE LOADER
   ═══════════════════════════════════════════════════ */
function initLoader() {
  const loader = document.getElementById('site-loader');
  if (!loader) return;
  setTimeout(() => loader.classList.add('done'), 1380);
}

/* ═══════════════════════════════════════════════════
   ACTIVE NAV LINK (scroll spy)
   ═══════════════════════════════════════════════════ */
function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.getAttribute('id');
        navLinks.forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.35, rootMargin: '-70px 0px -45% 0px' });
  sections.forEach(s => io.observe(s));
}

/* ═══════════════════════════════════════════════════
   SCROLL-TO-TOP BUTTON
   ═══════════════════════════════════════════════════ */
function initScrollToTop() {
  const btn = document.getElementById('stt-btn');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 420);
  }, { passive: true });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ═══════════════════════════════════════════════════
   BEFORE/AFTER AUTO-DEMO (one-time hint on first view)
   ═══════════════════════════════════════════════════ */
function initBADemo() {
  const wrapper = document.getElementById('comparison');
  const before = document.getElementById('cmp-before');
  const handle = document.getElementById('cmp-handle');
  if (!wrapper || !before || !handle) return;

  let played = false;
  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !played) {
      played = true;
      io.disconnect();

      const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      function animTo(targetPct, dur) {
        return new Promise(resolve => {
          const startPct = parseFloat(handle.style.left) || 50;
          const t0 = performance.now();
          const tick = now => {
            const prog = Math.min((now - t0) / dur, 1);
            const p = startPct + (targetPct - startPct) * ease(prog);
            before.style.clipPath = `inset(0 ${100 - p}% 0 0)`;
            handle.style.left = p + '%';
            handle.style.transform = 'translateX(-50%)';
            prog < 1 ? requestAnimationFrame(tick) : resolve();
          };
          requestAnimationFrame(tick);
        });
      }

      // Plays: 50% → 28% (reveal AFTER) → back to 50%
      setTimeout(async () => {
        before.style.transition = 'none';
        handle.style.transition = 'none';
        await animTo(28, 900);
        await new Promise(r => setTimeout(r, 260));
        await animTo(50, 800);
      }, 700);
    }
  }, { threshold: 0.55 });

  io.observe(wrapper);
}

/* ═══════════════════════════════════════════════════
   INIT ALL (UPDATED TO INCLUDE ALL MODULES)
   ═══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  startParticles();
  initReveal();
  initNav();
  initMobileMenu();
  initComparison();
  initBADemo();
  initActiveNav();
  initScrollToTop();
  initCardGlow();
  initCounters();
  initTweaks();
});