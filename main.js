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

//Shadows

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // softer shadows



// CAMERA CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);

camera.position.set(0, 8.8, -10);

controls.target.set(0, 1.2, 0);

controls.enabled = false;

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

//shadows
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 200;
directionalLight.shadow.camera.left = -30;
directionalLight.shadow.camera.right = 30;
directionalLight.shadow.camera.top = 30;
directionalLight.shadow.camera.bottom = -30;

scene.add(directionalLight);



scene.fog = new THREE.Fog(0x222222, 40, 80);

const clock = new THREE.Clock();
const cycleDuration = 60;
const dayColor = new THREE.Color(0x87ceeb);
const nightColor = new THREE.Color(0x0a0a20);

const sunMesh = new THREE.Mesh(
  new THREE.SphereGeometry(3, 16, 16),
  new THREE.MeshBasicMaterial({ color: 0xffeebb })
);
scene.add(sunMesh);



//LANES

const lanes = [-6, 0, 6];
let currentLane = 1;
let totalDistance = 0;
let path = [{d: 0, lane: 1}];
const POLICE_GAP = 9;

//Jumping

let isJumping = false;
let jumpVelocity = 0;
const JUMP_FORCE = 0.25;
const GRAVITY = 0.008;
const GROUND_Y = 1.6;

//GROUND
const grass = new THREE.Mesh(
  new THREE.PlaneGeometry(500, 500),
  new THREE.MeshLambertMaterial({ color: 0x3a6b1f })
);
grass.rotation.x = -Math.PI / 2;
grass.position.y = -0.05;
scene.add(grass);

const groundGeometry = new THREE.PlaneGeometry(24, 200);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });

const ground = new THREE.Mesh(groundGeometry, groundMaterial);

const lineGeometry = new THREE.PlaneGeometry(0.2, 200);
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

let dots = [];

