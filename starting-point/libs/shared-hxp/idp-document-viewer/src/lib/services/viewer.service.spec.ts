/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ViewerService, DatasourceDefault } from './viewer.service';
import { Datasource } from '../models/datasource';
import { debounceTime, filter, firstValueFrom, of, skip, take, withLatestFrom } from 'rxjs';
import { EventTypes } from '../models/events';
import { LayoutType, UserLayoutOptions } from '../models/layout';
import { ToolbarItemTypes } from '../models/toolbar';
import { ConfigOptions, ToolbarPosition } from '../models/config-options';
import { NotificationService } from '@alfresco/adf-core';
import { StateData } from '../models/state-data';

describe('ViewerService', () => {
    let service: ViewerService;
    const datasource: Datasource = {
        documents: [
            {
                id: '1',
                name: 'Document 1',
                pages: [
                    {
                        id: '1',
                        name: '1',
                        viewerRotation: 90,
                        isSelected: false,
                    },
                    {
                        id: '2',
                        name: '2',
                        viewerRotation: 0,
                        isSelected: false,
                    },
                    {
                        id: '3',
                        name: '3',
                        isSelected: false,
                    },
                    {
                        id: '4',
                        name: '4',
                        viewerRotation: 0,
                        isSelected: false,
                    },
                ],
            },
        ],
        loadImageFn: () => of({ blobUrl: '', width: 0, height: 0, viewerRotation: 0, skew: 0 }),
        loadThumbnailFn: () => of(''),
    };

    const mockNotificationService = {
        showInfo: jasmine.createSpy(),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ViewerService,
                {
                    provide: NotificationService,
                    useValue: mockNotificationService,
                },
            ],
        });
        service = TestBed.inject(ViewerService);
    });

    it('should have default datasource', async () => {
        await firstValueFrom(service.datasource$).then((ds) => {
            expect(ds).toEqual(DatasourceDefault);
        });
    });

    it('should update datasource', async () => {
        const newDatasource: Datasource = {
            documents: [
                {
                    id: 'doc_1',
                    name: 'Document 1',
                    pages: [
                        {
                            id: 'page_1',
                            name: 'Page 1',
                            isSelected: false,
                        },
                    ],
                },
            ],
            loadImageFn: () => of({ blobUrl: '', width: 0, height: 0, rotation: 0, skew: 0 }),
            loadThumbnailFn: () => of(''),
        };

        service.updateDataSource(newDatasource);

        await firstValueFrom(service.datasource$).then((ds) => {
            expect(ds).toEqual(newDatasource);
        });

        service.viewerEvent$
            .pipe(
                filter((event) => event.type === EventTypes.DataSourceChanged),
                take(1)
            )
            .subscribe((event) => {
                expect(event.data?.dataSourceRef[0].documentId).toEqual('doc_1');
                expect(event.data?.dataSourceRef[0].pageId).toEqual('page_1');
            });
    });

    it('should update zoom in to viewer state', async () => {
        const newState = { currentZoomLevel: 150 };
        service.changeViewerState(newState, EventTypes.ZoomChanged);

        await firstValueFrom(service.viewerState$).then((state) => {
            expect(state.currentZoomLevel).toBe(150);
        });
    });

    it('should change page selection', async () => {
        service.changePageSelection({ pageIndex: 1, totalPages: 10 });

        await firstValueFrom(service.viewerState$).then((state) => {
            expect(state.pageNavInfo.currentPageIndex).toBe(1);
            expect(state.pageNavInfo.totalPages).toBe(10);
        });
    });

    it('should return correct page count', async () => {
        service.updateDataSource(datasource);
        await firstValueFrom(service.totalPageCount$).then((pageCount) => {
            expect(pageCount).toBe(4);
        });
    });

    it('should change page selection with datasource having 4 pages and layout is grid', async () => {
        service.updateDataSource(datasource);
        service.changeUserSelectedLayout(UserLayoutOptions.Grid);

        await firstValueFrom(service.viewerLayout$).then((state) => {
            expect(state.type).toBe(LayoutType.Grid);
            expect(state.availableActions.length).toBe(4);
            expect(state.availableActions.includes(ToolbarItemTypes.Zoom)).toBeTrue();
            expect(state.availableActions.includes(ToolbarItemTypes.Rotate)).toBeTrue();
            expect(state.availableActions.includes(ToolbarItemTypes.LayoutChange)).toBeTrue();
            expect(state.availableActions.includes(ToolbarItemTypes.FullScreen)).toBeTrue();
            expect(state.rows).toBe(2);
            expect(state.columns).toBe(3);
        });
    });

    it('should update configuration provided with value', async () => {
        const mockConfig: Partial<ConfigOptions> = {
            defaultLayoutType: { type: UserLayoutOptions.Grid },
            toolbarPosition: ToolbarPosition.Top,
        };
        service.updateConfiguration(mockConfig);

        await firstValueFrom(service.viewerState$).then((state) => {
            expect(state.currentLayout.type).toBe(UserLayoutOptions.Grid);
            expect(state.currentToolbarPosition).toBe(ToolbarPosition.Top);
        });
    });

    it('should change page selection with datasource having 4 pages and layout is horizontal', async () => {
        service.updateDataSource(datasource);
        service.changeUserSelectedLayout(UserLayoutOptions.Single_Horizontal);

        await firstValueFrom(service.viewerLayout$).then((state) => {
            expect(state.type).toBe(LayoutType.SingleScrollable);
            expect(state.availableActions.length).toBe(4);
            expect(state.availableActions.includes(ToolbarItemTypes.Zoom)).toBeTrue();
            expect(state.availableActions.includes(ToolbarItemTypes.Rotate)).toBeTrue();
            expect(state.availableActions.includes(ToolbarItemTypes.LayoutChange)).toBeTrue();
            expect(state.availableActions.includes(ToolbarItemTypes.FullScreen)).toBeTrue();
            expect(state.rows).toBe(1);
            expect(state.columns).toBe(1);
        });
    });

    it('should handle zoom in change event and update layout accordingly', fakeAsync(() => {
        service.changeUserSelectedLayout(UserLayoutOptions.Grid);
        service.updateDataSource(datasource);

        service.viewerEvent$
            .pipe(
                debounceTime(100),
                filter((event) => event.type === EventTypes.ZoomChanged),
                take(1),
                withLatestFrom(service.viewerLayout$)
            )
            .subscribe(([event, layout]) => {
                expect(layout.type).toBe(LayoutType.SingleScrollable);
                expect(event.data?.oldValue).toEqual({ currentZoomLevel: 150 });
                expect(event.data?.newValue).toEqual({ currentZoomLevel: 100 });
                expect(mockNotificationService.showInfo).toHaveBeenCalled();
            });

        tick(100);
        service.changeViewerState({ currentZoomLevel: 150 }, EventTypes.ZoomChanged);
        tick(100);
    }));

    it('should handle zoom out change event and update layout accordingly', fakeAsync(() => {
        service.changeUserSelectedLayout(UserLayoutOptions.Single_Vertical);
        service.updateDataSource(datasource);

        service.viewerEvent$
            .pipe(
                debounceTime(100),
                filter((event) => event.type === EventTypes.ZoomChanged),
                take(1),
                withLatestFrom(service.viewerLayout$)
            )
            .subscribe(([event, layout]) => {
                expect(layout.type).toBe(LayoutType.Grid);
                expect(event.data?.oldValue).toEqual({ currentZoomLevel: 50 });
                expect(event.data?.newValue).toEqual({ currentZoomLevel: 100 });
                expect(mockNotificationService.showInfo).toHaveBeenCalled();
            });

        tick(100);
        service.changeViewerState({ currentZoomLevel: 50 }, EventTypes.ZoomChanged);
        tick(100);
    }));

    it('should fire PageSelected change event when SinglePage is selected', async () => {
        service.changeUserSelectedLayout(UserLayoutOptions.SinglePage);
        service.updateDataSource(datasource);

        service.changeViewerState({ pageNavInfo: { currentPageIndex: 1, totalPages: 4 } }, EventTypes.PageSelected);

        const [event, layout] = await firstValueFrom(
            service.viewerEvent$.pipe(
                filter((ev) => ev.type === EventTypes.PageSelected),
                withLatestFrom(service.viewerLayout$),
                skip(1)
            )
        );
        expect((event.data?.newValue as StateData)?.pageNavInfo.currentPageIndex).toBe(1);
        expect((event.data?.newValue as StateData)?.pageNavInfo.totalPages).toBe(4);
        expect(layout.type).toBe(LayoutType.SinglePage);
    });

    it('should not reset rotation when changeViewerState is called with EventTypes.PageSelected', async () => {
        service.changeUserSelectedLayout(UserLayoutOptions.SinglePage);
        const initialState = {
            rotationStep: 90,
            pageNavInfo: {
                currentPageIndex: 1,
                totalPages: 10,
            },
        };

        service.changeViewerState(initialState, EventTypes.ZoomChanged);
        await firstValueFrom(service.viewerState$).then((state) => {
            expect(state.rotationStep).toBe(90);
        });

        const newState = {
            pageNavInfo: {
                currentPageIndex: 2,
                totalPages: 10,
            },
        };

        service.changeViewerState(newState, EventTypes.PageSelected);
        await firstValueFrom(service.viewerState$).then((state) => {
            expect(state.rotationStep).toBe(90);
            expect(state.pageNavInfo.currentPageIndex).toBe(2);
            expect(state.pageNavInfo.totalPages).toBe(10);
        });
    });

    it('should update rotation for the selected page in data source page', async () => {
        service.changeUserSelectedLayout(UserLayoutOptions.SinglePage);
        service.updateDataSource(datasource);

        const newState = { rotationStep: 90, currentPageId: '1' };
        service.changeViewerState(newState, EventTypes.RotationChanged);

        await firstValueFrom(service.datasource$).then((ds) => {
            expect(ds.documents[0].pages[0].viewerRotation).toBe(180);
        });
    });

    it('should update rotation for all the pages for the selected document', async () => {
        service.changeUserSelectedLayout(UserLayoutOptions.Single_Vertical);
        service.updateDataSource(datasource);

        const newState = { rotationStep: 90, currentPageId: '1' };
        service.changeViewerState(newState, EventTypes.RotationChanged);

        await firstValueFrom(service.datasource$).then((ds) => {
            expect(ds.documents[0].pages[0].viewerRotation).toBe(180);
            expect(ds.documents[0].pages[1].viewerRotation).toBe(90);
            expect(ds.documents[0].pages[2].viewerRotation).toBe(90);
            expect(ds.documents[0].pages[3].viewerRotation).toBe(90);
        });
    });

    it('should change toolbar item selection state', async () => {
        service.changeToolbarItemSelectionState(ToolbarItemTypes.BestFit, EventTypes.Resize);

        await firstValueFrom(service.viewerState$).then((state) => {
            expect(state.selectedToolbarItems).toContain(ToolbarItemTypes.BestFit);
        });
    });

    it('should emit event when toolbar item selection state changes', async () => {
        service.changeToolbarItemSelectionState(ToolbarItemTypes.BestFit, EventTypes.Resize);

        await firstValueFrom(service.viewerEvent$).then((event) => {
            expect(event.type).toBe(EventTypes.Resize);
        });
    });

    it('should change page by id', async () => {
        service.updateDataSource(datasource);
        service.changePageById('2');

        await firstValueFrom(service.viewerState$).then((state) => {
            expect(state.pageNavInfo.currentPageIndex).toEqual(1);
        });
    });

    it('should ignore change page by invalid id', async () => {
        service.updateDataSource(datasource);
        service.changePageById('10');

        await firstValueFrom(service.viewerState$).then((state) => {
            expect(state.pageNavInfo.currentPageIndex).toBeUndefined();
        });
    });

    it('should emit LayoutChanged event when layout changes', async () => {
        service.updateDataSource(datasource);
        service.changeUserSelectedLayout(UserLayoutOptions.Grid);

        await firstValueFrom(service.viewerEvent$).then((event) => {
            if (event.type === EventTypes.LayoutChanged) {
                expect(event.type).toBe(EventTypes.LayoutChanged);
            }
        });
    });

    it('should change layout to Grid if multiple documents selected', async () => {
        const newDatasource: Datasource = {
            documents: [
                {
                    id: 'doc_1',
                    name: 'Document 1',
                    pages: [
                        {
                            id: 'page_1',
                            name: 'Page 1',
                            isSelected: false,
                        },
                    ],
                },
                {
                    id: 'doc_2',
                    name: 'Document 2',
                    pages: [
                        {
                            id: 'page_1',
                            name: 'Page 1',
                            isSelected: false,
                        },
                    ],
                },
            ],
            loadImageFn: () => of({ blobUrl: '', width: 0, height: 0, viewerRotation: 0, skew: 0 }),
            loadThumbnailFn: () => of(''),
        };

        service.updateDataSource(newDatasource);

        await firstValueFrom(service.viewerEvent$.pipe(filter((event) => event.type === EventTypes.LayoutChanged))).then((event) => {
            expect((event.data?.newValue as StateData).currentLayout.type).toBe(UserLayoutOptions.Grid);
        });
    });

    it('should change layout to None if no documents selected', () => {
        const newDatasource: Datasource = {
            documents: [],
            loadImageFn: () => of({ blobUrl: '', width: 0, height: 0, viewerRotation: 0, skew: 0 }),
            loadThumbnailFn: () => of(''),
        };

        service.updateDataSource(newDatasource);

        service.viewerEvent$.pipe(filter((event) => event.type === EventTypes.LayoutChanged)).subscribe((event) => {
            expect(event.type).toBe(EventTypes.LayoutChanged);
            expect((event.data?.newValue as StateData).currentLayout.type).toBe(UserLayoutOptions.None);
        });
    });

    it('should respect user selection if single document is selected', async () => {
        service.updateDataSource(datasource);
        service.changeUserSelectedLayout(UserLayoutOptions.Grid);

        const newDatasource: Datasource = {
            documents: [
                {
                    id: 'doc_1',
                    name: 'Document 1',
                    pages: [
                        {
                            id: 'page_1',
                            name: 'Page 1',
                            isSelected: false,
                        },
                    ],
                },
            ],
            loadImageFn: () => of({ blobUrl: '', width: 0, height: 0, viewerRotation: 0, skew: 0 }),
            loadThumbnailFn: () => of(''),
        };
        await firstValueFrom(service.viewerState$).then((state) => {
            expect(state.currentLayout.type).toBe(UserLayoutOptions.Grid);
        });
        service.updateDataSource(newDatasource);
    });

    it('should zoom and current page index on datasource change', async () => {
        const newState = {
            currentZoomLevel: 150,
            pageNavInfo: {
                currentPageIndex: 1,
                totalPages: 10,
            },
        };
        service.changeViewerState(newState, EventTypes.ZoomChanged);

        await firstValueFrom(service.viewerState$).then((state) => {
            expect(state.currentZoomLevel).toBe(150);
            expect(state.pageNavInfo.currentPageIndex).toBe(1);
            expect(state.pageNavInfo.totalPages).toBe(10);
        });

        service.viewerEvent$
            .pipe(
                filter((event) => event.type === EventTypes.DataSourceChanged),
                withLatestFrom(service.viewerState$)
            )
            .subscribe(([, state]) => {
                expect(state.currentZoomLevel).toBe(100);
                expect(state.pageNavInfo.currentPageIndex).toBe(undefined);
                expect(state.pageNavInfo.totalPages).toBe(4);
            });

        service.updateDataSource(datasource);
    });

    it('should emit the provided keyboard event through viewerKeyboardEvent$', () => {
        const testEvent = new KeyboardEvent('keydown', { key: 'Enter' });

        service.viewerKeyboardEvent$.subscribe((receivedEvent) => {
            expect(receivedEvent).toBe(testEvent);
        });
        service.handleKeyboardEvent(testEvent);
    });

    it('should return correct availableActions based on layout', async () => {
        const initialState: Partial<StateData> = {
            currentZoomLevel: 100,
            currentLayout: {
                type: UserLayoutOptions.Single_Vertical,
                availableActions: [ToolbarItemTypes.Zoom, ToolbarItemTypes.Rotate, ToolbarItemTypes.LayoutChange, ToolbarItemTypes.FullScreen],
            },
        };

        service.changeViewerState(initialState, EventTypes.ZoomChanged);
        await firstValueFrom(service.viewerState$).then((state) => {
            expect(state.currentLayout.type).toBe(UserLayoutOptions.Single_Vertical);
            expect(state.currentLayout.availableActions?.length).toBe(4);
            expect(state.currentLayout.availableActions?.includes(ToolbarItemTypes.LayoutChange)).toBeTrue();
        });

        service.changeUserSelectedLayout(UserLayoutOptions.SinglePage);
        await firstValueFrom(service.viewerState$).then((state) => {
            expect(state.currentLayout.type).toBe(UserLayoutOptions.SinglePage);
            expect(state.currentLayout.availableActions?.length).toBe(6);
            expect(state.currentLayout.availableActions?.includes(ToolbarItemTypes.LayoutChange)).toBeFalse();
        });

        service.changeUserSelectedLayout(UserLayoutOptions.Single_Vertical);
        await firstValueFrom(service.viewerState$).then((state) => {
            expect(state.currentLayout.type).toBe(UserLayoutOptions.Single_Vertical);
            expect(state.currentLayout.availableActions?.length).toBe(4);
            expect(state.currentLayout.availableActions?.includes(ToolbarItemTypes.LayoutChange)).toBeTrue();
        });
    });
});
