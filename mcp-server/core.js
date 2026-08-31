// ============================================================================
// core.js — Server-side builder logic (no DOM, pure data)
// Extracted from builder.js for MCP server use
// ============================================================================

import {
  defaultDesktopProps,
  DEVICES,
  DEVICE_KEYS,
  isDevice,
  deviceMeta,
  deviceChain,
  defaultBreakpoints,
  normalizeBreakpoints,
  emptyResponsive,
  walk,
  isGrid,
  isFlexRow,
  getEffectiveProps,
  generateCleanHtml,
  generateResponsiveCss as buildCss,
  generateFullHtmlDocument as buildDoc
} from "../generator.js";

// Re-exported so the MCP tools and generate_examples.js keep their imports.
export {
  defaultDesktopProps, walk, isGrid, isFlexRow, getEffectiveProps, generateCleanHtml,
  DEVICES, DEVICE_KEYS, isDevice, deviceMeta, deviceChain,
  defaultBreakpoints, normalizeBreakpoints, emptyResponsive
};

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
// The page root is created in exactly one place, so a fresh document and a
// reset document cannot drift apart the way two copied literals did.
function makeRoot() {
  return {
    id: "root",
    type: "div",
    name: "Page Root",
    customClass: "page-layout",
    responsive: Object.assign(emptyResponsive(), {
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
      }
    }),
    children: []
  };
}

export var state = {
  device: "desktop",
  selectedId: null,
  breakpoints: defaultBreakpoints(),
  root: makeRoot()
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
// deviceProps is keyed by device: { desktop, laptop, tablet, mobile, ... }.
// Every tier on the ladder is seeded, so a node created today already has a
// slot for a breakpoint the caller has not touched yet.
export function createPureDiv(name, customClass, deviceProps) {
  var dp = deviceProps || {};
  var responsive = emptyResponsive();
  DEVICE_KEYS.forEach(function (k) {
    responsive[k] = Object.assign({}, dp[k] || {});
  });
  responsive.desktop = Object.assign({}, defaultDesktopProps, dp.desktop || {});
  return {
    id: uid(),
    type: "div",
    name: name || "Structural DIV",
    customClass: customClass || "",
    responsive: responsive,
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
  // An unknown key would silently create a slot no emitter ever reads, so the
  // props would vanish without an error. Reject it instead.
  if (!isDevice(device)) return false;
  if (!node.responsive[device]) node.responsive[device] = {};
  Object.assign(node.responsive[device], props);
  return true;
}

export function resetDevice(nodeId, device) {
  var node = findNode(nodeId);
  if (!node) return false;
  if (!isDevice(device)) return false;
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
  for (var dev of DEVICE_KEYS) {
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
  // A document saved before a tier existed simply has no value for it; the
  // ladder default fills the hole rather than leaving it undefined in a query.
  if (payload.breakpoints && typeof payload.breakpoints === "object") {
    var incoming = {};
    DEVICES.forEach(function (d) {
      if (d.defaultPx != null && typeof payload.breakpoints[d.key] === "number") {
        incoming[d.key] = payload.breakpoints[d.key];
      }
    });
    state.breakpoints = normalizeBreakpoints(Object.assign({}, state.breakpoints, incoming));
  } else {
    state.breakpoints = normalizeBreakpoints(state.breakpoints);
  }
  return { ok: true, breakpoints: state.breakpoints };
}

// Build a whole subtree from one compact nested spec. Creating a page a node at
// a time costs one round trip per call — the shipped examples need 31 to 64 of
// them — which is the dominant cost of driving this over MCP.
//
//   { class, name?, desktop?, tablet?, mobile?, children?: [ ... ] }
//
export function buildTree(spec, parentId, replace) {
  var parent = findNode(parentId || "root");
  if (!parent) return { ok: false, error: "parent not found: " + parentId };

  var specs = Array.isArray(spec) ? spec : [spec];
  var err = validateSpec(specs);
  if (err) return { ok: false, error: err };

  if (replace) parent.children.length = 0;

  var created = 0;
  function add(node, parentNode) {
    var made = createPureDiv(node.name || node.class || "Div", node.class || "", node);
    parentNode.children.push(made);
    created++;
    (node.children || []).forEach(function (c) { add(c, made); });
    return made;
  }
  var roots = specs.map(function (s) { return add(s, parent); });
  return { ok: true, created: created, rootIds: roots.map(function (n) { return n.id; }) };
}

function validateSpec(specs, path) {
  path = path || "spec";
  if (!Array.isArray(specs)) return path + " must be an object or array";
  for (var i = 0; i < specs.length; i++) {
    var s = specs[i], p = path + "[" + i + "]";
    if (!s || typeof s !== "object" || Array.isArray(s)) return p + " must be an object";
    for (var k of DEVICE_KEYS) {
      if (s[k] != null && (typeof s[k] !== "object" || Array.isArray(s[k]))) return p + "." + k + " must be an object";
    }
    if (s.children != null) {
      if (!Array.isArray(s.children)) return p + ".children must be an array";
      var e = validateSpec(s.children, p + ".children");
      if (e) return e;
    }
  }
  return null;
}

// Accepts either an object keyed by device — setBreakpoints({ laptop: 1280 }) —
// or the original positional (tablet, mobile) pair, which predates the ladder.
export function setBreakpoints(a, b) {
  var incoming = {};
  if (a && typeof a === "object") {
    incoming = a;
  } else {
    if (a != null) incoming.tablet = a;
    if (b != null) incoming.mobile = b;
  }
  DEVICES.forEach(function (d) {
    if (d.defaultPx == null) return;
    var v = incoming[d.key];
    if (typeof v === "number" && isFinite(v) && v > 0) state.breakpoints[d.key] = Math.round(v);
  });
  state.breakpoints = normalizeBreakpoints(state.breakpoints);
  return state.breakpoints;
}

export function resetAll() {
  idCounter = 0;
  // Breakpoints are part of the document, so a fresh start resets them too;
  // otherwise reset_all would leave the previous document's @media values behind.
  state.breakpoints = defaultBreakpoints();
  state.root = makeRoot();
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
