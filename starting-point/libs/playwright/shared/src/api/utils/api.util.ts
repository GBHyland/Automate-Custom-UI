/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export type ApiResultPredicate<T> = (result: T) => boolean;
export type ApiCall<T> = () => Promise<T>;

export const ApiUtil = {
    async waitForApi<T>(apiCall: ApiCall<T>, predicate: ApiResultPredicate<T>, retry: number = 30, delay: number = 1000) {
        const apiCallWithPredicateChecking = async () => {
            const apiCallResult = await apiCall();
            return predicate(apiCallResult) ? Promise.resolve(apiCallResult) : Promise.reject(apiCallResult);
        };

        return ApiUtil.retryCall(apiCallWithPredicateChecking, retry, delay);
    },

    retryCall(fn: () => Promise<any>, retry: number = 30, delay: number = 1000): Promise<any> {
        const pause = (duration) => new Promise((res) => setTimeout(res, duration));
        const run = (retries) => fn().catch((error) => (retries > 1 ? pause(delay).then(() => run(retries - 1)) : Promise.reject(error)));

        return run(retry);
    },
};
