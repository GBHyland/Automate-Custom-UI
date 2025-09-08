/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RouterExtService } from './router-ext.service';
import { Subject } from 'rxjs';
import { Component } from '@angular/core';

@Component({ template: '' })
class DummyComponent {}

describe('RouterExtService', () => {
    let service: RouterExtService;
    let router: Router;
    const mockActivatedRoute = { snapshot: {} };
    let events: Subject<any>;

    beforeEach(() => {
        events = new Subject<any>();
        TestBed.configureTestingModule({
            imports: [
                RouterTestingModule.withRoutes([
                    { path: 'home', component: DummyComponent },
                    { path: 'search/query', component: DummyComponent },
                    { path: 'user/profile', component: DummyComponent },
                ]),
            ],
            providers: [
                RouterExtService,
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                {
                    provide: Router,
                    useValue: {
                        events: events.asObservable(),
                        url: '/initial',
                        navigateByUrl: jest.fn(),
                        navigate: jest.fn(),
                    },
                },
            ],
        });
        router = TestBed.inject(Router);
        service = TestBed.inject(RouterExtService);
    });

    it('should capture the URL change correctly', fakeAsync(() => {
        const navigationEnd = new NavigationEnd(1, '/initial', '/current-url');
        events.next(navigationEnd);
        tick();

        expect(service.getPreviousUrl()).toBe('/initial');
    }));

    it('should redirect to the referer URL if it contains "search"', () => {
        const refererURL = '/search/query';
        const defaultPath = '/home';
        spyOn(router, 'navigateByUrl').and.stub();

        service.redirectToReferer(refererURL, defaultPath);

        expect(router.navigateByUrl).toHaveBeenCalledWith(refererURL);
    });

    it('should redirect to the default path if the referer URL does not contain "search"', () => {
        const refererURL = '/user/profile';
        const defaultPath = '/home';
        spyOn(router, 'navigate').and.stub();

        service.redirectToReferer(refererURL, defaultPath);

        expect(router.navigate).toHaveBeenCalledWith([defaultPath], {
            relativeTo: mockActivatedRoute,
        });
    });
});
