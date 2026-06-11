#!/usr/bin/env node
// Compare a current scanner findings JSON against a baseline.
// Writes new_high_critical=<n> to $GITHUB_OUTPUT and exits non-zero
// when any new HIGH or CRITICAL findings appear vs. the baseline.
//
// Usage: node scripts/compare-findings.js <baseline.json> <current.json>
//
// Finding shape (any extra fields are ignored):
//   { "id": string, "severity": "LOW|MEDIUM|HIGH|CRITICAL", ... }
const fs = require("fs");

const [, , baselinePath, currentPath] = process.argv;
if (!baselinePath || !currentPath) {
  console.error("usage: compare-findings.js <baseline.json> <current.json>");
  process.exit(2);
}

const readJson = (p) => {
  if (!fs.existsSync(p)) return [];
  try { return JSON.parse(fs.readFileSync(p, "utf8")); }
  catch (e) {
    console.error(`Failed to parse ${p}: ${e.message}`);
    process.exit(2);
  }
};

const baseline = readJson(baselinePath);
const current = readJson(currentPath);

if (!Array.isArray(baseline) || !Array.isArray(current)) {
  console.error("Both inputs must be JSON arrays");
  process.exit(2);
}

const baselineIds = new Set(baseline.map((f) => `${f.scanner ?? "unknown"}:${f.id}`));
const newHighCritical = current.filter((f) => {
  const key = `${f.scanner ?? "unknown"}:${f.id}`;
  return !baselineIds.has(key) && (f.severity === "HIGH" || f.severity === "CRITICAL");
});

console.log(`Baseline findings: ${baseline.length}`);
console.log(`Current findings:  ${current.length}`);
console.log(`New HIGH/CRITICAL: ${newHighCritical.length}`);
for (const f of newHighCritical) {
  console.error(`  - [${f.severity}] ${f.scanner ?? "unknown"}:${f.id} — ${f.rule ?? "(no rule)"}`);
}

if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(
    process.env.GITHUB_OUTPUT,
    `new_high_critical=${newHighCritical.length}\n`,
  );
}

process.exit(newHighCritical.length > 0 ? 1 : 0);
