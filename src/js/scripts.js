import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Player, PlayerController, ThirdPersonCamera } from "./player.js";
import TWEEN from '@tweenjs/tween.js';

const clock = new THREE.Clock();
let alpacaMixer1, alpacaMixer2, alpacaMixer3;

const textureLoader = new THREE.TextureLoader();
// Renderer setup
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth - 7, window.innerHeight - 7);
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

// const orbitControls = new OrbitControls(camera, renderer.domElement);

// Not affected karna updated trs pake yg TPP Camera
camera.position.set(0, 0, 0);

// orbitControls.update();

var cameraTPP = new ThirdPersonCamera(camera, new THREE.Vector3(0, 3.7, -6), new THREE.Vector3(0, 0, 0));
var cameraFPP = new ThirdPersonCamera(camera, new THREE.Vector3(0, 2.5, 0.5), new THREE.Vector3(0, 0, 0), true);
var player = new Player(
    cameraTPP,
    new PlayerController(),
    scene,
    13
);

scene.add(player);


// Add lights
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 0, 0);
directionalLight.castShadow = true;
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);

const roadTexture = textureLoader.load('sand.jpg');
roadTexture.wrapS = THREE.RepeatWrapping;
roadTexture.wrapT = THREE.RepeatWrapping;
roadTexture.repeat.set(10, 10);

const sandTexture = textureLoader.load('sand.jpg');
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
    const roadMaterial = new THREE.MeshStandardMaterial({ map: roadTexture });
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

let boundingBoxes = [];
const objectLoader = new GLTFLoader().setPath("../models/");
// Cacti (simple cylinders)


function createStaticObject(x, y, z, rotation, filename, scaleX, scaleY, scaleZ) {
    objectLoader.load(filename, function (gltf) {
        const model = gltf.scene;

        model.scale.set(scaleX, scaleY, scaleZ);
        model.position.set(x, y, z);
        model.rotation.y = rotation;
        model.traverse((child) => {
            if (child.isMesh) {
                child.receiveShadow = true;
                child.castShadow = true;
            }
        });
        renderer.compileAsync(model, camera, scene);

        scene.add(model);
        const originalBoundingBox = new THREE.Box3().setFromObject(model);

        // Create a smaller bounding box
        const size = new THREE.Vector3();
        originalBoundingBox.getSize(size);

        const center = new THREE.Vector3();
        originalBoundingBox.getCenter(center);

        const reductionFactor = 0.55; // 50% smaller in each dimension
        const smallerBox = new THREE.Box3(
            new THREE.Vector3(
                center.x - (size.x * reductionFactor / 2),
                center.y - (size.y * reductionFactor / 2),
                center.z - (size.z * reductionFactor / 2)
            ),
            new THREE.Vector3(
                center.x + (size.x * reductionFactor / 2),
                center.y + (size.y * reductionFactor / 2),
                center.z + (size.z * reductionFactor / 2)
            )
        );

        boundingBoxes.push(smallerBox);

        // Boounding box helper
        // const helper = new THREE.Box3Helper(smallerBox, 0xff0000);
        // scene.add(helper);

    });

}
const alpacaPositions = [
    [8, 0, -15, 90, "Alpaca.glb", 0.85, 0.85, 0.85],
    [-5, 0, 8, 90, "Alpaca.glb", 0.85, 0.85, 0.85],
    [15, 0, 8, -90, "Alpaca.glb", 0.85, 0.85, 0.85]
];

