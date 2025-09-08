/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageNavigationControlComponent } from './page-navigation-control.component';
import { ViewerService } from '../../services/viewer.service';
import { BehaviorSubject } from 'rxjs';
import { getDefaultStateData, StateData } from '../../models/state-data';
import { ConfigDefault } from '../../models/config-default';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { ToolbarConfig } from '../../models/toolbar-config';
import { ToolbarItem, ToolbarItemTypes, ToolbarSubItem } from '../../models/toolbar';
import { By } from '@angular/platform-browser';

describe('PageNavigationControlComponent', () => {
    let component: PageNavigationControlComponent;
    let fixture: ComponentFixture<PageNavigationControlComponent>;
    let mockViewerState$: BehaviorSubject<StateData>;

    beforeEach(async () => {
        mockViewerState$ = new BehaviorSubject<StateData>(getDefaultStateData(ConfigDefault));

        const mockViewerService = {
            viewerState$: mockViewerState$.asObservable(),
            changePageSelection: jasmine.createSpy(),
        };

        await TestBed.configureTestingModule({
            imports: [NoopTranslateModule],
            providers: [{ provide: ViewerService, useValue: mockViewerService }],
        }).compileComponents();

        fixture = TestBed.createComponent(PageNavigationControlComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        mockViewerState$.complete();
        fixture.destroy();
    });

    it('should have nativeElement', async () => {
        await fixture.whenStable();
        const compiled = fixture.nativeElement;
        const pageNavigationToolbarElement = compiled.querySelector('.idp-page-nav-container');
        expect(pageNavigationToolbarElement).not.toBeNull();
        expect(pageNavigationToolbarElement.classList).toContain('idp-left-right');

        expect(compiled.querySelector('.idp-page-nav-input input')).not.toBeNull();
    });

    it('should have previous and next button exist and disabled', async () => {
        const item = Object.values(ToolbarConfig).find((tbItem) => tbItem.type === ToolbarItemTypes.PageNavigation);
        fixture = TestBed.createComponent(PageNavigationControlComponent);
        component = fixture.componentInstance;
        if (item) {
            component.toolbarItem = { ...item, enabled: true };
        }
        fixture.detectChanges();
        await fixture.whenStable();
        const compiled = fixture.nativeElement;
        const previousButton = compiled.querySelector('#previous');
        expect(previousButton).not.toBeNull();

        const nextButton = compiled.querySelector('#next');
        expect(nextButton).not.toBeNull();
        const toolbarItem = component.toolbarItem as ToolbarItem;
        expect(toolbarItem).not.toBeNull();
        expect(toolbarItem.type).toEqual(ToolbarItemTypes.PageNavigation);
        expect(toolbarItem.subItems).not.toBeNull();
        const subItems = toolbarItem.subItems as { [key: string]: { enabled: boolean } };
        const previousSubItem = subItems['previous'];
        const nextSubItem = subItems['next'];
        expect(previousSubItem.enabled).toBeFalse();
        expect(nextSubItem.enabled).toBeFalse();
    });

    it('should previous and next button have proper oder', async () => {
        const item = Object.values(ToolbarConfig).find((tbItem) => tbItem.type === ToolbarItemTypes.PageNavigation);
        fixture = TestBed.createComponent(PageNavigationControlComponent);
        component = fixture.componentInstance;
        if (item) {
            component.toolbarItem = {
                ...item,
                subItems: {
                    previous: {
                        id: 'previous',
                        icon: '',
                        label: '',
                        enabled: false,
                        order: 1,
                    },
                    next: {
                        id: 'next',
                        icon: '',
                        label: '',
                        enabled: false,
                        order: 2,
                    },
                },
            };
        }
        fixture.detectChanges();
        await fixture.whenStable();
        const previousButton = fixture.debugElement.query(By.css('#previous'));
        expect(previousButton).not.toBeNull();
        expect(previousButton.attributes['order']).toEqual('1');

        const nextButton = fixture.debugElement.query(By.css('#next'));
        expect(nextButton).not.toBeNull();
        expect(nextButton.attributes['order']).toEqual('2');
    });

    it('should call onPageNavigation with "next" when next subitem is clicked', () => {
        spyOn(component, 'onPageNavigation');
        const item = { type: ToolbarItemTypes.PageNavigation } as ToolbarItem;
        const subitem = { id: 'next' } as ToolbarSubItem;

        component.onToolbarAction(item, subitem);
        expect(component.onPageNavigation).toHaveBeenCalledWith('next');
    });

    it('should call onPageNavigation with "prev" when previous subitem is clicked', () => {
        spyOn(component, 'onPageNavigation');
        const item = { type: ToolbarItemTypes.PageNavigation } as ToolbarItem;
        const subitem = { id: 'prev' } as ToolbarSubItem;

        component.onToolbarAction(item, subitem);
        expect(component.onPageNavigation).toHaveBeenCalledWith('prev');
    });

    it('should navigate to the next page when onPageNavigation is called with "next"', () => {
        component.currentViewerState = { pageNavInfo: { currentPageIndex: 0, totalPages: 10 } } as StateData;
        const mockViewerService = TestBed.inject(ViewerService);

        component.onPageNavigation('next');

        expect(mockViewerService.changePageSelection).toHaveBeenCalledWith({ pageIndex: 1 });
    });

    it('should navigate to the previous page when onPageNavigation is called with "prev"', () => {
        component.currentViewerState = { pageNavInfo: { currentPageIndex: 1, totalPages: 10 } } as StateData;
        const mockViewerService = TestBed.inject(ViewerService);

        component.onPageNavigation('prev');

        expect(mockViewerService.changePageSelection).toHaveBeenCalledWith({ pageIndex: 0 });
    });

    it('should not navigate to a page if the page number is invalid, would not change the value', () => {
        component.currentViewerState = { pageNavInfo: { currentPageIndex: 0, totalPages: 10 } } as StateData;
        const mockViewerService = TestBed.inject(ViewerService);

        component.onPageNavigation('invalid');

        expect(mockViewerService.changePageSelection).toHaveBeenCalledWith({ pageIndex: 0 });
    });

    it('should navigate to a specific page when onPageNavigation is called with a number', () => {
        component.currentViewerState = { pageNavInfo: { currentPageIndex: 0, totalPages: 10 } } as StateData;
        const mockViewerService = TestBed.inject(ViewerService);

        component.onPageNavigation(5);

        expect(mockViewerService.changePageSelection).toHaveBeenCalledWith({ pageIndex: 4 });
    });

    it('should reset input value to current page number on blur', () => {
        component.currentViewerState = { pageNavInfo: { currentPageIndex: 2, totalPages: 10 } } as StateData;
        component.inputValue = '5';
        fixture.detectChanges();

        const inputElement = fixture.debugElement.query(By.css('.idp-page-nav-input input')).nativeElement;
        inputElement.value = 'invalid';
        inputElement.dispatchEvent(new Event('blur'));

        expect(inputElement.value).toBe('5');
    });

    it('should not change input value if it is already correct on blur', () => {
        component.currentViewerState = { pageNavInfo: { currentPageIndex: 2, totalPages: 10 } } as StateData;
        component.inputValue = '3';
        fixture.detectChanges();

        const inputElement = fixture.debugElement.query(By.css('.idp-page-nav-input input')).nativeElement;
        inputElement.value = '3';
        inputElement.dispatchEvent(new Event('blur'));

        expect(inputElement.value).toBe('3');
    });

    it('should handle blur event correctly when input value is empty', () => {
        component.currentViewerState = { pageNavInfo: { currentPageIndex: 2, totalPages: 10 } } as StateData;
        component.inputValue = '3';
        fixture.detectChanges();

        const inputElement = fixture.debugElement.query(By.css('.idp-page-nav-input input')).nativeElement;
        inputElement.value = '';
        inputElement.dispatchEvent(new Event('blur'));

        expect(inputElement.value).toBe('3');
    });
});
