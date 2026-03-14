document.addEventListener("DOMContentLoaded", () => {
  console.log("Portfolio loaded.");

  // Project Modal Setup
  const cards = document.querySelectorAll('.project-card');
  const modal = document.getElementById('project-modal');
  const modalTitle = document.querySelector('#modal-body h3');
  const modalImg = document.getElementById('modal-image');
  const modalDesc = document.getElementById('modal-description');
  const closeBtn = document.querySelector('.close-btn');

  // Scroll-based fade-in observer
  const faders = document.querySelectorAll('.fade-in');

  const appearOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };

  const appearOnScroll = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, appearOptions);

  faders.forEach(fader => {
    appearOnScroll.observe(fader);
  });

  
  cards.forEach(card => {
    card.addEventListener('click', () => {
      modalTitle.textContent = card.dataset.title || 'No title';
      modalImg.src = card.dataset.img || '';
      modalDesc.textContent = card.dataset.description || 'No description';
      modal.style.display = 'flex';
    });
  });

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });


  // Splash Screen Animation
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
        baseX: this.x,
        baseY: this.y
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
      // Move
      p.x += p.dx;
      p.y += p.dy;

      // Bounce off edges
      if (p.x < 0 || p.x > width) p.dx *= -1;
      if (p.y < 0 || p.y > height) p.dy *= -1;

      // Draw
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${hue}, 100%, 70%, 0.8)`;
      ctx.fill();

      // Mouse interaction
      //creates a small smearing effects on the particles nearby 
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

  window.addEventListener("resize", () => {
    resize();
    createParticles();
  });

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Fade splash on scroll
  window.addEventListener("scroll", () => {
    const splash = document.getElementById("splash");
    let opacity = 1 - window.scrollY / (window.innerHeight * 0.8);
    splash.style.opacity = Math.max(opacity, 0);
  });
});
