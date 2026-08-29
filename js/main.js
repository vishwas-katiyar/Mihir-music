/**
 * MIHIR SOUND & LIGHT — MAIN APPLICATION SCRIPT
 * 2027 Kinetic Industrial Minimalist Design System
 * 
 * Features:
 * - Mobile navigation toggle
 * - Smooth scroll navigation
 * - Interactive contact form with WhatsApp integration
 * - Gallery drag-to-scroll
 * - Intersection Observer for reveal animations
 * - Testimonial slider
 * - Tilt card effects
 * - System time display
 */

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const WA_NUMBER = '917000051042';
const WA_BASE_URL = 'https://api.whatsapp.com/send';
const COMPANY_NAME = 'Mihir Sound & Light';
const COMPANY_PHONE = '+91 70000 51042';

// ============================================================================
// APPLICATION INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  initMobileNavigation();
  initSmoothScrollNavigation();
  initContactForm();
  initWhatsAppLinks();
  initScrollReveal();
  initGalleryDrag();
  initTestimonialSlider();
  initTiltCards();
  initSystemTime();
  initExploreGearButton();
});

// ============================================================================
// 1. MOBILE NAVIGATION TOGGLE
// ============================================================================

function initMobileNavigation() {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('[data-nav]');
  const navMenuItems = document.querySelectorAll('[data-nav] .nav-link');

  if (!navToggle || !navLinks) return;

  // Toggle menu on hamburger click
  navToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close menu on nav link click
  navMenuItems.forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
      navLinks.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}

// ============================================================================
// 2. SMOOTH SCROLL NAVIGATION
// ============================================================================

function initSmoothScrollNavigation() {
  // Nav links with anchors
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;

      const targetId = href.substring(1);
      const target = document.getElementById(targetId);

      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Scroll indicator button
  const scrollBtn = document.querySelector('[data-scroll]');
  if (scrollBtn) {
    scrollBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = scrollBtn.dataset.scroll?.substring(1);
      const target = targetId ? document.getElementById(targetId) : null;
      
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        // Scroll to next section
        window.scrollBy({ top: window.innerHeight - 100, behavior: 'smooth' });
      }
    });
  }
}

// ============================================================================
// 3. CONTACT FORM WITH WHATSAPP INTEGRATION
// ============================================================================

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  const phoneInput = form.querySelector('input[name="phone"]');
  const dateInput = form.querySelector('input[name="date"]');
  const timeInput = form.querySelector('input[name="time"]');
  const venueInput = form.querySelector('input[name="venue"]');
  const serviceSelect = form.querySelector('select[name="service"]');

  // Format phone input to Indian format
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 10) value = value.slice(0, 10);
      
      if (value.length === 0) {
        e.target.value = '';
      } else if (value.length <= 3) {
        e.target.value = value;
      } else if (value.length <= 6) {
        e.target.value = value.slice(0, 3) + ' ' + value.slice(3);
      } else if (value.length <= 10) {
        e.target.value = value.slice(0, 3) + ' ' + value.slice(3, 6) + ' ' + value.slice(6);
      }
    });

    // Validate phone
    phoneInput.addEventListener('blur', (e) => {
      const digits = e.target.value.replace(/\D/g, '');
      if (digits.length !== 10 && e.target.value.trim()) {
        e.target.classList.add('error');
      } else {
        e.target.classList.remove('error');
      }
    });
  }

  // Set minimum date to today
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form values
    const name = form.querySelector('input[name="name"]')?.value?.trim() || '';
    const phone = form.querySelector('input[name="phone"]')?.value?.replace(/\D/g, '') || '';
    const date = form.querySelector('input[name="date"]')?.value || '';
    const time = form.querySelector('input[name="time"]')?.value || '';
    const venue = form.querySelector('input[name="venue"]')?.value?.trim() || '';
    const service = form.querySelector('select[name="service"]')?.value || '';
    const guests = form.querySelector('input[name="guests"]')?.value?.trim() || '';

    // Validate required fields
    if (!name || !phone || !date || !venue || !service) {
      showFormError('Please fill in all required fields');
      return;
    }

    if (phone.length !== 10) {
      showFormError('Phone number must be 10 digits');
      return;
    }

    // Build WhatsApp message
    const message = buildWhatsAppMessage({
      name,
      phone,
      date,
      time,
      venue,
      service,
      guests
    });

    // Send to WhatsApp
    sendToWhatsApp(message);

    // Show success message
    showFormSuccess(form);
  });
}

