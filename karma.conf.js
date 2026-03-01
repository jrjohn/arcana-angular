// Minimal karma config: only configure coverage reporters
// Do NOT set framework/browser/plugins here - Angular CLI manages those
module.exports = function (config) {
  config.set({
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage'),
      reporters: [
        { type: 'html', subdir: '.' },
        { type: 'lcovonly', subdir: '.', file: 'lcov.info' }
      ]
    }
  });
};
