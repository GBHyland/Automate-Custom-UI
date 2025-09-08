/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { MonoTypeOperatorFunction, timer } from 'rxjs';
import { last, scan, switchMap, takeWhile, tap } from 'rxjs/operators';

export const RenditionStatus = {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
} as const;

export type RenditionStatus = typeof RenditionStatus[keyof typeof RenditionStatus];

export const DEFAULT_RENDITION_ID = 'pdfPreview';

/**
 * Resubscribes with the switchMapTo to the stream it's used on until the
 * `isPollingActive` function returns false or `maxAttempt` is exceeded.
 * @param {number} [pollInterval] delay between every re-subscription
 * @param {fn => boolean} [isPollingActive] function returning boolean value defining the stream should resubscribe
 * @param {number} [maxAttempts] how many tries should the poll do
 * @param {boolean} [emitOnlyLast] flag to determine if all returned by the subscription values should be emitted or
 * only the last one
 */
export function pollWhile<T>(
    pollInterval: number,
    isPollingActive: (res: T) => boolean,
    maxAttempts = Number.POSITIVE_INFINITY,
    emitOnlyLast = false
): MonoTypeOperatorFunction<T> {
    return (source$) => {
        const poll$ = timer(0, pollInterval).pipe(
            scan((attempts) => ++attempts, 0),
            tap(attemptsGuardFactory(maxAttempts)),
            switchMap(() => source$),
            takeWhile(isPollingActive, true)
        );
        return emitOnlyLast ? poll$.pipe(last()) : poll$;
    };
}

function attemptsGuardFactory(maxAttempts: number) {
    return (attemptsCount: number) => {
        if (attemptsCount > maxAttempts) {
            throw new Error('Exceeded maxAttempts');
        }
    };
}
