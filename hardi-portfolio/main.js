/* ================================================
   HARDI PORTFOLIO — main.js
   Author : Izmi Hardi
   Updated: 2026
   ================================================ */

/* ──────────────────────────────────────────────
   1. REVIEW STORAGE
────────────────────────────────────────────── */
const STORAGE_KEY = 'hardi_portfolio_reviews_v1';

function getReviews() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveReviews(reviews) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  } catch {
    console.warn('localStorage not available.');
  }
}

/* ──────────────────────────────────────────────
   2. RENDER TESTIMONIALS
────────────────────────────────────────────── */
function renderTestimonials() {
  const reviews  = getReviews();
  const container = document.getElementById('testi-area');
  if (!container) return;

  if (reviews.length === 0) {
    container.innerHTML = `
      <div class="testi-empty reveal">
        <div class="testi-empty-icon">&ldquo;</div>
        <div class="testi-empty-heading">No reviews yet</div>
        <p class="testi-empty-text">
          Be the first to share your experience working with me.
          Your honest review helps the next client decide with confidence.
        </p>
        <button class="btn-solid" onclick="openReviewModal()" style="margin-top:4px">
          Leave the First Review &rarr;
        </button>
      </div>`;
  } else {
    const renderStars = (n) =>
      '&#9733;'.repeat(n) + '&#9734;'.repeat(5 - n);

    const getInitials = (name) =>
      name.trim().split(' ').slice(0, 2)
        .map(w => w[0] ? w[0].toUpperCase() : '')
        .join('');

    const timeAgo = (iso) => {
      const diff = Date.now() - new Date(iso).getTime();
      const mins = Math.floor(diff / 60000);
      const hrs  = Math.floor(mins / 60);
      const days = Math.floor(hrs / 24);
      if (days > 0)  return `${days} hari lalu`;
      if (hrs > 0)   return `${hrs} jam lalu`;
      if (mins > 0)  return `${mins} menit lalu`;
      return 'Baru saja';
    };

    const cards = reviews.slice().reverse().map(r => {
      const meta = [r.role, r.company].filter(Boolean).join(' &middot; ');
      return `
        <div class="testi-card">
          <div class="testi-stars">${renderStars(r.stars)}</div>
          <div class="testi-quote">&ldquo;${r.text}&rdquo;</div>
          <div class="testi-rule"></div>
          <div class="testi-author">
            <div class="testi-avatar">${getInitials(r.name)}</div>
            <div>
              <div class="testi-name">${r.name}</div>
              ${meta ? `<div class="testi-meta">${meta}</div>` : ''}
              <div class="testi-meta">${r.project} &middot; ${timeAgo(r.date)}</div>
            </div>
            <div class="testi-verified">&#10003; Verified</div>
          </div>
        </div>`;
    }).join('');

    container.innerHTML = `<div class="testi-grid">${cards}</div>`;
  }

  /* Re-observe new elements for scroll reveal */
  container.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

/* ──────────────────────────────────────────────
   3. REVIEW MODAL
────────────────────────────────────────────── */
function openReviewModal() {
  const modal = document.getElementById('review-modal-bg');
  if (!modal) return;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeReviewModal() {
  const modal = document.getElementById('review-modal-bg');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';

  /* Reset form after animation completes */
  setTimeout(() => {
    const formEl    = document.getElementById('review-form-section');
    const successEl = document.getElementById('review-success-section');
    if (formEl)    formEl.style.display = '';
    if (successEl) successEl.classList.remove('visible');

    ['rv-name', 'rv-role', 'rv-company', 'rv-project', 'rv-text']
      .forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });

    const consent = document.getElementById('rv-consent');
    if (consent) consent.checked = false;

    document.querySelectorAll('#star-rating input')
      .forEach(input => (input.checked = false));
  }, 300);
}

function handleModalBackdropClick(event) {
  if (event.target === event.currentTarget) closeReviewModal();
}

