// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

const { join } = require('path');
const getBaseKarmaConfig = require('../../../../../../karma.conf');

module.exports = function (config) {
    const baseConfig = getBaseKarmaConfig();
    config.set({
        ...baseConfig,
        coverageReporter: {
            ...baseConfig.coverageReporter,
            dir: join(
                __dirname,
                '../../../../../../coverage/libs/workspace-hxp/content-services-extension/shared/content-repository/ui'
            ),
        },
        files: [
            { pattern: '../../../../../../node_modules/@angular/material/iconfont/MaterialIcons-Regular.woff2', included: true, watched: true },
            { pattern: '../../../../../../node_modules/@angular/material/iconfont/MaterialIcons-Regular.woff', included: true, watched: true }
        ],
    });
};
