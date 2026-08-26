const cube = document.getElementById('cube');
const faces = document.querySelectorAll('.face');
let activeFace = null;

// Target rotation angles for each face to bring it directly to the front
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
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});

window.addEventListener('touchmove', (e) => {
  if (activeFace) return;

  const touchX = e.touches[0].clientX;
  const touchY = e.touches[0].clientY;

  const deltaX = touchX - touchStartX;
  const deltaY = touchY - touchStartY;

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

/* --- 3. CLICK / TAP FACE TO SNAP FRONT & EXPAND --- */
faces.forEach((face) => {
  face.addEventListener('click', (e) => {
    e.stopPropagation();

    if (activeFace === face) {
      // Tap again to close
      face.classList.remove('expanded');
      activeFace = null;

      // Scale back down
      gsap.to(cube, {
        scale: 1,
        duration: 0.5,
        ease: 'power2.inOut'
      });
    } else {
      // Close previous face if active
      if (activeFace) {
        activeFace.classList.remove('expanded');
      }

      activeFace = face;
      face.classList.add('expanded');

      // Identify face orientation
      const faceClass = Array.from(face.classList).find(c => faceRotations[c]);
      const targetRotation = faceRotations[faceClass];

      // Rotate cube so face points straight ahead, then scale slightly
      gsap.to(cube, {
        rotateX: targetRotation.rotateX,
        rotateY: targetRotation.rotateY,
        scale: 1.4, 
        duration: 0.7,
        ease: 'power2.inOut',
      });

      // Update current angles so manual dragging continues smoothly from here
      currentX = targetRotation.rotateX;
      currentY = targetRotation.rotateY;
    }
  });
});

// Reset view when clicking off the cube
window.addEventListener('click', () => {
  if (activeFace) {
    activeFace.classList.remove('expanded');
    activeFace = null;
    gsap.to(cube, {
      scale: 1,
      duration: 0.5,
      ease: 'power2.inOut'
    });
  }
});