/* ──────────────────────────────────────────────
   4. SUBMIT REVIEW
────────────────────────────────────────────── */
function submitReview() {
  const name    = (document.getElementById('rv-name')?.value    || '').trim();
  const role    = (document.getElementById('rv-role')?.value    || '').trim();
  const company = (document.getElementById('rv-company')?.value || '').trim();
  const project = (document.getElementById('rv-project')?.value || '').trim();
  const text    = (document.getElementById('rv-text')?.value    || '').trim();
  const consent = document.getElementById('rv-consent')?.checked;
  const starEl  = document.querySelector('#star-rating input:checked');

  /* Validate */
  if (!name)           return showToast('Nama tidak boleh kosong');
  if (!project)        return showToast('Nama project tidak boleh kosong');
  if (!starEl)         return showToast('Pilih rating bintang terlebih dahulu');
  if (text.length < 30) return showToast('Ulasan minimal 30 karakter');
  if (!consent)        return showToast('Setujui persetujuan terlebih dahulu');

  const review = {
    id:      Date.now(),
    name,
    role,
    company,
    project,
    stars:   parseInt(starEl.value, 10),
    text,
    date:    new Date().toISOString(),
  };

  const reviews = getReviews();
  reviews.push(review);
  saveReviews(reviews);
  renderTestimonials();

  /* Show success state */
  const formEl    = document.getElementById('review-form-section');
  const successEl = document.getElementById('review-success-section');
  if (formEl)    formEl.style.display = 'none';
  if (successEl) successEl.classList.add('visible');

  showToast('Review berhasil ditambahkan — terima kasih!');
}

/* ──────────────────────────────────────────────
   5. PROJECT FILTER
────────────────────────────────────────────── */
function filterProjects(category, clickedBtn) {
  /* Update active tab */
  document.querySelectorAll('.proj-tab').forEach(btn => btn.classList.remove('active'));
  clickedBtn.classList.add('active');

  /* Show/hide cards */
  document.querySelectorAll('.proj-card').forEach(card => {
    const match = category === 'all' || card.dataset.category === category;
    if (match) {
      card.style.display = '';
      card.style.opacity = '0';
      requestAnimationFrame(() => {
        card.style.transition = 'opacity 0.3s';
        card.style.opacity = '1';
      });
    } else {
      card.style.display = 'none';
    }
  });
}

/* ──────────────────────────────────────────────
   6. MOBILE NAV
────────────────────────────────────────────── */
function toggleMobileNav() {
  const mob = document.getElementById('mobile-nav');
  if (!mob) return;
  const isOpen = mob.classList.toggle('open');
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

function closeMobileNav() {
  const mob = document.getElementById('mobile-nav');
  if (!mob) return;
  mob.classList.remove('open');
  document.body.style.overflow = '';
}

/* ──────────────────────────────────────────────
   7. TOAST NOTIFICATION
────────────────────────────────────────────── */
let toastTimer = null;

function showToast(message) {
  const toast   = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ──────────────────────────────────────────────
   8. NAV ACTIVE LINK ON SCROLL
────────────────────────────────────────────── */
function updateActiveNavLink() {
  const scrollY = window.scrollY + 70;
  document.querySelectorAll('section[id]').forEach(section => {
    const link = document.querySelector(`.nav-links a[href="#${section.id}"]`);
    if (!link) return;
    const inView =
      scrollY >= section.offsetTop &&
      scrollY < section.offsetTop + section.offsetHeight;
    link.classList.toggle('active', inView);
  });
}

/* ──────────────────────────────────────────────
   9. CONTACT FORM → WHATSAPP
────────────────────────────────────────────── */
function sendToWhatsApp(event) {
  event.preventDefault();

  const name    = (document.getElementById('cf-name')?.value    || '').trim();
  const email   = (document.getElementById('cf-email')?.value   || '').trim();
  const company = (document.getElementById('cf-company')?.value || '').trim();
  const project = (document.getElementById('cf-project')?.value || '').trim();
  const message = (document.getElementById('cf-message')?.value || '').trim();

  const waNumber = '6282354728887'; // 082354728887 → format internasional

  const text = [
    `Halo Hardi! Saya menghubungi melalui portfolio website kamu.`,
    ``,
    `*Nama:* ${name}`,
    `*Email:* ${email}`,
    company ? `*Perusahaan:* ${company}` : null,
    project ? `*Jenis Project:* ${project}` : null,
    ``,
    `*Pesan:*`,
    message,
  ].filter(line => line !== null).join('\n');

  const waURL = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;

  window.open(waURL, '_blank');
}

/* ──────────────────────────────────────────────
   10. SCROLL REVEAL
────────────────────────────────────────────── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  },
  { threshold: 0.08, rootMargin: '0px 0px -28px 0px' }
);

/* ──────────────────────────────────────────────
   11. INIT
────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  /* Observe all reveal elements */
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* Render testimonials on load */
  renderTestimonials();

  /* Nav active link */
  window.addEventListener('scroll', updateActiveNavLink, { passive: true });

  /* Keyboard: close modal on Escape */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeReviewModal();
  });
});