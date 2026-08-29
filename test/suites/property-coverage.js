// ============================================================================
// property-coverage.js — sets every property on every device and asserts it
// reaches the CSS. This is the guard that stops the override blocks silently
// falling behind the base block; it once measured 27/43 at breakpoints.
// ============================================================================
import * as core from "../../mcp-server/core.js";

const GRID = { display: "grid" }, FLEX = { display: "flex" }, POS = { position: "absolute" };
const FLEX_PARENT = { display: "flex", flexDirection: "row" };
const BORDER = { borderWidth: "7px", borderStyle: "dashed", borderColor: "#654321" };

// label -> [value, needle, prerequisite props, real prop key, parent props]
// FLEX_PARENT: flex-grow/shrink/basis style a flex ITEM, so the PARENT must be flex.
const CASES = {
  display: ["grid", "display: grid", {}],
  columns: [5, "repeat(5", GRID],
  customColumns: ["2fr 7fr", "2fr 7fr", GRID],
  gridAutoMode: ["auto-fill", "auto-fill", GRID],
  gridMinColWidth: ["123px", "123px", { display: "grid", gridAutoMode: "auto-fit" }],
  justifyItems: ["end", "justify-items: end", GRID],
  alignContent: ["space-between", "align-content: space-between", GRID],
  flexDirection: ["column-reverse", "column-reverse", FLEX],
  flexWrap: ["wrap", "flex-wrap: wrap", FLEX],
  justifyContent: ["space-evenly", "space-evenly", FLEX],
  alignItems: ["baseline", "align-items: baseline", FLEX],
  "grid + justifyContent": ["space-evenly", "justify-content: space-evenly", GRID, "justifyContent"],
  "grid + alignItems": ["center", "align-items: center", GRID, "alignItems"],
  "flex + alignContent": ["space-around", "align-content: space-around", { display: "flex", flexWrap: "wrap" }, "alignContent"],
  alignSelf: ["center", "align-self: center", {}],
  horizontalAlign: ["right", "margin-left: auto", {}],
  textAlign: ["justify", "text-align: justify", {}],
  width: ["321px", "width: 321px", {}],
  maxWidth: ["987px", "max-width: 987px", {}],
  height: ["234px", "height: 234px", {}],
  maxHeight: ["345px", "max-height: 345px", {}],
  minHeight: [456, "min-height: 456px", {}],
  aspectRatio: ["21/9", "aspect-ratio: 21/9", {}],
  paddingTop: [11, "11px", {}],
  marginTop: ["21px", "21px", {}],
  gap: [31, "gap: 31px", FLEX],
  rowGap: [32, "row-gap: 32px", GRID],
  position: ["sticky", "position: sticky", {}],
  top: ["41px", "top: 41px", POS],
  right: ["42px", "right: 42px", POS],
  bottom: ["43px", "bottom: 43px", POS],
  left: ["44px", "left: 44px", POS],
  zIndex: ["555", "z-index: 555", POS],
  overflow: ["scroll", "overflow: scroll", {}],
  overflowX: ["auto", "overflow-x: auto", {}],
  overflowY: ["hidden", "overflow-y: hidden", {}],
  backgroundColor: ["#123456", "#123456", {}],
  border: [{ borderWidth: "4px", borderStyle: "dotted", borderColor: "#abcdef" }, "border: 4px dotted #abcdef", BORDER],
  borderRadius: ["19px", "border-radius: 19px", {}],
  boxShadow: ["0 1px 2px #abc", "0 1px 2px #abc", {}],
  opacity: ["0.37", "opacity: 0.37", {}],
  transform: ["scale(0.9)", "transform: scale(0.9)", {}],
  transition: ["all .3s ease", "transition: all .3s ease", {}],
  backdropFilter: ["blur(9px)", "backdrop-filter: blur(9px)", {}],
  span: [9, "span 9", {}],
  flexGrow: [6, "flex-grow: 6", {}, null, FLEX_PARENT],
  flexShrink: [8, "flex-shrink: 8", {}, null, FLEX_PARENT],
  flexBasis: ["77px", "flex-basis: 77px", {}, null, FLEX_PARENT],
  order: [4, "order: 4", {}],
  direction: ["rtl", "direction: rtl", {}],
  hidden: [true, "display: none", {}]
};

const seg = (css, device) => {
  if (device === "desktop") return css.split("@media")[0];
  const bp = device === "tablet" ? 992 : 576;
  const i = css.indexOf(`@media (max-width: ${bp}px)`);
  return i < 0 ? "" : css.slice(i, css.indexOf("\n}\n", i));
};

export default {
  name: "property coverage — every property on every device",
  run(t) {
    for (const device of ["desktop", "tablet", "mobile"]) {
      const missing = [];
      for (const [label, [value, needle, pre, realKey, parentProps]] of Object.entries(CASES)) {
        const key = realKey || label;
        core.resetAll();
        const parent = core.addChildDiv("root", "P", "p");
        core.setProps(parent.id, "desktop", parentProps || { display: "grid", columns: 3 });
        const node = core.addChildDiv(parent.id, "T", "target");
        // an object value is merged wholesale (compound properties like border);
        // a scalar is assigned to `key`
        const props = (value && typeof value === "object")
          ? { ...pre, ...value }
          : { ...pre, [key]: value };
        if (device === "desktop") {
          core.setProps(node.id, "desktop", props);
        } else {
          // a breakpoint override only emits when it DIFFERS from the wider
          // device, so the prerequisites go on desktop and the value here
          core.setProps(node.id, "desktop", { ...pre });
          core.setProps(node.id, device, props);
        }
        if (!seg(core.generateResponsiveCss(), device).includes(needle)) missing.push(label);
      }
      t.ok(`${device}: ${Object.keys(CASES).length - missing.length}/${Object.keys(CASES).length} properties emitted`,
        missing.length === 0, missing.length ? `not emitted: ${missing.join(", ")}` : "");
    }
  }
};
