/**
 * La Indonesian – Landing Page Script
 * Handles: navbar, countdown, counter animation,
 *          lead form validation & submit, scroll-top,
 *          scroll-reveal, smooth anchor scroll
 */

'use strict';

/* ============================================================
   UTILITY
============================================================ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================
   1. NAVBAR – hamburger toggle
============================================================ */
function initNavbar() {
  const btn     = $('.hamburger');
  const mobileNav = $('#mobile-nav');
  if (!btn || !mobileNav) return;

  btn.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    btn.classList.toggle('active', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
    mobileNav.setAttribute('aria-hidden', String(!isOpen));
  });

  // Close on link click
  $$('a', mobileNav).forEach(a => {
    a.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      btn.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !mobileNav.contains(e.target)) {
      mobileNav.classList.remove('open');
      btn.classList.remove('active');
      btn.setAttribute('aria-expanded', 'false');
      mobileNav.setAttribute('aria-hidden', 'true');
    }
  });
}

/* ============================================================
   2. COUNTDOWN TIMER
   Target: 45 days from page load (pre-launch placeholder)
============================================================ */
function initCountdown() {
  const daysEl  = $('#cd-days');
  const hoursEl = $('#cd-hours');
  const minsEl  = $('#cd-mins');
  const secsEl  = $('#cd-secs');
  if (!daysEl) return;

  // Set launch date 45 days ahead
  const launch = new Date();
  launch.setDate(launch.getDate() + 45);
  launch.setHours(0, 0, 0, 0);

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const now  = Date.now();
    const diff = launch.getTime() - now;

    if (diff <= 0) {
      daysEl.textContent = hoursEl.textContent = minsEl.textContent = secsEl.textContent = '00';
      return;
    }

    const days  = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000)  / 60000);
    const secs  = Math.floor((diff % 60000)    / 1000);

    daysEl.textContent  = pad(days);
    hoursEl.textContent = pad(hours);
    minsEl.textContent  = pad(mins);
    secsEl.textContent  = pad(secs);
  }

  tick();
  setInterval(tick, 1000);
}

