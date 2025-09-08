/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { RetryMessage } from '../models';
import { logger } from '../../utils/node-logger';
import { timeouts } from '../../utils/timeouts';

export type ApiResultPredicate<T> = (result: T) => boolean | Error;
export type ApiCall<T> = () => Promise<T>;

export const ApiUtils = {
    async waitForApi<T>(
        apiCall: ApiCall<T>,
        predicate: ApiResultPredicate<T>,
        retryMessage: RetryMessage = {},
        retry: number = 10,
        delay = timeouts.default
    ) {
        const apiCallWithPredicateChecking = async () => {
            const apiCallResult = await apiCall();
            return predicate(apiCallResult) ? Promise.resolve(apiCallResult) : Promise.reject(apiCallResult);
        };

        const actualRetryMessage = { level: 'debug', ...retryMessage };
        logger[actualRetryMessage.level](
            `Going to retry ${retry} times with ${delay / 1000} sec until condition will be met: ${actualRetryMessage.waitingMessage}`
        );

        return ApiUtils.retryCall(apiCallWithPredicateChecking, retry, delay, retryMessage);
    },

    retryCall(fn: () => Promise<any>, retry: number = 10, delay = timeouts.default, retryMessage: RetryMessage = {}): Promise<any> {
        const actualRetryMessage = { level: 'info', ...retryMessage };

        const pause = (duration) => new Promise((res) => setTimeout(res, duration));
        const run = (retries) =>
            fn().catch(() => {
                if (retries > 1) {
                    return pause(delay).then(() => run(retries - 1));
                } else {
                    if (actualRetryMessage.errorMessage) {
                        logger.error(actualRetryMessage.errorMessage);
                    }

                    throw actualRetryMessage.errorMessage;
                }
            });

        return run(retry);
    },
};
