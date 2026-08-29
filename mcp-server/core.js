// ============================================================================
// core.js — Server-side builder logic (no DOM, pure data)
// Extracted from builder.js for MCP server use
// ============================================================================

var idCounter = 0;

// ============================================================================
// History (Undo/Redo)
// ============================================================================
var History = {
  past: [],
  future: [],
  limit: 50,
  snapshot: function () {
    return JSON.parse(JSON.stringify(state.root));
  },
  push: function () {
    this.past.push(this.snapshot());
    if (this.past.length > this.limit) this.past.shift();
    this.future.length = 0;
  },
  undo: function () {
    if (!this.past.length) return false;
    this.future.push(this.snapshot());
    state.root = this.past.pop();
    return true;
  },
  redo: function () {
    if (!this.future.length) return false;
    this.past.push(this.snapshot());
    state.root = this.future.pop();
    return true;
  },
  canUndo: function () { return this.past.length > 0; },
  canRedo: function () { return this.future.length > 0; }
};

export function pushHistory() { History.push(); }
export function undo() { return History.undo(); }
export function redo() { return History.redo(); }
export function historyStatus() { return { canUndo: History.canUndo(), canRedo: History.canRedo(), undoCount: History.past.length, redoCount: History.future.length }; }

export var defaultDesktopProps = {
  display: "block",
  columns: 1,
  customColumns: "",
  gridAutoMode: "",
  gridMinColWidth: "200px",
  justifyItems: "stretch",
  alignContent: "start",
  flexDirection: "row",
  flexWrap: "nowrap",
  justifyContent: "flex-start",
  alignItems: "stretch",
  gap: 16,
  rowGap: 16,
  horizontalAlign: "stretch",
  width: "",
  height: "",
  maxWidth: "",
  maxHeight: "",
  minHeight: 60,
  aspectRatio: "",
  textAlign: "left",
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
  position: "static",
  top: "",
  right: "",
  bottom: "",
  left: "",
  zIndex: "",
  overflow: "visible",
  overflowX: "",
  overflowY: "",
  backgroundColor: "",
  borderWidth: "",
  borderStyle: "",
  borderColor: "",
  borderRadius: "",
  boxShadow: "",
  opacity: "",
  span: 1,
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: "",
  order: 0,
  hidden: false,
  direction: ""
};

// ============================================================================
// State
// ============================================================================
export var state = {
  device: "desktop",
  selectedId: null,
  breakpoints: { tablet: 992, mobile: 576 },
  root: {
    id: "root",
    type: "div",
    name: "Page Root",
    customClass: "page-layout",
    responsive: {
      desktop: {
        display: "flex",
        flexDirection: "column",
        gap: 20,
        paddingTop: 20,
        paddingRight: 20,
        paddingBottom: 20,
        paddingLeft: 20,
        minHeight: 600,
        justifyContent: "flex-start",
        alignItems: "stretch",
        horizontalAlign: "stretch",
        maxWidth: ""
      },
      tablet: {},
      mobile: {}
    },
    children: []
  }
};

// ============================================================================
// Tree Utilities
// ============================================================================
function uid() {
  return "div_" + Date.now().toString(36) + "_" + (++idCounter);
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function findNode(id, node) {
  if (!node) node = state.root;
  if (node.id === id) return node;
  for (var i = 0; i < node.children.length; i++) {
    var found = findNode(id, node.children[i]);
    if (found) return found;
  }
  return null;
}

export function findParent(id, node) {
  if (!node) node = state.root;
  for (var i = 0; i < node.children.length; i++) {
    if (node.children[i].id === id) return node;
    var found = findParent(id, node.children[i]);
    if (found) return found;
  }
  return null;
}

export function walk(node, fn) {
  fn(node);
  if (node.children) {
    node.children.forEach(function (c) { walk(c, fn); });
  }
}

export function getEffectiveProps(node, device) {
  var dev = device || state.device;
  var base = Object.assign({}, defaultDesktopProps, node.responsive.desktop || {});

  function applyOverrides(overrides) {
    if (!overrides) return;
    var keys = Object.keys(overrides);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (overrides[k] !== undefined) base[k] = overrides[k];
    }
  }

  if (dev === "tablet") {
    applyOverrides(node.responsive.tablet);
  } else if (dev === "mobile") {
    applyOverrides(node.responsive.tablet);
    applyOverrides(node.responsive.mobile);
  }

  // Migration: old single-value padding → 4-side
  if (base.padding != null && typeof base.padding === "number") {
    if (base.paddingTop == null || base.paddingTop === defaultDesktopProps.paddingTop) {
      base.paddingTop = base.paddingRight = base.paddingBottom = base.paddingLeft = base.padding;
    }
    base.paddingLinked = true;
  }

  return base;
}

