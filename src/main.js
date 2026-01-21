import './style.css'

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
  mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
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

// Typing animation for hero heading with 2 colors
const typingHeading = document.getElementById('typing-heading');
if (typingHeading) {
  const parts = [
    { text: "Hi, I'm ", color: "" },
    { text: "Kent Zorel ", color: "text-blue-500" },
    { text: "Elnas", color: "text-cyan-400" }
  ];
  
  let currentPart = 0;
  let currentChar = 0;
  let displayText = '';
  
  function typeHeading() {
    if (currentPart < parts.length) {
      const part = parts[currentPart];
      
      if (currentChar < part.text.length) {
        const char = part.text[currentChar];
        
        if (currentChar === 0 && part.color) {
          displayText += `<span class="${part.color}">`;
        }
        
        displayText += char;
        
        if (currentChar === part.text.length - 1 && part.color) {
          displayText += '</span>';
        }
        
        typingHeading.innerHTML = displayText;
        currentChar++;
        setTimeout(typeHeading, 80);
      } else {
        currentPart++;
        currentChar = 0;
        setTimeout(typeHeading, 80);
      }
    }
  }
  
  setTimeout(typeHeading, 500);
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
