// --- 1. THREE.JS SCENE SETUP ---
const canvas = document.getElementById('webgl');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 7.5;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- 2. CREATE FACE TEXTURES WITH TEXT EMBEDDED ---
function createFaceTexture(text) {
  const texCanvas = document.createElement('canvas');
  texCanvas.width = 512;
  texCanvas.height = 512;
  const ctx = texCanvas.getContext('2d');

  // Dark translucent background with border frame
  ctx.fillStyle = 'rgba(20, 20, 20, 0.85)';
  ctx.fillRect(0, 0, 512, 512);
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 8;
  ctx.strokeRect(10, 10, 492, 492);

  // Sharp centered text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 52px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 256);

  return new THREE.CanvasTexture(texCanvas);
}

const faceTexts = ['ABOUT', 'THOUGHTS', 'LAB', 'LATITUDE', 'ESSAYS', 'CONTACT'];
const materials = faceTexts.map(text => new THREE.MeshBasicMaterial({
  map: createFaceTexture(text),
  transparent: true,
  opacity: 0.9,
  side: THREE.DoubleSide
}));

// Build invisible solid mesh box for raycasting touch clicks
const boxGeo = new THREE.BoxGeometry(2.2, 2.2, 2.2);
const cubeMesh = new THREE.Mesh(boxGeo, materials);
scene.add(cubeMesh);

// --- 3. GENERATE PARTICLE CUBE SURROUNDING MESH ---
const particleCount = 3500;
const particleGeo = new THREE.BufferGeometry();

const cubePositions = new Float32Array(particleCount * 3);
const explodedPositions = new Float32Array(particleCount * 3);
const currentPositions = new Float32Array(particleCount * 3);

const cubeSize = 2.25;
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

  const radius = 6 + Math.random() * 8;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos((Math.random() * 2) - 1);

  explodedPositions[i3]     = radius * Math.sin(phi) * Math.cos(theta);
  explodedPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
  explodedPositions[i3 + 2] = radius * Math.cos(phi);
}

particleGeo.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));

const particleMat = new THREE.PointsMaterial({
  size: 0.035,
  color: 0xffffff,
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending
});

const particleSystem = new THREE.Points(particleGeo, particleMat);
scene.add(particleSystem);

// Group cube mesh and particles together so they rotate in sync
const cubeGroup = new THREE.Group();
cubeGroup.add(cubeMesh);
cubeGroup.add(particleSystem);
cubeGroup.rotation.x = -0.3;
cubeGroup.rotation.y = 0.5;
scene.add(cubeGroup);

// --- 4. ROTATION & INTERACTION LOGIC ---
let isExploded = false;
let targetRotationX = -0.3;
let targetRotationY = 0.5;
let isDragging = false;

window.addEventListener('mousemove', (e) => {
  if (isExploded) return;
  const x = (e.clientX / window.innerWidth - 0.5) * 2;
  const y = (e.clientY / window.innerHeight - 0.5) * 2;
  targetRotationY = x * 0.8;
  targetRotationX = y * 0.8;
});

let touchStartX = 0, touchStartY = 0;
window.addEventListener('touchstart', (e) => {
  isDragging = false;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchmove', (e) => {
  if (isExploded) return;
  const deltaX = e.touches[0].clientX - touchStartX;
  const deltaY = e.touches[0].clientY - touchStartY;

  if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
    isDragging = true;
  }

  targetRotationY += deltaX * 0.005;
  targetRotationX += deltaY * 0.005;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

// --- 5. RAYCASTING TAP/CLICK ON CUBE ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const modal = document.getElementById('content-modal');
const closeBtn = document.getElementById('close-btn');

function explodeCube() {
  isExploded = true;
  const posAttr = particleSystem.geometry.attributes.position;

  // Fade out solid mesh cube
  gsap.to(cubeMesh.material, { opacity: 0, duration: 0.4 });

  // Scatter particles outward
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

  // Fade in content modal card
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

  // Hide modal card
  gsap.to(modal, {
    opacity: 0,
    scale: 0.85,
    duration: 0.4,
    ease: 'power2.in',
    onComplete: () => { modal.style.pointerEvents = 'none'; }
  });

  // Fade mesh back in
  gsap.to(cubeMesh.material, { opacity: 0.9, duration: 0.8, delay: 0.4 });

  // Re-assemble particle points into cube
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

function handleTap(e) {
  if (isExploded || isDragging) return;

  const clientX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX);
  const clientY = e.clientY || (e.changedTouches && e.changedTouches[0].clientY);

  if (!clientX || !clientY) return;

  mouse.x = (clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(cubeMesh);

  if (intersects.length > 0) {
    explodeCube();
  }
}

window.addEventListener('click', handleTap);
window.addEventListener('touchend', handleTap);
closeBtn.addEventListener('click', assembleCube);

// --- 6. RENDER LOOP ---
function animate() {
  requestAnimationFrame(animate);

  if (!isExploded) {
    cubeGroup.rotation.x += (targetRotationX - cubeGroup.rotation.x) * 0.05;
    cubeGroup.rotation.y += (targetRotationY - cubeGroup.rotation.y) * 0.05;
  } else {
    cubeGroup.rotation.y += 0.001;
  }

  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
