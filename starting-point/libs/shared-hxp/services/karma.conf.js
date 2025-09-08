/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

const { join } = require('path');
const getBaseKarmaConfig = require('../../../karma.conf');

module.exports = function (config) {
    const baseConfig = getBaseKarmaConfig();
    config.set({
        ...baseConfig,
        coverageReporter: {
            ...baseConfig.coverageReporter,
            dir: join(
                __dirname,
                '../../../coverage/libs/workspace-hxp/shared/services'
            ),
        },
    });
};
