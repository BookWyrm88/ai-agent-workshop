const { chromium } = require("playwright"),
  { makeHTML } = require("../build.cjs"),
  path = require("node:path"),
  fs = require("node:fs");
async function open() {
  const html = await makeHTML();
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
      deviceScaleFactor: 1,
    });
    await page.route("**/*", (route) =>
      route.request().url() === "https://moss.test/"
        ? route.fulfill({ contentType: "text/html", body: html })
        : route.abort(),
    );
    page.on("pageerror", (e) => console.error("PAGE ERROR", e.message));
    await page.goto("https://moss.test/");
    await page.waitForFunction(() => window.mossPlayground);
    await page.evaluate(() => {
      mossPlayground.reset();
      mossPlayground.pause();
    });
    return { browser, page };
  } catch (error) {
    await browser.close();
    throw error;
  }
}
module.exports = { open };
if (require.main === module)
  (async () => {
    const { browser, page } = await open();
    fs.mkdirSync(path.join(__dirname, "../evidence"), { recursive: true });
    await page.evaluate(() => mossPlayground.advance(1));
    await page.screenshot({
      path: path.join(__dirname, "../evidence/01-workstation.png"),
    });
    await page.selectOption("#camera", "character");
    await page.screenshot({
      path: path.join(__dirname, "../evidence/02-face.png"),
    });
    console.log(await page.evaluate(() => mossPlayground.inspect()));
    await browser.close();
  })().catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });
