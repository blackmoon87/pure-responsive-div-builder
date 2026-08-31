# Layout Examples Showcase 🎨

This folder contains **10 production-ready responsive layout examples** built using the Pure Responsive DIV Generator architecture.

Every file in this folder is **100% pure `<div>`s only**, standalone, fully responsive across all device sizes, and demonstrates modern CSS Grid, Flexbox, Positioning, Aspect Ratios, and RTL patterns.

---

## 📊 Overview of Included Examples

| # | File | Complexity | Key Layout Techniques Demonstrated |
|---|---|---|---|
| **01** | [`01-simple-centered-card.html`](01-simple-centered-card.html) | 🟢 Simple | Viewport centering, max-width constraints, box shadows, 4-side padding, mobile button stack |
| **02** | [`02-responsive-navbar.html`](02-responsive-navbar.html) | 🟡 Medium | `position: sticky`, `z-index: 100`, flex space-between, desktop row to mobile column stack |
| **03** | [`03-pricing-tables-3col.html`](03-pricing-tables-3col.html) | 🟡 Medium | 3-column grid, featured card with custom border/glow; at tablet the grid drops to 2 columns and the featured card becomes a full-width banner (`span 2` + `order: -1`) with the other two paired beneath it; mobile 1-col |
| **04** | [`04-ecommerce-product-grid.html`](04-ecommerce-product-grid.html) | 🟠 Advanced | Intrinsic `repeat(auto-fit, minmax(260px, 1fr))`, `aspect-ratio: 4/3`, toolbar search/filter |
| **05** | [`05-holy-grail-layout.html`](05-holy-grail-layout.html) | 🟠 Advanced | Holy Grail 3-column grid (`240px 1fr 280px`), sticky header & footer, mobile `order` reordering |
| **06** | [`06-complex-saas-dashboard.html`](06-complex-saas-dashboard.html) | 🔴 Very Complex | 12-column grid, persistent sidebar, 4-KPI stat row, asymmetric 2:1 chart (`span 8` + `span 4`), data table |
| **07** | [`07-arabic-rtl-news-portal.html`](07-arabic-rtl-news-portal.html) | 🔴 Very Complex (RTL) | Native `dir="rtl"`, breaking news ribbon, 2:1 lead story hero, 3-column sub-grid, 4-column footer |
| **08** | [`08-modal-overlay-system.html`](08-modal-overlay-system.html) | 🔴 Very Complex | Fixed full-viewport backdrop (`inset: 0` + `z-index: 1000`), `rgba()` scrim + `backdrop-filter: blur(12px) saturate(140%)`, flex-centred dialog, `transform`/`transition` entrance state, becomes a bottom **sheet** on mobile (`align-items: end`, full-bleed, `column-reverse` stacked buttons, animation cleared) |
| **09** | [`09-app-shell-collapsing-sidebar.html`](09-app-shell-collapsing-sidebar.html) | 🔴 Very Complex | Sticky full-height rail `260px → 76px → hidden`, and the **hide/re-show pair**: the mobile nav is `hidden` on desktop and switched back on at its breakpoint. Auto-fit KPI row, `span 2` chart that re-flows |
| **10** | [`10-editorial-magazine-grid.html`](10-editorial-magazine-grid.html) | 🔴 Very Complex | Asymmetric `1.6fr 1fr` hero and `1fr 300px` body, `1fr auto 1fr` masthead, grid-level `align-items`/`justify-content`, `align-self` on children, sticky aside that unpins at tablet, auto-fit story stream, wrapped tag strip with `align-content` |

---

## 🚀 How to Run & Preview

Open any `.html` file directly in your browser:

```bash
# In the project root:
open examples/01-simple-centered-card.html
open examples/08-modal-overlay-system.html
open examples/10-editorial-magazine-grid.html
open examples/07-arabic-rtl-news-portal.html
```

Or visit `http://localhost:8080/examples/` when running `python3 -m http.server 8080`.