objectLoader.load("Alpaca.glb", function (gltf) {
    const model = gltf.scene;

    model.scale.set(0.85, 0.85, 0.85);
    model.position.set(8, 0, -15);
    model.traverse((child) => {
        if (child.isMesh) {
            child.receiveShadow = true;
            child.castShadow = true;
        }
    });
    renderer.compileAsync(model, camera, scene);
    scene.add(model);

    const boundingBox = new THREE.Box3().setFromObject(model);
    boundingBoxes.push(boundingBox);
    // Boounding box helper
    // const helper = new THREE.Box3Helper(smallerBox, 0xff0000);
    // scene.add(helper);

    const animation = gltf.animations;
    alpacaMixer1 = new THREE.AnimationMixer(model);
    const clip = THREE.AnimationClip.findByName(animation, "Eating");
    const action = alpacaMixer1.clipAction(clip);
    action.play();

});


objectLoader.load("Alpaca.glb", function (gltf) {
    const model = gltf.scene;

    model.scale.set(0.85, 0.85, 0.85);
    model.position.set(-5, 0, 8);
    model.rotation.y = 90;
    model.traverse((child) => {
        if (child.isMesh) {
            child.receiveShadow = true;
            child.castShadow = true;
        }
    });
    renderer.compileAsync(model, camera, scene);
    scene.add(model);

    const boundingBox = new THREE.Box3().setFromObject(model);
    boundingBoxes.push(boundingBox);
    // Boounding box helper
    // const helper = new THREE.Box3Helper(smallerBox, 0xff0000);
    // scene.add(helper);

    const animation = gltf.animations;
    alpacaMixer2 = new THREE.AnimationMixer(model);
    const clip = THREE.AnimationClip.findByName(animation, "Eating");
    const action = alpacaMixer2.clipAction(clip);
    action.play();

});

objectLoader.load("Alpaca.glb", function (gltf) {
    const model = gltf.scene;

    model.scale.set(0.85, 0.85, 0.85);
    model.position.set(15, 0, 8);
    model.traverse((child) => {
        if (child.isMesh) {
            child.receiveShadow = true;
            child.castShadow = true;
        }
    });
    renderer.compileAsync(model, camera, scene);
    scene.add(model);

    const boundingBox = new THREE.Box3().setFromObject(model);
    boundingBoxes.push(boundingBox);
    // Boounding box helper
    // const helper = new THREE.Box3Helper(smallerBox, 0xff0000);
    // scene.add(helper);

    const animation = gltf.animations;
    alpacaMixer3 = new THREE.AnimationMixer(model);
    const clip = THREE.AnimationClip.findByName(animation, "Idle_Headlow");
    const action = alpacaMixer3.clipAction(clip);
    action.play();

});


const cactusPositions = [
    [20, 3.7, -30, 0, "BigCactus.glb", 10, 14, 10],
    [30, 3.7, -31, 0, "BigCactus.glb", 10, 14, 10],
    [-20, 3.7, -5, 0, "BigCactus.glb", 10, 14, 10],
    [5, 3.7, 5, 0, "BigCactus.glb", 10, 14, 10],
    [25, 3.7, 13, 0, "BigCactus.glb", 10, 14, 10],
    [-25, 3.7, 23, 0, "BigCactus.glb", 10, 14, 10],
    [10, 3.7, -20, 0, "BigCactus.glb", 10, 14, 10],
    [-15, 3.7, 7, 0, "BigCactus.glb", 10, 14, 10]
];
cactusPositions.forEach(param => createStaticObject(param[0], param[1], param[2], param[3], param[4], param[5], param[6], param[7]));

const stonePositions = [
    [-26, 0, 21, 0, "stone.glb", 3, 3, 3],
    [16, 0, 16, 0, "stone.glb", 2, 2, 2],
    [31, 0, -31, 0, "stone.glb", 2, 2, 2],
    [6, 0, 6, 0, "stone.glb", 1.4, 1.4, 1.4],
    [21, 0, -21, 0, "stone.glb", 3, 3, 3],
    [-6, 0, -6, 0, "stone.glb", 3, 3, 3],
    [26, 0, 26, 0, "stone.glb", 2, 2, 2],
    [-21, 0, -16, 0, "stone.glb", 3, 3, 3],
    [-16, 0, 11, 0, "stone.glb", 3, 3, 3],
    [11, 0, -11, 0, "stone.glb", 2, 2, 2]
];

