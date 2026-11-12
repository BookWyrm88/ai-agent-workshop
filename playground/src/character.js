import * as THREE from "three";
import { WALK_SPEED, WALK_CYCLE } from "./motion.js";
const clamp = THREE.MathUtils.clamp;
// Connected joint hierarchy. Fixed-length limbs are solved to foot targets; never scaled to sit.
export function createMoss() {
  const root = new THREE.Group();
  root.name = "Moss";
  const mats = {
    skin: new THREE.MeshStandardMaterial({ color: 0xc38e6e, roughness: 0.65 }),
    jacket: new THREE.MeshStandardMaterial({ color: 0x222832, roughness: 0.8 }),
    panel: new THREE.MeshStandardMaterial({ color: 0x3b4550, roughness: 0.72 }),
    shirt: new THREE.MeshStandardMaterial({ color: 0x10171c }),
    pants: new THREE.MeshStandardMaterial({ color: 0x242833, roughness: 0.8 }),
    boot: new THREE.MeshStandardMaterial({ color: 0x10151b, roughness: 0.6 }),
    hair: new THREE.MeshStandardMaterial({ color: 0x171a22, roughness: 0.82 }),
    accent: new THREE.MeshStandardMaterial({
      color: 0x69cbb2,
      emissive: 0x173e34,
      roughness: 0.4,
    }),
    eye: new THREE.MeshStandardMaterial({ color: 0xf7ebe0, roughness: 0.4 }),
    iris: new THREE.MeshStandardMaterial({ color: 0x497f73, roughness: 0.4 }),
    pupil: new THREE.MeshBasicMaterial({ color: 0x10171e }),
    glint: new THREE.MeshBasicMaterial({ color: 0xffffff }),
  };
  function mesh(
    geometry,
    material,
    parent,
    position = [0, 0, 0],
    scale = [1, 1, 1],
  ) {
    const m = new THREE.Mesh(geometry, material);
    m.position.set(...position);
    m.scale.set(...scale);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  const ell = (parent, mat, p, s) =>
    mesh(new THREE.SphereGeometry(1, 24, 16), mat, parent, p, s);
  const box = (parent, mat, p, s) =>
    mesh(new THREE.BoxGeometry(...s), mat, parent, p);
  function bone(parent, name, p) {
    const b = new THREE.Group();
    b.name = name;
    b.position.set(...p);
    parent.add(b);
    return b;
  }
  function limb(parent, len, r1, r2, mat) {
    mesh(new THREE.CylinderGeometry(r1, r2, len, 12), mat, parent, [
      0,
      -len / 2,
      0,
    ]);
    ell(parent, mat, [0, 0, 0], [r1, r1, r1]);
  }
  const hips = bone(root, "pelvis", [0, 0.9, 0]);
  ell(hips, mats.pants, [0, -0.005, 0], [0.205, 0.1, 0.135]);
  const torso = bone(hips, "spine", [0, 0.05, 0]);
  // Closed torso surface, fitted collar and attached shoulder caps.
  mesh(
    new THREE.CylinderGeometry(0.235, 0.18, 0.44, 12),
    mats.jacket,
    torso,
    [0, 0.22, 0],
    [1, 1, 0.65],
  );
  box(torso, mats.shirt, [0, 0.255, 0.139], [0.16, 0.34, 0.025]);
  for (const side of [-1, 1]) {
    const lapel = box(
      torso,
      mats.panel,
      [side * 0.112, 0.32, 0.147],
      [0.07, 0.23, 0.026],
    );
    lapel.rotation.z = side * -0.22;
    box(torso, mats.accent, [side * 0.17, 0.19, 0.121], [0.012, 0.15, 0.015]);
  }
  mesh(
    new THREE.CylinderGeometry(0.084, 0.1, 0.065, 18),
    mats.jacket,
    torso,
    [0, 0.465, 0],
    [1, 1, 0.85],
  );
  box(torso, mats.accent, [-0.13, 0.31, 0.176], [0.045, 0.027, 0.012]);
  box(torso, mats.boot, [0, -0.015, 0.13], [0.36, 0.035, 0.015]);
  box(torso, mats.panel, [0, -0.015, 0.147], [0.045, 0.04, 0.018]);
  const neck = bone(torso, "neck", [0, 0.48, 0]);
  mesh(
    new THREE.CylinderGeometry(0.065, 0.075, 0.12, 16),
    mats.skin,
    neck,
    [0, 0.045, 0],
  );
  const head = bone(neck, "head", [0, 0.17, 0.006]);
  // Slightly angular jaw and small eyes; about seven heads tall including hair.
  const jawPoints = [
    [0.02, -0.13],
    [0.065, -0.12],
    [0.105, -0.085],
    [0.126, -0.02],
    [0.132, 0.07],
    [0.11, 0.14],
    [0.05, 0.17],
    [0.001, 0.175],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  mesh(
    new THREE.LatheGeometry(jawPoints, 28),
    mats.skin,
    head,
    [0, 0, 0],
    [1, 1, 0.83],
  );
  for (const side of [-1, 1])
    ell(head, mats.skin, [side * 0.126, -0.015, 0], [0.025, 0.043, 0.026]);
  ell(head, mats.skin, [0, -0.025, 0.106], [0.018, 0.036, 0.026]);
  const mouth = box(
    head,
    new THREE.MeshStandardMaterial({ color: 0x774b46 }),
    [0, -0.081, 0.09],
    [0.048, 0.006, 0.006],
  );
  const eyes = [];
  for (const side of [-1, 1]) {
    const eye = bone(head, "eye" + side, [side * 0.057, 0.023, 0.103]);
    eye.rotation.y = side * 0.2;
    ell(eye, mats.eye, [0, 0, 0], [0.037, 0.014, 0.009]);
    ell(eye, mats.iris, [side * -0.004, -0.001, 0.008], [0.014, 0.012, 0.003]);
    ell(eye, mats.pupil, [side * -0.004, -0.001, 0.011], [0.006, 0.009, 0.002]);
    ell(eye, mats.glint, [-0.005, 0.004, 0.013], [0.0025, 0.0025, 0.001]);
    const brow = box(
      head,
      mats.hair,
      [side * 0.058, 0.063, 0.106],
      [0.071, 0.011, 0.015],
    );
    brow.rotation.z = side * -0.1;
    eyes.push(eye);
  }
  // Hair cap plus swept overlapping locks, attached to the skull.
  mesh(
    new THREE.SphereGeometry(1, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.42),
    mats.hair,
    head,
    [0, 0.035, -0.005],
    [0.145, 0.16, 0.125],
  );
  mesh(
    new THREE.SphereGeometry(1, 24, 16, Math.PI, Math.PI, 0, Math.PI * 0.7),
    mats.hair,
    head,
    [0, 0.035, -0.005],
    [0.145, 0.16, 0.125],
  );
  // Swept, tapered locks leave the brows and pupils visible instead of a curtain of cylinders.
  for (let i = 0; i < 7; i++) {
    const x = -0.12 + i * 0.035,
      curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(x, 0.16, 0.02),
        new THREE.Vector3(x + 0.025, 0.17, 0.145),
        new THREE.Vector3(x + 0.035, 0.073 - (i === 6 ? 0.05 : 0), 0.117),
      );
    const vertices = [];
    for (let j = 0; j < 6; j++) {
      const t = j / 5,
        p = curve.getPoint(t),
        w = 0.032 * (1 - t) + 0.001;
      vertices.push(
        p.x - w,
        p.y,
        p.z,
        p.x,
        p.y + 0.007,
        p.z + 0.014,
        p.x + w,
        p.y,
        p.z,
      );
    }
    const indices = [];
    for (let j = 0; j < 5; j++)
      for (let k = 0; k < 2; k++) {
        const a = j * 3 + k;
        indices.push(a, a + 3, a + 1, a + 1, a + 3, a + 4);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    g.setIndex(indices);
    g.computeVertexNormals();
    const mat = mats.hair.clone();
    mat.side = THREE.DoubleSide;
    mesh(g, mat, head);
  }
  for (const side of [-1, 1]) {
    const lock = ell(
      head,
      mats.hair,
      [side * 0.125, 0.018, -0.015],
      [0.023, 0.087, 0.07],
    );
    lock.rotation.z = side * -0.12;
  }
  // Headset pads sit on the ears, with a connected boom.
  for (const side of [-1, 1]) {
    ell(head, mats.boot, [side * 0.15, -0.01, -0.005], [0.027, 0.045, 0.038]);
    ell(
      head,
      mats.accent,
      [side * 0.173, -0.01, -0.005],
      [0.005, 0.026, 0.022],
    );
  }
  const boom = mesh(
    new THREE.CylinderGeometry(0.005, 0.005, 0.11, 6),
    mats.panel,
    head,
    [-0.13, -0.055, 0.045],
  );
  boom.rotation.x = -0.9;
  ell(head, mats.boot, [-0.13, -0.09, 0.09], [0.012, 0.012, 0.02]);
  const arms = [];
  for (const side of [-1, 1]) {
    const shoulder = bone(torso, "shoulder" + side, [side * 0.235, 0.39, 0]);
    limb(shoulder, 0.28, 0.085, 0.062, mats.jacket);
    const elbow = bone(shoulder, "elbow" + side, [0, -0.28, 0]);
    limb(elbow, 0.27, 0.065, 0.043, mats.panel);
    box(elbow, mats.accent, [side * 0.045, -0.12, 0], [0.012, 0.14, 0.02]);
    const hand = bone(elbow, "wrist" + side, [0, -0.29, 0]);
    ell(hand, mats.skin, [0, -0.035, 0.012], [0.045, 0.068, 0.035]);
    for (let i = 0; i < 4; i++)
      ell(
        hand,
        mats.skin,
        [(i - 1.5) * 0.018, -0.085, 0.02],
        [0.009, 0.028, 0.013],
      );
    arms.push({ side, shoulder, elbow, hand });
  }
  const legs = [];
  for (const side of [-1, 1]) {
    const hip = bone(hips, "hip" + side, [side * 0.115, 0, 0]);
    limb(hip, 0.44, 0.105, 0.075, mats.pants);
    const knee = bone(hip, "knee" + side, [0, -0.44, 0]);
    limb(knee, 0.44, 0.077, 0.052, mats.pants);
    const ankle = bone(knee, "ankle" + side, [0, -0.44, 0]);
    ell(ankle, mats.boot, [0, -0.035, 0.063], [0.075, 0.07, 0.145]);
    box(ankle, mats.panel, [0, -0.083, 0.065], [0.15, 0.018, 0.26]);
    legs.push({ side, hip, knee, ankle });
  }
  function solveLeg(leg, y, z) {
    const len = 0.44,
      d = clamp(Math.hypot(y, z), 0.03, 0.879),
      base = Math.atan2(z, -y),
      a = Math.acos(clamp(d / (2 * len), -1, 1)),
      thigh = base + a,
      knee = 2 * a;
    leg.hip.rotation.x = -thigh;
    leg.knee.rotation.x = knee;
    leg.ankle.rotation.x = thigh - knee;
  }
  let lastState = "";
  const planted = [null, null];
  function update(s, reduced = false) {
    root.position.set(s.position.x, 0, s.position.z);
    root.rotation.y = s.yaw;
    const walking = ["Walking", "ReturningToWork"].includes(s.state),
      t = s.time,
      phase = s.gait;
    hips.position.y = walking
      ? 0.943 - 0.015 * Math.cos(phase * 2)
      : 0.96 - 0.3 * s.sit + (reduced ? 0 : Math.sin(t * 1.6) * 0.003);
    torso.rotation.x = s.lean + (walking ? 0.04 : 0);
    torso.rotation.z = walking ? Math.sin(phase) * 0.025 : 0;
    head.rotation.y = reduced
      ? 0
      : s.state === "SeatedResting"
        ? Math.sin(t * 0.47) * 0.12
        : Math.sin(t * 0.6) * 0.025;
    head.rotation.x = s.state === "SeatedWorking" ? 0.1 : 0;
    // Different blink periods avoid synchronizing to the gait or task state.
    const blink = t % 4.7 < 0.13 || (t % 11.3 > 9.7 && t % 11.3 < 9.82);
    eyes.forEach((e) => (e.scale.y = blink && !reduced ? 0.08 : 1));
    if (s.state !== lastState) {
      planted.fill(null);
      lastState = s.state;
    }
    for (let i = 0; i < 2; i++) {
      const leg = legs[i],
        p =
          (((phase + (i ? Math.PI : 0)) % (Math.PI * 2)) + Math.PI * 2) %
          (Math.PI * 2),
        cycle = p / (Math.PI * 2);
      let z = 0.08 + 0.4 * s.sit,
        y = 0.09;
      if (walking) {
        // Stance feet remain fixed in world space; the swing foot clears the floor.
        const stride = (WALK_SPEED * WALK_CYCLE) / 2;
        if (cycle < 0.5) {
          if (!planted[i]) {
            const f = 0.08 + stride / 2 - stride * cycle * 2;
            planted[i] = {
              x: s.position.x + Math.sin(s.yaw) * f,
              z: s.position.z + Math.cos(s.yaw) * f,
            };
          }
          z =
            (planted[i].x - s.position.x) * Math.sin(s.yaw) +
            (planted[i].z - s.position.z) * Math.cos(s.yaw);
        } else {
          planted[i] = null;
          const u = (cycle - 0.5) * 2;
          z = 0.08 - stride / 2 + stride * u;
          y += Math.sin(u * Math.PI) * 0.12;
        }
      }
      if (s.state === "Turning")
        y +=
          Math.max(0, Math.sin(s.progress * Math.PI * 4 + i * Math.PI)) * 0.035;
      solveLeg(leg, y - hips.position.y, z);
    }
    for (const a of arms) {
      const swing = walking
        ? Math.sin(phase + (a.side > 0 ? Math.PI : 0)) * 0.33
        : 0;
      const resting = s.sit * (1 - s.arm);
      a.shoulder.rotation.set(
        -0.15 - 0.67 * s.arm - 0.15 * resting + swing,
        0,
        a.side * (0.08 + 0.08 * s.sit),
      );
      a.elbow.rotation.x = -0.16 - 0.82 * s.arm - 0.65 * resting;
      a.hand.rotation.x = s.arm * 0.35;
      if (s.state === "SeatedWorking" && !reduced) {
        a.elbow.rotation.x += Math.sin(t * 11 + a.side) * 0.035;
        a.hand.rotation.x += Math.sin(t * 13 + a.side) * 0.06;
      }
      // An occasional resting gesture, not a continuous synchronized motion loop.
      const restPhase = t % 19;
      if (
        s.state === "SeatedResting" &&
        restPhase > 12 &&
        restPhase < 15 &&
        !reduced &&
        a.side === -1
      ) {
        const gesture = Math.sin(((restPhase - 12) / 3) * Math.PI);
        a.shoulder.rotation.x -= gesture * 1.1;
        a.elbow.rotation.x -= gesture * 1.7;
      }
    }
  }
  return { root, update, head, hips, legs, arms, eyes };
}
