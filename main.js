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

    const box = new THREE.BoxHelper(bananaCar, 0xff0000);

    scene.add(box);
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

    const box = new THREE.BoxHelper(policeCar, 0xff0000);

    scene.add(box);
  },

  undefined,

  function (error) {
    console.error(error);
  }
);




// ANIMATE
function animate() {

  requestAnimationFrame(animate);

  controls.update();

  renderer.render(scene, camera);
}

animate();