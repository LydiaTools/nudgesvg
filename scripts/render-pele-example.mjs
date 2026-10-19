import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { render } from "pele";

const folder = new URL("../examples/pele/", import.meta.url);
const source = await readFile(new URL("garden.mmd", folder), "utf8");
const result = render(source);
const bytes = Buffer.from(result.svg);
const args = process.argv.slice(2);

if (args.length === 1 && args[0] === "--check") {
  const committed = await readFile(new URL("garden.original.svg", folder));
  assert.deepEqual(
    bytes,
    committed,
    "Pele output differs from the committed example.",
  );
  console.log("Pele 1.7.0 output matches the committed garden example.");
} else {
  if (args.length && !(args.length === 2 && args[0] === "--out")) {
    throw new Error(
      "Usage: node scripts/render-pele-example.mjs [--check | --out new.svg]",
    );
  }
  const output = args.length
    ? resolve(args[1])
    : fileURLToPath(new URL("../artifacts/pele/garden.svg", import.meta.url));
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, bytes, { flag: "wx" });
  console.log("Rendered " + output);
}
console.log(
  JSON.stringify({
    width: result.width,
    height: result.height,
    bytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  }),
);
