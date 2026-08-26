const cube = document.getElementById('cube');
const faces = document.querySelectorAll('.face');
let activeFace = null;

// Clean map to rotate the entire cube so the clicked face directly targets front
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

/* Desktop Hover */
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

/* Mobile Swipe */
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

/* Tap interaction */
faces.forEach((face) => {
  face.addEventListener('click', (e) => {
    e.stopPropagation();

    // Clear inline transforms if any were left over
    gsap.set(faces, { clearProps: "transform,z,scale" });

    if (activeFace === face) {
      // Return to standard angle on close
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
      if (activeFace) {
        activeFace.classList.remove('expanded');
      }

      activeFace = face;
      face.classList.add('expanded');

      const faceClass = Array.from(face.classList).find(c => faceRotations[c]);
      const targetRotation = faceRotations[faceClass];

      // Snap whole cube to target orientation cleanly
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
  });
});

/* Background click reset */
window.addEventListener('click', () => {
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
});
