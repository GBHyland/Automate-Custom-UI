/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    test as base,
    getDeployedApp,
    HxpLoginPage,
    HxprApi,
    IdpService,
    QueryService,
    RuntimeBundleService,
    PreferenceMock,
} from '@alfresco-dbp/playwright/shared';
import {
    ContentBrowserPage,
    TasksPage,
    ProcessPage,
    StartProcessPage,
    TaskDetailsPage,
    SearchPage,
    ClassificationPage,
    FieldVerificationPage,
    CustomUiPage,
    ProcessDetailsPage,
    GovernancePage,
} from '../page-object/pages';
import { DocumentMock } from '../mocks';
import { IdpBatchStateSnapshotInitializer } from '../utils/idp-batch-state-snapshots';
import { TemporaryUploadFolder } from '../utils/temporary-upload-folder';

interface Pages {
    contentBrowserPage: ContentBrowserPage;
    tasksPage: TasksPage;
    processPage: ProcessPage;
    customUiPage: CustomUiPage;
    startProcessPage: StartProcessPage;
    taskDetailsPage: TaskDetailsPage;
    hxpIdpLoginPage: HxpLoginPage;
    searchPage: SearchPage;
    idpClassificationPage: ClassificationPage;
    fieldVerificationPage: FieldVerificationPage;
    processDetailsPage: ProcessDetailsPage;
    governancePage: GovernancePage;
}

interface Api {
    hxprApi: HxprApi;
    documentMock: DocumentMock;
    runtimeBundleServiceHrUser: RuntimeBundleService;
    runtimeBundleServiceRepoAdmin: RuntimeBundleService;
    queryServiceHrUser: QueryService;
    preferenceMock: PreferenceMock;
    idpServiceHrUser: IdpService;
    idpBatchStateSnapshotInitializer: IdpBatchStateSnapshotInitializer;
}

interface Resources {
    uploadStore: TemporaryUploadFolder;
}

export const test = base.extend<Pages & Api, Resources>({
    contentBrowserPage: async ({ page }, use) => {
        await use(new ContentBrowserPage(page));
    },
    fieldVerificationPage: async ({ page }, use) => {
        await use(new FieldVerificationPage(page));
    },
    idpClassificationPage: async ({ page }, use) => {
        await use(new ClassificationPage(page));
    },
    tasksPage: async ({ page }, use) => {
        await use(new TasksPage(page));
    },
    processPage: async ({ page }, use) => {
        await use(new ProcessPage(page));
    },
    startProcessPage: async ({ page }, use) => {
        await use(new StartProcessPage(page));
    },
    taskDetailsPage: async ({ page }, use) => {
        await use(new TaskDetailsPage(page));
    },
    hxpIdpLoginPage: async ({ page }, use) => {
        await use(new HxpLoginPage(page));
    },
    searchPage: async ({ page }, use) => {
        await use(new SearchPage(page));
    },
    customUiPage: async ({ page }, use) => {
        await use(new CustomUiPage(page));
    },
    processDetailsPage: async ({ page }, use) => {
        await use(new ProcessDetailsPage(page));
    },
    governancePage: async ({ page }, use) => {
        await use(new GovernancePage(page));
    },
    // eslint-disable-next-line no-empty-pattern
    hxprApi: async ({}, use) => {
        await use(await new HxprApi().initialize());
    },
    documentMock: async ({ page }, use) => {
        await use(new DocumentMock(page));
    },
    preferenceMock: async ({ page }, use) => {
        await use(new PreferenceMock(page));
    },
    runtimeBundleServiceHrUser: async ({ hrUserApiContext }, use, workerInfo) => {
        const { appName } = getDeployedApp(workerInfo);
        await use(new RuntimeBundleService(hrUserApiContext, appName));
    },
    runtimeBundleServiceRepoAdmin: async ({ repoAdminApiContext }, use, workerInfo) => {
        const { appName } = getDeployedApp(workerInfo);
        await use(new RuntimeBundleService(repoAdminApiContext, appName));
    },
    queryServiceHrUser: async ({ hrUserApiContext }, use, workerInfo) => {
        const { appName } = getDeployedApp(workerInfo);
        await use(new QueryService({ context: hrUserApiContext, appName: appName }));
    },
    uploadStore: [
        // eslint-disable-next-line no-empty-pattern
        async ({}, use) => {
            const hxprApi = await new HxprApi().initialize();
            const uploadStore = await TemporaryUploadFolder.create(hxprApi);
            await use(uploadStore)
                .finally(() => hxprApi.initialize()) // In case of token expiration before disposing
                .finally(() => uploadStore[Symbol.asyncDispose]()); // eslint doesn't seem to understand `await using` yet...
        },
        { scope: 'worker' },
    ],
    idpServiceHrUser: async ({ hrUserApiContext }, use) => {
        const idpService = new IdpService(hrUserApiContext);
        await use(idpService);
    },
    idpBatchStateSnapshotInitializer: async ({ uploadStore, idpServiceHrUser: idpService, hxprApi }, use) => {
        const batchStateSnapshotInitializer = new IdpBatchStateSnapshotInitializer(uploadStore, idpService, hxprApi);
        await use(batchStateSnapshotInitializer);
    },
});

export { expect } from '@playwright/test';
