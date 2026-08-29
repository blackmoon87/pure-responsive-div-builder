#!/usr/bin/env node
// ============================================================================
// run.js — runs every Node-side suite. Exits non-zero if anything fails.
//
//   node test/run.js
//
// The responsive sweep is NOT here: it measures real layout, so it needs a
// browser. Serve the repo and open test/responsive.html — see test/README.md.
// ============================================================================
import { runSuites } from "./lib/harness.js";
import regression from "./suites/regression.js";
import propertyCoverage from "./suites/property-coverage.js";
import examples from "./suites/examples.js";

console.log("Pure Responsive DIV Generator — test suite");
console.log("=".repeat(58));
await runSuites([regression, propertyCoverage, examples]);
