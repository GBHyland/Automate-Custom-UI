/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

const axios = require('axios');
const { getAuthToken } = require('../../../scripts/utils/get-auth-token');

module.exports = async (projectName) => {
    console.log('Fetching dynamic app details for', projectName);
    const domain = process.env['APP_CONFIG_BPM_HOST'];
    const config = {
        clientId: process.env['APP_CONFIG_OAUTH2_CLIENTID_ADMIN'],
        clientSecret: process.env['APP_CONFIG_OAUTH2_SECRET_ADMIN'],
        username: process.env['DEVOPS_EMAIL'],
        password: process.env['DEVOPS_PASSWORD'],
    };

    const tokenDevops = await getAuthToken(config);

    const filterDescriptors = (applications, appName) => {
        const envId = (process.env['APP_CONFIG_ENVIRONMENT_ID'] || '').split('-');
        const fullAppName = envId ? appName + '-' + envId[0] : appName;
        const deployedApp = applications.find((app) => app.entry.name.indexOf(fullAppName) === 0);
        return deployedApp.entry;
    };

    const getApplicationDescriptor = async (appName) => {
        try {
            const res = await request(`deployment-service/v1/applications?page=0&size=50&sort=createdAt,desc&name=${appName}`);
            const applications = res.data.list.entries;
            if (applications.length > 0) {
                const app = filterDescriptors(applications, appName);
                if (app.status === 'Deployed') {
                    return app.descriptor;
                }
            }
            handleError({
                message: `${appName} is missing or not deployed\nResponse data: ${JSON.stringify(res.data, null, 2)}`,
            });
            return false;
        } catch (error) {
            console.error(`Error fetching deployed applications:`);
            handleError(error);
            return false;
        }
    };

    const getApplicationVariables = async (appInstanceName) => {
        try {
            const res = await request(`deployment-service/v1/applications/${appInstanceName}/variables/ui`);
            console.log('getApplicationVariables', res.data);
            if (res.data) {
                return res.data;
            }
            handleError({
                message: `${appInstanceName} is missing or not deployed\nResponse data: ${JSON.stringify(res.data, null, 2)}`,
            });
            return false;
        } catch (error) {
            console.error(`Error fetching application variables:`);
            handleError(error);
            return false;
        }
    };

    const handleError = (error) => {
        if (error.response) {
            // get response with a status code not in range 2xx
            console.error(error.response.status, error.message);
        } else {
            console.error('Error:', error.message);
        }
        process.exit(1);
    };

    const request = async (url) => {
        return await axios.get(`${domain}/${url}`, {
            headers: {
                Authorization: `Bearer ${tokenDevops}`,
            },
        });
    };

    const { name } = await getApplicationDescriptor(projectName);
    const { APP_CONFIG_APPS_DEPLOYED, APP_CONFIG_OAUTH2_SCOPE, APP_CONFIG_ECM_HOST, APP_CONFIG_OAUTH2_CLIENTID } = await getApplicationVariables(
        name
    );

    console.log('configure CI to refer default deployed app');
    process.env['APP_CONFIG_APPS_DEPLOYED'] = APP_CONFIG_APPS_DEPLOYED;
    process.env['APP_CONFIG_OAUTH2_SCOPE'] = APP_CONFIG_OAUTH2_SCOPE;
    process.env['APP_CONFIG_ECM_HOST'] = APP_CONFIG_ECM_HOST;
    process.env['APP_CONFIG_OAUTH2_CLIENTID'] = APP_CONFIG_OAUTH2_CLIENTID;
};
