import * as THREE from "three";
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class Player {

    constructor(camera, controller, scene, speed) {
        this.camera = camera;
        this.controller = controller;
        this.scene = scene;
        this.speed = speed;
        this.state = "idle";
        this.cameraRotationY = 0;
        this.cameraRotationZ = 0;
        this.rotationVector = new THREE.Vector3(0, 0, 0);
        this.animations = {};
        this.lastRotation = 0;
        this.rotationSpeed = Math.PI / 2;
        this.currentRotation = new THREE.Euler(0, 0, 0);
        this.camera.setup(new THREE.Vector3(0, 0, 0), this.rotationVector);
        this.boundingBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        // this.mesh = new THREE.Mesh(
        //     new THREE.BoxGeometry(1,1,1),
        //     new THREE.MeshPhongMaterial({color: 0xFF1111})
        // );
        // this.scene.add(this.mesh);
        // this.mesh.castShadow = true;
        // this.mesh.receiveShadow = true;

        this.loadModel();
    }

    loadModel() {
        var loader = new FBXLoader();
        loader.setPath('./models/');
        loader.load('Breathing Idle.fbx', (fbx) => {
            fbx.scale.setScalar(0.015);
            fbx.traverse(c => {
                c.castShadow = true;
            });
            this.mesh = fbx;
            this.scene.add(this.mesh);
            this.mesh.rotation.y += Math.PI / 2;

            this.mixer = new THREE.AnimationMixer(this.mesh);

            var onLoad = (animName, anim) => {
                const clip = anim.animations[0];
                const action = this.mixer.clipAction(clip);

                this.animations[animName] = {
                    clip: clip,
                    action: action,
                };
            };

            const loader = new FBXLoader();
            loader.setPath('./models/');
            loader.load('Breathing Idle.fbx', (fbx) => { onLoad('idle', fbx) });
            loader.load('Running.fbx', (fbx) => { onLoad('run', fbx) });

            // this.boundingBox = new THREE.Box3().setFromObject(this.mesh);
        });
    }

    updateBoundingBox() {
        if (this.mesh) {
            this.boundingBox.setFromObject(this.mesh);
        }
    }

    checkCollision(boundingBoxes) {
        for (let i = 0; i < boundingBoxes.length; i++) {
            if (this.boundingBox.intersectsBox(boundingBoxes[i])) {
                return true;
            }
        }
        return false;
    }

    update(dt, boundingBoxes) {
        if (this.mesh && this.animations) {
            this.updateBoundingBox();
            const currentPos = this.mesh.position.clone();

            this.lastRotation = this.mesh.rotation.y;
            var direction = new THREE.Vector3(0, 0, 0);


            if (this.controller.keys["forward"]) {
                direction.z += this.speed * dt;
            }
            if (this.controller.keys["backward"]) {
                direction.z -= this.speed * dt;
            }
            // console.log(direction.z);
            if (this.controller.keys["left"]) {
                this.currentRotation.y += this.rotationSpeed * dt * 1.8;
            }
            if (this.controller.keys["right"]) {
                this.currentRotation.y -= this.rotationSpeed * dt * 1.8;
            }

            this.lastRotation = this.mesh.rotation.y;
            // console.log(direction.length())  
            if (direction.length() == 0) {
                if (this.animations['idle']) {
                    if (this.state != "idle") {
                        this.mixer.stopAllAction();
                        this.state = "idle";
                    }
                    this.mixer.clipAction(this.animations['idle'].clip).play();
                }
            } else {
                if (this.animations['run']) {
                    if (this.state != "run") {
                        this.mixer.stopAllAction();
                        this.state = "run";
                    }
                    this.mixer.clipAction(this.animations['run'].clip).play();
                }
            }

            if (this.controller.keys["peekLeft"]) {
                this.cameraRotationZ = Math.min(
                    this.cameraRotationZ + this.rotationSpeed * dt,
                    15 * (Math.PI / 180)
                );
            } else if (this.controller.keys["peekRight"]) {
                this.cameraRotationZ = Math.max(
                    this.cameraRotationZ - this.rotationSpeed * dt,
                    -15 * (Math.PI / 180)
                );
            } else {
                // If no peek keys are pressed, reset cameraRotationZ to zero
                if (this.cameraRotationZ > 0) {
                    this.cameraRotationZ = Math.max(this.cameraRotationZ - this.rotationSpeed * dt, 0);
                } else if (this.cameraRotationZ < 0) {
                    this.cameraRotationZ = Math.min(this.cameraRotationZ + this.rotationSpeed * dt, 0);
                }
            }


            this.currentRotation.y += this.rotationVector.y * dt; // add dtmousex
            this.currentRotation.z += this.rotationVector.z * dt;

            // Reset
            this.rotationVector.set(0, 0, 0);

            // Apply player rotation to direction vector
            direction.applyAxisAngle(
                new THREE.Vector3(0, 1, 0),
                this.currentRotation.y
            );

            if (this.isFpp) {
                direction.applyAxisAngle(
                    new THREE.Vector3(0, 3, 0),
                    this.cameraRotationY
                );
            }

            this.mesh.position.add(direction);
            this.mesh.rotation.copy(this.currentRotation);

            this.camera.setup(
                this.mesh.position,
                this.currentRotation,
                this.cameraRotationY,
                this.cameraRotationZ,
                this.xLevel,
                this.isZooming
            );


            this.updateBoundingBox();
            if (this.checkCollision(boundingBoxes)) {
                this.mesh.position.copy(currentPos);
            } else {
                this.camera.setup(this.mesh.position, this.currentRotation, this.cameraRotationY, this.cameraRotationZ);
            }

            if (this.mixer) {
                this.mixer.update(dt);
            }

        }
        // this.boundingBox = new THREE.Box3().setFromObject(this.mesh);

    }

    setCamera(camera) {
        this.camera = camera;
    }


    getMesh() {
        return this.mesh;
    }

    getPosition() {
        return this.mesh.position;
    }

}

