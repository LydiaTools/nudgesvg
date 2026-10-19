/* MIT © 2026 LydiaTools. Source-range edits; no SVG reserialization. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.NudgeCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function escapeText(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function escapeAttribute(text, quote) {
    const value = escapeText(text);
    return quote === "'"
      ? value.replace(/'/g, "&apos;")
      : value.replace(/"/g, "&quot;");
  }

  // This source mapper is not a replacement for XML validation. The application
  // additionally validates the complete document with DOMParser before rendering.
  function scan(xml) {
    if (typeof xml !== "string" || xml.length > 1048576)
      throw new Error("SVG source exceeds 1 MiB of characters.");
    const nodes = [],
      stack = [];
    let pos = 0;
    while (pos < xml.length) {
      const start = xml.indexOf("<", pos);
      if (start < 0) break;
      if (
        xml.startsWith("<!--", start) ||
        xml.startsWith("<![CDATA[", start) ||
        xml.startsWith("<?", start)
      ) {
        const endMark = xml.startsWith("<!--", start)
          ? "-->"
          : xml.startsWith("<?", start)
            ? "?>"
            : "]]>";
        if (xml.startsWith("<?", start) && !/^<\?xml\s/i.test(xml.slice(start)))
          throw new Error("XML processing instructions are unsupported.");
        const end = xml.indexOf(endMark, start + 2);
        if (end < 0) throw new Error("Unclosed XML comment or declaration.");
        pos = end + endMark.length;
        continue;
      }
      if (xml.startsWith("<!", start))
        throw new Error("DTD and entity declarations are unsupported.");
      let end = start + 1,
        quote = "";
      for (; end < xml.length; end++) {
        const c = xml[end];
        if (quote) {
          if (c === quote) quote = "";
        } else if (c === '"' || c === "'") quote = c;
        else if (c === ">") break;
      }
      if (end === xml.length) throw new Error("Unclosed XML tag.");
      const raw = xml.slice(start, end + 1);
      if (raw.startsWith("</")) {
        const close = /^<\/([\w:.-]+)\s*>$/.exec(raw);
        const node = nodes[stack.pop()];
        if (!close || !node || node.tag !== close[1])
          throw new Error("Mismatched XML tags.");
        node.contentEnd = start;
        node.end = end + 1;
      } else {
        const open = /^<([\w:.-]+)/.exec(raw);
        if (!open) throw new Error("Unsupported XML tag.");
        const selfClosing = /\/\s*>$/.test(raw);
        const node = {
          index: nodes.length,
          tag: open[1],
          parent: stack.length ? stack[stack.length - 1] : null,
          start,
          openEnd: end + 1,
          contentStart: end + 1,
          contentEnd: selfClosing ? end + 1 : null,
          end: selfClosing ? end + 1 : null,
          selfClosing,
          attributes: [],
        };
        const attrs = raw.slice(
          open[0].length,
          raw.length - (selfClosing ? raw.match(/\/\s*>$/)[0].length : 1),
        );
        const pattern = /([\w:.-]+)\s*=\s*(["'])([\s\S]*?)\2/g;
        let match;
        while ((match = pattern.exec(attrs))) {
          const relative =
            open[0].length + match.index + match[0].indexOf(match[2]);
          node.attributes.push({
            name: match[1],
            quote: match[2],
            start: start + relative + 1,
            end: start + relative + 1 + match[3].length,
          });
        }
        node.insertAt = selfClosing ? start + raw.lastIndexOf("/") : end;
        nodes.push(node);
        if (nodes.length > 5000) throw new Error("SVG exceeds 5,000 elements.");
        if (!selfClosing) stack.push(node.index);
      }
      pos = end + 1;
    }
    if (stack.length || !nodes.length)
      throw new Error("Incomplete SVG document.");
    return nodes;
  }

  function patch(xml, edits) {
    const nodes = scan(xml),
      changes = [],
      keys = new Set();
    for (const edit of edits) {
      const node = nodes[edit.node];
      if (!node) throw new Error("Unknown element in edit.");
      const kind = Object.hasOwn(edit, "text") ? "text" : "attribute";
      const key = `${edit.node}:${kind}:${edit.attribute || ""}`;
      if (keys.has(key))
        throw new Error("Duplicate edit for one source range.");
      keys.add(key);
      let start, end, replacement;
      if (kind === "text") {
        if (node.selfClosing || nodes.some((n) => n.parent === node.index))
          throw new Error("Only plain text content can be replaced.");
        start = node.contentStart;
        end = node.contentEnd;
        replacement = escapeText(edit.text);
      } else {
        if (edit.attribute !== "transform")
          throw new Error("Only transform attributes can be changed.");
        const attr = node.attributes.find((a) => a.name === edit.attribute);
        start = attr ? attr.start : node.insertAt;
        end = attr ? attr.end : node.insertAt;
        const value = escapeAttribute(edit.value, attr ? attr.quote : '"');
        replacement = attr ? value : ` transform="${value}"`;
      }
      const before = xml.slice(start, end);
      if (before !== replacement)
        changes.push({
          node: node.index,
          tag: node.tag,
          kind,
          attribute: edit.attribute || null,
          start,
          end,
          before,
          after: replacement,
        });
    }
    const descending = [...changes].sort(
      (a, b) => b.start - a.start || b.end - a.end,
    );
    let result = xml,
      previous = xml.length + 1;
    for (const change of descending) {
      if (change.end > previous) throw new Error("Overlapping source edits.");
      result =
        result.slice(0, change.start) + change.after + result.slice(change.end);
      previous = change.start;
    }
    return { source: result, changes };
  }

  return Object.freeze({ scan, patch, escapeText });
});
