const cube = document.getElementById('cube');
const faces = document.querySelectorAll('.face');
let activeFace = null;

const faceRotations = {
  front:  { rotateX: 0,   rotateY: 0 },
  back:   { rotateX: 0,   rotateY: 180 },
  right:  { rotateX: 0,   rotateY: -90 },
  left:   { rotateX: 0,   rotateY: 90 },
  top:    { rotateX: -90, rotateY: 0 },
  bottom: { rotateX: 90,  rotateY: 0 }
};

let currentX = -15; 
let currentY = 25;  
let touchStartX = 0;
let touchStartY = 0;
let isDragging = false;
let ignoreClicks = false; // Lock flag to stop iOS synthetic double-taps

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

/* --- 2. TOUCH DRAGGING (Mobile) --- */
window.addEventListener('touchstart', (e) => {
  if (activeFace) return;
  isDragging = false;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchmove', (e) => {
  if (activeFace) return;

  const touchX = e.touches[0].clientX;
  const touchY = e.touches[0].clientY;

  const deltaX = touchX - touchStartX;
  const deltaY = touchY - touchStartY;

  if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
    isDragging = true;
  }

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
}, { passive: true });

/* --- 3. UNIFIED ACTION HANDLER --- */
function processFaceTap(face) {
  gsap.set(faces, { clearProps: "transform,z,scale" });

  if (activeFace === face) {
    // Tap active face again to close
    face.classList.remove('expanded');
    activeFace = null;

    gsap.to(cube, {
      rotateX: -15,
      rotateY: 25,
      scale: 1,
      duration: 0.6,
      ease: 'power2.inOut'
    });

    currentX = -15;
    currentY = 25;
  } else {
    // Switch active face
    if (activeFace) {
      activeFace.classList.remove('expanded');
    }

    activeFace = face;
    face.classList.add('expanded');

    const faceClass = Array.from(face.classList).find(c => faceRotations[c]);
    const targetRotation = faceRotations[faceClass];

    gsap.to(cube, {
      rotateX: targetRotation.rotateX,
      rotateY: targetRotation.rotateY,
      scale: 1.3,
      duration: 0.7,
      ease: 'power2.inOut',
    });

    currentX = targetRotation.rotateX;
    currentY = targetRotation.rotateY;
  }
}

/* --- 4. EVENT BINDINGS WITH DEBOUNCE LOCK --- */
faces.forEach((face) => {
  // Primary Touch Event for Mobile
  face.addEventListener('touchend', (e) => {
    if (isDragging) return;
    
    e.stopPropagation();
    e.preventDefault();

    // Lock out immediate follow-up desktop/mouse clicks from iOS
    ignoreClicks = true;
    setTimeout(() => { ignoreClicks = false; }, 400);

    processFaceTap(face);
  });

  // Fallback Click Event for Desktop Mouse
  face.addEventListener('click', (e) => {
    if (ignoreClicks) return;
    e.stopPropagation();
    processFaceTap(face);
  });
});

/* --- 5. BACKGROUND RESET --- */
function resetCube() {
  if (activeFace) {
    gsap.set(faces, { clearProps: "transform,z,scale" });
    activeFace.classList.remove('expanded');
    activeFace = null;

    gsap.to(cube, {
      rotateX: -15,
      rotateY: 25,
      scale: 1,
      duration: 0.6,
      ease: 'power2.inOut'
    });

    currentX = -15;
    currentY = 25;
  }
}

window.addEventListener('touchend', (e) => {
  if (ignoreClicks) return;
  if (!e.target.closest('.face')) {
    resetCube();
  }
});

window.addEventListener('click', (e) => {
  if (ignoreClicks) return;
  if (!e.target.closest('.face')) {
    resetCube();
  }
});
