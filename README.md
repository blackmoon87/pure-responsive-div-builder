# Pure Responsive DIV Generator & Layout Builder ⚡

[![HTML5](https://img.shields.io/badge/HTML5-Pure%20DIVs%20Only-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://github.com/blackmoon87/pure-responsive-div-builder)
[![CSS3](https://img.shields.io/badge/CSS3-Modern%20Grid%20%26%20Flexbox-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://github.com/blackmoon87/pure-responsive-div-builder)
[![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla%20ES5%20Zero%20Deps-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://github.com/blackmoon87/pure-responsive-div-builder)
[![MCP Server](https://img.shields.io/badge/MCP%20Server-20%20AI%20Agent%20Tools-8A2BE2?style=for-the-badge&logo=anthropic&logoColor=white)](https://github.com/blackmoon87/pure-responsive-div-builder/tree/main/mcp-server)
[![RTL Supported](https://img.shields.io/badge/RTL-Arabic%20%26%20Hebrew%20Ready-10B981?style=for-the-badge)](https://github.com/blackmoon87/pure-responsive-div-builder)

> **A high-performance visual wireframe builder & responsive HTML5/CSS3 layout generator that generates 100% pure, unbloated `<div>` hierarchies with modern CSS Grid, Flexbox, RTL support, and a built-in MCP Server for AI coding agents.**

---

## 🚀 Why Pure DIV Generator?

Most website builders inject bloated wrappers, framework dependencies, non-semantic tags, and megabytes of JavaScript. 

**Pure Responsive DIV Generator follows a strict zero-bloat philosophy:**
- 🧱 **100% Pure `<div>` Tags:** Clean, predictable structural wireframes. No unauthorized tags or inline junk.
- 📐 **Zero Dependencies:** Pure Vanilla JavaScript & CSS. No frameworks, no build step, no bundlers needed.
- 📱 **Triple-Breakpoint Responsive Engine:** Desktop (>992px), tablet (≤992px), and mobile (≤576px) rules, with editable live breakpoints and a free-width ruler for previewing any viewport in between — the ranges where layouts actually break.
- 🌐 **First-Class RTL (Right-to-Left) Support:** Native `dir="rtl"` and `direction: rtl` export for Arabic, Hebrew, and Persian layouts.
- 🤖 **Model Context Protocol (MCP) Server:** Exposes 20 programmatic layout tools for AI agents (Claude, Cursor, Antigravity, Windsurf) to generate and edit responsive layouts autonomously.

---

## 🎯 Key Features

| Feature | Description |
|---|---|
| **Modern Display Modes** | CSS Grid (1-12 columns, custom ratios `1fr 3fr`, auto-fit, auto-fill, `justify-items`, `align-content`, `justify-content`, `align-items`), Flexbox (row/column, wrap, `justify-content`, `align-items`, `align-content` on wrapped lines), Block |
| **Self-Alignment** | Horizontal: Left, Center (`margin: 0 auto`), Right, Stretch (+ `justify-self` under a grid parent). Cross-axis: `align-self` (start/center/end/stretch/baseline) |
| **Complete Sizing** | `width`, `height`, `min-height`, `max-width`, `max-height`, `aspect-ratio` presets (1:1, 4:3, 16:9, 21:9) |
| **4-Side Spacing** | Individual Top/Right/Bottom/Left padding & margins with linked 🔗 toggle |
| **Layer & Positioning** | `static`, `relative`, `absolute`, `fixed`, `sticky` + offsets (top/right/bottom/left) + `z-index` |
| **Overflow Control** | Combined + independent `overflow-x` / `overflow-y` (`visible`, `hidden`, `scroll`, `auto`) |
| **Visual Styling** | Color picker + Hex background, custom borders (width/style/color), border-radius presets, box-shadows, opacity slider, `transform`, `transition`, `backdrop-filter` (auto `-webkit-` prefixed) |
| **Child Rules** | Column span (1-12), `flex-grow`, `flex-shrink`, `flex-basis`, `order` |
| **Instant Export** | Clean HTML, responsive CSS with media queries, or single-file combined HTML with download & clipboard copy |
| **Overlays** | Modals, drawers and popovers: fixed full-viewport backdrop with `rgba()` scrim + `backdrop-filter`, flex-centred dialog, `transform`/`transition` for entrance states. Ship it `hidden` and open it from your own JS with `el.style.display = 'flex'` — every other declaration survives |
| **Show / Hide** | `hidden` per device on every breakpoint including desktop — hide a sidebar on phones, or keep a mobile-only panel `display: none` on desktop and switch it back on at its breakpoint |
| **Undo / Redo** | 50-deep snapshot history with keyboard shortcuts (`Ctrl+Z`, `Ctrl+Y`, `Del`) |

---

## 📖 Quick Start

### Run the Web Builder (Local)
No installation or build required! Simply serve the directory with any static server:

```bash
# Clone the repository
git clone https://github.com/blackmoon87/pure-responsive-div-builder.git
cd pure-responsive-div-builder

# Run with Python (or any HTTP server)
python3 -m http.server 8080
```
Open **`http://localhost:8080`** in your browser.

---

## 🎨 Interactive Layout Examples & Code Walkthroughs

### Example 1: 12-Column Modern Dashboard Layout (Sidebar + Grid Cards)

A responsive admin dashboard with a sticky sidebar and asymmetric metric cards.

```
┌─────────────────────────────────────────────────────────────┐
│ Header (Sticky, 100% width, min-height 60px)                │
├──────────────┬──────────────────────────────────────────────┤
│ Sidebar      │ Main Content Area                            │
│ (Span 3)     │ (Span 9 Grid: 3 metric cards + chart area)   │
│              │ ┌──────────────┬──────────────┬─────────────┐│
│              │ │ Metric 1     │ Metric 2     │ Metric 3    ││
│              │ ├──────────────┴──────────────┴─────────────┤│
│              │ │ Main Analytics Chart (Span 3)             ││
│              │ └───────────────────────────────────────────┘│
└──────────────┴──────────────────────────────────────────────┘
```

#### Generated HTML:
```html
<div class="dashboard-root">
  <div class="dash-header"></div>
  <div class="dash-body">
    <div class="dash-sidebar"></div>
    <div class="dash-content">
      <div class="metric-card"></div>
      <div class="metric-card"></div>
      <div class="metric-card"></div>
      <div class="chart-container"></div>
    </div>
  </div>
</div>
```

#### Generated Responsive CSS:
```css
/* Desktop */
.dashboard-root { display: flex; flex-direction: column; min-height: 100vh; }
.dash-header { display: block; position: sticky; top: 0; min-height: 60px; padding: 16px 24px; z-index: 10; }
.dash-body { display: grid; grid-template-columns: 260px 1fr; gap: 20px; padding: 20px; }
.dash-content { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.chart-container { grid-column: span 3; min-height: 350px; }

/* Tablet (≤ 992px) */
@media (max-width: 992px) {
  .dash-body { grid-template-columns: 1fr; }
  .dash-content { grid-template-columns: repeat(2, 1fr); }
  .chart-container { grid-column: span 2; }
}

/* Mobile (≤ 576px) */
@media (max-width: 576px) {
  .dash-content { grid-template-columns: 1fr; }
  .chart-container { grid-column: span 1; }
}
```

---

### Example 2: Asymmetric Hero Section (1:3 Custom Ratio)

Using `customColumns: "1fr 3fr"` for a sleek hero split with text on the left and a showcase media box on the right.

```html
<div class="hero-container">
  <div class="hero-text-col"></div>
  <div class="hero-media-col"></div>
</div>
```

```css
.hero-container {
  display: grid;
  grid-template-columns: 1fr 3fr;
  gap: 32px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  align-items: center;
}

@media (max-width: 768px) {
  .hero-container {
    grid-template-columns: 1fr;
  }
}
```

---

### Example 3: Auto-Fit E-Commerce Product Grid

Responsive auto-fitting cards that automatically adjust column count without media queries:

```html
<div class="product-catalog">
  <div class="product-card"></div>
  <div class="product-card"></div>
  <div class="product-card"></div>
  <div class="product-card"></div>
</div>
```

```css
.product-catalog {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  padding: 24px;
}
.product-card {
  aspect-ratio: 4/3;
  border-radius: 12px;
  background-color: #f8fafc;
}
```

---

### Example 4: RTL (Right-to-Left) Arabic/Hebrew Multi-Column Article Layout

Native RTL support with `dir="rtl"` and responsive flow:

```html
<div class="article-layout" dir="rtl">
  <div class="article-sidebar"></div>
  <div class="article-main"></div>
</div>
```

```css
.article-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
  direction: rtl;
}
```

---

## 🤖 MCP Server (For AI Coding Agents)

The project includes a standalone **Model Context Protocol (MCP)** server under `mcp-server/` allowing LLMs like Claude, Cursor, Antigravity, and Windsurf to create and manipulate responsive layouts programmatically.

### MCP Tools List (20 Tools)

| Category | Tools |
|---|---|
| **Tree Management** | `create_div`, `delete_div`, `move_div`, `clone_div`, `wrap_div`, `split_div`, `reparent_div`, `list_tree`, `get_node` |
| **Properties** | `set_props` (50+ properties across desktop/tablet/mobile), `reset_device` |
| **Export** | `export_html`, `export_css`, `export_full`, `export_json`, `import_json` |
| **Config & History** | `set_breakpoints`, `reset_all`, `undo`, `redo` |

### Installing MCP Server in Antigravity / Claude / Cursor

Add to your `mcp_config.json`:
```json
{
  "htmlcreator": {
    "command": "node",
    "args": ["/path/to/pure-responsive-div-builder/mcp-server/index.js"],
    "transport": "stdio"
  }
}
```

### Example AI Agent Prompt
> *"Create a responsive 3-column pricing table inside a centered 1200px container. On tablet make it 2 columns, and on mobile make it 1 column with 16px gap. Then export full HTML."*

The agent will autonomously execute:
1. `create_div(parentId: "root", name: "Container", customClass: "pricing-container")`
2. `set_props(nodeId: "div_1", device: "desktop", props: { maxWidth: "1200px", horizontalAlign: "center" })`
3. `split_div(nodeId: "div_1", columns: 3)`
4. `set_props(nodeId: "div_1", device: "tablet", props: { columns: 2 })`
5. `set_props(nodeId: "div_1", device: "mobile", props: { columns: 1, gap: 16 })`
6. `export_full()`

---

## 📚 Technical Documentation

For an exhaustive technical breakdown of every function, algorithm, data structure, edge case, and guard in the codebase, read:
👉 **[how.it.works.md](how.it.works.md)** *(Comprehensive 18-Section Reference)*

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + Z` / `Cmd + Z` | Undo last action |
| `Ctrl + Y` / `Cmd + Shift + Z` | Redo action |
| `Delete` / `Backspace` | Delete currently selected `<div>` |

---

## 📄 License

MIT License © 2026 [blackmoon87](https://github.com/blackmoon87)

---

## 🏗️ Architecture: one generator, two surfaces

HTML and CSS emission lives in a single module, **`generator.js`**, which is pure and state-free — every entry point takes the tree and breakpoints as arguments:

```
generator.js  ──┬──►  builder.js        (browser UI, ES module)
                └──►  mcp-server/core.js (MCP server state + tools)
                          └──►  generate_examples.js
```

Previously `builder.js` and `mcp-server/core.js` each carried their own copy of the emitter. They drifted: the MCP path silently dropped `overflow-x`/`overflow-y` and tablet/mobile `horizontalAlign`, so agents received a success response and CSS that ignored the properties they had set. **Any change to emitted CSS now belongs in `generator.js` and reaches both surfaces at once.**

All 47 emittable declarations are produced by one ordered list in `generator.js`, used for desktop **and** both breakpoints — a breakpoint override block is computed by diffing that list against the wider device, so every property is overridable at every device and none can be forgotten. Clearing a property at a breakpoint emits a neutral value (`border: none`, `max-width: none`) rather than silently inheriting.

Because `builder.js` is an ES module, the builder must be served over HTTP (`python3 -m http.server 8080`) — opening `index.html` via `file://` will not work.
