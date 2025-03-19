let scene, camera, renderer, sphere;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let rotationSpeed = { x: 0.01, y: 0.01 };
let font;
let canvasTexture, textureContext;

const poemWords = [
    'meio', 'caminho', 'tinha', 'uma', 'pedra',
    'Nunca', 'me', 'esquecerei', 'desse', 'acontecimento',
    'Na', 'vida', 'de', 'minhas', 'retinas',
    'tão', 'fatigadas'
];

const gradientColors = [
    { color1: 0xff1493, color2: 0x9400d3 }, // Pink to Purple
    { color1: 0x00bfff, color2: 0x4b0082 }, // Blue to Indigo
    { color1: 0xff4500, color2: 0xff1493 }, // Orange to Pink
    { color1: 0x32cd32, color2: 0x00bfff }  // Green to Blue
];

let textMeshes = [];

function loadFont() {
    return new Promise((resolve, reject) => {
        const loader = new THREE.FontLoader();
        loader.load('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/fonts/helvetiker_regular.typeface.json',
            (loadedFont) => {
                font = loadedFont;
                resolve();
            },
            undefined,
            (error) => {
                console.error('Font loading error:', error);
                reject(error);
            }
        );
    });
}

async function init() {
    await loadFont();
    // Create scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xffffff);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create sphere
    const geometry = new THREE.SphereGeometry(2, 32, 32);
    
    // Create canvas texture
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    textureContext = canvas.getContext('2d');
    textureContext.fillStyle = '#0000ff';
    textureContext.fillRect(0, 0, canvas.width, canvas.height);
    
    canvasTexture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshPhongMaterial({
        map: canvasTexture
    });
    sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Add lights
    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(10, 10, 10);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    camera.position.z = 5;

    // Add event listeners
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('click', onSphereClick);
}

function onMouseDown(event) {
    isDragging = true;
    previousMousePosition = {
        x: event.clientX,
        y: event.clientY
    };
}

function onMouseMove(event) {
    if (!isDragging) return;

    const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y
    };

    sphere.rotation.y += deltaMove.x * 0.005;
    sphere.rotation.x += deltaMove.y * 0.005;

    previousMousePosition = {
        x: event.clientX,
        y: event.clientY
    };
}

function onMouseUp() {
    isDragging = false;
}

function onSphereClick(event) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(sphere);

    if (intersects.length > 0) {
        const uv = intersects[0].uv;
        const x = Math.floor(uv.x * textureContext.canvas.width);
        const y = Math.floor((1 - uv.y) * textureContext.canvas.height);

        // Get random word and colors
        const randomWord = poemWords[Math.floor(Math.random() * poemWords.length)];
        const gradient = gradientColors[Math.floor(Math.random() * gradientColors.length)];

        // Set text properties
        textureContext.font = '20px Arial';
        textureContext.fillStyle = `#${gradient.color1.toString(16)}`;
        textureContext.textAlign = 'center';
        textureContext.textBaseline = 'middle';

        // Draw text on canvas
        textureContext.fillText(randomWord, x, y);

        // Update texture
        canvasTexture.needsUpdate = true;
    }
}

function animate() {
    requestAnimationFrame(animate);

    if (!isDragging) {
        sphere.rotation.x += rotationSpeed.x;
        sphere.rotation.y += rotationSpeed.y;
    }

    renderer.render(scene, camera);
}

init();
animate();

// Handle window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});