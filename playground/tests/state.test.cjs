const assert = require("node:assert/strict");
(async () => {
  const { MotionController, SEATS } = await import("../src/motion.js"),
    { createMoss } = await import("../src/character.js"),
    THREE = await import("three");
  let events = [];
  const motion = new MotionController((s) => events.push(s.state)),
    moss = createMoss();
  assert.equal(motion.move("invalid"), false);
  assert.equal(motion.move("desk"), false);
  assert(motion.move("lounge"));
  assert.equal(motion.move("desk"), false);
  let previous = null,
    stanceSamples = 0,
    maxDrift = 0,
    minFoot = Infinity;
  function tick(seconds) {
    for (let t = 0; t < seconds; t += 1 / 120) {
      motion.update(1 / 120);
      const s = motion.snapshot();
      moss.update(s);
      moss.root.updateMatrixWorld(true);
      const feet = moss.legs.map((l) =>
        l.ankle.getWorldPosition(new THREE.Vector3()),
      );
      if (s.state === "Walking" || s.state === "ReturningToWork") {
        for (let i = 0; i < 2; i++) {
          minFoot = Math.min(minFoot, feet[i].y);
          const phase =
            ((s.gait + (i ? Math.PI : 0)) % (2 * Math.PI)) / (2 * Math.PI);
          if (
            previous &&
            previous.state === s.state &&
            previous.yaw === s.yaw &&
            phase < 0.5 &&
            previous.phases[i] < 0.5
          ) {
            const drift = feet[i].distanceTo(previous.feet[i]);
            maxDrift = Math.max(maxDrift, drift);
            stanceSamples++;
          }
        }
      }
      previous = {
        state: s.state,
        yaw: s.yaw,
        feet,
        phases: [0, 1].map(
          (i) => ((s.gait + i * Math.PI) % (2 * Math.PI)) / (2 * Math.PI),
        ),
      };
    }
  }
  tick(25);
  assert.equal(motion.state, "SeatedResting");
  assert.deepEqual(motion.position, { x: SEATS.lounge.x, z: SEATS.lounge.z });
  assert(
    events.includes("StandingUp") &&
      events.includes("SittingDown") &&
      events.includes("Turning"),
  );
  tick(120);
  assert.equal(motion.state, "SeatedResting");
  for (let i = 0; i < 10; i++) {
    assert(motion.move("desk"));
    tick(25);
    assert.equal(motion.state, "SeatedWorking");
    assert(motion.move("lounge"));
    tick(25);
    assert.equal(motion.state, "SeatedResting");
  }
  motion.move("desk");
  tick(5);
  motion.reset();
  assert.equal(motion.state, "SeatedWorking");
  assert(!motion.busy);
  assert.equal(motion.destination, null);
  const before = motion.snapshot();
  motion.update(NaN);
  motion.update(-1);
  assert.deepEqual(motion.snapshot(), before);
  assert(stanceSamples > 100);
  assert(maxDrift < 0.003, `Planted foot drift ${maxDrift}`);
  assert(minFoot >= 0.089, `Foot penetration ${minFoot}`);
  console.log(
    JSON.stringify(
      {
        passed: true,
        roundTrips: 10,
        restSeconds: 120,
        stanceSamples,
        maxDriftMeters: maxDrift,
        minimumAnkleHeight: minFoot,
      },
      null,
      2,
    ),
  );
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
