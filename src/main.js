import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Importovanje tekstura
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

// Kreiraj scenu, kameru, i renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 1000;
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Osvetljenje
const ambientLight = new THREE.AmbientLight(0x404040, 50);
const sunLight = new THREE.PointLight(0xFFFFFF, 1, 100);
sunLight.position.set(0, 0, 0);
scene.add(ambientLight, sunLight);

// Učitavanje pozadinske slike
scene.background = new THREE.TextureLoader().load(solarSystemTexture);

// Kreiraj Sunce
const sun = new THREE.Mesh(
    new THREE.SphereGeometry(50, 32, 32),
    new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load(sunTexture) })
);
scene.add(sun);

// Kreiraj planetu
function createPlanet(radius, texture, distance, rotationSpeed, name, tilt = 0) {
    const planet = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 32, 32),
        new THREE.MeshStandardMaterial({ map: texture })
    );
    planet.position.x = distance;
    planet.rotationSpeed = rotationSpeed;
    planet.name = name;
    
    // Ako je tilt definisan, postavljamo rotaciju planetarne putanje
    if (tilt !== 0) {
        planet.rotation.x = tilt;
    }

    scene.add(planet);
    return planet;
}

// Kreiranje meseca
function createMoon(radius, texture, distance, planet) {
    const moon = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 32), new THREE.MeshStandardMaterial({ map: texture }));
    moon.position.x = distance;
    planet.add(moon);
    return moon;
}

// Kreiranje planetarnih orbita sa tiltovanjem
function createOrbit(a, b, tilt) {
    const points = [];
    for (let i = 0; i < 100; i++) {
        let angle = (i / 100) * Math.PI * 2;
        let x = a * Math.cos(angle); // Semi-major axis
        let z = b * Math.sin(angle); // Semi-minor axis
        points.push(new THREE.Vector3(x, 0, z));
    }

    const orbit = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: "#b3b7ba" }));
    scene.add(orbit);

    // Ako je tilt prisutan, rotiramo orbitu
    if (tilt !== 0) {
        orbit.rotation.x = tilt; // Rotacija orbite prema tiltu
    }
    orbit.visible = false; // Orbita nije vidljiva po defaultu
    return orbit;
}

// Kreiranje planeta sa tiltovanim putanjama
const mercury = createPlanet(1, new THREE.TextureLoader().load(mercuryTexture), 60, 5, "Merkur");
const venus = createPlanet(2, new THREE.TextureLoader().load(venusTexture), 100, 5, "Venera");
const earth = createPlanet(3, new THREE.TextureLoader().load(earthTexture), 150, 5, "Zemlja");
const mars = createPlanet(2.5, new THREE.TextureLoader().load(marsTexture), 220, 5, "Mars");
const jupiter = createPlanet(12, new THREE.TextureLoader().load(jupiterTexture), 300, 2, "Jupiter");
const saturn = createPlanet(10, new THREE.TextureLoader().load(saturnTexture), 400, 1, "Saturn");
const uranus = createPlanet(8, new THREE.TextureLoader().load(uranusTexture), 500, 0.5, "Uranus");
const neptune = createPlanet(7, new THREE.TextureLoader().load(neptuneTexture), 600, 0.5, "Neptun");  // Tilt za Neptun
const pluto = createPlanet(4, new THREE.TextureLoader().load(plutoTexture), 700, 0.5, "Pluton");  // Tilt za Pluton

// Kreiranje meseca za planete
createMoon(0.27, new THREE.TextureLoader().load(moonTexture), 10, earth);
createMoon(0.15, new THREE.TextureLoader().load(phobosTexture), 5, mars);
createMoon(0.12, new THREE.TextureLoader().load(deimosTexture), 8, mars);
createMoon(0.4, new THREE.TextureLoader().load(titanTexture), 20, saturn);

// Kreiranje orbita sa tiltovanim putanjama
createOrbit(60, 55, 0);  // Merkur
createOrbit(100, 90, 0);  // Venera
createOrbit(150, 150, 0);  // Zemlja
createOrbit(220, 210, 0);  // Mars
createOrbit(300, 280, 0);  // Jupiter
createOrbit(400, 380, 0);  // Saturn
createOrbit(500, 480, 0);  // Uranus

// Kreiranje tiltovanih orbita za Neptun i Pluton
createOrbit(600, 590, 0);  // Neptun tiltovan
createOrbit(700, 680, 0);  // Pluton tiltovan

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 2;

// Funkcija za pauzu
let isPaused = false;
function togglePause() {
    isPaused = !isPaused;
}

// Animacija
const clock = new THREE.Clock();
function animatePlanets() {
    if (!isPaused) {
        const delta = clock.getDelta();

        // Rotacije planeta (oko Sunca, ne oko svoje ose)
        mercury.rotation.y += mercury.rotationSpeed * delta;
        venus.rotation.y += venus.rotationSpeed * delta;
        earth.rotation.y += earth.rotationSpeed * delta;
        mars.rotation.y += mars.rotationSpeed * delta;
        jupiter.rotation.y += jupiter.rotationSpeed * delta;
        saturn.rotation.y += saturn.rotationSpeed * delta;
        uranus.rotation.y += uranus.rotationSpeed * delta;
        neptune.rotation.y += 0.01 * delta;
        pluto.rotation.y += 0.01 * delta;

        // Kretanje planeta
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

        // Neptun i Pluton prate tiltovane orbite
        neptune.position.x = Math.cos(Date.now() * 0.00002) * 600;
        neptune.position.z = Math.sin(Date.now() * 0.00002) * 590;

        pluto.position.x = Math.cos(Date.now() * 0.00002) * 700;
        pluto.position.z = Math.sin(Date.now() * 0.00002) * 680;
    }

    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animatePlanets);
}

animatePlanets();

// Event listener za pauzu i orbite
window.addEventListener('keydown', (event) => {
    if (event.key === 'o') {
        scene.children.forEach(child => {
            if (child instanceof THREE.LineLoop) {
                child.visible = !child.visible;
            }
        });
    } else if (event.key === 'p') {
        togglePause();
    }
});

// Resizing prozora
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
