import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x222222);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);



// CAMERA CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);

camera.position.set(0, 3, 10);

controls.target.set(0, 0, 0);

controls.enablePan = true;
controls.enableDamping = true;
controls.dampingFactor = 0.05;

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);


// LIGHTS
const ambientLight = new THREE.AmbientLight(0xffffff, 2);

scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);

directionalLight.position.set(5, 10, 5);

scene.add(directionalLight);



// HELPERS
const axesHelper = new THREE.AxesHelper(5);

scene.add(axesHelper);

const gridHelper = new THREE.GridHelper(20, 20);

scene.add(gridHelper);


//LANES

const lanes = [-6, 0, 6];
let currentLane = 1;

//GROUND
const groundGeometry = new THREE.PlaneGeometry(24, 50);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });

const ground = new THREE.Mesh(groundGeometry, groundMaterial);

const lineGeometry = new THREE.PlaneGeometry(0.2, 50);
const lineMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

const leftLine = new THREE.Mesh(lineGeometry, lineMaterial);
leftLine.rotation.x = -Math.PI / 2;
leftLine.position.set(9, 0.01, 0);
scene.add(leftLine);

const rightLine = new THREE.Mesh(lineGeometry, lineMaterial);
rightLine.rotation.x = -Math.PI / 2;
rightLine.position.set(-9, 0.01, 0);
scene.add(rightLine);

const dotGeometry = new THREE.PlaneGeometry(0.2, 1);
const dotMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

function createDottedLine(x) {
  const group = new THREE.Group();

  for (let i = -25; i < 25; i += 2) { // spacing = gap
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);
    dot.rotation.x = -Math.PI / 2;
    dot.position.set(x, 0.01, i);
    group.add(dot);
  }

  scene.add(group);
}

/*const midLeftLine = new THREE.Mesh(lineGeometry, lineMaterial);
midLeftLine.rotation.x = -Math.PI / 2;
midLeftLine.position.set(-3, 0.01, 0);
scene.add(midLeftLine);

const midRightLine = new THREE.Mesh(lineGeometry, lineMaterial);
midRightLine.rotation.x = -Math.PI / 2;
midRightLine.position.set(3, 0.01, 0);
scene.add(midRightLine);*/

createDottedLine(-3);
createDottedLine(3);

// rotate so it lies flat (important!)
ground.rotation.x = -Math.PI / 2;

ground.position.y = 0;

scene.add(ground);

// LOAD BANANA CAR
const loader = new GLTFLoader();

let bananaCar;

loader.load(
  './assets/banana_car.glb',

  function (gltf) {

    console.log(gltf.scene);

    bananaCar = gltf.scene;

    bananaCar.position.set(0, 1.6, 0);

   bananaCar.scale.set(0.008, 0.008,0.008);

    scene.add(bananaCar);

   /* const box = new THREE.BoxHelper(bananaCar, 0xff0000);

    scene.add(box); */
  },

  undefined,

  function (error) {
    console.error(error);
  }
);


// LOAD POLICE CAR

let policeCar;

loader.load(
  './assets/police_car.glb',

  function (gltf) {

    console.log(gltf.scene);

    policeCar = gltf.scene;

    policeCar.position.set(0, 0, -9);

   policeCar.scale.set(2, 2, 2);

    scene.add(policeCar);

  /*  const box = new THREE.BoxHelper(policeCar, 0xff0000);

    scene.add(box);*/
  },

  undefined,

  function (error) {
    console.error(error);
  }
);



//CONTORLS
window.addEventListener('keydown', (event) => {
  if (!bananaCar) return;

  if ((event.key === 'a') || (event.key === 'ArrowLeft')) {
    if (currentLane != 2) {
        currentLane = Math.max(0, currentLane + 1);
    }
  }

  if ((event.key === 'd') || (event.key === 'ArrowRight')) {
    if (currentLane != 0) {
    currentLane = Math.min(2, currentLane - 1);
  }

}
});



// ANIMATE
function animate() {

  requestAnimationFrame(animate);

  if (bananaCar) {
    bananaCar.position.x +=
      (lanes[currentLane] - bananaCar.position.x) * 0.15;
  }


  controls.update();

  renderer.render(scene, camera);
}

animate();