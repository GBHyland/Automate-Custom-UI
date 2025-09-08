/*
 * Copyright 2005-2018 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

const {
    getDeployedAppProxy,
    getIdentityAdapterServiceProxy,
    getGovernanceServiceProxy,
    hxpContentRepositoryProxy,
    getNucleusProxy,
    getIntelligentDocumentProcessingServiceProxy,
} = require('../../proxy-helpers');

const cloudHost = process.env.APP_CONFIG_BPM_HOST;
const ecmHost = process.env.APP_CONFIG_ECM_HOST;
const cloudApps = process.env.APP_CONFIG_APPS_DEPLOYED;
const governanceHost = process.env.APP_CONFIG_GOVERNANCE_HOST;
const nucleusHost = process.env.NUCLEUS_API_HOST;
const hxIdpHost = process.env.HXP_INTELLIGENT_DOCUMENT_PROCESSING_URL;

const deployedAppProxy = cloudHost ? getDeployedAppProxy(cloudHost, cloudApps) : {};
const identityAdapterServiceProxy =  cloudHost ? getIdentityAdapterServiceProxy(cloudHost) : {};
const hxpContentProxy = ecmHost ? hxpContentRepositoryProxy(ecmHost) : {};
const governanceServiceProxy = governanceHost ? getGovernanceServiceProxy(governanceHost) : {};
const nucleusProxy = nucleusHost ? getNucleusProxy(nucleusHost) : {};
const intelligentDocumentProcessingServiceProxy = hxIdpHost ? getIntelligentDocumentProcessingServiceProxy(hxIdpHost) : {};

module.exports = {
    ...deployedAppProxy,
    ...identityAdapterServiceProxy,
    ...intelligentDocumentProcessingServiceProxy,
    ...hxpContentProxy,
    ...governanceServiceProxy,
    ...nucleusProxy,
};
