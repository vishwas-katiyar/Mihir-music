const WA_LINK = 'https://api.whatsapp.com/send?phone=917000051042&text=Hi%20Mihir%2C%20I%20want%20to%20book%20your%20Sound%20%26%20Light%20services!';

document.addEventListener('DOMContentLoaded', () => {
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Bind WhatsApp links
  document.querySelectorAll('[data-wa="true"]').forEach((el) => {
    el.href = WA_LINK;
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noreferrer');
  });

  // Smooth scroll for buttons
  document.querySelectorAll('[data-scroll]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = document.querySelector(btn.dataset.scroll);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Mobile nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('[data-nav]');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // Event showcase grid (static deck)
  const feed = document.getElementById('event-feed');
  if (feed) {
    const items = [
      {
        title: 'Arena Night',
        desc: '10k-capacity college fest with flown arrays and pixel beams.',
        location: 'Indore Arena',
        label: 'Campus',
        accent: 'Live crowd',
        stat: '10K',
        statLabel: 'crowd ready',
      },
      {
        title: 'Luxury Sangeet',
        desc: 'Gold-forward light design with soft wash and tight vocal mixes.',
        location: 'Udaipur Palace',
        label: 'Wedding',
        accent: 'Golden wash',
        stat: '360°',
        statLabel: 'light feel',
      },
      {
        title: 'Club Takeover',
        desc: 'Bass-heavy house night with haze, strobes, and live MC sets.',
        location: 'Basement 360°',
        label: 'Nightlife',
        accent: 'Laser stack',
        stat: '128ch',
        statLabel: 'audio mix',
      },
      {
        title: 'Corporate Launch',
        desc: 'Stage-managed keynotes with cue-stacked lighting transitions.',
        location: 'TechNova HQ',
        label: 'Brand',
        accent: 'Clean cues',
        stat: '4K',
        statLabel: 'led stage',
      },
      {
        title: 'Destination Wedding',
        desc: 'Beachfront rig with weather-protected stacks and aerial beams.',
        location: 'Goa Mandap',
        label: 'Destination',
        accent: 'Coastal rig',
        stat: '24h',
        statLabel: 'load-in',
      },
      {
        title: 'Indie Gig',
        desc: 'Warm vocal profile, precise side-fills, and immersive pixel bars.',
        location: 'Campus Yard',
        label: 'Live Music',
        accent: 'Intimate stage',
        stat: '1x1',
        statLabel: 'spotlight',
      },
    ];

    items.forEach((item, idx) => {
      const tile = document.createElement('li');
      tile.className = 'event-tile-wrap';

      const card = document.createElement('figure');
      card.className = 'gig-tile holo';
      card.setAttribute('data-tilt', '');
      card.setAttribute('data-tilt-intensity', '7');
      card.innerHTML = `
        <div class="gig-tile__glow" aria-hidden="true"></div>
        <div class="gig-tile__grid" aria-hidden="true"></div>
        <div class="gig-tile__beam" aria-hidden="true"></div>
        <div class="gig-media" aria-hidden="true">
          <span class="gig-media__label">${item.stat}</span>
          <div class="gig-media__art">
            <span class="gig-media__orb"></span>
            <span class="gig-media__ring"></span>
            <span class="gig-media__bar gig-media__bar--one"></span>
            <span class="gig-media__bar gig-media__bar--two"></span>
            <span class="gig-media__bar gig-media__bar--three"></span>
          </div>
        </div>
        <div class="gig-meta">
          <span class="gig-index">${String(idx + 1).padStart(2, '0')}</span>
          <p>${item.location}</p>
        </div>
        <div class="gig-topline">
          <span class="gig-chip">${item.label}</span>
          <span class="gig-accent">${item.accent}</span>
        </div>
        <h4>${item.title}</h4>
        <figcaption class="gig-copy">${item.desc}</figcaption>
        <div class="gig-footer">
          <span class="gig-stat"><strong>${item.stat}</strong><small>${item.statLabel}</small></span>
          <span class="gig-stat gig-stat--right"><strong>${item.location}</strong><small>${item.accent}</small></span>
        </div>
      `;
      tile.appendChild(card);
      feed.appendChild(tile);
    });
  }

  const tiltCards = document.querySelectorAll('[data-tilt]');
  if (tiltCards.length) {
    const bindTilt = (card) => {
      const intensity = Number(card.dataset.tiltIntensity || 8);
      const setTilt = (xRatio, yRatio) => {
        card.style.setProperty('--tiltX', `${-(yRatio * intensity)}deg`);
        card.style.setProperty('--tiltY', `${xRatio * intensity}deg`);
      };
      const handleMove = (evt) => {
        const rect = card.getBoundingClientRect();
        const x = ((evt.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((evt.clientY - rect.top) / rect.height - 0.5) * 2;
        setTilt(x, y);
      };
      const reset = () => setTilt(0, 0);
      card.addEventListener('mousemove', handleMove);
      card.addEventListener('mouseleave', reset);
      card.addEventListener('touchstart', (evt) => {
        const touch = evt.touches[0];
        if (!touch) return;
        const rect = card.getBoundingClientRect();
        const x = ((touch.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((touch.clientY - rect.top) / rect.height - 0.5) * 2;
        setTilt(x, y);
      }, { passive: true });
      card.addEventListener('touchend', reset);
    };

    tiltCards.forEach(bindTilt);
  }

  // Testimonials slider
  const testimonials = [
    {
      quote: 'Mihir’s crew dialed the vocal mix and lighting cues better than touring acts we’ve hired before.',
      author: 'DJ Rishi — Bass Cartel',
    },
    {
      quote: 'The wedding looked like a Paris runway show. Gold beams, haze, and perfect timing.',
      author: 'Pooja & Nikhil — Jaipur Wedding',
    },
    {
      quote: 'Corporate launch with zero hiccups. Cue stacks, rehearsals, and soundcheck were flawless.',
      author: 'Aditi — TechNova India',
    },
  ];

  const track = document.getElementById('testimonial-track');
  let current = 0;

  function renderTestimonials() {
    if (!track) return;
    track.innerHTML = testimonials
      .map(
        (t, idx) => `
        <article class="testimonial ${idx === current ? 'is-active' : ''}">
          <p class="quote">“${t.quote}”</p>
          <p class="author">${t.author}</p>
        </article>`
      )
      .join('');
  }

  renderTestimonials();

  document.querySelectorAll('.slider-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      current = btn.dataset.dir === 'next'
        ? (current + 1) % testimonials.length
        : (current - 1 + testimonials.length) % testimonials.length;
      renderTestimonials();
    });
  });

  // Footer year
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Scroll reveal
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  // Infinite horizontal gallery - Drag to Scroll (Removed wheel hijack to allow vertical scrolling)
  const galleryTrack = document.getElementById('gallery-track');
  if (galleryTrack) {
    let isDown = false;
    let startX;
    let scrollLeft;

    galleryTrack.addEventListener('mousedown', (e) => {
      isDown = true;
      galleryTrack.classList.add('is-dragging');
      startX = e.pageX - galleryTrack.offsetLeft;
      scrollLeft = galleryTrack.scrollLeft;
    });

    galleryTrack.addEventListener('mouseleave', () => {
      isDown = false;
      galleryTrack.classList.remove('is-dragging');
    });

    galleryTrack.addEventListener('mouseup', () => {
      isDown = false;
      galleryTrack.classList.remove('is-dragging');
    });

    galleryTrack.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - galleryTrack.offsetLeft;
      const walk = (x - startX) * 2; // Scroll speed multiplier
      galleryTrack.scrollLeft = scrollLeft - walk;
    });

    galleryTrack.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      if (!touch) return;
      isDown = true;
      galleryTrack.classList.add('is-dragging');
      startX = touch.pageX - galleryTrack.offsetLeft;
      scrollLeft = galleryTrack.scrollLeft;
    }, { passive: true });

    galleryTrack.addEventListener('touchend', () => {
      isDown = false;
      galleryTrack.classList.remove('is-dragging');
    });

    galleryTrack.addEventListener('touchmove', (e) => {
      if (!isDown) return;
      const touch = e.touches[0];
      if (!touch) return;
      const x = touch.pageX - galleryTrack.offsetLeft;
      const walk = (x - startX) * 2;
      galleryTrack.scrollLeft = scrollLeft - walk;
    }, { passive: true });
  }

  // Setup parallax has been removed in previous step, ensuring clean init.
});

