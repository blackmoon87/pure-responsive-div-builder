// ============================================================================
// generator.js — the single source of truth for HTML & CSS emission.
//
// Pure and state-free: every entry point takes the tree (and breakpoints) as
// arguments. Both surfaces consume this module — the browser builder
// (builder.js) and the MCP server (mcp-server/core.js) — so a fix to the
// emitted CSS can no longer land in one and silently miss the other.
// ============================================================================

export var defaultDesktopProps = {
    // Layout display
    display: "block",
    columns: 1,
    customColumns: "",
    gridAutoMode: "",         // "" (fixed repeat) | "auto-fit" | "auto-fill"
    gridMinColWidth: "200px", // used with auto-fit/auto-fill
    justifyItems: "stretch",  // grid: "start" | "center" | "end" | "stretch"
    alignContent: "start",    // grid: "start" | "center" | "end" | "stretch" | "space-between" | "space-around"
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "flex-start",
    alignItems: "stretch",

    // Self alignment
    horizontalAlign: "stretch", // "left" | "center" | "right" | "stretch"
  alignSelf: "",            // "" (inherit) | "start" | "center" | "end" | "stretch" | "baseline"
    textAlign: "left",

    // Sizing
    width: "",
    maxWidth: "",
    height: "",               // "auto", "100%", "100vh", "500px"
    maxHeight: "",            // "80vh", "600px"
    minHeight: 60,
    aspectRatio: "",          // "16/9", "4/3", "1/1"

    // Spacing — 4-side
    paddingTop: 16,
    paddingRight: 16,
    paddingBottom: 16,
    paddingLeft: 16,
    paddingLinked: true,
    marginTop: "",
    marginRight: "",
    marginBottom: "",
    marginLeft: "",
    marginLinked: true,
    gap: 16,
    rowGap: 16,

    // Position & Layer
    position: "static",       // "static" | "relative" | "absolute" | "fixed" | "sticky"
    top: "",
    right: "",
    bottom: "",
    left: "",
    zIndex: "",

    // Overflow
    overflow: "visible",      // "visible" | "hidden" | "scroll" | "auto"
    overflowX: "",
    overflowY: "",

    // Visual Styling
    backgroundColor: "",
    borderWidth: "",          // "1px", "2px"
    borderStyle: "",          // "solid" | "dashed" | "dotted" | "none"
    borderColor: "",
    borderRadius: "",         // "8px", "50%"
    boxShadow: "",
    opacity: "",
    transform: "",            // "translateY(-8px)", "scale(0.96)", "translate(-50%, -50%)"
    transition: "",           // "opacity .2s ease, transform .2s ease"
    backdropFilter: "",       // "blur(8px)", "blur(12px) saturate(140%)"

    // Flex/Grid child
    span: 1,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "",            // "auto", "0", "200px"
    order: 0,
    hidden: false,
    direction: ""            // "" (inherit) | "ltr" | "rtl"
  };

// A flex item or a grid item only shrinks below its content width when
// min-width is cleared: both have an automatic minimum size of min-content.
// Without this a nowrap row bursts its container, and a grid track is widened
// by its widest item until the whole grid overflows.
// A class name is interpolated into `class="..."` AND into a CSS selector, so an
// invalid one corrupts both at once. Sanitised at emission rather than on input,
// so a hand-written or agent-supplied tree is safe too. Both emitters call this,
// which is what keeps the HTML and the CSS naming each other correctly.
export function safeClass(name) {
  var out = String(name == null ? "" : name)
    .trim()
    .replace(/[^A-Za-z0-9_-]+/g, "-")   // anything not a CSS ident char
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
  if (/^\d/.test(out)) out = "_" + out;  // an ident may not start with a digit
  return out || "div-box";
}

export function isGrid(props) {
  return !!props && props.display === "grid";
}

export function isFlexRow(props) {
  return !!props && props.display === "flex" && (props.flexDirection || "row").indexOf("row") === 0;
}

