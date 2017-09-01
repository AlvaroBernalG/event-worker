module.exports = function (config) {
  config.set({
    frameworks: ['browserify', 'mocha', 'chai'],
    files: [
      'test/*.test.js',
      {
        pattern: 'test/worker.helper.js',
        included: false,
        served: true
      },
      {
        pattern: 'index.js',
        included: false,
        served: true
      }
    ],
    preprocessors: {
      'test/*.test.js': [ 'browserify' ]
    },
    browserify: {
      debug: true
    },
    reporters: ['progress'],
    port: 9876,  // karma web server port
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['ChromeHeadless', 'firefox', 'Safari'],
    autoWatch: false,
    // singleRun: false, // Karma captures browsers, runs the tests and exits
    concurrency: Infinity
  })
}
