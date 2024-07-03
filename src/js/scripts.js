import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Player, PlayerController, ThirdPersonCamera } from "./player.js";

// Renderer setup
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Scene and camera setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

const orbitControls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 2, 10);
orbitControls.update();

var player = new Player(
    new ThirdPersonCamera(
        camera, new THREE.Vector3(-5, 2, 0), new THREE.Vector3(0, 0, 0)
    ),
    new PlayerController(),
    scene,
    10
);

scene.add(player);


// Add lights
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);


const textureLoader = new THREE.TextureLoader();
const sandTexture = textureLoader.load('path_to_your_sand_texture.jpg');
sandTexture.wrapS = THREE.RepeatWrapping;
sandTexture.wrapT = THREE.RepeatWrapping;
sandTexture.repeat.set(10, 10);

// Desert ground
const groundGeometry = new THREE.CircleGeometry(50, 50);
const groundMaterial = new THREE.MeshStandardMaterial({ map: sandTexture });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Jalan 1
function createRoad(x, z) {
    const roadGeometry = new THREE.PlaneGeometry(100, 10);
    const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const road = new THREE.Mesh(roadGeometry, roadMaterial);

    road.rotation.x = -Math.PI / 2;
    road.position.set(x, 0.01, z); // Set the position of the road
    road.receiveShadow = true;

    scene.add(road);
}

const roadPositions = [
    [0, 0],
    [0,]
];

roadPositions.forEach(pos => createRoad(pos[0], pos[1]));

// Sun (simple sphere)
const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Cacti (simple cylinders)
const cactusMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });

function createCactus(x, z) {
    const cactusGeometry = new THREE.CylinderGeometry(0.5, 0.5, 3, 12);
    const cactus = new THREE.Mesh(cactusGeometry, cactusMaterial);
    cactus.position.set(x, 1.5, z);
    cactus.castShadow = true;
    scene.add(cactus);
}

const cactusPositions = [
    [15, -15],
    [-5, 10],
    [20, -30],
    [30, -31],
    [-20, -5],
    [5, 5],
    [25, 13],
    [-25, 23],
    [10, -20],
    [-15, 7]
];

cactusPositions.forEach(pos => createCactus(pos[0], pos[1]));

// Stones
const stoneMaterial = new THREE.MeshStandardMaterial({ color: 0x8B8B83 });

function createStone(x, z) {
    const stoneGeometry = new THREE.DodecahedronGeometry(1);
    const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);
    stone.position.set(x, 0.5, z);
    stone.castShadow = true;
    scene.add(stone);
}

const stonePositions = [
    [-26, 21],
    [16, 16],
    [31, -31],
    [6, 6],
    [21, -21],
    [-6, -6],
    [26, 26],
    [-21, -16],
    [-16, 11],
    [11, -11]
];

stonePositions.forEach(pos => createStone(pos[0], pos[1]));

