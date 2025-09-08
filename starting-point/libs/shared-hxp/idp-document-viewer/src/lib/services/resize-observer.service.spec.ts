/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { ResizeObserverService } from './resize-observer.service';
import { Subject } from 'rxjs';

const triggerResizeChange$ = new Subject<ResizeObserverEntry[]>();

class ResizeObserver {
    constructor(fn: (changes: ResizeObserverEntry[]) => void) {
        triggerResizeChange$.subscribe((changes) => fn(changes));
    }

    observe() {}
    unobserve() {}
    disconnect() {}
}

describe('Idp Viewer ResizeObserverService', () => {
    let service: ResizeObserverService;

    beforeAll(() => {
        Object.defineProperty(window, 'ResizeObserver', {
            value: ResizeObserver,
        });
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ResizeObserverService],
        });
        service = TestBed.inject(ResizeObserverService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should observe element and emit on change', (done) => {
        const testX = 100;
        const testY = 200;
        const testElement = document.createElement('div');
        const testChange: ResizeObserverEntry = {
            target: testElement,
            borderBoxSize: [],
            contentBoxSize: [],
            contentRect: new DOMRectReadOnly(testX, testY, 0, 0),
            devicePixelContentBoxSize: [],
        };

        service.observe(testElement).subscribe((change) => {
            expect(change?.contentRect.x).toEqual(testX);
            expect(change?.contentRect.y).toEqual(testY);
            done();
        });

        triggerResizeChange$.next([{ ...testChange, target: document.createElement('span'), contentRect: new DOMRectReadOnly(0, 0, 0, 0) }]);
        triggerResizeChange$.next([testChange]);
    });

    it('should unobserve element', (done) => {
        const testElement = document.createElement('div');
        service.observe(testElement).subscribe({
            next: () => {
                fail('should not emit');
            },
            complete: () => {
                done();
            },
        });
        triggerResizeChange$.next([
            {
                target: document.createElement('span'),
                borderBoxSize: [],
                contentBoxSize: [],
                contentRect: new DOMRectReadOnly(),
                devicePixelContentBoxSize: [],
            },
        ]);
        service.unobserve(testElement);
    });
});
