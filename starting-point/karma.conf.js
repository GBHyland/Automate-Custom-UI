// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

const { join } = require('path');
const { constants } = require('karma');

module.exports = () => {
    return {
        basePath: __dirname,
        frameworks: ['jasmine', '@angular-devkit/build-angular'],
        plugins: [
            require('karma-jasmine'),
            require('karma-chrome-launcher'),
            require('karma-jasmine-html-reporter'),
            require('karma-coverage'),
            require('karma-mocha-reporter'),
            require('@angular-devkit/build-angular/plugins/karma'),
        ],
        client: {
            clearContext: false, // leave Jasmine Spec Runner output visible in browser
        },
        coverageReporter: {
            dir: join(__dirname, './coverage'),
            subdir: '.',
            reporters: [{ type: 'lcov' }, { type: 'html' }, { type: 'json' }, { type: 'text-summary' }],
        },
        reporters: ['mocha', 'coverage'],
        mochaReporter: {
            maxLogLines: 5,
            output: 'full',
            ignoreSkipped: process.env?.IGNORE_SKIPPED === 'true',
        },
        reportSlowerThan: 500,
        port: 9876,
        colors: true,
        logLevel: constants.LOG_ERROR,
        autoWatch: true,
        browsers: ['ChromeHeadless'],
        singleRun: true,
        failOnEmptyTestSuite: true,
        captureTimeout: 180000,
        browserDisconnectTimeout: 180000,
        browserDisconnectTolerance: 3,
        browserNoActivityTimeout: 300000,
        customLaunchers: {
            ChromeHeadlessDebug: {
                base: 'ChromeHeadless',
                flags: ['--no-sandbox', '--headless', '--disable-gpu', '--remote-debugging-port=9222'],
                debug: true,
            },
            ChromeDebug: {
                base: 'Chrome',
                flags: ['--no-sandbox', '--remote-debugging-port=9222'],
                debug: true,
            },
        },
    };
};
