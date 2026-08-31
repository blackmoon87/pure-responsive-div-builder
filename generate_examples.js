// ============================================================================
// generate_examples.js
// 100% Genuine, programmatic generation of examples directly through core.js
// No handwritten HTML/CSS — all output is produced by the builder's export engine
// ============================================================================
import * as core from "./mcp-server/core.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const examplesDir = path.join(__dirname, "examples");

if (!fs.existsSync(examplesDir)) {
  fs.mkdirSync(examplesDir, { recursive: true });
}

// ----------------------------------------------------------------------------
// Example 01: Simple Centered Card
// ----------------------------------------------------------------------------
core.resetAll();
const card = core.addChildDiv("root", "Card Container", "card-container");
core.setProps(card.id, "desktop", {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  maxWidth: "460px",
  horizontalAlign: "center",
  paddingTop: 32,
  paddingRight: 32,
  paddingBottom: 32,
  paddingLeft: 32,
  backgroundColor: "#111620",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "#263447",
  borderRadius: "16px",
  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.4)",
  gap: 20,
  minHeight: 280
});
core.setProps(card.id, "mobile", {
  paddingTop: 20,
  paddingRight: 20,
  paddingBottom: 20,
  paddingLeft: 20
});

const cardHead = core.addChildDiv(card.id, "Card Header", "card-header");
core.setProps(cardHead.id, "desktop", {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  minHeight: 40
});

const badge = core.addChildDiv(cardHead.id, "Badge", "card-badge");
core.setProps(badge.id, "desktop", {
  width: "80px",
  minHeight: 24,
  backgroundColor: "#38bdf826",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "#38bdf8",
  borderRadius: "20px"
});

const cardBody = core.addChildDiv(card.id, "Card Body", "card-body");
core.setProps(cardBody.id, "desktop", {
  minHeight: 120,
  backgroundColor: "#18202d",
  borderRadius: "8px",
  paddingTop: 16,
  paddingRight: 16,
  paddingBottom: 16,
  paddingLeft: 16
});

const cardFoot = core.addChildDiv(card.id, "Card Footer", "card-footer");
core.setProps(cardFoot.id, "desktop", {
  display: "flex",
  flexDirection: "row",
  justifyContent: "flex-end",
  gap: 12,
  minHeight: 44
});
core.setProps(cardFoot.id, "mobile", {
  flexDirection: "column"
});

const btnAction = core.addChildDiv(cardFoot.id, "Action Button", "btn-action");
core.setProps(btnAction.id, "desktop", {
  width: "120px",
  minHeight: 40,
  backgroundColor: "#38bdf8",
  borderRadius: "8px"
});
core.setProps(btnAction.id, "mobile", {
  width: "100%"
});

fs.writeFileSync(path.join(examplesDir, "01-simple-centered-card.html"), core.generateFullHtmlDocument());
fs.writeFileSync(path.join(examplesDir, "01-simple-centered-card.json"), JSON.stringify(core.getTreeJson(), null, 2));
console.log("✓ Generated 01-simple-centered-card.html directly from core.js");

// ----------------------------------------------------------------------------
// Example 02: Responsive Sticky Navbar
// ----------------------------------------------------------------------------
core.resetAll();
const header = core.addChildDiv("root", "Site Header", "site-header");
core.setProps(header.id, "desktop", {
  display: "block",
  position: "sticky",
  top: "0",
  width: "100%",
  backgroundColor: "#111620",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "#263447",
  zIndex: "100"
});

const navContainer = core.addChildDiv(header.id, "Nav Container", "nav-container");
core.setProps(navContainer.id, "desktop", {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  maxWidth: "1200px",
  horizontalAlign: "center",
  paddingTop: 16,
  paddingRight: 24,
  paddingBottom: 16,
  paddingLeft: 24,
  minHeight: 68
});
core.setProps(navContainer.id, "mobile", {
  flexDirection: "column",
  gap: 16,
  paddingTop: 16,
  paddingRight: 16,
  paddingBottom: 16,
  paddingLeft: 16
});

const logo = core.addChildDiv(navContainer.id, "Brand Logo", "brand-logo");
core.setProps(logo.id, "desktop", {
  width: "140px",
  minHeight: 36,
  backgroundColor: "#38bdf8",
  borderRadius: "6px"
});

const navLinks = core.addChildDiv(navContainer.id, "Nav Links", "nav-links");
core.setProps(navLinks.id, "desktop", {
  display: "flex",
  flexDirection: "row",
  gap: 20,
  alignItems: "center"
});
core.setProps(navLinks.id, "mobile", {
  width: "100%",
  flexWrap: "wrap",
  gap: 8,
  justifyContent: "space-between"
});

for (let i = 1; i <= 4; i++) {
  const navItem = core.addChildDiv(navLinks.id, "Nav Item " + i, "nav-item");
  core.setProps(navItem.id, "desktop", {
    width: "70px",
    minHeight: 24,
    backgroundColor: "#1d2737",
    borderRadius: "4px"
  });
  core.setProps(navItem.id, "mobile", {
    width: "60px"
  });
}

const navActions = core.addChildDiv(navContainer.id, "Nav Actions", "nav-actions");
core.setProps(navActions.id, "desktop", {
  display: "flex",
  flexDirection: "row",
  gap: 12
});
core.setProps(navActions.id, "mobile", {
  width: "100%"
});

const btnCta = core.addChildDiv(navActions.id, "CTA Button", "btn-cta");
core.setProps(btnCta.id, "desktop", {
  width: "100px",
  minHeight: 36,
  backgroundColor: "#6366f1",
  borderRadius: "6px"
});
core.setProps(btnCta.id, "mobile", {
  width: "100%"
});

const heroBody = core.addChildDiv("root", "Hero Section", "hero-banner");
core.setProps(heroBody.id, "desktop", {
  maxWidth: "1200px",
  horizontalAlign: "center",
  minHeight: 300,
  backgroundColor: "#18202d",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "#263447",
  borderRadius: "12px",
  marginTop: "40px",
  marginRight: "auto",
  marginBottom: "40px",
  marginLeft: "auto"
});
core.setProps(heroBody.id, "mobile", {
  paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16,
  marginTop: "20px", marginBottom: "20px"
});

fs.writeFileSync(path.join(examplesDir, "02-responsive-navbar.html"), core.generateFullHtmlDocument());
fs.writeFileSync(path.join(examplesDir, "02-responsive-navbar.json"), JSON.stringify(core.getTreeJson(), null, 2));
console.log("✓ Generated 02-responsive-navbar.html directly from core.js");

// ----------------------------------------------------------------------------
// Example 03: 3-Tier Responsive Pricing Table
// ----------------------------------------------------------------------------
core.resetAll();
const pricingSec = core.addChildDiv("root", "Pricing Section", "pricing-section");
core.setProps(pricingSec.id, "desktop", {
  display: "flex",
  flexDirection: "column",
  maxWidth: "1200px",
  horizontalAlign: "center",
  paddingTop: 60,
  paddingRight: 24,
  paddingBottom: 60,
  paddingLeft: 24,
  gap: 40,
  alignItems: "center"
});
core.setProps(pricingSec.id, "mobile", {
  paddingTop: 32, paddingRight: 16, paddingBottom: 32, paddingLeft: 16,
  gap: 24
});

const pHead = core.addChildDiv(pricingSec.id, "Pricing Header", "pricing-header");
core.setProps(pHead.id, "desktop", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 12,
  maxWidth: "600px"
});

const pTitle = core.addChildDiv(pHead.id, "Title", "pricing-title");
core.setProps(pTitle.id, "desktop", { width: "240px", minHeight: 36, backgroundColor: "#38bdf8", borderRadius: "6px" });
core.setProps(pTitle.id, "mobile", { maxWidth: "100%" });

