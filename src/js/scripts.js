import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Player, PlayerController, ThirdPersonCamera } from "./player.js";
import TWEEN from '@tweenjs/tween.js';

const clock = new THREE.Clock();
let alpacaMixer1, alpacaMixer2, alpacaMixer3, dinoMixer;

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

const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.rotateSpeed = 1.5;  // Default is 1.0
orbitControls.zoomSpeed = 2;    // Default is 1.2
orbitControls.panSpeed = 1.6;
orbitControls.update();

// Not affected karna updated trs pake yg TPP Camera
camera.position.set(0, 0, 0);


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

// Add specular light (PointLight)
const pointLight = new THREE.PointLight(0xffffff, 10, 100); // white light
pointLight.position.set(10, 50, 10);
scene.add(pointLight);

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

        const reductionFactor = 0.82; // 82% from og size
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

objectLoader.load("Dino.glb", function (gltf) {
    const model = gltf.scene;

    model.scale.set(1, 1, 1);
    model.position.set(-10, 0, -15);
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
    const helper = new THREE.Box3Helper(smallerBox, 0xff0000);
    scene.add(helper);

    const animation = gltf.animations;
    dinoMixer = new THREE.AnimationMixer(model);
    const clip = THREE.AnimationClip.findByName(animation, "Velociraptor_Idle");
    const action = dinoMixer.clipAction(clip);
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
    [-20, 3.7, -12, 0, "BigCactus.glb", 10, 14, 10],
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



const pyramidPositions = [
    [0, 8, 35, 0, "Step Pyramid.glb", 25, 25, 25]
];

pyramidPositions.forEach(param => createStaticObject(param[0], param[1], param[2], param[3], param[4], param[5], param[6], param[7]));

const valleyPositions = [
    [0, 3.1, -35, 0, "Valley.glb", 30, 30, 30]
];

valleyPositions.forEach(param => createStaticObject(param[0], param[1], param[2], param[3], param[4], param[5], param[6], param[7]));

const saloonPositions = [
    [-32, 0, -20, 0, "Saloon.glb", 1, 1, 1]
];

saloonPositions.forEach(param => createStaticObject(param[0], param[1], param[2], param[3], param[4], param[5], param[6], param[7]));

// const dinoPositions = [
//     [-10, 0, -15, 0, "Dino.glb", 1, 1, 1]
// ];

// dinoPositions.forEach(param => createStaticObject(param[0], param[1], param[2], param[3], param[4], param[5], param[6], param[7]));

function createHouse(x, z) {
    const house = new THREE.Group();

    // Walls
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const wallGeometry = new THREE.BoxGeometry(4.5, 5, 0.2);
    const wallGeometry1 = new THREE.BoxGeometry(4.5, 3, 0.2);
    // const wallGeometry1 = new THREE.BoxGeometry(5, 5, 0.2);

    //tembok pintu
    const wall1 = new THREE.Mesh(wallGeometry, wallMaterial);
    wall1.position.set(2.8, 2.5, 5);
    wall1.castShadow = true;
    house.add(wall1);

    //tembok pintu
    const wall2 = new THREE.Mesh(wallGeometry, wallMaterial);
    wall2.position.set(-2.8, 2.5, 5);
    wall2.castShadow = true;
    house.add(wall2);

    //samping kanan kiri
    const wall3 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5, 10), wallMaterial);
    wall3.position.set(5, 2.5, 0);
    wall3.castShadow = true;
    house.add(wall3);

    //samping kanan kiri
    const wall4 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5, 10), wallMaterial);
    wall4.position.set(-5, 2.5, 0);
    wall4.castShadow = true;
    house.add(wall4);

    //tembok lawan arah pintu
    const wall5 = new THREE.Mesh(wallGeometry, wallMaterial);
    wall5.position.set(-2.8, 2.5, -5);
    wall5.castShadow = true;
    house.add(wall5);

    //tembok lawan arah pintu
    const wall6 = new THREE.Mesh(wallGeometry, wallMaterial);
    wall6.position.set(2.8, 2.5, -5);
    wall6.castShadow = true;
    house.add(wall6);

    //tembok lawan arah pintu
    //  const wall7 = new THREE.Mesh(wallGeometry1, wallMaterial);
    //  wall7.position.set(0, 1.5, -5);
    //  wall7.castShadow = true;
    //  house.add(wall7);

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
    // const doorGeometry = new THREE.BoxGeometry(1.5, 3, 0.1);
    // const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
    // const door = new THREE.Mesh(doorGeometry, doorMaterial);
    // door.position.set(0, 1.5, 5);
    // door.castShadow = true;
    // house.add(door);

    // Windows
    const windowGeometry = new THREE.BoxGeometry(1.5, 5.2, 0.1);
    const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0x87CEEB,
        transparent: true,
        opacity: 0.5
    });

    // Create and position windows
    const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
    window1.position.set(0, 2.5, 5);
    window1.castShadow = true;
    house.add(window1);

    // const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
    // window2.position.set(-1, 3, 5);
    // window2.castShadow = true;
    // house.add(window2);

    const window3 = new THREE.Mesh(windowGeometry, windowMaterial);
    window3.position.set(0, 2.2, -5);
    window3.castShadow = true;
    house.add(window3);

    // const window4 = new THREE.Mesh(windowGeometry, windowMaterial);
    // window4.position.set(-1, 3, -5);
    // window4.castShadow = true;
    // house.add(window4);

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

