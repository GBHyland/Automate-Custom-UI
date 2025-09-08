/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    Observable,
    OperatorFunction,
    switchMap,
    take,
    filter,
    defaultIfEmpty,
    SchedulerLike,
    asyncScheduler,
    timer,
    BehaviorSubject,
    asapScheduler,
} from 'rxjs';

export function pollUntilSuccess<T, R>(
    action$: (value: T) => Observable<R>,
    successCondition: (value: R) => boolean,
    maxAttempts: number,
    pollInterval: number,
    scheduler: SchedulerLike = asyncScheduler
): OperatorFunction<T, R> {
    return (source$: Observable<T>) =>
        source$.pipe(
            switchMap((value) =>
                timer(0, pollInterval, scheduler).pipe(
                    take(maxAttempts),
                    switchMap(() => action$(value)),
                    filter((result) => successCondition(result)),
                    take(1),
                    defaultIfEmpty(undefined as unknown as R)
                )
            )
        );
}

export function repeatUntilSuccess$<T>(
    action$: (value: T | undefined) => Observable<T | undefined>,
    successCondition: (value: T | undefined) => boolean
): Observable<T | undefined> {
    return new Observable<T | undefined>((subscriber) => {
        const invoke$ = new BehaviorSubject<T | undefined>(undefined);

        const subscription = invoke$.pipe(switchMap((invoke) => action$(invoke))).subscribe({
            next: (value) => {
                if (successCondition(value)) {
                    subscriber.next(value);
                    subscriber.complete();
                } else {
                    asapScheduler.schedule(() => invoke$.next(value));
                }
            },
            error: (err) => {
                subscriber.error(err);
            },
        });

        return () => {
            subscription.unsubscribe();
            invoke$.complete();
        };
    });
}
