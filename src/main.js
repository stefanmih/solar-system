import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import solarSystemTexture from '../textures/solar_system.jpg';
import earthTexture from '../textures/earth.jpg';
import marsTexture from '../textures/mars.jpg';
import mercuryTexture from '../textures/mercury.jpg';
import venusTexture from '../textures/venus.jpg';
import jupiterTexture from '../textures/jupiter.jpg';
import saturnTexture from '../textures/saturn.jpg';
import uranusTexture from '../textures/uranus.jpg';
import neptuneTexture from '../textures/neptune.jpg';
import plutoTexture from '../textures/pluto.jpg';
import sunTexture from '../textures/sun.jpg';
import moonTexture from '../textures/moon.jpg';
import phobosTexture from '../textures/phobos.jpg';
import deimosTexture from '../textures/deimos.jpg';
import titanTexture from '../textures/titan.jpg';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 1000;
camera.position.set(0, 200, 400);
camera.rotation.x = Math.PI / 6;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0x404040, 50);
const sunLight = new THREE.PointLight(0xFFFFFF, 1, 100);
sunLight.position.set(0, 0, 0);
scene.add(ambientLight, sunLight);

scene.background = new THREE.TextureLoader().load(solarSystemTexture);

const sun = new THREE.Mesh(
    new THREE.SphereGeometry(50, 32, 32),
    new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load(sunTexture) })
);
scene.add(sun);

function createPlanet(radius, texture, distance, rotationSpeed, name, tilt = 0) {
    const planet = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 32, 32),
        new THREE.MeshStandardMaterial({ map: texture })
    );
    planet.position.x = distance;
    planet.rotationSpeed = rotationSpeed;
    planet.name = name;

    if (tilt !== 0) {
        planet.rotation.x = tilt;
    }

    planet.userData = {
        name: name,
        type: 'planet',
        radius: radius,
        distance: distance,
        rotationSpeed: rotationSpeed
    };

    scene.add(planet);
    return planet;
}

function createMoon(size, texture, distance, planet, rotationSpeed, orbitSpeed, name) {
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const material = new THREE.MeshStandardMaterial({ map: texture });
    const moon = new THREE.Mesh(geometry, material);

    moon.rotationSpeed = rotationSpeed;
    moon.orbitSpeed = orbitSpeed;
    moon.distanceFromPlanet = distance;

    moon.position.set(
        planet.position.x + distance,
        planet.position.y,
        planet.position.z
    );

    moon.userData = {
        name: name,
        type: 'moon',
        distance: distance,
        rotationSpeed: rotationSpeed
    };

    moon.name = 'moon_' + planet.name;

    scene.add(moon);

    return moon;
}

function createOrbit(a, b, tilt) {
    const points = [];
    for (let i = 0; i < 100; i++) {
        let angle = (i / 100) * Math.PI * 2;
        let x = a * Math.cos(angle);
        let z = b * Math.sin(angle);
        points.push(new THREE.Vector3(x, 0, z));
    }

    const orbit = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: "#b3b7ba" }));
    scene.add(orbit);

    if (tilt !== 0) {
        orbit.rotation.x = tilt;
    }
    orbit.visible = false;
    return orbit;
}

const mercury = createPlanet(1, new THREE.TextureLoader().load(mercuryTexture), 60, 5, "Merkur");
const venus = createPlanet(2, new THREE.TextureLoader().load(venusTexture), 100, 5, "Venera");
const earth = createPlanet(3, new THREE.TextureLoader().load(earthTexture), 150, 5, "Zemlja");
const mars = createPlanet(2.5, new THREE.TextureLoader().load(marsTexture), 220, 5, "Mars");
const jupiter = createPlanet(12, new THREE.TextureLoader().load(jupiterTexture), 300, 2, "Jupiter");
const saturn = createPlanet(10, new THREE.TextureLoader().load(saturnTexture), 400, 1, "Saturn");
const uranus = createPlanet(8, new THREE.TextureLoader().load(uranusTexture), 500, 0.5, "Uran");
const neptune = createPlanet(7, new THREE.TextureLoader().load(neptuneTexture), 600, 1, "Neptun", Math.PI / 6);
const pluto = createPlanet(4, new THREE.TextureLoader().load(plutoTexture), 700, 1, "Pluton", Math.PI / 6);

createMoon(0.27, new THREE.TextureLoader().load(moonTexture), 10, earth, 0.01, 0.005, "Mesec");
createMoon(0.15, new THREE.TextureLoader().load(phobosTexture), 5, mars, 0.02, 0.008, "Fobos");
createMoon(0.12, new THREE.TextureLoader().load(deimosTexture), 8, mars, 0.03, 0.01, "Deimos");
createMoon(0.4, new THREE.TextureLoader().load(titanTexture), 20, saturn, 0.015, 0.004, "Titan");

