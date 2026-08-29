# Tests

## Node suites

```bash
node test/run.js        # or: npm test  (from mcp-server/)
```

Exits non-zero on failure.

| Suite | What it guards |
|---|---|
| `suites/regression.js` | One test per bug that shipped once — `justify-self` outside a grid, missing `min-width: 0` on flex/grid children, unwrapped `auto-fit` minimums, properties unreachable at breakpoints, one-way `hidden`, lost breakpoints on JSON round-trip, unvalidated `import_json`, mutations that skipped history, and the two generators drifting apart |
| `suites/property-coverage.js` | Sets **every** property on **every** device and asserts it reaches the CSS. Once measured 27/43 at breakpoints while reporting success |
| `suites/examples.js` | Every `.json` reproduces its `.html` byte-for-byte; every example is pure `<div>` with only `class`/`dir` and no text content |

`mcp-server/test.js` is a separate, older smoke test over the 20 MCP tools.

## Browser sweep

```bash
python3 -m http.server 8080
# open http://localhost:8080/test/responsive.html
```

Loads every example at each width from 320px to 1440px in 20px steps (570 checks)
and measures every div against the viewport edge. The page title becomes
`PASS —` or `FAIL —` so it can be automated.

## Content stress

```bash
# open http://localhost:8080/test/content-stress.html
```

Injects what a developer actually puts in — an unbreakable long word, a bare URL,
an oversized image, a wall of text, a wide table — into every leaf div of five
layouts at five widths, then measures whether any div is pushed past the viewport.

The examples ship **empty**, so the ordinary sweep never exercises this. The
project's promise is that the skeleton stays responsive regardless of content, and
this is the only check that tests that promise. It caught `.action-slot` bursting
by 1100px with a table inside.

**Why the sweep isn't a Node test:** it measures real layout. And it deliberately does
not use `scrollWidth` — the exported reset sets `overflow-x: hidden` on `body`,
so an overflowing element produces no scrollbar. The page looks clean while
content is silently clipped; only per-element geometry finds it. Every layout
bug found in this project was invisible to a scrollbar check.
