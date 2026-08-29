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

    // Flex/Grid child
    span: 1,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "",            // "auto", "0", "200px"
    order: 0,
    hidden: false,
    direction: ""            // "" (inherit) | "ltr" | "rtl"
  };

// A flex item only shrinks below its content width when min-width is cleared.
// Without this, a nowrap row bursts its container and the content is clipped.
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
// Responsive Property Resolver
// ==========================================================================
export function getEffectiveProps(node, device) {
  var dev = device || "desktop";
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

  if (dev === "tablet") {
    applyOverrides(node.responsive.tablet);
  } else if (dev === "mobile") {
    applyOverrides(node.responsive.tablet);
    applyOverrides(node.responsive.mobile);
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

  var baseClass = node.customClass || "div-box";
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

export function generateResponsiveCss(root, breakpoints) {
  var rules = { desktop: [], tablet: [], mobile: [] };
  var classCount = {};
  var bp = breakpoints || { tablet: 992, mobile: 576 };

  walk(root, function (node, parent) {
    if (node.id === "root") return;
    var baseClass = node.customClass || "div-box";
    if (!classCount[baseClass]) classCount[baseClass] = 0;
    classCount[baseClass]++;
    var clsName = classCount[baseClass] > 1 ? baseClass + "-" + classCount[baseClass] : baseClass;

    var d = node.responsive.desktop || {};
    var t = node.responsive.tablet || {};
    var m = node.responsive.mobile || {};

    // Flex-item shrink context, resolved per device because a parent can
    // switch between row and column at a breakpoint.
    var dRow = parent ? isFlexRow(getEffectiveProps(parent, "desktop")) : false;
    var tRow = parent ? isFlexRow(getEffectiveProps(parent, "tablet")) : false;
    var mRow = parent ? isFlexRow(getEffectiveProps(parent, "mobile")) : false;
    var dGrid = parent ? isGrid(getEffectiveProps(parent, "desktop")) : false;
    var tGrid = parent ? isGrid(getEffectiveProps(parent, "tablet")) : false;
    var mGrid = parent ? isGrid(getEffectiveProps(parent, "mobile")) : false;

    // --- Desktop ---
    var dCss = [];
    if (d.display === "grid") {
      dCss.push("  display: grid;");
      if (d.gridAutoMode) {
        dCss.push("  grid-template-columns: repeat(" + d.gridAutoMode + ", minmax(min(" + (d.gridMinColWidth || "200px") + ", 100%), 1fr));");
      } else if (d.customColumns) {
        dCss.push("  grid-template-columns: " + d.customColumns + ";");
      } else {
        dCss.push("  grid-template-columns: repeat(" + (d.columns || 1) + ", 1fr);");
      }
      dCss.push("  gap: " + (d.gap != null ? d.gap : 16) + "px;");
      if (d.rowGap != null && d.rowGap !== d.gap) dCss.push("  row-gap: " + d.rowGap + "px;");
      if (d.justifyItems && d.justifyItems !== "stretch") dCss.push("  justify-items: " + d.justifyItems + ";");
      if (d.alignContent && d.alignContent !== "start") dCss.push("  align-content: " + d.alignContent + ";");
    } else if (d.display === "flex") {
      dCss.push("  display: flex;");
      if (d.flexDirection) dCss.push("  flex-direction: " + d.flexDirection + ";");
      if (d.flexWrap) dCss.push("  flex-wrap: " + d.flexWrap + ";");
      if (d.justifyContent) dCss.push("  justify-content: " + d.justifyContent + ";");
      if (d.alignItems) dCss.push("  align-items: " + d.alignItems + ";");
      dCss.push("  gap: " + (d.gap != null ? d.gap : 16) + "px;");
    } else {
      dCss.push("  display: block;");
    }

    // Alignment
    if (d.horizontalAlign === "center") dCss.push("  margin-left: auto;\n  margin-right: auto;" + (dGrid ? "\n  justify-self: center;" : ""));
    else if (d.horizontalAlign === "right") dCss.push("  margin-left: auto;\n  margin-right: 0;" + (dGrid ? "\n  justify-self: end;" : ""));
    else if (d.horizontalAlign === "left") dCss.push("  margin-left: 0;\n  margin-right: auto;" + (dGrid ? "\n  justify-self: start;" : ""));

    // Sizing
    if (d.width) dCss.push("  width: " + d.width + ";");
    if (d.height) dCss.push("  height: " + d.height + ";");
    if (d.minHeight) dCss.push("  min-height: " + d.minHeight + "px;");
    if (d.maxWidth) dCss.push("  max-width: " + d.maxWidth + ";");
    if (d.maxHeight) dCss.push("  max-height: " + d.maxHeight + ";");
    if (d.aspectRatio) dCss.push("  aspect-ratio: " + d.aspectRatio + ";");

    // 4-side spacing
    if (d.paddingTop != null || d.paddingRight != null || d.paddingBottom != null || d.paddingLeft != null) {
      var pt = d.paddingTop != null ? d.paddingTop : 16;
      var pr = d.paddingRight != null ? d.paddingRight : 16;
      var pb = d.paddingBottom != null ? d.paddingBottom : 16;
      var pl = d.paddingLeft != null ? d.paddingLeft : 16;
      if (pt === pr && pr === pb && pb === pl) dCss.push("  padding: " + pt + "px;");
      else dCss.push("  padding: " + pt + "px " + pr + "px " + pb + "px " + pl + "px;");
    } else if (d.padding != null) {
      dCss.push("  padding: " + d.padding + "px;");
    }
    if (d.marginTop || d.marginRight || d.marginBottom || d.marginLeft) {
      dCss.push("  margin: " + (d.marginTop || "0") + " " + (d.marginRight || "0") + " " + (d.marginBottom || "0") + " " + (d.marginLeft || "0") + ";");
    }

    // Position
    if (d.position && d.position !== "static") {
      dCss.push("  position: " + d.position + ";");
      if (d.top) dCss.push("  top: " + d.top + ";");
      if (d.right) dCss.push("  right: " + d.right + ";");
      if (d.bottom) dCss.push("  bottom: " + d.bottom + ";");
      if (d.left) dCss.push("  left: " + d.left + ";");
      if (d.zIndex) dCss.push("  z-index: " + d.zIndex + ";");
    }
    if (d.overflow && d.overflow !== "visible") dCss.push("  overflow: " + d.overflow + ";");
    if (d.overflowX) dCss.push("  overflow-x: " + d.overflowX + ";");
    if (d.overflowY) dCss.push("  overflow-y: " + d.overflowY + ";");

    // Visual
    if (d.backgroundColor) dCss.push("  background-color: " + d.backgroundColor + ";");
    if (d.borderWidth && d.borderStyle && d.borderColor) dCss.push("  border: " + d.borderWidth + " " + d.borderStyle + " " + d.borderColor + ";");
    if (d.borderRadius) dCss.push("  border-radius: " + d.borderRadius + ";");
    if (d.boxShadow) dCss.push("  box-shadow: " + d.boxShadow + ";");
    if (d.opacity && d.opacity !== "1") dCss.push("  opacity: " + d.opacity + ";");

    // Grid/Flex child
    if (dRow) dCss.push("  min-width: 0;");
    if (d.span && d.span > 1) dCss.push("  grid-column: span " + d.span + ";");
    if (d.display === "flex" && d.flexGrow != null) dCss.push("  flex-grow: " + d.flexGrow + ";");
    if (d.flexShrink != null && d.flexShrink !== 1) dCss.push("  flex-shrink: " + d.flexShrink + ";");
    if (d.flexBasis) dCss.push("  flex-basis: " + d.flexBasis + ";");
    if (d.order != null && d.order !== 0) dCss.push("  order: " + d.order + ";");
    if (d.textAlign && d.textAlign !== "left") dCss.push("  text-align: " + d.textAlign + ";");
    if (d.direction) dCss.push("  direction: " + d.direction + ";");

    if (dCss.length) rules.desktop.push("." + clsName + " {\n" + dCss.join("\n") + "\n}");

    // --- Tablet overrides ---
    var tCss = [];
    if (t.display && t.display !== d.display) tCss.push("    display: " + t.display + ";");
    if (t.customColumns && t.customColumns !== d.customColumns) {
      tCss.push("    grid-template-columns: " + t.customColumns + ";");
    } else if (t.gridAutoMode && t.gridAutoMode !== d.gridAutoMode) {
      tCss.push("    grid-template-columns: repeat(" + t.gridAutoMode + ", minmax(min(" + (t.gridMinColWidth || d.gridMinColWidth || "200px") + ", 100%), 1fr));");
    } else if (t.columns && t.columns !== d.columns) {
      tCss.push("    grid-template-columns: repeat(" + t.columns + ", 1fr);");
    }
    if (t.flexDirection && t.flexDirection !== d.flexDirection) tCss.push("    flex-direction: " + t.flexDirection + ";");
    if (t.horizontalAlign && t.horizontalAlign !== d.horizontalAlign) {
      if (t.horizontalAlign === "center") tCss.push("    margin-left: auto;\n    margin-right: auto;" + (tGrid ? "\n    justify-self: center;" : ""));
      else if (t.horizontalAlign === "right") tCss.push("    margin-left: auto;\n    margin-right: 0;" + (tGrid ? "\n    justify-self: end;" : ""));
      else if (t.horizontalAlign === "left") tCss.push("    margin-left: 0;\n    margin-right: auto;" + (tGrid ? "\n    justify-self: start;" : ""));
      else if (t.horizontalAlign === "stretch") tCss.push("    margin-left: 0;\n    margin-right: 0;" + (tGrid ? "\n    justify-self: stretch;" : ""));
    }
    if (t.width && t.width !== d.width) tCss.push("    width: " + t.width + ";");
    if (t.height && t.height !== d.height) tCss.push("    height: " + t.height + ";");
    if (t.gap != null && t.gap !== d.gap) tCss.push("    gap: " + t.gap + "px;");
    if (t.paddingTop != null) tCss.push("    padding: " + (t.paddingTop||0) + "px " + (t.paddingRight||0) + "px " + (t.paddingBottom||0) + "px " + (t.paddingLeft||0) + "px;");
    if (t.position && t.position !== d.position) tCss.push("    position: " + t.position + ";");
    if (t.overflow && t.overflow !== d.overflow) tCss.push("    overflow: " + t.overflow + ";");
    if (t.backgroundColor && t.backgroundColor !== d.backgroundColor) tCss.push("    background-color: " + t.backgroundColor + ";");
    if (t.borderRadius && t.borderRadius !== d.borderRadius) tCss.push("    border-radius: " + t.borderRadius + ";");
    if (t.span != null && t.span !== d.span) tCss.push("    grid-column: span " + t.span + ";");
    if (t.order != null && t.order !== d.order) tCss.push("    order: " + t.order + ";");
    if (t.direction && t.direction !== d.direction) tCss.push("    direction: " + t.direction + ";");
    if (t.opacity && t.opacity !== d.opacity) tCss.push("    opacity: " + t.opacity + ";");
    if (t.boxShadow && t.boxShadow !== d.boxShadow) tCss.push("    box-shadow: " + t.boxShadow + ";");
    if (t.aspectRatio && t.aspectRatio !== d.aspectRatio) tCss.push("    aspect-ratio: " + t.aspectRatio + ";");
    if (t.borderWidth && t.borderStyle && t.borderColor && (t.borderWidth !== d.borderWidth || t.borderStyle !== d.borderStyle || t.borderColor !== d.borderColor)) tCss.push("    border: " + t.borderWidth + " " + t.borderStyle + " " + t.borderColor + ";");
    if (t.flexBasis && t.flexBasis !== d.flexBasis) tCss.push("    flex-basis: " + t.flexBasis + ";");
    if (t.flexShrink != null && t.flexShrink !== d.flexShrink) tCss.push("    flex-shrink: " + t.flexShrink + ";");
    if (t.textAlign && t.textAlign !== d.textAlign) tCss.push("    text-align: " + t.textAlign + ";");
    if (t.maxHeight && t.maxHeight !== d.maxHeight) tCss.push("    max-height: " + t.maxHeight + ";");
    if (t.minHeight && t.minHeight !== d.minHeight) tCss.push("    min-height: " + t.minHeight + "px;");
    if (t.overflowX && t.overflowX !== d.overflowX) tCss.push("    overflow-x: " + t.overflowX + ";");
    if (t.overflowY && t.overflowY !== d.overflowY) tCss.push("    overflow-y: " + t.overflowY + ";");
    if (tRow !== dRow) tCss.push("    min-width: " + (tRow ? "0" : "auto") + ";");
    if (t.hidden) tCss.push("    display: none;");
    if (tCss.length) rules.tablet.push("  ." + clsName + " {\n" + tCss.join("\n") + "\n  }");

    // --- Mobile overrides ---
    var mCss = [];
    if (m.display && m.display !== d.display) mCss.push("    display: " + m.display + ";");
    if (m.customColumns && m.customColumns !== d.customColumns) {
      mCss.push("    grid-template-columns: " + m.customColumns + ";");
    } else if (m.gridAutoMode && m.gridAutoMode !== d.gridAutoMode) {
      mCss.push("    grid-template-columns: repeat(" + m.gridAutoMode + ", minmax(min(" + (m.gridMinColWidth || d.gridMinColWidth || "200px") + ", 100%), 1fr));");
    } else if (m.columns && m.columns !== d.columns) {
      mCss.push("    grid-template-columns: repeat(" + m.columns + ", 1fr);");
    }
    if (m.flexDirection && m.flexDirection !== d.flexDirection) mCss.push("    flex-direction: " + m.flexDirection + ";");
    if (m.horizontalAlign && m.horizontalAlign !== d.horizontalAlign) {
      if (m.horizontalAlign === "center") mCss.push("    margin-left: auto;\n    margin-right: auto;" + (mGrid ? "\n    justify-self: center;" : ""));
      else if (m.horizontalAlign === "right") mCss.push("    margin-left: auto;\n    margin-right: 0;" + (mGrid ? "\n    justify-self: end;" : ""));
      else if (m.horizontalAlign === "left") mCss.push("    margin-left: 0;\n    margin-right: auto;" + (mGrid ? "\n    justify-self: start;" : ""));
      else if (m.horizontalAlign === "stretch") mCss.push("    margin-left: 0;\n    margin-right: 0;" + (mGrid ? "\n    justify-self: stretch;" : ""));
    }
    if (m.width && m.width !== d.width) mCss.push("    width: " + m.width + ";");
    if (m.height && m.height !== d.height) mCss.push("    height: " + m.height + ";");
    if (m.gap != null && m.gap !== d.gap) mCss.push("    gap: " + m.gap + "px;");
    if (m.paddingTop != null) mCss.push("    padding: " + (m.paddingTop||0) + "px " + (m.paddingRight||0) + "px " + (m.paddingBottom||0) + "px " + (m.paddingLeft||0) + "px;");
    if (m.position && m.position !== d.position) mCss.push("    position: " + m.position + ";");
    if (m.overflow && m.overflow !== d.overflow) mCss.push("    overflow: " + m.overflow + ";");
    if (m.backgroundColor && m.backgroundColor !== d.backgroundColor) mCss.push("    background-color: " + m.backgroundColor + ";");
    if (m.borderRadius && m.borderRadius !== d.borderRadius) mCss.push("    border-radius: " + m.borderRadius + ";");
    if (m.span != null && m.span !== d.span) mCss.push("    grid-column: span " + m.span + ";");
    if (m.order != null && m.order !== d.order) mCss.push("    order: " + m.order + ";");
    if (m.direction && m.direction !== d.direction) mCss.push("    direction: " + m.direction + ";");
    if (m.opacity && m.opacity !== d.opacity) mCss.push("    opacity: " + m.opacity + ";");
    if (m.boxShadow && m.boxShadow !== d.boxShadow) mCss.push("    box-shadow: " + m.boxShadow + ";");
    if (m.aspectRatio && m.aspectRatio !== d.aspectRatio) mCss.push("    aspect-ratio: " + m.aspectRatio + ";");
    if (m.borderWidth && m.borderStyle && m.borderColor && (m.borderWidth !== d.borderWidth || m.borderStyle !== d.borderStyle || m.borderColor !== d.borderColor)) mCss.push("    border: " + m.borderWidth + " " + m.borderStyle + " " + m.borderColor + ";");
    if (m.flexBasis && m.flexBasis !== d.flexBasis) mCss.push("    flex-basis: " + m.flexBasis + ";");
    if (m.flexShrink != null && m.flexShrink !== d.flexShrink) mCss.push("    flex-shrink: " + m.flexShrink + ";");
    if (m.textAlign && m.textAlign !== d.textAlign) mCss.push("    text-align: " + m.textAlign + ";");
    if (m.maxHeight && m.maxHeight !== d.maxHeight) mCss.push("    max-height: " + m.maxHeight + ";");
    if (m.minHeight && m.minHeight !== d.minHeight) mCss.push("    min-height: " + m.minHeight + "px;");
    if (m.overflowX && m.overflowX !== d.overflowX) mCss.push("    overflow-x: " + m.overflowX + ";");
    if (m.overflowY && m.overflowY !== d.overflowY) mCss.push("    overflow-y: " + m.overflowY + ";");
    if (mRow !== tRow) mCss.push("    min-width: " + (mRow ? "0" : "auto") + ";");
    if (m.hidden) mCss.push("    display: none;");
    if (mCss.length) rules.mobile.push("  ." + clsName + " {\n" + mCss.join("\n") + "\n  }");
  });

  var cssText = "/* Reset & Global */\n*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }\nhtml, body {\n  width: 100%;\n  min-height: 100vh;\n  background-color: #0a0d12;\n  color: #f0f6fc;\n  font-family: system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif;\n  overflow-x: hidden;\n}\n\n";
  cssText += "/* Desktop Base Styles */\n";
  cssText += rules.desktop.join("\n\n") + "\n\n";
  if (rules.tablet.length) {
    cssText += "/* Tablet (max-width: " + bp.tablet + "px) */\n";
    cssText += "@media (max-width: " + bp.tablet + "px) {\n" + rules.tablet.join("\n\n") + "\n}\n\n";
  }
  if (rules.mobile.length) {
    cssText += "/* Mobile (max-width: " + bp.mobile + "px) */\n";
    cssText += "@media (max-width: " + bp.mobile + "px) {\n" + rules.mobile.join("\n\n") + "\n}\n";
  }
  return cssText;
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