/* ============================================================
   3. COUNTER ANIMATION (stats bar)
============================================================ */
function animateCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 1800; // ms
  const start    = performance.now();

  function step(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target).toLocaleString('id-ID');
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function initCounters() {
  const counters = $$('.stat__num[data-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

/* ============================================================
   4. LEAD FORM VALIDATION & SUBMIT
============================================================ */
function initLeadForm() {
  const form        = $('#leadForm');
  const formSuccess = $('#formSuccess');
  const successName = $('#successName');
  const submitBtn   = $('#submitBtn');
  if (!form) return;

  /* ---- Validation rules ---- */
  const rules = {
    fname:  { required: true, minLength: 2, label: 'Nama Lengkap' },
    femail: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, label: 'Email' },
    fphone: { required: true, pattern: /^(\+62|62|0)8[1-9][0-9]{6,11}$/, label: 'Nomor WhatsApp' },
    fcity:  { required: true, minLength: 2, label: 'Kota / Kabupaten' },
  };

  function getError(id, value) {
    const rule = rules[id];
    if (!rule) return '';
    const v = value.trim();
    if (rule.required && !v) return `${rule.label} wajib diisi.`;
    if (rule.minLength && v.length < rule.minLength) return `${rule.label} minimal ${rule.minLength} karakter.`;
    if (rule.pattern && !rule.pattern.test(v)) {
      if (id === 'femail') return 'Format email tidak valid. Contoh: kamu@email.com';
      if (id === 'fphone') return 'Format nomor WA tidak valid. Contoh: 081234567890';
    }
    return '';
  }

  function setFieldState(input, errMsg) {
    const errEl = input.closest('.form-group').querySelector('.field-err');
    if (errMsg) {
      input.classList.add('error');
      input.classList.remove('valid');
      input.setAttribute('aria-invalid', 'true');
      if (errEl) errEl.textContent = errMsg;
    } else {
      input.classList.remove('error');
      input.classList.add('valid');
      input.setAttribute('aria-invalid', 'false');
      if (errEl) errEl.textContent = '';
    }
  }

  // Inline validation on blur
  Object.keys(rules).forEach(id => {
    const input = $(`#${id}`, form);
    if (!input) return;

    input.addEventListener('blur', () => {
      const err = getError(id, input.value);
      setFieldState(input, err);
    });

    input.addEventListener('input', () => {
      if (input.classList.contains('error')) {
        const err = getError(id, input.value);
        setFieldState(input, err);
      }
    });
  });

  /* ---- Submit ---- */
  form.addEventListener('submit', async e => {
    e.preventDefault();

    // Validate all fields
    let valid = true;
    Object.keys(rules).forEach(id => {
      const input = $(`#${id}`, form);
      if (!input) return;
      const err = getError(id, input.value);
      setFieldState(input, err);
      if (err) { valid = false; if (valid === false) { /* first error */ } }
    });

    if (!valid) {
      // Focus first error field
      const firstErr = form.querySelector('.error');
      if (firstErr) firstErr.focus();
      return;
    }

    // Show loading state
    const btnText    = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    submitBtn.disabled = true;
    btnText.hidden    = true;
    btnLoading.hidden = false;
    btnLoading.removeAttribute('aria-hidden');

    // Simulate async submission (replace with real API call)
    await simulateSubmit({
      name:     $('#fname', form).value.trim(),
      email:    $('#femail', form).value.trim(),
      phone:    $('#fphone', form).value.trim(),
      city:     $('#fcity', form).value.trim(),
      interest: $('#finterest', form).value,
    });

    // Show success
    const firstName = $('#fname', form).value.trim().split(' ')[0];
    successName.textContent = firstName;
    form.hidden           = true;
    formSuccess.hidden    = false;
    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

/** Simulates a 1.5s network request. Replace with fetch() to a real endpoint. */
function simulateSubmit(data) {
  console.log('Form submitted:', data); // dev log
  return new Promise(resolve => setTimeout(resolve, 1500));
}

/* ============================================================
   5. SCROLL-REVEAL (IntersectionObserver)
============================================================ */
function initScrollReveal() {
  const targets = $$([
    '.pricing-card',
    '.menu-card',
    '.feat-card',
    '.testi-card',
    '.step',
    '.about__content',
    '.about__visual',
    '.faq-item',
  ].join(','));

  if (!targets.length || !('IntersectionObserver' in window)) {
    targets.forEach(el => el.style.opacity = '1');
    return;
  }

  // Set initial hidden state via inline style (avoids FOUC if CSS isn't loaded yet)
  targets.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity .55s ease ${(i % 4) * 0.1}s, transform .55s ease ${(i % 4) * 0.1}s`;
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => observer.observe(el));
}

/* ============================================================
   6. SMOOTH ANCHOR SCROLL (offset for sticky navbar)
============================================================ */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const targetId = a.getAttribute('href');
      if (targetId === '#') return;
      const target = $(targetId);
      if (!target) return;
      e.preventDefault();
      const navHeight = $('.navbar')?.offsetHeight ?? 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 12;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ============================================================
   7. SCROLL-TO-TOP BUTTON
============================================================ */
function initScrollTop() {
  const btn = document.createElement('button');
  btn.className = 'scroll-top';
  btn.setAttribute('aria-label', 'Kembali ke atas');
  btn.innerHTML = '↑';
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================
   8. PRICING TOGGLE – harian / bulanan
============================================================ */
function initPricingToggle() {
  const btnDaily   = $('#toggleDaily');
  const btnMonthly = $('#toggleMonthly');
  if (!btnDaily || !btnMonthly) return;

  const amounts  = $$('.price-amount');
  const periods  = $$('.price-period');
  const equivs   = $$('.price-equiv');

  function switchTo(mode) {
    // Update toggle buttons
    const isMonthly = mode === 'monthly';
    btnDaily.classList.toggle('toggle-btn--active', !isMonthly);
    btnMonthly.classList.toggle('toggle-btn--active', isMonthly);
    btnDaily.setAttribute('aria-pressed', String(!isMonthly));
    btnMonthly.setAttribute('aria-pressed', String(isMonthly));

    // Update each price amount, period, and equiv text
    amounts.forEach(el => {
      el.textContent = isMonthly ? el.dataset.monthly : el.dataset.daily;
    });
    periods.forEach(el => {
      el.textContent = isMonthly ? el.dataset.monthly : el.dataset.daily;
    });
    equivs.forEach(el => {
      const val = isMonthly ? el.dataset.monthly : el.dataset.daily;
      el.textContent = val || '';
    });
  }

  btnDaily.addEventListener('click',   () => switchTo('daily'));
  btnMonthly.addEventListener('click', () => switchTo('monthly'));
}

/* ============================================================
   9. NAVBAR SHADOW ON SCROLL
============================================================ */
function initNavbarScroll() {
  const navbar = $('.navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.style.boxShadow = window.scrollY > 10
      ? '0 4px 20px rgba(107,63,31,.15)'
      : '';
  }, { passive: true });
}

/* ============================================================
   INIT – run after DOM ready
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initCountdown();
  initCounters();
  initLeadForm();
  initPricingToggle();
  initScrollReveal();
  initSmoothScroll();
  initScrollTop();
  initNavbarScroll();
});
