/* MIT © 2026 LydiaTools. */
"use strict";
const $ = (id) => document.getElementById(id);
const core = window.NudgeCore;
const SVG_NS = "http://www.w3.org/2000/svg";
const SAMPLE = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="600" viewBox="0 0 960 600">
  <!-- Original practice artwork by LydiaTools. Try moving the Review label. -->
  <rect width="960" height="600" fill="#fffefb"/>
  <g font-family="Trebuchet MS, sans-serif" fill="#173048">
    <text x="70" y="83" font-size="13" letter-spacing="2" fill="#6b8295">A SMALL PUBLISHING WORKFLOW</text>
    <text x="70" y="137" font-size="35">A little room to get it right.</text>
    <text x="70" y="173" font-size="16" fill="#536a80">Three steps. One label that needs a little space.</text>
    <path d="M239 333 H438 M528 333 H727" stroke="#7292ab" stroke-width="3" fill="none"/>
    <path d="m425 326 13 7-13 7 m289-14 13 7-13 7" stroke="#7292ab" stroke-width="3" fill="none"/>
    <g id="draft-card"><rect x="95" y="267" width="150" height="132" rx="12" fill="#eaf1f8" stroke="#aec3d6"/><path d="M141 294 h52 v58 h-52z M151 308h31 M151 319h31 M151 330h20" stroke="#527b9e" fill="none" stroke-width="2"/><text x="170" y="378" text-anchor="middle" font-size="16">Draft</text></g>
    <g id="review-card"><rect x="435" y="267" width="150" height="132" rx="12" fill="#fff0bd" stroke="#d9bc63"/><circle cx="510" cy="319" r="23" fill="none" stroke="#8a742f" stroke-width="2"/><path d="m499 319 8 8 15-17" stroke="#8a742f" stroke-width="3" fill="none"/></g>
    <text id="review-label" x="470" y="378" text-anchor="middle" font-size="16">Review copy</text>
    <g id="publish-card"><rect x="725" y="267" width="150" height="132" rx="12" fill="#eaf1f8" stroke="#aec3d6"/><path d="M766 337 h68 v-30 h-68z M783 349h34 M800 337v12" fill="none" stroke="#527b9e" stroke-width="2"/><text x="800" y="378" text-anchor="middle" font-size="16">Publish</text></g>
    <path d="M70 460h820" stroke="#d4dfe8"/>
    <text x="70" y="505" font-size="14" fill="#536a80">Practice artwork · Select a label, drag it, or use the arrow keys.</text>
    <text x="70" y="532" font-size="12" fill="#6b8295">Original practice artwork by LydiaTools. Give the Review copy label a little room.</text>
  </g>
