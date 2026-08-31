#!/usr/bin/env node
// ============================================================================
// htmlCreator MCP Server — Exposes the Pure Responsive DIV Generator as tools
// ============================================================================
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as core from "./core.js";

// The device enums are derived from the ladder in generator.js, so adding a
// tier there reaches every tool here without a second edit.
const DEVICE_ENUM = core.DEVICE_KEYS;
const OVERRIDE_ENUM = core.DEVICE_KEYS.filter((k) => k !== "desktop");
const LADDER = core.DEVICES.map((d) =>
  d.type === "base"
    ? `${d.key} (base, no media query)`
    : `${d.key} (${d.type}-width: ${d.defaultPx}px)`
).join(", ");

const server = new McpServer({
  name: "htmlcreator",
  version: "1.0.0"
});

// ============================================================================
// Tool: create_div
// ============================================================================
server.tool(
  "create_div",
  "Create a new child div inside a parent node",
  {
    parentId: z.string().describe("ID of the parent node (use 'root' for top-level)"),
    name: z.string().optional().describe("Display name for the div"),
    customClass: z.string().optional().describe("CSS class name for the div"),
    index: z.number().optional().describe("Insert position (0-based). Omit to append at end.")
  },
  async ({ parentId, name, customClass, index }) => {
    core.pushHistory();
    const child = core.addChildDiv(parentId, name, customClass, index);
    if (!child) return { content: [{ type: "text", text: "Error: parent node '" + parentId + "' not found" }] };
    return { content: [{ type: "text", text: JSON.stringify({ id: child.id, name: child.name, customClass: child.customClass }, null, 2) }] };
  }
);

// ============================================================================
// Tool: delete_div
// ============================================================================
server.tool(
  "delete_div",
  "Delete a div node and all its children",
  {
    nodeId: z.string().describe("ID of the node to delete")
  },
  async ({ nodeId }) => {
    core.pushHistory();
    const ok = core.removeNode(nodeId);
    return { content: [{ type: "text", text: ok ? "Deleted " + nodeId : "Error: node not found" }] };
  }
);

// ============================================================================
// Tool: move_div
// ============================================================================
server.tool(
  "move_div",
  "Move a div up or down within its siblings",
  {
    nodeId: z.string().describe("ID of the node to move"),
    direction: z.enum(["up", "down"]).describe("Direction to move")
  },
  async ({ nodeId, direction }) => {
    core.pushHistory();
    const ok = core.moveNode(nodeId, direction);
    return { content: [{ type: "text", text: ok ? "Moved " + nodeId + " " + direction : "Error: cannot move" }] };
  }
);

// ============================================================================
// Tool: clone_div
// ============================================================================
server.tool(
  "clone_div",
  "Duplicate a div and all its children",
  {
    nodeId: z.string().describe("ID of the node to clone")
  },
  async ({ nodeId }) => {
    core.pushHistory();
    const dup = core.duplicateNode(nodeId);
    if (!dup) return { content: [{ type: "text", text: "Error: node not found" }] };
    return { content: [{ type: "text", text: "Cloned as " + dup.id }] };
  }
);

// ============================================================================
// Tool: wrap_div
// ============================================================================
server.tool(
  "wrap_div",
  "Wrap a div inside a new parent div",
  {
    nodeId: z.string().describe("ID of the node to wrap")
  },
  async ({ nodeId }) => {
    core.pushHistory();
    const wrapper = core.wrapInParent(nodeId);
    if (!wrapper) return { content: [{ type: "text", text: "Error: node not found" }] };
    return { content: [{ type: "text", text: "Wrapped in " + wrapper.id }] };
  }
);

// ============================================================================
// Tool: split_div
// ============================================================================
server.tool(
  "split_div",
  "Split a div into N equal grid columns",
  {
    nodeId: z.string().describe("ID of the node to split"),
    columns: z.number().min(2).max(12).describe("Number of columns (2-12)")
  },
  async ({ nodeId, columns }) => {
    core.pushHistory();
    const ok = core.splitNode(nodeId, columns);
    return { content: [{ type: "text", text: ok ? "Split into " + columns + " columns" : "Error: node not found" }] };
  }
);

// ============================================================================
// Tool: list_tree
// ============================================================================
server.tool(
  "list_tree",
  "Get the full div tree structure",
  {},
  async () => {
    const tree = core.listTree();
    const lines = tree.map(n => "  ".repeat(n.depth) + n.id + (n.customClass ? " ." + n.customClass : "") + " [" + n.display + "] (" + n.childCount + " children)");
    return { content: [{ type: "text", text: lines.join("\n") }] };
  }
);

// ============================================================================
// Tool: get_node
// ============================================================================
server.tool(
  "get_node",
  "Get a single node's full state including responsive properties",
  {
    nodeId: z.string().describe("ID of the node")
  },
  async ({ nodeId }) => {
    const node = core.findNode(nodeId);
    if (!node) return { content: [{ type: "text", text: "Error: node not found" }] };
    return { content: [{ type: "text", text: JSON.stringify(node, null, 2) }] };
  }
);

// ============================================================================
// Tool: set_props
// ============================================================================
server.tool(
  "set_props",
  "Set responsive properties on a div for one tier of the device ladder (" + LADDER + "). " +
  "Each max-width tier inherits from the tier above it, so you only set what differs. Props can include: display, columns, gap, flexDirection, flexWrap, justifyContent, alignItems, horizontalAlign, alignSelf, width, height, maxWidth, maxHeight, minHeight, aspectRatio, paddingTop/Right/Bottom/Left, marginTop/Right/Bottom/Left, position, top/right/bottom/left, zIndex, overflow, backgroundColor, borderWidth, borderStyle, borderColor, borderRadius, boxShadow, opacity, transform, transition, backdropFilter, span, flexGrow, flexShrink, flexBasis, order, hidden, direction, gridAutoMode, gridMinColWidth, justifyItems, alignContent",
  {
    nodeId: z.string().describe("ID of the node"),
    device: z.enum(DEVICE_ENUM).describe("Device tier on the ladder: " + LADDER),
    props: z.record(z.any()).describe("Object of property key-value pairs to set")
  },
  async ({ nodeId, device, props }) => {
    core.pushHistory();
    const ok = core.setProps(nodeId, device, props);
    if (!ok) return { content: [{ type: "text", text: "Error: node not found" }] };
    const eff = core.getEffectiveProps(core.findNode(nodeId), device);
    return { content: [{ type: "text", text: "Set " + Object.keys(props).length + " props on " + nodeId + " (" + device + ")\nEffective: " + JSON.stringify(eff, null, 2) }] };
  }
);

// ============================================================================
// Tool: build_tree
// ============================================================================
server.tool(
  "build_tree",
  "Create a whole subtree from one compact nested spec — the fast path for building a page. " +
  "Each node is { class, name?, children?[] } plus an optional props object for any tier of " +
  "the device ladder (" + LADDER + "), e.g. { class: 'hero', desktop: {...}, tablet: {...}, " +
  "mobileSm: {...} }. Those objects take the same properties as set_props. Prefer this over dozens of create_div/" +
  "set_props calls: the shipped examples would otherwise need 31-64 round trips each.",
  {
    spec: z.union([z.record(z.any()), z.array(z.record(z.any()))])
      .describe("A node spec, or an array of them, to append under parentId"),
    parentId: z.string().optional().describe("Parent node id (default: root)"),
    replace: z.boolean().optional().describe("Remove the parent's existing children first (default: false)")
  },
  async ({ spec, parentId, replace }) => {
    core.pushHistory();
    const res = core.buildTree(spec, parentId, replace);
    if (!res.ok) return { content: [{ type: "text", text: "Error: " + res.error }] };
    return { content: [{ type: "text", text:
      "Created " + res.created + " divs under " + (parentId || "root") +
      "\nTop-level ids: " + res.rootIds.join(", ") +
      "\n\n" + core.listTree().map(n => "  ".repeat(n.depth) + (n.customClass || n.name) + "  [" + n.id + "]").join("\n") }] };
  }
);

// ============================================================================
// Tool: reset_device
// ============================================================================
server.tool(
  "reset_device",
  "Clear all responsive overrides for a device breakpoint on a node",
  {
    nodeId: z.string().describe("ID of the node"),
    device: z.enum(OVERRIDE_ENUM).describe("Tier to reset (cannot reset desktop, which is the base rule)")
  },
  async ({ nodeId, device }) => {
    core.pushHistory();
    const ok = core.resetDevice(nodeId, device);
    return { content: [{ type: "text", text: ok ? "Reset " + device + " overrides on " + nodeId : "Error: node not found" }] };
  }
);

// ============================================================================
// Tool: export_html
// ============================================================================
server.tool(
  "export_html",
  "Export clean HTML structure (div tags with classes only)",
  {},
  async () => {
    const html = core.generateCleanHtml(core.state.root, 1);
    return { content: [{ type: "text", text: html }] };
  }
);

// ============================================================================
// Tool: export_css
// ============================================================================
server.tool(
  "export_css",
  "Export responsive CSS with media queries",
  {
    breakpoints: z.record(z.number()).optional()
      .describe("Optional breakpoint overrides keyed by tier, e.g. { laptop: 1280, mobileSm: 380 }"),
    tabletBreakpoint: z.number().optional().describe("Deprecated alias for breakpoints.tablet"),
    mobileBreakpoint: z.number().optional().describe("Deprecated alias for breakpoints.mobile")
  },
  async ({ breakpoints, tabletBreakpoint, mobileBreakpoint }) => {
    if (breakpoints) core.setBreakpoints(breakpoints);
    if (tabletBreakpoint || mobileBreakpoint) {
      core.setBreakpoints(tabletBreakpoint, mobileBreakpoint);
    }
    const css = core.generateResponsiveCss();
    return { content: [{ type: "text", text: css }] };
  }
);

// ============================================================================
// Tool: export_full
// ============================================================================
server.tool(
  "export_full",
  "Export complete HTML document with embedded CSS",
  {},
  async () => {
    const doc = core.generateFullHtmlDocument();
    return { content: [{ type: "text", text: doc }] };
  }
);

// ============================================================================
// Tool: export_json
// ============================================================================
server.tool(
  "export_json",
  "Export the full tree state as JSON (for saving/restoring)",
  {},
  async () => {
    const tree = core.getTreeJson();
    return { content: [{ type: "text", text: JSON.stringify(tree, null, 2) }] };
  }
);

// ============================================================================
// Tool: import_json
// ============================================================================
server.tool(
  "import_json",
  "Import a tree state from JSON (replaces current state)",
  {
    tree: z.record(z.any()).describe("Full tree JSON object (as exported by export_json)")
  },
  async ({ tree }) => {
    core.pushHistory();
    const res = core.importTreeJson(tree);
    if (!res.ok) return { content: [{ type: "text", text: "Error: invalid tree — " + res.error }] };
    const count = core.listTree().length;
    const bpText = Object.keys(res.breakpoints).map((k) => k + "=" + res.breakpoints[k] + "px").join(", ");
    return { content: [{ type: "text", text: "Imported tree with " + count + " nodes (breakpoints: " + bpText + ")" }] };
  }
);

// ============================================================================
// Tool: set_breakpoints
// ============================================================================
server.tool(
  "set_breakpoints",
  "Set the pixel value of any tier on the device ladder (" + LADDER + "). " +
  "Pass only the tiers you want to change.",
  Object.fromEntries(
    core.DEVICES.filter((d) => d.defaultPx != null).map((d) => [
      d.key,
      z.number().optional().describe(d.label + " " + d.type + "-width breakpoint (default " + d.defaultPx + ")")
    ])
  ),
  async (args) => {
    core.pushHistory();
    const bp = core.setBreakpoints(args);
    return { content: [{ type: "text", text: "Breakpoints: " +
      Object.keys(bp).map((k) => k + "=" + bp[k] + "px").join(", ") }] };
  }
);

// ============================================================================
// Tool: list_devices
// ============================================================================
server.tool(
  "list_devices",
  "List every tier of the responsive device ladder: its key, the media query it " +
  "emits, and which tier it inherits from. Use this to discover valid device keys.",
  {},
  async () => {
    const bp = core.state.breakpoints;
    const rows = core.DEVICES.map((d) => ({
      key: d.key,
      label: d.label,
      query: d.type === "base" ? "(base rule — no media query)"
        : "@media (" + (d.type === "min" ? "min-width" : "max-width") + ": " + bp[d.key] + "px)",
      inheritsFrom: d.inherits || "(none — this is the base)",
      previewWidth: d.previewWidth + "px"
    }));
    return { content: [{ type: "text", text: JSON.stringify(rows, null, 2) }] };
  }
);

// ============================================================================
// Tool: reset_all
// ============================================================================
server.tool(
  "reset_all",
  "Clear the entire tree and start fresh with a clean page root",
  {},
  async () => {
    core.pushHistory();
    core.resetAll();
    return { content: [{ type: "text", text: "Reset complete. Empty page root ready. (undo restores the previous tree)" }] };
  }
);

// ============================================================================
// Tool: undo
// ============================================================================
server.tool(
  "undo",
  "Undo the last tree mutation",
  {},
  async () => {
    const ok = core.undo();
    const status = core.historyStatus();
    return { content: [{ type: "text", text: ok ? "Undone. " + status.undoCount + " more undos available." : "Nothing to undo." }] };
  }
);

// ============================================================================
// Tool: redo
// ============================================================================
server.tool(
  "redo",
  "Redo the last undone mutation",
  {},
  async () => {
    const ok = core.redo();
    const status = core.historyStatus();
    return { content: [{ type: "text", text: ok ? "Redone. " + status.redoCount + " more redos available." : "Nothing to redo." }] };
  }
);

// ============================================================================
// Tool: reparent_div
// ============================================================================
server.tool(
  "reparent_div",
  "Move a div to a different parent node",
  {
    nodeId: z.string().describe("ID of the node to move"),
    newParentId: z.string().describe("ID of the new parent node"),
    index: z.number().optional().describe("Insert position in new parent (0-based). Omit to append.")
  },
  async ({ nodeId, newParentId, index }) => {
    core.pushHistory();
    const ok = core.reparentNode(nodeId, newParentId, index);
    return { content: [{ type: "text", text: ok ? "Moved " + nodeId + " to " + newParentId : "Error: invalid move (node not found or circular)" }] };
  }
);

// ============================================================================
// Start
// ============================================================================
const transport = new StdioServerTransport();
await server.connect(transport);
