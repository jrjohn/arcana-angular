#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const coverageFile = path.join(__dirname, '../coverage/arcana-angular/coverage-summary.json');
if (!fs.existsSync(coverageFile)) {
  console.error('Coverage file not found. Run npm run test:coverage first.');
  process.exit(1);
}

const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
const total = coverage.total;

console.log('✅ Coverage data loaded');
console.log(`Statements: ${total.statements.pct}%`);
console.log(`Branches: ${total.branches.pct}%`);
console.log(`Functions: ${total.functions.pct}%`);
console.log(`Lines: ${total.lines.pct}%`);

const outputDir = path.join(__dirname, '../docs/test-reports');
fs.mkdirSync(outputDir, { recursive: true });

const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Test Coverage</title></head>
<body><h1>Coverage: ${total.statements.pct}%</h1></body></html>`;

fs.writeFileSync(path.join(outputDir, 'coverage-dashboard.html'), html);
console.log('Report generated!');