</svg>`;
const messages = {
  en: {
    heading: "Move a label. <br>Keep the whole drawing.",
    intro: "One last tweak. No need to prompt AI again.",
    local: "Your SVG stays in this tab.<br>No account needed. No AI calls.",
    open: "Open SVG",
    practice: "Practice file",
    undo: "Undo",
    redo: "Redo",
    downloadSvg: "Download SVG",
    elements: "Pick an element",
    pickHint: "Or click it on the drawing.",
    compare: "Show original",
    edited: "Show edits",
    keyboard: "Arrow keys: 1 unit · Shift: 10",
    adjust: "Make the small edit",
    nothing: "Choose a label or shape.",
    move: "Move in drawing coordinates",
    applyMove: "Apply move",
    moveHint: "Moves follow the canvas, even in rotated groups.",
    text: "Plain text",
    applyText: "Update text",
    pngWidth: "PNG width (px)",
    png: "PNG",
    receipt: "A small edit. A clear record.",
    downloadChanges: "Download changes JSON",
    paste: "Or paste SVG markup",
    loadPaste: "Open pasted SVG",
    scope:
      "For static SVG. Plain text and position edits; no path drawing or PNG text editing. Active content and external resources are rejected.",
    limits: "Supported files & limits",
    more: "More LydiaTools",
    unchanged: "No edits yet. The original source is unchanged.",
    changed: (n) =>
      `${n} source range${n === 1 ? "" : "s"} changed. All other source characters are unchanged.`,
    plainOnly:
      "Text editing is available for plain, single-node labels. You can still move this element.",
    discard:
      "Open another SVG? Download your current SVG first if you want to keep these edits.",
    original: "Original preview · edits are still kept",
    invalid: "Could not open this SVG: ",
    exportError: "Could not export: ",
    selectFirst: "Select an element before moving it.",
    badMove: "Use finite moves between −10,000 and 10,000 drawing units.",
    textLimit: "Keep a label under 2,000 characters.",
    pngLimit:
      "Choose a width from 64 to 4,096 pixels; exports are limited to 16 million pixels.",
    before: "Before",
    after: "After",
    limited: (n) => `${n} shown (first 300)`,
    active: "Active content is unsupported.",
    external: "External resources are unsupported.",
    staticCss:
      "Animated or CSS-transformed SVG is unsupported. Use static SVG transform attributes.",
    fileLimit: "Use a UTF-8 SVG up to 1 MiB.",
    root: "The document must have one SVG root with the SVG namespace.",
    dims: "Use a positive viewBox or explicit pixel width and height.",
    unsupported: (tag) => `Unsupported SVG element: ${tag}`,
    noText: "Only one plain text node can be edited.",
    saved: "SVG downloaded.",
  },
  zh: {
    heading: "挪一下标签，<br>保留整幅图。",
    intro: "最后一点小调整，不必再问一轮 AI。",
    local: "SVG 只在当前标签页处理。<br>无需账号，不调用 AI。",
    open: "打开 SVG",
    practice: "练习文件",
    undo: "撤销",
    redo: "重做",
    downloadSvg: "下载 SVG",
    elements: "选择一个元素",
    pickHint: "也可以直接点击画布里的图形。",
    compare: "查看原图",
    edited: "查看修改",
    keyboard: "方向键：1 单位 · Shift：10 单位",
    adjust: "完成这点小调整",
    nothing: "先选择标签或图形。",
    move: "按画布方向移动",
    applyMove: "应用位移",
    moveHint: "即使位于旋转分组中，也按画布方向移动。",
    text: "简单文字",
    applyText: "更新文字",
    pngWidth: "PNG 宽度（像素）",
    png: "PNG",
    receipt: "改动虽小，记录清楚。",
    downloadChanges: "下载改动 JSON",
    paste: "也可以粘贴 SVG 源码",
    loadPaste: "打开粘贴的 SVG",
    scope:
      "适用于静态 SVG，可改简单文字和位置；不绘制路径，也不修改 PNG 内文字。拒绝脚本、动态内容和外部资源。",
    limits: "支持的文件与限制",
    more: "更多 LydiaTools 工具",
    unchanged: "尚未修改，原始源码保持原样。",
    changed: (n) => `修改了 ${n} 处源码范围，其余源码字符保持不变。`,
    plainOnly: "仅可编辑单一文本节点的简单标签；此元素仍可移动。",
    discard: "打开另一个 SVG？如需保留当前修改，请先下载 SVG。",
    original: "正在查看原图，修改仍保留",
    invalid: "无法打开这个 SVG：",
    exportError: "无法导出：",
    selectFirst: "请先选择元素再移动。",
    badMove: "请输入 −10,000 到 10,000 之间的有限位移。",
    textLimit: "标签请控制在 2,000 字以内。",
    pngLimit: "宽度为 64 至 4,096 像素，总像素不超过 1,600 万。",
    before: "原内容",
    after: "改为",
    limited: (n) => `显示 ${n} 项（最多 300 项）`,
    active: "不支持脚本或动态内容。",
    external: "不支持外部资源。",
    staticCss: "不支持动画或 CSS transform，请使用静态 SVG transform 属性。",
    fileLimit: "请使用不超过 1 MiB 的 UTF-8 SVG。",
    root: "文件必须只有一个带 SVG 命名空间的 SVG 根节点。",
    dims: "需要有效的 viewBox 或明确的像素宽高。",
    unsupported: (tag) => `暂不支持此 SVG 元素：${tag}`,
    noText: "仅可修改单一文本节点的简单文字。",
    saved: "SVG 已下载。",
  },
};
let lang =
  new URLSearchParams(location.search).get("lang") === "zh" ? "zh" : "en";
let original = "",
  originalDoc,
  originalNodes = [],
  liveNodes = [],
  sourceNodes = [],
  name = "practice.svg";
let edits = new Map(),
  undo = [],
  redo = [],
  selected = null,
  comparing = false,
  dirty = false,
  drag = null;
let dimensions = { width: 960, height: 600 },
  zoom = 1;
const frame = $("preview");
const allowed = new Set(
  "svg g path rect circle ellipse line polyline polygon text tspan defs linearGradient radialGradient stop clipPath mask filter feGaussianBlur feOffset feMerge feMergeNode feColorMatrix feComposite feBlend feDropShadow feFlood marker symbol use title desc style".split(
    " ",
  ),
);
const drawable = new Set(
  "g path rect circle ellipse line polyline polygon text use".split(" "),
);
function tr(key, ...args) {
  const v = messages[lang][key];
  return typeof v === "function" ? v(...args) : v;
}
messages.en.fit = "Fit";
messages.zh.fit = "适应";
function error(message) {
  $("error").textContent = message;
  $("error").hidden = !message;
}
function validate(source) {
  if (new TextEncoder().encode(source).length > 1048576)
    throw new Error(tr("fileLimit"));
  const encoding =
    /^\uFEFF?\s*<\?xml\s[^?]*encoding\s*=\s*['"]([^'"]+)['"]/i.exec(source);
  if (encoding && !/^utf-?8$/i.test(encoding[1]))
    throw new Error(tr("fileLimit"));
  const mapped = core.scan(source),
    doc = new DOMParser().parseFromString(source, "image/svg+xml"),
    root = doc.documentElement;
  if (doc.querySelector("parsererror")) throw new Error("Invalid XML.");
  if (root.localName !== "svg" || root.namespaceURI !== SVG_NS)
    throw new Error(tr("root"));
  const nodes = [root, ...root.querySelectorAll("*")];
  if (nodes.length !== mapped.length)
    throw new Error("Unsupported XML structure.");
  for (const node of nodes) {
    if (node.namespaceURI !== SVG_NS || !allowed.has(node.localName))
      throw new Error(tr("unsupported", node.localName));
    for (const attr of node.attributes) {
      if (/^on/i.test(attr.localName)) throw new Error(tr("active"));
      if (attr.localName === "base" && attr.value)
        throw new Error(tr("external"));
      if (
        /^(?:fill|stroke|filter|clip-path|mask|cursor|marker(?:-start|-mid|-end)?|style)$/.test(
          attr.localName,
        ) &&
        /\\/.test(attr.value)
      )
        throw new Error(tr("external"));
      if (attr.localName === "href" && !/^#[\w:.-]+$/.test(attr.value))
        throw new Error(tr("external"));
      const matches = [...attr.value.matchAll(/url\(([^)]*)\)/gi)];
      if (matches.some((m) => !/^\s*['"]?#[\w:.-]+['"]?\s*$/.test(m[1])))
        throw new Error(tr("external"));
    }
    const css =
      node.localName === "style"
        ? node.textContent
        : node.getAttribute("style") || "";
    if (css) {
      if (/\\|@import|@font-face/i.test(css)) throw new Error(tr("external"));
      if (
        /(?:^|[;{])\s*(?:-(?:webkit|moz|ms|o)-)?(?:animation[\w-]*|transition[\w-]*|transform[\w-]*)\s*:/i.test(
          css,
        ) ||
        /@(?:-webkit-)?keyframes/i.test(css)
      )
        throw new Error(tr("staticCss"));
      if (
        [...css.matchAll(/url\(([^)]*)\)/gi)].some(
          (m) => !/^\s*['"]?#[\w:.-]+['"]?\s*$/.test(m[1]),
        )
      )
        throw new Error(tr("external"));
    }
  }
  const vb = root
    .getAttribute("viewBox")
    ?.trim()
    .split(/[\s,]+/)
    .map(Number);
  let width, height;
  if (vb?.length === 4 && vb.every(Number.isFinite) && vb[2] > 0 && vb[3] > 0) {
    width = vb[2];
    height = vb[3];
  } else {
    const px = /^\d+(?:\.\d+)?(?:px)?$/;
    let w = root.getAttribute("width") || "",
      h = root.getAttribute("height") || "";
    if (!px.test(w) || !px.test(h)) throw new Error(tr("dims"));
    width = parseFloat(w);
    height = parseFloat(h);
  }
  if (
    !width ||
    !height ||
    width > 100000 ||
    height > 100000 ||
    width / height > 20 ||
    height / width > 20
  )
    throw new Error(tr("dims"));
  return { doc, nodes, mapped, dimensions: { width, height } };
}
function eligible(node) {
  return (
    drawable.has(node.localName) &&
    !node.closest("defs,clipPath,mask,filter,symbol,marker") &&
    node !== node.ownerSVGElement
  );
}
function plain(node) {
  return (
    node.localName === "text" &&
    node.childNodes.length === 1 &&
    node.firstChild.nodeType === Node.TEXT_NODE
  );
}
function label(node) {
  return node.localName === "text"
    ? (edits.get(originalNodes.indexOf(node))?.text ?? node.textContent)
        .trim()
        .slice(0, 70)
    : node.id || node.localName;
}
function cloneEdits() {
  return [...edits].map(([i, v]) => [i, { ...v }]);
}
function checkpoint(before) {
  undo.push(before);
  if (undo.length > 100) undo.shift();
  redo = [];
  dirty = true;
}
function rounded(n) {
  return Math.abs(n) < 0.0000005 ? 0 : Number(n.toFixed(6));
}
function transformValue(index, entry) {
  const base = originalNodes[index].getAttribute("transform") || "";
  return `translate(${rounded(entry.dx || 0)} ${rounded(entry.dy || 0)})${base ? " " + base : ""}`;
}
function result() {
  const updates = [];
  for (const [index, e] of edits) {
    if (e.dx || e.dy)
      updates.push({
        node: index,
        attribute: "transform",
        value: transformValue(index, e),
      });
    if (e.text !== undefined) updates.push({ node: index, text: e.text });
  }
  return core.patch(original, updates);
}
function updateEntry(index, entry) {
  if (!entry.dx && !entry.dy && entry.text === undefined) edits.delete(index);
  else edits.set(index, entry);
}
function buildList() {
  const list = $("elementList");
  list.replaceChildren();
  const priority = (n) => (n.localName === "text" ? 0 : n.id ? 1 : 2);
  const available = originalNodes
    .map((node, index) => ({ node, index }))
    .filter((x) => eligible(x.node))
    .sort((a, b) => priority(a.node) - priority(b.node));
  $("elementCount").textContent =
    available.length > 300 ? tr("limited", 300) : available.length;
  for (const { node, index } of available.slice(0, 300)) {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.node = index;
    b.textContent = label(node);
    const s = document.createElement("small");
    s.textContent = node.localName + (node.id ? " #" + node.id : "");
    b.append(s);
    b.addEventListener("click", () => select(index));
    list.append(b);
  }
}
function select(index) {
  selected = index;
  updateSelection();
  $("stage").focus({ preventScroll: true });
}
function updateSelection() {
  const node = selected === null ? null : originalNodes[selected];
  for (const b of $("elementList").children)
    b.classList.toggle("active", Number(b.dataset.node) === selected);
  $("selectionName").textContent = node ? label(node) : tr("nothing");
  $("moveControls").disabled = !node || comparing;
  const canText = node && plain(node);
  $("textControls").disabled = !canText || comparing;
  $("labelText").value = canText
    ? (edits.get(selected)?.text ?? node.textContent)
    : "";
  $("textHint").textContent = node && !canText ? tr("plainOnly") : "";
  outline();
}
function outline() {
  const box = $("selectionBox"),
    node = selected === null ? null : liveNodes[selected];
  if (!node || comparing) {
    box.hidden = true;
    return;
  }
  const r = node.getBoundingClientRect(),
    s = $("stage").getBoundingClientRect(),
    f = frame.getBoundingClientRect();
  box.style.left = f.left + r.left - s.left + "px";
  box.style.top = f.top + r.top - s.top + "px";
  box.style.width = r.width + "px";
  box.style.height = r.height + "px";
  box.hidden = !(r.width || r.height);
}
function render() {
  const parsed = validate(comparing ? original : result().source),
    doc = frame.contentDocument;
  const svg = doc.importNode(parsed.doc.documentElement, true);
  if (!svg.hasAttribute("viewBox"))
    svg.setAttribute("viewBox", `0 0 ${dimensions.width} ${dimensions.height}`);
  svg.style.width = zoom * 100 + "%";
  svg.style.height = zoom * 100 + "%";
  svg.style.display = "block";
  svg.style.userSelect = "none";
  doc.body.replaceChildren(svg);
  liveNodes = [svg, ...svg.querySelectorAll("*")];
  buildList();
  updateSelection();
  updateReceipt();
}
function updateReceipt() {
  const r = result();
  $("summary").textContent = comparing
    ? tr("original")
    : r.changes.length
      ? tr("changed", r.changes.length)
      : tr("unchanged");
  $("undo").disabled = !undo.length;
  $("redo").disabled = !redo.length;
  $("compare").textContent = tr(comparing ? "edited" : "compare");
  $("fit").textContent = zoom === 1 ? tr("fit") : zoom * 100 + "%";
  const out = $("changes");
  out.replaceChildren();
  for (const change of r.changes) {
    const row = document.createElement("div");
    row.className = "change";
    const heading = document.createElement("strong");
    heading.textContent =
      label(originalNodes[change.node]) +
      " · " +
      (change.kind === "text" ? tr("text") : "transform");
    row.append(heading);
    for (const [word, value] of [
      [tr("before"), change.before],
      [tr("after"), change.after],
    ]) {
      const small = document.createElement("small");
      small.textContent = word;
      const code = document.createElement("code");
      code.textContent = value || "∅";
      row.append(small, code);
    }
    out.append(row);
  }
}
function load(source, filename, ask = true) {
  try {
    const parsed = validate(source);
    if (ask && dirty && !confirm(tr("discard"))) return;
    original = source;
    originalDoc = parsed.doc;
    originalNodes = parsed.nodes;
    sourceNodes = parsed.mapped;
    dimensions = parsed.dimensions;
    name = filename;
    edits = new Map();
    undo = [];
    redo = [];
    selected = null;
    comparing = false;
    dirty = false;
    zoom = 1;
    $("filename").textContent = name;
    $("canvasSize").textContent = `${dimensions.width} × ${dimensions.height}`;
    $("source").value = "";
    error("");
    buildList();
    render();
  } catch (e) {
    error(tr("invalid") + e.message);
  }
}
function applyMove(dx, dy) {
  try {
    if (selected === null || comparing) throw new Error(tr("selectFirst"));
    if (
      !Number.isFinite(dx) ||
      !Number.isFinite(dy) ||
      Math.abs(dx) > 10000 ||
      Math.abs(dy) > 10000
    )
      throw new Error(tr("badMove"));
    if (!dx && !dy) return;
    const node = liveNodes[selected],
      root = liveNodes[0],
      parent = node.parentElement;
    const relative = root
        .getScreenCTM()
        .inverse()
        .multiply(parent.getScreenCTM()),
      inv = relative.inverse();
    const localX = inv.a * dx + inv.c * dy,
      localY = inv.b * dx + inv.d * dy;
    if (![localX, localY].every(Number.isFinite))
      throw new Error("This transform cannot be moved.");
    const before = cloneEdits(),
      entry = { ...(edits.get(selected) || {}) };
    entry.dx = rounded((entry.dx || 0) + localX);
    entry.dy = rounded((entry.dy || 0) + localY);
    updateEntry(selected, entry);
    checkpoint(before);
    error("");
    render();
  } catch (e) {
    error(e.message);
  }
}
function applyText() {
  try {
    if (selected === null || !plain(originalNodes[selected]) || comparing)
      throw new Error(tr("noText"));
    const text = $("labelText").value;
    if (text.length > 2000) throw new Error(tr("textLimit"));
    const before = cloneEdits(),
      entry = { ...(edits.get(selected) || {}) };
    if (text === originalNodes[selected].textContent) delete entry.text;
    else entry.text = text;
    updateEntry(selected, entry);
    if (JSON.stringify(before) === JSON.stringify(cloneEdits())) return;
    checkpoint(before);
    error("");
    render();
  } catch (e) {
    error(e.message);
  }
}
function undoEdit() {
  if (!undo.length) return;
  redo.push(cloneEdits());
  edits = new Map(undo.pop());
  dirty = true;
  render();
}
function redoEdit() {
  if (!redo.length) return;
  undo.push(cloneEdits());
  edits = new Map(redo.pop());
  dirty = true;
  render();
}
function rootPoint(event) {
  return new DOMPoint(event.clientX, event.clientY).matrixTransform(
    liveNodes[0].getScreenCTM().inverse(),
  );
}
function pointerDown(event) {
  if (event.button !== 0 || comparing) return;
  let node = event.target;
  if (node.localName === "tspan") node = node.closest("text");
  while (node && !eligible(node)) node = node.parentElement;
  if (!node || !liveNodes.includes(node)) return;
  event.preventDefault();
  const index = liveNodes.indexOf(node);
  selected = index;
  updateSelection();
  const root = liveNodes[0],
    relative = root
      .getScreenCTM()
      .inverse()
      .multiply(node.parentElement.getScreenCTM());
  drag = {
    index,
    start: rootPoint(event),
    inverse: relative.inverse(),
    before: cloneEdits(),
    base: { ...(edits.get(index) || {}) },
    moved: false,
  };
  node.setPointerCapture(event.pointerId);
}
function pointerMove(event) {
  if (!drag) return;
  event.preventDefault();
  const p = rootPoint(event),
    dx = p.x - drag.start.x,
    dy = p.y - drag.start.y;
  drag.moved = drag.moved || Math.abs(dx) + Math.abs(dy) > 0.5;
  const m = drag.inverse,
    entry = {
      ...drag.base,
      dx: rounded((drag.base.dx || 0) + m.a * dx + m.c * dy),
      dy: rounded((drag.base.dy || 0) + m.b * dx + m.d * dy),
    };
  if (![entry.dx, entry.dy].every(Number.isFinite)) return;
  updateEntry(drag.index, entry);
  liveNodes[drag.index].setAttribute(
    "transform",
    transformValue(drag.index, entry),
  );
  outline();
}
function pointerUp() {
  if (!drag) return;
  const d = drag;
  drag = null;
  if (d.moved) checkpoint(d.before);
  else edits = new Map(d.before);
  render();
}
function keys(event) {
  if (
    ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName) ||
    event.target.isContentEditable
  )
    return;
  const modifier = event.ctrlKey || event.metaKey;
  if (modifier && event.key.toLowerCase() === "z") {
    event.preventDefault();
    event.shiftKey ? redoEdit() : undoEdit();
    return;
  }
  if (modifier && event.key.toLowerCase() === "y") {
    event.preventDefault();
    redoEdit();
    return;
  }
  const vectors = {
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
  };
  if (vectors[event.key] && selected !== null && !comparing) {
    event.preventDefault();
    const [x, y] = vectors[event.key],
      step = event.shiftKey ? 10 : 1;
    applyMove(x * step, y * step);
  }
}
function download(blob, filename) {
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
function baseName() {
  return (
    name.replace(/\.svg$/i, "").replace(/[^\p{L}\p{N}_.-]/gu, "_") || "drawing"
  ).slice(0, 100);
}
async function sha(source) {
  return [
    ...new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(source)),
    ),
  ]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}
async function exportChanges() {
  try {
    const r = result(),
      record = {
        version: 1,
        tool: "NudgeSVG",
        input: { name, sha256: await sha(original) },
        output: { sha256: await sha(r.source) },
        coordinate_system:
          "Source ranges use JavaScript UTF-16 code-unit offsets; before/after are literal source fragments.",
        changes: r.changes,
      };
    download(
      new Blob([JSON.stringify(record, null, 2) + "\n"], {
        type: "application/json",
      }),
      baseName() + ".changes.json",
    );
  } catch (e) {
    error(tr("exportError") + e.message);
  }
}
async function exportPng() {
  try {
    const width = Number($("pngWidth").value),
      height = Math.round((width * dimensions.height) / dimensions.width);
    if (
      !Number.isInteger(width) ||
      width < 64 ||
      width > 4096 ||
      height < 1 ||
      height > 16384 ||
      width * height > 16000000
    )
      throw new Error(tr("pngLimit"));
    const doc = validate(result().source).doc,
      root = doc.documentElement;
    if (!root.hasAttribute("viewBox"))
      root.setAttribute(
        "viewBox",
        `0 0 ${dimensions.width} ${dimensions.height}`,
      );
    root.setAttribute("width", width);
    root.setAttribute("height", height);
    const blob = new Blob([new XMLSerializer().serializeToString(root)], {
        type: "image/svg+xml",
      }),
      url = URL.createObjectURL(blob);
    try {
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error("SVG rasterization failed."));
        img.src = url;
      });
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      const png = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!png) throw new Error("PNG encoding failed.");
      download(png, baseName() + ".nudged.png");
    } finally {
      URL.revokeObjectURL(url);
    }
    error("");
  } catch (e) {
    error(tr("exportError") + e.message);
  }
}
function translate() {
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  for (const node of document.querySelectorAll("[data-i18n]")) {
    const text = tr(node.dataset.i18n);
    if (["heading", "local"].includes(node.dataset.i18n)) {
      node.replaceChildren(
        ...text
          .split("<br>")
          .flatMap((s, i) =>
            i
              ? [document.createElement("br"), document.createTextNode(s)]
              : [document.createTextNode(s)],
          ),
      );
    } else node.textContent = text;
  }
  $("language").textContent = lang === "en" ? "Chinese" : "English";
  if (original) {
    buildList();
    updateSelection();
    updateReceipt();
  }
}
$("open").addEventListener("click", () => $("svgFile").click());
$("svgFile").addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    if (file.size > 1048576) throw new Error(tr("fileLimit"));
    const source = new TextDecoder("utf-8", {
      fatal: true,
      ignoreBOM: true,
    }).decode(await file.arrayBuffer());
    load(source, file.name);
  } catch (e) {
    error(e.message);
  }
  event.target.value = "";
});
$("practice").addEventListener("click", () => load(SAMPLE, "practice.svg"));
$("loadPaste").addEventListener("click", () =>
  load($("source").value, "pasted.svg"),
);
$("moveApply").addEventListener("click", () =>
  applyMove(Number($("moveX").value), Number($("moveY").value)),
);
$("textApply").addEventListener("click", applyText);
for (const b of document.querySelectorAll("[data-nudge]"))
  b.addEventListener("click", (event) => {
    const [x, y] = b.dataset.nudge.split(",").map(Number),
      s = event.shiftKey ? 10 : 1;
    applyMove(x * s, y * s);
  });
$("undo").addEventListener("click", undoEdit);
$("redo").addEventListener("click", redoEdit);
$("compare").addEventListener("click", () => {
  comparing = !comparing;
  render();
});
function zoomTo(value) {
  zoom = Math.max(1, Math.min(4, value));
  render();
}
$("zoomIn").addEventListener("click", () => zoomTo(zoom + 0.5));
$("zoomOut").addEventListener("click", () => zoomTo(zoom - 0.5));
$("fit").addEventListener("click", () => zoomTo(1));
$("exportSvg").addEventListener("click", () => {
  download(
    new Blob([result().source], { type: "image/svg+xml;charset=utf-8" }),
    baseName() + ".nudged.svg",
  );
  dirty = false;
});
$("exportPng").addEventListener("click", exportPng);
$("exportChanges").addEventListener("click", exportChanges);
$("language").addEventListener("click", () => {
  lang = lang === "en" ? "zh" : "en";
  try {
    const url = new URL(window.location.href);
    url.searchParams.set("lang", lang);
    window.history.replaceState(window.history.state, "", url.href);
  } catch (_) {
    // Language switching still works when the browser disallows URL changes.
  }
  translate();
});
document.addEventListener("keydown", keys);
window.addEventListener("resize", outline);
window.addEventListener("beforeunload", (event) => {
  if (dirty) {
    event.preventDefault();
    event.returnValue = "";
  }
});
frame.addEventListener(
  "load",
  () => {
    const doc = frame.contentDocument;
    doc.addEventListener("pointerdown", pointerDown);
    doc.addEventListener("pointermove", pointerMove);
    doc.addEventListener("pointerup", pointerUp);
    doc.addEventListener("pointercancel", pointerUp);
    doc.addEventListener("keydown", keys);
    doc.addEventListener("scroll", outline, true);
    load(SAMPLE, "practice.svg", false);
  },
  { once: true },
);
frame.srcdoc =
  "<!doctype html><html><head><meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src 'none'; font-src 'none'; connect-src 'none'; base-uri 'none'; form-action 'none'\"><style>html,body{width:100%;height:100%;margin:0;overflow:auto}svg{touch-action:none}</style></head><body></body></html>";
translate();
