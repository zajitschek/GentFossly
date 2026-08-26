const cube = document.getElementById('cube');
const faces = document.querySelectorAll('.face');
let activeFace = null;

// Smoothly tilt the cube following cursor coordinates
window.addEventListener('mousemove', (e) => {
  // Freeze rotation while viewing an expanded face
  if (activeFace) return;

  // Calculate mouse position relative to screen center (-1 to 1 range)
  const x = (e.clientX / window.innerWidth - 0.5) * 2;
  const y = (e.clientY / window.innerHeight - 0.5) * 2;

  // Animate rotation angle via GSAP
  gsap.to(cube, {
    rotateX: -y * 45, // Invert Y to match natural perspective tilt
    rotateY: x * 45,
    duration: 0.8,
    ease: 'power2.out',
  });
});

// Click handlers for expanding faces
faces.forEach((face) => {
  face.addEventListener('click', (e) => {
    e.stopPropagation();

    if (activeFace === face) {
      // Return currently open face to resting cube position
      gsap.to(face, {
        scale: 1,
        z: 100, // Resets to initial CSS translateZ offset
        duration: 0.5,
        ease: 'power2.inOut',
      });
      face.classList.remove('expanded');
      activeFace = null;
    } else {
      // Close active face if switching between faces directly
      if (activeFace) {
        gsap.to(activeFace, { scale: 1, z: 100, duration: 0.3 });
        activeFace.classList.remove('expanded');
      }

      // Bring clicked face forward toward screen
      face.classList.add('expanded');
      activeFace = face;

      gsap.to(face, {
        scale: 2.2,
        z: 300, // Brings the element outward past 3D geometry
        duration: 0.6,
        ease: 'back.out(1.2)',
      });
    }
  });
});

// Reset view when clicking anywhere outside
window.addEventListener('click', () => {
  if (activeFace) {
    gsap.to(activeFace, { scale: 1, z: 100, duration: 0.5 });
    activeFace.classList.remove('expanded');
    activeFace = null;
  }
});
