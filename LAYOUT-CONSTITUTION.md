# Responsive Layout Constitution

Rules for generating responsive HTML/CSS layouts by hand. Each rule exists
because its absence produced a real, reproducible break — the reason is stated
so you can tell when a rule genuinely does not apply.

Derived from the Pure Responsive DIV Generator engine (`generator.js`). Use this
when writing layout CSS directly, instead of driving that engine.

---

## 0. Scope

This governs **layout and containment** — display, tracks, sizing, spacing,
breakpoints, overflow. It says nothing about semantics, typography, colour or
content. Where a host project's own conventions conflict, the host wins.

---

## 1. The breakpoint ladder

Six tiers. Desktop is the **base rule and carries no media query**. Every
`max-width` tier inherits from the tier directly above it. `ultrawide` is a
`min-width` tier and branches off the base.

| Tier | Query | Inherits from |
|---|---|---|
| ultrawide | `@media (min-width: 1600px)` | desktop |
| **desktop** | *(base — no query)* | — |
| laptop | `@media (max-width: 1200px)` | desktop |
| tablet | `@media (max-width: 992px)` | laptop |
| mobile | `@media (max-width: 576px)` | tablet |
| small | `@media (max-width: 400px)` | mobile |

**§1.1 — Emission order is law.** Base rule first. Then the `min-width` block.
Then every `max-width` block **widest first**. All blocks have equal
specificity, so the later one wins; out of order, a phone rule loses to a
tablet rule and the layout silently breaks only on phones.

**§1.2 — Diff against the inherited tier, never against the base.** At 400px
the mobile block is *already in force*. A small-phone rule restates only what
differs from **mobile**, not the whole cascade. Repeating the cascade is not
merely verbose — it makes the wider tier impossible to edit safely later.

**§1.3 — Do not invent tiers per component.** One ladder for the whole
document. A component that needs a bespoke width boundary wants a container
query, not a seventh global breakpoint.

**§1.4 — Skipping tiers is allowed and normal.** Most elements need rules at
two or three tiers. Emitting an empty block is worse than emitting none.

---

## 2. Undoing a declaration at a breakpoint

**§2.1 — A property you stop declaring does not disappear.** It keeps the value
from the tier above. To *remove* an effect at a narrower tier you must state a
neutral value explicitly.