createOrbit(60, 55, 0);
createOrbit(100, 90, 0);
createOrbit(150, 150, 0);
createOrbit(220, 210, 0);
createOrbit(300, 280, 0);
createOrbit(400, 380, 0);
createOrbit(500, 480, 0);
createOrbit(600, 590, - Math.PI / 18);
createOrbit(700, 680, - Math.PI / 18);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 2;

let isPaused = false;
let showOrbits = false;

function togglePause() {
    isPaused = !isPaused;
}

function toggleOrbits() {
    showOrbits = !showOrbits;
    scene.children.forEach((child) => {
        if (child.type === 'LineLoop') {
            child.visible = showOrbits;
        }
    });
}

const clock = new THREE.Clock();
function animatePlanets() {
    if (!isPaused) {
        const delta = clock.getDelta();

        mercury.rotation.y += mercury.rotationSpeed * delta;
        venus.rotation.y += venus.rotationSpeed * delta;
        earth.rotation.y += earth.rotationSpeed * delta;
        mars.rotation.y += mars.rotationSpeed * delta;
        jupiter.rotation.y += jupiter.rotationSpeed * delta;
        saturn.rotation.y += saturn.rotationSpeed * delta;
        uranus.rotation.y += uranus.rotationSpeed * delta;
        neptune.rotation.y += 0.01 * delta;
        pluto.rotation.y += 0.01 * delta;

        mercury.position.x = Math.cos(Date.now() * 0.0005) * 60;
        mercury.position.z = Math.sin(Date.now() * 0.0005) * 55;

        venus.position.x = Math.cos(Date.now() * 0.0004) * 100;
        venus.position.z = Math.sin(Date.now() * 0.0004) * 90;

        earth.position.x = Math.cos(Date.now() * 0.0003) * 150;
        earth.position.z = Math.sin(Date.now() * 0.0003) * 150;

        mars.position.x = Math.cos(Date.now() * 0.00025) * 220;
        mars.position.z = Math.sin(Date.now() * 0.00025) * 210;

        jupiter.position.x = Math.cos(Date.now() * 0.0001) * 300;
        jupiter.position.z = Math.sin(Date.now() * 0.0001) * 280;

        saturn.position.x = Math.cos(Date.now() * 0.00008) * 400;
        saturn.position.z = Math.sin(Date.now() * 0.00008) * 380;

        uranus.position.x = Math.cos(Date.now() * 0.00005) * 500;
        uranus.position.z = Math.sin(Date.now() * 0.00005) * 480;

        neptune.position.x = Math.cos(Date.now() * 0.00002) * 600;
        neptune.position.z = Math.sin(Date.now() * 0.00002) * 590;
        neptune.position.y = Math.sin(Date.now() * 0.00002) * 100;

        pluto.position.x = Math.cos(Date.now() * 0.00002) * 700;
        pluto.position.z = Math.sin(Date.now() * 0.00002) * 680;
        pluto.position.y = Math.sin(Date.now() * 0.00002) * 120;

        scene.children.forEach(child => {
            if (child instanceof THREE.Mesh && child.name.includes('moon')) {
                child.rotation.y += child.rotationSpeed * delta;

                const angle = Date.now() * child.orbitSpeed;
                const parent = scene.getObjectByName(child.name.replace('moon_', ''));
                if (parent) {
                    child.position.x = parent.position.x + Math.cos(angle) * child.distanceFromPlanet;
                    child.position.z = parent.position.z + Math.sin(angle) * child.distanceFromPlanet;
                }
            }
        });
    }

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animatePlanets);
}

animatePlanets();

const tooltip = document.getElementById('tooltip');

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
});

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener('click', (event) => {
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
        const object = intersects[0].object;
        if (object.userData.type === 'planet') {
            tooltip.innerText = `Planeta: ${object.userData.name}, Udaljenost: ${object.userData.distance}k km`;
            tooltip.style.left = `${event.clientX + 10}px`;
            tooltip.style.top = `${event.clientY + 10}px`;
            tooltip.style.display = 'block';
        } else if (object.userData.type === 'moon') {
            tooltip.innerText = `Mesec: ${object.userData.name}, Orbita: ${object.userData.distance}k km`;
            tooltip.style.left = `${event.clientX + 10}px`;
            tooltip.style.top = `${event.clientY + 10}px`;
            tooltip.style.display = 'block';
        }
    } else {
        tooltip.style.display = 'none';
    }
});

window.addEventListener('keydown', (event) => {
    if (event.key === 'p') togglePause();
    if (event.key === 'o') toggleOrbits();
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});