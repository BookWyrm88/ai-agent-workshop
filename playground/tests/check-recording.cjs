const { chromium } = require("playwright"),
  fs = require("node:fs"),
  path = require("node:path");
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
      viewport: { width: 1200, height: 1000 },
    });
    await page.setContent(
      '<body style="background:#111;color:#eee;font:16px sans-serif;margin:0"><canvas id="sheet" width="1200" height="1000"></canvas><video id="v" muted style="display:none"></video></body>',
    );
    const metadata = await page.evaluate(
      async (data) => {
        const v = document.getElementById("v");
        v.src = "data:video/webm;base64," + data;
        await new Promise((resolve, reject) => {
          v.onloadeddata = resolve;
          v.onerror = reject;
        });
        const ctx = document.getElementById("sheet").getContext("2d");
        const times = [0.4, 2.5, 7, 13, 18, 23, 29, 36, 47];
        for (let i = 0; i < times.length; i++) {
          await new Promise((resolve) => {
            v.onseeked = resolve;
            v.currentTime = times[i];
          });
          ctx.drawImage(v, (i % 3) * 400, Math.floor(i / 3) * 330, 400, 238);
          ctx.fillStyle = "#a1dbc7";
          ctx.fillText(
            "Recorded frame • " + times[i] + " s",
            (i % 3) * 400 + 12,
            Math.floor(i / 3) * 330 + 260,
          );
        }
        return {
          duration: v.duration,
          width: v.videoWidth,
          height: v.videoHeight,
        };
      },
      fs
        .readFileSync(path.join(__dirname, "../evidence/full-sequence.webm"))
        .toString("base64"),
    );
    await page.screenshot({
      path: path.join(__dirname, "../evidence/12-recording-contact-sheet.png"),
    });
    console.log(metadata);
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
