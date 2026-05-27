/* ============================================================
   StudyAI – JavaScript Logic
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- THEME TOGGLE (Dark/Light Mode) ---------- */
  const themeToggle = document.getElementById('theme-toggle');
  const htmlEl = document.documentElement;
  
  // Check local storage or system preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    htmlEl.setAttribute('data-theme', 'dark');
  } else {
    htmlEl.removeAttribute('data-theme');
  }

  themeToggle.addEventListener('click', () => {
    if (htmlEl.hasAttribute('data-theme')) {
      htmlEl.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    } else {
      htmlEl.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }
  });

  /* ---------- NAVBAR SCROLL EFFECT ---------- */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  /* ---------- MOBILE MENU ---------- */
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active'); // You can add CSS to animate hamburger into an X
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      hamburger.classList.remove('active');
    });
  });

  /* ---------- POMODORO TIMER LOGIC ---------- */
  const timerDisplay = document.getElementById('time-display');
  const timerBtn = document.getElementById('timer-btn');
  const timerStatus = document.getElementById('timer-status');
  const timerTabs = document.querySelectorAll('.timer-tab');
  
  let countdown;
  let isTimerRunning = false;
  let timeRemaining = 25 * 60; // Default 25 mins

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(timeRemaining);
    document.title = `${formatTime(timeRemaining)} - StudyAI Focus`;
  }

  function startTimer() {
    isTimerRunning = true;
    timerBtn.textContent = 'Pause Session';
    timerBtn.classList.replace('btn-primary', 'btn-outline');
    timerStatus.textContent = 'Focusing... Stay off your phone!';
    
    countdown = setInterval(() => {
      timeRemaining--;
      updateTimerDisplay();
      
      if (timeRemaining <= 0) {
        clearInterval(countdown);
        isTimerRunning = false;
        timerBtn.textContent = 'Start Session';
        timerBtn.classList.replace('btn-outline', 'btn-primary');
        timerStatus.textContent = 'Session complete! Take a break.';
        document.title = 'StudyAI | Make sense of your study chaos';
        alert('Time is up!');
      }
    }, 1000);
  }

  function pauseTimer() {
    clearInterval(countdown);
    isTimerRunning = false;
    timerBtn.textContent = 'Resume Session';
    timerBtn.classList.replace('btn-outline', 'btn-primary');
    timerStatus.textContent = 'Session paused.';
  }

  timerBtn.addEventListener('click', () => {
    if (isTimerRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  });

  timerTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      // Pause if running
      if (isTimerRunning) pauseTimer();
      
      // Update active styling
      timerTabs.forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      
      // Reset time
      const minutes = parseInt(e.target.getAttribute('data-time'), 10);
      timeRemaining = minutes * 60;
      updateTimerDisplay();
      
      timerBtn.textContent = 'Start Session';
      timerStatus.textContent = 'Ready to focus?';
      document.title = 'StudyAI | Make sense of your study chaos';
    });
  });

  /* ---------- CONTACT FORM VALIDATION ---------- */
  const contactForm = document.getElementById('contact-form');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');
  const successMsg = document.getElementById('form-success');

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function showError(input, errorId) {
    input.parentElement.classList.add('error');
  }

  function removeError(input) {
    input.parentElement.classList.remove('error');
  }

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    let isValid = true;
    
    // Reset success message
    successMsg.style.display = 'none';

    // Validate Name
    if (nameInput.value.trim() === '') {
      showError(nameInput);
      isValid = false;
    } else {
      removeError(nameInput);
    }

    // Validate Email
    if (emailInput.value.trim() === '' || !validateEmail(emailInput.value)) {
      showError(emailInput);
      isValid = false;
    } else {
      removeError(emailInput);
    }

    // Validate Message
    if (messageInput.value.trim() === '') {
      showError(messageInput);
      isValid = false;
    } else {
      removeError(messageInput);
    }

    // If valid, simulate submission
    if (isValid) {
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;
      
      // Simulate network request
      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        contactForm.reset();
        successMsg.style.display = 'block';
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          successMsg.style.display = 'none';
        }, 5000);
      }, 1500);
    }
  });

  // Remove error styling on input
  [nameInput, emailInput, messageInput].forEach(input => {
    input.addEventListener('input', () => {
      removeError(input);
    });
  });

});