function setupHeroParallax(motionQuery) {
  const hero = document.querySelector('#hero');
  const parallax = document.querySelector('.hero-parallax');
  if (!hero || !parallax) return;
  const setProps = (x = 0, y = 0) => {
    document.documentElement.style.setProperty('--parallaxX', `${x}px`);
    document.documentElement.style.setProperty('--parallaxY', `${y}px`);
  };
  const handleMove = (evt) => {
    const rect = hero.getBoundingClientRect();
    const x = ((evt.clientX - rect.left) / rect.width - 0.5) * 40;
    const y = ((evt.clientY - rect.top) / rect.height - 0.5) * 30;
    setProps(x, y);
  };
  const reset = () => setProps(0, 0);

  const bind = () => {
    hero.addEventListener('mousemove', handleMove);
    hero.addEventListener('mouseleave', reset);
  };

  const unbind = () => {
    hero.removeEventListener('mousemove', handleMove);
    hero.removeEventListener('mouseleave', reset);
    reset();
  };

  // Remove hero parallax logic since we removed the elements
  const scrollHandler = () => {
    const scroll = window.scrollY;
    // We can keep this if needed, but it's not being used by the new hero
  };
  window.addEventListener('scroll', scrollHandler, { passive: true });
}

function initHeroPrism(motionQuery) {
  // Prism removed
}