const pSub = core.addChildDiv(pHead.id, "Subtitle", "pricing-subtitle");
core.setProps(pSub.id, "desktop", { width: "360px", minHeight: 20, backgroundColor: "#1d2737", borderRadius: "4px" });
core.setProps(pSub.id, "mobile", { width: "100%", maxWidth: "280px" });

const pGrid = core.addChildDiv(pricingSec.id, "Pricing Grid", "pricing-grid");
core.setProps(pGrid.id, "desktop", {
  display: "grid",
  columns: 3,
  gap: 24,
  width: "100%",
  alignItems: "center"
});
core.setProps(pGrid.id, "tablet", { columns: 2 });
core.setProps(pGrid.id, "mobile", { columns: 1, gap: 16 });

for (let i = 1; i <= 3; i++) {
  const isFeatured = i === 2;
  const card = core.addChildDiv(pGrid.id, "Plan " + i, isFeatured ? "plan-card-featured" : "plan-card");
  core.setProps(card.id, "desktop", {
    display: "flex",
    flexDirection: "column",
    paddingTop: 32, paddingRight: 32, paddingBottom: 32, paddingLeft: 32,
    backgroundColor: isFeatured ? "#18202d" : "#111620",
    borderWidth: isFeatured ? "2px" : "1px",
    borderStyle: "solid",
    borderColor: isFeatured ? "#38bdf8" : "#263447",
    borderRadius: "16px",
    boxShadow: isFeatured ? "0 12px 30px rgba(56, 189, 248, 0.18)" : "",
    gap: 24,
    minHeight: isFeatured ? 460 : 420
  });
  core.setProps(card.id, "mobile", {
    paddingTop: 24, paddingRight: 20, paddingBottom: 24, paddingLeft: 20,
    minHeight: 380
  });
  if (isFeatured) {
    // At tablet the grid is 2 columns, so span 2 is the FULL row: the featured
    // card can never sit beside a sibling. Left in source order that strands
    // plan 1 and plan 3 on half-empty rows of their own. order:-1 lifts it to
    // the top as a full-width banner and lets the other two pair up cleanly
    // underneath — the emphasis the span was reaching for, without the holes.
    core.setProps(card.id, "tablet", { span: 2, order: -1 });
    core.setProps(card.id, "mobile", { span: 1, order: 0, minHeight: 380 });
  }

  const pName = core.addChildDiv(card.id, "Plan Name", "plan-name");
  core.setProps(pName.id, "desktop", { width: "100px", minHeight: 24, backgroundColor: "#5a6b85", borderRadius: "4px" });
  const pPrice = core.addChildDiv(card.id, "Plan Price", "plan-price");
  core.setProps(pPrice.id, "desktop", { width: "140px", minHeight: 40, backgroundColor: "#f0f6fc", borderRadius: "6px" });
  const pFeat = core.addChildDiv(card.id, "Features", "plan-features");
  core.setProps(pFeat.id, "desktop", { display: "flex", flexDirection: "column", gap: 12, flexGrow: 1 });
  for (let j = 0; j < 3; j++) {
    const fLine = core.addChildDiv(pFeat.id, "Feature", "feature-line");
    core.setProps(fLine.id, "desktop", { width: "100%", minHeight: 16, backgroundColor: "#1d2737", borderRadius: "4px" });
  }
  const pBtn = core.addChildDiv(card.id, "CTA Button", isFeatured ? "plan-btn-primary" : "plan-btn");
  core.setProps(pBtn.id, "desktop", { width: "100%", minHeight: 44, backgroundColor: isFeatured ? "#38bdf8" : "#263447", borderRadius: "8px" });
}

fs.writeFileSync(path.join(examplesDir, "03-pricing-tables-3col.html"), core.generateFullHtmlDocument());
fs.writeFileSync(path.join(examplesDir, "03-pricing-tables-3col.json"), JSON.stringify(core.getTreeJson(), null, 2));
console.log("✓ Generated 03-pricing-tables-3col.html directly from core.js");

// ----------------------------------------------------------------------------
// Example 04: Auto-Fit E-Commerce Catalog
// ----------------------------------------------------------------------------
core.resetAll();
const catalogWrap = core.addChildDiv("root", "Catalog Wrapper", "catalog-wrapper");
core.setProps(catalogWrap.id, "desktop", {
  display: "flex",
  flexDirection: "column",
  maxWidth: "1280px",
  horizontalAlign: "center",
  paddingTop: 40, paddingRight: 24, paddingBottom: 40, paddingLeft: 24,
  gap: 32
});
core.setProps(catalogWrap.id, "mobile", {
  paddingTop: 20, paddingRight: 16, paddingBottom: 20, paddingLeft: 16,
  gap: 20
});

const toolbar = core.addChildDiv(catalogWrap.id, "Toolbar", "catalog-toolbar");
core.setProps(toolbar.id, "desktop", {
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingTop: 16, paddingRight: 20, paddingBottom: 16, paddingLeft: 20,
  backgroundColor: "#111620",
  borderWidth: "1px", borderStyle: "solid", borderColor: "#263447",
  borderRadius: "10px"
});
core.setProps(toolbar.id, "mobile", {
  flexDirection: "column",
  gap: 12,
  paddingTop: 12, paddingRight: 12, paddingBottom: 12, paddingLeft: 12
});

const searchBox = core.addChildDiv(toolbar.id, "Search", "toolbar-search");
core.setProps(searchBox.id, "desktop", { width: "260px", minHeight: 36, backgroundColor: "#18202d", borderRadius: "6px" });
core.setProps(searchBox.id, "mobile", { width: "100%" });

const filterBox = core.addChildDiv(toolbar.id, "Filters", "toolbar-filters");
core.setProps(filterBox.id, "desktop", { display: "flex", flexDirection: "row", gap: 12 });
core.setProps(filterBox.id, "mobile", { width: "100%", overflowX: "auto", gap: 8 });

for (let i = 1; i <= 3; i++) {
  const chip = core.addChildDiv(filterBox.id, "Filter " + i, "filter-chip");
  core.setProps(chip.id, "desktop", { width: "80px", minHeight: 32, backgroundColor: "#1d2737", borderRadius: "20px" });
  core.setProps(chip.id, "mobile", { width: "70px", flexShrink: 0 });
}

const prodGrid = core.addChildDiv(catalogWrap.id, "Product Grid", "product-grid");
core.setProps(prodGrid.id, "desktop", {
  display: "grid",
  gridAutoMode: "auto-fit",
  gridMinColWidth: "260px",
  gap: 24
});
core.setProps(prodGrid.id, "mobile", {
  gridAutoMode: "",
  columns: 1,
  gap: 16
});