// ============================================================================
// Tree Mutations
// ============================================================================
export function createPureDiv(name, customClass, desktopProps, tabletProps, mobileProps) {
  return {
    id: uid(),
    type: "div",
    name: name || "Structural DIV",
    customClass: customClass || "",
    responsive: {
      desktop: Object.assign({}, defaultDesktopProps, desktopProps || {}),
      tablet: tabletProps || {},
      mobile: mobileProps || {}
    },
    children: []
  };
}

export function addChildDiv(parentId, name, customClass, index) {
  var parent = findNode(parentId);
  if (!parent) return null;
  var child = createPureDiv(name, customClass);
  if (index != null && index >= 0 && index <= parent.children.length) {
    parent.children.splice(index, 0, child);
  } else {
    parent.children.push(child);
  }
  return child;
}

export function removeNode(id) {
  var parent = findParent(id);
  if (!parent) return false;
  var idx = parent.children.findIndex(function (c) { return c.id === id; });
  if (idx === -1) return false;
  parent.children.splice(idx, 1);
  return true;
}

export function moveNode(id, direction) {
  var parent = findParent(id);
  if (!parent) return false;
  var idx = parent.children.findIndex(function (c) { return c.id === id; });
  if (idx === -1) return false;
  var newIdx = direction === "up" ? idx - 1 : idx + 1;
  if (newIdx < 0 || newIdx >= parent.children.length) return false;
  var temp = parent.children[idx];
  parent.children[idx] = parent.children[newIdx];
  parent.children[newIdx] = temp;
  return true;
}

export function duplicateNode(id) {
  var parent = findParent(id);
  var node = findNode(id);
  if (!parent || !node) return null;
  var dup = clone(node);
  // Reassign IDs
  walk(dup, function (n) { n.id = uid(); });
  var idx = parent.children.findIndex(function (c) { return c.id === id; });
  parent.children.splice(idx + 1, 0, dup);
  return dup;
}

export function splitNode(id, cols) {
  var node = findNode(id);
  if (!node) return false;
  // Set to grid
  if (!node.responsive.desktop) node.responsive.desktop = {};
  node.responsive.desktop.display = "grid";
  node.responsive.desktop.columns = cols;
  // Move existing children into first child, create remaining empty
  var existingChildren = node.children.slice();
  node.children = [];
  for (var i = 0; i < cols; i++) {
    var child = createPureDiv("Col " + (i + 1), "");
    if (i === 0 && existingChildren.length) {
      child.children = existingChildren;
    }
    node.children.push(child);
  }
  return true;
}

export function wrapInParent(id) {
  var parent = findParent(id);
  var node = findNode(id);
  if (!parent || !node) return null;
  var idx = parent.children.findIndex(function (c) { return c.id === id; });
  var wrapper = createPureDiv("Wrapper", "");
  wrapper.children.push(node);
  parent.children[idx] = wrapper;
  return wrapper;
}

export function setProps(nodeId, device, props) {
  var node = findNode(nodeId);
  if (!node) return false;
  if (!node.responsive[device]) node.responsive[device] = {};
  Object.assign(node.responsive[device], props);
  return true;
}

export function resetDevice(nodeId, device) {
  var node = findNode(nodeId);
  if (!node) return false;
  node.responsive[device] = {};
  return true;
}

// ============================================================================
// Export Functions
// ============================================================================
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

