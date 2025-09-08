/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ToolbarControlPosition, ToolbarItem, ToolbarItemTypes } from '../models/toolbar';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { ViewerService } from '../services/viewer.service';
import { StateData } from '../models/state-data';
import { ToolbarPosition } from '../models/config-options';
import { GenericControlComponent } from './generic-control/generic-control.component';
import { PageNavigationControlComponent } from './page-navigation-control/page-navigation-control.component';
import { ZoomControlComponent } from './zoom-control/zoom-control.component';
import { CommonModule } from '@angular/common';
import { ViewerToolbarService } from '../services/viewer-toolbar.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LayerSelectionControlComponent } from './layer-selection-control/layer-selection-control.component';
import { TemplateLetDirective } from '../utils/template-let.directive';

type ToolbarData = Record<ToolbarControlPosition.Start | ToolbarControlPosition.Middle | ToolbarControlPosition.End, ToolbarItem[]>;

@Component({
    standalone: true,
    imports: [
        CommonModule,
        GenericControlComponent,
        PageNavigationControlComponent,
        LayerSelectionControlComponent,
        ZoomControlComponent,
        TemplateLetDirective,
    ],
    selector: 'hyland-idp-viewer-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarComponent {
    readonly orderedToolbarItems$: Observable<ToolbarData>;
    readonly currentViewerState$: Observable<StateData>;

    toolbarPosition = ToolbarPosition;
    toolbarControlPosition = ToolbarControlPosition;
    toolbarItemType = ToolbarItemTypes;
    noDocumentSelected$ = of(false);
    toolbarItemUniqueFn = (_: number, item: ToolbarItem) => item.type;
    private readonly destroyRef: DestroyRef = inject(DestroyRef);
    private readonly viewerService: ViewerService = inject(ViewerService);
    private readonly viewerToolbarService: ViewerToolbarService = inject(ViewerToolbarService);

    constructor() {
        this.orderedToolbarItems$ = this.viewerToolbarService.viewerToolbarItems$.pipe(
            map((items: ToolbarItem[]) => {
                items = items.sort((a, b) => a.order - b.order);
                // eslint-disable-next-line unicorn/no-array-reduce
                return items.reduce((acc, item) => {
                    if (!acc[item.position]) {
                        acc[item.position] = [];
                    }
                    acc[item.position].push(item);
                    return acc;
                }, {} as ToolbarData);
            }),
            takeUntilDestroyed(this.destroyRef)
        );

        this.currentViewerState$ = this.viewerService.viewerState$.pipe(takeUntilDestroyed(this.destroyRef));
        this.noDocumentSelected$ = this.viewerService.datasource$.pipe(
            distinctUntilChanged(),
            takeUntilDestroyed(this.destroyRef),
            map((datasource) => datasource.documents.length <= 0)
        );
    }
}
