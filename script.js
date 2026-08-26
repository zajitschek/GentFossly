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
let isDragging = false;

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

  // Mark as dragging if movement is more than a slight tap offset
  if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
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

/* --- 3. TAP INTERACTION FOR FACES --- */
function handleFaceClick(e, face) {
  // Ignore tap if the user was actually dragging/swiping the cube
  if (isDragging) return;
  
  e.stopPropagation();
  e.preventDefault();

  // Clear any residual inline transforms on faces
  gsap.set(faces, { clearProps: "transform,z,scale" });

  if (activeFace === face) {
    // Tapped the same active face: reset back to default cube view
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
    // Close existing active face if another face is tapped
    if (activeFace) {
      activeFace.classList.remove('expanded');
    }

    activeFace = face;
    face.classList.add('expanded');

    // Find class orientation
    const faceClass = Array.from(face.classList).find(c => faceRotations[c]);
    const targetRotation = faceRotations[faceClass];

    // Smoothly turn the cube so the selected face aligns straight ahead
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

faces.forEach((face) => {
  face.addEventListener('touchend', (e) => handleFaceClick(e, face));
  face.addEventListener('click', (e) => handleFaceClick(e, face));
});

/* --- 4. RESET WHEN TAPPING BACKGROUND --- */
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

window.addEventListener('click', resetCube);
window.addEventListener('touchend', (e) => {
  // Only trigger background reset if the tap wasn't on a face
  if (!e.target.closest('.face')) {
    resetCube();
  }
});