export function walk(node, visit, parent, index) {
  if (visit(node, parent, index) === false) return false;
  for (var i = 0; i < node.children.length; i++) {
    if (walk(node.children[i], visit, node, i) === false) return false;
  }
  return true;
}

// ==========================================================================
// The Device Ladder
//
// One ordered list drives everything downstream: the property resolver, the
// media-query emission order, the breakpoint diff chain, the builder's device
// buttons and the MCP device enums. Adding a tier here adds it everywhere.
// The old desktop/tablet/mobile trio was hardcoded in eight separate places,
// so it could not be extended without one of them being missed.
//
// `desktop` is the base rule and carries no media query. Every `max` tier
// inherits from the tier directly above it, which is what lets a phone rule
// restate only what actually differs from the tablet instead of repeating the
// whole cascade. `ultrawide` is a `min` tier: it branches off the base
// directly, because nothing narrower ever feeds into it.
// ==========================================================================
export var DEVICES = [
  { key: "ultrawide", label: "Ultrawide", short: "UW", type: "min",  inherits: "desktop", defaultPx: 1600, previewWidth: 1920 },
  { key: "desktop",   label: "Desktop",   short: "DT", type: "base", inherits: null,      defaultPx: null, previewWidth: 1280 },
  { key: "laptop",    label: "Laptop",    short: "LT", type: "max",  inherits: "desktop", defaultPx: 1200, previewWidth: 1100 },
  { key: "tablet",    label: "Tablet",    short: "TB", type: "max",  inherits: "laptop",  defaultPx:  992, previewWidth:  768 },
  { key: "mobile",    label: "Mobile",    short: "MB", type: "max",  inherits: "tablet",  defaultPx:  576, previewWidth:  375 },
  { key: "mobileSm",  label: "Small",     short: "SM", type: "max",  inherits: "mobile",  defaultPx:  400, previewWidth:  360 }
];

export var DEVICE_KEYS = DEVICES.map(function (d) { return d.key; });

export function deviceMeta(key) {
  for (var i = 0; i < DEVICES.length; i++) {
    if (DEVICES[i].key === key) return DEVICES[i];
  }
  return null;
}

export function isDevice(key) {
  return !!deviceMeta(key);
}

export function defaultBreakpoints() {
  var bp = {};
  DEVICES.forEach(function (d) { if (d.defaultPx != null) bp[d.key] = d.defaultPx; });
  return bp;
}

// Fills in any tier a stored document predates, so a saved v2 file that only
// knows tablet and mobile still resolves the full ladder.
export function normalizeBreakpoints(bp) {
  return Object.assign(defaultBreakpoints(), bp || {});
}

// base -> ... -> device. Applying this chain in order IS the cascade.
export function deviceChain(key) {
  var chain = [], cur = isDevice(key) ? key : "desktop";
  while (cur) {
    chain.unshift(cur);
    var m = deviceMeta(cur);
    cur = m ? m.inherits : null;
  }
  return chain;
}

// An empty override object per tier, used when creating a node.
export function emptyResponsive() {
  var r = {};
  DEVICE_KEYS.forEach(function (k) { r[k] = {}; });
  return r;
}

// ==========================================================================
// Responsive Property Resolver
// ==========================================================================
export function getEffectiveProps(node, device) {
  var chain = deviceChain(device || "desktop");
  var base = Object.assign({}, defaultDesktopProps, node.responsive.desktop || {});

  // BUG 2 FIX: Use hasOwnProperty so that 0, false, and "" are valid overrides
  function applyOverrides(overrides) {
    if (!overrides) return;
    var keys = Object.keys(overrides);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (overrides[k] !== undefined) {
        base[k] = overrides[k];
      }
    }
  }

  // chain[0] is always the base, already folded into `base` above.
  for (var ci = 1; ci < chain.length; ci++) {
    applyOverrides(node.responsive[chain[ci]]);
  }

  // Phase 2 Migration: old single-value padding → 4-side
  if (base.padding != null && typeof base.padding === "number") {
    if (base.paddingTop == null || base.paddingTop === defaultDesktopProps.paddingTop) {
      base.paddingTop = base.paddingRight = base.paddingBottom = base.paddingLeft = base.padding;
    }
    base.paddingLinked = true;
  }
  // Phase 2 Migration: old single-value margin → 4-side
  if (base.margin != null && typeof base.margin === "string" && base.margin !== "") {
    // Already in CSS shorthand form, keep as-is for now
  }

  return base;
}

