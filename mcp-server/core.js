// ============================================================================
// core.js — Server-side builder logic (no DOM, pure data)
// Extracted from builder.js for MCP server use
// ============================================================================

import {
  defaultDesktopProps,
  walk,
  isGrid,
  isFlexRow,
  getEffectiveProps,
  generateCleanHtml,
  generateResponsiveCss as buildCss,
  generateFullHtmlDocument as buildDoc
} from "../generator.js";

// Re-exported so the MCP tools and generate_examples.js keep their imports.
export { defaultDesktopProps, walk, isGrid, isFlexRow, getEffectiveProps, generateCleanHtml };

var idCounter = 0;

// ============================================================================
// History (Undo/Redo)
// ============================================================================
var History = {
  past: [],
  future: [],
  limit: 50,
  // Breakpoints are part of the document, not settings — set_breakpoints is
  // undoable, so a snapshot that captured only the tree would silently strand it.
  snapshot: function () {
    return JSON.parse(JSON.stringify({ root: state.root, breakpoints: state.breakpoints }));
  },
  restore: function (snap) {
    state.root = snap.root;
    state.breakpoints = snap.breakpoints;
  },
  push: function () {
    this.past.push(this.snapshot());
    if (this.past.length > this.limit) this.past.shift();
    this.future.length = 0;
  },
  undo: function () {
    if (!this.past.length) return false;
    this.future.push(this.snapshot());
    this.restore(this.past.pop());
    return true;
  },
  redo: function () {
    if (!this.future.length) return false;
    this.past.push(this.snapshot());
    this.restore(this.future.pop());
    return true;
  },
  canUndo: function () { return this.past.length > 0; },
  canRedo: function () { return this.future.length > 0; }
};

export function pushHistory() { History.push(); }
export function undo() { return History.undo(); }
export function redo() { return History.redo(); }
export function historyStatus() { return { canUndo: History.canUndo(), canRedo: History.canRedo(), undoCount: History.past.length, redoCount: History.future.length }; }

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

// A flex item only shrinks below its content width when min-width is cleared.
// Without this, a nowrap row bursts its container and the content is clipped.

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

export function generateResponsiveCss() {
  return buildCss(state.root, state.breakpoints);
}

export function generateFullHtmlDocument() {
  return buildDoc(state.root, state.breakpoints);
}

// The tree alone is not the whole document: breakpoints live beside it and
// decide the @media values, so they travel with it. Older payloads that are a
// bare root node still load, and keep the current breakpoints.
export function getTreeJson() {
  return {
    version: 2,
    breakpoints: JSON.parse(JSON.stringify(state.breakpoints)),
    root: JSON.parse(JSON.stringify(state.root))
  };
}

// #3: a malformed payload must be reported, not thrown from deep inside a walk.
function validateTree(node, path) {
  if (!node || typeof node !== "object") return path + " is not an object";
  if (typeof node.id !== "string" || !node.id) return path + " is missing a string id";
  if (!node.responsive || typeof node.responsive !== "object") return path + " is missing responsive{}";
  for (var dev of ["desktop", "tablet", "mobile"]) {
    if (node.responsive[dev] != null && typeof node.responsive[dev] !== "object") {
      return path + ".responsive." + dev + " must be an object";
    }
  }
  if (!Array.isArray(node.children)) return path + " is missing a children array";
  for (var i = 0; i < node.children.length; i++) {
    var err = validateTree(node.children[i], path + ".children[" + i + "]");
    if (err) return err;
  }
  return null;
}

export function importTreeJson(payload) {
  if (!payload || typeof payload !== "object") return { ok: false, error: "payload must be an object" };
  var tree = payload.root && payload.root.id ? payload.root : payload;   // v2 envelope or bare root
  var err = validateTree(tree, "root");
  if (err) return { ok: false, error: err };
  state.root = JSON.parse(JSON.stringify(tree));
  if (payload.breakpoints && typeof payload.breakpoints === "object") {
    var bp = payload.breakpoints;
    if (typeof bp.tablet === "number") state.breakpoints.tablet = bp.tablet;
    if (typeof bp.mobile === "number") state.breakpoints.mobile = bp.mobile;
  }
  return { ok: true, breakpoints: state.breakpoints };
}

export function setBreakpoints(tablet, mobile) {
  if (tablet != null) state.breakpoints.tablet = tablet;
  if (mobile != null) state.breakpoints.mobile = mobile;
  return state.breakpoints;
}

export function resetAll() {
  idCounter = 0;
  // Breakpoints are part of the document now, so a fresh start resets them too;
  // otherwise reset_all would leave the previous document's @media values behind.
  state.breakpoints = { tablet: 992, mobile: 576 };
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