for (let i = 1; i <= 4; i++) {
  const prodCard = core.addChildDiv(prodGrid.id, "Product Card " + i, "product-card");
  core.setProps(prodCard.id, "desktop", {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#111620",
    borderWidth: "1px", borderStyle: "solid", borderColor: "#263447",
    borderRadius: "12px",
    overflow: "hidden"
  });

  const pImg = core.addChildDiv(prodCard.id, "Image", "product-image-box");
  core.setProps(pImg.id, "desktop", { width: "100%", aspectRatio: "4/3", backgroundColor: "#1d2737" });

  const pInfo = core.addChildDiv(prodCard.id, "Info", "product-info");
  core.setProps(pInfo.id, "desktop", { display: "flex", flexDirection: "column", paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16, gap: 12 });

  const pTitle = core.addChildDiv(pInfo.id, "Title", "product-title");
  core.setProps(pTitle.id, "desktop", { width: "75%", minHeight: 20, backgroundColor: "#f0f6fc", borderRadius: "4px" });

  const pMeta = core.addChildDiv(pInfo.id, "Meta", "product-meta");
  core.setProps(pMeta.id, "desktop", { display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center" });

  const pPrice = core.addChildDiv(pMeta.id, "Price", "product-price");
  core.setProps(pPrice.id, "desktop", { width: "60px", minHeight: 24, backgroundColor: "#10b981", borderRadius: "4px" });

  const pBuy = core.addChildDiv(pMeta.id, "Buy Button", "btn-buy");
  core.setProps(pBuy.id, "desktop", { width: "90px", minHeight: 32, backgroundColor: "#38bdf8", borderRadius: "6px" });
}

fs.writeFileSync(path.join(examplesDir, "04-ecommerce-product-grid.html"), core.generateFullHtmlDocument());
fs.writeFileSync(path.join(examplesDir, "04-ecommerce-product-grid.json"), JSON.stringify(core.getTreeJson(), null, 2));
console.log("✓ Generated 04-ecommerce-product-grid.html directly from core.js");

// ----------------------------------------------------------------------------
// Example 05: Holy Grail Responsive Layout
// ----------------------------------------------------------------------------
core.resetAll();
const appRoot = core.addChildDiv("root", "App Root", "app-root");
core.setProps(appRoot.id, "desktop", {
  display: "flex",
  flexDirection: "column",
  minHeight: 600,
  paddingTop: 0,
  paddingRight: 0,
  paddingBottom: 0,
  paddingLeft: 0,
  gap: 0
});

const appHeader = core.addChildDiv(appRoot.id, "Header", "app-header");
core.setProps(appHeader.id, "desktop", {
  position: "sticky", top: "0", width: "100%", minHeight: 64,
  backgroundColor: "#111620", borderWidth: "1px", borderStyle: "solid", borderColor: "#263447",
  paddingTop: 16, paddingRight: 24, paddingBottom: 16, paddingLeft: 24, zIndex: "100"
});
core.setProps(appHeader.id, "mobile", {
  paddingTop: 12, paddingRight: 16, paddingBottom: 12, paddingLeft: 16
});

const mainLayout = core.addChildDiv(appRoot.id, "Main Layout", "app-main-layout");
core.setProps(mainLayout.id, "desktop", {
  display: "grid",
  customColumns: "240px 1fr 280px",
  gap: 20,
  flexGrow: 1,
  paddingTop: 24, paddingRight: 24, paddingBottom: 24, paddingLeft: 24,
  maxWidth: "1440px",
  horizontalAlign: "center"
});
core.setProps(mainLayout.id, "tablet", {
  customColumns: "200px 1fr",
  paddingTop: 20, paddingRight: 16, paddingBottom: 20, paddingLeft: 16,
  gap: 16
});
core.setProps(mainLayout.id, "mobile", {
  customColumns: "1fr",
  paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16,
  gap: 16
});

const leftNav = core.addChildDiv(mainLayout.id, "Left Nav", "left-nav");
core.setProps(leftNav.id, "desktop", {
  display: "flex", flexDirection: "column", gap: 12,
  backgroundColor: "#111620", borderWidth: "1px", borderStyle: "solid", borderColor: "#263447",
  borderRadius: "12px", paddingTop: 20, paddingRight: 20, paddingBottom: 20, paddingLeft: 20,
  order: 1
});
core.setProps(leftNav.id, "tablet", {
  paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16
});
core.setProps(leftNav.id, "mobile", {
  order: 2,
  paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16
});

const centerContent = core.addChildDiv(mainLayout.id, "Center Content", "center-content");
core.setProps(centerContent.id, "desktop", {
  display: "flex", flexDirection: "column", gap: 20,
  backgroundColor: "#18202d", borderWidth: "1px", borderStyle: "solid", borderColor: "#263447",
  borderRadius: "12px", paddingTop: 24, paddingRight: 24, paddingBottom: 24, paddingLeft: 24,
  order: 2
});
core.setProps(centerContent.id, "tablet", {
  paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16
});
core.setProps(centerContent.id, "mobile", {
  order: 1,
  paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16,
  gap: 16
});

const heroBox = core.addChildDiv(centerContent.id, "Hero Box", "content-hero-box");
core.setProps(heroBox.id, "desktop", { minHeight: 200, backgroundColor: "#1d2737", borderRadius: "8px" });

const innerGrid = core.addChildDiv(centerContent.id, "Inner Grid", "content-grid-cards");
core.setProps(innerGrid.id, "desktop", { display: "grid", columns: 2, gap: 16 });
core.setProps(innerGrid.id, "mobile", { columns: 1, gap: 12 });

const ic1 = core.addChildDiv(innerGrid.id, "Card 1", "inner-card");
core.setProps(ic1.id, "desktop", { minHeight: 140, backgroundColor: "#111620", borderWidth: "1px", borderStyle: "solid", borderColor: "#263447", borderRadius: "8px" });
const ic2 = core.addChildDiv(innerGrid.id, "Card 2", "inner-card");
core.setProps(ic2.id, "desktop", { minHeight: 140, backgroundColor: "#111620", borderWidth: "1px", borderStyle: "solid", borderColor: "#263447", borderRadius: "8px" });

const rightSidebar = core.addChildDiv(mainLayout.id, "Right Sidebar", "right-sidebar");
core.setProps(rightSidebar.id, "desktop", {
  display: "flex", flexDirection: "column", gap: 16,
  backgroundColor: "#111620", borderWidth: "1px", borderStyle: "solid", borderColor: "#263447",
  borderRadius: "12px", paddingTop: 20, paddingRight: 20, paddingBottom: 20, paddingLeft: 20,
  order: 3
});
core.setProps(rightSidebar.id, "tablet", {
  span: 2,
  paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16
});
core.setProps(rightSidebar.id, "mobile", {
  span: 1,
  order: 3,
  paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16
});

const appFooter = core.addChildDiv(appRoot.id, "Footer", "app-footer");
core.setProps(appFooter.id, "desktop", {
  width: "100%", minHeight: 50, backgroundColor: "#111620",
  borderWidth: "1px", borderStyle: "solid", borderColor: "#263447",
  paddingTop: 16, paddingRight: 24, paddingBottom: 16, paddingLeft: 24,
  marginTop: "auto"
});

fs.writeFileSync(path.join(examplesDir, "05-holy-grail-layout.html"), core.generateFullHtmlDocument());
fs.writeFileSync(path.join(examplesDir, "05-holy-grail-layout.json"), JSON.stringify(core.getTreeJson(), null, 2));
console.log("✓ Generated 05-holy-grail-layout.html directly from core.js");

// ----------------------------------------------------------------------------
// Example 06: Complex SaaS Analytics Dashboard
// ----------------------------------------------------------------------------
core.resetAll();
const dashLayout = core.addChildDiv("root", "Dashboard Root", "dashboard-layout");
core.setProps(dashLayout.id, "desktop", {
  display: "grid",
  customColumns: "260px 1fr",
  minHeight: 600
});
core.setProps(dashLayout.id, "tablet", { customColumns: "1fr" });

const sideNav = core.addChildDiv(dashLayout.id, "Sidebar", "dash-sidebar");
core.setProps(sideNav.id, "desktop", {
  display: "flex", flexDirection: "column",
  backgroundColor: "#111620", borderWidth: "1px", borderStyle: "solid", borderColor: "#263447",
  paddingTop: 24, paddingRight: 24, paddingBottom: 24, paddingLeft: 24, gap: 24
});
core.setProps(sideNav.id, "tablet", { hidden: true });

const brand = core.addChildDiv(sideNav.id, "Brand", "brand-slot");
core.setProps(brand.id, "desktop", { width: "100%", minHeight: 44, backgroundColor: "#38bdf8", borderRadius: "8px" });

const sideNavList = core.addChildDiv(sideNav.id, "Nav List", "side-nav-list");
core.setProps(sideNavList.id, "desktop", { display: "flex", flexDirection: "column", gap: 12, flexGrow: 1 });

for (let i = 1; i <= 4; i++) {
  const item = core.addChildDiv(sideNavList.id, "Nav Item " + i, i === 1 ? "side-nav-item-active" : "side-nav-item");
  core.setProps(item.id, "desktop", {
    width: "100%", minHeight: 38,
    backgroundColor: i === 1 ? "#38bdf826" : "#18202d",
    borderWidth: i === 1 ? "1px" : "", borderStyle: i === 1 ? "solid" : "", borderColor: i === 1 ? "#38bdf8" : "",
    borderRadius: "6px"
  });
}

const userSlot = core.addChildDiv(sideNav.id, "User Profile", "user-profile-slot");
core.setProps(userSlot.id, "desktop", {
  display: "flex", flexDirection: "row", alignItems: "center", gap: 12,
  paddingTop: 12, paddingRight: 12, paddingBottom: 12, paddingLeft: 12,
  backgroundColor: "#18202d", borderRadius: "8px", minHeight: 52
});

const dashMain = core.addChildDiv(dashLayout.id, "Main Content", "dash-main");
core.setProps(dashMain.id, "desktop", {
  display: "flex", flexDirection: "column",
  paddingTop: 24, paddingRight: 32, paddingBottom: 24, paddingLeft: 32,
  gap: 28, overflow: "auto"
});
core.setProps(dashMain.id, "mobile", { paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16, gap: 20 });

const topBar = core.addChildDiv(dashMain.id, "Topbar", "dash-topbar");
core.setProps(topBar.id, "desktop", {
  display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", minHeight: 52
});
core.setProps(topBar.id, "mobile", { flexDirection: "column", gap: 12, alignItems: "flex-start" });

const search = core.addChildDiv(topBar.id, "Search", "search-slot");
core.setProps(search.id, "desktop", { width: "320px", minHeight: 40, backgroundColor: "#111620", borderWidth: "1px", borderStyle: "solid", borderColor: "#263447", borderRadius: "8px" });
core.setProps(search.id, "mobile", { width: "100%" });

const actions = core.addChildDiv(topBar.id, "Actions", "action-slot");
core.setProps(actions.id, "desktop", { display: "flex", flexDirection: "row", gap: 12 });

const kpiGrid = core.addChildDiv(dashMain.id, "KPI Grid", "kpi-grid");
core.setProps(kpiGrid.id, "desktop", { display: "grid", columns: 4, gap: 20 });
core.setProps(kpiGrid.id, "tablet", { columns: 2 });
core.setProps(kpiGrid.id, "mobile", { columns: 1 });

for (let i = 1; i <= 4; i++) {
  const kpi = core.addChildDiv(kpiGrid.id, "KPI " + i, "kpi-card");
  core.setProps(kpi.id, "desktop", {
    display: "flex", flexDirection: "column",
    paddingTop: 20, paddingRight: 20, paddingBottom: 20, paddingLeft: 20,
    backgroundColor: "#111620", borderWidth: "1px", borderStyle: "solid", borderColor: "#263447",
    borderRadius: "12px", gap: 12, minHeight: 110
  });
}

const analyticsSec = core.addChildDiv(dashMain.id, "Analytics Grid", "analytics-section");
core.setProps(analyticsSec.id, "desktop", { display: "grid", columns: 12, gap: 20 });

const chartBox = core.addChildDiv(analyticsSec.id, "Chart Box", "chart-box");
core.setProps(chartBox.id, "desktop", {
  span: 8, display: "flex", flexDirection: "column",
  paddingTop: 24, paddingRight: 24, paddingBottom: 24, paddingLeft: 24,
  backgroundColor: "#111620", borderWidth: "1px", borderStyle: "solid", borderColor: "#263447",
  borderRadius: "12px", minHeight: 360, gap: 16
});
core.setProps(chartBox.id, "tablet", { span: 12 });

const donutBox = core.addChildDiv(analyticsSec.id, "Donut Box", "donut-box");
core.setProps(donutBox.id, "desktop", {
  span: 4, display: "flex", flexDirection: "column",
  paddingTop: 24, paddingRight: 24, paddingBottom: 24, paddingLeft: 24,
  backgroundColor: "#111620", borderWidth: "1px", borderStyle: "solid", borderColor: "#263447",
  borderRadius: "12px", minHeight: 360, gap: 16
});
core.setProps(donutBox.id, "tablet", { span: 12 });

const tableSec = core.addChildDiv(dashMain.id, "Table Section", "table-section");
core.setProps(tableSec.id, "desktop", {
  display: "flex", flexDirection: "column",
  paddingTop: 24, paddingRight: 24, paddingBottom: 24, paddingLeft: 24,
  backgroundColor: "#111620", borderWidth: "1px", borderStyle: "solid", borderColor: "#263447",
  borderRadius: "12px", gap: 16
});

for (let i = 1; i <= 3; i++) {
  const row = core.addChildDiv(tableSec.id, "Table Row " + i, "table-row");
  core.setProps(row.id, "desktop", {
    display: "grid", customColumns: "2fr 1fr 1fr 1fr",
    paddingTop: 14, paddingRight: 16, paddingBottom: 14, paddingLeft: 16,
    backgroundColor: "#18202d", borderRadius: "6px", alignItems: "center", gap: 12
  });
  core.setProps(row.id, "mobile", { customColumns: "1fr", gap: 8 });
}

fs.writeFileSync(path.join(examplesDir, "06-complex-saas-dashboard.html"), core.generateFullHtmlDocument());
fs.writeFileSync(path.join(examplesDir, "06-complex-saas-dashboard.json"), JSON.stringify(core.getTreeJson(), null, 2));
console.log("✓ Generated 06-complex-saas-dashboard.html directly from core.js");

// ----------------------------------------------------------------------------
// Example 07: Complex Arabic RTL News Portal
// ----------------------------------------------------------------------------
core.resetAll();
const portalRoot = core.addChildDiv("root", "Portal Root", "portal-root");
core.setProps(portalRoot.id, "desktop", {
  display: "flex", flexDirection: "column", minHeight: 600, direction: "rtl",
  paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, gap: 0
});

const ticker = core.addChildDiv(portalRoot.id, "Ticker Bar", "top-ticker-bar");
core.setProps(ticker.id, "desktop", {
  display: "flex", flexDirection: "row", alignItems: "center",
  backgroundColor: "#f43f5e", paddingTop: 8, paddingRight: 24, paddingBottom: 8, paddingLeft: 24,
  minHeight: 38, gap: 16
});
core.setProps(ticker.id, "mobile", {
  paddingTop: 8, paddingRight: 16, paddingBottom: 8, paddingLeft: 16, gap: 10
});

const tBadge = core.addChildDiv(ticker.id, "Ticker Badge", "ticker-badge");
core.setProps(tBadge.id, "desktop", { width: "80px", minHeight: 24, backgroundColor: "#ffffff", borderRadius: "4px" });
core.setProps(tBadge.id, "mobile", { width: "60px", flexShrink: 0 });

const tText = core.addChildDiv(ticker.id, "Ticker Text", "ticker-text");
core.setProps(tText.id, "desktop", { flexGrow: 1, minHeight: 18, backgroundColor: "rgba(255, 255, 255, 0.4)", borderRadius: "4px" });

const pNav = core.addChildDiv(portalRoot.id, "Portal Nav", "portal-nav");
core.setProps(pNav.id, "desktop", {
  display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  paddingTop: 16, paddingRight: 32, paddingBottom: 16, paddingLeft: 32,
  backgroundColor: "#111620", borderWidth: "1px", borderStyle: "solid", borderColor: "#263447",
  minHeight: 70, width: "100%"
});
core.setProps(pNav.id, "mobile", {
  flexDirection: "column", gap: 16,
  paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16
});

const pLogo = core.addChildDiv(pNav.id, "Logo", "portal-logo");
core.setProps(pLogo.id, "desktop", { width: "160px", minHeight: 40, backgroundColor: "#38bdf8", borderRadius: "8px" });
core.setProps(pLogo.id, "mobile", { width: "140px" });

const pMenu = core.addChildDiv(pNav.id, "Menu", "portal-menu");
core.setProps(pMenu.id, "desktop", { display: "flex", flexDirection: "row", gap: 20 });
core.setProps(pMenu.id, "mobile", { width: "100%", flexWrap: "wrap", gap: 8, justifyContent: "center" });

for (let i = 1; i <= 4; i++) {
  const mLink = core.addChildDiv(pMenu.id, "Menu Link " + i, "menu-link");
  core.setProps(mLink.id, "desktop", { width: "80px", minHeight: 24, backgroundColor: "#18202d", borderRadius: "4px" });
  core.setProps(mLink.id, "mobile", { width: "65px" });
}

const pBody = core.addChildDiv(portalRoot.id, "Portal Body", "portal-body");
core.setProps(pBody.id, "desktop", {
  display: "flex", flexDirection: "column", width: "100%", maxWidth: "1360px", horizontalAlign: "center",
  paddingTop: 32, paddingRight: 24, paddingBottom: 32, paddingLeft: 24, gap: 32
});
core.setProps(pBody.id, "mobile", {
  paddingTop: 20, paddingRight: 16, paddingBottom: 20, paddingLeft: 16, gap: 20
});

const featGrid = core.addChildDiv(pBody.id, "Featured Grid", "featured-grid");
core.setProps(featGrid.id, "desktop", { display: "grid", customColumns: "2fr 1fr", gap: 24, width: "100%" });
core.setProps(featGrid.id, "tablet", { customColumns: "1fr" });
core.setProps(featGrid.id, "mobile", { customColumns: "1fr", gap: 16 });

const leadStory = core.addChildDiv(featGrid.id, "Lead Story", "main-lead-story");
core.setProps(leadStory.id, "desktop", {
  display: "flex", flexDirection: "column", minHeight: 420, width: "100%",
  backgroundColor: "#18202d", borderWidth: "1px", borderStyle: "solid", borderColor: "#263447",
  borderRadius: "14px", paddingTop: 24, paddingRight: 24, paddingBottom: 24, paddingLeft: 24,
  justifyContent: "flex-end", gap: 12
});
core.setProps(leadStory.id, "mobile", {
  minHeight: 260,
  paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16
});

const leadTag = core.addChildDiv(leadStory.id, "Tag", "lead-tag");
core.setProps(leadTag.id, "desktop", { width: "90px", minHeight: 24, backgroundColor: "#f43f5e", borderRadius: "4px" });
const leadHead = core.addChildDiv(leadStory.id, "Headline", "lead-headline");
core.setProps(leadHead.id, "desktop", { width: "80%", minHeight: 32, backgroundColor: "#f0f6fc", borderRadius: "6px" });
core.setProps(leadHead.id, "mobile", { width: "100%" });

const leadSum = core.addChildDiv(leadStory.id, "Summary", "lead-summary");
core.setProps(leadSum.id, "desktop", { width: "60%", minHeight: 20, backgroundColor: "#5a6b85", borderRadius: "4px" });
core.setProps(leadSum.id, "mobile", { width: "100%" });

const secCol = core.addChildDiv(featGrid.id, "Secondary Column", "secondary-column");
core.setProps(secCol.id, "desktop", { display: "flex", flexDirection: "column", gap: 16, width: "100%" });

for (let i = 1; i <= 3; i++) {
  const smCard = core.addChildDiv(secCol.id, "Small News " + i, "news-card-small");
  core.setProps(smCard.id, "desktop", {
    display: "flex", flexDirection: "column", backgroundColor: "#111620",
    borderWidth: "1px", borderStyle: "solid", borderColor: "#263447",
    borderRadius: "10px", paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16,
    gap: 8, minHeight: 125, width: "100%"
  });
}

const artGrid = core.addChildDiv(pBody.id, "3-Col Articles", "articles-3col-grid");
core.setProps(artGrid.id, "desktop", { display: "grid", columns: 3, gap: 24, width: "100%" });
core.setProps(artGrid.id, "tablet", { columns: 2 });
core.setProps(artGrid.id, "mobile", { columns: 1, gap: 16 });

for (let i = 1; i <= 3; i++) {
  const artBox = core.addChildDiv(artGrid.id, "Article " + i, "article-box");
  core.setProps(artBox.id, "desktop", {
    display: "flex", flexDirection: "column", backgroundColor: "#111620",
    borderWidth: "1px", borderStyle: "solid", borderColor: "#263447",
    borderRadius: "12px", overflow: "hidden", width: "100%"
  });
  const artImg = core.addChildDiv(artBox.id, "Image", "article-img");
  core.setProps(artImg.id, "desktop", { width: "100%", aspectRatio: "16/9", backgroundColor: "#1d2737" });
  const artCont = core.addChildDiv(artBox.id, "Content", "article-content");
  core.setProps(artCont.id, "desktop", { display: "flex", flexDirection: "column", paddingTop: 20, paddingRight: 20, paddingBottom: 20, paddingLeft: 20, gap: 12, minHeight: 80 });
}

const footer = core.addChildDiv(portalRoot.id, "Footer", "portal-footer");
core.setProps(footer.id, "desktop", {
  display: "grid", columns: 4, gap: 24, backgroundColor: "#111620",
  borderWidth: "1px", borderStyle: "solid", borderColor: "#263447",
  paddingTop: 40, paddingRight: 32, paddingBottom: 40, paddingLeft: 32, marginTop: "auto", width: "100%"
});
core.setProps(footer.id, "tablet", { columns: 2 });
core.setProps(footer.id, "mobile", { columns: 1, paddingTop: 24, paddingRight: 16, paddingBottom: 24, paddingLeft: 16, gap: 16 });

for (let i = 1; i <= 4; i++) {
  const fCol = core.addChildDiv(footer.id, "Footer Col " + i, "footer-col");
  core.setProps(fCol.id, "desktop", { display: "flex", flexDirection: "column", gap: 12, minHeight: 100, width: "100%" });
}

fs.writeFileSync(path.join(examplesDir, "07-arabic-rtl-news-portal.html"), core.generateFullHtmlDocument());
fs.writeFileSync(path.join(examplesDir, "07-arabic-rtl-news-portal.json"), JSON.stringify(core.getTreeJson(), null, 2));
console.log("✓ Generated 07-arabic-rtl-news-portal.html directly from core.js");

// ----------------------------------------------------------------------------
// Example 08: Modal Overlay System (fixed backdrop, frosted glass, entrance state)
// Exercises: position:fixed full-viewport inset, rgba scrim, backdrop-filter,
// transform/transition entrance state, flex centring, hidden-by-default,
// per-breakpoint clearing of the animation.
// ----------------------------------------------------------------------------
core.resetAll();

const mPage = core.addChildDiv("root", "Page Behind", "page-behind");
core.setProps(mPage.id, "desktop", {
  display: "grid", columns: 3, gap: 20, minHeight: 520,
  paddingTop: 28, paddingRight: 28, paddingBottom: 28, paddingLeft: 28
});
core.setProps(mPage.id, "tablet", { columns: 2 });
core.setProps(mPage.id, "mobile", { columns: 1, gap: 14, paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16 });
for (let i = 1; i <= 6; i++) {
  const bc = core.addChildDiv(mPage.id, "Behind Card " + i, "behind-card");
  core.setProps(bc.id, "desktop", {
    minHeight: 140, backgroundColor: "#18202d", borderRadius: "12px",
    borderWidth: "1px", borderStyle: "solid", borderColor: "#232f42"
  });
}

const backdrop = core.addChildDiv("root", "Modal Backdrop", "modal-backdrop");
core.setProps(backdrop.id, "desktop", {
  position: "fixed", top: "0", right: "0", bottom: "0", left: "0", zIndex: "1000",
  display: "flex", justifyContent: "center", alignItems: "center",
  backgroundColor: "rgba(3, 6, 12, 0.62)", backdropFilter: "blur(12px) saturate(140%)",
  overflow: "auto", minHeight: 0,
  paddingTop: 32, paddingRight: 32, paddingBottom: 32, paddingLeft: 32
});
core.setProps(backdrop.id, "mobile", {
  alignItems: "end",                       // sheet-style on phones
  paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0,
  backdropFilter: ""                       // cheaper on mobile GPUs
});

const dialog = core.addChildDiv(backdrop.id, "Dialog", "modal-dialog");
core.setProps(dialog.id, "desktop", {
  display: "flex", flexDirection: "column", gap: 18,
  width: "100%", maxWidth: "520px", maxHeight: "84vh", overflowY: "auto", minHeight: 0,
  backgroundColor: "#111620", borderWidth: "1px", borderStyle: "solid", borderColor: "#2b3a4f",
  borderRadius: "18px", boxShadow: "0 28px 70px rgba(0, 0, 0, 0.62)",
  transform: "translateY(-6px)", transition: "opacity .25s ease, transform .25s ease",
  paddingTop: 26, paddingRight: 26, paddingBottom: 26, paddingLeft: 26
});
core.setProps(dialog.id, "mobile", {
  maxWidth: "100%", maxHeight: "92vh", borderRadius: "20px",
  transform: "", transition: "",           // no entrance animation on phones
  paddingTop: 20, paddingRight: 18, paddingBottom: 20, paddingLeft: 18
});

const mHead = core.addChildDiv(dialog.id, "Dialog Header", "dialog-header");
core.setProps(mHead.id, "desktop", {
  display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  gap: 16, minHeight: 44
});
const mTitle = core.addChildDiv(mHead.id, "Title", "dialog-title");
core.setProps(mTitle.id, "desktop", { width: "180px", minHeight: 22, backgroundColor: "#243044", borderRadius: "6px" });
const mClose = core.addChildDiv(mHead.id, "Close", "dialog-close");
core.setProps(mClose.id, "desktop", { width: "32px", height: "32px", backgroundColor: "#1d2737", borderRadius: "8px", flexShrink: 0 });

const mBody = core.addChildDiv(dialog.id, "Dialog Body", "dialog-body");
core.setProps(mBody.id, "desktop", { display: "flex", flexDirection: "column", gap: 12, minHeight: 160 });
for (let i = 1; i <= 3; i++) {
  const row = core.addChildDiv(mBody.id, "Field " + i, "dialog-field");
  core.setProps(row.id, "desktop", { minHeight: 44, backgroundColor: "#1b2534", borderRadius: "10px", width: "100%" });
}

const mFoot = core.addChildDiv(dialog.id, "Dialog Footer", "dialog-footer");
core.setProps(mFoot.id, "desktop", {
  display: "flex", flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 12, minHeight: 48
});
core.setProps(mFoot.id, "mobile", { flexDirection: "column-reverse", alignItems: "stretch", gap: 10 });
const mCancel = core.addChildDiv(mFoot.id, "Cancel", "btn-cancel");
core.setProps(mCancel.id, "desktop", { width: "110px", minHeight: 42, backgroundColor: "#1d2737", borderRadius: "10px" });
core.setProps(mCancel.id, "mobile", { width: "100%" });
const mConfirm = core.addChildDiv(mFoot.id, "Confirm", "btn-confirm");
core.setProps(mConfirm.id, "desktop", { width: "150px", minHeight: 42, backgroundColor: "#6366f1", borderRadius: "10px" });
core.setProps(mConfirm.id, "mobile", { width: "100%" });

fs.writeFileSync(path.join(examplesDir, "08-modal-overlay-system.html"), core.generateFullHtmlDocument());
fs.writeFileSync(path.join(examplesDir, "08-modal-overlay-system.json"), JSON.stringify(core.getTreeJson(), null, 2));
console.log("✓ Generated 08-modal-overlay-system.html directly from core.js");

// ----------------------------------------------------------------------------
// Example 09: App Shell — sidebar that becomes a mobile nav
// Exercises: the hide/re-show pair (sidebar hidden on mobile, mobile nav hidden
// on desktop and switched back on), sticky full-height rail, per-breakpoint
// position offsets, off-canvas transform.
// ----------------------------------------------------------------------------
core.resetAll();

const shell = core.addChildDiv("root", "App Shell", "app-shell");
core.setProps(shell.id, "desktop", {
  display: "grid", customColumns: "260px 1fr", gap: 0, minHeight: 640,
  paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, width: "100%"
});
core.setProps(shell.id, "tablet", { customColumns: "76px 1fr" });   // collapsed rail
core.setProps(shell.id, "mobile", { customColumns: "1fr" });

const rail = core.addChildDiv(shell.id, "Sidebar", "app-sidebar");
core.setProps(rail.id, "desktop", {
  display: "flex", flexDirection: "column", gap: 10,
  position: "sticky", top: "0", height: "100vh", overflowY: "auto", minHeight: 0,
  backgroundColor: "#0d1219", borderWidth: "1px", borderStyle: "solid", borderColor: "#1c2534",
  paddingTop: 20, paddingRight: 14, paddingBottom: 20, paddingLeft: 14
});
core.setProps(rail.id, "tablet", { paddingRight: 10, paddingLeft: 10, gap: 8 });
core.setProps(rail.id, "mobile", { hidden: true });                 // gone on phones

const x8_brand = core.addChildDiv(rail.id, "Brand", "rail-x8_brand");
core.setProps(x8_brand.id, "desktop", { minHeight: 40, backgroundColor: "#6366f1", borderRadius: "10px", marginBottom: "14px" });
for (let i = 1; i <= 6; i++) {
  const it = core.addChildDiv(rail.id, "Nav " + i, "rail-item");
  core.setProps(it.id, "desktop", { minHeight: 40, backgroundColor: "#151d29", borderRadius: "9px", width: "100%" });
}
const railFoot = core.addChildDiv(rail.id, "Rail Footer", "rail-footer");
core.setProps(railFoot.id, "desktop", { minHeight: 44, backgroundColor: "#151d29", borderRadius: "9px", marginTop: "auto" });

const content = core.addChildDiv(shell.id, "Content", "app-content");
core.setProps(content.id, "desktop", {
  display: "flex", flexDirection: "column", gap: 20, minHeight: 0,
  paddingTop: 24, paddingRight: 28, paddingBottom: 24, paddingLeft: 28
});
core.setProps(content.id, "mobile", { paddingTop: 14, paddingRight: 14, paddingBottom: 14, paddingLeft: 14, gap: 14 });

// mobile-only nav bar: hidden on desktop, switched back on at the breakpoint
const mobileNav = core.addChildDiv(content.id, "Mobile Nav", "mobile-nav");
core.setProps(mobileNav.id, "desktop", { hidden: true });
core.setProps(mobileNav.id, "mobile", {
  hidden: false, display: "flex", flexDirection: "row",
  justifyContent: "space-between", alignItems: "center", gap: 12, minHeight: 56,
  position: "sticky", top: "0", zIndex: "40",
  backgroundColor: "rgba(13, 18, 25, 0.86)", backdropFilter: "blur(10px)",
  borderRadius: "12px", paddingTop: 10, paddingRight: 12, paddingBottom: 10, paddingLeft: 12, width: "100%"
});
const burger = core.addChildDiv(mobileNav.id, "Burger", "nav-burger");
core.setProps(burger.id, "desktop", { width: "40px", height: "40px", backgroundColor: "#1d2737", borderRadius: "9px", flexShrink: 0 });
const mobileBrand = core.addChildDiv(mobileNav.id, "Brand", "nav-x8_brand");
core.setProps(mobileBrand.id, "desktop", { width: "120px", minHeight: 24, backgroundColor: "#243044", borderRadius: "6px" });
const mobileAvatar = core.addChildDiv(mobileNav.id, "Avatar", "nav-avatar");
core.setProps(mobileAvatar.id, "desktop", { width: "36px", height: "36px", backgroundColor: "#6366f1", borderRadius: "50%", flexShrink: 0 });

const topbar = core.addChildDiv(content.id, "Topbar", "content-topbar");
core.setProps(topbar.id, "desktop", {
  display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center",
  gap: 16, minHeight: 56, width: "100%"
});
core.setProps(topbar.id, "mobile", { hidden: true });
const tbTitle = core.addChildDiv(topbar.id, "Title", "topbar-title");
core.setProps(tbTitle.id, "desktop", { width: "220px", minHeight: 26, backgroundColor: "#243044", borderRadius: "6px" });
const tbActions = core.addChildDiv(topbar.id, "Actions", "topbar-actions");
core.setProps(tbActions.id, "desktop", { display: "flex", flexDirection: "row", gap: 10, alignItems: "center" });
for (let i = 1; i <= 3; i++) {
  const a = core.addChildDiv(tbActions.id, "Action " + i, "topbar-btn");
  core.setProps(a.id, "desktop", { width: "38px", height: "38px", backgroundColor: "#1d2737", borderRadius: "9px", flexShrink: 0 });
}

const kpis = core.addChildDiv(content.id, "KPI Row", "kpi-row");
core.setProps(kpis.id, "desktop", { display: "grid", gridAutoMode: "auto-fit", gridMinColWidth: "190px", gap: 16, width: "100%" });
for (let i = 1; i <= 4; i++) {
  const k = core.addChildDiv(kpis.id, "KPI " + i, "kpi-card");
  core.setProps(k.id, "desktop", {
    minHeight: 104, backgroundColor: "#111620", borderRadius: "12px",
    borderWidth: "1px", borderStyle: "solid", borderColor: "#232f42"
  });
}

const panels = core.addChildDiv(content.id, "Panels", "panel-row");
core.setProps(panels.id, "desktop", { display: "grid", columns: 3, gap: 16, width: "100%" });
core.setProps(panels.id, "tablet", { columns: 2 });
core.setProps(panels.id, "mobile", { columns: 1 });
const chart = core.addChildDiv(panels.id, "Chart", "panel-chart");
core.setProps(chart.id, "desktop", {
  span: 2, minHeight: 320, backgroundColor: "#111620", borderRadius: "14px",
  borderWidth: "1px", borderStyle: "solid", borderColor: "#232f42"
});
core.setProps(chart.id, "mobile", { span: 1, minHeight: 220 });
const feed = core.addChildDiv(panels.id, "Feed", "panel-feed");
core.setProps(feed.id, "desktop", {
  display: "flex", flexDirection: "column", gap: 10, minHeight: 320,
  backgroundColor: "#111620", borderRadius: "14px",
  borderWidth: "1px", borderStyle: "solid", borderColor: "#232f42",
  paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16
});
core.setProps(feed.id, "tablet", { span: 2 });
core.setProps(feed.id, "mobile", { span: 1, minHeight: 200 });
for (let i = 1; i <= 4; i++) {
  const r = core.addChildDiv(feed.id, "Feed Row " + i, "feed-row");
  core.setProps(r.id, "desktop", { minHeight: 52, backgroundColor: "#18202d", borderRadius: "9px", width: "100%" });
}

fs.writeFileSync(path.join(examplesDir, "09-app-shell-collapsing-sidebar.html"), core.generateFullHtmlDocument());
fs.writeFileSync(path.join(examplesDir, "09-app-shell-collapsing-sidebar.json"), JSON.stringify(core.getTreeJson(), null, 2));
console.log("✓ Generated 09-app-shell-collapsing-sidebar.html directly from core.js");

// ----------------------------------------------------------------------------
// Example 10: Editorial Magazine Grid
// Exercises: asymmetric fr tracks, grid-level justify-content/align-items,
// align-self per child, spans that re-flow, aspect-ratio media, sticky aside
// with a breakpoint-changed offset, auto-fit tag strip.
// ----------------------------------------------------------------------------
core.resetAll();

const mag = core.addChildDiv("root", "Magazine", "magazine");
core.setProps(mag.id, "desktop", {
  display: "flex", flexDirection: "column", gap: 28, width: "100%", maxWidth: "1320px",
  horizontalAlign: "center", paddingTop: 32, paddingRight: 32, paddingBottom: 48, paddingLeft: 32
});
core.setProps(mag.id, "mobile", { gap: 18, paddingTop: 16, paddingRight: 14, paddingBottom: 28, paddingLeft: 14 });

const masthead = core.addChildDiv(mag.id, "Masthead", "masthead");
core.setProps(masthead.id, "desktop", {
  display: "grid", customColumns: "1fr auto 1fr", gap: 20, alignItems: "center",
  minHeight: 84, borderWidth: "1px", borderStyle: "solid", borderColor: "#232f42",
  borderRadius: "14px", backgroundColor: "#0f141c",
  paddingTop: 16, paddingRight: 22, paddingBottom: 16, paddingLeft: 22, width: "100%"
});
core.setProps(masthead.id, "mobile", { customColumns: "1fr", gap: 12, justifyItems: "center" });
const mLeft = core.addChildDiv(masthead.id, "Meta", "masthead-meta");
core.setProps(mLeft.id, "desktop", { width: "130px", minHeight: 20, backgroundColor: "#1d2737", borderRadius: "5px" });
const mLogo = core.addChildDiv(masthead.id, "Logo", "masthead-logo");
core.setProps(mLogo.id, "desktop", { width: "220px", minHeight: 38, backgroundColor: "#6366f1", borderRadius: "8px" });
const mRight = core.addChildDiv(masthead.id, "Utilities", "masthead-utils");
core.setProps(mRight.id, "desktop", {
  display: "flex", flexDirection: "row", gap: 10, justifyContent: "flex-end", alignItems: "center"
});
core.setProps(mRight.id, "mobile", { justifyContent: "center" });
for (let i = 1; i <= 3; i++) {
  const u = core.addChildDiv(mRight.id, "Util " + i, "masthead-util");
  core.setProps(u.id, "desktop", { width: "34px", height: "34px", backgroundColor: "#1d2737", borderRadius: "8px", flexShrink: 0 });
}

const hero = core.addChildDiv(mag.id, "Hero", "editorial-hero");
core.setProps(hero.id, "desktop", { display: "grid", customColumns: "1.6fr 1fr", gap: 24, width: "100%" });
core.setProps(hero.id, "tablet", { customColumns: "1fr" });
const heroLead = core.addChildDiv(hero.id, "Lead", "hero-lead");
core.setProps(heroLead.id, "desktop", {
  display: "flex", flexDirection: "column", gap: 14, minHeight: 0,
  backgroundColor: "#111620", borderRadius: "16px", overflow: "hidden",
  borderWidth: "1px", borderStyle: "solid", borderColor: "#232f42",
  paddingTop: 0, paddingRight: 0, paddingBottom: 20, paddingLeft: 0
});
const heroImg = core.addChildDiv(heroLead.id, "Hero Image", "hero-image");
core.setProps(heroImg.id, "desktop", { width: "100%", aspectRatio: "16/9", backgroundColor: "#1d2737" });
core.setProps(heroImg.id, "mobile", { aspectRatio: "4/3" });
const heroCopy = core.addChildDiv(heroLead.id, "Hero Copy", "hero-copy");
core.setProps(heroCopy.id, "desktop", {
  display: "flex", flexDirection: "column", gap: 10, minHeight: 90,
  paddingTop: 4, paddingRight: 22, paddingBottom: 0, paddingLeft: 22
});
for (const [n, h] of [["Kicker", 16], ["Headline", 40], ["Standfirst", 44]]) {
  const l = core.addChildDiv(heroCopy.id, n, "hero-" + n.toLowerCase());
  core.setProps(l.id, "desktop", { minHeight: h, backgroundColor: "#1b2534", borderRadius: "6px", width: n === "Kicker" ? "120px" : "100%" });
}

const heroSide = core.addChildDiv(hero.id, "Secondary", "hero-secondary");
core.setProps(heroSide.id, "desktop", { display: "flex", flexDirection: "column", gap: 16, minHeight: 0 });
core.setProps(heroSide.id, "tablet", { display: "grid", columns: 3, gap: 14 });
core.setProps(heroSide.id, "mobile", { display: "flex", flexDirection: "column", gap: 12 });
for (let i = 1; i <= 3; i++) {
  const s = core.addChildDiv(heroSide.id, "Secondary " + i, "secondary-story");
  core.setProps(s.id, "desktop", {
    display: "flex", flexDirection: "row", gap: 12, minHeight: 104, flexGrow: 1,
    backgroundColor: "#111620", borderRadius: "12px",
    borderWidth: "1px", borderStyle: "solid", borderColor: "#232f42",
    paddingTop: 12, paddingRight: 12, paddingBottom: 12, paddingLeft: 12
  });
  core.setProps(s.id, "mobile", { minHeight: 88 });
  const th = core.addChildDiv(s.id, "Thumb", "secondary-thumb");
  core.setProps(th.id, "desktop", { width: "96px", aspectRatio: "1/1", backgroundColor: "#1d2737", borderRadius: "8px", flexShrink: 0 });
  const tx = core.addChildDiv(s.id, "Text", "secondary-text");
  core.setProps(tx.id, "desktop", { display: "flex", flexDirection: "column", gap: 8, minHeight: 0, alignSelf: "center", width: "100%" });
  for (let k = 0; k < 2; k++) {
    const ln = core.addChildDiv(tx.id, "Line", "secondary-line");
    core.setProps(ln.id, "desktop", { minHeight: 14, backgroundColor: "#1b2534", borderRadius: "4px", width: k === 1 ? "70%" : "100%" });
  }
}

const body = core.addChildDiv(mag.id, "Body", "editorial-body");
core.setProps(body.id, "desktop", { display: "grid", customColumns: "1fr 300px", gap: 28, width: "100%" });
core.setProps(body.id, "tablet", { customColumns: "1fr" });

const stream = core.addChildDiv(body.id, "Stream", "story-stream");
core.setProps(stream.id, "desktop", { display: "grid", gridAutoMode: "auto-fit", gridMinColWidth: "250px", gap: 20, minHeight: 0 });
for (let i = 1; i <= 6; i++) {
  const st = core.addChildDiv(stream.id, "Story " + i, "story-card");
  core.setProps(st.id, "desktop", {
    display: "flex", flexDirection: "column", gap: 12, minHeight: 0, overflow: "hidden",
    backgroundColor: "#111620", borderRadius: "14px",
    borderWidth: "1px", borderStyle: "solid", borderColor: "#232f42",
    paddingTop: 0, paddingRight: 0, paddingBottom: 16, paddingLeft: 0
  });
  const si = core.addChildDiv(st.id, "Image", "story-image");
  core.setProps(si.id, "desktop", { width: "100%", aspectRatio: "3/2", backgroundColor: "#1d2737" });
  const sc = core.addChildDiv(st.id, "Copy", "story-copy");
  core.setProps(sc.id, "desktop", {
    display: "flex", flexDirection: "column", gap: 8, minHeight: 70,
    paddingTop: 2, paddingRight: 16, paddingBottom: 0, paddingLeft: 16
  });
  for (let k = 0; k < 3; k++) {
    const ln = core.addChildDiv(sc.id, "Line", "story-line");
    core.setProps(ln.id, "desktop", { minHeight: k === 0 ? 18 : 12, backgroundColor: "#1b2534", borderRadius: "4px", width: k === 2 ? "60%" : "100%" });
  }
}

const aside = core.addChildDiv(body.id, "Aside", "editorial-aside");
core.setProps(aside.id, "desktop", {
  display: "flex", flexDirection: "column", gap: 16, minHeight: 0,
  position: "sticky", top: "24px", alignSelf: "start"
});
core.setProps(aside.id, "tablet", { position: "static", top: "" });
for (let i = 1; i <= 2; i++) {
  const w = core.addChildDiv(aside.id, "Widget " + i, "aside-widget");
  core.setProps(w.id, "desktop", {
    display: "flex", flexDirection: "column", gap: 10, minHeight: 200,
    backgroundColor: "#111620", borderRadius: "14px",
    borderWidth: "1px", borderStyle: "solid", borderColor: "#232f42",
    paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16
  });
  for (let k = 0; k < 4; k++) {
    const ln = core.addChildDiv(w.id, "Row", "aside-row");
    core.setProps(ln.id, "desktop", { minHeight: 30, backgroundColor: "#18202d", borderRadius: "7px", width: "100%" });
  }
}

const tags = core.addChildDiv(mag.id, "Tag Strip", "tag-strip");
core.setProps(tags.id, "desktop", {
  display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 10,
  justifyContent: "center", alignContent: "center", alignItems: "center",
  minHeight: 64, width: "100%",
  backgroundColor: "#0f141c", borderRadius: "14px",
  borderWidth: "1px", borderStyle: "solid", borderColor: "#232f42",
  paddingTop: 14, paddingRight: 18, paddingBottom: 14, paddingLeft: 18
});
for (let i = 1; i <= 10; i++) {
  const tg = core.addChildDiv(tags.id, "Tag " + i, "tag-chip");
  core.setProps(tg.id, "desktop", { width: "92px", minHeight: 30, backgroundColor: "#1d2737", borderRadius: "999px", flexShrink: 0 });
}

fs.writeFileSync(path.join(examplesDir, "10-editorial-magazine-grid.html"), core.generateFullHtmlDocument());
fs.writeFileSync(path.join(examplesDir, "10-editorial-magazine-grid.json"), JSON.stringify(core.getTreeJson(), null, 2));
console.log("✓ Generated 10-editorial-magazine-grid.html directly from core.js");

console.log("\n🎉 ALL 10 EXAMPLES GENERATED 100% PROGRAMMATICALLY FROM CORE.JS!");