var isFPP = false;
var isFree = false;

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
    y: false,
};

function moveCamera() {
    const speed = 0.01;
    if (keys.w) camera.position.z -= speed;
    if (keys.s) camera.position.z += speed;
    if (keys.a) camera.position.x -= speed;
    if (keys.d) camera.position.x += speed;
    if (keys.e) camera.rotation.z -= speed + 0.3; // rotate
    if (keys.q) camera.rotation.z += speed + 0.3; // rotate
    if (keys.r) camera.rotation.y -= speed + 0.3; // yaw
    if (keys.t) camera.rotation.y += speed + 0.3; // yaw
    // if (keys.f) camera.rotation.x -= speed + 0.3; // pitch
    if (keys.g) camera.rotation.x += speed + 0.3; // pitch
    if (keys.v) isFPP = true; // change to FPP
    if (keys.b) isFPP = false; // change to FPP
    if (keys.f) isFree = true; // change to FPP
    if (keys.y) isFree = false; // change to FPP
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
    if (event.key === 'y') keys.y = true;
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
    if (event.key === 'y') keys.y = false;
});

const tween1 = new TWEEN.Tween(camera.position)
    .to({ x: 10, y: 19, z: -20 }, 5000)  
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
let isCinematic = true;

tween1.start();

document.addEventListener('keydown', (event) => {
    if (event.key === 'c') {
        isCinematic = !isCinematic;
        if (isCinematic) {
            tween1.start();
        } else {
            TWEEN.removeAll();
            // orbitControls.enabled = true;
        }
    }
});


const startColor = new THREE.Color(0x87CEEB); // Light sky blue
const endColor = new THREE.Color(0x00008B);
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

    if (isFree) {
        orbitControls.enabled = true;
    } else {
        orbitControls.enabled = false;
    }

    if (alpacaMixer1) alpacaMixer1.update(dt);
    if (alpacaMixer2) alpacaMixer2.update(dt);
    if (alpacaMixer3) alpacaMixer3.update(dt);
    if (dinoMixer) dinoMixer.update(dt);


    // Sun and light animation
    const time = Date.now() * 0.000095;
    const sunX = Math.sin(time) * 55;
    const sunY = Math.cos(time) * 25;
    sun.position.set(sunX, sunY, 20);
    directionalLight.position.copy(sun.position);
    directionalLight.intensity = Math.max(0.5, Math.cos(time) + 0.5);

    const colorInterpolationFactor = (Math.sin(time) + 1) / 2;
    const currentColor = startColor.clone().lerp(endColor, colorInterpolationFactor);
    scene.background = currentColor;

    
    renderer.render(scene, camera);
    if (!isFree)
        player.update(dt, boundingBoxes);
    // orbitControls.update();
}

renderer.setAnimationLoop(animate);