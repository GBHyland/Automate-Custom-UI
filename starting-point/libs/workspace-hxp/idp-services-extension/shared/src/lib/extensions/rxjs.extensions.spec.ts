/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { of, throwError } from 'rxjs';
import { pollUntilSuccess, repeatUntilSuccess$ } from './rxjs.extensions';

describe('rxjs.extensions', () => {
    describe('pollUntilSuccess', () => {
        it('should complete when success condition is met', () => {
            const action$ = jest.fn().mockReturnValue(of('success'));
            const successCondition = jest.fn().mockReturnValue(true);

            const source$ = of('start');
            const result$ = source$.pipe(pollUntilSuccess(action$, successCondition, 3, 100));

            result$.subscribe({
                next: (result) => {
                    expect(result).toBe('success');
                },
                complete: () => {
                    expect(action$).toHaveBeenCalledTimes(1);
                    expect(successCondition).toHaveBeenCalledTimes(1);
                },
            });
        });

        it('should retry until max attempts are reached', () => {
            const action$ = jest.fn().mockReturnValue(of('failure'));
            const successCondition = jest.fn().mockReturnValue(false);

            const source$ = of('start');
            const result$ = source$.pipe(pollUntilSuccess(action$, successCondition, 3, 100));

            result$.subscribe({
                next: (result) => {
                    expect(result).toBeUndefined();
                },
                complete: () => {
                    expect(action$).toHaveBeenCalledTimes(3);
                    expect(successCondition).toHaveBeenCalledTimes(3);
                },
            });
        });

        it('should handle errors from action$', () => {
            const action$ = jest.fn().mockReturnValue(throwError(() => 'error'));
            const successCondition = jest.fn().mockReturnValue(false);

            const source$ = of('start');
            const result$ = source$.pipe(pollUntilSuccess(action$, successCondition, 3, 100));

            result$.subscribe({
                error: (err) => {
                    expect(err).toBe('error');
                },
            });
        });
    });

    describe('repeatUntilSuccess$', () => {
        it('should complete when success condition is met', () => {
            const action$ = jest.fn().mockReturnValue(of('success'));
            const successCondition = jest.fn().mockReturnValue(true);

            const result$ = repeatUntilSuccess$(action$, successCondition);

            result$.subscribe({
                next: (result) => {
                    expect(result).toBe('success');
                },
                complete: () => {
                    expect(action$).toHaveBeenCalledTimes(1);
                    expect(successCondition).toHaveBeenCalledTimes(1);
                },
            });
        });

        it('should retry until success condition is met', () => {
            const action$ = jest.fn().mockReturnValueOnce(of('failure')).mockReturnValueOnce(of('success'));
            const successCondition = jest.fn().mockReturnValueOnce(false).mockReturnValueOnce(true);

            const result$ = repeatUntilSuccess$(action$, successCondition);

            result$.subscribe({
                next: (result) => {
                    expect(result).toBe('success');
                },
                complete: () => {
                    expect(action$).toHaveBeenCalledTimes(2);
                    expect(successCondition).toHaveBeenCalledTimes(2);
                },
            });
        });

        it('should handle errors from action$', () => {
            const action$ = jest.fn().mockReturnValue(throwError(() => 'error'));
            const successCondition = jest.fn().mockReturnValue(false);

            const result$ = repeatUntilSuccess$(action$, successCondition);

            result$.subscribe({
                error: (err) => {
                    expect(err).toBe('error');
                },
            });
        });
    });
});
