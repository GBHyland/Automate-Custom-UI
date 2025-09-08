/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AfterContentInit, ChangeDetectionStrategy, Component, ContentChild, DestroyRef, ElementRef, inject, Input, Output } from '@angular/core';
import { Datasource } from '../models/datasource';
import { DatasourceDefault, ViewerService } from '../services/viewer.service';
import { ImageLayerComponent } from '../viewer-image-layer/image-layer.component';
import { CommonModule, NgIf } from '@angular/common';
import { ToolbarComponent } from '../viewer-toolbar/toolbar.component';
import { ConfigOptions, ToolbarPosition } from '../models/config-options';
import { ViewerToolbarService } from '../services/viewer-toolbar.service';
import { EmptyComponent } from '../viewer-empty/viewer-empty.component';
import { ConfigDefault } from '../models/config-default';
import { distinctUntilChanged, map, Observable, Subject } from 'rxjs';
import { EventTypes, ViewerEvent } from '../models/events';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TemplateLetDirective } from '../utils/template-let.directive';
import { ResizeObserverService } from '../services/resize-observer.service';
import { ViewerLayerService } from '../services/viewer-layer.service';
import { ViewerLayerType } from '../models/viewer-layer';
import { IdpThumbnailViewerComponent } from '../idp-thumbnail-viewer/idp-thumbnail-viewer.component';
import { UserLayoutOptions } from '../models/layout';
import { ViewerTextLayerService } from '../services/viewer-text-layer.service';
import { ViewerTextData } from '../models/text-layer/ocr-candidate';

@Component({
    selector: 'hyland-idp-viewer',
    standalone: true,
    imports: [CommonModule, NgIf, ImageLayerComponent, ToolbarComponent, TemplateLetDirective, IdpThumbnailViewerComponent],
    templateUrl: './idp-viewer.component.html',
    styleUrls: ['./idp-viewer.component.scss'],
    providers: [ViewerService, ViewerToolbarService, ResizeObserverService, ViewerLayerService, ViewerTextLayerService],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IdpViewerComponent implements AfterContentInit {
    toolbarPosition = ToolbarPosition;
    layoutType = UserLayoutOptions;
    hasContent = false;
    viewerLayerTypes = ViewerLayerType;

    @ContentChild(EmptyComponent, { static: false }) content: ElementRef | undefined;

    @Input() set activeHighlights(value: ViewerTextData[] | undefined) {
        this.viewerTextService.setActivePrimitives(value || []);
    }

    @Input() set keyboardEvent(value: KeyboardEvent | undefined) {
        if (!value) {
            return;
        }

        this.viewerService.handleKeyboardEvent(value);
    }

    @Input() set datasource(datasource: Datasource | undefined) {
        this.onDataSourceChange(datasource || DatasourceDefault);
    }

    @Input() set configuration(value: Partial<ConfigOptions> | undefined) {
        this.viewerService.updateConfiguration(value || ConfigDefault);
    }

    get configuration() {
        return this.viewerService.viewerConfig;
    }

    @Output() viewerEvent = new Subject<ViewerEvent<object>>();

    readonly fullscreenMode$: Observable<boolean>;
    private readonly destroyRef: DestroyRef = inject(DestroyRef);
    private readonly viewerService: ViewerService = inject(ViewerService);
    private readonly viewerTextService: ViewerTextLayerService = inject(ViewerTextLayerService);

    constructor() {
        this.fullscreenMode$ = this.viewerService.viewerState$.pipe(
            map((config) => config.fullscreen),
            distinctUntilChanged(),
            takeUntilDestroyed(this.destroyRef)
        );

        this.viewerService.viewerEvent$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event: ViewerEvent<object>) => {
            this.viewerEvent.next(event);
        });
    }

    ngAfterContentInit(): void {
        this.hasContent = !!this.content;
    }

    onExitFullscreen() {
        this.viewerService.changeViewerState({ fullscreen: false }, EventTypes.FullScreenExit);
    }

    changePageById(pageId: string) {
        this.viewerService.changePageById(pageId);
    }

    private onDataSourceChange(datasource: Datasource) {
        this.viewerService.updateDataSource(datasource);
    }
}
