/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import assert from 'node:assert/strict';

import {
    ApiUtils,
    assertSuccessfulEntryResponse,
    deepFreeze,
    DeepReadonly,
    FileProperties,
    HXP_APPS,
    HxprApi,
    IdpService,
    ProcessInstanceData,
    RuntimeBundleService,
} from '@alfresco-dbp/playwright/shared';
import { logger } from '@alfresco-dbp/playwright/shared/utils/node-logger';
import { IdpActionTypes } from '@hxp/workspace-hxp/idp-services-extension/shared/models/api-models/idp-api-recognition-models';
import { ContentFileReference, filterContentFileReference } from '@hxp/workspace-hxp/idp-services-extension/shared/models/contracts/task-input';

import { TemporaryUploadFolder } from './temporary-upload-folder';

const TEST_PROCESS_INFO = HXP_APPS.SYS_IDP_E2E.processes;

type SatisfactoryKeysOf<T, U> = { [K in keyof T]: T[K] extends U ? K : never }[keyof T];
type ProcessInfoKey = SatisfactoryKeysOf<typeof TEST_PROCESS_INFO, ProcessInfo>;

type ProcessInfo = DeepReadonly<{
    processName: string;
    processDefinitionKey: string;
    variables: {
        batchState: {
            name: string;
        };
    };
}>;

type GenericBatchState = DeepReadonly<{
    contentFileReferences: ContentFileReference[];
    [key: string]: unknown; // Allow any additional properties
}>;

type IdpBatchStateSnapshotInfoInit = DeepReadonly<{
    batchStateSnapshot: GenericBatchState;
    localContentFiles: FileProperties[];
    processInfoKey: ProcessInfoKey;
}>;

type IdpBatchStateSnapshotInfo = DeepReadonly<Omit<IdpBatchStateSnapshotInfoInit, 'processInfoKey'> & { processInfo: ProcessInfo }>;

export function createIdpBatchStateSnapshotTemplateMap<K extends string>(setup: Record<K, IdpBatchStateSnapshotInfoInit>) {
    const map = {} as Record<K, IdpBatchStateSnapshotInfo>;
    for (const key of Object.keys(setup)) {
        const initInfo = setup[key];
        const procInfo = TEST_PROCESS_INFO[setup[key].processInfoKey];
        assert.ok(procInfo, `Property with name '${initInfo.processInfoKey}' not found in 'HXP_APPS.SYS_IDP_E2E.processes'`);
        assert.equal(
            initInfo.localContentFiles.length,
            initInfo.batchStateSnapshot.contentFileReferences?.length,
            `Mismatch between localContentFiles and batchState.contentFileReferences lengths`
        );
        map[key] = { ...initInfo, processInfo: procInfo };
    }
    return deepFreeze(map);
}

export class IdpBatchStateSnapshotInitializer {
    constructor(private readonly uploadStore: TemporaryUploadFolder, private readonly idpService: IdpService, private readonly hxprApi: HxprApi) {}

    async upload(snapshotInfo: IdpBatchStateSnapshotInfo) {
        const uploads = await this.uploadStore.uploadFiles(snapshotInfo.localContentFiles);
        logger.info(`[${this.constructor.name}] Uploaded ${uploads.length} files`);
        const contentFileReferences = uploads.map((file) => filterContentFileReference(file as ContentFileReference));
        const initializedBatchState = deepFreeze({ ...snapshotInfo.batchStateSnapshot, contentFileReferences });
        return new IdpBatchStateSnapshotRunner(initializedBatchState, snapshotInfo.processInfo, this.idpService, this.hxprApi);
    }
}

export class IdpBatchStateSnapshotRunner {
    constructor(
        private readonly batchState: GenericBatchState,
        private readonly processInfo: ProcessInfo,
        private readonly idpService: IdpService,
        private readonly hxprApi: HxprApi
    ) {}

    private async recognize(processInstanceId: string, fileReferences: ReadonlyArray<string>) {
        for (const fileReference of fileReferences) {
            await this.sendForRecognition(processInstanceId, fileReference);
        }
        for (const fileReference of fileReferences) {
            await this.pollForRecognition(processInstanceId, fileReference);
        }
    }

    private async pollForRecognition(processInstanceId: string, fileReference: string) {
        const data = await ApiUtils.waitForApi(
            async () => {
                const response = await this.idpService.recognition.getFilePageOcr(processInstanceId, fileReference, 0);
                const details = JSON.stringify({ processInstanceId, fileReference, status: response.status });
                logger.debug(`[${this.constructor.name}] Polled file for IDP processing OCR results: ${details}`);
                return response;
            },
            (response) => response.status === 'Succeeded' || response.status === 'Failed',
            {
                waitingMessage: `Waiting for OCR results for ${fileReference} for process ${processInstanceId}`,
                errorMessage: `No OCR results for ${fileReference} for process ${processInstanceId} in the expected waiting time`,
            },
            30 // retries
        );
        assert.equal(data.status, 'Succeeded', `Failed to get OCR results for ${fileReference} for process ${processInstanceId}`);
        logger.info(`[${this.constructor.name}] File has finished OCR processing: ${JSON.stringify({ processInstanceId, fileReference })}`);
    }

    private async sendForRecognition(processInstanceId: string, fileReference: string) {
        const response = await this.idpService.recognition.postFile(processInstanceId, fileReference, IdpActionTypes.Ocr, this.hxprApi);
        logger.debug(`[${this.constructor.name}] Posted file for IDP processing: ${JSON.stringify({ processInstanceId, fileReference, response })}`);
        assert.equal(response.status, 202, `Failed to post file for IDP processing: ${JSON.stringify(response)}`);
    }

    async startProcess(runtimeBundleService: RuntimeBundleService): Promise<ProcessInstanceData> {
        const variables = { [this.processInfo.variables.batchState.name]: this.batchState };
        const data = await runtimeBundleService.processInstance.startProcess(this.processInfo.processDefinitionKey, { variables });
        assertSuccessfulEntryResponse(data);
        assert.equal(typeof data.entry.id, 'string', 'Process instance entry must have an id of type string');
        logger.info(`[${this.constructor.name}] Started process instance with id ${data.entry.id} for ${data.entry.processDefinitionName}`);
        try {
            const fileReferences = this.batchState.contentFileReferences.map((file) => file.sys_id);
            await this.recognize(data.entry.id, fileReferences);
        } catch (error) {
            logger.error(`[${this.constructor.name}] Error during IDP recognition for process ${data.entry.id}: ${JSON.stringify(error)}`);
            await runtimeBundleService.processInstance.deleteProcessInstance(data.entry.id);
            throw error;
        }
        return data;
    }
}
