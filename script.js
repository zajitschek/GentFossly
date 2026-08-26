const cube = document.getElementById('cube');
const faces = document.querySelectorAll('.face');
let activeFace = null;

// Track angles for smooth dragging
let currentX = -15; // Initial X tilt
let currentY = 25;  // Initial Y angle
let touchStartX = 0;
let touchStartY = 0;

/* --- 1. MOUSE MOVEMENT (Desktop) --- */
window.addEventListener('mousemove', (e) => {
  if (activeFace) return;

  const x = (e.clientX / window.innerWidth - 0.5) * 2;
  const y = (e.clientY / window.innerHeight - 0.5) * 2;

  gsap.to(cube, {
    rotateX: -y * 45,
    rotateY: x * 45,
    duration: 0.8,
    ease: 'power2.out',
  });
});

/* --- 2. TOUCH DRAGGING (Mobile / iOS) --- */
window.addEventListener('touchstart', (e) => {
  if (activeFace) return;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});

window.addEventListener('touchmove', (e) => {
  if (activeFace) return;

  const touchX = e.touches[0].clientX;
  const touchY = e.touches[0].clientY;

  const deltaX = touchX - touchStartX;
  const deltaY = touchY - touchStartY;

  // Sensitivity factor for swipe turn
  currentY += deltaX * 0.4;
  currentX -= deltaY * 0.4;

  gsap.to(cube, {
    rotateX: currentX,
    rotateY: currentY,
    duration: 0.3,
    ease: 'power1.out',
  });

  touchStartX = touchX;
  touchStartY = touchY;
});

/* --- 3. CLICK / TAP FACE TO EXPAND --- */
faces.forEach((face) => {
  face.addEventListener('click', (e) => {
    e.stopPropagation();

    if (activeFace === face) {
      // Zoom out back to cube geometry
      gsap.to(face, {
        scale: 1,
        z: 100,
        duration: 0.5,
        ease: 'power2.inOut',
      });
      face.classList.remove('expanded');
      activeFace = null;
    } else {
      if (activeFace) {
        gsap.to(activeFace, { scale: 1, z: 100, duration: 0.3 });
        activeFace.classList.remove('expanded');
      }

      face.classList.add('expanded');
      activeFace = face;

      gsap.to(face, {
        scale: 1.8, // Slightly reduced scale factor for mobile screens
        z: 250,
        duration: 0.6,
        ease: 'back.out(1.2)',
      });
    }
  });
});

// Reset view on background click
window.addEventListener('click', () => {
  if (activeFace) {
    gsap.to(activeFace, { scale: 1, z: 100, duration: 0.5 });
    activeFace.classList.remove('expanded');
    activeFace = null;
  }
});
