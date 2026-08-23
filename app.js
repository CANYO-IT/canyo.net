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


/* ---------- Hero status typing effect ---------- */
(function initHeroStatus() {
  var el = document.querySelector('.hero__status');
  if (!el) return;
  var fullText = el.textContent.trim();
  // Respect reduced motion
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Keep the pulse dot, type the text after it
  var dot = el.querySelector('.pulse-dot');
  var textNode = Array.prototype.find.call(el.childNodes, function(n){ return n.nodeType === 3 && n.textContent.trim().length; });
  if (!textNode) return;

  var target = textNode.textContent;
  textNode.textContent = '';
  var i = 0;
  var type = function () {
    if (i <= target.length) {
      textNode.textContent = ' ' + target.slice(0, i);
      i++;
      setTimeout(type, 28);
    }
  };
  setTimeout(type, 500);
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
