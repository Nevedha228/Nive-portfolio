// DOM Elements
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section');
const overlay = document.getElementById('overlay');
const overlayCard = document.getElementById('overlay-card');

// Mobile Navigation
function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on links
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      }
    });
  }
}

// Initialize particles
function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let particles = [];
  let w = canvas.width = window.innerWidth;
  let h = canvas.height = window.innerHeight;

  // Create particles
  function createParticles(count) {
    return Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2 + 0.6,
      vx: Math.random() * 0.4 - 0.2,
      vy: Math.random() * 0.4 - 0.1,
      alpha: Math.random() * 0.17 + 0.05
    }));
  }

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, w, h);
    
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      
      // Boundary check
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
      ctx.fill();
    });

    requestAnimationFrame(animate);
  }

  // Handle resize
  window.addEventListener('resize', () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    particles = createParticles(w < 768 ? 60 : 120);
  });

  // Start animation
  particles = createParticles(w < 768 ? 60 : 120);
  animate();
}

// Navigation highlighting
function updateActiveNav() {
  const scrollPosition = window.scrollY + window.innerHeight * 0.35;

  sections.forEach((section, i) => {
    const sectionTop = section.offsetTop;
    const sectionBottom = sectionTop + section.offsetHeight;
    const navLink = navLinks[i];

    if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
      navLink.classList.add('active');
    } else {
      navLink.classList.remove('active');
    }
  });
}

// Scroll animations
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// Contact form submission
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const formData = {
    name: contactForm.querySelector('input[name="name"]').value.trim(),
    email: contactForm.querySelector('input[name="email"]').value.trim(),
    message: contactForm.querySelector('textarea').value.trim()
  };

  // Validate inputs
  if (!formData.name || !formData.email || !formData.message) {
    showFormStatus('All fields are required', 'error');
    return;
  }

  if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
    showFormStatus('Please enter a valid email', 'error');
    return;
  }

  submitBtn.disabled = true;
  showFormStatus('Sending message...', 'pending');

  try {
    const response = await fetch('http://localhost:3001/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || 'Failed to send message');
    }

    const data = await response.json();
    showFormStatus(data.message || 'Message sent successfully!', 'success');
    contactForm.reset();
  } catch (error) {
    console.error('Submission error:', error);
    showFormStatus(`Error: ${error.message}`, 'error');
  } finally {
    submitBtn.disabled = false;
  }
}

function showFormStatus(message, type) {
  formStatus.textContent = message;
  formStatus.className = ''; // Clear previous classes
  formStatus.classList.add(type);
  
  if (type !== 'pending') {
    setTimeout(() => formStatus.textContent = '', 5000);
  }
}

// Project modal
function initProjectModals() {
  document.querySelectorAll('.proj').forEach(project => {
    project.addEventListener('click', () => {
      try {
        const data = JSON.parse(project.getAttribute('data-project'));
        
        overlayCard.innerHTML = `
          <h2 id="modal-title">${data.title}</h2>
          <p>${data.desc}</p>
          <div class="tags-container">
            ${data.tech.map(t => `<span class="tag">${t}</span>`).join('')}
          </div>
          <a href="${data.link || '#'}" class="btn" target="_blank">
            View Project
          </a>
        `;
        
        overlay.classList.add('show');
        document.getElementById('modal-title').focus();
      } catch (error) {
        console.error('Error opening project modal:', error);
      }
    });
  });
}

// Enhanced Certificate Viewer
function openCertificate(filePath) {
  const modal = document.getElementById('certModal');
  const pdfViewer = document.getElementById('pdfViewer');
  const certImage = document.getElementById('certImage');
  const fallback = document.getElementById('fallbackMessage');
  const downloadLink = document.getElementById('downloadLink');

  // Reset displays
  pdfViewer.style.display = 'none';
  certImage.style.display = 'none';
  fallback.style.display = 'none';

  // Set download link
  downloadLink.href = filePath;

  try {
    if (filePath.endsWith('.pdf')) {
      // Handle PDF files
      pdfViewer.style.display = 'block';
      pdfViewer.src = filePath + '#toolbar=0&navpanes=0';
    } else {
      // Handle image files
      certImage.style.display = 'block';
      certImage.src = filePath;
    }
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
  } catch (error) {
    console.error("Error loading certificate:", error);
    fallback.style.display = 'block';
    modal.style.display = "block";
  }
}

function initCertificateViewer() {
  document.querySelectorAll('.cert-box').forEach(box => {
    box.addEventListener('click', function() {
      // Extract path from onclick attribute
      const onclickContent = this.getAttribute('onclick');
      const certPath = onclickContent.match(/'(.*?)'/)[1];
      openCertificate(certPath);
    });
  });
}

function closeModal() {
  document.getElementById('certModal').style.display = "none";
  document.body.style.overflow = "auto";
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
  initMobileNav(); // Add this line
  initParticles();
  initScrollAnimations();
  initProjectModals();
  initCertificateViewer();
  
  if (contactForm) {
    contactForm.addEventListener('submit', handleFormSubmit);
  }

  window.addEventListener('scroll', updateActiveNav);
  updateActiveNav(); // Initial call
});

// Close modals
function closeOverlay() {
  overlay.classList.remove('show');
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeOverlay();
    closeModal();
  }
});

// Close modal when clicking outside content
document.addEventListener('click', (e) => {
  if (e.target === overlay) {
    closeOverlay();
  }
  
  const certModal = document.getElementById('certModal');
  if (e.target === certModal) {
    closeModal();
  }
});
// Toggle certificates visibility
function toggleCertificates() {
  const certGrid = document.getElementById('certificates-grid');
  const seeAllBtn = document.getElementById('seeAllBtn');
  const hiddenCerts = document.querySelectorAll('.hidden-cert');
  
  certGrid.classList.toggle('show-all');
  seeAllBtn.classList.toggle('show-less');
  
  if (certGrid.classList.contains('show-all')) {
    seeAllBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Show Less';
    
    // Animate the appearance of hidden certificates
    hiddenCerts.forEach((cert, index) => {
      setTimeout(() => {
        cert.style.opacity = '0';
        cert.style.transform = 'translateY(20px)';
        cert.style.display = 'flex';
        
        setTimeout(() => {
          cert.style.transition = 'all 0.5s ease';
          cert.style.opacity = '1';
          cert.style.transform = 'translateY(0)';
        }, 50);
      }, index * 100);
    });
  } else {
    seeAllBtn.innerHTML = '<i class="fas fa-chevron-down"></i> See All Certificates';
    
    // Hide certificates with animation
    hiddenCerts.forEach((cert, index) => {
      setTimeout(() => {
        cert.style.opacity = '0';
        cert.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
          cert.style.display = 'none';
        }, 500);
      }, index * 50);
    });
  }
}

// Initialize certificates
function initCertificates() {
  const hiddenCerts = document.querySelectorAll('.hidden-cert');
  hiddenCerts.forEach(cert => {
    cert.style.display = 'none';
    cert.style.opacity = '0';
    cert.style.transform = 'translateY(20px)';
  });
}

// Update your DOMContentLoaded event to include initCertificates
document.addEventListener('DOMContentLoaded', () => {
  // Your existing initialization code
  initMobileNav();
  initParticles();
  initScrollAnimations();
  initProjectModals();
  initCertificateViewer();
  initCertificates(); // Add this line
  
  if (contactForm) {
    contactForm.addEventListener('submit', handleFormSubmit);
  }

  window.addEventListener('scroll', updateActiveNav);
  updateActiveNav();
});