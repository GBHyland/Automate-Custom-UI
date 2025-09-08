/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageLayoutComponent } from './page-layout.component';
import { Subject, of } from 'rxjs';
import { LayoutService, NavBarMode, PROCESS_SERVICES_CLOUD_LAYOUT_PROVIDER } from '../../services/process-services-cloud-extension-layout.provider';
import { NoopTranslateModule } from '@alfresco/adf-core';

describe('PageLayoutComponent', () => {
    let fixture: ComponentFixture<PageLayoutComponent>;
    let component: PageLayoutComponent;

    const layoutServiceMock: LayoutService = {
        toggleAppNavBar$: new Subject(),
        appNavNarMode$: new Subject<NavBarMode>(),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule, PageLayoutComponent],
            providers: [
                {
                    provide: PROCESS_SERVICES_CLOUD_LAYOUT_PROVIDER,
                    useValue: layoutServiceMock,
                },
            ],
        });

        fixture = TestBed.createComponent(PageLayoutComponent);
        component = fixture.componentInstance;
    });

    it('should toggle the appService toggleAppNavBar$ Subject', () => {
        spyOn(layoutServiceMock.toggleAppNavBar$, 'next');
        fixture.detectChanges();

        component.toggleNavBar();
        expect(layoutServiceMock.toggleAppNavBar$.next).toHaveBeenCalled();
    });

    it('should display toggle button only if nav bar is collapsed', () => {
        component.appNavBarMode$ = of('collapsed');
        fixture.detectChanges();

        const toggleButton: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('[data-automation-id="app-start-process-button"]');
        expect(toggleButton).toBeTruthy();
        expect(toggleButton.title.trim()).toBe('APP.TOOLTIPS.EXPAND_NAVIGATION');
        expect(toggleButton.textContent.trim()).toBe('keyboard_double_arrow_right');
    });

    it('shout NOT display toggle button if nav bar is expanded', () => {
        component.appNavBarMode$ = of('expanded');
        fixture.detectChanges();

        const toggleButton: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('[data-automation-id="app-start-process-button"]');
        expect(toggleButton).toBeFalsy();
    });
});

describe('PageLayoutComponent without provided service', () => {
    let fixture: ComponentFixture<PageLayoutComponent>;
    let component: PageLayoutComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule, PageLayoutComponent],
            providers: [
                {
                    provide: PROCESS_SERVICES_CLOUD_LAYOUT_PROVIDER,
                    useValue: undefined,
                },
            ],
        });

        fixture = TestBed.createComponent(PageLayoutComponent);
        component = fixture.componentInstance;
    });

    it('should NOT display nav bar toggle button if layout service is NOT provided', () => {
        component.appNavBarMode$ = of('collapsed');
        fixture.detectChanges();

        const toggleButton: HTMLButtonElement = fixture.debugElement.nativeElement.querySelector('[data-automation-id="app-start-process-button"]');
        expect(toggleButton).toBeFalsy();
    });

    it('should display content header if layout service is NOT provided', () => {
        fixture.detectChanges();

        const contentHeader: HTMLElement = fixture.debugElement.nativeElement.querySelector('.app-content-header');
        expect(contentHeader).toBeTruthy();
    });
});
