import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// To allow for the camera to move around the scene
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
// To allow for importing the .gltf file
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

import { ARButton } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/webxr/ARButton.js";

let scene, camera, renderer;
let decorationModel;
let reticle; // Visual indicator for placement
let hitTestSource = null;
let hitTestSourceRequested = false;

function init() {
    // Create scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);

    // Renderer with WebXR enabled
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);

    // AR Button
    document.getElementById("ar-button-container").appendChild(ARButton.createButton(renderer, { requiredFeatures: ["hit-test"] }));

    // Lighting
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    // Load 3D decoration model
    const loader = new GLTFLoader();
    loader.load("car.glb", (gltf) => {
        decorationModel = gltf.scene;
        decorationModel.visible = false; // Hide until placed
        scene.add(decorationModel);
    });

    // Create reticle (a guide for placement)
    const reticleGeometry = new THREE.RingGeometry(0.1, 0.15, 32).rotateX(-Math.PI / 2);
    const reticleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
    reticle = new THREE.Mesh(reticleGeometry, reticleMaterial);
    reticle.visible = false;
    scene.add(reticle);

    // Handle user tap to place the decoration
    renderer.domElement.addEventListener("click", () => {
        if (reticle.visible) {
            decorationModel.position.set(reticle.position.x, reticle.position.y, reticle.position.z);
            decorationModel.visible = true;
        }
    });

    // Render loop
    renderer.setAnimationLoop(render);
}

function render(timestamp, frame) {
    if (frame) {
        const session = renderer.xr.getSession();
        if (!hitTestSourceRequested) {
            session.requestReferenceSpace("viewer").then((referenceSpace) => {
                session.requestHitTestSource({ space: referenceSpace }).then((source) => {
                    hitTestSource = source;
                });
            });

            hitTestSourceRequested = true;
        }

        if (hitTestSource) {
            const hitTestResults = frame.getHitTestResults(hitTestSource);
            if (hitTestResults.length > 0) {
                const hitPose = hitTestResults[0].getPose(renderer.xr.getReferenceSpace());
                reticle.visible = true;
                reticle.position.set(hitPose.transform.position.x, hitPose.transform.position.y, hitPose.transform.position.z);
            } else {
                reticle.visible = false;
            }
        }
    }

    renderer.render(scene, camera);
}

// Start AR experience
init();
