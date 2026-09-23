document.addEventListener("DOMContentLoaded", () => {
  console.log("Portfolio loaded.");

  // ─── Team Badge Helper ───────────────────────────────────────────────────────
  function formatTeam(value) {
    if (!value) return '';
    return value.trim().toLowerCase() === 'solo' ? 'Solo' : `Team · ${value.trim()}`;
  }

  function teamBadgeHTML(value) {
    const text = formatTeam(value);
    return text ? `<span class="team-badge">${text}</span>` : '';
  }

  function yearBadgeHTML(value) {
    if (!value) return '';
    return `<span class="team-badge">${value}</span>`;
  }

  function skillsBadgeHTML(value) {
    if (!value) return '';
    return value.split(',').map(skill => `<span class="team-badge">${skill.trim()}</span>`).join('');
  }

  // ─── Project Cards ──────────────────────────────────────────────────────────
  const cards = document.querySelectorAll('.project-card');

  // Auto-generate title bars
  cards.forEach(card => {
    const title = card.dataset.title;
    const titleBar = document.createElement('div');
    titleBar.classList.add('project-title-bar');
    titleBar.innerHTML = `<span class="title-text">${title}</span>${teamBadgeHTML(card.dataset.team)}${yearBadgeHTML('2026')}`;
    card.appendChild(titleBar);

    const role = card.querySelector('.project-info p');
    if (role && card.dataset.skills) {
      role.insertAdjacentHTML('beforeend', skillsBadgeHTML(card.dataset.skills));
    }
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
  const particleCount = 1000;

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
});