stonePositions.forEach(param => createStaticObject(param[0], param[1], param[2], param[3], param[4], param[5], param[6], param[7]));



const pyramidPos = [
    [0, 0, 35, 0, "Step Pyramid.glb", 55, 55, 55]
];

pyramidPos.forEach(param => createStaticObject(param[0], param[1], param[2], param[3], param[4], param[5], param[6], param[7]));



var isFPP = false;

// Camera movement controls
const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    e: false,
    q: false,
    r: false,
    t: false,
    v: false,
    b: false,
};

function moveCamera() {
    const speed = 0.1;
    if (keys.w) camera.position.z -= speed;
    if (keys.s) camera.position.z += speed;
    if (keys.a) camera.position.x -= speed;
    if (keys.d) camera.position.x += speed;
    if (keys.e) camera.rotation.z -= speed + 0.3; // rotate
    if (keys.q) camera.rotation.z += speed + 0.3; // rotate
    if (keys.r) camera.rotation.y -= speed + 0.3; // yaw
    if (keys.t) camera.rotation.y += speed + 0.3; // yaw
    if (keys.f) camera.rotation.x -= speed + 0.3; // pitch
    if (keys.g) camera.rotation.x += speed + 0.3; // pitch
    if (keys.v) isFPP = true; // change to FPP
    if (keys.b) isFPP = false; // change to FPP
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
    if (event.key === 'f') keys.f = true;
    if (event.key === 'g') keys.g = true;
    if (event.key === 'v') keys.v = true;
    if (event.key === 'b') keys.b = true;
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
    if (event.key === 'f') keys.f = false;
    if (event.key === 'g') keys.g = false;
    if (event.key === 'v') keys.v = false;
    if (event.key === 'b') keys.b = false;
});

const tween1 = new TWEEN.Tween(camera.position)
    .to({ x: 10, y: 19, z: 10 }, 5000)
    .easing(TWEEN.Easing.Quadratic.InOut);

const tween2 = new TWEEN.Tween(camera.position)
    .to({ x: -10, y: 15, z: -10 }, 5000)
    .easing(TWEEN.Easing.Quadratic.InOut);

const tween3 = new TWEEN.Tween(camera.position)
    .to({ x: 0, y: 10, z: 0 }, 5000)
    .easing(TWEEN.Easing.Quadratic.InOut);

tween1.chain(tween2);
tween2.chain(tween3);
tween3.chain(tween1);

// Set false to turn off cinematic
let isCinematic = false;

tween1.start();

document.addEventListener('keydown', (event) => {
    if (event.key === 'c') {
        isCinematic = !isCinematic;
        if (isCinematic) {
            tween1.start();
        } else {
            TWEEN.removeAll();
            orbitControls.enabled = true;
        }
    }
});



function animate() {
    const dt = clock.getDelta();
    if (isCinematic) {
        TWEEN.update();
        // orbitControls.enabled = false;
    } else {
        moveCamera();
    }
    if (isFPP) {
        player.setCamera(cameraFPP);
    } else {
        player.setCamera(cameraTPP);
    }

    if (alpacaMixer1) alpacaMixer1.update(dt);
    if (alpacaMixer2) alpacaMixer2.update(dt);
    if (alpacaMixer3) alpacaMixer3.update(dt);


    // Sun and light animation
    const time = Date.now() * 0.000095;
    const sunX = Math.sin(time) * 55;
    const sunY = Math.cos(time) * 25;
    sun.position.set(sunX, sunY, 20);
    directionalLight.position.copy(sun.position);
    directionalLight.intensity = Math.max(0.5, Math.cos(time) + 0.5);

    renderer.render(scene, camera);
    player.update(dt, boundingBoxes);
    // orbitControls.update();
}

renderer.setAnimationLoop(animate);