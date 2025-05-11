document.addEventListener('DOMContentLoaded', () => {
  initializeProjects();
  addEventListeners();
});

function initializeProjects() {
  const projectsSection = document.getElementById('projectsSection');
  
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.15}s`;
  });
}

function addEventListeners() {
  const projectsBtn = document.getElementById('projectsBtn');
  const projectsSection = document.getElementById('projectsSection');
  
  if (projectsBtn && projectsSection) {
    projectsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      if (projectsSection.classList.contains('active')) {
        projectsSection.classList.remove('active');
        setTimeout(() => {
          projectsSection.style.display = 'none';
        }, 400);
      } else {
        projectsSection.style.display = 'block';
        void projectsSection.offsetWidth;
        projectsSection.classList.add('active');
      }
    });
  }
  
  const links = document.querySelectorAll('.link');
  links.forEach(link => {
    link.addEventListener('mouseenter', createRippleEffect);
  });
}

function createRippleEffect(e) {
  const link = e.currentTarget;
  
  const existingRipple = link.querySelector('.ripple');
  if (existingRipple) {
    existingRipple.remove();
  }
  
  const ripple = document.createElement('span');
  ripple.classList.add('ripple');
  ripple.style.width = ripple.style.height = `${Math.max(link.offsetWidth, link.offsetHeight)}px`;
  
  const rect = link.getBoundingClientRect();
  ripple.style.left = `${e.clientX - rect.left - ripple.offsetWidth / 2}px`;
  ripple.style.top = `${e.clientY - rect.top - ripple.offsetHeight / 2}px`;
  
  link.appendChild(ripple);
  
  setTimeout(() => {
    ripple.remove();
  }, 600);
}

const style = document.createElement('style');
style.textContent = `
  .link {
    position: relative;
    overflow: hidden;
  }
  
  .ripple {
    position: absolute;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    transform: scale(0);
    animation: ripple 0.6s linear;
    pointer-events: none;
  }
  
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  .project-card {
    animation: fadeInUp 0.5s ease forwards;
    opacity: 0;
    transform: translateY(20px);
  }
  
  @keyframes fadeInUp {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

document.head.appendChild(style);