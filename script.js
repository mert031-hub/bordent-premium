/* ═══════════════════════════════════════════════════
   BORDENT — script.js
   Particles · Scroll reveals · Nav · Sliders · Tweaks
   ═══════════════════════════════════════════════════ */

/* ─── DEFAULTS ─── */
const DEFAULTS = {
  particleCount: 22,
  animationsEnabled: true,
  heroVariant: "En Değerli"
};

let state = Object.assign({}, DEFAULTS);
let particleCount = state.particleCount;
let animEnabled = state.animationsEnabled;

/* ═══════════════════════════════════════════════════
   PARTICLE SYSTEM
   Light-theme tuned: subtle sky-blue dots on white bg
   ═══════════════════════════════════════════════════ */
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let raf;

/* Fallback colours — overwritten from CSS vars on load */
let particleColor1 = '14, 165, 233';   /* --acc  sky blue  */
let particleColor2 = '56, 189, 248';   /* --acc2 light sky */

function initColors() {
  const root = getComputedStyle(document.documentElement);
  const c1 = root.getPropertyValue('--acc-rgb').trim();
  const c2 = root.getPropertyValue('--acc2-rgb').trim();
  if (c1) particleColor1 = c1;
  if (c2) particleColor2 = c2;
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function makeParticle() {
  return {
    x: Math.random() * canvas.width,
    y: canvas.height + Math.random() * 60,
    r: Math.random() * 2.0 + 0.8,
    speed: Math.random() * 0.45 + 0.18,
    drift: (Math.random() - 0.5) * 0.28,
    opacity: 0,
    /* Reduced opacity range for light background: 0.03 – 0.14 */
    maxOp: Math.random() * 0.11 + 0.03,
    phase: Math.random() * Math.PI * 2,
    freq: Math.random() * 0.008 + 0.004,
    hue: Math.random() > 0.5 ? particleColor1 : particleColor2
  };
}

function initParticles() {
  particles = [];
  for (let i = 0; i < particleCount; i++) {
    const p = makeParticle();
    p.y = Math.random() * canvas.height; /* scatter on init */
    particles.push(p);
  }
}

function animateParticles(ts) {
  if (!animEnabled) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    raf = requestAnimationFrame(animateParticles);
    return;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p, i) => {
    p.y -= p.speed;
    p.x += p.drift + Math.sin(ts * p.freq + p.phase) * 0.3;
    p.opacity = p.y < canvas.height * 0.7
      ? Math.min(p.opacity + 0.007, p.maxOp)
      : Math.max(p.opacity - 0.003, 0);
    if (p.y < -10) particles[i] = makeParticle();
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.hue},${p.opacity})`;
    ctx.fill();
  });
  raf = requestAnimationFrame(animateParticles);
}

function startParticles() {
  initColors();
  resizeCanvas();
  initParticles();
  if (raf) cancelAnimationFrame(raf);
  raf = requestAnimationFrame(animateParticles);
}

window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });

/* ═══════════════════════════════════════════════════
   SITE LOADER
   ═══════════════════════════════════════════════════ */
function initLoader() {
  const loader = document.getElementById('site-loader');
  if (!loader) return;
  setTimeout(() => loader.classList.add('done'), 1380);
}

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
   NAV — frosted glass on scroll
   ═══════════════════════════════════════════════════ */
function initNav() {
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
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
   MOBILE MENU
   ═══════════════════════════════════════════════════ */
function initMobileMenu() {
  const btn = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

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
   SCROLL-TO-TOP BUTTON
   ═══════════════════════════════════════════════════ */
function initScrollToTop() {
  const btn = document.getElementById('stt-btn');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 420);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ═══════════════════════════════════════════════════
   BEFORE / AFTER COMPARISON SLIDERS
   ═══════════════════════════════════════════════════ */
function initComparison() {
  document.querySelectorAll('.comparison[data-id]').forEach(wrapper => {
    const before = wrapper.querySelector('.cmp-before');
    const handle = wrapper.querySelector('.cmp-handle');
    if (!before || !handle) return;

    let dragging = false;

    function setPos(clientX) {
      const rect = wrapper.getBoundingClientRect();
      const pct = Math.max(2, Math.min(98, (clientX - rect.left) / rect.width * 100));
      before.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
      handle.style.left = pct + '%';
      handle.style.transform = 'translateX(-50%)';
    }

    /* Initialise at 50% after layout paint */
    requestAnimationFrame(() => {
      const rect = wrapper.getBoundingClientRect();
      setPos(rect.left + rect.width * 0.5);
    });

    /* ── Mouse ── */
    wrapper.addEventListener('mousedown', e => { dragging = true; setPos(e.clientX); });
    document.addEventListener('mouseup', () => { dragging = false; });
    document.addEventListener('mousemove', e => { if (dragging) setPos(e.clientX); });

    /* ── Touch ── */
    wrapper.addEventListener('touchstart', e => {
      dragging = true; setPos(e.touches[0].clientX);
    }, { passive: true });
    document.addEventListener('touchend', () => { dragging = false; });
    document.addEventListener('touchmove', e => {
      if (dragging) setPos(e.touches[0].clientX);
    }, { passive: true });

    /* ── Single click / tap ── */
    wrapper.addEventListener('click', e => setPos(e.clientX));
  });
}

/* ═══════════════════════════════════════════════════
   BEFORE/AFTER AUTO-DEMO  (first slider, one-time)
   ═══════════════════════════════════════════════════ */
function initBADemo() {
  const wrapper = document.querySelector('.comparison[data-id="1"]');
  if (!wrapper) return;
  const before = wrapper.querySelector('.cmp-before');
  const handle = wrapper.querySelector('.cmp-handle');
  if (!before || !handle) return;

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

  let played = false;
  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !played) {
      played = true;
      io.disconnect();
      /* Sweep: 50 → 28 → 50 */
      setTimeout(async () => {
        await animTo(28, 900);
        await new Promise(r => setTimeout(r, 300));
        await animTo(50, 800);
      }, 700);
    }
  }, { threshold: 0.55 });

  io.observe(wrapper);
}

/* ═══════════════════════════════════════════════════
   GALLERY — image loading states
   ═══════════════════════════════════════════════════ */
function initGallery() {
  document.querySelectorAll('.gallery-image').forEach(img => {
    const gItem = img.closest('.g-item');
    const markLoaded = () => img.classList.add('loaded');
    const markError = () => {
      if (gItem) gItem.classList.add('img-error');
      img.classList.add('loaded'); /* show alt state */
    };

    if (img.complete) {
      if (img.naturalWidth > 0) markLoaded();
      else markError();
    } else {
      img.addEventListener('load', markLoaded, { once: true });
      img.addEventListener('error', markError, { once: true });
    }
  });
}

/* ═══════════════════════════════════════════════════
   TWEAKS PANEL
   Theme switching removed — single stable medical theme.
   Remaining controls: hero variant · particle density · animations
   ═══════════════════════════════════════════════════ */
function initTweaks() {
  const panel = document.getElementById('tweaks-panel');
  if (!panel) return;

  /* Show / hide via postMessage (editor integration) */
  window.addEventListener('message', e => {
    if (!e.data || !e.data.type) return;
    if (e.data.type === '__activate_edit_mode') panel.classList.remove('hidden');
    if (e.data.type === '__deactivate_edit_mode') panel.classList.add('hidden');
  });
  window.parent.postMessage({ type: '__edit_mode_available' }, '*');

  const closeBtn = document.getElementById('tp-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      panel.classList.add('hidden');
      window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*');
    });
  }

  /* ── Hero text variant ── */
  document.querySelectorAll('#hero-text-options .tp-radio').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#hero-text-options .tp-radio')
        .forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const el = document.getElementById('hero-line2');
      if (el) el.textContent = btn.dataset.value;
      window.parent.postMessage(
        { type: '__edit_mode_set_keys', edits: { heroVariant: btn.dataset.value } }, '*'
      );
    });
  });

  /* ── Particle density ── */
  const densitySlider = document.getElementById('particle-density');
  const densityVal = document.getElementById('particle-val');
  if (densitySlider && densityVal) {
    densitySlider.addEventListener('input', () => {
      densityVal.textContent = densitySlider.value;
      particleCount = parseInt(densitySlider.value, 10);
      initParticles();
      window.parent.postMessage(
        { type: '__edit_mode_set_keys', edits: { particleCount } }, '*'
      );
    });
    /* Restore persisted value */
    densitySlider.value = state.particleCount;
    densityVal.textContent = state.particleCount;
    particleCount = state.particleCount;
  }

  /* ── Animations toggle ── */
  const animToggle = document.getElementById('anim-toggle');
  if (animToggle) {
    animToggle.addEventListener('change', e => {
      animEnabled = e.target.checked;
      if (!animEnabled) ctx.clearRect(0, 0, canvas.width, canvas.height);
      window.parent.postMessage(
        { type: '__edit_mode_set_keys', edits: { animationsEnabled: animEnabled } }, '*'
      );
    });
    animToggle.checked = state.animationsEnabled;
    animEnabled = state.animationsEnabled;
  }

  /* Apply persisted hero variant on load */
  if (state.heroVariant) {
    const el = document.getElementById('hero-line2');
    if (el) el.textContent = state.heroVariant;
    document.querySelectorAll('#hero-text-options .tp-radio').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.value === state.heroVariant);
    });
  }
}

/* ═══════════════════════════════════════════════════
   SMOOTH HOVER GLOW on service cards (mouse-track)
   Light-theme: subtle blue radial highlight on white card
   ═══════════════════════════════════════════════════ */
function initCardGlow() {
  document.querySelectorAll('.svc-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width * 100).toFixed(1);
      const y = ((e.clientY - r.top) / r.height * 100).toFixed(1);
      card.style.background =
        `radial-gradient(circle at ${x}% ${y}%, rgba(14,165,233,0.05) 0%, #ffffff 65%)`;
    });
    card.addEventListener('mouseleave', () => { card.style.background = ''; });
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
   INIT ALL
   ═══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  startParticles();
  initReveal();
  initNav();
  initActiveNav();
  initMobileMenu();
  initScrollToTop();
  initComparison();
  initBADemo();
  initCardGlow();
  initCounters();
  initGallery();
  initTweaks();
});