| Property | Neutral |
|---|---|
| `width` `height` | `auto` |
| `max-width` `max-height` | `none` |
| `aspect-ratio` | `auto` |
| `min-height` `min-width` | `0` |
| `margin` `padding` | `0` |
| `position` | `static` |
| `top` `right` `bottom` `left` `z-index` | `auto` |
| `overflow`(`-x`/`-y`) | `visible` |
| `background-color` | `transparent` |
| `border` | `none` |
| `border-radius` | `0` |
| `box-shadow` `transform` `transition` `backdrop-filter` | `none` |
| `opacity` | `1` |
| `grid-column` | `auto` |
| `order` | `0` |
| `flex-grow` | `0` |
| `flex-shrink` | `1` |
| `flex-basis` | `auto` |
| `align-self` | `auto` |
| `justify-self` `justify-items` | `stretch` |
| `flex-wrap` | `nowrap` |
| `text-align` | `left` (or your base's value — see §2.3) |
| `direction` | `inherit` |
| `grid-template-columns` | `none` |

**§2.2 — `min-height: 0` is the most-missed one.** A `min-height: 400px` hero
does not shrink on a phone by being left unmentioned. State `min-height: 0`.

**§2.3 — Neutrals mirror *your* base, not the CSS initial value.** If your base
rule sets `align-items: stretch`, that is the neutral for `align-items`, not
`normal`.

---

## 3. Containment — no box may burst its parent

**§3.1 — Every flex and grid child gets `min-width: 0`.** Both have an
automatic minimum size of `min-content`. Without this, one unbreakable word, a
bare URL, or a wide `<table>` widens the track until the whole layout overflows
the viewport. On a block box it costs nothing. **Apply it unconditionally** —
not only where the parent is currently flex, because a parent that flips from
`row` to `column` at a breakpoint hands the burst straight back.

**§3.2 — Ship this reset.** It is the difference between a layout that holds
whatever is put in it and one that only holds your placeholder content.

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 100%; overflow-x: hidden; overflow-wrap: break-word; }
div { max-width: 100%; }                     /* loses to any class rule */
img, video, canvas, iframe, svg, table { max-width: 100%; }
img, video { height: auto; }
```

`div { max-width: 100% }` is an element selector, so an authored `max-width` on
a class still wins where one is set deliberately.

**§3.3 — Never rely on the viewport not having a scrollbar.** Test every layout
at 320px. `100vw` includes the scrollbar width; `100%` does not. Prefer `100%`.

---

## 4. Grid

**§4.1 — Intrinsic before manual.** Prefer
`repeat(auto-fit, minmax(min(260px, 100%), 1fr))` over hand-written column
counts per breakpoint. It needs no media query at all and cannot be wrong at a
width you forgot to test.

**§4.2 — The `min()` in that pattern is mandatory.** Plain
`minmax(260px, 1fr)` overflows any viewport narrower than 260px plus padding.
`min(260px, 100%)` collapses cleanly instead.

**§4.3 — A span must be smaller than the track count whenever siblings
remain.** `grid-column: span 2` in a 2-column grid consumes the entire row, so
that item can never sit beside a sibling. Left in source order among three
items it strands the other two on half-empty rows. Either reduce the span, or
pair it with `order` so it deliberately becomes a full-width band at the top or
bottom of the grid.

**§4.4 — Restate every span the tracks change under.** A `span 8` survives into
a 2-column tier as a silent overflow. When the column count changes at a tier,
the spans in that grid change with it or are neutralised to `auto`.

**§4.5 — `justify-content` distributes *tracks*; `justify-items` aligns items
*within* their track.** Reaching for the wrong one is the usual cause of "the
gap is in the wrong place".

---

## 5. Flex

**§5.1 — `flex-grow`, `flex-shrink` and `flex-basis` style a flex *item*.** They
depend on the **parent** being flex, not on the element itself being flex. A
flex container inside a block parent gets none of them; they are inert there.

**§5.2 — `align-content` does nothing until lines can wrap.** Emit it only
alongside `flex-wrap: wrap`.

**§5.3 — A `nowrap` row is a commitment.** Combined with §3.1 it is safe; without
it, it is the single most common source of horizontal overflow.

**§5.4 — Reordering is visual only.** `order` and `row-reverse` do not change
DOM order, so they do not change tab order or screen-reader order. Use them for
layout, never to express a reading sequence.

---

## 6. Position, layer, overflow

**§6.1 — `position: sticky` fails silently** if any ancestor has `overflow`
other than `visible`, or if the element has no constrained-height ancestor.
Check the whole chain before blaming the sticky element.

**§6.2 — Offsets require a positioned element.** `top/right/bottom/left` and
`z-index` do nothing under `position: static`; emit them only with a non-static
position.

**§6.3 — `z-index` values come from a small documented scale** (e.g. base 1,
sticky chrome 10, dropdown 100, overlay 1000). Never reach for 9999.

**§6.4 — Overlays.** Full-viewport backdrop is `position: fixed; inset: 0` with
an `rgba()` scrim; centre the dialog with flex. Prefix `backdrop-filter` with
`-webkit-backdrop-filter` so it works without a build step. Ship it hidden and
let application code open it — every other declaration must survive that toggle.

---

## 7. Show and hide

**§7.1 — Hiding is a per-tier `display` value, not a separate flag.** Because it
is part of the same cascade, a panel can be `display: none` on desktop and
switched back on at its own breakpoint — a mobile-only nav is the normal case.

**§7.2 — Hidden means hidden for everyone.** `display: none` removes the element
from the accessibility tree. If it should be visually hidden but still
announced, that is a different technique.

---

## 8. Direction

**§8.1 — RTL needs `dir` on the element, not only `direction` in CSS.** The
attribute drives selection, form controls and bidi resolution; the property
alone does not.

**§8.2 — Prefer logical properties** (`margin-inline-start`, `padding-inline`,
`inset-inline`) in any layout that will be mirrored. `margin-left` on an RTL
layout is a bug waiting for a translator.

---

## 9. Naming

**§9.1 — A class name is interpolated into both `class="…"` and a CSS
selector.** An invalid one corrupts both at once. Restrict to
`[A-Za-z0-9_-]`, never start with a digit, and sanitise at the point of
emission — a name that arrives from data is not trustworthy.

**§9.2 — Deduplicate.** Two elements given the same generated name must not
silently share one rule; suffix the second.

---

## 10. Verification checklist

A layout is not done until each of these has actually been checked. Measuring
beats eyeballing: read back computed geometry, do not trust a scaled preview.

- [ ] Renders at **320, 400, 576, 768, 992, 1200, 1600, 1920**.
- [ ] `document.documentElement.scrollWidth <= clientWidth` at every one of them.
- [ ] No element's bounding box extends past the viewport at any width.
- [ ] Every grid child's span is less than its track count, or is deliberately
      paired with `order`.
- [ ] Every property set at a wide tier and unwanted at a narrow one is
      explicitly neutralised (§2).
- [ ] The layout still holds with a 60-character unbroken string, a bare URL, a
      2000px image and a wide table dropped into the deepest box.
- [ ] Above 1600px the layout does something deliberate — a `max-width`, wider
      tracks, or more columns — rather than merely stretching.
- [ ] Tab order still matches visual order after any `order` / `*-reverse`.

---

## 11. Verifying a viewport for real

When checking a breakpoint, confirm the **layout viewport width you actually
got** before drawing any conclusion:

```js
document.documentElement.clientWidth
```

A screenshot tool's "size" option often scales the capture without emulating a
viewport, and will hand you the wrong tier's layout labelled as the right one.
An `<iframe>` of a fixed width is a genuine layout viewport and is a reliable
way to test a tier from a window of any size.

Serve with `Cache-Control: no-store` while iterating. More than one debugging
session has been spent on a fix that was already correct on disk.

---

## Using this file

Point your agent at it as a persistent rule source:

- **Cursor** — `.cursor/rules/layout.mdc`, or reference from `.cursorrules`
- **Claude Code** — reference it from `CLAUDE.md`
- **Windsurf** — `.windsurfrules`
- **Generic** — `AGENTS.md`

Cite the rule number when you apply one (`§3.1`), so a reviewer can check the
reasoning rather than the output.
