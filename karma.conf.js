// Minimal Karma config override for CI
// Angular CLI injects the framework/plugin config automatically via ng test.
// We only define the custom browser launcher here.
module.exports = function (config) {
  config.set({
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--remote-debugging-port=9222',
        ],
      },
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage'),
      subdir: '.',
      reporters: [
        { type: 'lcov' },
        { type: 'text-summary' },
      ],
    },
  });
};