export function generateResponsiveCss() {
  var rules = { desktop: [], tablet: [], mobile: [] };
  var classCount = {};
  var bp = state.breakpoints || { tablet: 992, mobile: 576 };

  walk(state.root, function (node) {
    if (node.id === "root") return;
    var baseClass = node.customClass || "div-box";
    if (!classCount[baseClass]) classCount[baseClass] = 0;
    classCount[baseClass]++;
    var clsName = classCount[baseClass] > 1 ? baseClass + "-" + classCount[baseClass] : baseClass;

    var d = node.responsive.desktop || {};
    var t = node.responsive.tablet || {};
    var m = node.responsive.mobile || {};

    var dCss = [];
    if (d.display === "grid") {
      dCss.push("  display: grid;");
      if (d.gridAutoMode) dCss.push("  grid-template-columns: repeat(" + d.gridAutoMode + ", minmax(" + (d.gridMinColWidth || "200px") + ", 1fr));");
      else if (d.customColumns) dCss.push("  grid-template-columns: " + d.customColumns + ";");
      else dCss.push("  grid-template-columns: repeat(" + (d.columns || 1) + ", 1fr);");
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

    if (d.horizontalAlign === "center") dCss.push("  margin-left: auto;\n  margin-right: auto;\n  justify-self: center;");
    else if (d.horizontalAlign === "right") dCss.push("  margin-left: auto;\n  margin-right: 0;\n  justify-self: end;");
    else if (d.horizontalAlign === "left") dCss.push("  margin-left: 0;\n  margin-right: auto;\n  justify-self: start;");

    if (d.width) dCss.push("  width: " + d.width + ";");
    if (d.height) dCss.push("  height: " + d.height + ";");
    if (d.minHeight) dCss.push("  min-height: " + d.minHeight + "px;");
    if (d.maxWidth) dCss.push("  max-width: " + d.maxWidth + ";");
    if (d.maxHeight) dCss.push("  max-height: " + d.maxHeight + ";");
    if (d.aspectRatio) dCss.push("  aspect-ratio: " + d.aspectRatio + ";");

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

    if (d.position && d.position !== "static") {
      dCss.push("  position: " + d.position + ";");
      if (d.top) dCss.push("  top: " + d.top + ";");
      if (d.right) dCss.push("  right: " + d.right + ";");
      if (d.bottom) dCss.push("  bottom: " + d.bottom + ";");
      if (d.left) dCss.push("  left: " + d.left + ";");
      if (d.zIndex) dCss.push("  z-index: " + d.zIndex + ";");
    }
    if (d.overflow && d.overflow !== "visible") dCss.push("  overflow: " + d.overflow + ";");

    if (d.backgroundColor) dCss.push("  background-color: " + d.backgroundColor + ";");
    if (d.borderWidth && d.borderStyle && d.borderColor) dCss.push("  border: " + d.borderWidth + " " + d.borderStyle + " " + d.borderColor + ";");
    if (d.borderRadius) dCss.push("  border-radius: " + d.borderRadius + ";");
    if (d.boxShadow) dCss.push("  box-shadow: " + d.boxShadow + ";");
    if (d.opacity && d.opacity !== "1") dCss.push("  opacity: " + d.opacity + ";");

    if (d.span && d.span > 1) dCss.push("  grid-column: span " + d.span + ";");
    if (d.display === "flex" && d.flexGrow != null) dCss.push("  flex-grow: " + d.flexGrow + ";");
    if (d.flexShrink != null && d.flexShrink !== 1) dCss.push("  flex-shrink: " + d.flexShrink + ";");
    if (d.flexBasis) dCss.push("  flex-basis: " + d.flexBasis + ";");
    if (d.order != null && d.order !== 0) dCss.push("  order: " + d.order + ";");
    if (d.textAlign && d.textAlign !== "left") dCss.push("  text-align: " + d.textAlign + ";");
    if (d.direction) dCss.push("  direction: " + d.direction + ";");

    if (dCss.length) rules.desktop.push("." + clsName + " {\n" + dCss.join("\n") + "\n}");

    // Tablet
    var tCss = [];
    if (t.display && t.display !== d.display) tCss.push("    display: " + t.display + ";");
    if (t.columns && t.columns !== d.columns) tCss.push("    grid-template-columns: repeat(" + t.columns + ", 1fr);");
    if (t.flexDirection && t.flexDirection !== d.flexDirection) tCss.push("    flex-direction: " + t.flexDirection + ";");
    if (t.width && t.width !== d.width) tCss.push("    width: " + t.width + ";");
    if (t.gap != null && t.gap !== d.gap) tCss.push("    gap: " + t.gap + "px;");
    if (t.paddingTop != null) tCss.push("    padding: " + (t.paddingTop||0) + "px " + (t.paddingRight||0) + "px " + (t.paddingBottom||0) + "px " + (t.paddingLeft||0) + "px;");
    if (t.position && t.position !== d.position) tCss.push("    position: " + t.position + ";");
    if (t.overflow && t.overflow !== d.overflow) tCss.push("    overflow: " + t.overflow + ";");
    if (t.overflowX && t.overflowX !== d.overflowX) tCss.push("    overflow-x: " + t.overflowX + ";");
    if (t.overflowY && t.overflowY !== d.overflowY) tCss.push("    overflow-y: " + t.overflowY + ";");
    if (t.backgroundColor && t.backgroundColor !== d.backgroundColor) tCss.push("    background-color: " + t.backgroundColor + ";");
    if (t.borderWidth && t.borderStyle && t.borderColor && (t.borderWidth !== d.borderWidth || t.borderStyle !== d.borderStyle || t.borderColor !== d.borderColor)) tCss.push("    border: " + t.borderWidth + " " + t.borderStyle + " " + t.borderColor + ";");
    if (t.borderRadius && t.borderRadius !== d.borderRadius) tCss.push("    border-radius: " + t.borderRadius + ";");
    if (t.boxShadow && t.boxShadow !== d.boxShadow) tCss.push("    box-shadow: " + t.boxShadow + ";");
    if (t.opacity && t.opacity !== d.opacity) tCss.push("    opacity: " + t.opacity + ";");
    if (t.aspectRatio && t.aspectRatio !== d.aspectRatio) tCss.push("    aspect-ratio: " + t.aspectRatio + ";");
    if (t.direction && t.direction !== d.direction) tCss.push("    direction: " + t.direction + ";");
    if (t.textAlign && t.textAlign !== d.textAlign) tCss.push("    text-align: " + t.textAlign + ";");
    if (t.maxHeight && t.maxHeight !== d.maxHeight) tCss.push("    max-height: " + t.maxHeight + ";");
    if (t.minHeight && t.minHeight !== d.minHeight) tCss.push("    min-height: " + t.minHeight + "px;");
    if (t.flexBasis && t.flexBasis !== d.flexBasis) tCss.push("    flex-basis: " + t.flexBasis + ";");
    if (t.flexShrink != null && t.flexShrink !== d.flexShrink) tCss.push("    flex-shrink: " + t.flexShrink + ";");
    if (t.height && t.height !== d.height) tCss.push("    height: " + t.height + ";");
    if (t.span != null && t.span !== d.span) tCss.push("    grid-column: span " + t.span + ";");
    if (t.order != null && t.order !== d.order) tCss.push("    order: " + t.order + ";");
    if (t.hidden) tCss.push("    display: none;");
    if (tCss.length) rules.tablet.push("  ." + clsName + " {\n" + tCss.join("\n") + "\n  }");

    // Mobile
    var mCss = [];
    if (m.display && m.display !== d.display) mCss.push("    display: " + m.display + ";");
    if (m.columns && m.columns !== d.columns) mCss.push("    grid-template-columns: repeat(" + m.columns + ", 1fr);");
    if (m.flexDirection && m.flexDirection !== d.flexDirection) mCss.push("    flex-direction: " + m.flexDirection + ";");
    if (m.width && m.width !== d.width) mCss.push("    width: " + m.width + ";");
    if (m.gap != null && m.gap !== d.gap) mCss.push("    gap: " + m.gap + "px;");
    if (m.paddingTop != null) mCss.push("    padding: " + (m.paddingTop||0) + "px " + (m.paddingRight||0) + "px " + (m.paddingBottom||0) + "px " + (m.paddingLeft||0) + "px;");
    if (m.position && m.position !== d.position) mCss.push("    position: " + m.position + ";");
    if (m.overflow && m.overflow !== d.overflow) mCss.push("    overflow: " + m.overflow + ";");
    if (m.overflowX && m.overflowX !== d.overflowX) mCss.push("    overflow-x: " + m.overflowX + ";");
    if (m.overflowY && m.overflowY !== d.overflowY) mCss.push("    overflow-y: " + m.overflowY + ";");
    if (m.backgroundColor && m.backgroundColor !== d.backgroundColor) mCss.push("    background-color: " + m.backgroundColor + ";");
    if (m.borderWidth && m.borderStyle && m.borderColor && (m.borderWidth !== d.borderWidth || m.borderStyle !== d.borderStyle || m.borderColor !== d.borderColor)) mCss.push("    border: " + m.borderWidth + " " + m.borderStyle + " " + m.borderColor + ";");
    if (m.borderRadius && m.borderRadius !== d.borderRadius) mCss.push("    border-radius: " + m.borderRadius + ";");
    if (m.boxShadow && m.boxShadow !== d.boxShadow) mCss.push("    box-shadow: " + m.boxShadow + ";");
    if (m.opacity && m.opacity !== d.opacity) mCss.push("    opacity: " + m.opacity + ";");
    if (m.aspectRatio && m.aspectRatio !== d.aspectRatio) mCss.push("    aspect-ratio: " + m.aspectRatio + ";");
    if (m.direction && m.direction !== d.direction) mCss.push("    direction: " + m.direction + ";");
    if (m.textAlign && m.textAlign !== d.textAlign) mCss.push("    text-align: " + m.textAlign + ";");
    if (m.maxHeight && m.maxHeight !== d.maxHeight) mCss.push("    max-height: " + m.maxHeight + ";");
    if (m.minHeight && m.minHeight !== d.minHeight) mCss.push("    min-height: " + m.minHeight + "px;");
    if (m.flexBasis && m.flexBasis !== d.flexBasis) mCss.push("    flex-basis: " + m.flexBasis + ";");
    if (m.flexShrink != null && m.flexShrink !== d.flexShrink) mCss.push("    flex-shrink: " + m.flexShrink + ";");
    if (m.height && m.height !== d.height) mCss.push("    height: " + m.height + ";");
    if (m.span != null && m.span !== d.span) mCss.push("    grid-column: span " + m.span + ";");
    if (m.order != null && m.order !== d.order) mCss.push("    order: " + m.order + ";");
    if (m.hidden) mCss.push("    display: none;");
    if (mCss.length) rules.mobile.push("  ." + clsName + " {\n" + mCss.join("\n") + "\n  }");
  });

  var cssText = "/* Reset */\n*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }\n\n";
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

export function generateFullHtmlDocument() {
  var pureHtml = generateCleanHtml(state.root, 1);
  var responsiveCss = generateResponsiveCss();

  return '<!DOCTYPE html>\n<html lang="en">\n<head>\n' +
    '  <meta charset="UTF-8">\n' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '  <title>Pure Responsive DIV Structure</title>\n' +
    '  <style>\n' + responsiveCss + '  </style>\n' +
    '</head>\n<body>\n' + pureHtml + '</body>\n</html>';
}

export function getTreeJson() {
  return JSON.parse(JSON.stringify(state.root));
}

export function importTreeJson(tree) {
  state.root = JSON.parse(JSON.stringify(tree));
  return true;
}

export function setBreakpoints(tablet, mobile) {
  if (tablet != null) state.breakpoints.tablet = tablet;
  if (mobile != null) state.breakpoints.mobile = mobile;
  return state.breakpoints;
}

export function resetAll() {
  idCounter = 0;
  state.root = {
    id: "root",
    type: "div",
    name: "Page Root",
    customClass: "page-layout",
    responsive: {
      desktop: {
        display: "flex",
        flexDirection: "column",
        gap: 20,
        paddingTop: 20, paddingRight: 20, paddingBottom: 20, paddingLeft: 20,
        minHeight: 600,
        justifyContent: "flex-start",
        alignItems: "stretch",
        horizontalAlign: "stretch",
        maxWidth: ""
      },
      tablet: {},
      mobile: {}
    },
    children: []
  };
  return true;
}

// List tree as readable structure
export function listTree(node, depth) {
  if (!node) node = state.root;
  if (!depth) depth = 0;
  var result = [];
  var eff = getEffectiveProps(node, "desktop");
  result.push({
    id: node.id,
    depth: depth,
    name: node.name || "",
    customClass: node.customClass || "",
    display: eff.display,
    childCount: node.children.length
  });
  node.children.forEach(function (c) {
    result = result.concat(listTree(c, depth + 1));
  });
  return result;
}

export function reparentNode(nodeId, newParentId, index) {
  var node = findNode(nodeId);
  var oldParent = findParent(nodeId);
  var newParent = findNode(newParentId);
  if (!node || !oldParent || !newParent) return false;
  // Prevent reparenting into self or own descendant
  var isDescendant = false;
  walk(node, function (n) { if (n.id === newParentId) isDescendant = true; });
  if (isDescendant) return false;
  // Remove from old parent
  var idx = oldParent.children.findIndex(function (c) { return c.id === nodeId; });
  if (idx === -1) return false;
  oldParent.children.splice(idx, 1);
  // Insert into new parent
  if (index != null && index >= 0 && index <= newParent.children.length) {
    newParent.children.splice(index, 0, node);
  } else {
    newParent.children.push(node);
  }
  return true;
}
