const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");
const { createServer } = require("../scripts/serve.cjs");
const { chromium } = require(process.env.NUDGESVG_PLAYWRIGHT || "playwright");
const core = require("../app/core.js");
const root = path.resolve(__dirname, "..");
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const output = path.join(root, "artifacts", "browser-" + stamp);
const shots = process.env.NUDGESVG_SCREENSHOTS || output;
const source =
  '\ufeff<?xml version="1.0" encoding="UTF-8"?>\r\n' +
  '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="400" viewBox="0 0 500 400">\r\n' +
  "<!-- Keep this exact comment and the original quotes. -->\r\n" +
  "<g id=\"rotated\" transform='translate(200 150) rotate(35) scale(1.4 .8)'>\r\n" +
  '<text id="label" x="0" y="0" font-size="24">Café &amp; garden</text>\r\n' +
  '<path id="line" d="M0 20 L100 20" stroke="#173048" />\r\n' +
  "</g>\r\n</svg>\r\n";
const digest = (bytes) =>
  crypto.createHash("sha256").update(bytes).digest("hex");

async function main() {
  await fs.mkdir(output, { recursive: true });
  await fs.mkdir(shots, { recursive: true });
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const origin = "http://127.0.0.1:" + server.address().port;
  const browser = await chromium.launch({
    channel: process.env.BROWSER_CHANNEL || "chrome",
    headless: true,
  });
  const failures = [],
    requests = [],
    checks = [];
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1100 },
      acceptDownloads: true,
    });
    context.on("request", (request) => {
      if (
        /^https?:/.test(request.url()) &&
        !request.url().startsWith(origin + "/")
      )
        requests.push(request.url());
    });
    const page = await context.newPage();
    page.on("pageerror", (error) => failures.push(error.message));
    page.on("dialog", (dialog) => dialog.accept());
    async function download(id) {
      const event = page.waitForEvent("download");
      await page.locator(id).click();
      const item = await event;
      assert.equal(await item.failure(), null);
      return {
        bytes: await fs.readFile(await item.path()),
        name: item.suggestedFilename(),
      };
    }
    const drawing = () => page.frameLocator("#preview");
    async function point() {
      return drawing()
        .locator("#label")
        .evaluate((el) => {
          const m = el.ownerSVGElement
            .getScreenCTM()
            .inverse()
            .multiply(el.getScreenCTM());
          const p = new DOMPoint(0, 0).matrixTransform(m);
          return { x: p.x, y: p.y };
        });
    }
    function close(a, b, epsilon = 0.0001) {
      assert.ok(Math.abs(a - b) < epsilon, `${a} != ${b}`);
    }
    await page.goto(origin);
    await page.locator("#elementList button").first().waitFor();
    await page.screenshot({
      path: path.join(shots, "desktop-original.png"),
      fullPage: true,
    });
    const originalPractice = await download("#exportSvg");
    assert.match(originalPractice.bytes.toString(), /review-label/);
    await page
      .getByRole("button", {
        name: "Review copy text #review-label",
        exact: true,
      })
      .click();
    await page.locator("#moveX").fill("40");
    await page.locator("#moveY").fill("0");
    await page.locator("#moveApply").click();
    await page.screenshot({
      path: path.join(shots, "desktop-edited.png"),
      fullPage: true,
    });
    assert.match(
      (await download("#exportSvg")).bytes.toString(),
      /transform="translate\(40 0\)"/,
    );
    checks.push(
      "Practice SVG: real selection, move, source export and before/after screenshots.",
    );

    await page
      .locator("#svgFile")
      .setInputFiles({
        name: "nested-中文.svg",
        mimeType: "image/svg+xml",
        buffer: Buffer.from(source),
      });
    await page
      .locator("#filename")
      .filter({ hasText: "nested-中文.svg" })
      .waitFor();
    assert.deepEqual((await download("#exportSvg")).bytes, Buffer.from(source));
    checks.push(
      "Unedited file download preserves UTF-8 BOM, CRLF, comments, quotes and bytes.",
    );
    await page
      .locator("#elementList button")
      .filter({ hasText: "Café & garden" })
      .click();
    const before = await point();
    await page.locator("#moveX").fill("3");
    await page.locator("#moveY").fill("-2");
    await page.locator("#moveApply").click();
    const moved = await point();
    close(moved.x - before.x, 3);
    close(moved.y - before.y, -2);
    const edited = await download("#exportSvg");
    const receipt = JSON.parse((await download("#exportChanges")).bytes);
    assert.equal(receipt.input.sha256, digest(Buffer.from(source)));
    assert.equal(receipt.output.sha256, digest(edited.bytes));
    assert.equal(receipt.changes.length, 1);
    let rebuilt = source;
    for (const c of [...receipt.changes].sort((a, b) => b.start - a.start)) {
      assert.equal(source.slice(c.start, c.end), c.before);
      rebuilt = rebuilt.slice(0, c.start) + c.after + rebuilt.slice(c.end);
    }
    assert.deepEqual(Buffer.from(rebuilt), edited.bytes);
    checks.push(
      "Rotated/scaled parent: root-coordinate move is exactly +3, −2; receipt reconstructs only the touched range.",
    );

    await page.locator("#moveX").fill("10001");
    await page.locator("#moveApply").click();
    assert.match(await page.locator("#error").textContent(), /10,000/);
    assert.deepEqual((await download("#exportSvg")).bytes, edited.bytes);
    checks.push("Out-of-range move rejected without modifying the file.");
    await page.locator("#labelText").fill("A & B <script> 中文");
    await page.locator("#textApply").click();
    assert.equal(
      await drawing().locator("#label").textContent(),
      "A & B <script> 中文",
    );
    assert.equal(await drawing().locator("script").count(), 0);
    const textEdit = await download("#exportSvg");
    assert.match(textEdit.bytes.toString(), /A &amp; B &lt;script&gt; 中文/);
    assert.equal(
      JSON.parse((await download("#exportChanges")).bytes).changes.length,
      2,
    );
    await page.locator("#undo").click();
    assert.equal(
      await drawing().locator("#label").textContent(),
      "Café & garden",
    );
    await page.locator("#redo").click();
    assert.equal(
      await drawing().locator("#label").textContent(),
      "A & B <script> 中文",
    );
    await page.locator("#compare").click();
    assert.equal(
      await drawing().locator("#label").textContent(),
      "Café & garden",
    );
    assert.equal(await page.locator("#moveApply").isDisabled(), true);
    assert.equal(await page.locator("#moveX").isDisabled(), true);
    await page.locator("#compare").click();
    assert.equal(
      await drawing().locator("#label").textContent(),
      "A & B <script> 中文",
    );
    checks.push(
      "Escaped text, undo/redo and original comparison keep edits intact.",
    );

    const anchorBefore = await point();
    const inverse = await drawing()
      .locator("svg")
      .evaluate((el) => {
        const m = el.getScreenCTM().inverse();
        return { a: m.a, b: m.b, c: m.c, d: m.d };
      });
    const box = await drawing().locator("#label").boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      box.x + box.width / 2 + 30,
      box.y + box.height / 2 + 15,
      { steps: 8 },
    );
    await page.mouse.up();
    const anchorAfter = await point();
    close(
      anchorAfter.x - anchorBefore.x,
      inverse.a * 30 + inverse.c * 15,
      0.02,
    );
    close(
      anchorAfter.y - anchorBefore.y,
      inverse.b * 30 + inverse.d * 15,
      0.02,
    );
    await page.locator("#stage").focus();
    const arrowBefore = await point();
    await page.keyboard.press("ArrowRight");
    const arrowAfter = await point();
    close(arrowAfter.x - arrowBefore.x, 1);
    checks.push(
      "Actual pointer drag and keyboard nudge work in nested transforms.",
    );

    const png = await download("#exportPng");
    assert.equal(png.bytes.subarray(1, 4).toString(), "PNG");
    assert.equal(png.bytes.readUInt32BE(16), 1200);
    assert.equal(png.bytes.readUInt32BE(20), 960);
    assert.ok(png.bytes.length > 2000);
    await fs.writeFile(path.join(output, "actual-export.png"), png.bytes);
    checks.push(
      "Real PNG download is 1200 × 960 and contains rendered image data.",
    );
    await download("#exportSvg");
    const rejected = [
      '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><script>window.top.BAD=1</script></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect onclick="alert(1)"/></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><use href="https://example.invalid/a.svg#x"/></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><foreignObject/></svg>',
      '<!DOCTYPE svg [<!ENTITY x SYSTEM "file:///etc/passwd">]><svg xmlns="http://www.w3.org/2000/svg"/>',
      '<?xml version="1.0" encoding="ISO-8859-1"?><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>',
      '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><style>text{-webkit-transform:translateX(1px)}</style></svg>',
    ];
    for (const bad of rejected) {
      await page
        .locator("#svgFile")
        .setInputFiles({
          name: "unsupported.svg",
          mimeType: "image/svg+xml",
          buffer: Buffer.from(bad),
        });
      await page.waitForFunction(
        () => document.getElementById("svgFile").files.length === 0,
      );
      await page.locator("#error:not([hidden])").waitFor();
      assert.equal(
        await page.locator("#filename").textContent(),
        "nested-中文.svg",
      );
    }
    assert.equal(await page.evaluate(() => window.BAD), undefined);
    checks.push(
      "Seven active/external/encoding inputs rejected before replacing the current document.",
    );
    await page.locator("#language").click();
    assert.equal(await page.locator("#exportSvg").textContent(), "下载 SVG");
    await page.screenshot({
      path: path.join(shots, "desktop-zh.png"),
      fullPage: true,
    });
    const mobile = await context.newPage();
    await mobile.setViewportSize({ width: 390, height: 844 });
    mobile.on("pageerror", (e) => failures.push(e.message));
    await mobile.goto(origin + "/?lang=zh");
    await mobile.locator("#elementList button").first().waitFor();
    assert.equal(
      await mobile.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await mobile
      .getByRole("button", {
        name: "Review copy text #review-label",
        exact: true,
      })
      .click();
    await mobile.locator("#zoomIn").click();
    assert.match(
      await mobile
        .frameLocator("#preview")
        .locator("svg")
        .getAttribute("style"),
      /150%/,
    );
    await mobile.screenshot({
      path: path.join(shots, "mobile-zh.png"),
      fullPage: true,
    });
    checks.push(
      "English/Chinese controls and fresh 390 px mobile layout; preview zoom works without page overflow.",
    );

    const offline = await context.newPage();
    offline.on("pageerror", (e) => failures.push(e.message));
    await offline.goto("file://" + path.join(root, "app/index.html"));
    await offline.locator("#elementList button").first().waitFor();
    await offline
      .getByRole("button", {
        name: "Review copy text #review-label",
        exact: true,
      })
      .click();
    await offline.locator('[data-nudge="1,0"]').click();
    const offlineEvent = offline.waitForEvent("download");
    await offline.locator("#exportSvg").click();
    const offlineDownload = await offlineEvent;
    assert.match(
      (await fs.readFile(await offlineDownload.path())).toString(),
      /translate\(1 0\)/,
    );
    checks.push(
      "Direct file:// app opening, edit and SVG export work without a server.",
    );
    assert.deepEqual(requests, []);
    assert.deepEqual(failures, []);
    const report = {
      captured_at: new Date().toISOString(),
      browser: await browser.version(),
      channel: process.env.BROWSER_CHANNEL || "chrome",
      checks,
      external_http_requests: requests,
      page_errors: failures,
      screenshots: shots,
      scope:
        "Original synthetic SVG files only; local and file:// browser QA, not external-user adoption.",
    };
    await fs.writeFile(
      path.join(output, "result.json"),
      JSON.stringify(report, null, 2) + "\n",
    );
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
