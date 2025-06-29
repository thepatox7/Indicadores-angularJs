module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    files: [
      'https://ajax.googleapis.com/ajax/libs/angularjs/1.8.2/angular.min.js',
      'https://ajax.googleapis.com/ajax/libs/angularjs/1.8.2/angular-mocks.js',
      'app.js',
      'app.spec.js',
      'services.js',
      'services.spec.js'
    ],
    exclude: [],
    preprocessors: {},
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadless'],
    singleRun: false,
    concurrency: Infinity
  })
}