function createDottedLine(x) {
  const group = new THREE.Group();

  for (let i = -100; i < 100; i += 2) {
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);
    dot.rotation.x = -Math.PI / 2;
    dot.position.set(x, 0.01, i);
    group.add(dot);
    dots.push(dot);
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

//shadows

ground.receiveShadow = true;
grass.receiveShadow = true;

scene.add(ground);

// LOAD BANANA CAR
const loader = new GLTFLoader();

let bananaCar;
const bananaWheels = [];

loader.load(
  './assets/banana_car.glb',

  function (gltf) {
    bananaCar = gltf.scene;

    bananaCar.position.set(0, 1.6, 0);

   bananaCar.scale.set(0.008, 0.008,0.008);

    for (const name of ['tire', 'tire_2', 'tire_3']) {
      const wheel = bananaCar.getObjectByName(name);
      wheel.geometry.computeBoundingBox();
      const center = new THREE.Vector3();
      wheel.geometry.boundingBox.getCenter(center);
      wheel.geometry.translate(-center.x, -center.y, -center.z);
      wheel.position.add(center);
      bananaWheels.push(wheel);
    }

    bananaCar.traverse(child => {
  if (child.isMesh) {
    child.castShadow = true;
    child.receiveShadow = true;
  }
});

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
const policeWheels = [];

loader.load(
  './assets/police_car.glb',

  function (gltf) {
    policeCar = gltf.scene;

    policeCar.position.set(0, 0, -9);

   policeCar.scale.set(2, 2, 2);

    const policeWheelNames = ['Cop_BackWheels_Cylinder001', 'Cop_FrontLeftWheel_Cylinder011', 'Cop_FrontRightWheel_Cylinder012'];
    for (const name of policeWheelNames) {
      const wheel = policeCar.getObjectByName(name);
      const bbox = new THREE.Box3();
      for (const child of wheel.children) {
        child.geometry.computeBoundingBox();
        bbox.union(child.geometry.boundingBox);
      }
      const center = new THREE.Vector3();
      bbox.getCenter(center);
      for (const child of wheel.children) {
        child.geometry.translate(-center.x, -center.y, -center.z);
      }
      wheel.position.add(center);
      policeWheels.push(wheel);
    }

    policeCar.traverse(child => {
  if (child.isMesh) {
    child.castShadow = true;
    child.receiveShadow = true;
  }
});

    scene.add(policeCar);

  /*  const box = new THREE.BoxHelper(policeCar, 0xff0000);

    scene.add(box);*/
  },

  undefined,

  function (error) {
    console.error(error);
  }
);



const baseSpeed = 0.2;
let speed = baseSpeed;
let score = 0;
let highScore = 0;
let gameOver = false;

const hud = document.getElementById('hud');
const overlay = document.getElementById('gameOver');
const finalScoreEl = document.getElementById('finalScore');
const highScoreEl = document.getElementById('highScore');
const bananaBox = new THREE.Box3();
const obstacleBox = new THREE.Box3();

const ROW_SPACING = 18;
const NUM_ROWS = 5;
const WRAP = ROW_SPACING * NUM_ROWS;

const obstacles = [];
const obstacleSpecs = {
  cone:    { file: 'traffic_cone.glb',    scale: 10,  y: 0.75 },
  barrier: { file: 'traffic_barrier.glb', scale: 0.5, y: 2    },
  street:  { file: 'streetlight.glb',     scale: 12,  y: 0    },
};

const plan = [];
for (let i = 0; i < NUM_ROWS; i++) {
  plan.push({
    type: i % 2 ? 'barrier' : 'cone',
    x: lanes[Math.floor(Math.random() * 3)],
    z: 60 + i * ROW_SPACING,
    lane: true,
  });
}
for (let i = 0; i < 4; i++) {
  const side = i % 2 ? 10.5 : -10.5;
  plan.push({
    type: 'street',
    x: side,
    z: 40 + i * 22,
    rotY: side < 0 ? Math.PI : 0,
  });
}


for (const [type, spec] of Object.entries(obstacleSpecs)) {
  loader.load(`./assets/${spec.file}`, gltf => {
    gltf.scene.scale.setScalar(spec.scale);
    for (const p of plan) {
      if (p.type !== type) continue;
      const m = gltf.scene.clone();
      m.position.set(p.x, spec.y, p.z);
      if (p.rotY) m.rotation.y = p.rotY;
      if (p.lane) m.userData.lane = true;
      m.userData.startX = p.x;
      m.userData.startZ = p.z;

      // ✅ traverse inside the for loop, while m is in scope
      m.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      scene.add(m);
      obstacles.push(m);
    }
  });
}

function restart() {
  score = 0;
  speed = baseSpeed;
  gameOver = false;
  currentLane = 1;
  totalDistance = 0;

  isJumping = false;
  jumpVelocity = 0;

  path = [{d: 0, lane: 1}];
  clock.start();
  for (const o of obstacles) {
    o.position.z = o.userData.startZ;
    if (o.userData.lane) {
      o.position.x = lanes[Math.floor(Math.random() * 3)];
    } else {
      o.position.x = o.userData.startX;
    }
  }
  if (bananaCar) bananaCar.position.x = 0;
  if (policeCar) policeCar.position.x = 0;
  overlay.style.display = 'none';
}

document.getElementById('restart').addEventListener('click', restart);


//CONTORLS
window.addEventListener('keydown', (event) => {
  if (!bananaCar || gameOver) return;

  if ((event.key === 'a') || (event.key === 'ArrowLeft')) {
    if (currentLane != 2) {
        currentLane = Math.max(0, currentLane + 1);
        path.push({d: totalDistance, lane: currentLane});
    }
  }

  if ((event.key === 'd') || (event.key === 'ArrowRight')) {
    if (currentLane != 0) {
    currentLane = Math.min(2, currentLane - 1);
    path.push({d: totalDistance, lane: currentLane});
  }
}

  if ((event.key === ' ' || event.key === 'ArrowUp' || event.key === 'w') && !isJumping) {
    isJumping = true;
    jumpVelocity = JUMP_FORCE;
  }


});

function translationMatrix(tx, ty, tz) {
	return new THREE.Matrix4().set(
		1, 0, 0, tx,
		0, 1, 0, ty,
		0, 0, 1, tz,
		0, 0, 0, 1
	);
}


// ANIMATE
function animate() {

  requestAnimationFrame(animate);

  if (!gameOver) {
    const t = clock.getElapsedTime();

    speed = baseSpeed + score * 0.00015;
    score++;
    totalDistance += speed;
    hud.textContent = `Score: ${Math.floor(score)}`;

    if (bananaCar) {
      const targetX = lanes[currentLane];
      bananaCar.position.x += (targetX - bananaCar.position.x) * 0.15;
      bananaCar.rotation.z = (targetX - bananaCar.position.x) * -0.04;

     // bananaCar.position.y = 1.6 + Math.sin(t * 1) * 0.04;

      if (isJumping) {
        bananaCar.position.y += jumpVelocity;
        jumpVelocity -= GRAVITY;
        if (bananaCar.position.y <= GROUND_Y) {
          bananaCar.position.y = GROUND_Y;
          isJumping = false;
          jumpVelocity = 0;
        }
      } else {
        bananaCar.position.y = GROUND_Y + Math.sin(t * 1) * 0.04; // idle bob
      }

      bananaCar.rotation.x = Math.sin(t * 1) * 0.04;
      camera.position.x = bananaCar.position.x;
      controls.target.x = bananaCar.position.x;
    }

    if (policeCar) {
      const targetDist = totalDistance - POLICE_GAP;
      while (path.length > 1 && path[1].d <= targetDist) {
        path.shift();
      }
      let policeLane = path[0].lane;
      for (let i = path.length - 1; i >= 0; i--) {
        if (path[i].d <= targetDist) {
          policeLane = path[i].lane;
          break;
        }
      }

      policeCar.position.x += (lanes[policeLane] - policeCar.position.x) * 0.15;
      policeCar.position.y = Math.sin(t * 10 + 1) * 0.01;
      policeCar.rotation.x = Math.sin(t * 7 + 0.5) * 0.01;
    }

    camera.position.y = 8.8 + Math.sin(t * 11) * 0.02;

    const spin = speed * 0.5;
    for (const w of bananaWheels) w.rotation.x += spin;
    for (const w of policeWheels) w.rotation.x += spin;

    const phase = (t / cycleDuration) * Math.PI * 2;
    const sunY = Math.sin(phase);
    const dayFactor = Math.max(0, sunY);
    directionalLight.position.set(Math.cos(phase) * 50, sunY * 50, 0);
    directionalLight.intensity = dayFactor * 2;
    ambientLight.intensity = 0.3 + dayFactor * 1.7;
    scene.background.lerpColors(nightColor, dayColor, dayFactor);
    scene.fog.color.copy(scene.background);
    sunMesh.position.copy(directionalLight.position);
    sunMesh.visible = sunY > -0.1;

    for (let i = 0; i < dots.length; i++) {
      dots[i].position.z = dots[i].position.z < -100 ? 100 : dots[i].position.z - speed;
    }

    for (const o of obstacles) {
      o.position.z -= speed;
      if (o.position.z < -20) {
        o.position.z += WRAP;
        if (o.userData.lane) {
          const cur = lanes.indexOf(o.position.x);
          let next;
          do { next = Math.floor(Math.random() * 3); } while (next === cur);
          o.position.x = lanes[next];
        }
      }
    }

    if (bananaCar) {
      bananaBox.setFromObject(bananaCar);
      bananaBox.expandByScalar(-0.3);

      for (const o of obstacles) {
        if (!o.userData.lane) continue;
        if (isJumping && bananaCar.position.y > 2.5) continue; // airborne = safe
          obstacleBox.setFromObject(o);
        if (bananaBox.intersectsBox(obstacleBox)) {
          gameOver = true;
          finalScoreEl.textContent = `Score: ${Math.floor(score)}`;
          highScore = Math.max(score, highScore);
          highScoreEl.textContent = `High Score: ${Math.floor(highScore)}`
          overlay.style.display = 'flex';
          break;
         }
      }
    }
  }

  controls.update();

  renderer.render(scene, camera);
}


animate();