document.addEventListener("DOMContentLoaded", () => {
  console.log("Portfolio loaded.");

  // ─── Walkthrough Data ───────────────────────────────────────────────────────
  // Add your CLion screenshot paths and narration here.
  // Each step has: image (path), title, and description.

  const walkthroughs = {
    portal: {
      title: "Portal (C++)",
      subtitle: "C++ · SDL3 · 3D Graphics · OOP",
      repo: "https://github.com/joshua11805/customEngine",
      team: "Solo",
      steps: []
    },
    shapeshifters:
    {
      title: "Shape Shifters (Unity)",
      subtitle: "Unity · C# ",
      team: "2",
      steps: [
        {
        title: "Overview",
        description: "A semester-long project done with a partner for my Intermediate Game Design class. Our biggest strength and constraint was that my partner and I were both programmers, so we ended up creating a fighting game in which players can alternate between three shapes: Circle, Triangle, and Square. The main aim is to deplete your opponents health by hitting them or knocking them into environmental damage. I was responsible for programming the player's movement and special abilities, as well as the applying the glow shader. My partner was primarily responsible for the UI, Scene Logic, and programming the environment.",
        video: "videos/Shape_Shifters_Trailer.mp4"
        }
      ]
    },
    engine: {
      title: "Custom Game Engine",
      subtitle: "C++ · HLSL · SDL · ImGUI",
      repo: "https://github.com/joshua11805/customEngine",
      team: "Solo",
      steps: []
    }
  };

  // ─── Team Badge Helper ───────────────────────────────────────────────────────
  function formatTeam(value) {
    if (!value) return '';
    return value.trim().toLowerCase() === 'solo' ? 'Solo' : `Team · ${value.trim()}`;
  }

  function teamBadgeHTML(value) {
    const text = formatTeam(value);
    return text ? `<span class="team-badge">${text}</span>` : '';
  }

  // ─── Project Cards ──────────────────────────────────────────────────────────
  const cards = document.querySelectorAll('.project-card');
  const modal = document.getElementById('project-modal');
  const modalTitle = document.querySelector('#modal-body h3');
  const modalSubtitle = document.getElementById('modal-subtitle');
  const modalDesc = document.getElementById('modal-description');
  const closeBtn = document.querySelector('.close-btn');

  // Auto-generate title bars
  cards.forEach(card => {
    const title = card.dataset.title;
    const titleBar = document.createElement('div');
    titleBar.classList.add('project-title-bar');
    titleBar.innerHTML = `<span class="title-text">${title}</span>${teamBadgeHTML(card.dataset.team)}`;
    card.appendChild(titleBar);
  });

  // Open correct modal per card
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const walkthroughKey = card.dataset.walkthrough;

      if (walkthroughKey && walkthroughs[walkthroughKey]) {
        openWalkthroughModal(walkthroughs[walkthroughKey]);
      } else {
        openStandardModal(card);
      }
    });
  });

  // ─── Standard Modal ─────────────────────────────────────────────────────────
  function openStandardModal(card) {
    modalTitle.innerHTML = `${card.dataset.title || 'No title'}${teamBadgeHTML(card.dataset.team)}`;
    modalSubtitle.textContent = card.dataset.tech
      ? card.dataset.tech.split(',').map(t => t.trim()).join(' · ')
      : '';
    modalDesc.textContent = card.dataset.description || 'No description';

    const mediaContainer = document.getElementById('modal-media');
    const videoSrc = card.dataset.video;

    if (videoSrc) {
      if (videoSrc.includes('youtube') || videoSrc.includes('vimeo')) {
        mediaContainer.innerHTML = `
          <iframe src="${videoSrc}" width="100%" height="315" frameborder="0"
            allowfullscreen style="border-radius:8px;margin-top:1rem;"></iframe>`;
      } else {
        mediaContainer.innerHTML = `
          <video controls width="100%" style="border-radius:8px;margin-top:1rem;">
            <source src="${videoSrc}" type="video/mp4">
          </video>`;
      }
    } else {
      mediaContainer.innerHTML = `
        <img src="${card.dataset.img}" alt="Project"
             style="width:100%;border-radius:8px;margin-top:1rem;">`;
    }

    const linksContainer = document.getElementById('modal-links');
    linksContainer.innerHTML = '';
    if (card.dataset.play) {
      linksContainer.innerHTML += `<a href="${card.dataset.play}" target="_blank" class="contact-link"><i class="fas fa-play"></i> Play</a>`;
    }
    if (card.dataset.github) {
      linksContainer.innerHTML += `<a href="${card.dataset.github}" target="_blank" class="contact-link"><i class="fab fa-github"></i> GitHub</a>`;
    }
    if (card.dataset.steam) {
      linksContainer.innerHTML += `<a href="${card.dataset.steam}" target="_blank" class="contact-link"><i class="fab fa-steam"></i> Steam</a>`;
    }

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeStandardModal() {
    modal.style.display = 'none';
    document.body.style.overflow = '';
    document.getElementById('modal-media').innerHTML = '';
  }

  closeBtn.addEventListener('click', closeStandardModal);
  window.addEventListener('click', (e) => {
    if (e.target === modal) closeStandardModal();
  });

  // ─── Walkthrough Modal ───────────────────────────────────────────────────────
  const walkthroughModal = document.getElementById('walkthrough-modal');
  const walkthroughClose = document.querySelector('.walkthrough-close');

  function openWalkthroughModal(data) {
    document.getElementById('walkthrough-title').innerHTML = `${data.title}${teamBadgeHTML(data.team)}`;
    document.getElementById('walkthrough-subtitle').textContent = data.subtitle;

    const repoLink = document.getElementById('walkthrough-repo');
    if (data.repo) {
      repoLink.href = data.repo;
      repoLink.style.display = 'inline-flex';
    } else {
      repoLink.style.display = 'none';
    }

    const body = document.querySelector('.walkthrough-body');
    body.innerHTML = '';

    data.steps.forEach((step) => {
      const stepEl = document.createElement('div');
      stepEl.classList.add('walkthrough-step');

      let mediaHTML = '';
      if (step.video) {
        if (step.video.includes('youtube.com') || step.video.includes('youtu.be')) {
          const videoId = step.video.includes('youtu.be')
            ? step.video.split('youtu.be/')[1].split('?')[0]
            : new URL(step.video).searchParams.get('v');
          mediaHTML = `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0"
            allowfullscreen style="width:100%;aspect-ratio:16/9;border-radius:6px;margin-top:0.4rem;"></iframe>`;
        } else {
          mediaHTML = `<video controls style="width:100%;border-radius:6px;margin-top:0.4rem;">
            <source src="${step.video}" type="video/mp4">
          </video>`;
        }
      } else if (step.image) {
        mediaHTML = `<img src="${step.image}" alt="${step.title}"
          onerror="this.parentElement.classList.add('img-placeholder')"
          style="width:100%;border-radius:6px;margin-top:0.4rem;">`;
      }

      stepEl.innerHTML = `
        <h4>${step.title}</h4>
        ${mediaHTML ? `<div class="step-media">${mediaHTML}</div>` : ''}
        <div class="step-description">
          <p>${step.description}</p>
        </div>
      `;
      body.appendChild(stepEl);
    });

    walkthroughModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    // Scroll to top on open
    document.querySelector('.walkthrough-content').scrollTop = 0;
  }

  function closeWalkthroughModal() {
    walkthroughModal.style.display = 'none';
    document.body.style.overflow = '';
  }

  walkthroughClose.addEventListener('click', closeWalkthroughModal);
  window.addEventListener('click', (e) => {
    if (e.target === walkthroughModal) closeWalkthroughModal();
  });

  // ─── Scroll Fade-In ──────────────────────────────────────────────────────────
  const faders = document.querySelectorAll('.fade-in');
  const appearOnScroll = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

  faders.forEach(fader => appearOnScroll.observe(fader));

  // ─── Splash Animation ────────────────────────────────────────────────────────
  const canvas = document.getElementById("splash-canvas");
  const ctx = canvas.getContext("2d");
  let width, height;
  let hue = 200;
  let mouse = { x: null, y: null, radius: 100 };
  const particles = [];
  const particleCount = 300;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles.length = 0;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2 + 1,
        dx: (Math.random() - 0.5) * 1,
        dy: (Math.random() - 0.5) * 1,
      });
    }
  }

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        let dx = particles[i].x - particles[j].x;
        let dy = particles[i].y - particles[j].y;
        let distance = dx * dx + dy * dy;
        if (distance < 9000) {
          ctx.beginPath();
          ctx.strokeStyle = `hsla(${hue}, 100%, 70%, ${1 - distance / 9000})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    hue += 0.3;
    for (let p of particles) {
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > width) p.dx *= -1;
      if (p.y < 0 || p.y > height) p.dy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, 100%, 70%, 0.8)`;
      ctx.fill();
      let dx = mouse.x - p.x;
      let dy = mouse.y - p.y;
      let dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mouse.radius) {
        let angle = Math.atan2(dy, dx);
        let force = (mouse.radius - dist) / (mouse.radius * 0.3);
        p.x -= Math.cos(angle) * force;
        p.y -= Math.sin(angle) * force;
      }
    }
    drawLines();
    requestAnimationFrame(animate);
  }

  resize();
  createParticles();
  animate();

  window.addEventListener("resize", () => { resize(); createParticles(); });
  window.addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener("mouseleave", () => { mouse.x = null; mouse.y = null; });
  window.addEventListener("scroll", () => {
    const splash = document.getElementById("splash");
    let opacity = 1 - window.scrollY / (window.innerHeight * 0.8);
    splash.style.opacity = Math.max(opacity, 0);
  });
});