const test = require("node:test");
const assert = require("node:assert/strict");
const { scan, patch } = require("../app/core.js");

test("no edit preserves BOM, CRLF, comments, quotes and all original bytes", () => {
  const source =
    '\ufeff<?xml version="1.0"?>\r\n<svg xmlns="http://www.w3.org/2000/svg">\r\n<!-- keep --> <text x=\'3\'>Café &amp; garden 🪴</text></svg>\r\n';
  assert.equal(patch(source, []).source, source);
  assert.deepEqual(patch(source, []).changes, []);
});

test("only the selected attribute range changes, retaining its quote style", () => {
  const source =
    "<svg><g transform='rotate(30)' data-note=\"a > b\"><text>Price</text></g></svg>";
  const result = patch(source, [
    { node: 1, attribute: "transform", value: "translate(3 0) rotate(30)" },
  ]);
  assert.equal(
    result.source,
    source.replace("'rotate(30)'", "'translate(3 0) rotate(30)'"),
  );
  assert.equal(result.changes.length, 1);
  assert.equal(result.source.replace("translate(3 0) ", ""), source);
});

test("nested text edits escape markup without changing surrounding source", () => {
  const source =
    '<svg>\n <g><text id="x">Before</text><path d="M0 0" /></g>\n</svg>';
  const result = patch(source, [{ node: 2, text: "A & B <script> 中文" }]);
  assert.equal(
    result.source,
    source.replace("Before", "A &amp; B &lt;script&gt; 中文"),
  );
  assert.equal(result.changes[0].before, "Before");
});

test("self-closing elements get a new attribute without rewriting their neighbors", () => {
  const source = '<svg><path d="M0 0 L2 3" /></svg>';
  assert.equal(
    patch(source, [
      { node: 1, attribute: "transform", value: "translate(1 2)" },
    ]).source,
    '<svg><path d="M0 0 L2 3"  transform="translate(1 2)"/></svg>',
  );
});

test("angle brackets in attributes, comments and CDATA do not create elements", () => {
  const nodes = scan(
    '<svg><!-- <path/> --><text data-x="&gt; >"><![CDATA[<path/>]]></text></svg>',
  );
  assert.deepEqual(
    nodes.map((n) => n.tag),
    ["svg", "text"],
  );
  assert.equal(nodes[1].parent, 0);
});

test("duplicate edits, child text loss and arbitrary attribute writes are rejected", () => {
  const source = "<svg><text><tspan>Keep</tspan></text></svg>";
  assert.throws(
    () => patch(source, [{ node: 1, text: "Lose structure" }]),
    /plain text/,
  );
  assert.throws(
    () => patch(source, [{ node: 2, attribute: "onclick", value: "bad" }]),
    /Only transform/,
  );
  assert.throws(
    () =>
      patch(source, [
        { node: 2, text: "A" },
        { node: 2, text: "B" },
      ]),
    /Duplicate/,
  );
});

test("invalid tag structures and active XML declarations fail before edits", () => {
  for (const source of [
    '<!DOCTYPE svg [<!ENTITY x SYSTEM "file:///etc/passwd">]><svg/>',
    '<?xml-stylesheet href="https://example.test/a.css"?><svg/>',
    "<svg><g></svg>",
    '<svg a="x>',
    "<!-- unfinished",
  ]) {
    assert.throws(() => scan(source));
  }
});
