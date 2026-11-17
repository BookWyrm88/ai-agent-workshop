/* Real Chromium, isolated temporary profile; synthetic assignments only. */
const { chromium } = require("../playground/node_modules/playwright"),
  path = require("node:path"),
  fs = require("node:fs"),
  assert = require("node:assert/strict"),
  { pathToFileURL } = require("node:url");
const root = path.resolve(__dirname, ".."),
  url = pathToFileURL(path.join(root, "docs/index.html")).href,
  dir = path.join(root, "review", "robot-hq");
(async () => {
  fs.mkdirSync(dir, { recursive: true });
  const b = await chromium.launch({ channel: "chrome" });
  try {
    const p = await b.newPage({ viewport: { width: 1440, height: 1000 } }),
      errors = [],
      external = [];
    p.on("pageerror", (e) => errors.push(e.message));
    p.on("request", (r) => {
      if (/^https?:/.test(r.url())) external.push(r.url());
    });
    await p.goto(url);
    const state = () =>
        p.evaluate(() =>
          JSON.parse(localStorage.getItem("ai-agent-workshop.v1")),
        ),
      q = (x) => p.locator(x),
      click = (x) => q(x).first().click(),
      shot = async (name) => {
        await q(".floor-dispatch").scrollIntoViewIfNeeded();
        await q(".room-world").screenshot({
          path: path.join(dir, name + ".png"),
          animations: "allow",
        });
      };
    const a = (await state()).agents;
    assert.deepEqual(
      a.map((x) => x.name),
      ["Moss", "Herman", "Elmyra"],
    );
    const [m, h, e] = a.map((x) => x.id);
    const pod = (id) =>
        '.robot-pod:has(.robot-hit[data-select-agent="' + id + '"])',
      pose = (id, name) =>
        p.waitForSelector(pod(id) + '[data-pose="' + name + '"] .robot-hit');
    await p.screenshot({ path: path.join(dir, "01-headquarters.png") });
    await p.evaluate(() => {
      window.originalFloor = document.querySelector("#floor-mount");
      window.originalMoss = document.querySelector(".robot-hit svg");
    });
    await click('[data-floor="sample"]');
    await click(pod(h) + " .robot-hit");
    await click('[data-floor="sample"]');
    await pose(m, "working");
    await pose(h, "working");
    await p.waitForTimeout(1550);
    await shot("02-concurrent-work");
    assert(
      await p.evaluate(
        () =>
          originalFloor === document.querySelector("#floor-mount") &&
          originalMoss === document.querySelector(".robot-hit svg"),
      ),
    );
    const arm = () =>
      q(pod(m) + " .rb-arm")
        .first()
        .evaluate((el) => getComputedStyle(el).transform);
    const before = await arm();
    await p.waitForTimeout(120);
    assert.notEqual(await arm(), before);
    await click(pod(e) + " .robot-hit");
    await click('[data-floor="move"]');
    await pose(e, "walking");
    await p.waitForTimeout(1000);
    await shot("03-moving");
    await pose(e, "resting");
    await shot("04-lounge");
    await click('[data-floor="move"]');
    await p.waitForSelector(pod(e) + '[data-desk="true"] .robot-hit');
    await click('[data-floor="move"]');
    await pose(e, "resting");
    await click('[data-floor="move"]');
    await p.waitForSelector(pod(e) + '[data-desk="true"] .robot-hit');
    await click('[data-view="queue"]');
    await q("#approval-required").check();
    await click('[data-view="workshop"]');
    await click('[data-floor="sample"]');
    await p.waitForSelector(pod(e) + ' [data-kind="attention"]');
    await shot("05-approval");
    await click('[data-floor="inspect"]');
    assert(await q(".approval-gate").isVisible());
    await click('[data-view="workshop"]');
    await q('#workflow-form [name="sender"]').selectOption(m);
    await q('#workflow-form [name="recipient"]').selectOption(h);
    await click('#workflow-form button[type="submit"],#workflow-form .primary');
    await p.waitForSelector(".floor-packet", { timeout: 20000 });
    await p.waitForTimeout(550);
    await shot("06-handoff");
    assert.match(await q(pod(h) + " .robot-bubble").innerText(), /From Moss/);
    await click("[data-packet]");
    assert.match(
      await q(".handoff-inspector").innerText(),
      /Moss sent the completed research output to Herman/,
    );
    await p.waitForFunction(
      () =>
        JSON.parse(localStorage.getItem("ai-agent-workshop.v1")).handoffs[0]
          ?.status === "processed",
    );
    const snapshot = await state(),
      msg = snapshot.handoffs[0];
    assert.equal(
      msg.payload.output,
      snapshot.runs
        .find((r) => r.id === msg.senderRunId)
        .events.find((ev) => ev.type === "task.completed").data.output,
    );
    await p.reload();
    assert.equal((await state()).handoffs[0].id, msg.id);
    await click('[data-view="workshop"]');
    await p.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(
      await q(".rb-eyes")
        .first()
        .evaluate((el) => getComputedStyle(el).animationName),
      "none",
    );
    await p.setViewportSize({ width: 390, height: 844 });
    await p.screenshot({ path: path.join(dir, "07-mobile.png") });
    assert(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      "No horizontal page overflow",
    );
    assert.deepEqual(errors, []);
    assert.deepEqual(external, []);
    console.log(
      "PASS: real Chrome scene and SVG identity, distinct actors, simultaneous typing, animated limbs, two lounge round trips, approval, recorded handoff/inspector, reload, reduced motion, mobile bounds, no external requests.",
    );
  } finally {
    await b.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
