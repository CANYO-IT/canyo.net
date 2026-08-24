/* ---------- Fresh load: strip hash + start at top so refresh returns to hero ---------- */
(function resetOnFreshLoad() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { /* still strip */ }
  if (window.location.hash) {
    // Remove the fragment without adding a history entry, then jump to top.
    history.replaceState(null, '', window.location.pathname + window.location.search);
    window.scrollTo(0, 0);
  }
  if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; }
})();

/* ============================================================
   CANYO.net — Interactions
   ============================================================ */

/* ---------- Theme toggle (dark <-> light, persisted) ---------- */
(function initThemeToggle() {
  var toggle = document.getElementById('themeToggle');
  var root = document.documentElement;

  toggle.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('canyo-theme', next); } catch (e) {}
  });

  // Live-sync if the OS preference changes and the user hasn't overridden
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function (e) {
      var stored = null;
      try { stored = localStorage.getItem('canyo-theme'); } catch (err) {}
      if (!stored) root.setAttribute('data-theme', e.matches ? 'light' : 'dark');
    });
  }
})();

/* ---------- Nav: shadow on scroll ---------- */
(function initNavScroll() {
  var nav = document.getElementById('nav');
  var onScroll = function () {
    nav.classList.toggle('scrolled', window.scrollY > 10);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ---------- Mobile menu ---------- */
(function initMobileMenu() {
  var burger = document.getElementById('navBurger');
  var links = document.getElementById('navLinks');

  burger.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  });

  // Close menu after tapping a link
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      links.classList.remove('open');
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* ---------- Scroll-reveal animations ---------- */
(function initReveal() {
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('visible'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(function (el) { io.observe(el); });
})();

/* ---------- Animated number counters ---------- */
(function initCounters() {
  var nums = document.querySelectorAll('[data-count]');

  var animate = function (el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1400;
    var start = null;

    var tick = function (ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      var value = Math.round(target * eased);
      el.textContent = prefix + value.toLocaleString('en-US') + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (!('IntersectionObserver' in window)) {
    nums.forEach(animate);
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animate(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  nums.forEach(function (el) { io.observe(el); });
})();

/* ---------- Contact form (Formspree AJAX) ---------- */
(function initContactForm() {
  var form = document.getElementById('contactForm');
  form.addEventListener('submit', function (e) {
    e.preventDefault(); // stop the mailto/redirect

    // If the Formspree ID hasn't been set yet, fall back to opening the mail app
    if (form.action.indexOf('YOUR_FORM_ID') !== -1) {
      window.location.href = 'mailto:contact@canyo.net?subject=CANYO Assessment Request';
      return;
    }

    var btn = form.querySelector('button[type="submit"]');
    var orig = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    }).then(function (res) {
      if (res.ok) {
        form.reset();
        btn.textContent = '✓ Form Sent — We\'ll Be In Touch';
        btn.style.background = '#2ecc71';
        btn.style.boxShadow = '0 8px 30px rgba(46,204,113,.35)';
      } else {
        btn.textContent = 'Something Went Wrong — Try Again';
        btn.style.background = '#e74c3c';
        btn.disabled = false;
      }
    }).catch(function () {
      btn.textContent = 'Network Error — Email Us Directly';
      btn.style.background = '#e74c3c';
      btn.disabled = false;
    });
  });
})();


/* ---------- Scroll progress bar ---------- */
(function initScrollProgress() {
  var bar = document.querySelector('.scroll-progress');
  if (!bar) return;
  var update = function () {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var p = max > 0 ? (h.scrollTop / max) : 0;
    bar.style.transform = 'scaleX(' + p + ')';
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();


/* ---------- Hero status: expanding pill + typing (reserve final size, then grow) ---------- */
(function initHeroStatus() {
  var el = document.querySelector('.hero__status');
  if (!el) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var lines = el.querySelectorAll('.status-line');
  if (!lines.length) return;

  var isMobile = window.matchMedia && window.matchMedia('(max-width: 600px)').matches;

  // Capture full text now (invisible), so we can measure the pill's final footprint
  var texts = Array.prototype.map.call(lines, function (l) { return l.textContent; });

  // Measure final width/height at full text before we blank anything.
  // This reserves the pill's end-state box so it never warps on mobile.
  el.style.visibility = 'hidden';
  el.style.display = 'inline-flex';
  var finalW = el.offsetWidth;
  var finalH = el.offsetHeight;
  el.style.visibility = '';

  // Blank the lines, then start collapsed and expand to the reserved size.
  Array.prototype.forEach.call(lines, function (l) { l.textContent = ''; });

  // Start collapsed (just the dot), lock final height so only width animates.
  el.style.overflow = 'hidden';
  el.style.height = finalH + 'px';
  el.style.width = (isMobile ? finalW : 0) + 'px';
  el.style.transition = 'width 700ms cubic-bezier(0.22,1,0.36,1), opacity 0.7s ease, transform 0.7s ease';
  el.style.flex = 'none';
  el.style.justifyContent = isMobile ? 'center' : 'flex-start';
  el.style.whiteSpace = 'nowrap';

  if (isMobile) {
    // Mobile: pill is already at final size (two stacked lines). Just type — no width anim,
    // so the wrap layout never reflows mid-typing (this was the warp).
    typeAll();
    return;
  }

  // Desktop: expand the pill, then type inside the now-full-size pill.
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      el.style.width = finalW + 'px';
      setTimeout(typeAll, 720); // start typing as the expansion settles
    });
  });

  function typeAll() {
    var li = 0, ci = 0;
    (function typeLine() {
      if (li >= texts.length) { cleanup(); return; }
      var line = lines[li], target = texts[li];
      if (ci <= target.length) {
        line.textContent = target.slice(0, ci);
        ci++;
        setTimeout(typeLine, 26);
      } else {
        li++; ci = 0;
        setTimeout(typeLine, 140); // brief pause between lines
      }
    })();
  }

  function cleanup() {
    // Release the fixed box so the pill can reflow naturally on resize/orientation change.
    setTimeout(function () {
      el.style.transition = '';
      el.style.width = '';
      el.style.height = '';
      el.style.overflow = '';
      el.style.whiteSpace = '';
      el.style.justifyContent = '';
      el.style.flex = '';
    }, 400);
  }
})();

/* ---------- Hero logo pointer parallax ---------- */
(function initLogoParallax() {
  var stage = document.querySelector('.hero__logo-stage');
  if (!stage) return;
  if (window.matchMedia && window.matchMedia('(hover: none)').matches) return; // skip on touch
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var hero = stage.closest('.hero');
  hero.addEventListener('mousemove', function (e) {
    var r = stage.getBoundingClientRect();
    var cx = r.left + r.width / 2;
    var cy = r.top + r.height / 2;
    var dx = (e.clientX - cx) / (window.innerWidth / 2);
    var dy = (e.clientY - cy) / (window.innerHeight / 2);
    var img = stage.querySelector('.hero__logo-img:not([style*="display: none"])') || stage.querySelector('.hero__logo-img');
    if (img) img.style.transform = 'translate(' + (dx * 14) + 'px,' + (dy * 10 - 6) + 'px)';
  });
  hero.addEventListener('mouseleave', function () {
    stage.querySelectorAll('.hero__logo-img').forEach(function (img) { img.style.transform = ''; });
  });
})();

/* ---------- Footer year ---------- */
document.getElementById('year').textContent = new Date().getFullYear();
