# htmlCreator MCP Server

Exposes the Pure Responsive DIV Generator as **16 MCP tools** for AI agents.

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
| `set_props` | Set responsive props (`nodeId`, `device`, `props`) |
| `reset_device` | Clear device overrides (`nodeId`, `device`) |

### Export
| Tool | Description |
|---|---|
| `export_html` | Clean HTML output |
| `export_css` | Responsive CSS with media queries |
| `export_full` | Complete HTML document |
| `export_json` | Tree state as JSON |
| `import_json` | Load tree from JSON |

### Config
| Tool | Description |
|---|---|
| `set_breakpoints` | Set tablet/mobile px values |
| `reset_all` | Clear tree, start fresh |

## Example

```
create_div(parentId: "root", customClass: "header")
set_props(nodeId: "div_xxx", device: "desktop", props: { position: "sticky", top: "0" })
split_div(nodeId: "div_yyy", columns: 3)
set_props(nodeId: "div_yyy", device: "mobile", props: { columns: 1 })
export_full()
```
