// ============================================================================
// examples.js — the shipped examples must be honest generator output:
//   * each .json reproduces its .html byte-for-byte
//   * the markup is pure <div> with no smuggled elements or attributes
// ============================================================================
import * as core from "../../mcp-server/core.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const examplesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "examples");

export default {
  name: "examples — honest, pure, reproducible",
  run(t) {
    const jsons = fs.readdirSync(examplesDir).filter(f => f.endsWith(".json")).sort();
    t.ok(`${jsons.length} examples found`, jsons.length >= 10, `found ${jsons.length}`);

    for (const name of jsons) {
      const htmlPath = path.join(examplesDir, name.replace(".json", ".html"));
      core.resetAll();
      const res = core.importTreeJson(JSON.parse(fs.readFileSync(path.join(examplesDir, name), "utf8")));
      if (!res.ok) { t.ok(`${name} imports`, false, res.error); continue; }
      t.eq(`${name} -> HTML byte-for-byte`, core.generateFullHtmlDocument(), fs.readFileSync(htmlPath, "utf8"));
    }

    // Purity: the body may contain <div> only, carrying only class and dir.
    for (const file of fs.readdirSync(examplesDir).filter(f => f.endsWith(".html")).sort()) {
      const src = fs.readFileSync(path.join(examplesDir, file), "utf8");
      const body = src.slice(src.indexOf("<body>"), src.indexOf("</body>"));
      const tags = [...new Set([...body.matchAll(/<([a-zA-Z][a-zA-Z0-9]*)/g)].map(m => m[1]))];
      const attrs = [...new Set([...body.matchAll(/\s([a-zA-Z-]+)=/g)].map(m => m[1]))];
      const strayTags = tags.filter(x => x !== "div" && x !== "body");
      const strayAttrs = attrs.filter(a => a !== "class" && a !== "dir");
      t.ok(`${file} is pure <div>`, strayTags.length === 0, `stray tags: ${strayTags.join(", ")}`);
      t.ok(`${file} carries only class/dir`, strayAttrs.length === 0, `stray attrs: ${strayAttrs.join(", ")}`);
      t.ok(`${file} has no text content`, body.replace(/<[^>]*>/g, "").trim() === "");
    }
  }
};
