/* ============================================================
   GRAPHICS DESIGN PORTFOLIO — 1910s Art Deco Interactive Script
   Vintage cinematic experience with modern performance
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. FILM GRAIN CANVAS
     Renders flickering grain dots on a canvas overlay inside
     the hero section, throttled to ~12 fps for an authentic
     vintage celluloid look.
  ---------------------------------------------------------- */
  function initFilmGrain() {
    const canvas = document.getElementById('grain-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const hero = canvas.closest('#hero') || canvas.parentElement;

    const resizeCanvas = () => {
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const GRAIN_FPS = 12;
    const FRAME_INTERVAL = 1000 / GRAIN_FPS;
    let lastFrame = 0;

    const drawGrain = (timestamp) => {
      requestAnimationFrame(drawGrain);
      if (timestamp - lastFrame < FRAME_INTERVAL) return;
      lastFrame = timestamp;

      const { width: w, height: h } = canvas;
      const imageData = ctx.createImageData(w, h);
      const data = imageData.data;
      const totalPixels = w * h;
      // Only touch ~40 % of pixels for a subtle, scattered grain
      const grainCount = Math.floor(totalPixels * 0.4);

      for (let i = 0; i < grainCount; i++) {
        const idx = Math.floor(Math.random() * totalPixels) * 4;
        const bright = Math.random() > 0.5;
        const value = bright ? 255 : 0;
        const alpha = Math.floor(Math.random() * 40) + 10; // 10-50
        data[idx] = value;
        data[idx + 1] = value;
        data[idx + 2] = value;
        data[idx + 3] = alpha;
      }
      ctx.putImageData(imageData, 0, 0);
    };

    requestAnimationFrame(drawGrain);
  }

  /* ----------------------------------------------------------
     2. TYPEWRITER EFFECT
     Types out the hero tagline letter-by-letter with a
     blinking cursor at the end.
  ---------------------------------------------------------- */
  function initTypewriter() {
    const el = document.querySelector('.typewriter-text');
    if (!el) return;

    const fullText = el.textContent.trim();
    el.textContent = '';
    el.style.visibility = 'visible';

    let charIndex = 0;
    const CHAR_SPEED = 80;     // ms per character
    const cursor = '|';

    const type = () => {
      if (charIndex <= fullText.length) {
        el.textContent = fullText.slice(0, charIndex) + cursor;
        charIndex++;
        setTimeout(type, CHAR_SPEED);
      } else {
        // Blinking cursor after typing completes
        el.textContent = fullText + cursor;
        setInterval(() => {
          el.textContent = el.textContent.endsWith(cursor)
            ? fullText
            : fullText + cursor;
        }, 530);
      }
    };

    setTimeout(type, 1500);
  }

  /* ----------------------------------------------------------
     3. SCROLL ANIMATIONS (Intersection Observer)
     Adds .visible to .animate-in and .animate-section elements
     when they enter the viewport. Staggers children delays
     through a CSS custom property.
  ---------------------------------------------------------- */
  function initScrollAnimations() {
    const targets = document.querySelectorAll('.animate-in, .animate-section');
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          el.classList.add('visible');

          // Stagger children that are also .animate-in
          const children = el.querySelectorAll('.animate-in');
          children.forEach((child, idx) => {
            child.style.setProperty('--delay', `${idx * 100}ms`);
            child.classList.add('visible');
          });

          observer.unobserve(el);
        });
      },
      { threshold: 0.15 }
    );

    targets.forEach((t) => observer.observe(t));
  }

  /* ----------------------------------------------------------
     4. SMOOTH SCROLL NAVIGATION
     Intercepts nav link clicks and smoothly scrolls to the
     target section. Closes mobile nav on link click.
  ---------------------------------------------------------- */
  function initSmoothScroll() {
    const navLinks = document.querySelectorAll('#side-nav a');

    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        e.preventDefault();

        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }

        // Close mobile nav
        closeMobileNav();
      });
    });
  }

  /* ----------------------------------------------------------
     5. MOBILE NAVIGATION TOGGLE
     .nav-toggle opens / closes #side-nav with a body scroll
     lock. Clicking outside the nav dismisses it.
  ---------------------------------------------------------- */
  function closeMobileNav() {
    const nav = document.getElementById('side-nav');
    if (nav) nav.classList.remove('nav-open');
    document.body.classList.remove('nav-open');
  }

  function initMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('side-nav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      nav.classList.toggle('nav-open');
      document.body.classList.toggle('nav-open');
    });

    // Close when clicking outside the nav panel
    document.addEventListener('click', (e) => {
      if (
        nav.classList.contains('nav-open') &&
        !nav.contains(e.target) &&
        !toggle.contains(e.target)
      ) {
        closeMobileNav();
      }
    });
  }

  /* ----------------------------------------------------------
     6. PORTFOLIO GALLERY FILTER
     Filters .project-card elements with a fade/scale
     transition and staggered reveal.
  ---------------------------------------------------------- */
  function initGalleryFilter() {
    const buttons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-card');
    if (!buttons.length || !cards.length) return;

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        // Swap active button
        buttons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        // Determine which cards match
        cards.forEach((card, index) => {
          const category = card.getAttribute('data-category');
          const matches = filter === 'all' || category === filter;

          if (!matches) {
            // Fade out
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 300);
          } else {
            // Fade in with stagger
            setTimeout(() => {
              card.style.display = '';
              // Force reflow so the transition triggers
              void card.offsetHeight;
              card.style.opacity = '1';
              card.style.transform = 'scale(1)';
            }, index * 80);
          }
        });
      });
    });
  }

  /* ----------------------------------------------------------
     7. DYNAMIC SPOTLIGHT ON GALLERY CARDS
     A radial-gradient overlay chases the cursor over each
     .project-card, emulating a vintage desk-lamp highlight.
  ---------------------------------------------------------- */
  function initSpotlight() {
    const cards = document.querySelectorAll('.project-card');
    if (!cards.length) return;

    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty(
          '--spotlight',
          `radial-gradient(circle 180px at ${x}px ${y}px,
            rgba(212, 175, 55, 0.18) 0%,
            rgba(212, 175, 55, 0.06) 40%,
            transparent 70%)`
        );
        card.style.backgroundImage = `var(--spotlight)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.removeProperty('--spotlight');
        card.style.backgroundImage = '';
      });
    });
  }

  /* ----------------------------------------------------------
     8. PARALLAX ON SCROLL
     Gently shifts .parallax-element vertically at a fraction
     of the scroll speed for depth.
  ---------------------------------------------------------- */
  function initParallax() {
    const elements = document.querySelectorAll('.parallax-element');
    if (!elements.length) return;

    let ticking = false;

    const updateParallax = () => {
      const scrollY = window.scrollY;
      elements.forEach((el) => {
        const speed = parseFloat(el.dataset.speed) || 0.3;
        el.style.transform = `translateY(${scrollY * speed}px)`;
      });
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    });
  }

  /* ----------------------------------------------------------
     9. CONTACT FORM (Visual Only)
     Shows a "TELEGRAM SENT ✓" vintage stamp on submit,
     then resets after 3 s.
  ---------------------------------------------------------- */
  function initContactForm() {
    const form = document.querySelector('.telegram-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      // Create stamp
      const stamp = document.createElement('div');
      stamp.className = 'telegram-sent';
      stamp.textContent = 'TELEGRAM SENT ✓';
      form.appendChild(stamp);

      // Trigger animation on next frame
      requestAnimationFrame(() => stamp.classList.add('stamp-in'));

      // Reset after 3 seconds
      setTimeout(() => {
        stamp.remove();
        form.reset();
        if (submitBtn) submitBtn.disabled = false;
      }, 3000);
    });
  }

  /* ----------------------------------------------------------
     10. FILM COUNTDOWN ON LOAD
     Flashes 3 → 2 → 1 in classic silent-film style before
     revealing the page content.
  ---------------------------------------------------------- */
  function initCountdown() {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.id = 'countdown-overlay';
      Object.assign(overlay.style, {
        position: 'fixed',
        inset: '0',
        zIndex: '99999',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.4s ease',
      });

      const numEl = document.createElement('span');
      Object.assign(numEl.style, {
        fontFamily: "'Playfair Display SC', serif",
        fontSize: '8rem',
        color: '#fff',
        opacity: '0',
        transform: 'scale(1.6)',
        transition: 'opacity 0.25s ease, transform 0.35s ease',
      });
      overlay.appendChild(numEl);
      document.body.appendChild(overlay);

      const numbers = [3, 2, 1];
      let idx = 0;
      const DISPLAY_TIME = 400;

      const showNext = () => {
        if (idx >= numbers.length) {
          // Fade out overlay
          overlay.style.opacity = '0';
          setTimeout(() => {
            overlay.remove();
            resolve();
          }, 450);
          return;
        }

        numEl.textContent = numbers[idx];
        // Reset and animate in
        numEl.style.opacity = '0';
        numEl.style.transform = 'scale(1.6)';

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            numEl.style.opacity = '1';
            numEl.style.transform = 'scale(1)';
          });
        });

        idx++;
        setTimeout(showNext, DISPLAY_TIME);
      };

      showNext();
    });
  }

  /* ----------------------------------------------------------
     11. CUSTOM VINTAGE CURSOR
     Renders a gold Art Deco crosshair that follows the mouse
     on non-touch devices. Grows on interactive element hover.
  ---------------------------------------------------------- */
  function initCustomCursor() {
    // Only enable for pointer-capable devices
    if (!window.matchMedia('(hover: hover)').matches) return;

    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);

    // Style the crosshair (+ shape via borders)
    Object.assign(cursor.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '20px',
      height: '20px',
      pointerEvents: 'none',
      zIndex: '100000',
      transition: 'width 0.15s, height 0.15s, margin 0.15s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    });

    // Horizontal line
    const hLine = document.createElement('span');
    Object.assign(hLine.style, {
      position: 'absolute',
      width: '100%',
      height: '1.5px',
      background: '#d4af37',
    });
    cursor.appendChild(hLine);

    // Vertical line
    const vLine = document.createElement('span');
    Object.assign(vLine.style, {
      position: 'absolute',
      height: '100%',
      width: '1.5px',
      background: '#d4af37',
    });
    cursor.appendChild(vLine);

    // Small centre dot
    const dot = document.createElement('span');
    Object.assign(dot.style, {
      position: 'absolute',
      width: '3px',
      height: '3px',
      borderRadius: '50%',
      background: '#d4af37',
    });
    cursor.appendChild(dot);

    document.body.classList.add('custom-cursor-active');

    // Follow the mouse
    document.addEventListener('mousemove', (e) => {
      cursor.style.transform = `translate(${e.clientX - 10}px, ${e.clientY - 10}px)`;
    });

    // Grow on interactive elements
    const interactives = 'a, button, .filter-btn, .nav-toggle, input, textarea';

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactives)) {
        cursor.style.width = '32px';
        cursor.style.height = '32px';
        cursor.style.marginLeft = '-6px';
        cursor.style.marginTop = '-6px';
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactives)) {
        cursor.style.width = '20px';
        cursor.style.height = '20px';
        cursor.style.marginLeft = '0';
        cursor.style.marginTop = '0';
      }
    });
  }

  /* ----------------------------------------------------------
     12. SECTION ACTIVE TRACKING
     Keeps the side-nav highlight in sync with the currently
     visible section via Intersection Observer.
  ---------------------------------------------------------- */
  function initActiveTracking() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('#side-nav a');
    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;

          navLinks.forEach((link) => {
            const matches = link.getAttribute('href') === `#${id}`;
            link.classList.toggle('active', matches);
          });
        });
      },
      { threshold: 0.25, rootMargin: '-10% 0px -60% 0px' }
    );

    sections.forEach((s) => observer.observe(s));
  }

  /* ----------------------------------------------------------
     13. INITIALIZATION
     Orchestrates the startup sequence: countdown first,
     then everything else in parallel.
  ---------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    // Phase 1 — cinematic countdown
    initCountdown().then(() => {
      // Phase 2 — bring the page to life
      initFilmGrain();
      initTypewriter();
      initScrollAnimations();
      initSmoothScroll();
      initMobileNav();
      initGalleryFilter();
      initSpotlight();
      initParallax();
      initContactForm();
      initCustomCursor();
      initActiveTracking();
    });
  });
})();
