/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DestroyRef, inject, Injectable, OnDestroy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

@Injectable()
export class ResizeObserverService implements OnDestroy {
    private resizeObserver?: ResizeObserver;
    private readonly resizeChange$ = new Subject<ResizeObserverEntry[]>();
    private readonly resize$ = this.resizeChange$.asObservable();
    private readonly stopObserveSubject$ = new Subject<HTMLElement>();

    private readonly destroyRef = inject(DestroyRef);

    ngOnDestroy(): void {
        this.resizeObserver?.disconnect();
        this.resizeObserver = undefined;
    }

    observe(element: HTMLElement) {
        this.getObserver().observe(element);
        return this.resize$.pipe(
            takeUntilDestroyed(this.destroyRef),
            map((changes) => changes.find((change) => change.target === element)),
            filter((change) => !!change),
            takeUntil(this.stopObserveSubject$.pipe(map((e) => e === element)))
        );
    }

    unobserve(element: HTMLElement): void {
        this.resizeObserver?.unobserve(element);
        this.stopObserveSubject$.next(element);
    }

    private getObserver(): ResizeObserver {
        if (!this.resizeObserver) {
            this.resizeObserver = new ResizeObserver((change) => this.resizeChange$.next(change));
        }

        return this.resizeObserver;
    }
}
