import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
export function createWorld(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x15131c);
  const camera = new THREE.OrthographicCamera(-5, 5, 3.25, -3.25, 0.1, 50);
  let mode = "room";
  const material = (color, extra = {}) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.7, ...extra });
  const dark = material(0x292730),
    metal = material(0x181e27),
    wood = material(0x443336),
    fabric = material(0x302532),
    mint = material(0x78c9b5, { emissive: 0x245747 }),
    amber = material(0xffbc79, { emissive: 0xcc6929 });
  function box(w, h, d, x, y, z, mat = dark, parent = scene) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  function round(w, h, d, x, y, z, mat, parent = scene) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), mat);
    m.scale.set(w / 2, h / 2, d / 2);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  function cushion(w, h, d, x, y, z, mat, parent) {
    const m = new THREE.Mesh(
      new RoundedBoxGeometry(w, h, d, 3, Math.min(w, h, d) * 0.3),
      mat,
    );
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  box(10, 0.12, 7, 0, -0.06, 0, material(0x171920));
  for (let i = -4; i <= 4; i++) box(0.012, 0.002, 7, i, 0.002, 0, metal);
  for (let i = -3; i <= 3; i++) box(10, 0.002, 0.012, 0, 0.002, i, metal);
  box(10, 4, 0.15, 0, 1.9, -3.1);
  box(0.15, 4, 7, -5, 1.9, 0);
  box(9, 2.5, 0.08, 0, 2.1, -2.99, material(0x0c162a, { emissive: 0x081327 }));
  for (let i = 0; i < 24; i++) {
    const x = -4.3 + i * 0.37,
      h = 0.5 + ((i * 7) % 11) * 0.09;
    box(0.28, h, 0.08, x, 0.9 + h / 2, -2.91, material(0x242c42));
    for (let j = 0; j < 5; j++)
      box(
        0.028,
        0.035,
        0.015,
        x + 0.06 * (j % 2),
        1.05 + j * 0.19,
        -2.86,
        material(j % 2 ? 0x815d9d : 0x4b889b, {
          emissive: j % 2 ? 0x342541 : 0x1d4855,
        }),
      );
  }
  for (let i = -3; i <= 3; i++)
    box(0.045, 2.55, 0.1, i * 1.45, 2.1, -2.8, metal);
  box(9, 0.045, 0.1, 0, 2.12, -2.8, metal);
  for (let i = 0; i < 45; i++)
    box(
      0.007,
      0.15 + (i % 3) * 0.06,
      0.008,
      -4.2 + ((i * 37) % 89) / 10,
      1 + ((i * 13) % 23) / 10,
      -2.78,
      material(0x426372),
    );
  // Workstation: keyboard is on the operator side of the monitor.
  box(1.8, 0.1, 0.9, 2, 0.92, 0.36, wood);
  box(1.82, 0.018, 0.91, 2, 0.975, 0.36, metal);
  box(1.6, 0.015, 0.015, 2, 0.9, 0.819, mint);
  for (const x of [1.25, 2.75])
    for (const z of [0.03, 0.7]) box(0.07, 0.9, 0.07, x, 0.43, z, metal);
  box(0.65, 0.035, 0.25, 2, 1, 0.1, metal);
  for (let i = 0; i < 12; i++)
    for (let j = 0; j < 3; j++)
      box(
        0.043,
        0.008,
        0.044,
        1.72 + i * 0.05,
        1.024,
        0.03 + j * 0.06,
        material(0x596471),
      );
  box(0.1, 0.26, 0.1, 2, 1.11, 0.61, metal);
  box(0.78, 0.46, 0.065, 2, 1.39, 0.61, metal);
  box(
    0.71,
    0.39,
    0.01,
    2,
    1.39,
    0.572,
    material(0x122a31, { emissive: 0x0b2329 }),
  );
  for (let i = 0; i < 5; i++)
    box(0.42 - i * 0.045, 0.012, 0.01, 1.95, 1.51 - i * 0.06, 0.562, mint);
  const chair = new THREE.Group();
  chair.position.set(2, 0, -0.65);
  scene.add(chair);
  box(0.57, 0.1, 0.55, 0, 0.51, 0, metal, chair);
  box(0.51, 0.61, 0.1, 0, 0.87, -0.25, metal, chair);
  round(0.45, 0.53, 0.13, 0, 0.88, -0.18, dark, chair);
  box(0.06, 0.48, 0.06, 0, 0.23, 0, metal, chair);
  box(0.7, 0.04, 0.06, 0, 0.04, 0, metal, chair);
  box(0.06, 0.04, 0.6, 0, 0.04, 0, metal, chair);
  const couch = new THREE.Group();
  couch.position.set(-2.25, 0, -0.9);
  scene.add(couch);
  cushion(2.05, 0.28, 0.88, 0, 0.29, 0, fabric, couch);
  cushion(1.7, 0.14, 0.72, 0, 0.49, 0.04, fabric, couch);
  cushion(2.05, 0.82, 0.18, 0, 0.68, -0.43, fabric, couch);
  for (const x of [-0.56, 0, 0.56])
    cushion(0.55, 0.6, 0.22, x, 0.77, -0.31, fabric, couch);
  for (const x of [-0.99, 0.99]) {
    cushion(0.19, 0.55, 0.9, x, 0.49, 0, fabric, couch);
    box(0.09, 0.13, 0.7, x, 0.07, 0, metal, couch);
  }
  box(2.6, 0.002, 1.8, -2.25, 0.001, -0.55, material(0x332b3b));
  for (const x of [-2.2, 2]) {
    const shade = new THREE.Mesh(
      new THREE.ConeGeometry(0.4, 0.2, 32, 1, true),
      metal,
    );
    shade.position.set(x, 3.15, -0.8);
    scene.add(shade);
    box(0.025, 0.65, 0.025, x, 3.55, -0.8, metal);
    round(0.64, 0.025, 0.64, x, 3.055, -0.8, amber).castShadow = false;
    const light = new THREE.PointLight(0xffbe82, 14, 8, 2);
    light.position.set(x, 2.9, -0.8);
    scene.add(light);
  }
  box(0.4, 0.4, 0.4, -4, 0.2, -1.9, metal);
  for (let i = 0; i < 7; i++) {
    const leaf = round(
      0.15,
      0.75,
      0.07,
      -4 + Math.sin(i) * 0.22,
      0.7 + (i % 3) * 0.15,
      -1.9 + Math.cos(i) * 0.15,
      material(0x3a6552),
    );
    leaf.rotation.z = Math.sin(i) * 0.6;
  }
  scene.add(new THREE.HemisphereLight(0xb8d5ee, 0x645060, 1.2));
  const key = new THREE.DirectionalLight(0xffddc0, 2.3);
  key.position.set(1, 6, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -6, right: 6, top: 5, bottom: -5 });
  key.shadow.bias = -0.0005;
  key.shadow.radius = 4;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x73d3d8, 2.1);
  rim.position.set(-4, 3, -3);
  scene.add(rim);
  function render(actor) {
    const w = canvas.clientWidth,
      h = canvas.clientHeight,
      half = mode === "room" ? Math.max(2.8, 4.6 / (w / h)) : 1.2;
    if (
      canvas.width !== Math.floor(w * renderer.getPixelRatio()) ||
      canvas.height !== Math.floor(h * renderer.getPixelRatio())
    )
      renderer.setSize(w, h, false);
    camera.left = (-half * w) / h;
    camera.right = (half * w) / h;
    camera.top = half;
    camera.bottom = -half;
    camera.updateProjectionMatrix();
    if (mode === "room") {
      camera.position.set(3.6, 3.6, 9.5);
      camera.lookAt(0, 0.9, -0.2);
    } else {
      camera.position.set(actor.position.x + 2.8, 2.35, actor.position.z + 4.4);
      camera.lookAt(actor.position.x, 1.03, actor.position.z);
    }
    renderer.render(scene, camera);
  }
  return {
    scene,
    renderer,
    camera,
    render,
    setCamera(value) {
      mode = value;
    },
  };
}
