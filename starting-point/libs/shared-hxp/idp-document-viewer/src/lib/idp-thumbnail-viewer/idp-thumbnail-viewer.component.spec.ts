/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, Subject, BehaviorSubject } from 'rxjs';
import { IdpThumbnailViewerComponent } from './idp-thumbnail-viewer.component';
import { ViewerService } from '../services/viewer.service';
import { ToolbarConfig } from '../models/toolbar-config';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { ViewerShortcutAction, ViewerShortcutService } from '../services/viewer-shortcut.service';
import { QueryList } from '@angular/core';
import { IdpThumbnailViewerListItemComponent } from '../idp-thumbnail-viewer-list-item/idp-thumbnail-viewer-list-item.component';

describe('IdpThumbnailViewerComponent', () => {
    let component: IdpThumbnailViewerComponent;
    let fixture: ComponentFixture<IdpThumbnailViewerComponent>;
    let viewerService: ViewerService;
    const mockKeyboard$ = new Subject<KeyboardEvent>();

    const createViewerShortcutServiceMock = (action: ViewerShortcutAction) => ({
        getShortcutForEvent: jasmine.createSpy('getShortcutForEvent').and.returnValue({
            action,
            key: '',
            modifierKeys: [],
            category: 'viewer_navigation',
            description: '',
        }),
    });

    const generatePageItems = (selectedPageIndex: number) => [
        {
            pageId: 'page1',
            documentId: 'doc1',
            pageNumber: 1,
            documentName: 'Document 1',
            selected: selectedPageIndex === 0,
            image$: of(''),
        },
        {
            pageId: 'page2',
            documentId: 'doc1',
            pageNumber: 2,
            documentName: 'Document 1',
            selected: selectedPageIndex === 1,
            image$: of(''),
        },
        {
            pageId: 'page3',
            documentId: 'doc1',
            pageNumber: 3,
            documentName: 'Document 1',
            selected: selectedPageIndex === 2,
            image$: of(''),
        },
    ];

    const setupTestModule = (action: ViewerShortcutAction, currentPageIndex = 0) => {
        const viewerServiceMock = {
            viewerState$: new BehaviorSubject({
                pageNavInfo: { currentPageIndex },
                selectedToolbarItems: [ToolbarConfig.ThumbnailViewer.type],
            }),
            datasource$: new BehaviorSubject({
                documents: [
                    {
                        id: 'doc1',
                        name: 'Document 1',
                        pages: [{ id: 'page1' }, { id: 'page2' }, { id: 'page3' }],
                    },
                ],
                loadThumbnailFn: jasmine.createSpy('loadThumbnailFn'),
            }),
            viewerKeyboardEvent$: mockKeyboard$.asObservable(),
            changePageSelection: jasmine.createSpy('changePageSelection'),
            changeToolbarItemSelectionState: jasmine.createSpy('changeToolbarItemSelectionState'),
        };

        TestBed.configureTestingModule({
            imports: [IdpThumbnailViewerComponent, NoopTranslateModule],
            providers: [
                { provide: ViewerService, useValue: viewerServiceMock },
                { provide: ViewerShortcutService, useValue: createViewerShortcutServiceMock(action) },
            ],
        });

        fixture = TestBed.createComponent(IdpThumbnailViewerComponent);
        component = fixture.componentInstance;
        viewerService = TestBed.inject(ViewerService);

        // Mock QueryList for items
        const mockItems = new QueryList<IdpThumbnailViewerListItemComponent>();
        mockItems.reset([{ focus: () => {} } as any]);
        component.items = mockItems;

        fixture.detectChanges();
        component.ngAfterViewInit();
    };

    afterEach(() => {
        fixture.destroy();
    });
    it('should call changePageSelection on onClick', () => {
        setupTestModule(ViewerShortcutAction.NavigateDown);

        component.onClick({
            pageId: 'testPage',
            documentId: 'testDoc',
            pageNumber: 1,
            documentName: 'doc',
            selected: false,
            image$: of(''),
        });
        expect(viewerService.changePageSelection).toHaveBeenCalledWith({ pageIndex: 0 });
    });

    it('should call changeToolbarItemSelectionState on closePanel if selectedToolbarItems includes ThumbnailViewer', () => {
        setupTestModule(ViewerShortcutAction.NavigateDown);

        (viewerService.viewerState$ as any) = of({
            selectedToolbarItems: [ToolbarConfig.ThumbnailViewer.type],
        });
        component.closePanel();
        expect(viewerService.changeToolbarItemSelectionState).toHaveBeenCalledWith(
            ToolbarConfig.ThumbnailViewer.type,
            ToolbarConfig.ThumbnailViewer.eventType
        );
    });

    it('should close panel on Escape key', fakeAsync(() => {
        setupTestModule(ViewerShortcutAction.NavigateDown);

        (viewerService.viewerState$ as any) = of({
            selectedToolbarItems: [ToolbarConfig.ThumbnailViewer.type],
        });
        const escEvent = new KeyboardEvent('keydown', { key: 'Escape' });
        mockKeyboard$.next(escEvent);
        tick(101);
        expect(viewerService.changeToolbarItemSelectionState).toHaveBeenCalled();
        expect(viewerService.changePageSelection).not.toHaveBeenCalled();
    }));

    it('should not change page index when arrow up is pressed on first page', fakeAsync(() => {
        setupTestModule(ViewerShortcutAction.NavigateUp);

        (viewerService.viewerState$ as any) = of({
            pageNavInfo: { currentPageIndex: 0 },
            selectedToolbarItems: [ToolbarConfig.ThumbnailViewer.type],
        });

        (component as any).pageItems$.next(generatePageItems(0));
        fixture.detectChanges();
        const arrowUpEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        mockKeyboard$.next(arrowUpEvent);
        tick(101);
        expect(viewerService.changePageSelection).toHaveBeenCalledWith({ pageIndex: 0 });
    }));

    it('should change page index to 1 when arrow down is pressed on first page', fakeAsync(() => {
        setupTestModule(ViewerShortcutAction.NavigateDown);

        (viewerService.viewerState$ as any) = of({
            pageNavInfo: { currentPageIndex: 0 },
            selectedToolbarItems: [ToolbarConfig.ThumbnailViewer.type],
        });

        (component as any).pageItems$.next(generatePageItems(0));
        fixture.detectChanges();
        const arrowDownEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        mockKeyboard$.next(arrowDownEvent);
        tick(101);
        expect(viewerService.changePageSelection).toHaveBeenCalledWith({ pageIndex: 1 });
    }));

    it('should navigate to last page when NavigateLastPage shortcut is pressed', fakeAsync(() => {
        setupTestModule(ViewerShortcutAction.NavigateLastPage);

        (component as any).pageItems$.next(generatePageItems(0));
        fixture.detectChanges();

        const endEvent = new KeyboardEvent('keydown', { key: 'End' });
        mockKeyboard$.next(endEvent);

        tick(101);
        expect(viewerService.changePageSelection).toHaveBeenCalledWith({ pageIndex: 2 });
    }));

    it('should stay on first page when left arrow is pressed on first page', fakeAsync(() => {
        setupTestModule(ViewerShortcutAction.NavigateLeft, 0);

        (component as any).pageItems$.next(generatePageItems(0));
        fixture.detectChanges();
        const leftArrowEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        mockKeyboard$.next(leftArrowEvent);
        tick(101);
        expect(viewerService.changePageSelection).toHaveBeenCalledWith({ pageIndex: 0 });
    }));

    it('should stay on last page when right arrow is pressed on last page', fakeAsync(() => {
        setupTestModule(ViewerShortcutAction.NavigateRight, 2);

        (component as any).pageItems$.next(generatePageItems(2));
        fixture.detectChanges();
        const rightArrowEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        mockKeyboard$.next(rightArrowEvent);
        tick(101);
        expect(viewerService.changePageSelection).toHaveBeenCalledWith({ pageIndex: 2 });
    }));

    it('should navigate to first page when Home key is pressed from middle page', fakeAsync(() => {
        setupTestModule(ViewerShortcutAction.NavigateFirstPage, 1);

        (component as any).pageItems$.next(generatePageItems(1));
        fixture.detectChanges();
        const homeEvent = new KeyboardEvent('keydown', { key: 'Home' });
        mockKeyboard$.next(homeEvent);
        tick(101);
        expect(viewerService.changePageSelection).toHaveBeenCalledWith({ pageIndex: 0 });
    }));

    it('should navigate to last page when End key is pressed from middle page', fakeAsync(() => {
        setupTestModule(ViewerShortcutAction.NavigateLastPage, 1);

        (component as any).pageItems$.next(generatePageItems(1));
        fixture.detectChanges();
        const endEvent = new KeyboardEvent('keydown', { key: 'End' });
        mockKeyboard$.next(endEvent);
        tick(101);
        expect(viewerService.changePageSelection).toHaveBeenCalledWith({ pageIndex: 2 });
    }));

    it('should navigate to previous page when arrow up is pressed on second page', () => {
        setupTestModule(ViewerShortcutAction.NavigateUp, 1);

        (component as any).pageItems$.next(generatePageItems(1));
        fixture.detectChanges();
        const arrowUpEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        mockKeyboard$.next(arrowUpEvent);
        expect(viewerService.changePageSelection).toHaveBeenCalledWith({ pageIndex: 0 });
    });

    it('should navigate to next page when arrow down is pressed on second page', () => {
        setupTestModule(ViewerShortcutAction.NavigateDown, 1);

        (component as any).pageItems$.next(generatePageItems(1));
        fixture.detectChanges();
        const arrowDownEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        mockKeyboard$.next(arrowDownEvent);
        expect(viewerService.changePageSelection).toHaveBeenCalledWith({ pageIndex: 2 });
    });

    it('should navigate to previous page when arrow left is pressed on second page', () => {
        setupTestModule(ViewerShortcutAction.NavigateLeft, 1);

        (component as any).pageItems$.next(generatePageItems(1));
        fixture.detectChanges();
        const arrowLeftEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        mockKeyboard$.next(arrowLeftEvent);
        expect(viewerService.changePageSelection).toHaveBeenCalledWith({ pageIndex: 0 });
    });

    it('should navigate to next page when arrow right is pressed on second page', () => {
        setupTestModule(ViewerShortcutAction.NavigateRight, 1);

        (component as any).pageItems$.next(generatePageItems(1));
        fixture.detectChanges();
        const arrowRightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        mockKeyboard$.next(arrowRightEvent);
        expect(viewerService.changePageSelection).toHaveBeenCalledWith({ pageIndex: 2 });
    });

    it('should stay on last page when arrow down is pressed on last page', () => {
        setupTestModule(ViewerShortcutAction.NavigateDown, 2);

        (component as any).pageItems$.next(generatePageItems(2));
        fixture.detectChanges();
        const arrowDownEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        mockKeyboard$.next(arrowDownEvent);
        expect(viewerService.changePageSelection).toHaveBeenCalledWith({ pageIndex: 2 });
    });

    it('should stay on first page when arrow up is pressed on first page', () => {
        setupTestModule(ViewerShortcutAction.NavigateUp, 0);

        (component as any).pageItems$.next(generatePageItems(0));
        fixture.detectChanges();
        const arrowUpEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        mockKeyboard$.next(arrowUpEvent);
        expect(viewerService.changePageSelection).toHaveBeenCalledWith({ pageIndex: 0 });
    });
});
