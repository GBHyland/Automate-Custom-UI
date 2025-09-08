/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import assert from 'node:assert/strict';
import { APIResponse } from '@playwright/test';
import { logger } from '../../utils/node-logger';
import { LOGS_BLACKLIST, CustomAPIRequest, Options } from '..';

export interface RequestResponse {
    [key: string]: any;
    status?: number;
    body?: string;
}

const StatusCodes = {
    Success: /20\d/,
    ClientError: /40\d/,
    ServerError: /50\d/,
};

export abstract class BaseService {
    context: CustomAPIRequest;
    tokenDetails: { username: string; expires_in: Date } | null;

    constructor(context: CustomAPIRequest) {
        this.context = context;
    }

    protected async get(endpoint: string, options?: Options): Promise<RequestResponse> {
        return this.request('get', endpoint, options);
    }

    protected async post(endpoint: string, options?: Options): Promise<RequestResponse> {
        return this.request('post', endpoint, options);
    }

    protected async put(endpoint: string, options?: Options): Promise<RequestResponse> {
        return this.request('put', endpoint, options);
    }

    protected async delete(endpoint: string, options?: Options): Promise<RequestResponse> {
        return this.request('delete', endpoint, options);
    }

    private async request(httpMethod: string, endpoint: string, overriddenOptions?: Options): Promise<RequestResponse> {
        const startTime = Date.now();
        const response: APIResponse = await this.context.fetch(endpoint, { method: httpMethod, ...overriddenOptions });
        const endTime = Date.now();
        const requestTimeDuration = `[${endTime - startTime} ms]`;
        const statusCode = response.status();

        if (this.checkStatusCode(statusCode, StatusCodes['Success'])) {
            logger.info(this.getRequestLogMessage(httpMethod, endpoint, statusCode, requestTimeDuration, this.context.username, overriddenOptions));
        }

        if (this.checkStatusCode(statusCode, StatusCodes['ClientError'])) {
            logger.warn(await this.getWarnMessage(response, httpMethod, requestTimeDuration));
        }

        if (this.checkStatusCode(statusCode, StatusCodes['ServerError'])) {
            const conditionIfNucleusApiResponseContainsClientError =
                (await this.checkErrorMessageDetails(response, StatusCodes['ClientError'])) ||
                (await this.checkErrorMessageDetails(response, /Forbidden/));
            if (!conditionIfNucleusApiResponseContainsClientError) {
                const errorMessage = this.getErrorMessage(httpMethod, endpoint, await response.text(), requestTimeDuration, overriddenOptions);
                logger.error(errorMessage);
                throw new Error(errorMessage);
            }

            logger.warn(await this.getWarnMessage(response, httpMethod, requestTimeDuration));
        }

        return this.returnParsedJsonData(response);
    }

    private async returnParsedJsonData(response: APIResponse): Promise<RequestResponse> {
        if (response.headers()['content-type'] === 'application/zip') {
            return response.body();
        }

        try {
            return JSON.parse(JSON.parse(JSON.stringify(await response.text())));
        } catch {
            return { status: response.status(), body: await response.text() };
        }
    }

    private checkStatusCode(statusCode: number, statusRegex: RegExp): boolean {
        return statusRegex.test(statusCode.toString());
    }

    private async checkErrorMessageDetails(response: APIResponse, statusRegex: RegExp): Promise<boolean> {
        return statusRegex.test(await response.text());
    }

    private getRequestLogMessage(
        httpMethod: string,
        endpoint: string,
        statusCode: number,
        requestTimeDuration: string,
        username: string,
        overriddenOptions?: Options
    ): string {
        const baseMessage = `[${username}] :: [${httpMethod.toUpperCase()}] :: [${statusCode}] :: ${requestTimeDuration} :: ${endpoint}`;
        return overriddenOptions && !(overriddenOptions?.data instanceof Buffer)
            ? baseMessage.concat(` with data ${JSON.stringify(overriddenOptions, this.maskValues)}`)
            : baseMessage;
    }

    private getErrorMessage(httpMethod: string, endpoint: string, e: any, requestTimeDuration: string, overriddenOptions?: Options): string {
        const params = JSON.stringify(overriddenOptions?.data, this.maskValues, 4);
        return `Error ${httpMethod.toUpperCase()} request :: ${requestTimeDuration} ::
        Endpoint: ${endpoint} ${params ? '\n Params: ' + params : ''}
        Message: ${e.message || e}`;
    }

    private async getWarnMessage(response: APIResponse, httpMethod: string, requestTimeDuration: string): Promise<string> {
        return `[${httpMethod.toUpperCase()}] :: [${response.status()}] :: ${requestTimeDuration} :: ${response.url()} Message: ${await response.text()}`;
    }

    private maskValues(key: string, value: string) {
        return LOGS_BLACKLIST.includes(key) ? '**** REDACTED ****' : value;
    }
}

/**
 * Asserts that the argument looks like a deserialized JSON payload of a successful API call.
 * @see {@link BaseService.prototype.returnParsedJsonData()}
 */
function assertSuccessfulResponseObject<T extends object>(data: T | Buffer | RequestResponse | null | undefined): asserts data is T {
    assert.equal(data === null ? 'null' : typeof data, 'object', 'Response must be an object');
    assert.ok(!Buffer.isBuffer(data), 'Response must not be a Buffer');
    assert.equal((data as any).error, undefined, 'Response should not have an error property');
    assert.equal((data as RequestResponse).status, undefined, 'Response should not have a status property');
    assert.equal((data as RequestResponse).body, undefined, 'Response should not have a body property');
}

/**
 * Asserts that the provided response object is successful and contains an `entry` property that is an object.
 *
 * @see {@linkcode BaseService} and its subclasses, which produce values this function is meant to validate.
 * @throws {AssertionError} If the argument appears to represent a failed API call or lacks an `entry` property.
 *
 * @example
 * ```typescript
 * const data: ProcessInstanceData | RequestResponse = await runtimeBundleService.processInstance.startProcess(processDefinitionKey);
 * assertSuccessfulEntryResponse(data); // throws if `data` is a `RequestResponse`
 * const processInstanceId: string = data.entry.id; // type has been narrowed to just `ProcessInstanceData`
 * ```
 *
 * @remarks
 * This is a [TypeScript assertion function][1] which narrows the type of `data` to `T` for the remainder of the caller's scope.
 *
 * [1]: <https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#assertion-functions>
 */
export function assertSuccessfulEntryResponse<T extends { entry: object }>(data: T | Buffer | RequestResponse | null | undefined): asserts data is T {
    assertSuccessfulResponseObject(data);
    assert.equal(data.entry === null ? 'null' : typeof data.entry, 'object', 'Response entry must be an object');
    assert.equal((data.entry as any).message, undefined, 'Response entry should not have a message property');
    assert.equal((data.entry as any).code, undefined, 'Response entry should not have a code property');
}

/**
 * Asserts that the provided response object is successful and contains a `list` property that is an array.
 *
 * @see {@linkcode BaseService} and its subclasses, which produce values this function is meant to validate.
 * @throws {AssertionError} If the response is not successful or the `list` property is not an array.
 *
 * @remarks
 * This is a [TypeScript assertion function][1] which narrows the type of `data` to `T` for the remainder of the caller's scope.
 *
 * [1]: <https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#assertion-functions>
 */
export function assertSuccessfulListResponse<T extends { list: unknown[] }>(
    data: T | Buffer | RequestResponse | null | undefined
): asserts data is T {
    assertSuccessfulResponseObject(data);
    assert.ok(Array.isArray(data.list), 'Response list must be an array');
}
