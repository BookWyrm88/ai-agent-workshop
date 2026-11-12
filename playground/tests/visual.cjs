const { open } = require("./preview.cjs"),
  fs = require("node:fs"),
  path = require("node:path"),
  assert = require("node:assert/strict");
const dir = path.join(__dirname, "../evidence");
(async () => {
  fs.mkdirSync(dir, { recursive: true });
  const { browser, page } = await open();
  try {
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const shot = async (name) =>
      page.screenshot({ path: path.join(dir, name + ".png") });
    const step = async (seconds) =>
      page.evaluate((s) => mossPlayground.advance(s), seconds);
    const state = () => page.evaluate(() => mossPlayground.snapshot());
    await step(1);
    await shot("01-workstation");
    await page.selectOption("#camera", "character");
    await shot("02-face");
    await page.click("#lounge");
    assert.equal((await state()).destination, "lounge");
    assert(await page.locator("#desk").isDisabled());
    assert.equal(await page.evaluate(() => mossPlayground.move("desk")), false);
    await step(1.3);
    await shot("03-rising");
    await step(1.1);
    await shot("04-standing");
    await page.selectOption("#camera", "room");
    await step(4);
    await shot("05-walking");
    await page.selectOption("#camera", "character");
    await step(3);
    await shot("06-approaching");
    for (let n = 0; n < 1200 && (await state()).state !== "SittingDown"; n++)
      await step(1 / 60);
    assert.equal((await state()).state, "SittingDown");
    await step(0.9);
    await shot("07-sitting");
    await step(2);
    assert.equal((await state()).state, "SeatedResting");
    await shot("08-resting");
    const rest = await state();
    assert.equal(rest.space.locations["moss-playground"].zoneId, "lounge");
    assert.equal(rest.space.locations["moss-playground"].move, null);
    await step(60);
    assert.equal((await state()).state, "SeatedResting");
    await page.click("#desk");
    await step(4);
    await shot("09-returning");
    await step(25);
    assert.equal((await state()).state, "SeatedWorking");
    await shot("10-resumed");
    for (let i = 0; i < 3; i++) {
      await page.click("#lounge");
      await step(25);
      assert.equal((await state()).state, "SeatedResting");
      await page.click("#desk");
      await step(25);
      assert.equal((await state()).state, "SeatedWorking");
    }
    await page.click("#demo");
    await step(10);
    await page.click("#reset");
    assert.equal((await state()).state, "SeatedWorking");
    assert.equal((await state()).space.events.length, 0);
    await page.check("#reduced");
    await page.click("#demo");
    await step(40);
    assert.equal((await state()).state, "SeatedWorking");
    const joints = await page.evaluate(() => mossPlayground.inspect());
    assert(joints.limbLengths.flat().every((n) => n === 0.44));
    assert(joints.feet.every((p) => p[1] > 0.07 && p[1] < 0.11));
    assert.equal(await page.evaluate(() => localStorage.length), 0);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.selectOption("#camera", "room");
    await shot("11-mobile");
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    assert.deepEqual(errors, []);
    console.log(
      JSON.stringify(
        {
          passed: true,
          roundTrips: 5,
          restSeconds: 60,
          resetDuringWalk: true,
          reducedMotion: true,
          noStorageWrites: true,
          joints,
        },
        null,
        2,
      ),
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
