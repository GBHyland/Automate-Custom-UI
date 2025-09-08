/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IdpViewerComponent } from './idp-viewer.component';
import { DatasourceDefault, ViewerService } from '../services/viewer.service';
import { ImageLayerComponent } from '../viewer-image-layer/image-layer.component';
import { Datasource } from '../models/datasource';
import { of } from 'rxjs';
import { NoopTranslateModule, NotificationService, ToolbarComponent } from '@alfresco/adf-core';
import { ViewerToolbarService } from '../services/viewer-toolbar.service';
import { ConfigOptions, ToolbarPosition } from '../models/config-options';
import { UserLayoutOptions } from '../models/layout';
import { EventTypes } from '../models/events';
import { ViewerTextLayerService } from '../services/viewer-text-layer.service';
import { ViewerTextData } from '../models/text-layer/ocr-candidate';
import { DrawStyles } from '../models/text-layer/drawing-config';

describe('IdpViewerComponent', () => {
    let component: IdpViewerComponent;
    let fixture: ComponentFixture<IdpViewerComponent>;
    let viewerService: ViewerService;
    let viewerTextService: ViewerTextLayerService;

    const mockNotificationService = {
        showInfo: () => {},
    };

    const mockDatasource: Datasource = {
        documents: [
            {
                id: '1',
                name: 'Document 1',
                pages: [
                    {
                        id: 'page0',
                        name: 'page0',
                        isSelected: true,
                        panelClasses: [],
                    },
                ],
            },
        ],
        loadImageFn: () =>
            of({
                blobUrl: 'image-src',
                width: 100,
                height: 100,
                rotation: 0,
                skew: 0,
            }),
        loadThumbnailFn: () => of('image-src'),
    };

    const mockEmptyDatasource: Datasource = {
        documents: [],
        loadImageFn: () =>
            of({
                blobUrl: 'image-src',
                width: 100,
                height: 100,
                rotation: 0,
                skew: 0,
            }),
        loadThumbnailFn: () => of('image-src'),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ImageLayerComponent, NoopTranslateModule, ToolbarComponent],
            providers: [
                ViewerService,
                ViewerTextLayerService,
                ViewerToolbarService,
                {
                    provide: NotificationService,
                    useValue: mockNotificationService,
                },
            ],
        });

        fixture = TestBed.createComponent(IdpViewerComponent);
        component = fixture.componentInstance;
        viewerService = fixture.debugElement.injector.get(ViewerService);
        viewerTextService = fixture.debugElement.injector.get(ViewerTextLayerService);

        fixture.detectChanges();
    });

    it('should call onDataSourceChange with default datasource when datasource input is undefined', () => {
        spyOn(viewerService, 'updateDataSource');
        component.datasource = undefined;
        fixture.detectChanges();
        expect(viewerService.updateDataSource).toHaveBeenCalledWith(DatasourceDefault);
    });

    it('should update datasource in viewerService when onDataSourceChange is called', () => {
        spyOn(viewerService, 'updateDataSource');
        component.datasource = mockDatasource;
        fixture.detectChanges();
        expect(viewerService.updateDataSource).toHaveBeenCalledWith(mockDatasource);
    });

    it('should update configuration in viewerService when updateConfiguration is called', () => {
        const mockConfiguration: Partial<ConfigOptions> = {
            defaultLayoutType: { type: UserLayoutOptions.Single_Vertical },
            toolbarPosition: ToolbarPosition.Top,
        };
        spyOn(viewerService, 'updateConfiguration');
        component.configuration = mockConfiguration;
        fixture.detectChanges();
        expect(viewerService.updateConfiguration).toHaveBeenCalledWith(mockConfiguration);
    });

    it('should update configuration with default value when nothing provided', () => {
        const mockConfiguration: Partial<ConfigOptions> = {
            defaultLayoutType: { type: UserLayoutOptions.Single_Vertical },
            defaultZoomConfig: { min: 25, max: 300, step: 25 },
            defaultZoomLevel: 100,
            toolbarPosition: ToolbarPosition.Right,
        };
        spyOn(viewerService, 'updateConfiguration');
        component.configuration = undefined;
        fixture.detectChanges();
        expect(viewerService.updateConfiguration).toHaveBeenCalledWith(mockConfiguration);
    });

    it('should set default toolbar position correctly', () => {
        const toolbarElement = fixture.nativeElement.querySelector('.idp-viewer');
        expect(toolbarElement).toBeTruthy();
        expect(toolbarElement.classList).toContain('idp-left-right');
    });

    it('should render toolbar component', () => {
        component.datasource = mockDatasource;
        fixture.detectChanges();
        const toolbarElement = fixture.nativeElement.querySelector('.idp-viewer-toolbar');
        expect(toolbarElement).toBeTruthy();
    });

    it('should render default empty view if ng-content is not provided', () => {
        spyOn(viewerService, 'updateDataSource');
        component.datasource = mockEmptyDatasource;
        component.hasContent = false;
        fixture.detectChanges();

        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('.idp-viewer-empty-view__text')).not.toBeNull();
    });

    it('should not render default empty view if datasource has documents', () => {
        spyOn(viewerService, 'updateDataSource');
        component.datasource = mockDatasource;
        component.hasContent = false;
        fixture.detectChanges();

        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('.idp-viewer-empty-view__text')).not.toBeNull();
    });

    it('should not render default empty view if ng-content is provided', () => {
        spyOn(viewerService, 'updateDataSource');
        component.datasource = mockEmptyDatasource;
        component.hasContent = true;
        fixture.detectChanges();

        fixture.nativeElement.innerHTML = `<div class='custom-ng-content'>Test Content</div>`;

        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('.custom-ng-content')).not.toBeNull();
        expect(compiled.querySelector('.idp-viewer-empty-view__text')).toBeNull();
    });

    it('should call changeViewerState with fullscreen false on onExitFullscreen', () => {
        spyOn(viewerService, 'changeViewerState');
        component.onExitFullscreen();
        fixture.detectChanges();

        expect(viewerService.changeViewerState).toHaveBeenCalledWith({ fullscreen: false }, EventTypes.FullScreenExit);
    });

    it('should handle keyboard events correctly', () => {
        const mockKeyboardEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        spyOn(viewerService, 'handleKeyboardEvent');

        component.keyboardEvent = mockKeyboardEvent;
        fixture.detectChanges();

        expect(viewerService.handleKeyboardEvent).toHaveBeenCalledWith(mockKeyboardEvent);
    });

    it('should handle keyboard events correctly ', () => {
        spyOn(viewerService, 'handleKeyboardEvent');

        component.keyboardEvent = undefined;
        fixture.detectChanges();

        expect(viewerService.handleKeyboardEvent).not.toHaveBeenCalled();
    });

    it('should call changePageById on viewerService with the given pageId', () => {
        const pageId = 'page0';
        spyOn(viewerService, 'changePageById');

        component.changePageById(pageId);
        fixture.detectChanges();

        expect(viewerService.changePageById).toHaveBeenCalledWith(pageId);
    });

    it('should call setActivePrimitives with provided highlights', () => {
        spyOn(viewerTextService, 'setActivePrimitives');
        const highlights: ViewerTextData[] = [
            { pageId: 'p1', text: 'text 1', top: 10, left: 20, width: 30, height: 40, highlightState: DrawStyles.DEFAULT },
        ];
        component.activeHighlights = highlights;
        expect(viewerTextService.setActivePrimitives).toHaveBeenCalledWith(highlights);
    });
});