function buildWhatsAppMessage({ name, phone, date, time, venue, service, guests }) {
  const formattedDate = formatDate(date);
  const timeStr = time ? ` at ${time}` : '';
  const guestsStr = guests ? `\nGuests: ~${guests}` : '';

  const message = `Hi Mihir! 🎵🎬\n\n`
    + `I'd like to book *${service}* for my event.\n\n`
    + `*Event Details:*\n`
    + `📅 Date: ${formattedDate}${timeStr}\n`
    + `📍 Venue: ${venue}\n`
    + guestsStr + '\n\n'
    + `*Contact:*\n`
    + `👤 Name: ${name}\n`
    + `📱 Phone: +91${phone}\n\n`
    + `Looking forward to working with you!`;

  return message;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-IN', options);
}

function sendToWhatsApp(message) {
  const encodedMsg = encodeURIComponent(message);
  const whatsappUrl = `${WA_BASE_URL}?phone=${WA_NUMBER}&text=${encodedMsg}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
}

function showFormError(errorMsg) {
  const form = document.getElementById('contact-form');
  if (!form) return;

  // Remove existing error
  const existingError = form.querySelector('.form-error-message');
  if (existingError) existingError.remove();

  // Create and show error
  const errorDiv = document.createElement('div');
  errorDiv.className = 'form-error-message';
  errorDiv.setAttribute('role', 'alert');
  errorDiv.textContent = `⚠ ${errorMsg}`;
  errorDiv.style.cssText = `
    background: rgba(255, 99, 71, 0.1);
    border: 1px solid rgba(255, 99, 71, 0.5);
    color: #ff6347;
    padding: var(--space-md);
    margin-bottom: var(--space-md);
    font-family: var(--font-mono);
    font-size: 0.85rem;
  `;
  form.insertBefore(errorDiv, form.firstChild);

  // Auto-remove after 5 seconds
  setTimeout(() => errorDiv.remove(), 5000);
}

function showFormSuccess(form) {
  // Clear form
  form.reset();

  // Show success message
  const successDiv = document.createElement('div');
  successDiv.className = 'form-success-message';
  successDiv.setAttribute('role', 'status');
  successDiv.innerHTML = `✓ Redirecting to WhatsApp...<br><small>Check your WhatsApp in a moment.</small>`;
  successDiv.style.cssText = `
    background: rgba(76, 175, 80, 0.1);
    border: 1px solid rgba(76, 175, 80, 0.5);
    color: #4caf50;
    padding: var(--space-md);
    margin-bottom: var(--space-md);
    font-family: var(--font-mono);
    font-size: 0.85rem;
    text-align: center;
  `;
  form.insertBefore(successDiv, form.firstChild);

  // Remove after 3 seconds
  setTimeout(() => successDiv.remove(), 3000);
}

// ============================================================================
// 4. WHATSAPP LINKS
// ============================================================================

function initWhatsAppLinks() {
  document.querySelectorAll('[data-wa="true"]').forEach((el) => {
    const customMsg = el.dataset.waMsg || 
      `Hi Mihir! I want to book your Sound & Light services for my event.`;
    const encodedMsg = encodeURIComponent(customMsg);
    el.href = `${WA_BASE_URL}?phone=${WA_NUMBER}&text=${encodedMsg}`;
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener noreferrer');
  });
}

// ============================================================================
// 5. SCROLL REVEAL ANIMATIONS
// ============================================================================

function initScrollReveal() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal').forEach((el) => {
    observer.observe(el);
  });
}

// ============================================================================
// 6. GALLERY DRAG-TO-SCROLL
// ============================================================================

function initGalleryDrag() {
  const gallery = document.getElementById('gallery-track');
  if (!gallery) return;

  let isDown = false;
  let startX = 0;
  let scrollLeft = 0;

  gallery.addEventListener('mousedown', (e) => {
    isDown = true;
    gallery.style.cursor = 'grabbing';
    startX = e.pageX - gallery.offsetLeft;
    scrollLeft = gallery.scrollLeft;
  });

  gallery.addEventListener('mouseleave', () => {
    isDown = false;
    gallery.style.cursor = 'grab';
  });

  gallery.addEventListener('mouseup', () => {
    isDown = false;
    gallery.style.cursor = 'grab';
  });

  gallery.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    const x = e.pageX - gallery.offsetLeft;
    const walk = (x - startX) * 2;
    gallery.scrollLeft = scrollLeft - walk;
  });

  // Touch support
  gallery.addEventListener('touchstart', (e) => {
    isDown = true;
    startX = e.touches[0].pageX - gallery.offsetLeft;
    scrollLeft = gallery.scrollLeft;
  });

  gallery.addEventListener('touchend', () => {
    isDown = false;
  });

  gallery.addEventListener('touchmove', (e) => {
    if (!isDown) return;
    const x = e.touches[0].pageX - gallery.offsetLeft;
    const walk = (x - startX) * 2;
    gallery.scrollLeft = scrollLeft - walk;
  });
}

// ============================================================================
// 7. TESTIMONIAL SLIDER
// ============================================================================

function initTestimonialSlider() {
  const testimonials = [
    {
      name: 'Rohan Verma',
      role: 'Event Manager',
      text: 'Flawless execution. The line arrays were dialed in perfectly, and Mihir coordinated the lighting cues like a broadcast control room.'
    },
    {
      name: 'Priya Singh',
      role: 'Wedding Coordinator',
      text: 'Our sangeet came alive with their DMX pixel design. The golden beam choreography was exactly what we imagined.'
    },
    {
      name: 'Vikram Nair',
      role: 'Festival Director',
      text: 'Fast load-in, bulletproof show calling, and zero downtime. They understand fest logistics better than anyone.'
    }
  ];

  let currentIndex = 0;

  function renderTestimonial() {
    const track = document.getElementById('testimonial-track');
    if (!track) return;

    const item = testimonials[currentIndex];
    track.innerHTML = `
      <figure class="testimonial-card glass-card" style="opacity: 0; animation: fadeIn 400ms forwards;">
        <blockquote>
          <p>"${item.text}"</p>
        </blockquote>
        <figcaption>
          <strong>${item.name}</strong>
          <small>${item.role}</small>
        </figcaption>
      </figure>
    `;
  }

  document.querySelectorAll('.slider-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const dir = btn.dataset.dir;
      if (dir === 'next') {
        currentIndex = (currentIndex + 1) % testimonials.length;
      } else {
        currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
      }
      renderTestimonial();
    });
  });

  renderTestimonial();
}

// ============================================================================
// 8. TILT CARD EFFECTS
// ============================================================================

function initTiltCards() {
  const tiltCards = document.querySelectorAll('[data-tilt]');
  if (tiltCards.length === 0) return;

  tiltCards.forEach((card) => {
    const intensity = Number(card.dataset.tiltIntensity || 8);
    
    const setTilt = (xRatio, yRatio) => {
      const x = xRatio * intensity;
      const y = yRatio * intensity;
      card.style.transform = `perspective(1000px) rotateX(${y}deg) rotateY(${x}deg) scale(1.02)`;
    };

    const handleMove = (evt) => {
      const rect = card.getBoundingClientRect();
      const x = ((evt.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((evt.clientY - rect.top) / rect.height - 0.5) * 2;
      setTilt(x, y);
    };

    const reset = () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    };

    card.addEventListener('mousemove', handleMove);
    card.addEventListener('mouseleave', reset);

    card.addEventListener('touchstart', (evt) => {
      const touch = evt.touches[0];
      const rect = card.getBoundingClientRect();
      const x = ((touch.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((touch.clientY - rect.top) / rect.height - 0.5) * 2;
      setTilt(x, y);
    });

    card.addEventListener('touchend', reset);
  });
}

// ============================================================================
// 9. SYSTEM TIME DISPLAY
// ============================================================================

function initSystemTime() {
  const timeEl = document.getElementById('system-time');
  if (!timeEl) return;

  const updateTime = () => {
    const now = new Date();
    const utcOffset = 5.5; // IST is UTC+5:30
    const istTime = new Date(now.getTime() + (utcOffset * 60 * 60 * 1000));
    
    const hours = String(istTime.getUTCHours()).padStart(2, '0');
    const minutes = String(istTime.getUTCMinutes()).padStart(2, '0');
    const seconds = String(istTime.getUTCSeconds()).padStart(2, '0');
    
    timeEl.textContent = `UTC +05:30 • ${hours}:${minutes}:${seconds}`;
  };

  updateTime();
  setInterval(updateTime, 1000);
}

// ============================================================================
// 10. EXPLORE GEAR BUTTON
// ============================================================================

function initExploreGearButton() {
  const gearBtn = document.querySelector('[data-action="explore-gear"]');
  if (gearBtn) {
    gearBtn.addEventListener('click', () => {
      const gearSection = document.getElementById('gear');
      if (gearSection) {
        gearSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }
}

// ============================================================================
// CSS ANIMATIONS (injected)
// ============================================================================

const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .form-error-message,
  .form-success-message {
    animation: fadeIn 300ms ease-out;
  }

  [data-nav].is-open {
    display: flex !important;
  }

  @media (max-width: 768px) {
    [data-nav] {
      position: fixed;
      top: 100px;
      left: 0;
      right: 0;
      display: none;
      flex-direction: column;
      background: var(--bg-primary);
      border-bottom: 1px solid var(--border-grid);
      z-index: 999;
      gap: var(--space-md);
      padding: var(--space-lg);
    }
  }
`;
document.head.appendChild(style);

// ============================================================================
// EXPORT FOR EXTERNAL ACCESS
// ============================================================================

window.MihirApp = {
  sendToWhatsApp,
  buildWhatsAppMessage,
  formatDate,
  initContactForm
};
