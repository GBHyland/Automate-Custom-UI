/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { UtilRandom, UtilFile } from '../../../../utils';
import { CustomAPIRequest } from '../../../context-factory/context.models';
import { ModelData, Options } from '../../../models';
import { BaseService, RequestResponse } from '../../base.service';
import { ModelCustomParameters, ModelVariation } from '../models';

export class ModelsEndpoint extends BaseService {
    private globalModelsEndpoint: string;

    constructor(private modelVariation: ModelVariation, context: CustomAPIRequest, serviceUrl: string) {
        super(context);
        this.globalModelsEndpoint = `${serviceUrl}/v1/models`;
    }

    /**
     * @param {string} projectId - Specifies target project. Pass 'undefined' if model is supposed to be global.
     * @param {string} modelName - Sets model name. Pass 'undefined' for random name.
     */
    async createModel(
        projectId: string | undefined,
        modelName: string = this.getRandomName(),
        customParameters?: ModelCustomParameters
    ): Promise<ModelData | RequestResponse> {
        const requestBody = {
            name: modelName,
            type: this.modelVariation.type,
            extensions: this.modelVariation.getDefaultExtensionsContent(customParameters),
            scope: undefined,
        };
        let model: ModelData | RequestResponse;

        if (projectId) {
            model = await this.post(this.projectModelsEndpoint(projectId), { data: requestBody });
        } else {
            requestBody.scope = 'GLOBAL';
            model = await this.post(this.globalModelsEndpoint, { data: requestBody });
        }

        await this.updateContent(model.entry.id, this.modelVariation.getDefaultContent(modelName, model.entry.id, customParameters), modelName);

        return model;
    }

    async createGlobalModel(
        modelName: string = this.getRandomName(),
        customParameters?: ModelCustomParameters
    ): Promise<ModelData | RequestResponse> {
        return this.createModel(undefined, modelName, customParameters);
    }

    async updateModelContent(modelId: string, contentPath: string, modelName?: string): Promise<ModelData | RequestResponse> {
        const content = await UtilFile.readFile(contentPath);
        return this.updateContent(modelId, content, modelName);
    }

    async getModel(modelId: string): Promise<ModelData | RequestResponse> {
        return this.get(`${this.globalModelsEndpoint}/${modelId}`);
    }

    async importModel(projectId: string, filePath: string): Promise<ModelData | RequestResponse> {
        const fileContent = UtilFile.getFileFromFileSystem(filePath);
        const requestOptions: Options = {
            params: { type: this.modelVariation.type },
            multipart: { file: fileContent },
        };
        const model = await this.post(`${this.projectModelsEndpoint(projectId)}/import`, requestOptions);
        return model;
    }

    async importModels(projectId: string, filePath: string[]): Promise<void> {
        for (const file of filePath) {
            await this.importModel(projectId, file);
        }
    }

    async importGlobalModel(projectId: string, modelId: string): Promise<void> {
        await this.put(`${this.projectModelsEndpoint(projectId)}/${modelId}`);
    }

    async getContent(modelId: string): Promise<any> {
        const response = await this.get(`${this.globalModelsEndpoint}/${modelId}/content`, { headers: { responseType: 'blob' } });
        return response.body;
    }

    async deleteModel(modelId: string): Promise<RequestResponse> {
        return this.delete(`${this.globalModelsEndpoint}/${modelId}`);
    }

    async deleteGlobalModelIfExists(modelName: string): Promise<RequestResponse> {
        const models = await this.listGlobalModels(modelName);
        return this.deleteModels(models);
    }

    async getIdByName(projectId: string, modelName: string): Promise<string> {
        const firstBatchOfModels = await this.listModels(projectId);
        const foundModel = firstBatchOfModels.find((model) => model.entry.name === modelName);

        return foundModel.entry.id;
    }

    private async updateContent(modelId: string, content: string, modelName = this.getRandomName()): Promise<RequestResponse> {
        const requestOptions: Options = {
            params: { type: this.modelVariation.type },
            multipart: { file: UtilFile.getFileFromString(`${modelName}.${this.modelVariation.contentExtension}`, content) },
        };
        return this.put(`${this.globalModelsEndpoint}/${modelId}/content`, requestOptions);
    }

    private async listModels(projectId: string): Promise<ModelData[] | RequestResponse> {
        const requestOptions: Options = {
            params: {
                type: this.modelVariation.type,
                maxItems: 1000,
            },
        };
        const models = await this.get(this.projectModelsEndpoint(projectId), requestOptions);
        return models.list.entries;
    }

    private async listGlobalModels(modelName: string): Promise<ModelData[]> {
        const requestParams = {
            params: {
                skipCount: 0,
                maxItems: 100,
                sort: 'lastModifiedDate,desc',
                type: this.modelVariation.type,
            },
        };

        const response = await this.get(this.globalModelsEndpoint, requestParams);
        return response.list.entries.filter((entry) => entry.entry.name === modelName);
    }

    private async deleteModels(modelsList: ModelData[]): Promise<RequestResponse> {
        const modelIds = [];
        modelIds.push(...modelsList.map((model) => model.entry.id));
        return Promise.all(modelIds.map((id) => this.deleteModel(id)));
    }

    private projectModelsEndpoint(projectId: string) {
        return `/modeling-service/v1/projects/${projectId}/models`;
    }

    private getRandomName(): string {
        return this.modelVariation.namePrefix + UtilRandom.generateAlphaNumericLowerCase(5);
    }
}
