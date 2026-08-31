// ============================================================================
// device-ladder.js — the six-tier responsive ladder.
//
// Guards the three things that make the ladder more than a longer list:
//   * the inheritance chain (a narrow tier restates only what differs)
//   * the emission order (a narrower @media block must come last and win)
//   * backward compatibility (a document that only knows desktop/tablet/mobile
//     must still emit exactly what it emitted before the ladder existed)
// ============================================================================
import * as core from "../../mcp-server/core.js";

// The block a tier emits, isolated from the rest of the sheet.
function block(css, key) {
  const d = core.deviceMeta(key);
  if (d.type === "base") return css.split("@media")[0];
  const i = css.indexOf(`@media (${d.type === "min" ? "min" : "max"}-width: ${core.state.breakpoints[key]}px)`);
  return i < 0 ? "" : css.slice(i, css.indexOf("\n}\n", i));
}

export default {
  name: "device ladder — six tiers, one cascade",
  run(t) {
    // ---- shape ------------------------------------------------------------
    t.eq("six tiers on the ladder", core.DEVICE_KEYS.length, 6);
    t.eq("ladder order is widest-first",
      core.DEVICE_KEYS.join(","), "ultrawide,desktop,laptop,tablet,mobile,mobileSm");
    t.eq("exactly one base tier", core.DEVICES.filter(d => d.type === "base").length, 1);
    t.eq("the base is desktop", core.DEVICES.find(d => d.type === "base").key, "desktop");

    // Every non-base tier must inherit from a tier that actually exists,
    // or getEffectiveProps would walk off the end of the chain.
    const unknownParent = core.DEVICES
      .filter(d => d.inherits && !core.isDevice(d.inherits))
      .map(d => d.key);
    t.ok("every tier inherits from a real tier", unknownParent.length === 0, unknownParent.join(", "));

    t.eq("mobileSm chain is the full cascade",
      core.deviceChain("mobileSm").join(">"), "desktop>laptop>tablet>mobile>mobileSm");
    t.eq("ultrawide branches off the base", core.deviceChain("ultrawide").join(">"), "desktop>ultrawide");
    t.eq("an unknown key falls back to the base", core.deviceChain("watch").join(">"), "desktop");

    // ---- inheritance -------------------------------------------------------
    core.resetAll();
    let n = core.addChildDiv("root", "Card", "card");
    core.setProps(n.id, "desktop", { display: "grid", columns: 4, backgroundColor: "#111111" });
    core.setProps(n.id, "tablet", { columns: 2 });
    core.setProps(n.id, "mobileSm", { columns: 1 });

    t.eq("laptop inherits the desktop column count",
      core.getEffectiveProps(core.findNode(n.id), "laptop").columns, 4);
    t.eq("mobile inherits the tablet column count through laptop",
      core.getEffectiveProps(core.findNode(n.id), "mobile").columns, 2);
    t.eq("mobileSm applies its own override",
      core.getEffectiveProps(core.findNode(n.id), "mobileSm").columns, 1);
    t.eq("a property set once on desktop survives to the narrowest tier",
      core.getEffectiveProps(core.findNode(n.id), "mobileSm").backgroundColor, "#111111");

    let css = core.generateResponsiveCss();
    t.includes("tablet block restates the columns", block(css, "tablet"), "repeat(2, 1fr)");
    t.includes("mobileSm block restates the columns", block(css, "mobileSm"), "repeat(1, 1fr)");
    // The whole point of diffing against the inherited tier: mobile changes
    // nothing, so it must emit no rule for this div at all.
    t.excludes("mobile emits nothing when it differs from tablet in nothing",
      block(css, "mobile"), ".card");
    t.excludes("an unchanged property is not repeated at a breakpoint",
      block(css, "mobileSm"), "background-color");

    // ---- emission order ----------------------------------------------------
    const order = ["ultrawide", "laptop", "tablet", "mobile", "mobileSm"]
      .map(k => css.indexOf(`@media (${core.deviceMeta(k).type === "min" ? "min" : "max"}-width: ${core.state.breakpoints[k]}px)`))
      .filter(i => i >= 0);
    t.ok("media blocks are emitted in ladder order, narrower last",
      order.every((v, i) => i === 0 || v > order[i - 1]), order.join(","));
    t.ok("the base rule precedes every media block",
      css.indexOf(".card {") < css.indexOf("@media"));

    // ---- the min-width tier ------------------------------------------------
    core.resetAll();
    n = core.addChildDiv("root", "Shell", "shell");
    core.setProps(n.id, "desktop", { maxWidth: "1200px" });
    core.setProps(n.id, "ultrawide", { maxWidth: "1600px" });
    css = core.generateResponsiveCss();
    t.includes("ultrawide emits a min-width query", css, "@media (min-width: 1600px)");
    t.includes("ultrawide override reaches the sheet", block(css, "ultrawide"), "max-width: 1600px");
    t.ok("the min-width block sits above the max-width blocks",
      css.indexOf("min-width: 1600px") < (css.indexOf("max-width: 1200px", css.indexOf("@media")) >>> 0));

    // ---- breakpoints -------------------------------------------------------
    core.resetAll();
    t.eq("every media-owning tier has a default breakpoint",
      Object.keys(core.defaultBreakpoints()).length, 5);
    let bp = core.setBreakpoints({ laptop: 1280, mobileSm: 380 });
    t.eq("object form sets a tier", bp.laptop, 1280);
    t.eq("object form sets another tier", bp.mobileSm, 380);
    t.eq("untouched tiers keep their default", bp.tablet, 992);
    bp = core.setBreakpoints(900, 500);
    t.eq("the legacy positional form still sets tablet", bp.tablet, 900);
    t.eq("the legacy positional form still sets mobile", bp.mobile, 500);
    t.eq("the legacy form leaves the new tiers alone", bp.laptop, 1280);

    core.resetAll();
    t.eq("reset_all restores the default ladder", core.state.breakpoints.laptop, 1200);

    // ---- device key validation ---------------------------------------------
    n = core.addChildDiv("root", "V", "v");
    t.eq("set_props rejects an unknown device", core.setProps(n.id, "watch", { columns: 2 }), false);
    t.eq("set_props accepts every ladder tier",
      core.DEVICE_KEYS.every(k => core.setProps(n.id, k, {})), true);
    t.eq("reset_device rejects an unknown device", core.resetDevice(n.id, "watch"), false);

    // ---- backward compatibility --------------------------------------------
    // A tree written before the ladder existed carries only three tiers. It
    // must still import, and must emit byte-for-byte what it emitted then:
    // the new tiers are empty, so they contribute no rules at all.
    const legacy = {
      version: 2,
      breakpoints: { tablet: 992, mobile: 576 },
      root: {
        id: "root", type: "div", name: "Page Root", customClass: "page-layout",
        responsive: { desktop: { display: "flex", gap: 20 }, tablet: {}, mobile: {} },
        children: [{
          id: "legacy_1", type: "div", name: "Hero", customClass: "hero",
          responsive: {
            desktop: { display: "grid", columns: 3, minHeight: 300 },
            tablet: { columns: 2 },
            mobile: { columns: 1 }
          },
          children: []
        }]
      }
    };
    core.resetAll();
    const res = core.importTreeJson(JSON.parse(JSON.stringify(legacy)));
    t.ok("a three-tier document still imports", res.ok, res.error);
    t.eq("its missing tiers take the ladder defaults", res.breakpoints.laptop, 1200);
    css = core.generateResponsiveCss();
    t.excludes("an empty laptop tier emits no block", css, "max-width: 1200px");
    t.excludes("an empty ultrawide tier emits no block", css, "min-width: 1600px");
    t.excludes("an empty mobileSm tier emits no block", css, "max-width: 400px");
    t.includes("its tablet rules still emit", block(css, "tablet"), "repeat(2, 1fr)");
    t.includes("its mobile rules still emit", block(css, "mobile"), "repeat(1, 1fr)");

    // ---- build_tree accepts every tier --------------------------------------
    core.resetAll();
    const built = core.buildTree({
      class: "ladder-box",
      desktop: { display: "grid", columns: 6 },
      ultrawide: { columns: 8 },
      laptop: { columns: 4 },
      tablet: { columns: 3 },
      mobile: { columns: 2 },
      mobileSm: { columns: 1 }
    });
    t.ok("build_tree accepts a spec using all six tiers", built.ok, built.error);
    css = core.generateResponsiveCss();
    for (const [key, cols] of [["ultrawide", 8], ["laptop", 4], ["tablet", 3], ["mobile", 2], ["mobileSm", 1]]) {
      t.includes(`build_tree ${key} override reaches the CSS`, block(css, key), `repeat(${cols}, 1fr)`);
    }
  }
};
