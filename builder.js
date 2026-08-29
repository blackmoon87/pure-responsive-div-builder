import {
  defaultDesktopProps,
  walk,
  isGrid,
  isFlexRow,
  getEffectiveProps,
  generateCleanHtml,
  generateResponsiveCss as buildCss,
  generateFullHtmlDocument as buildDoc
} from "./generator.js";

(function () {
  "use strict";

  // HTML and CSS emission lives in generator.js, shared with the MCP server, so
  // the preview and the export can never drift apart again.
  function generateResponsiveCss() {
    return buildCss(State.root, State.breakpoints);
  }

  function generateFullHtmlDocument() {
    return buildDoc(State.root, State.breakpoints);
  }

  // ==========================================================================
  // Utility & Helper Functions
  // ==========================================================================
  var counter = 0;
  function uid(prefix) {
    counter += 1;
    return (prefix || "div") + "_" + Math.random().toString(36).substr(2, 4) + counter.toString(36);
  }

  // Debounce helper — delays commit until user stops typing
  function debounce(fn, delay) {
    var timer = null;
    return function () {
      var ctx = this, args = arguments;
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () { timer = null; fn.apply(ctx, args); }, delay);
    };
  }

  function clone(val) {
    return JSON.parse(JSON.stringify(val));
  }

  // A flex item only shrinks below its content width when min-width is cleared.
  // Without this, a nowrap row bursts its container and the content is clipped.
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  // ==========================================================================
  // Core State & Defaults
  // ==========================================================================


  var State = {
    device: "desktop",
    customWidth: null,   // free-width preview; null = use the preset device width
    selectedId: null,
    activeTab: "palette",
    exportTab: "combined",
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
          padding: 20,
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

  // ==========================================================================
  // History & Undo / Redo
  // ==========================================================================
  var History = {
    past: [],
    future: [],
    limit: 50,
    snapshot: function () {
      return { root: clone(State.root), selectedId: State.selectedId };
    },
    apply: function (snap) {
      State.root = clone(snap.root);
      State.selectedId = findNode(snap.selectedId) ? snap.selectedId : null;
    },
    push: function () {
      this.past.push(this.snapshot());
      if (this.past.length > this.limit) this.past.shift();
      this.future.length = 0;
    },
    undo: function () {
      if (!this.past.length) return false;
      this.future.push(this.snapshot());
      this.apply(this.past.pop());
      return true;
    },
    redo: function () {
      if (!this.future.length) return false;
      this.past.push(this.snapshot());
      this.apply(this.future.pop());
      return true;
    },
    canUndo: function () { return this.past.length > 0; },
    canRedo: function () { return this.future.length > 0; }
  };

  function commit(mutator) {
    History.push();
    mutator();
    render();
  }

  // ==========================================================================
  // Responsive Property Resolver
  // ==========================================================================
  // ==========================================================================
  // Node Creation & Tree Navigation
  // ==========================================================================
  function createPureDiv(name, customClass, desktopProps, tabletProps, mobileProps) {
    return {
      id: uid("div"),
      type: "div",
      name: name || "Div Container",
      customClass: customClass || "",
      responsive: {
        desktop: Object.assign({}, defaultDesktopProps, desktopProps || {}),
        tablet: Object.assign({}, tabletProps || {}),
        mobile: Object.assign({}, mobileProps || {})
      },
      children: []
    };
  }

  function createPresetDiv(presetKey) {
    var div;
    switch (presetKey) {
      case "container":
        div = createPureDiv("Container Div", "container", {
          display: "flex",
          flexDirection: "column",
          maxWidth: "1200px",
          horizontalAlign: "center",
          gap: 16,
          padding: 24,
          minHeight: 120
        });
        break;

      case "box":
        div = createPureDiv("Box Div", "box-col", {
          display: "block",
          padding: 16,
          minHeight: 80,
          horizontalAlign: "stretch"
        });
        break;

      case "grid2":
        div = createPureDiv("2-Col Grid", "grid-2col", {
          display: "grid",
          columns: 2,
          gap: 16,
          padding: 16,
          minHeight: 100
        }, { columns: 2 }, { columns: 1 });
        div.children.push(createPureDiv("Grid Col 1", "col", { minHeight: 80 }));
        div.children.push(createPureDiv("Grid Col 2", "col", { minHeight: 80 }));
        break;

      case "grid3":
        div = createPureDiv("3-Col Grid", "grid-3col", {
          display: "grid",
          columns: 3,
          gap: 16,
          padding: 16,
          minHeight: 100
        }, { columns: 2 }, { columns: 1 });
        div.children.push(createPureDiv("Grid Col 1", "col", { minHeight: 80 }));
        div.children.push(createPureDiv("Grid Col 2", "col", { minHeight: 80 }));
        div.children.push(createPureDiv("Grid Col 3", "col", { minHeight: 80 }));
        break;

      case "grid4":
        div = createPureDiv("4-Col Grid", "grid-4col", {
          display: "grid",
          columns: 4,
          gap: 16,
          padding: 16,
          minHeight: 100
        }, { columns: 2 }, { columns: 1 });
        for (var i = 1; i <= 4; i++) {
          div.children.push(createPureDiv("Grid Col " + i, "col", { minHeight: 80 }));
        }
        break;

      case "grid12":
        div = createPureDiv("12-Col Grid", "grid-12col", {
          display: "grid",
          columns: 12,
          gap: 12,
          padding: 16,
          minHeight: 100
        }, { columns: 6 }, { columns: 1 });
        div.children.push(createPureDiv("Span 4 Div", "col-span-4", { span: 4, minHeight: 80 }));
        div.children.push(createPureDiv("Span 8 Div", "col-span-8", { span: 8, minHeight: 80 }, { span: 6 }, { span: 1 }));
        break;

      case "flex-row":
        div = createPureDiv("Flex Row", "flex-row", {
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 16,
          padding: 16,
          minHeight: 100
        }, { flexDirection: "row", flexWrap: "wrap" }, { flexDirection: "column" });
        div.children.push(createPureDiv("Flex Item 1", "flex-item", { flexGrow: 1, minHeight: 80 }));
        div.children.push(createPureDiv("Flex Item 2", "flex-item", { flexGrow: 2, minHeight: 80 }));
        break;

      case "flex-col":
        div = createPureDiv("Flex Column", "flex-stack", {
          display: "flex",
          flexDirection: "column",
          gap: 16,
          padding: 16,
          minHeight: 100
        });
        div.children.push(createPureDiv("Stack Item 1", "stack-item", { minHeight: 60 }));
        div.children.push(createPureDiv("Stack Item 2", "stack-item", { minHeight: 60 }));
        break;

      default:
        div = createPureDiv("Div", "div-block", { minHeight: 80 });
    }
    return div;
  }

  function findNode(id) {
    if (!id) return null;
    var found = null;
    walk(State.root, function (node) {
      if (node.id === id) {
        found = node;
        return false;
      }
    });
    return found;
  }

  function findParent(id) {
    var found = null;
    walk(State.root, function (node, parent) {
      if (node.id === id) {
        found = parent;
        return false;
      }
    });
    return found;
  }

  function insertNode(parentId, node, index) {
    var parent = parentId === "root" ? State.root : findNode(parentId);
    if (!parent) return false;
    var at = typeof index === "number" ? index : parent.children.length;
    parent.children.splice(at, 0, node);
    return true;
  }

  function removeNode(id) {
    if (id === "root") return false;
    var parent = findParent(id);
    if (!parent) return false;
    var node = findNode(id);
    parent.children.splice(parent.children.indexOf(node), 1);
    if (State.selectedId === id) State.selectedId = null;
    return true;
  }

  function moveNode(id, delta) {
    var node = findNode(id);
    var parent = findParent(id);
    if (!node || !parent) return false;
    var from = parent.children.indexOf(node);
    var to = from + delta;
    if (to < 0 || to >= parent.children.length) return false;
    parent.children.splice(from, 1);
    parent.children.splice(to, 0, node);
    return true;
  }

  function duplicateNode(id) {
    var node = findNode(id);
    var parent = findParent(id);
    if (!node || !parent) return false;
    var copy = clone(node);
    walk(copy, function (child) {
      child.id = uid("div");
    });
    parent.children.splice(parent.children.indexOf(node) + 1, 0, copy);
    State.selectedId = copy.id;
    return true;
  }

  function splitNode(id, colCount) {
    var node = findNode(id);
    if (!node) return;
    // BUG 1 FIX: Guard against double-append — if children exist, update grid settings only
    commit(function () {
      node.responsive.desktop.display = "grid";
      node.responsive.desktop.columns = colCount;
      if (!node.responsive.tablet) node.responsive.tablet = {};
      node.responsive.tablet.columns = Math.min(colCount, 2);
      if (!node.responsive.mobile) node.responsive.mobile = {};
      node.responsive.mobile.columns = 1;

      // Only add children if the node currently has none
      if (node.children.length === 0) {
        for (var i = 1; i <= colCount; i++) {
          node.children.push(createPureDiv("Col " + i, "col", { minHeight: 70 }));
        }
      }
    });
  }

  function addChildDiv(id) {
    var node = findNode(id);
    if (!node) return;
    commit(function () {
      var child = createPureDiv("Child Div", "nested-div", { minHeight: 70 });
      node.children.push(child);
      State.selectedId = child.id;
    });
  }

  function wrapInParent(id) {
    var node = findNode(id);
    var parent = findParent(id);
    if (!node || !parent) return;
    commit(function () {
      var idx = parent.children.indexOf(node);
      var wrapper = createPureDiv("Wrapper Div", "wrapper-div", {
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: 16
      });
      parent.children.splice(idx, 1, wrapper);
      wrapper.children.push(node);
      State.selectedId = wrapper.id;
    });
  }

  function countNodes() {
    var total = 0;
    walk(State.root, function (node) {
      if (node.id !== "root") total += 1;
    });
    return total;
  }

  // ==========================================================================
  // DOM Elements References
  // ==========================================================================
  var canvas = document.getElementById("canvas");
  var frame = document.getElementById("stage-frame");
  var propsBody = document.getElementById("props-body");
  var treeContainer = document.getElementById("dom-tree-container");
  var statusNodes = document.getElementById("status-nodes");
  var statusSelection = document.getElementById("status-selection");
  var statusDevice = document.getElementById("status-device");
  var viewportBadge = document.getElementById("viewport-badge");
  var btnUndo = document.getElementById("btn-undo");
  var btnRedo = document.getElementById("btn-redo");
  var btnClear = document.getElementById("btn-clear");
  var btnExport = document.getElementById("btn-export");

  var exportModal = document.getElementById("export-modal");
  var btnModalClose = document.getElementById("btn-modal-close");
  var codeOutput = document.getElementById("code-output");
  var btnCopyCode = document.getElementById("btn-copy-code");
  var btnDownloadHtml = document.getElementById("btn-download-html");
  var exportWarnings = document.getElementById("export-warnings");
  var vpRange = document.getElementById("vp-range");
  var vpWidth = document.getElementById("vp-width");
  var vpReset = document.getElementById("vp-reset");
  var PRESET_WIDTH = { desktop: 1280, tablet: 768, mobile: 375 };

  // ==========================================================================
  // Canvas Rendering (Pure Structural Wireframes)
  // ==========================================================================
  function renderCanvasNode(node, parentNode, depth) {
    if (!depth) depth = 0;
    var wrapper = el("div", "struct-div");
    wrapper.dataset.id = node.id;
    wrapper.dataset.depth = depth; // GAP 2: Depth tracking for visual indicator
    if (node.id === State.selectedId) wrapper.classList.add("is-selected");

    // GAP 2: Alternate border color by nesting depth
    var depthColors = ["#94a3b8", "#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#38bdf8"];
    wrapper.style.borderColor = depthColors[depth % depthColors.length];

    var eff = getEffectiveProps(node, State.device);

    if (eff.hidden) {
      wrapper.style.display = "none";
      return wrapper;
    }

    // Resolve parent's effective display for context-aware child styling
    var parentDisplay = "block";
    if (parentNode) {
      var parentEff = getEffectiveProps(parentNode, State.device);
      parentDisplay = parentEff.display || "block";
    }

    // Apply resolved responsive layout styles directly to the wireframe div
    if (eff.display === "grid") {
      wrapper.style.display = "grid";
      // Phase 4.3: Grid auto-fit/auto-fill
      if (eff.gridAutoMode) {
        wrapper.style.gridTemplateColumns = "repeat(" + eff.gridAutoMode + ", minmax(min(" + (eff.gridMinColWidth || "200px") + ", 100%), 1fr))";
      } else if (eff.customColumns) {
        wrapper.style.gridTemplateColumns = eff.customColumns;
      } else {
        wrapper.style.gridTemplateColumns = "repeat(" + (eff.columns || 1) + ", 1fr)";
      }
      wrapper.style.gap = (eff.gap != null ? eff.gap : 16) + "px";
      wrapper.style.rowGap = (eff.rowGap != null ? eff.rowGap : (eff.gap != null ? eff.gap : 16)) + "px";
      // Phase 4.4: Grid justify-items & align-content
      if (eff.justifyItems && eff.justifyItems !== "stretch") wrapper.style.justifyItems = eff.justifyItems;
      if (eff.alignContent && eff.alignContent !== "start") wrapper.style.alignContent = eff.alignContent;
    } else if (eff.display === "flex") {
      wrapper.style.display = "flex";
      wrapper.style.flexDirection = eff.flexDirection || "row";
      wrapper.style.flexWrap = eff.flexWrap || "nowrap";
      wrapper.style.justifyContent = eff.justifyContent || "flex-start";
      wrapper.style.alignItems = eff.alignItems || "stretch";
      wrapper.style.gap = (eff.gap != null ? eff.gap : 16) + "px";
    } else {
      wrapper.style.display = "block";
    }

    // Horizontal & Self Alignment.
    // Mirrors the exported CSS exactly: margin-auto does the centering, and
    // justify-self is only meaningful (and only emitted) under a grid parent.
    // Chrome honours justify-self in block layout, where it forces shrink-to-fit
    // and bursts the container — so it must never be set outside a grid.
    var parentIsGrid = parentDisplay === "grid";
    if (eff.horizontalAlign === "center") {
      wrapper.style.marginLeft = "auto";
      wrapper.style.marginRight = "auto";
      if (parentIsGrid) wrapper.style.justifySelf = "center";
    } else if (eff.horizontalAlign === "right") {
      wrapper.style.marginLeft = "auto";
      wrapper.style.marginRight = "0";
      if (parentIsGrid) wrapper.style.justifySelf = "end";
    } else if (eff.horizontalAlign === "left") {
      wrapper.style.marginLeft = "0";
      wrapper.style.marginRight = "auto";
      if (parentIsGrid) wrapper.style.justifySelf = "start";
    } else {
      if (!eff.width && parentDisplay !== "grid") {
        wrapper.style.width = "100%";
      }
    }

    if (eff.alignSelf) wrapper.style.alignSelf = eff.alignSelf;

    if (eff.width) wrapper.style.width = eff.width;
    if (eff.textAlign) wrapper.style.textAlign = eff.textAlign;

    // Phase 2: 4-side padding
    var pt = eff.paddingTop != null ? eff.paddingTop : 16;
    var pr = eff.paddingRight != null ? eff.paddingRight : 16;
    var pb = eff.paddingBottom != null ? eff.paddingBottom : 16;
    var pl = eff.paddingLeft != null ? eff.paddingLeft : 16;
    wrapper.style.padding = pt + "px " + pr + "px " + pb + "px " + pl + "px";

    // Phase 2: 4-side margin (only when not set by alignment)
    if (eff.marginTop || eff.marginRight || eff.marginBottom || eff.marginLeft) {
      var mt = eff.marginTop || "0";
      var mr = eff.marginRight || "0";
      var mb = eff.marginBottom || "0";
      var ml = eff.marginLeft || "0";
      wrapper.style.margin = mt + " " + mr + " " + mb + " " + ml;
    }

    // Sizing
    if (eff.minHeight) wrapper.style.minHeight = eff.minHeight + "px";
    if (eff.height) wrapper.style.height = eff.height;
    if (eff.maxHeight) wrapper.style.maxHeight = eff.maxHeight;
    if (eff.maxWidth) {
      wrapper.style.maxWidth = eff.maxWidth;
      if (eff.horizontalAlign === "center") {
        wrapper.style.marginLeft = "auto";
        wrapper.style.marginRight = "auto";
      }
    }
    if (eff.aspectRatio) wrapper.style.aspectRatio = eff.aspectRatio;

    // Grid/Flex child properties
    if (eff.span && eff.span > 1) {
      wrapper.style.gridColumn = "span " + eff.span;
    }
    if (parentDisplay === "flex") {
      if (eff.flexGrow != null) wrapper.style.flexGrow = String(eff.flexGrow);
      if (eff.flexShrink != null) wrapper.style.flexShrink = String(eff.flexShrink);
      if (eff.flexBasis) wrapper.style.flexBasis = eff.flexBasis;
      // Mirror the exported min-width:0 so the preview clips exactly like the output
      if (parentNode && isFlexRow(getEffectiveProps(parentNode, State.device))) {
        wrapper.style.minWidth = "0";
      }
    }
    if (eff.order != null && eff.order !== 0) {
      wrapper.style.order = String(eff.order);
    }

    // Phase 1: Position & Layer
    if (eff.position && eff.position !== "static") {
      wrapper.style.position = eff.position;
      if (eff.top) wrapper.style.top = eff.top;
      if (eff.right) wrapper.style.right = eff.right;
      if (eff.bottom) wrapper.style.bottom = eff.bottom;
      if (eff.left) wrapper.style.left = eff.left;
      if (eff.zIndex) wrapper.style.zIndex = eff.zIndex;
    }

    // Phase 1: Overflow
    if (eff.overflow && eff.overflow !== "visible") {
      wrapper.style.overflow = eff.overflow;
    }
    if (eff.overflowX) wrapper.style.overflowX = eff.overflowX;
    if (eff.overflowY) wrapper.style.overflowY = eff.overflowY;

    // Phase 3: Visual Styling
    if (eff.backgroundColor) wrapper.style.backgroundColor = eff.backgroundColor;
    if (eff.borderWidth && eff.borderStyle && eff.borderColor) {
      wrapper.style.border = eff.borderWidth + " " + eff.borderStyle + " " + eff.borderColor;
      wrapper.classList.add("has-custom-border");
    }
    if (eff.borderRadius) wrapper.style.borderRadius = eff.borderRadius;
    if (eff.boxShadow) wrapper.style.boxShadow = eff.boxShadow;
    if (eff.opacity && eff.opacity !== "1") wrapper.style.opacity = eff.opacity;
    if (eff.direction) wrapper.style.direction = eff.direction;

    // Tag badge on div
    var tag = el("div", "struct-div__tag");
    tag.appendChild(el("span", null, "<div"));
    if (node.customClass) {
      var cls = el("span", "struct-div__tag-class", "." + node.customClass);
      tag.appendChild(cls);
    }
    tag.appendChild(el("span", null, ">"));
    wrapper.appendChild(tag);

    // Floating action toolbar for selected node
    if (node.id === State.selectedId && node.id !== "root") {
      var tools = el("div", "struct-div__toolbar");

      // Quick Alignment Buttons in Floating Toolbar
      var bAlignL = el("button", "struct-tool-btn" + (eff.horizontalAlign === "left" ? " is-active" : ""), "⭰ Left");
      bAlignL.title = "Align Left";
      bAlignL.dataset.act = "align-left";
      tools.appendChild(bAlignL);

      var bAlignC = el("button", "struct-tool-btn" + (eff.horizontalAlign === "center" ? " is-active" : ""), "⭿ Center");
      bAlignC.title = "Align Center (margin: 0 auto)";
      bAlignC.dataset.act = "align-center";
      tools.appendChild(bAlignC);

      var bAlignR = el("button", "struct-tool-btn" + (eff.horizontalAlign === "right" ? " is-active" : ""), "⭲ Right");
      bAlignR.title = "Align Right";
      bAlignR.dataset.act = "align-right";
      tools.appendChild(bAlignR);

      var bAlignS = el("button", "struct-tool-btn" + (eff.horizontalAlign === "stretch" ? " is-active" : ""), "⭄ Stretch");
      bAlignS.title = "Stretch / Full Width";
      bAlignS.dataset.act = "align-stretch";
      tools.appendChild(bAlignS);

      tools.appendChild(el("div", "struct-tool-sep"));

      // GAP 1: Move Up / Move Down buttons
      var btnUp = el("button", "struct-tool-btn", "↑");
      btnUp.title = "Move Up (reorder sibling)";
      btnUp.dataset.act = "move-up";
      tools.appendChild(btnUp);

      var btnDown = el("button", "struct-tool-btn", "↓");
      btnDown.title = "Move Down (reorder sibling)";
      btnDown.dataset.act = "move-down";
      tools.appendChild(btnDown);

      tools.appendChild(el("div", "struct-tool-sep"));

      var btnAdd = el("button", "struct-tool-btn", "+ Child");
      btnAdd.title = "Add nested child div";
      btnAdd.dataset.act = "add-child";
      tools.appendChild(btnAdd);

      var btnSplit2 = el("button", "struct-tool-btn", "Split 2");
      btnSplit2.title = "Split into 2 columns";
      btnSplit2.dataset.act = "split-2";
      tools.appendChild(btnSplit2);

      var btnDup = el("button", "struct-tool-btn", "Clone");
      btnDup.title = "Duplicate this div";
      btnDup.dataset.act = "clone";
      tools.appendChild(btnDup);

      var btnDel = el("button", "struct-tool-btn struct-tool-btn--danger", "✕");
      btnDel.title = "Delete this div";
      btnDel.dataset.act = "delete";
      tools.appendChild(btnDel);

      wrapper.appendChild(tools);
    }

    // Render children or empty indicator
    if (!node.children.length) {
      var empty = el("div", "struct-empty-slot", "<div." + (node.customClass || "slot") + ">");
      wrapper.appendChild(empty);
    } else {
      node.children.forEach(function (child) {
        wrapper.appendChild(renderCanvasNode(child, node, depth + 1));
      });
    }

    return wrapper;
  }

  function renderCanvas() {
    canvas.innerHTML = "";

    if (!State.root.children.length) {
      var emptyState = el("div", "canvas-empty");
      emptyState.appendChild(el("div", "canvas-empty__icon", "❖"));
      emptyState.appendChild(el("strong", null, "Empty Layout Canvas"));
      emptyState.appendChild(el("span", null, "Select any structural div preset from the left panel to insert layout blocks."));
      canvas.appendChild(emptyState);
      return;
    }

    State.root.children.forEach(function (child) {
      canvas.appendChild(renderCanvasNode(child, State.root, 0));
    });
  }

  // ==========================================================================
  // DOM Hierarchy Tree View
  // ==========================================================================
  function renderTree() {
    treeContainer.innerHTML = "";

    function appendTreeNode(node, depth) {
      if (node.id !== "root") {
        var item = el("div", "tree-node" + (node.id === State.selectedId ? " is-selected" : ""));
        item.style.paddingLeft = (depth * 14 + 8) + "px";
        item.dataset.id = node.id;

        item.appendChild(el("span", "tree-node__tag", "div"));
        if (node.customClass) {
          item.appendChild(el("span", "tree-node__class", "." + node.customClass));
        } else {
          item.appendChild(el("span", "tree-node__class", "#" + node.id.substring(4)));
        }

        var eff = getEffectiveProps(node, State.device);
        var typeBadge = eff.display;
        if (eff.display === "grid") typeBadge = "grid (" + (eff.columns || 1) + "c)";
        else if (eff.display === "flex") typeBadge = "flex-" + (eff.flexDirection === "column" ? "col" : "row");
        if (eff.horizontalAlign && eff.horizontalAlign !== "stretch") {
          typeBadge += " · " + eff.horizontalAlign;
        }
        item.appendChild(el("span", "tree-node__type", typeBadge));

        treeContainer.appendChild(item);
      }

      node.children.forEach(function (child) {
        appendTreeNode(child, depth + 1);
      });
    }

    appendTreeNode(State.root, 0);
  }

  function renderProps() {
    propsBody.innerHTML = "";

    var node = findNode(State.selectedId);
    if (!node) {
      var empty = el("div", "prop-card");
      empty.appendChild(el("p", null, "Click any structural <div> on the canvas or DOM Tree to configure its responsive rules."));
      propsBody.appendChild(empty);
      return;
    }

    var dev = State.device;
    var eff = getEffectiveProps(node, dev);
    var isOverride = dev !== "desktop" && node.responsive[dev] && Object.keys(node.responsive[dev]).length > 0;

    // --- Helper: commit a responsive property ---
    function setProp(key, val) {
      commit(function () {
        if (!node.responsive[dev]) node.responsive[dev] = {};
        node.responsive[dev][key] = val;
      });
    }

    // --- Helper: segmented button bar ---
    function segBar(options, currentVal, onSelect) {
      var seg = el("div", "prop-seg");
      options.forEach(function (opt) {
        var btn = el("button", "prop-seg__btn" + (currentVal === opt[0] ? " is-active" : ""), opt[1]);
        btn.type = "button";
        btn.addEventListener("click", function () { onSelect(opt[0]); });
        seg.appendChild(btn);
      });
      return seg;
    }

    // ========================================================================
    // Card 1: DIV Identity
    // ========================================================================
    var idCard = el("div", "prop-card");
    var idHdr = el("div", "prop-card__header");
    idHdr.appendChild(el("span", "prop-card__title", "DIV Identity"));
    idHdr.appendChild(el("span", "prop-badge-device", "Editing: " + dev.toUpperCase()));
    idCard.appendChild(idHdr);

    var clsGrp = el("div", "prop-group");
    clsGrp.appendChild(el("label", "prop-label", "CSS Class Name"));
    var clsInp = el("input", "prop-input"); clsInp.type = "text"; clsInp.value = node.customClass || ""; clsInp.placeholder = "e.g. hero-container";
    clsInp.addEventListener("input", debounce(function (e) { commit(function () { node.customClass = e.target.value.trim(); }); }, 300));
    clsGrp.appendChild(clsInp);
    idCard.appendChild(clsGrp);

    if (dev !== "desktop") {
      var resetBtn = el("button", "btn-tree-action", isOverride ? "Reset to Desktop" : "Inherited");
      resetBtn.addEventListener("click", function () { commit(function () { node.responsive[dev] = {}; }); });
      idCard.appendChild(resetBtn);
    }

    // Hidden is available on every device, desktop included: a mobile-only
    // panel is hidden on desktop and switched back on at its breakpoint.
    var hidGrp = el("div", "prop-group");
    var hidLbl = el("label", "prop-label"); hidLbl.style.display = "flex"; hidLbl.style.alignItems = "center"; hidLbl.style.gap = "6px";
    var hidCb = el("input"); hidCb.type = "checkbox"; hidCb.checked = !!eff.hidden;
    hidCb.addEventListener("change", function (e) { setProp("hidden", e.target.checked); });
    hidLbl.appendChild(hidCb); hidLbl.appendChild(document.createTextNode("Hidden on " + dev)); hidGrp.appendChild(hidLbl);
    idCard.appendChild(hidGrp);

    propsBody.appendChild(idCard);

    // ========================================================================
    // Card 2: Alignment & Width
    // ========================================================================
    var alCard = el("div", "prop-card");
    var alHdr = el("div", "prop-card__header");
    alHdr.appendChild(el("span", "prop-card__title", "Alignment (" + dev + ")"));
    alCard.appendChild(alHdr);

    var hAlGrp = el("div", "prop-group");
    hAlGrp.appendChild(el("label", "prop-label", "Horizontal Alignment"));
    hAlGrp.appendChild(segBar([["left", "⭰ Left"], ["center", "⭿ Center"], ["right", "⭲ Right"], ["stretch", "⭄ Stretch"]], eff.horizontalAlign || "stretch", function (v) { setProp("horizontalAlign", v); }));
    alCard.appendChild(hAlGrp);

    // Cross-axis self alignment — lets one child opt out of the parent's
    // align-items, in either a flex or a grid container.
    var sAlGrp = el("div", "prop-group");
    sAlGrp.appendChild(el("label", "prop-label", "Align Self (cross axis)"));
    sAlGrp.appendChild(segBar([["", "Auto"], ["start", "Start"], ["center", "Center"], ["end", "End"], ["stretch", "Stretch"], ["baseline", "Baseline"]],
      eff.alignSelf || "", function (v) { setProp("alignSelf", v); }));
    alCard.appendChild(sAlGrp);

    var wGrp = el("div", "prop-group");
    wGrp.appendChild(el("label", "prop-label", "Width"));
    var wInp = el("input", "prop-input"); wInp.type = "text"; wInp.value = eff.width || ""; wInp.placeholder = "auto / 50% / 300px";
    wInp.addEventListener("input", debounce(function (e) { setProp("width", e.target.value.trim()); }, 300));
    wGrp.appendChild(wInp);
    var wPre = el("div", "quick-split-bar");
    [["Auto", ""], ["25%", "25%"], ["33%", "33.333%"], ["50%", "50%"], ["75%", "75%"], ["100%", "100%"]].forEach(function (p) {
      var btn = el("button", "btn-tree-action", p[0]); btn.type = "button";
      btn.addEventListener("click", function () { setProp("width", p[1]); }); wPre.appendChild(btn);
    });
    wGrp.appendChild(wPre);
    alCard.appendChild(wGrp);

    // Direction (RTL)
    var dirGrp = el("div", "prop-group");
    dirGrp.appendChild(el("label", "prop-label", "Direction"));
    dirGrp.appendChild(segBar([["", "Inherit"], ["ltr", "LTR →"], ["rtl", "← RTL"]], eff.direction || "", function (v) { setProp("direction", v); }));
    alCard.appendChild(dirGrp);

    // A2: Text Align
    var taGrp = el("div", "prop-group");
    taGrp.appendChild(el("label", "prop-label", "Text Align"));
    taGrp.appendChild(segBar([["left", "Left"], ["center", "Center"], ["right", "Right"], ["justify", "Justify"]], eff.textAlign || "left", function (v) { setProp("textAlign", v); }));
    alCard.appendChild(taGrp);

    propsBody.appendChild(alCard);

    // ========================================================================
    // Card 3: Container Display
    // ========================================================================
    var layCard = el("div", "prop-card");
    var layHdr = el("div", "prop-card__header");
    layHdr.appendChild(el("span", "prop-card__title", "Container Display (" + dev + ")"));
    layCard.appendChild(layHdr);

    var dispGrp = el("div", "prop-group");
    dispGrp.appendChild(el("label", "prop-label", "Display Mode"));
    dispGrp.appendChild(segBar([["grid", "GRID"], ["flex", "FLEX"], ["block", "BLOCK"]], eff.display, function (v) { setProp("display", v); }));
    layCard.appendChild(dispGrp);

    // Grid controls
    if (eff.display === "grid") {
      var autoGrp = el("div", "prop-group");
      autoGrp.appendChild(el("label", "prop-label", "Grid Mode"));
      autoGrp.appendChild(segBar([["", "Fixed Cols"], ["auto-fit", "Auto-Fit"], ["auto-fill", "Auto-Fill"]], eff.gridAutoMode || "", function (v) { setProp("gridAutoMode", v); }));
      layCard.appendChild(autoGrp);

      if (eff.gridAutoMode) {
        var mcwGrp = el("div", "prop-group");
        mcwGrp.appendChild(el("label", "prop-label", "Min Column Width"));
        var mcwInp = el("input", "prop-input"); mcwInp.type = "text"; mcwInp.value = eff.gridMinColWidth || "200px"; mcwInp.placeholder = "200px";
        mcwInp.addEventListener("input", debounce(function (e) { setProp("gridMinColWidth", e.target.value.trim()); }, 300));
        mcwGrp.appendChild(mcwInp); layCard.appendChild(mcwGrp);
      } else {
        var colGrp = el("div", "prop-group");
        colGrp.appendChild(el("label", "prop-label", "Grid Columns (" + (eff.columns || 1) + ")"));
        var colInp = el("input", "prop-input"); colInp.type = "number"; colInp.min = "1"; colInp.max = "12"; colInp.value = eff.columns || 1;
        colInp.addEventListener("change", function (e) { setProp("columns", parseInt(e.target.value, 10) || 1); });
        colGrp.appendChild(colInp); layCard.appendChild(colGrp);

        // A1: Custom Grid Template
        var ctGrp = el("div", "prop-group");
        ctGrp.appendChild(el("label", "prop-label", "Custom Template (overrides cols)"));
        var ctInp = el("input", "prop-input"); ctInp.type = "text"; ctInp.value = eff.customColumns || ""; ctInp.placeholder = "e.g. 1fr 3fr / 200px 1fr 1fr";
        ctInp.addEventListener("input", debounce(function (e) { setProp("customColumns", e.target.value.trim()); }, 300));
        ctGrp.appendChild(ctInp); layCard.appendChild(ctGrp);
      }

      var gapRow = el("div", "prop-group prop-row-2");
      var cgBox = el("div"); cgBox.appendChild(el("label", "prop-label", "Col Gap (px)"));
      var cgInp = el("input", "prop-input"); cgInp.type = "number"; cgInp.value = eff.gap != null ? eff.gap : 16;
      cgInp.addEventListener("change", function (e) { setProp("gap", parseInt(e.target.value, 10) || 0); });
      cgBox.appendChild(cgInp); gapRow.appendChild(cgBox);
      var rgBox = el("div"); rgBox.appendChild(el("label", "prop-label", "Row Gap (px)"));
      var rgInp = el("input", "prop-input"); rgInp.type = "number"; rgInp.value = eff.rowGap != null ? eff.rowGap : 16;
      rgInp.addEventListener("change", function (e) { setProp("rowGap", parseInt(e.target.value, 10) || 0); });
      rgBox.appendChild(rgInp); gapRow.appendChild(rgBox);
      layCard.appendChild(gapRow);

      // Grid justify-items & align-content
      var gaRow = el("div", "prop-group prop-row-2");
      var jiBox = el("div"); jiBox.appendChild(el("label", "prop-label", "Justify Items"));
      var jiSel = el("select", "prop-select");
      [["stretch", "Stretch"], ["start", "Start"], ["center", "Center"], ["end", "End"]].forEach(function (o) {
        var opt = el("option", null, o[1]); opt.value = o[0]; if (eff.justifyItems === o[0]) opt.selected = true; jiSel.appendChild(opt);
      });
      jiSel.addEventListener("change", function (e) { setProp("justifyItems", e.target.value); });
      jiBox.appendChild(jiSel); gaRow.appendChild(jiBox);
      var acBox = el("div"); acBox.appendChild(el("label", "prop-label", "Align Content"));
      var acSel = el("select", "prop-select");
      [["start", "Start"], ["center", "Center"], ["end", "End"], ["stretch", "Stretch"], ["space-between", "Between"], ["space-around", "Around"]].forEach(function (o) {
        var opt = el("option", null, o[1]); opt.value = o[0]; if (eff.alignContent === o[0]) opt.selected = true; acSel.appendChild(opt);
      });
      acSel.addEventListener("change", function (e) { setProp("alignContent", e.target.value); });
      acBox.appendChild(acSel); gaRow.appendChild(acBox);
      layCard.appendChild(gaRow);
    }

    // Flex controls
    if (eff.display === "flex") {
      var dGrp = el("div", "prop-group");
      dGrp.appendChild(el("label", "prop-label", "Flex Direction"));
      dGrp.appendChild(segBar([["row", "Row →"], ["column", "Column ↓"]], eff.flexDirection, function (v) { setProp("flexDirection", v); }));
      layCard.appendChild(dGrp);

      var wrGrp = el("div", "prop-group");
      wrGrp.appendChild(el("label", "prop-label", "Flex Wrap"));
      wrGrp.appendChild(segBar([["nowrap", "No Wrap"], ["wrap", "Wrap"]], eff.flexWrap, function (v) { setProp("flexWrap", v); }));
      layCard.appendChild(wrGrp);

      var faRow = el("div", "prop-group prop-row-2");
      var jBox = el("div"); jBox.appendChild(el("label", "prop-label", "Justify"));
      var jSel = el("select", "prop-select");
      [["flex-start", "Start"], ["center", "Center"], ["flex-end", "End"], ["space-between", "Between"], ["space-around", "Around"]].forEach(function (o) {
        var opt = el("option", null, o[1]); opt.value = o[0]; if (eff.justifyContent === o[0]) opt.selected = true; jSel.appendChild(opt);
      });
      jSel.addEventListener("change", function (e) { setProp("justifyContent", e.target.value); });
      jBox.appendChild(jSel); faRow.appendChild(jBox);
      var aBox = el("div"); aBox.appendChild(el("label", "prop-label", "Align Items"));
      var aSel = el("select", "prop-select");
      [["stretch", "Stretch"], ["flex-start", "Start"], ["center", "Center"], ["flex-end", "End"]].forEach(function (o) {
        var opt = el("option", null, o[1]); opt.value = o[0]; if (eff.alignItems === o[0]) opt.selected = true; aSel.appendChild(opt);
      });
      aSel.addEventListener("change", function (e) { setProp("alignItems", e.target.value); });
      aBox.appendChild(aSel); faRow.appendChild(aBox);
      layCard.appendChild(faRow);

      var fgGrp = el("div", "prop-group");
      fgGrp.appendChild(el("label", "prop-label", "Flex Gap (px)"));
      var fgInp = el("input", "prop-input"); fgInp.type = "number"; fgInp.value = eff.gap != null ? eff.gap : 16;
      fgInp.addEventListener("change", function (e) { setProp("gap", parseInt(e.target.value, 10) || 0); });
      fgGrp.appendChild(fgInp); layCard.appendChild(fgGrp);
    }
    propsBody.appendChild(layCard);

    // ========================================================================
    // Card 4: Sizing & 4-Side Spacing
    // ========================================================================
    var szCard = el("div", "prop-card");
    var szHdr = el("div", "prop-card__header");
    szHdr.appendChild(el("span", "prop-card__title", "Sizing & Spacing"));
    szCard.appendChild(szHdr);

    // Heights
    var hRow = el("div", "prop-group prop-row-2");
    var mhB = el("div"); mhB.appendChild(el("label", "prop-label", "Min Height (px)"));
    var mhI = el("input", "prop-input"); mhI.type = "number"; mhI.value = eff.minHeight != null ? eff.minHeight : 60;
    mhI.addEventListener("change", function (e) { setProp("minHeight", parseInt(e.target.value, 10) || 0); });
    mhB.appendChild(mhI); hRow.appendChild(mhB);
    var hB = el("div"); hB.appendChild(el("label", "prop-label", "Height"));
    var hI = el("input", "prop-input"); hI.type = "text"; hI.value = eff.height || ""; hI.placeholder = "auto / 100vh";
    hI.addEventListener("input", debounce(function (e) { setProp("height", e.target.value.trim()); }, 300));
    hB.appendChild(hI); hRow.appendChild(hB);
    szCard.appendChild(hRow);

    var mxRow = el("div", "prop-group prop-row-2");
    var mwB = el("div"); mwB.appendChild(el("label", "prop-label", "Max Width"));
    var mwI = el("input", "prop-input"); mwI.type = "text"; mwI.value = eff.maxWidth || ""; mwI.placeholder = "1200px";
    mwI.addEventListener("input", debounce(function (e) { setProp("maxWidth", e.target.value.trim()); }, 300));
    mwB.appendChild(mwI); mxRow.appendChild(mwB);
    var mhxB = el("div"); mhxB.appendChild(el("label", "prop-label", "Max Height"));
    var mhxI = el("input", "prop-input"); mhxI.type = "text"; mhxI.value = eff.maxHeight || ""; mhxI.placeholder = "80vh";
    mhxI.addEventListener("input", debounce(function (e) { setProp("maxHeight", e.target.value.trim()); }, 300));
    mhxB.appendChild(mhxI); mxRow.appendChild(mhxB);
    szCard.appendChild(mxRow);

    // Aspect Ratio
    var arGrp = el("div", "prop-group");
    arGrp.appendChild(el("label", "prop-label", "Aspect Ratio"));
    var arPre = el("div", "quick-split-bar");
    [["Auto", ""], ["1:1", "1/1"], ["4:3", "4/3"], ["16:9", "16/9"], ["21:9", "21/9"]].forEach(function (p) {
      var btn = el("button", "btn-tree-action" + (eff.aspectRatio === p[1] ? " is-active-preset" : ""), p[0]);
      btn.addEventListener("click", function () { setProp("aspectRatio", p[1]); }); arPre.appendChild(btn);
    });
    arGrp.appendChild(arPre); szCard.appendChild(arGrp);

    // 4-side Padding
    szCard.appendChild(el("label", "prop-label", "Padding (px) — T / R / B / L"));
    var padRow = el("div", "prop-group prop-row-4");
    ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"].forEach(function (key) {
      var b = el("div");
      var i = el("input", "prop-input"); i.type = "number"; i.value = eff[key] != null ? eff[key] : 16;
      i.addEventListener("change", function (e) {
        var v = parseInt(e.target.value, 10) || 0;
        if (eff.paddingLinked) {
          commit(function () { if (!node.responsive[dev]) node.responsive[dev] = {}; node.responsive[dev].paddingTop = v; node.responsive[dev].paddingRight = v; node.responsive[dev].paddingBottom = v; node.responsive[dev].paddingLeft = v; });
        } else { setProp(key, v); }
      });
      b.appendChild(i); padRow.appendChild(b);
    });
    szCard.appendChild(padRow);
    var plBtn = el("button", "btn-tree-action" + (eff.paddingLinked ? " is-active-preset" : ""), eff.paddingLinked ? "🔗 Linked" : "🔓 Per-Side");
    plBtn.addEventListener("click", function () { setProp("paddingLinked", !eff.paddingLinked); });
    szCard.appendChild(plBtn);

    // 4-side Margin
    szCard.appendChild(el("label", "prop-label", "Margin — T / R / B / L"));
    var marRow = el("div", "prop-group prop-row-4");
    ["marginTop", "marginRight", "marginBottom", "marginLeft"].forEach(function (key) {
      var b = el("div");
      var i = el("input", "prop-input"); i.type = "text"; i.value = eff[key] || ""; i.placeholder = "0";
      i.addEventListener("input", debounce(function (e) {
        var v = e.target.value.trim();
        if (eff.marginLinked) {
          commit(function () { if (!node.responsive[dev]) node.responsive[dev] = {}; node.responsive[dev].marginTop = v; node.responsive[dev].marginRight = v; node.responsive[dev].marginBottom = v; node.responsive[dev].marginLeft = v; });
        } else { setProp(key, v); }
      }, 300));
      b.appendChild(i); marRow.appendChild(b);
    });
    szCard.appendChild(marRow);
    var mlBtn = el("button", "btn-tree-action" + (eff.marginLinked ? " is-active-preset" : ""), eff.marginLinked ? "🔗 Linked" : "🔓 Per-Side");
    mlBtn.addEventListener("click", function () { setProp("marginLinked", !eff.marginLinked); });
    szCard.appendChild(mlBtn);
    propsBody.appendChild(szCard);

    // ========================================================================
    // Card 5: Position & Layer
    // ========================================================================
    var posCard = el("div", "prop-card");
    var posHdr = el("div", "prop-card__header");
    posHdr.appendChild(el("span", "prop-card__title", "Position & Layer"));
    posCard.appendChild(posHdr);

    var posGrp = el("div", "prop-group");
    posGrp.appendChild(el("label", "prop-label", "Position"));
    posGrp.appendChild(segBar([["static", "Static"], ["relative", "Rel"], ["absolute", "Abs"], ["fixed", "Fixed"], ["sticky", "Sticky"]], eff.position || "static", function (v) { setProp("position", v); }));
    posCard.appendChild(posGrp);

    if (eff.position && eff.position !== "static") {
      var oRow = el("div", "prop-group prop-row-4");
      ["top", "right", "bottom", "left"].forEach(function (s) {
        var b = el("div"); b.appendChild(el("label", "prop-label", s.charAt(0).toUpperCase() + s.slice(1)));
        var i = el("input", "prop-input"); i.type = "text"; i.value = eff[s] || ""; i.placeholder = "0";
        i.addEventListener("input", debounce(function (e) { setProp(s, e.target.value.trim()); }, 300));
        b.appendChild(i); oRow.appendChild(b);
      });
      posCard.appendChild(oRow);
      var zGrp = el("div", "prop-group");
      zGrp.appendChild(el("label", "prop-label", "Z-Index"));
      var zI = el("input", "prop-input"); zI.type = "text"; zI.value = eff.zIndex || ""; zI.placeholder = "auto / 1 / 10";
      zI.addEventListener("input", debounce(function (e) { setProp("zIndex", e.target.value.trim()); }, 300));
      zGrp.appendChild(zI); posCard.appendChild(zGrp);
    }

    var ovGrp = el("div", "prop-group");
    ovGrp.appendChild(el("label", "prop-label", "Overflow"));
    ovGrp.appendChild(segBar([["visible", "Visible"], ["hidden", "Hidden"], ["scroll", "Scroll"], ["auto", "Auto"]], eff.overflow || "visible", function (v) { setProp("overflow", v); }));
    posCard.appendChild(ovGrp);

    // A4: Overflow X/Y
    var oxRow = el("div", "prop-group prop-row-2");
    var oxBox = el("div"); oxBox.appendChild(el("label", "prop-label", "Overflow-X"));
    var oxSel = el("select", "prop-select");
    ["", "visible", "hidden", "scroll", "auto"].forEach(function (v) {
      var opt = el("option", null, v || "inherit"); opt.value = v; if (eff.overflowX === v) opt.selected = true; oxSel.appendChild(opt);
    });
    oxSel.addEventListener("change", function (e) { setProp("overflowX", e.target.value); });
    oxBox.appendChild(oxSel); oxRow.appendChild(oxBox);
    var oyBox = el("div"); oyBox.appendChild(el("label", "prop-label", "Overflow-Y"));
    var oySel = el("select", "prop-select");
    ["", "visible", "hidden", "scroll", "auto"].forEach(function (v) {
      var opt = el("option", null, v || "inherit"); opt.value = v; if (eff.overflowY === v) opt.selected = true; oySel.appendChild(opt);
    });
    oySel.addEventListener("change", function (e) { setProp("overflowY", e.target.value); });
    oyBox.appendChild(oySel); oxRow.appendChild(oyBox);
    posCard.appendChild(oxRow);

    propsBody.appendChild(posCard);

    // ========================================================================
    // Card 6: Visual Styling
    // ========================================================================
    var visCard = el("div", "prop-card");
    var visHdr = el("div", "prop-card__header");
    visHdr.appendChild(el("span", "prop-card__title", "Visual Style"));
    visCard.appendChild(visHdr);

    // Background
    var bgGrp = el("div", "prop-group");
    bgGrp.appendChild(el("label", "prop-label", "Background Color"));
    var bgR = el("div", "prop-row-2");
    var bg1 = el("div"); var bgC = el("input", "prop-input"); bgC.type = "color"; bgC.value = eff.backgroundColor || "#ffffff";
    bgC.style.height = "30px"; bgC.style.padding = "2px";
    bgC.addEventListener("input", function (e) { setProp("backgroundColor", e.target.value); });
    bg1.appendChild(bgC); bgR.appendChild(bg1);
    var bg2 = el("div"); var bgT = el("input", "prop-input"); bgT.type = "text"; bgT.value = eff.backgroundColor || ""; bgT.placeholder = "#hex / rgba()";
    bgT.addEventListener("input", debounce(function (e) { setProp("backgroundColor", e.target.value.trim()); }, 300));
    bg2.appendChild(bgT); bgR.appendChild(bg2);
    bgGrp.appendChild(bgR);
    var clrBg = el("button", "btn-tree-action", "✕ Clear");
    clrBg.addEventListener("click", function () { setProp("backgroundColor", ""); });
    bgGrp.appendChild(clrBg);
    visCard.appendChild(bgGrp);

    // Border
    var brRow = el("div", "prop-group prop-row-3");
    var bwB = el("div"); bwB.appendChild(el("label", "prop-label", "Width"));
    var bwI = el("input", "prop-input"); bwI.type = "text"; bwI.value = eff.borderWidth || ""; bwI.placeholder = "1px";
    bwI.addEventListener("input", debounce(function (e) { setProp("borderWidth", e.target.value.trim()); }, 300));
    bwB.appendChild(bwI); brRow.appendChild(bwB);
    var bsB = el("div"); bsB.appendChild(el("label", "prop-label", "Style"));
    var bsS = el("select", "prop-select");
    [["", "None"], ["solid", "Solid"], ["dashed", "Dashed"], ["dotted", "Dotted"]].forEach(function (o) {
      var opt = el("option", null, o[1]); opt.value = o[0]; if (eff.borderStyle === o[0]) opt.selected = true; bsS.appendChild(opt);
    });
    bsS.addEventListener("change", function (e) { setProp("borderStyle", e.target.value); });
    bsB.appendChild(bsS); brRow.appendChild(bsB);
    var bcB = el("div"); bcB.appendChild(el("label", "prop-label", "Color"));
    var bcI = el("input", "prop-input"); bcI.type = "color"; bcI.value = eff.borderColor || "#000000";
    bcI.style.height = "30px"; bcI.style.padding = "2px";
    bcI.addEventListener("input", function (e) { setProp("borderColor", e.target.value); });
    bcB.appendChild(bcI); brRow.appendChild(bcB);
    visCard.appendChild(brRow);

    // Radius
    var rdGrp = el("div", "prop-group");
    rdGrp.appendChild(el("label", "prop-label", "Border Radius"));
    var rdPre = el("div", "quick-split-bar");
    [["0", "0"], ["4px", "4px"], ["8px", "8px"], ["12px", "12px"], ["50%", "50%"]].forEach(function (p) {
      var btn = el("button", "btn-tree-action" + (eff.borderRadius === p[1] ? " is-active-preset" : ""), p[0]);
      btn.addEventListener("click", function () { setProp("borderRadius", p[1]); }); rdPre.appendChild(btn);
    });
    rdGrp.appendChild(rdPre);
    var rdI = el("input", "prop-input"); rdI.type = "text"; rdI.value = eff.borderRadius || ""; rdI.placeholder = "8px / 50%";
    rdI.addEventListener("input", debounce(function (e) { setProp("borderRadius", e.target.value.trim()); }, 300));
    rdGrp.appendChild(rdI); visCard.appendChild(rdGrp);

    // Shadow presets
    var shGrp = el("div", "prop-group");
    shGrp.appendChild(el("label", "prop-label", "Box Shadow"));
    var shPre = el("div", "quick-split-bar");
    [["None", ""], ["sm", "0 1px 3px rgba(0,0,0,0.12)"], ["md", "0 4px 12px rgba(0,0,0,0.15)"], ["lg", "0 10px 30px rgba(0,0,0,0.2)"]].forEach(function (p) {
      var btn = el("button", "btn-tree-action" + (eff.boxShadow === p[1] ? " is-active-preset" : ""), p[0]);
      btn.addEventListener("click", function () { setProp("boxShadow", p[1]); }); shPre.appendChild(btn);
    });
    shGrp.appendChild(shPre); visCard.appendChild(shGrp);

    // Opacity
    var opGrp = el("div", "prop-group");
    opGrp.appendChild(el("label", "prop-label", "Opacity: " + (eff.opacity || "1")));
    var opI = el("input", "prop-input"); opI.type = "range"; opI.min = "0"; opI.max = "1"; opI.step = "0.05"; opI.value = eff.opacity || "1";
    opI.addEventListener("input", function (e) { setProp("opacity", e.target.value); });
    opGrp.appendChild(opI); visCard.appendChild(opGrp);
    propsBody.appendChild(visCard);

    // ========================================================================
    // Card 7: Grid/Flex Child Rules
    // ========================================================================
    var chCard = el("div", "prop-card");
    var chHdr = el("div", "prop-card__header");
    chHdr.appendChild(el("span", "prop-card__title", "Grid/Flex Child Rules"));
    chCard.appendChild(chHdr);

    var chRow = el("div", "prop-group prop-row-3");
    var spB = el("div"); spB.appendChild(el("label", "prop-label", "Span"));
    var spI = el("input", "prop-input"); spI.type = "number"; spI.min = "1"; spI.max = "12"; spI.value = eff.span || 1;
    spI.addEventListener("change", function (e) { setProp("span", parseInt(e.target.value, 10) || 1); });
    spB.appendChild(spI); chRow.appendChild(spB);
    var grB = el("div"); grB.appendChild(el("label", "prop-label", "Grow"));
    var grI = el("input", "prop-input"); grI.type = "number"; grI.min = "0"; grI.value = eff.flexGrow != null ? eff.flexGrow : 1;
    grI.addEventListener("change", function (e) { setProp("flexGrow", parseInt(e.target.value, 10) || 0); });
    grB.appendChild(grI); chRow.appendChild(grB);
    var orB = el("div"); orB.appendChild(el("label", "prop-label", "Order"));
    var orI = el("input", "prop-input"); orI.type = "number"; orI.value = eff.order || 0;
    orI.addEventListener("change", function (e) { setProp("order", parseInt(e.target.value, 10) || 0); });
    orB.appendChild(orI); chRow.appendChild(orB);
    chCard.appendChild(chRow);

    var fbRow = el("div", "prop-group prop-row-2");
    var fsB = el("div"); fsB.appendChild(el("label", "prop-label", "Shrink"));
    var fsI = el("input", "prop-input"); fsI.type = "number"; fsI.min = "0"; fsI.value = eff.flexShrink != null ? eff.flexShrink : 1;
    fsI.addEventListener("change", function (e) { setProp("flexShrink", parseInt(e.target.value, 10) || 0); });
    fsB.appendChild(fsI); fbRow.appendChild(fsB);
    var fbB = el("div"); fbB.appendChild(el("label", "prop-label", "Basis"));
    var fbI = el("input", "prop-input"); fbI.type = "text"; fbI.value = eff.flexBasis || ""; fbI.placeholder = "auto / 0 / 200px";
    fbI.addEventListener("input", debounce(function (e) { setProp("flexBasis", e.target.value.trim()); }, 300));
    fbB.appendChild(fbI); fbRow.appendChild(fbB);
    chCard.appendChild(fbRow);
    propsBody.appendChild(chCard);

    // ========================================================================
    // Card 8: Quick Layout Splits
    // ========================================================================
    var actCard = el("div", "prop-card");
    var actHdr = el("div", "prop-card__header");
    actHdr.appendChild(el("span", "prop-card__title", "Quick Layout Splits"));
    actCard.appendChild(actHdr);
    var splitGrid = el("div", "quick-split-bar");
    [["Split 2 Cols", function () { splitNode(node.id, 2); }],
     ["Split 3 Cols", function () { splitNode(node.id, 3); }],
     ["+ Child Div", function () { addChildDiv(node.id); }],
     ["Wrap in Div", function () { wrapInParent(node.id); }]
    ].forEach(function (item) {
      var btn = el("button", "btn-quick-action", item[0]);
      btn.addEventListener("click", item[1]); splitGrid.appendChild(btn);
    });
    var delBtn = el("button", "btn-quick-action btn-quick-action--danger", "Delete Div");
    delBtn.addEventListener("click", function () { commit(function () { removeNode(node.id); }); });
    splitGrid.appendChild(delBtn);
    actCard.appendChild(splitGrid);
    propsBody.appendChild(actCard);
  }
  // ==========================================================================
  // Chrome & UI Rendering
  // ==========================================================================
  // Which breakpoint a given viewport width actually lands in. This is the same
  // rule the exported @media queries use, so the preview cannot disagree with them.
  function deviceForWidth(w) {
    var bp = State.breakpoints;
    if (w <= bp.mobile) return "mobile";
    if (w <= bp.tablet) return "tablet";
    return "desktop";
  }

  function currentWidth() {
    return State.customWidth != null ? State.customWidth : PRESET_WIDTH[State.device];
  }

  // Flags breakpoint coverage the layout is missing. The three presets can all
  // look correct while a whole range between them has no rules at all.
  function collectExportWarnings() {
    var warns = [];
    var anyTablet = false, anyMobile = false;
    var mobileOnly = [];
    walk(State.root, function (node) {
      if (node.id === "root") return;
      var hasT = node.responsive.tablet && Object.keys(node.responsive.tablet).length > 0;
      var hasM = node.responsive.mobile && Object.keys(node.responsive.mobile).length > 0;
      if (hasT) anyTablet = true;
      if (hasM) anyMobile = true;
      if (hasM && !hasT) mobileOnly.push(node.customClass || node.name || node.id);
    });
    var bp = State.breakpoints;
    if (!anyTablet && anyMobile) {
      warns.push("No tablet rules anywhere — every width from " + (bp.mobile + 1) + "px to " +
        bp.tablet + "px falls straight through to the desktop layout.");
    } else if (mobileOnly.length) {
      warns.push(mobileOnly.length + " div" + (mobileOnly.length > 1 ? "s have" : " has") +
        " mobile rules but no tablet rules (." + mobileOnly.slice(0, 3).join(", .") +
        (mobileOnly.length > 3 ? ", …" : "") + ") — unstyled between " +
        (bp.mobile + 1) + "px and " + bp.tablet + "px.");
    }
    return warns;
  }

  function renderExportWarnings() {
    if (!exportWarnings) return;
    exportWarnings.innerHTML = "";
    var warns = collectExportWarnings();
    if (!warns.length) {
      exportWarnings.appendChild(el("span", "export-ok", "\u2713 Pure DIV hierarchy \u00b7 desktop, tablet and mobile breakpoints all covered"));
      return;
    }
    warns.forEach(function (w) {
      exportWarnings.appendChild(el("span", "export-warn", "\u26a0 " + w));
    });
    exportWarnings.appendChild(el("span", "export-ok", "\u2713 Pure DIV hierarchy \u00b7 drag the width ruler to check the gap."));
  }

  function renderChrome() {
    btnUndo.disabled = !History.canUndo();
    btnRedo.disabled = !History.canRedo();
    statusNodes.textContent = countNodes() + " structural divs";

    var selNode = findNode(State.selectedId);
    if (selNode) {
      statusSelection.innerHTML = "Selected: <strong>&lt;div." + (selNode.customClass || selNode.id) + "&gt;</strong>";
    } else {
      statusSelection.innerHTML = "Selected: <em>None</em>";
    }

    var bp = State.breakpoints;
    var devNames = {
      desktop: "Desktop (Base > " + bp.tablet + "px)",
      tablet: "Tablet (≤ " + bp.tablet + "px)",
      mobile: "Mobile (≤ " + bp.mobile + "px)"
    };
    statusDevice.innerHTML = "Active: <strong>" + devNames[State.device] + "</strong>" +
      " &nbsp;|&nbsp; BP: Tablet <input id='bp-tab' type='number' value='" + bp.tablet + "' style='width:52px;background:var(--bg-card);color:var(--fg-base);border:1px solid var(--line-base);border-radius:3px;padding:1px 4px;font-size:11px;'>px" +
      " Mobile <input id='bp-mob' type='number' value='" + bp.mobile + "' style='width:52px;background:var(--bg-card);color:var(--fg-base);border:1px solid var(--line-base);border-radius:3px;padding:1px 4px;font-size:11px;'>px";

    var bpTabEl = document.getElementById("bp-tab");
    var bpMobEl = document.getElementById("bp-mob");
    if (bpTabEl) bpTabEl.addEventListener("change", function (e) { State.breakpoints.tablet = parseInt(e.target.value, 10) || 992; render(); });
    if (bpMobEl) bpMobEl.addEventListener("change", function (e) { State.breakpoints.mobile = parseInt(e.target.value, 10) || 576; render(); });

    var w = currentWidth();
    if (State.customWidth != null) {
      frame.classList.add("is-custom-width");
      frame.style.width = w + "px";
      viewportBadge.textContent = w + "px \u2192 " + devNames[State.device] + " rules";
    } else {
      frame.classList.remove("is-custom-width");
      frame.style.width = "";
      viewportBadge.textContent = devNames[State.device] + " \u00b7 " + w + "px";
    }
    frame.dataset.device = State.device;

    if (vpRange && document.activeElement !== vpRange) vpRange.value = String(w);
    if (vpWidth && document.activeElement !== vpWidth) vpWidth.value = String(w);

    document.querySelectorAll(".device-btn").forEach(function (b) {
      b.classList.toggle("is-active", b.dataset.device === State.device);
    });
  }

  function render() {
    renderCanvas();
    renderTree();
    renderProps();
    renderChrome();
  }

  // ==========================================================================
  // Live Code Generator (Pure Responsive HTML & CSS)
  // ==========================================================================
  function updateExportModalContent() {
    renderExportWarnings();
    if (State.exportTab === "combined") {
      codeOutput.textContent = generateFullHtmlDocument();
    } else if (State.exportTab === "html") {
      codeOutput.textContent = generateCleanHtml(State.root, 0);
    } else if (State.exportTab === "css") {
      codeOutput.textContent = generateResponsiveCss();
    }
  }

  // ==========================================================================
  // Event Listeners & Interactions
  // ==========================================================================

  // Preset Card Clicks
  document.querySelectorAll(".preset-card").forEach(function (card) {
    card.addEventListener("click", function () {
      var presetKey = card.dataset.preset;
      var newDiv = createPresetDiv(presetKey);

      commit(function () {
        var targetParentId = "root";
        if (State.selectedId) {
          var selNode = findNode(State.selectedId);
          if (selNode) targetParentId = selNode.id;
        }
        insertNode(targetParentId, newDiv);
        State.selectedId = newDiv.id;
      });
    });
  });

  // Canvas Interactions & Floating Tools
  canvas.addEventListener("click", function (event) {
    var tool = event.target.closest(".struct-tool-btn");
    if (tool && State.selectedId) {
      event.stopPropagation();
      var act = tool.dataset.act;

      if (act === "align-left" || act === "align-center" || act === "align-right" || act === "align-stretch") {
        var alignVal = act.replace("align-", "");
        var sel = findNode(State.selectedId);
        if (sel) {
          commit(function () {
            if (!sel.responsive[State.device]) sel.responsive[State.device] = {};
            sel.responsive[State.device].horizontalAlign = alignVal;
          });
        }
        return;
      }

      if (act === "add-child") addChildDiv(State.selectedId);
      else if (act === "split-2") splitNode(State.selectedId, 2);
      else if (act === "clone") commit(function () { duplicateNode(State.selectedId); });
      else if (act === "delete") commit(function () { removeNode(State.selectedId); });
      // GAP 1: Move Up / Move Down sibling reorder
      else if (act === "move-up") commit(function () { moveNode(State.selectedId, -1); });
      else if (act === "move-down") commit(function () { moveNode(State.selectedId, 1); });
      return;
    }

    var structDiv = event.target.closest(".struct-div");
    if (structDiv) {
      event.stopPropagation();
      State.selectedId = structDiv.dataset.id;
      render();
    } else {
      State.selectedId = null;
      render();
    }
  });

  // DOM Tree Click
  treeContainer.addEventListener("click", function (event) {
    var treeNode = event.target.closest(".tree-node");
    if (treeNode) {
      State.selectedId = treeNode.dataset.id;
      render();
    }
  });

  // Left Panel Tab Navigation
  document.querySelectorAll(".panel__nav-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var tab = btn.dataset.tab;
      State.activeTab = tab;
      document.querySelectorAll(".panel__nav-btn").forEach(function (b) { b.classList.remove("is-active"); });
      document.querySelectorAll(".panel__tab-pane").forEach(function (p) { p.classList.remove("is-active"); });
      btn.classList.add("is-active");
      document.getElementById("pane-" + tab).classList.add("is-active");
      if (tab === "tree") renderTree();
    });
  });

  // Device Switcher
  document.getElementById("device-switch").addEventListener("click", function (event) {
    var btn = event.target.closest(".device-btn");
    if (!btn) return;
    State.device = btn.dataset.device;
    State.customWidth = null;   // picking a preset leaves free-width mode
    render();
  });

  // --------------------------------------------------------------------------
  // Free-width viewport ruler
  // --------------------------------------------------------------------------
  function setCustomWidth(px) {
    var w = parseInt(px, 10);
    if (isNaN(w)) return;
    w = Math.max(200, Math.min(2560, w));
    State.customWidth = w;
    State.device = deviceForWidth(w);   // preview follows the real @media rules
    render();
  }

  if (vpRange) vpRange.addEventListener("input", function (e) { setCustomWidth(e.target.value); });
  if (vpWidth) vpWidth.addEventListener("input", function (e) { setCustomWidth(e.target.value); });
  if (vpReset) vpReset.addEventListener("click", function () {
    State.customWidth = null;
    render();
  });

  // Undo / Redo / Clear
  btnUndo.addEventListener("click", function () {
    if (History.undo()) render();
  });

  btnRedo.addEventListener("click", function () {
    if (History.redo()) render();
  });

  btnClear.addEventListener("click", function () {
    commit(function () {
      State.root.children.length = 0;
      State.selectedId = null;
    });
  });

  // Keyboard Shortcuts
  document.addEventListener("keydown", function (event) {
    var meta = event.ctrlKey || event.metaKey;
    if (meta && event.key.toLowerCase() === "z" && !event.shiftKey) {
      event.preventDefault();
      if (History.undo()) render();
    } else if (meta && (event.key.toLowerCase() === "y" || (event.shiftKey && event.key.toLowerCase() === "z"))) {
      event.preventDefault();
      if (History.redo()) render();
    } else if ((event.key === "Delete" || event.key === "Backspace") && State.selectedId && event.target === document.body) {
      event.preventDefault();
      var id = State.selectedId;
      commit(function () { removeNode(id); });
    }
  });

  // Export Modal Handlers
  btnExport.addEventListener("click", function () {
    updateExportModalContent();
    exportModal.classList.add("is-open");
  });

  btnModalClose.addEventListener("click", function () {
    exportModal.classList.remove("is-open");
  });

  exportModal.addEventListener("click", function (e) {
    if (e.target === exportModal) exportModal.classList.remove("is-open");
  });

  document.querySelectorAll(".modal-tab").forEach(function (tabBtn) {
    tabBtn.addEventListener("click", function () {
      document.querySelectorAll(".modal-tab").forEach(function (t) { t.classList.remove("is-active"); });
      tabBtn.classList.add("is-active");
      State.exportTab = tabBtn.dataset.tab;
      updateExportModalContent();
    });
  });

  btnCopyCode.addEventListener("click", function () {
    var text = codeOutput.textContent;
    navigator.clipboard.writeText(text).then(function () {
      btnCopyCode.textContent = "✓ Copied!";
      setTimeout(function () { btnCopyCode.textContent = "Copy Code"; }, 2000);
    });
  });

  btnDownloadHtml.addEventListener("click", function () {
    var doc = generateFullHtmlDocument();
    var blob = new Blob([doc], { type: "text/html" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "responsive-layout.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  // ==========================================================================
  // Initialize with a Clean Responsive Div Wireframe Preset
  // ==========================================================================
  (function initDemo() {
    var container = createPresetDiv("container");
    var grid3 = createPresetDiv("grid3");
    container.children.push(grid3);
    State.root.children.push(container);
    State.selectedId = grid3.id;
  })();

  render();

})();