// ==========================================================================
// Live Code Generator (Pure Responsive HTML & CSS)
// ==========================================================================
export function generateCleanHtml(node, depth, classCount) {
  if (!depth) depth = 0;
  if (!classCount) classCount = {};
  var indent = "  ".repeat(depth);

  if (node.id === "root") {
    var out = "";
    node.children.forEach(function (child) {
      out += generateCleanHtml(child, depth, classCount);
    });
    return out;
  }

  var baseClass = safeClass(node.customClass);
  if (!classCount[baseClass]) classCount[baseClass] = 0;
  classCount[baseClass]++;
  var clsName = classCount[baseClass] > 1 ? baseClass + "-" + classCount[baseClass] : baseClass;
  var cls = ' class="' + clsName + '"';
  var dirAttr = (node.responsive.desktop && node.responsive.desktop.direction === "rtl") ? ' dir="rtl"' : '';
  var out = "";

  out += indent + "<div" + cls + dirAttr + ">\n";
  if (node.children.length) {
    node.children.forEach(function (child) {
      out += generateCleanHtml(child, depth + 1, classCount);
    });
  }
  out += indent + "</div>\n";
  return out;
}

// Neutral values used to *undo* a declaration at a breakpoint. When a property
// is emitted for one device and not the next, the cascade would otherwise leak
// the wider rule down. Only consulted inside media blocks.
var NEUTRAL = {
  "width": "auto", "height": "auto", "max-width": "none", "max-height": "none",
  "aspect-ratio": "auto", "margin": "0", "position": "static",
  "top": "auto", "right": "auto", "bottom": "auto", "left": "auto", "z-index": "auto",
  "overflow": "visible", "overflow-x": "visible", "overflow-y": "visible",
  "background-color": "transparent", "border": "none", "border-radius": "0",
  "box-shadow": "none", "opacity": "1",
  "transform": "none", "transition": "none",
  "backdrop-filter": "none", "-webkit-backdrop-filter": "none",
  "grid-column": "auto", "order": "0", "flex-basis": "auto", "flex-grow": "0", "flex-shrink": "1",
  "justify-self": "stretch", "align-self": "auto", "justify-items": "stretch",
  // Neutrals mirror this generator's own defaults, not the CSS-wide initial
  // values, so undoing a rule lands back where the base block would have been.
  "align-content": "start", "justify-content": "flex-start", "align-items": "stretch",
  "text-align": "left", "direction": "inherit",
  "flex-wrap": "nowrap", "grid-template-columns": "none"
};