// Three.js Golden Ambient Background
(function initThree() {
  if (typeof THREE === 'undefined') return;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 2, 8);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x0a0a0a, 0); 
  renderer.domElement.classList.add('three-canvas');
  document.body.insertBefore(renderer.domElement, document.body.firstChild);

  const ambient = new THREE.AmbientLight(0xd4af37, 0.5);
  scene.add(ambient);

  const pointLight = new THREE.PointLight(0xffffff, 1, 20);
  pointLight.position.set(0, 5, 0);
  scene.add(pointLight);

  // Equalizer Ring (Represents Sound & Light)
  const eqGroup = new THREE.Group();
  scene.add(eqGroup);

  const numBars = 48;
  const radius = 3.5;
  const barGeo = new THREE.CylinderGeometry(0.1, 0.1, 1, 8);
  const barMat = new THREE.MeshStandardMaterial({ 
    color: 0xd4af37,
    metalness: 0.8,
    roughness: 0.2,
    emissive: 0xd4af37,
    emissiveIntensity: 0.2,
    transparent: true,
    opacity: 0.8
  });

  const bars = [];
  for (let i = 0; i < numBars; i++) {
    const bar = new THREE.Mesh(barGeo, barMat);
    const angle = (i / numBars) * Math.PI * 2;
    bar.position.x = Math.cos(angle) * radius;
    bar.position.z = Math.sin(angle) * radius;
    bar.position.y = 0;
    
    bar.lookAt(0, 0, 0);
    eqGroup.add(bar);
    bars.push({ mesh: bar, angle, offset: Math.random() * Math.PI * 2 });
  }

  // Floating particles (Dust/Atmosphere)
  const particleGeo = new THREE.BufferGeometry();
  const particleCount = 300;
  const posArray = new Float32Array(particleCount * 3);
  for(let i = 0; i < particleCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 20;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  const particleMat = new THREE.PointsMaterial({
    size: 0.04,
    color: 0xffffff,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // Subtle central glow
  const glowGeo = new THREE.PlaneGeometry(8, 8);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xd4af37,
    transparent: true,
    opacity: 0.05,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  glow.rotation.x = -Math.PI / 2;
  scene.add(glow);

  let t = 0;
  const animate = () => {
    t += 0.01;
    
    // Animate equalizer bars
    bars.forEach((b) => {
      const height = 1 + Math.sin(t * 3 + b.angle * 4 + b.offset) * 1.5 + Math.sin(t * 2 - b.angle * 2) * 1;
      const finalHeight = Math.max(0.1, height);
      b.mesh.scale.y = finalHeight;
      b.mesh.position.y = finalHeight / 2 - 0.5; // Keep base anchored
      
      // Dynamic emissive
      b.mesh.material.emissiveIntensity = 0.1 + (finalHeight * 0.15);
    });

    eqGroup.rotation.y = t * 0.2;
    eqGroup.rotation.x = Math.sin(t * 0.5) * 0.1 + 0.1;
    eqGroup.position.y = Math.sin(t * 0.8) * 0.2 - 1;

    particles.rotation.y = t * 0.05;
    particles.rotation.x = t * 0.02;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
