/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

const dotenv = require('dotenv');
const { resolve } = require('node:path');
const { getIdentityProxy, getShareProxy, getDeployedAppProxy, getIdentityAdapterServiceProxy, wsProxy } = require('../../../proxy-helpers');

dotenv.config({ path: resolve(process.cwd(), 'apps', 'content-ee-apa', '.env') });

const legacyHost = process.env.APP_CONFIG_ECM_HOST;
const cloudHost = process.env.APP_CONFIG_BPM_HOST;
const cloudApps = process.env.APP_CONFIG_APPS_DEPLOYED;

module.exports = {
    ...getIdentityProxy(legacyHost),
    ...getShareProxy(legacyHost),
    ...getDeployedAppProxy(cloudHost, cloudApps),
    ...getIdentityAdapterServiceProxy(cloudHost),
    ...wsProxy(cloudHost),
};