// Every declaration this generator can emit, in output order. One list, used
// for desktop AND for both breakpoints — a property added here is automatically
// overridable at every device, so the override blocks can no longer fall behind
// the base block the way two hand-maintained if-chains did.
function declarationsFor(props, ctx) {
  var p = props, o = [];

  // --- display + container-level alignment --------------------------------
  // `hidden` is the display value, not a separate flag appended after the diff.
  // Being part of the declaration list is what lets a breakpoint turn a div
  // back ON: a div hidden on desktop and visible on mobile emits display:none
  // in the base rule and display:flex in the mobile block.
  var shown = p.hidden ? "none" : null;
  if (p.display === "grid") {
    o.push("display: " + (shown || "grid") + ";");
    if (p.gridAutoMode) {
      o.push("grid-template-columns: repeat(" + p.gridAutoMode + ", minmax(min(" + (p.gridMinColWidth || "200px") + ", 100%), 1fr));");
    } else if (p.customColumns) {
      o.push("grid-template-columns: " + p.customColumns + ";");
    } else {
      o.push("grid-template-columns: repeat(" + (p.columns || 1) + ", 1fr);");
    }
    o.push("gap: " + (p.gap != null ? p.gap : 16) + "px;");
    if (p.rowGap != null && p.rowGap !== p.gap) o.push("row-gap: " + p.rowGap + "px;");
    if (p.justifyItems && p.justifyItems !== "stretch") o.push("justify-items: " + p.justifyItems + ";");
    if (p.alignContent && p.alignContent !== "start") o.push("align-content: " + p.alignContent + ";");
    // A grid distributes its tracks with justify-content and aligns items in
    // their row with align-items, exactly like flex does.
    if (p.justifyContent && p.justifyContent !== "flex-start") o.push("justify-content: " + p.justifyContent + ";");
    if (p.alignItems && p.alignItems !== "stretch") o.push("align-items: " + p.alignItems + ";");
  } else if (p.display === "flex") {
    o.push("display: " + (shown || "flex") + ";");
    if (p.flexDirection) o.push("flex-direction: " + p.flexDirection + ";");
    if (p.flexWrap) o.push("flex-wrap: " + p.flexWrap + ";");
    if (p.justifyContent) o.push("justify-content: " + p.justifyContent + ";");
    if (p.alignItems) o.push("align-items: " + p.alignItems + ";");
    o.push("gap: " + (p.gap != null ? p.gap : 16) + "px;");
    // align-content only does anything once the lines can wrap.
    if (p.flexWrap === "wrap" && p.alignContent && p.alignContent !== "start") {
      o.push("align-content: " + p.alignContent + ";");
    }
  } else {
    o.push("display: " + (shown || "block") + ";");
  }

  // --- self alignment ------------------------------------------------------
  if (p.horizontalAlign === "center") {
    o.push("margin-left: auto;", "margin-right: auto;");
    if (ctx.gridParent) o.push("justify-self: center;");
  } else if (p.horizontalAlign === "right") {
    o.push("margin-left: auto;", "margin-right: 0;");
    if (ctx.gridParent) o.push("justify-self: end;");
  } else if (p.horizontalAlign === "left") {
    o.push("margin-left: 0;", "margin-right: auto;");
    if (ctx.gridParent) o.push("justify-self: start;");
  }
  // Cross-axis self alignment: lets one child opt out of the parent's
  // align-items in either a flex or a grid container.
  if (p.alignSelf) o.push("align-self: " + p.alignSelf + ";");

  // --- sizing --------------------------------------------------------------
  if (p.width) o.push("width: " + p.width + ";");
  if (p.height) o.push("height: " + p.height + ";");
  if (p.minHeight) o.push("min-height: " + p.minHeight + "px;");
  if (p.maxWidth) o.push("max-width: " + p.maxWidth + ";");
  if (p.maxHeight) o.push("max-height: " + p.maxHeight + ";");
  if (p.aspectRatio) o.push("aspect-ratio: " + p.aspectRatio + ";");

  // --- spacing -------------------------------------------------------------
  if (p.paddingTop != null || p.paddingRight != null || p.paddingBottom != null || p.paddingLeft != null) {
    var pt = p.paddingTop != null ? p.paddingTop : 16;
    var pr = p.paddingRight != null ? p.paddingRight : 16;
    var pb = p.paddingBottom != null ? p.paddingBottom : 16;
    var pl = p.paddingLeft != null ? p.paddingLeft : 16;
    if (pt === pr && pr === pb && pb === pl) o.push("padding: " + pt + "px;");
    else o.push("padding: " + pt + "px " + pr + "px " + pb + "px " + pl + "px;");
  } else if (p.padding != null) {
    o.push("padding: " + p.padding + "px;");
  }
  if (p.marginTop || p.marginRight || p.marginBottom || p.marginLeft) {
    o.push("margin: " + (p.marginTop || "0") + " " + (p.marginRight || "0") + " " +
           (p.marginBottom || "0") + " " + (p.marginLeft || "0") + ";");
  }

  // --- position ------------------------------------------------------------
  if (p.position && p.position !== "static") {
    o.push("position: " + p.position + ";");
    if (p.top) o.push("top: " + p.top + ";");
    if (p.right) o.push("right: " + p.right + ";");
    if (p.bottom) o.push("bottom: " + p.bottom + ";");
    if (p.left) o.push("left: " + p.left + ";");
    if (p.zIndex) o.push("z-index: " + p.zIndex + ";");
  }
  if (p.overflow && p.overflow !== "visible") o.push("overflow: " + p.overflow + ";");
  if (p.overflowX) o.push("overflow-x: " + p.overflowX + ";");
  if (p.overflowY) o.push("overflow-y: " + p.overflowY + ";");

  // --- visual --------------------------------------------------------------
  if (p.backgroundColor) o.push("background-color: " + p.backgroundColor + ";");
  if (p.borderWidth && p.borderStyle && p.borderColor) o.push("border: " + p.borderWidth + " " + p.borderStyle + " " + p.borderColor + ";");
  if (p.borderRadius) o.push("border-radius: " + p.borderRadius + ";");
  if (p.boxShadow) o.push("box-shadow: " + p.boxShadow + ";");
  if (p.opacity && p.opacity !== "1") o.push("opacity: " + p.opacity + ";");
  if (p.transform) o.push("transform: " + p.transform + ";");
  if (p.transition) o.push("transition: " + p.transition + ";");
  if (p.backdropFilter) {
    // Safari needed the prefix until 18; both are emitted so the output stays
    // paste-anywhere without a build step.
    o.push("-webkit-backdrop-filter: " + p.backdropFilter + ";");
    o.push("backdrop-filter: " + p.backdropFilter + ";");
  }

  // --- as a child of its parent -------------------------------------------
  // Unconditional. A div must never be widened past its allotted space by
  // whatever the developer drops inside it. On a block box this is already the
  // computed default, so it costs nothing; on a flex or grid item it is the
  // difference between holding and bursting. It is deliberately NOT
  // context-dependent: when a parent flips from row to column at a breakpoint,
  // a `min-width: auto` neutral would hand the burst straight back.
  o.push("min-width: 0;");
  if (p.span && p.span > 1) o.push("grid-column: span " + p.span + ";");
  // flex-grow/shrink/basis style a flex ITEM, so they depend on the PARENT being
  // flex — not on this node being flex. The old test was inverted: a flex
  // container inside a block parent got flex-grow (inert), while a real flex item
  // got none.
  if (ctx.flexParent) {
    if (p.flexGrow != null) o.push("flex-grow: " + p.flexGrow + ";");
    if (p.flexShrink != null && p.flexShrink !== 1) o.push("flex-shrink: " + p.flexShrink + ";");
    if (p.flexBasis) o.push("flex-basis: " + p.flexBasis + ";");
  }
  if (p.order != null && p.order !== 0) o.push("order: " + p.order + ";");
  if (p.textAlign && p.textAlign !== "left") o.push("text-align: " + p.textAlign + ";");
  if (p.direction) o.push("direction: " + p.direction + ";");

  return o;
}

