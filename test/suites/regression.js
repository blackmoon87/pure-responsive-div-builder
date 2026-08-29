// ============================================================================
// regression.js — one test per bug found in the field. Each name records the
// symptom, so a failure says what broke rather than which line moved.
// ============================================================================
import * as core from "../../mcp-server/core.js";

const seg = (css, device) => {
  if (device === "desktop") return css.split("@media")[0];
  const bp = device === "tablet" ? 992 : 576;
  const i = css.indexOf(`@media (max-width: ${bp}px)`);
  return i < 0 ? "" : css.slice(i, css.indexOf("\n}\n", i));
};
const ruleFor = (css, cls) => {
  const i = css.indexOf(`.${cls} {`);
  return i < 0 ? "" : css.slice(i, css.indexOf("}", i));
};

export default {
  name: "regression — bugs that shipped once",
  run(t) {
    // BUG 8: justify-self in block layout makes Chrome shrink-to-fit, bursting
    // the container. Only legal under a grid parent.
    core.resetAll();
    let n = core.addChildDiv("root", "C", "centered");   // root is flex-column
    core.setProps(n.id, "desktop", { horizontalAlign: "center", maxWidth: "1200px" });
    let css = core.generateResponsiveCss();
    t.excludes("justify-self is not emitted under a non-grid parent", ruleFor(css, "centered"), "justify-self");
    t.includes("margin-inline auto still centers it", ruleFor(css, "centered"), "margin-left: auto");

    core.resetAll();
    const g = core.addChildDiv("root", "G", "grid-parent");
    core.setProps(g.id, "desktop", { display: "grid", columns: 3 });
    const cell = core.addChildDiv(g.id, "Cell", "grid-cell");
    core.setProps(cell.id, "desktop", { horizontalAlign: "center" });
    t.includes("justify-self IS emitted under a grid parent",
      ruleFor(core.generateResponsiveCss(), "grid-cell"), "justify-self: center");

    // BUG 9 / 10: flex-row children and grid children both need min-width: 0,
    // or a nowrap row bursts its container and a grid track is widened by its
    // widest item until the grid overflows.
    core.resetAll();
    const row = core.addChildDiv("root", "R", "row");
    core.setProps(row.id, "desktop", { display: "flex", flexDirection: "row" });
    core.addChildDiv(row.id, "I", "row-item");
    const grid = core.addChildDiv("root", "G2", "grid2");
    core.setProps(grid.id, "desktop", { display: "grid", columns: 2 });
    core.addChildDiv(grid.id, "I2", "grid-item");
    css = core.generateResponsiveCss();
    t.includes("flex-row child gets min-width: 0", ruleFor(css, "row-item"), "min-width: 0");
    t.includes("grid child gets min-width: 0", ruleFor(css, "grid-item"), "min-width: 0");

    // BUG 11: minmax(240px, 1fr) cannot shrink below 240px and overflows.
    core.resetAll();
    n = core.addChildDiv("root", "A", "autofit");
    core.setProps(n.id, "desktop", { display: "grid", gridAutoMode: "auto-fit", gridMinColWidth: "240px" });
    t.includes("auto-fit track is wrapped in min()",
      core.generateResponsiveCss(), "minmax(min(240px, 100%), 1fr)");

    // BUG 12: breakpoint blocks were a parallel if-chain; 16 properties were
    // unreachable at tablet/mobile.
    core.resetAll();
    n = core.addChildDiv("root", "P", "pos");
    core.setProps(n.id, "desktop", { position: "sticky", top: "0", maxWidth: "1200px" });
    core.setProps(n.id, "tablet", { top: "48px", maxWidth: "900px" });
    css = core.generateResponsiveCss();
    t.includes("position offsets are overridable at a breakpoint", seg(css, "tablet"), "top: 48px");
    t.includes("max-width is overridable at a breakpoint", seg(css, "tablet"), "max-width: 900px");

    // Clearing a property at a breakpoint emits a neutral instead of inheriting.
    core.resetAll();
    n = core.addChildDiv("root", "B", "bord");
    core.setProps(n.id, "desktop", { borderWidth: "1px", borderStyle: "solid", borderColor: "#111" });
    core.setProps(n.id, "mobile", { borderWidth: "", borderStyle: "", borderColor: "" });
    t.includes("clearing a property emits a neutral", seg(core.generateResponsiveCss(), "mobile"), "border: none");

    // BUG 13: `hidden` was one-way with no desktop support, so the
    // sidebar/hamburger pair was inexpressible.
    core.resetAll();
    n = core.addChildDiv("root", "H", "panel");
    core.setProps(n.id, "desktop", { hidden: true });
    core.setProps(n.id, "mobile", { hidden: false, display: "flex" });
    css = core.generateResponsiveCss();
    t.includes("hidden works on desktop", seg(css, "desktop"), "display: none");
    t.includes("a breakpoint can switch it back on", seg(css, "mobile"), "display: flex");

    // export_json lost breakpoints, so a document round-tripped to the wrong
    // media queries.
    core.resetAll();
    n = core.addChildDiv("root", "X", "x");
    // display:grid is required for a `columns` override to emit anything
    core.setProps(n.id, "desktop", { display: "grid", columns: 3 });
    core.setProps(n.id, "tablet", { columns: 2 });
    core.setBreakpoints(768, 480);
    const dump = JSON.parse(JSON.stringify(core.getTreeJson()));
    core.resetAll();
    t.eq("resetAll restores default breakpoints", core.state.breakpoints.tablet, 992);
    core.importTreeJson(dump);
    t.eq("breakpoints survive export -> import", core.state.breakpoints.tablet, 768);
    t.includes("imported breakpoints drive @media", core.generateResponsiveCss(), "max-width: 768px");
    t.ok("a bare legacy root still imports",
      core.importTreeJson(JSON.parse(JSON.stringify(core.state.root))).ok === true);

    // import_json threw a TypeError out of a walk instead of reporting.
    let threw = false, res = null;
    try { res = core.importTreeJson({ id: "root" }); } catch { threw = true; }
    t.ok("a malformed tree is reported, not thrown", !threw && res && res.ok === false,
      threw ? "it threw" : `got ${JSON.stringify(res)}`);
    t.includes("the error names the offending path", (res && res.error) || "", "responsive");

    // Four mutating tools skipped history, so undo walked past them.
    core.resetAll();
    core.addChildDiv("root", "Keep", "keep");
    core.pushHistory();
    core.resetAll();
    t.ok("undo reverses reset_all", core.undo() && core.state.root.children.length === 1);
    core.pushHistory();
    core.setBreakpoints(700, 400);
    core.undo();
    t.eq("undo reverses set_breakpoints", core.state.breakpoints.tablet, 992);

    // flex-grow/shrink/basis style a flex ITEM. The test used to be inverted:
    // a flex container in a block parent got them, a real flex item did not.
    core.resetAll();
    const blockParent = core.addChildDiv("root", "BP", "blockp");
    core.setProps(blockParent.id, "desktop", { display: "block" });
    const flexChild = core.addChildDiv(blockParent.id, "FC", "flexkid");
    core.setProps(flexChild.id, "desktop", { display: "flex" });
    const flexParent = core.addChildDiv("root", "FP", "flexp");
    core.setProps(flexParent.id, "desktop", { display: "flex" });
    core.addChildDiv(flexParent.id, "PC", "plainkid");
    css = core.generateResponsiveCss();
    t.excludes("a flex container in a block parent gets no flex-grow", ruleFor(css, "flexkid"), "flex-grow");
    t.includes("a plain child of a flex parent gets flex-grow", ruleFor(css, "plainkid"), "flex-grow");

    // customClass is interpolated into class="" AND a CSS selector.
    core.resetAll();
    core.addChildDiv("root", "X", 'hero"><img src=x onerror=alert(1)>');
    const html = core.generateCleanHtml(core.state.root, 0);
    t.excludes("a hostile customClass cannot break out of the attribute", html, "<img");
    t.excludes("nor inject a quote", html, '"><');
    core.resetAll();
    core.addChildDiv("root", "Y", "2 cols!");
    const sane = core.generateCleanHtml(core.state.root, 0);
    t.includes("an invalid class is sanitised to a valid ident", sane, 'class="_2-cols"');
    t.includes("and the CSS selector agrees with it", core.generateResponsiveCss(), "._2-cols {");

    // build_tree: one round trip instead of dozens. The shipped examples need
    // 31-64 create_div/set_props calls each when built a node at a time.
    core.resetAll();
    const built = core.buildTree({
      class: "shell",
      desktop: { display: "grid", customColumns: "260px 1fr" },
      mobile: { customColumns: "1fr" },
      children: [
        { class: "rail", desktop: { position: "sticky", top: "0" }, mobile: { hidden: true } },
        { class: "main", children: [{ class: "card" }, { class: "card" }] }
      ]
    });
    t.ok("build_tree creates a whole subtree in one call", built.ok && built.created === 5,
      JSON.stringify(built));
    css = core.generateResponsiveCss();
    t.includes("nested desktop props are applied", css, "grid-template-columns: 260px 1fr");
    t.includes("nested breakpoint props are applied", css, "display: none");
    t.ok("repeated classes still de-duplicate", css.includes(".card {") && css.includes(".card-2 {"));
    for (const [bad, want] of [
      [{ class: "a", desktop: "nope" }, "desktop must be an object"],
      [{ class: "a", children: "nope" }, "children must be an array"]
    ]) {
      const r = core.buildTree(bad);
      t.ok(`build_tree rejects ${JSON.stringify(bad)}`, !r.ok && r.error.includes(want.split(" ")[0]), JSON.stringify(r));
    }

    // The generators were forks and drifted: the MCP copy dropped these.
    core.resetAll();
    n = core.addChildDiv("root", "D", "drift");
    core.setProps(n.id, "desktop", { overflowX: "auto" });
    core.setProps(n.id, "tablet", { horizontalAlign: "center" });
    css = core.generateResponsiveCss();
    t.includes("desktop overflow-x is emitted", seg(css, "desktop"), "overflow-x: auto");
    t.includes("tablet horizontalAlign is emitted", seg(css, "tablet"), "margin-left: auto");
  }
};
