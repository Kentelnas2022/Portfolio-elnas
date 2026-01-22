import './style.css'
import { gsap } from 'gsap'

// Modern Particle Cursor Animation with Smooth Trails
const canvas = document.getElementById('cursor-canvas');
const ctx = canvas.getContext('2d');

// Detect if device is mobile/touch-only
const isTouchDevice = () => {
  return (('ontouchstart' in window) ||
     (navigator.maxTouchPoints > 0) ||
     (navigator.msMaxTouchPoints > 0));
};

const isMobile = isTouchDevice();

// Set canvas size
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();

// Handle resize with debouncing for performance
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(resizeCanvas, 150);
});

// Cursor system
const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
const particles = [];
const trailPoints = [];
const maxTrailPoints = isMobile ? 8 : 15;
const maxParticles = isMobile ? 40 : 80;
const colors = [
  { r: 59, g: 130, b: 246 },   // Blue
  { r: 139, g: 92, b: 246 },   // Purple  
  { r: 6, g: 182, b: 212 },    // Cyan
  { r: 168, g: 85, b: 247 },   // Violet
];

// Particle class for floating elements
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = Math.random() * 1.5 + 0.5;
    this.speedX = Math.random() * 2 - 1;
    this.speedY = Math.random() * 2 - 1;
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.life = 1;
    this.decay = Math.random() * 0.01 + 0.005;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life -= this.decay;
    this.size = Math.max(0, this.size - 0.02);
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.life;
    
    // Outer glow
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3);
    gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.8)`);
    gradient.addColorStop(0.5, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.4)`);
    gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner bright core
    ctx.fillStyle = `rgba(255, 255, 255, ${this.life * 0.8})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
}

// Track mouse movement
let lastMouse = { x: mouse.x, y: mouse.y };

// Mouse events for desktop
window.addEventListener('mousemove', (e) => {
  if (isMobile) return; // Skip on mobile
  
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  handleMovement();
});

// Touch events for mobile
window.addEventListener('touchmove', (e) => {
  if (!isMobile) return; // Skip on desktop
  
  const touch = e.touches[0];
  mouse.x = touch.clientX;
  mouse.y = touch.clientY;
  handleMovement();
  e.preventDefault();
}, { passive: false });

window.addEventListener('touchstart', (e) => {
  if (!isMobile) return;
  
  const touch = e.touches[0];
  mouse.x = touch.clientX;
  mouse.y = touch.clientY;
  lastMouse.x = mouse.x;
  lastMouse.y = mouse.y;
});

// Unified movement handler
function handleMovement() {
  // Add trail point
  trailPoints.push({
    x: mouse.x,
    y: mouse.y,
    time: Date.now()
  });
  
  // Limit trail length
  if (trailPoints.length > maxTrailPoints) {
    trailPoints.shift();
  }
  
  // Create particles on movement
  const speed = Math.hypot(mouse.x - lastMouse.x, mouse.y - lastMouse.y);
  if (speed > 2 && particles.length < maxParticles) {
    const particleCount = Math.min(isMobile ? 1 : 2, Math.floor(speed / 5));
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(
        mouse.x + (Math.random() - 0.5) * 8,
        mouse.y + (Math.random() - 0.5) * 8
      ));
    }
  }
  
  lastMouse.x = mouse.x;
  lastMouse.y = mouse.y;
}

// Draw smooth trail with gradient
function drawTrail() {
  if (trailPoints.length < 2) return;
  
  const currentTime = Date.now();
  
  for (let i = 1; i < trailPoints.length; i++) {
    const point = trailPoints[i];
    const prevPoint = trailPoints[i - 1];
    const age = currentTime - point.time;
    const maxAge = 800;
    const life = 1 - (age / maxAge);
    
    if (life <= 0) continue;
    
    const progress = i / trailPoints.length;
    const colorIndex = Math.floor(progress * (colors.length - 1));
    const color = colors[colorIndex];
    
    // Draw trail segment with gradient
    const gradient = ctx.createLinearGradient(prevPoint.x, prevPoint.y, point.x, point.y);
    gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${life * 0.2})`);
    gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, ${life * 0.3})`);
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = (progress * 3 + 1) * life;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(prevPoint.x, prevPoint.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  }
}

// Draw small cursor glow effect (only on desktop)
function drawCursorGlow() {
  if (isMobile) return; // Don't show cursor glow on mobile
  
  // Outer glow
  const outerGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 40);
  outerGlow.addColorStop(0, 'rgba(139, 92, 246, 0.12)');
  outerGlow.addColorStop(0.3, 'rgba(59, 130, 246, 0.08)');
  outerGlow.addColorStop(0.6, 'rgba(6, 182, 212, 0.04)');
  outerGlow.addColorStop(1, 'rgba(168, 85, 247, 0)');
  
  ctx.fillStyle = outerGlow;
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, 40, 0, Math.PI * 2);
  ctx.fill();
  
  // Middle ring with animation
  const time = Date.now() * 0.001;
  const ringSize = 12 + Math.sin(time * 2) * 2;
  
  const ringGradient = ctx.createRadialGradient(mouse.x, mouse.y, ringSize - 2, mouse.x, mouse.y, ringSize + 2);
  ringGradient.addColorStop(0, 'rgba(139, 92, 246, 0)');
  ringGradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.25)');
  ringGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
  
  ctx.strokeStyle = ringGradient;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, ringSize, 0, Math.PI * 2);
  ctx.stroke();
  
  // Inner bright core
  const coreGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 8);
  coreGlow.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
  coreGlow.addColorStop(0.3, 'rgba(139, 92, 246, 0.5)');
  coreGlow.addColorStop(0.7, 'rgba(59, 130, 246, 0.25)');
  coreGlow.addColorStop(1, 'rgba(6, 182, 212, 0)');
  
  ctx.fillStyle = coreGlow;
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, 8, 0, Math.PI * 2);
  ctx.fill();
  
  // Central dot
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, 1.5, 0, Math.PI * 2);
  ctx.fill();
}

// Animation loop with performance optimization
let lastTime = 0;
const fps = isMobile ? 30 : 60; // Lower FPS on mobile for better performance
const fpsInterval = 1000 / fps;

function animate(currentTime) {
  requestAnimationFrame(animate);
  
  // Throttle frame rate on mobile
  if (isMobile) {
    const elapsed = currentTime - lastTime;
    if (elapsed < fpsInterval) return;
    lastTime = currentTime - (elapsed % fpsInterval);
  }
  
  // Fade effect for trail
  ctx.fillStyle = 'rgba(15, 20, 25, 0.15)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw trail
  drawTrail();
  
  // Update and draw particles
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();
    
    if (particles[i].life <= 0) {
      particles.splice(i, 1);
    }
  }
  
  // Draw cursor glow
  drawCursorGlow();
  
  // Clean up old trail points
  const currentTimeStamp = Date.now();
  while (trailPoints.length > 0 && currentTimeStamp - trailPoints[0].time > 800) {
    trailPoints.shift();
  }
}

animate(0);

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      // Close mobile menu if open
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu) {
        mobileMenu.classList.add('hidden');
      }
    }
  });
});

// Mobile menu toggle
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuButton && mobileMenu) {
  // Toggle menu on button click
  mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    // Toggle hamburger to X animation
    const icon = mobileMenuButton.querySelector('i');
    if (icon) {
      icon.classList.toggle('fa-bars');
      icon.classList.toggle('fa-times');
    }
  });
  
  // Close menu when clicking any link inside
  const mobileMenuLinks = mobileMenu.querySelectorAll('a');
  mobileMenuLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      const icon = mobileMenuButton.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    });
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
      mobileMenu.classList.add('hidden');
      const icon = mobileMenuButton.querySelector('i');
      if (icon) {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
      }
    }
  });
}

// Intersection Observer for fade-in animations
const observerOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe all sections and cards
document.querySelectorAll('.fade-in-section').forEach(el => {
  observer.observe(el);
});

// Split Text Animation for hero heading with colors
const typingHeading = document.getElementById('typing-heading');
if (typingHeading) {
  const parts = [
    { text: "Hi, I'm ", color: "" },
    { text: "Kent Zorel", color: "text-blue-500", lineBreak: true },
    { text: "Elnas", color: "text-cyan-400" }
  ];
  
  // Build the full HTML with colored spans and character wrapping
  let fullHTML = '';
  parts.forEach(part => {
    const chars = part.text.split('');
    const wrappedChars = chars.map(char => {
      // Preserve spaces
      const displayChar = char === ' ' ? '&nbsp;' : char;
      return `<span class="split-char" style="display: inline-block;">${displayChar}</span>`;
    }).join('');
    
    if (part.color) {
      fullHTML += `<span class="${part.color}">${wrappedChars}</span>`;
    } else {
      fullHTML += wrappedChars;
    }
    
    // Add line break if specified
    if (part.lineBreak) {
      fullHTML += '<br>';
    }
  });
  
  typingHeading.innerHTML = fullHTML;
  
  // Get all character spans
  const chars = typingHeading.querySelectorAll('.split-char');
  
  // Set initial state
  gsap.set(chars, {
    opacity: 0,
    y: 40,
    rotationX: -90
  });
  
  // Animate each character with stagger
  gsap.to(chars, {
    opacity: 1,
    y: 0,
    rotationX: 0,
    duration: 1.25,
    ease: "power3.out",
    stagger: 0.05, // 50ms delay between each character
    delay: 0.3,
    onComplete: () => {
      console.log('All letters have animated!');
    }
  });
}

// QR Code Modal
const qrButton = document.getElementById('qr-button');
const qrModal = document.getElementById('qr-modal');
const closeQr = document.getElementById('close-qr');

if (qrButton && qrModal) {
  qrButton.addEventListener('click', () => {
    qrModal.classList.remove('hidden');
    qrModal.classList.add('flex');
  });
}

if (closeQr && qrModal) {
  closeQr.addEventListener('click', () => {
    qrModal.classList.add('hidden');
    qrModal.classList.remove('flex');
  });
  
  // Close modal when clicking outside
  qrModal.addEventListener('click', (e) => {
    if (e.target === qrModal) {
      qrModal.classList.add('hidden');
      qrModal.classList.remove('flex');
    }
  });
}

// Skill badge click animation
document.querySelectorAll('.skill-badge').forEach(badge => {
  badge.addEventListener('click', function() {
    // Remove animation class if it exists
    this.classList.remove('animate-bounce');
    
    // Force reflow to restart animation
    void this.offsetWidth;
    
    // Add animation class
    this.classList.add('animate-bounce');
    
    // Remove animation class after animation completes
    setTimeout(() => {
      this.classList.remove('animate-bounce');
    }, 1000);
  });
});