function declMap(decls) {
  var m = {};
  for (var i = 0; i < decls.length; i++) {
    var d = decls[i], c = d.indexOf(":");
    m[d.slice(0, c)] = d.slice(c + 1, d.length - 1).trim();
  }
  return m;
}

// What a narrower breakpoint must restate to differ from the wider one.
function overrideDecls(prevDecls, currDecls) {
  var prev = declMap(prevDecls), curr = declMap(currDecls), out = [];
  for (var i = 0; i < currDecls.length; i++) {
    var d = currDecls[i], k = d.slice(0, d.indexOf(":"));
    if (prev[k] !== curr[k]) out.push(d);
  }
  for (var k2 in prev) {
    if (!(k2 in curr) && NEUTRAL[k2] !== undefined) out.push(k2 + ": " + NEUTRAL[k2] + ";");
  }
  return out;
}

export function generateResponsiveCss(root, breakpoints) {
  var bp = normalizeBreakpoints(breakpoints);
  var rules = {};
  DEVICE_KEYS.forEach(function (k) { rules[k] = []; });
  var classCount = {};

  walk(root, function (node, parent) {
    if (node.id === "root") return;
    var baseClass = safeClass(node.customClass);
    if (!classCount[baseClass]) classCount[baseClass] = 0;
    classCount[baseClass]++;
    var clsName = classCount[baseClass] > 1 ? baseClass + "-" + classCount[baseClass] : baseClass;

    // Parent context is resolved per device, because a parent can switch
    // between grid, flex-row and flex-column at any tier of the ladder.
    function ctxFor(device) {
      var pp = parent ? getEffectiveProps(parent, device) : null;
      return {
        gridParent: isGrid(pp),
        rowParent: isFlexRow(pp),
        flexParent: !!pp && pp.display === "flex"
      };
    }

    var decls = {};
    DEVICE_KEYS.forEach(function (k) {
      decls[k] = declarationsFor(getEffectiveProps(node, k), ctxFor(k));
    });

    // Each tier diffs against the tier it inherits from, never against the
    // base: at 400px the mobile rule is already in force, so a small-phone
    // rule that restated the whole cascade would just repeat it.
    DEVICES.forEach(function (d) {
      if (d.type === "base") {
        if (decls[d.key].length) {
          rules[d.key].push("." + clsName + " {\n  " + decls[d.key].join("\n  ") + "\n}");
        }
        return;
      }
      var o = overrideDecls(decls[d.inherits], decls[d.key]);
      if (o.length) rules[d.key].push("  ." + clsName + " {\n    " + o.join("\n    ") + "\n  }");
    });
  });

  var cssText = "/* Reset & Global */\n" +
    "*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }\n" +
    "html, body {\n  width: 100%;\n  min-height: 100vh;\n  background-color: #0a0d12;\n  color: #f0f6fc;\n" +
    "  font-family: system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif;\n" +
    "  overflow-x: hidden;\n" +
    "  /* Content safety: whatever goes inside these divs must not burst them. */\n" +
    "  overflow-wrap: break-word;\n}\n\n" +
    "/* No div may exceed its container, whatever is placed inside it. An\n" +
    "   element selector loses to every class rule below, so an authored\n" +
    "   max-width still wins where one is set on purpose. */\n" +
    "div { max-width: 100%; }\n\n" +
    "/* Media never exceeds its container, whatever its intrinsic size. */\n" +
    "img, video, canvas, iframe, svg, table { max-width: 100%; }\n" +
    "img, video { height: auto; }\n\n";
  cssText += "/* Desktop Base Styles */\n";
  cssText += rules.desktop.join("\n\n") + "\n\n";

  // Ladder order: the `min` tier sits directly after the base (no `max` block
  // applies at that width anyway), then every `max` tier widest-first so a
  // narrower one always overrides the one above it.
  DEVICES.forEach(function (d) {
    if (d.type === "base" || !rules[d.key].length) return;
    var query = (d.type === "min" ? "min-width: " : "max-width: ") + bp[d.key] + "px";
    cssText += "/* " + d.label + " (" + query + ") */\n";
    cssText += "@media (" + query + ") {\n" + rules[d.key].join("\n\n") + "\n}\n\n";
  });

  return cssText.replace(/\n+$/, "\n");
}

export function generateFullHtmlDocument(root, breakpoints) {
  var pureHtml = generateCleanHtml(root, 1);
  var responsiveCss = generateResponsiveCss(root, breakpoints);

  return '<!DOCTYPE html>\n<html lang="en">\n<head>\n' +
    '  <meta charset="UTF-8">\n' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '  <title>Pure Responsive DIV Structure</title>\n' +
    '  <style>\n' +
    responsiveCss +
    '  </style>\n</head>\n<body>\n\n' +
    pureHtml +
    '\n</body>\n</html>';
}
