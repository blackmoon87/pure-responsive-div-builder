# htmlCreator MCP Server

Exposes the Pure Responsive DIV Generator as **22 MCP tools** for AI agents.

All HTML/CSS emission lives in `../generator.js`, shared with the browser
builder — the MCP server and the UI cannot produce different CSS for the same
tree.

## Quick Start

```bash
cd mcp-server
npm install
node index.js   # Starts on stdio
```

## Add to Antigravity

Add to `~/.gemini/config/mcp_config.json`:

```json
{
  "htmlcreator": {
    "command": "node",
    "args": ["/Users/blackmoon/Downloads/htmlCreator/mcp-server/index.js"],
    "transport": "stdio"
  }
}
```

## Tools

### Tree Management
| Tool | Description |
|---|---|
| `build_tree` | **Create a whole subtree from one nested spec** — the fast path. `{ class, name?, desktop?, tablet?, mobile?, children?[] }`. Prefer this over dozens of `create_div`/`set_props` calls |
| `create_div` | Create a child div (`parentId`, `name`, `customClass`) |
| `delete_div` | Delete a div (`nodeId`) |
| `move_div` | Reorder within siblings (`nodeId`, `direction`) |
| `clone_div` | Duplicate div + children (`nodeId`) |
| `wrap_div` | Wrap in parent div (`nodeId`) |
| `split_div` | Split into N columns (`nodeId`, `columns`) |
| `list_tree` | View full tree structure |
| `get_node` | Get node state (`nodeId`) |

### Properties
| Tool | Description |
|---|---|
| `set_props` | Set responsive props (`nodeId`, `device`, `props`) — **all 47 emittable declarations are overridable on every tier** |
| `reset_device` | Clear a tier's overrides (`nodeId`, `device`) |
| `list_devices` | List the device ladder: every tier's key, media query and parent |

### The device ladder

`device` on `set_props` / `reset_device`, and the per-tier objects on `build_tree`,
take any of these keys. Each `max` tier inherits from the tier above it, so an
override restates only what differs from the wider tier — not the whole cascade.

| Tier | Media query | Inherits from | Preview |
|---|---|---|---|
| `ultrawide` | `@media (min-width: 1600px)` | desktop | 1920px |
| `desktop` | *(base rule — no media query)* | — | 1280px |
| `laptop` | `@media (max-width: 1200px)` | desktop | 1100px |
| `tablet` | `@media (max-width: 992px)` | laptop | 768px |
| `mobile` | `@media (max-width: 576px)` | tablet | 375px |
| `mobileSm` | `@media (max-width: 400px)` | mobile | 360px |

`set_breakpoints` moves any of these pixel values: `set_breakpoints({ laptop: 1280, mobileSm: 380 })`.

### Property groups accepted by `set_props`

| Group | Properties |
|---|---|
| Display | `display`, `columns`, `customColumns`, `gridAutoMode`, `gridMinColWidth` |
| Container alignment | `justifyContent`, `alignItems`, `justifyItems`, `alignContent`, `flexDirection`, `flexWrap`, `gap`, `rowGap` |
| Self alignment | `horizontalAlign`, `alignSelf`, `textAlign` |
| Sizing | `width`, `height`, `maxWidth`, `maxHeight`, `minHeight`, `aspectRatio` |
| Spacing | `paddingTop/Right/Bottom/Left`, `marginTop/Right/Bottom/Left` |
| Position | `position`, `top`, `right`, `bottom`, `left`, `zIndex`, `overflow`, `overflowX`, `overflowY` |
| Visual | `backgroundColor`, `borderWidth`, `borderStyle`, `borderColor`, `borderRadius`, `boxShadow`, `opacity`, `transform`, `transition`, `backdropFilter` |
| Child rules | `span`, `flexGrow`, `flexShrink`, `flexBasis`, `order` |
| Visibility | `hidden`, `direction` |

**`hidden` works on every device, both ways.** Set it on `desktop` and clear it
at a breakpoint to build a mobile-only panel:

```
set_props(nodeId, device: "desktop", props: { hidden: true })
set_props(nodeId, device: "mobile",  props: { hidden: false, display: "flex" })
```

### Export
| Tool | Description |
|---|---|
| `export_html` | Clean HTML output |
| `export_css` | Responsive CSS with media queries |
| `export_full` | Complete HTML document |
| `export_json` | Document as JSON — a `{ version, breakpoints, root }` envelope, so breakpoints survive the round-trip |
| `import_json` | Load a document. Accepts the envelope or a bare legacy root. Validates the shape and returns the offending path (e.g. `root.children[0] is missing responsive{}`) instead of throwing |

### Config
| Tool | Description |
|---|---|
| `set_breakpoints` | Set tablet/mobile px values |
| `reset_all` | Clear tree and restore default breakpoints |
| `undo` / `redo` | 50-deep history. **Every mutating tool records history**, including `reset_device`, `import_json`, `set_breakpoints` and `reset_all` |

## Example — one call instead of thirty

```js
build_tree({ spec: {
  class: "app-shell",
  desktop: { display: "grid", customColumns: "260px 1fr" },
  mobile:  { customColumns: "1fr" },
  children: [
    { class: "sidebar", desktop: { position: "sticky", top: "0" }, mobile: { hidden: true } },
    { class: "content", children: [{ class: "card" }, { class: "card" }] }
  ]
}})
export_full()
```

## Example

```
create_div(parentId: "root", customClass: "header")
set_props(nodeId: "div_xxx", device: "desktop", props: { position: "sticky", top: "0" })
split_div(nodeId: "div_yyy", columns: 3)
set_props(nodeId: "div_yyy", device: "mobile", props: { columns: 1 })
export_full()
```
