// coverage-patch.js
// Patches karma-coverage at container start to add lcovonly reporter
// Angular 20 @angular/build:karma doesn't expose coverageReporter config
// via karmaConfig without breaking the Angular framework setup.
// This patches karma-coverage/lib/reporter.js directly.

var fs = require('fs');
var reporterPath = '/app/node_modules/karma-coverage/lib/reporter.js';
var source = fs.readFileSync(reporterPath, 'utf8');

if (source.indexOf('lcov-injected') >= 0) {
  console.log('[lcov-inject] already patched');
  process.exit(0);
}

// karma-coverage 2.2.x: var config = rootConfig.coverageReporter || {}
// then: var reporters = config.reporters
var target = 'var reporters = config.reporters';
var injection = [
  '// lcov-injected: ensure lcovonly reporter is included',
  'if (!config.reporters) {',
  '  config.reporters = [',
  '    { "type": "html", "subdir": "." },',
  '    { "type": "lcovonly", "subdir": ".", "file": "lcov.info" }',
  '  ];',
  '} else if (!config.reporters.some(function(r) { return r.type === "lcovonly"; })) {',
  '  config.reporters.push({ "type": "lcovonly", "subdir": ".", "file": "lcov.info" });',
  '}',
  target
].join('\n  ');

var patched = source.replace(target, injection);

if (patched !== source) {
  fs.writeFileSync(reporterPath, patched);
  console.log('[lcov-inject] karma-coverage patched OK');
} else {
  console.log('[lcov-inject] WARNING: patch target not found - check karma-coverage version');
  console.log('[lcov-inject] searching for:', JSON.stringify(target));
  // Try to find nearby text for debugging
  var idx = source.indexOf('var reporters');
  if (idx >= 0) console.log('[lcov-inject] found "var reporters" at index', idx, ':', JSON.stringify(source.substring(idx, idx + 60)));
}
