import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// To allow for the camera to move around the scene
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
// To allow for importing the .gltf file
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

import { ARButton } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/webxr/ARButton.js";

let scene, camera, renderer;
let decorationModel;

function init() {
    // Create scene
    scene = new THREE.Scene();

    // Set up camera
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
    
    // Set up renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Add AR button
    document.body.appendChild(ARButton.createButton(renderer));

    // Add lighting
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    // Load a decoration model (Replace with your 3D model)
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2); // Example cube (replace with model)
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    decorationModel = new THREE.Mesh(geometry, material);
    decorationModel.position.set(0, 0, -1); // 1 meter in front of the user
    scene.add(decorationModel);

    // Start rendering loop
    renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
    });
}

// Start AR experience
init();

document.addEventListener("click", (event) => {
    if (!decorationModel) return;

    // Get touch position
    let touchX = (event.clientX / window.innerWidth) * 2 - 1;
    let touchY = -(event.clientY / window.innerHeight) * 2 + 1;

    // Convert touch position to world space
    let raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(touchX, touchY), camera);

    let intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
        decorationModel.position.set(intersects[0].point.x, intersects[0].point.y, intersects[0].point.z);
    }
});


const loader = new GLTFLoader();
loader.load("car.glb", (gltf) => {
    decorationModel = gltf.scene;
    decorationModel.position.set(0, 0, -50); // Start 1m in front
    scene.add(decorationModel);
});

