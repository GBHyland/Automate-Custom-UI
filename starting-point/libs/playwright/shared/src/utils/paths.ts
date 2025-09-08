/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import path from 'node:path';

const rootFolder = 'e2e-output';

export const paths = {
    rootFolder,
    allData: `${rootFolder}/playwright-data`,
    files: `${rootFolder}/playwright-data/downloads`,
    report: `${rootFolder}/playwright-data/report`,
    userStates: `${rootFolder}/playwright-data/user-states`,
    envFile: path.resolve(`${__dirname}/../../../../../.env`),
    usersDataToken: path.resolve(`${rootFolder}/playwright-data`),
};
