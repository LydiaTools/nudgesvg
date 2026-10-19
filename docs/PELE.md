# Finish one label in a Pele SVG

[中文](PELE.zh-CN.md) · [Open NudgeSVG](https://lydiatools.github.io/nudgesvg/)

Keep the generated diagram. Move the one label you want to finish.

This original, synthetic garden-planning chart was rendered by **Pele 1.7.0**. Its “Replace stepping stones” label sits beside the horizontal boundary and slightly outside the left plot edge in our Chrome rendering. NudgeSVG moves that text by **+20 x, +64 y** drawing units. The data points, other labels and generated styles stay unchanged.

**Before: actual editor preview**

![Actual NudgeSVG preview before the move](assets/pele-before.png)

**After: +20 x, +64 y**

![Actual NudgeSVG preview after moving Replace stepping stones; the outline is the editor's selection](assets/pele-after.png)

These are native captures of the actual editor preview. The blue surround and selection outline are editor UI; they are not added to the SVG download.

## Try the saved example

1. Save [garden.original.svg](https://raw.githubusercontent.com/LydiaTools/nudgesvg/main/examples/pele/garden.original.svg) as a local `.svg` file.
2. [Open NudgeSVG](https://lydiatools.github.io/nudgesvg/) and choose **Open SVG** to load that file.
3. Select **Replace stepping stones** in the element list. Enter `20` in **Δ x**, `64` in **Δ y**, then **Apply move**.
4. Inspect the single changed `transform` in the source record. Download SVG, PNG or changes JSON.

Compare the [actual adjusted SVG](../examples/pele/garden.adjusted.svg) and [actual change record](../examples/pele/garden.changes.json). The record's ranges and hashes cover the exact input and output files. This sample changes one source range; it does not reserialize the generated SVG.

## Render the input again

From a checkout of the current main branch, with Node.js 20+:

```sh
npm ci --ignore-scripts
npm run test:pele
node scripts/render-pele-example.mjs
```

The check renders [garden.mmd](../examples/pele/garden.mmd) with the locked `pele@1.7.0` dependency and compares bytes with the committed original SVG. The final command writes a fresh `artifacts/pele/garden.svg` and refuses to overwrite an existing file. Use `--out another.svg` to choose another output.

The editor itself needs no package installation. Its current v0.1.0 release ZIP remains a fixed source snapshot; the extra example and reproduction script are on main.

## What carries over

- This finishes the exported **static SVG**, not the Mermaid text. Rendering the Mermaid source again creates a fresh SVG without this manual move.
- The tutorial covers this one Pele version and chart. It is not a promise that every Pele/Mermaid diagram imports, lays out or exports identically.
- PNG rasterizes the SVG; areas without painted shapes may stay transparent. Display or compose it on a suitable background. Device fonts can change text appearance.
- No Pele runtime is loaded by NudgeSVG. Imported scripts, external resources, animation and other unsupported content are still rejected.

The public label-placement discussion in [Pele #35](https://github.com/obsidianmd/pele/issues/35) motivated this compatibility check. The garden text is independently written. This is a manual workaround, not a change to Pele's layout algorithm or an upstream endorsement. [Pele notice](../examples/pele/PELE-LICENSE.txt)
