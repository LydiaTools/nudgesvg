# Validation and scope

The browser test uses original synthetic SVGs and the practice artwork. No customer graphics, user accounts or AI generations are needed. Test output is saved under ignored `artifacts/browser-<timestamp>/result.json`; CI publishes its own downloadable `browser-evidence` artifact. A passing test is engineering evidence, not user adoption.

## Source-range checks

Seven Node built-in tests cover unchanged source (UTF-8 BOM, CRLF, comments, quotes and Unicode), a single existing transform edit, escaped plain text, insertion of a transform into a self-closing element, tag-like text in comments/CDATA, rejected duplicate/structural/arbitrary-attribute changes, and malformed XML/declarations. The source mapper does not replace full XML validation: the application additionally uses DOMParser, supported-element/attribute checks and a script-disabled preview frame.

## Actual browser workflow

- Download the practice SVG, perform a 40-unit label move and inspect the exported transform.
- Import an original UTF-8/BOM/CRLF file and download it unchanged, comparing bytes.
- Move text inside translated, rotated and non-uniformly scaled parents by +3 and −2 root units, measuring the rendered coordinates.
- Download the edit JSON, verify the original/output SHA-256, and reconstruct the SVG from its exact recorded source ranges.
- Reject an out-of-range move without changing the output.
- Edit text containing ampersands, markup-like text and Chinese; inspect the actual text node and escaped SVG. Exercise undo, redo and original comparison.
- Perform real pointer dragging and keyboard movement on the rotated example.
- Download a PNG and verify the PNG signature, dimensions and nonempty image data.
- Reject script/event, external reference, foreignObject, DTD/entity, non-UTF-8 declaration and CSS transform inputs before they replace the working file. These are specific tested cases, not coverage of every possible browser or SVG vulnerability.
- Switch English/Chinese, create a fresh 390 px viewport, check page overflow and preview zoom, and save actual screenshots.
- Open `app/index.html` through `file://`, make an edit and download the SVG without a running server.
- Record external HTTP requests and page errors; require both lists to be empty.

The test server binds only to loopback and serves four application files. Both it and the browser close in `finally`. No persistent service is installed.

## Interpretation and limits

Positions are SVG drawing units, independent of preview zoom. At 1:1 output they can correspond to pixels; a root-unit move is not a constant number of physical screen pixels at every zoom. The original source and result stay separate; screenshot selection outlines belong to the editor and do not appear in exported artwork.

The first browser-check attempt hit an ambiguous text selector after the practice caption also mentioned “Review copy”; the test now targets its exact accessible name. A second attempt inspected the disabled fieldset container using Playwright's control predicate. Native DOM inspection confirmed the fieldset and its actual controls were disabled; the assertion now checks the move button and input themselves. Neither was bypassed to claim a successful completed run.

Local Chrome/macOS and CI Chromium/Ubuntu are separate environments. See the actual result files for their versions and outcome; other browsers, arbitrary illustrations, interactive/animated figures and unseen files remain outside the tested scope. No claim of productivity gains or external feedback is inferred from these checks.