export class PlayerController {

    constructor() {
        this.keys = {
            "forward": false,
            "backward": false,
            "left": false,
            "right": false,
            "peekLeft": false,
            "peekRight": false,
        }
        this.mousePos = new THREE.Vector2();
        this.mouseDown = false;
        this.keyDown = false;
        this.deltaMousePos = new THREE.Vector2();
        document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
        document.addEventListener('keyup', (e) => this.onKeyUp(e), false);
        // document.addEventListener('mousemove', (e) => this.onMouseMove(e), false);
        // document.addEventListener('mousedown', (e) => this.onMouseDown(e), false);
        // document.addEventListener('mouseup', (e) => this.onMouseUp(e), false);
    }
    onMouseDown(event) {
        this.mouseDown = true;
    }
    onMouseUp(event) {
        this.mouseDown = false;
    }
    onMouseMove(event) {
        var currentMousePos = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );
        this.deltaMousePos.addVectors(currentMousePos, this.mousePos.multiplyScalar(-1));
        this.mousePos.copy(currentMousePos);
    }
    onKeyDown(event) {
        switch (event.keyCode) {
            case "W".charCodeAt(0):
            case "w".charCodeAt(0):
                this.keys['forward'] = true;
                this.keyDown = true;
                break;
            case "S".charCodeAt(0):
            case "s".charCodeAt(0):
                this.keys['backward'] = true;
                this.keyDown = true;
                break;
            case "A".charCodeAt(0):
            case "a".charCodeAt(0):
                this.keys['left'] = true;
                this.keyDown = true;
                break;
            case "D".charCodeAt(0):
            case "d".charCodeAt(0):
                this.keys['right'] = true;
                this.keyDown = true;
                break;
            case 39:
                this.keys['peekRight'] = true;
                this.keyDown = true;
                break;
            case 37:
                this.keys['peekLeft'] = true;
                this.keyDown = true;
                break;
        }
    }
    onKeyUp(event) {
        switch (event.keyCode) {
            case "W".charCodeAt(0):
            case "w".charCodeAt(0):
                this.keys['forward'] = false;
                this.keyDown = false;
                break;
            case "S".charCodeAt(0):
            case "s".charCodeAt(0):
                this.keys['backward'] = false;
                this.keyDown = false;
                break;
            case "A".charCodeAt(0):
            case "a".charCodeAt(0):
                this.keys['left'] = false;
                this.keyDown = false;
                break;
            case "D".charCodeAt(0):
            case "d".charCodeAt(0):
                this.keys['right'] = false;
                this.keyDown = false;
                break;
            case 39:
                this.keys['peekRight'] = false;
                this.keyDown = false;
                break;
            case 37:
                this.keys['peekLeft'] = false;
                this.keyDown = false;
                break;
        }
    }


}

export class ThirdPersonCamera {
    constructor(camera, positionOffSet, targetOffSet, isFpp = false) {
        this.camera = camera;
        this.positionOffSet = positionOffSet;
        this.targetOffSet = targetOffSet;
        this.isFpp = isFpp;
    }

    setup(
        target,
        rotation,
        cameraRotationY = 0,
        cameraRotationZ = 0,
        xLevel = 0,
        isZooming = false
    ) {
        var temp = new THREE.Vector3();
        temp.copy(this.positionOffSet);
        temp.applyAxisAngle(
            new THREE.Vector3(0, 1, 0),
            rotation.y + cameraRotationY
        );
        temp.add(target);
        this.camera.position.copy(temp);
        if (!isZooming) {
            if (!this.isFpp) {
                var lookAtTarget = new THREE.Vector3();
                lookAtTarget.addVectors(target, this.targetOffSet);
                this.camera.lookAt(lookAtTarget);
                // this.isFpp = false;
            } else {
                // this.isFpp = true;
                //Pitch roll yaw
                this.camera.rotation.order = "YXZ"; // Ensure correct order of rotations
                this.camera.rotation.x = -xLevel; // Pitch
                this.camera.rotation.y = rotation.y + Math.PI - cameraRotationY; // Yaw
                this.camera.rotation.z = cameraRotationZ; // Roll
            }
        }
    }
}

// export class FirstPersonCamera {
//     constructor(camera, positionOffSet, targetOffSet) {
//         this.camera = camera;
//         this.positionOffSet = positionOffSet;
//         this.targetOffSet = targetOffSet;
//     }
//     setup(target, angle) {
//         var temp = new THREE.Vector3(0, 0, 0);
//         temp.copy(this.positionOffSet);
//         temp.applyAxisAngle(new THREE.Vector3(angle.x, 1, 0), angle.y);
//         temp.applyAxisAngle(new THREE.Vector3(angle.y, 0, 1), angle.z);
//         temp.addVectors(target, temp);
//         this.camera.position.copy(temp);
//         temp = new THREE.Vector3(0, 0, 0);
//         temp.addVectors(target, this.targetOffSet);
//         this.camera.lookAt(temp);
//     }
// }