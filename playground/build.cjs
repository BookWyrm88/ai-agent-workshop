const fs = require("node:fs"),
  path = require("node:path"),
  esbuild = require("esbuild");
async function makeHTML() {
  const root = __dirname;
  const result = await esbuild.build({
    entryPoints: [path.join(root, "src/main.js")],
    bundle: true,
    write: false,
    format: "iife",
    minify: true,
    legalComments: "inline",
  });
  const script = (text) =>
    "<script>" + text.replace(/<\/script/gi, "<\\/script") + "</script>";
  return fs
    .readFileSync(path.join(root, "index.html"), "utf8")
    .replace(
      /<link\s+rel="stylesheet"\s+href="style.css"\s*\/?>/,
      () =>
        "<style>" +
        fs.readFileSync(path.join(root, "style.css"), "utf8") +
        "</style>",
    )
    .replace('<script src="/workshop/spatial.js"></script>', () =>
      script(fs.readFileSync(path.join(root, "../dist/spatial.js"), "utf8")),
    )
    .replace('<script src="app.bundle.js"></script>', () =>
      script(result.outputFiles[0].text),
    );
}
module.exports = { makeHTML };
if (require.main === module)
  makeHTML()
    .then((html) => {
      const dir = path.join(__dirname, "release");
      fs.mkdirSync(dir, { recursive: true });
      const notice = fs.readFileSync(
        path.join(__dirname, "THIRD_PARTY_NOTICES.txt"),
        "utf8",
      );
      fs.writeFileSync(
        path.join(dir, "Moss Animation Playground - 0.1.0.html"),
        "<!-- Third-party notices\n" + notice + "\n-->\n" + html,
      );
      console.log(
        "Built standalone prototype: release/Moss Animation Playground - 0.1.0.html",
      );
    })
    .catch((e) => {
      console.error(e);
      process.exitCode = 1;
    });
