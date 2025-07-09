import * as THREE from 'three';
import gsap from 'gsap';
import { images, planets } from './constant/images';

const canvas = document.querySelector("#fucker");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  24,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Setup renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Move the camera back
camera.position.z = 10;

// Textures
const texturePaths = [planets.vormir, planets.earth, planets.mars, planets.eris];
const radius = 1.5;
const sky = planets.newStar;
const segments = 200;
const orbitRadius = 4.8;
const group = new THREE.Group();
const spheres = [];

// Load background texture
const textureLoader = new THREE.TextureLoader();
const newTexture = textureLoader.load(sky);
newTexture.colorSpace = THREE.SRGBColorSpace;
newTexture.minFilter = THREE.LinearFilter;
newTexture.magFilter = THREE.LinearFilter;
newTexture.anisotropy = 1;

// Background sphere
const bgGeo = new THREE.SphereGeometry(6, 32, 32);
const bgMat = new THREE.MeshBasicMaterial({
  map: newTexture,
  opacity: 0.5,
  transparent: true,
  side: THREE.BackSide,
});
const backgroundMesh = new THREE.Mesh(bgGeo, bgMat);
group.add(backgroundMesh);

// Create planets
for (let i = 0; i < texturePaths.length; i++) {
  const tex = textureLoader.load(texturePaths[i]);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.anisotropy = 10;

  const sphereGeo = new THREE.SphereGeometry(radius, segments, segments);
  const material = new THREE.MeshStandardMaterial({ map: tex });
  const mesh = new THREE.Mesh(sphereGeo, material);

  const angle = (i / texturePaths.length) * (Math.PI * 2);
  mesh.position.x = orbitRadius * Math.cos(angle);
  mesh.position.z = orbitRadius * Math.sin(angle);

  group.add(mesh);
  spheres.push(mesh); // ✅ Store planet mesh
}

group.rotation.x = 0.1;
group.position.y = -0.9;
scene.add(group);

// Lighting
const ambient = new THREE.AmbientLight(0xffffff, 1.2);
const directional = new THREE.DirectionalLight(0xffffff, 4);
directional.position.set(30, 20, 10);
scene.add(ambient, directional);

// Scroll handling
let lastwhellTime = 0;
const throllDelay = 1000;
let scrollCon = 0;
const maxSections = 4;

const throllWhell = (e) => {
  const currtime = Date.now();
  if (currtime - lastwhellTime >= throllDelay) {
    lastwhellTime = currtime;

    const dir = e.deltaY > 0 ? 'down' : 'up';
    const headings = document.querySelectorAll("#heading");
    const para = document.querySelectorAll(".para"); // ✅ fixed selector
  
    if (dir === 'down') {
      scrollCon = (scrollCon + 1) % maxSections;
    } else {
      scrollCon = (scrollCon - 1 + maxSections) % maxSections;
    }

    gsap.to(headings, {
      y: `-${scrollCon * 100}%`,
      ease: "expo.inOut",
      duration: 1,
    });

    gsap.to(para, {
      y: `-${scrollCon * 100}%`,
      ease: 'expo.inOut',
      duration: 1
    });

    gsap.to(group.rotation, {
      y: -scrollCon * (Math.PI / 2),
      ease: "expo.inOut",
      duration: 1,
    });
  }
};


window.addEventListener("wheel", throllWhell);

// Animation loop
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();
  for (let i = 0; i < spheres.length; i++) {
    const sp = spheres[i];
    sp.rotation.y = elapsed * 0.1; // Slow individual rotation
  }

  renderer.render(scene, camera);
}
animate();