// Detailed House
function createHouse(x, z) {
    const house = new THREE.Group();

    // Walls
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const wallGeometry = new THREE.BoxGeometry(10, 5, 0.2);

    const wall1 = new THREE.Mesh(wallGeometry, wallMaterial);
    wall1.position.set(0, 2.5, 5);
    wall1.castShadow = true;
    house.add(wall1);

    const wall2 = new THREE.Mesh(wallGeometry, wallMaterial);
    wall2.position.set(0, 2.5, -5);
    wall2.castShadow = true;
    house.add(wall2);

    const wall3 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5, 10), wallMaterial);
    wall3.position.set(5, 2.5, 0);
    wall3.castShadow = true;
    house.add(wall3);

    const wall4 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5, 10), wallMaterial);
    wall4.position.set(-5, 2.5, 0);
    wall4.castShadow = true;
    house.add(wall4);

    // Roof
    const roofGeometry = new THREE.ConeGeometry(7, 2, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8B0000 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.set(0, 6, 0);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    house.add(roof);

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(10, 10);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xDEB887 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    house.add(floor);

    // Door
    const doorGeometry = new THREE.BoxGeometry(1.5, 3, 0.1);
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 1.5, 5);
    door.castShadow = true;
    house.add(door);

    // Windows
    const windowGeometry = new THREE.BoxGeometry(1, 1, 0.1);
    const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0x87CEEB,
        transparent: true,
        opacity: 0.5
    });

    const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
    window1.position.set(2.5, 3, 5);
    window1.castShadow = true;
    house.add(window1);

    const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
    window2.position.set(-2.5, 3, 5);
    window2.castShadow = true;
    house.add(window2);

    const window3 = new THREE.Mesh(windowGeometry, windowMaterial);
    window3.position.set(2.5, 3, -5);
    window3.castShadow = true;
    house.add(window3);

    const window4 = new THREE.Mesh(windowGeometry, windowMaterial);
    window4.position.set(-2.5, 3, -5);
    window4.castShadow = true;
    house.add(window4);

    // Bed
    const bedFrameGeometry = new THREE.BoxGeometry(3, 0.5, 5);
    const bedFrameMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const bedFrame = new THREE.Mesh(bedFrameGeometry, bedFrameMaterial);
    bedFrame.position.set(2.5, 0.25, -2.5);
    bedFrame.castShadow = true;
    house.add(bedFrame);

    const bedMattressGeometry = new THREE.BoxGeometry(2.8, 0.3, 4.8);
    const bedMattressMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const bedMattress = new THREE.Mesh(bedMattressGeometry, bedMattressMaterial);
    bedMattress.position.set(2.5, 0.65, -2.5);
    bedMattress.castShadow = true;
    house.add(bedMattress);

    house.position.set(x, 0, z);
    scene.add(house);
}

const housePositions = [
    [-30, 10]
];

housePositions.forEach(pos => createHouse(pos[0], pos[1]));

// Person object (fbx model)
const loader = new FBXLoader();
loader.load('models/person_model.fbx', (fbx) => {
    const person = fbx.scene;
    person.position.set(0, 0, 0);
    person.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    scene.add(person);
}, undefined, (error) => {
    console.error('An error happened', error);
});

// Camera movement controls
const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    e: false,
    r: false,
    t: false
};

function moveCamera() {
    const speed = 0.1;
    // if (keys.w) camera.position.z -= speed;
    // if (keys.s) camera.position.z += speed;
    // if (keys.a) camera.position.x -= speed;
    // if (keys.d) camera.position.x += speed;
    if (keys.e) camera.rotation.z -= speed + 0.3; // rotate
    if (keys.q) camera.rotation.z += speed + 0.3; // rotate
    if (keys.r) camera.rotation.y -= speed + 0.3; // yaw
    if (keys.t) camera.rotation.y += speed + 0.3; // yaw

}

document.addEventListener('keydown', (event) => {
    if (event.key === 'w') keys.w = true;
    if (event.key === 'a') keys.a = true;
    if (event.key === 's') keys.s = true;
    if (event.key === 'd') keys.d = true;
    if (event.key === 'e') keys.e = true;
    if (event.key === 'q') keys.q = true;
    if (event.key === 't') keys.t = true;
    if (event.key === 'r') keys.r = true;
    if (event.key === 't') keys.t = true;
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'w') keys.w = false;
    if (event.key === 'a') keys.a = false;
    if (event.key === 's') keys.s = false;
    if (event.key === 'd') keys.d = false;
    if (event.key === 'e') keys.e = false;
    if (event.key === 'q') keys.q = false;
    if (event.key === 't') keys.t = false;
    if (event.key === 'r') keys.r = false;
    if (event.key === 't') keys.t = false;
});

// Animation loop
var clock = new THREE.Clock();
function animate() {
    moveCamera();

    // Sun and light animation
    const time = Date.now() * 0.0005;
    const sunX = Math.sin(time) * 55;
    const sunY = Math.cos(time) * 20;
    sun.position.set(sunX, sunY, -20);
    directionalLight.position.copy(sun.position);
    directionalLight.intensity = Math.max(5, Math.cos(time) + 5);

    renderer.render(scene, camera);
    player.update(clock.getDelta());
    orbitControls.update();
}

renderer.setAnimationLoop(animate);
