// --- 1. THREE.JS SCENE SETUP ---
const canvas = document.getElementById('webgl');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 8;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- 2. GENERATE CUBE PARTICLES ---
const particleCount = 4000;
const geometry = new THREE.BufferGeometry();

const cubePositions = new Float32Array(particleCount * 3);
const explodedPositions = new Float32Array(particleCount * 3);
const currentPositions = new Float32Array(particleCount * 3);

const cubeSize = 2.2;
const half = cubeSize / 2;

for (let i = 0; i < particleCount; i++) {
  const i3 = i * 3;

  let x, y, z;
  const side = Math.floor(Math.random() * 6);
  const u = (Math.random() - 0.5) * cubeSize;
  const v = (Math.random() - 0.5) * cubeSize;

  switch(side) {
    case 0: x = half; y = u; z = v; break;
    case 1: x = -half; y = u; z = v; break;
    case 2: x = u; y = half; z = v; break;
    case 3: x = u; y = -half; z = v; break;
    case 4: x = u; y = v; z = half; break;
    case 5: x = u; y = v; z = -half; break;
  }

  cubePositions[i3]     = x;
  cubePositions[i3 + 1] = y;
  cubePositions[i3 + 2] = z;

  currentPositions[i3]     = x;
  currentPositions[i3 + 1] = y;
  currentPositions[i3 + 2] = z;

  // Exploded position coordinates
  const radius = 6 + Math.random() * 8;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos((Math.random() * 2) - 1);

  explodedPositions[i3]     = radius * Math.sin(phi) * Math.cos(theta);
  explodedPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
  explodedPositions[i3 + 2] = radius * Math.cos(phi);
}

geometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));

const material = new THREE.PointsMaterial({
  size: 0.03,
  color: 0xffffff,
  transparent: true,
  opacity: 0.85,
  blending: THREE.AdditiveBlending
});

const particleSystem = new THREE.Points(geometry, material);
scene.add(particleSystem);

// --- 3. FACE LABELS & 3D COORDINATES ---
const labelElements = {
  front:  { el: document.getElementById('label-front'),  pos: new THREE.Vector3(0, 0, half) },
  back:   { el: document.getElementById('label-back'),   pos: new THREE.Vector3(0, 0, -half) },
  right:  { el: document.getElementById('label-right'),  pos: new THREE.Vector3(half, 0, 0) },
  left:   { el: document.getElementById('label-left'),   pos: new THREE.Vector3(-half, 0, 0) },
  top:    { el: document.getElementById('label-top'),    pos: new THREE.Vector3(0, half, 0) },
  bottom: { el: document.getElementById('label-bottom'), pos: new THREE.Vector3(0, -half, 0) }
};

function updateLabels() {
  if (isExploded) {
    Object.values(labelElements).forEach(item => item.el.style.opacity = 0);
    return;
  }

  const tempV = new THREE.Vector3();

  Object.values(labelElements).forEach(item => {
    tempV.copy(item.pos);
    tempV.applyEuler(particleSystem.rotation);
    
    // Check if face is pointing toward camera (backface culling check)
    if (tempV.z > -0.2) {
      tempV.project(camera);
      const x = (tempV.x *  .5 + .5) * window.innerWidth;
      const y = (tempV.y * -.5 + .5) * window.innerHeight;

      item.el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
      item.el.style.opacity = 1;
    } else {
      item.el.style.opacity = 0;
    }
  });
}

// --- 4. INTERACTION & ROTATION LOGIC ---
let isExploded = false;
let targetRotationX = -0.3;
let targetRotationY = 0.5;

window.addEventListener('mousemove', (e) => {
  if (isExploded) return;
  const x = (e.clientX / window.innerWidth - 0.5) * 2;
  const y = (e.clientY / window.innerHeight - 0.5) * 2;
  targetRotationY = x * 0.8;
  targetRotationX = y * 0.8;
});

let touchStartX = 0, touchStartY = 0;
window.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchmove', (e) => {
  if (isExploded) return;
  const deltaX = e.touches[0].clientX - touchStartX;
  const deltaY = e.touches[0].clientY - touchStartY;
  targetRotationY += deltaX * 0.005;
  targetRotationX += deltaY * 0.005;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

// --- 5. EXPLOSION ANIMATION ---
const modal = document.getElementById('content-modal');
const closeBtn = document.getElementById('close-btn');

function explodeCube() {
  isExploded = true;
  const posAttr = particleSystem.geometry.attributes.position;

  // Fade out text labels
  Object.values(labelElements).forEach(item => item.el.style.opacity = 0);

  // Scatter points
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    gsap.to(posAttr.array, {
      [i3]: explodedPositions[i3],
      [i3 + 1]: explodedPositions[i3 + 1],
      [i3 + 2]: explodedPositions[i3 + 2],
      duration: 1.2 + Math.random() * 0.5,
      ease: 'power3.out',
      onUpdate: () => { posAttr.needsUpdate = true; }
    });
  }

  // Fade in modal grid
  gsap.to(modal, {
    opacity: 1,
    scale: 1,
    duration: 0.8,
    delay: 0.2,
    ease: 'power2.out',
    onStart: () => { modal.style.pointerEvents = 'auto'; }
  });
}

function assembleCube() {
  isExploded = false;
  const posAttr = particleSystem.geometry.attributes.position;

  gsap.to(modal, {
    opacity: 0,
    scale: 0.85,
    duration: 0.4,
    ease: 'power2.in',
    onComplete: () => { modal.style.pointerEvents = 'none'; }
  });

  // Re-assemble points into cube
  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    gsap.to(posAttr.array, {
      [i3]: cubePositions[i3],
      [i3 + 1]: cubePositions[i3 + 1],
      [i3 + 2]: cubePositions[i3 + 2],
      duration: 1.0 + Math.random() * 0.4,
      ease: 'power3.inOut',
      onUpdate: () => { posAttr.needsUpdate = true; }
    });
  }
}

// Trigger explosion when tapping ABOUT label
document.getElementById('label-front').addEventListener('click', explodeCube);
closeBtn.addEventListener('click', assembleCube);

// --- 6. RENDER LOOP ---
function animate() {
  requestAnimationFrame(animate);

  if (!isExploded) {
    particleSystem.rotation.x += (targetRotationX - particleSystem.rotation.x) * 0.05;
    particleSystem.rotation.y += (targetRotationY - particleSystem.rotation.y) * 0.05;
  } else {
    particleSystem.rotation.y += 0.001;
  }

  updateLabels();
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
