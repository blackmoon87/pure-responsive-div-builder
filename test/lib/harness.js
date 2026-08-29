// ============================================================================
// harness.js — a dependency-free test runner.
// Suites export `name` and `run(t)`; `t` collects assertions.
// ============================================================================

export function createCollector() {
  const results = [];
  const t = {
    ok(label, cond, detail) {
      results.push({ label, pass: !!cond, detail: cond ? "" : (detail || "") });
    },
    eq(label, actual, expected) {
      const pass = actual === expected;
      results.push({
        label, pass,
        detail: pass ? "" : `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
      });
    },
    includes(label, haystack, needle) {
      const pass = typeof haystack === "string" && haystack.includes(needle);
      results.push({ label, pass, detail: pass ? "" : `missing ${JSON.stringify(needle)}` });
    },
    excludes(label, haystack, needle) {
      const pass = typeof haystack === "string" && !haystack.includes(needle);
      results.push({ label, pass, detail: pass ? "" : `unexpectedly contains ${JSON.stringify(needle)}` });
    }
  };
  return { t, results };
}

export async function runSuites(suites) {
  let passed = 0, failed = 0;
  for (const suite of suites) {
    const { t, results } = createCollector();
    try {
      await suite.run(t);
    } catch (err) {
      results.push({ label: "suite threw", pass: false, detail: err && err.stack ? err.stack.split("\n")[0] : String(err) });
    }
    const bad = results.filter(r => !r.pass);
    passed += results.length - bad.length;
    failed += bad.length;
    console.log(`\n${bad.length ? "✗" : "✓"} ${suite.name}  (${results.length - bad.length}/${results.length})`);
    for (const r of bad) console.log(`    ✗ ${r.label}${r.detail ? "\n        " + r.detail : ""}`);
  }
  console.log(`\n${"─".repeat(58)}`);
  if (failed) {
    console.log(`✗ ${failed} FAILED, ${passed} passed`);
    process.exitCode = 1;
  } else {
    console.log(`✓ ALL ${passed} ASSERTIONS PASSED`);
  }
  return failed;
}

// Rebuild a fresh tree helper used across suites.
export function fresh(core) {
  core.resetAll();
  return {
    child(parentId, cls, props, device = "desktop") {
      const n = core.addChildDiv(parentId, cls, cls);
      if (props) core.setProps(n.id, device, props);
      return n;
    }
  };
}
