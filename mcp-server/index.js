#!/usr/bin/env node
// ============================================================================
// htmlCreator MCP Server — Exposes the Pure Responsive DIV Generator as tools
// ============================================================================
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as core from "./core.js";

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
  "Set responsive properties on a div for a specific device breakpoint. Props can include: display, columns, gap, flexDirection, flexWrap, justifyContent, alignItems, horizontalAlign, width, height, maxWidth, maxHeight, minHeight, aspectRatio, paddingTop/Right/Bottom/Left, marginTop/Right/Bottom/Left, position, top/right/bottom/left, zIndex, overflow, backgroundColor, borderWidth, borderStyle, borderColor, borderRadius, boxShadow, opacity, span, flexGrow, flexShrink, flexBasis, order, direction, gridAutoMode, gridMinColWidth, justifyItems, alignContent",
  {
    nodeId: z.string().describe("ID of the node"),
    device: z.enum(["desktop", "tablet", "mobile"]).describe("Device breakpoint"),
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
// Tool: reset_device
// ============================================================================
server.tool(
  "reset_device",
  "Clear all responsive overrides for a device breakpoint on a node",
  {
    nodeId: z.string().describe("ID of the node"),
    device: z.enum(["tablet", "mobile"]).describe("Device to reset (cannot reset desktop)")
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
    tabletBreakpoint: z.number().optional().describe("Tablet breakpoint in px (default 992)"),
    mobileBreakpoint: z.number().optional().describe("Mobile breakpoint in px (default 576)")
  },
  async ({ tabletBreakpoint, mobileBreakpoint }) => {
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
    return { content: [{ type: "text", text: "Imported tree with " + count + " nodes (breakpoints: tablet=" +
      res.breakpoints.tablet + "px, mobile=" + res.breakpoints.mobile + "px)" }] };
  }
);

// ============================================================================
// Tool: set_breakpoints
// ============================================================================
server.tool(
  "set_breakpoints",
  "Set custom tablet and mobile breakpoint pixel values",
  {
    tablet: z.number().optional().describe("Tablet breakpoint (default 992)"),
    mobile: z.number().optional().describe("Mobile breakpoint (default 576)")
  },
  async ({ tablet, mobile }) => {
    core.pushHistory();
    const bp = core.setBreakpoints(tablet, mobile);
    return { content: [{ type: "text", text: "Breakpoints: tablet=" + bp.tablet + "px, mobile=" + bp.mobile + "px" }] };
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
