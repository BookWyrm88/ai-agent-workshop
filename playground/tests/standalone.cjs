const { chromium } = require("playwright"),
  path = require("node:path"),
  { pathToFileURL } = require("node:url"),
  assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    executablePath:
      process.env.CHROME_PATH ||
      path.join(
        process.env.ProgramFiles,
        "Google/Chrome/Application/chrome.exe",
      ),
    headless: true,
  });
  try {
    const page = await browser.newPage({
        viewport: { width: 1440, height: 1000 },
        reducedMotion: "reduce",
      }),
      errors = [],
      requests = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("requestfailed", (r) => errors.push("Request failed: " + r.url()));
    page.on("request", (r) => {
      if (/^https?:/.test(r.url())) requests.push(r.url());
    });
    await page.goto(
      pathToFileURL(
        path.join(
          __dirname,
          "../release/Moss Animation Playground - 0.1.0.html",
        ),
      ).href,
    );
    await page.waitForFunction(() => window.mossPlayground);
    assert.equal(
      await page.evaluate(
        () => getComputedStyle(document.documentElement).backgroundColor,
      ),
      "rgb(17, 16, 21)",
    );
    assert(await page.locator("#reduced").isChecked());
    const t = await page.evaluate(() => mossPlayground.snapshot().time);
    await page.waitForTimeout(1600);
    assert(
      (await page.evaluate(() => mossPlayground.snapshot().time)) > t + 0.5,
    );
    await page.click("#lounge");
    await page.waitForFunction(
      () => mossPlayground.snapshot().state === "StandingUp",
    );
    await page.evaluate(() => {
      mossPlayground.pause();
      mossPlayground.advance(25);
    });
    assert.equal(
      await page.evaluate(() => mossPlayground.snapshot().state),
      "SeatedResting",
    );
    await page.click("#desk");
    await page.evaluate(() => mossPlayground.advance(25));
    assert.equal(
      await page.evaluate(() => mossPlayground.snapshot().state),
      "SeatedWorking",
    );
    assert.deepEqual(requests, []);
    assert.deepEqual(errors, []);
    console.log(
      JSON.stringify(
        {
          passed: true,
          browser: browser.version(),
          directFileLaunch: true,
          realTimePlayback: true,
          roundTrip: true,
          reducedMotionPreference: true,
          externalRequests: 0,
          pageErrors: 0,
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
