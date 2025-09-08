/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { ToolbarItem, ToolbarItemTypes, ToolbarSubItem } from '../../models/toolbar';
import { ToolbarPosition } from '../../models/config-options';
import { ViewerService } from '../../services/viewer.service';
import { StateData } from '../../models/state-data';
import { map, Observable, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IdpJoinPipe } from '../../utils/join-pipe';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ViewerLayerType } from '../../models/viewer-layer';
import { EventTypes } from '../../models/events';

@Component({
    standalone: true,
    imports: [CommonModule, MatIconModule, MatButtonModule, MatButtonToggleModule, MatTooltipModule, TranslatePipe, IdpJoinPipe],
    selector: 'hyland-idp-layer-selection',
    templateUrl: './layer-selection-control.component.html',
    styleUrls: ['./layer-selection-control.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayerSelectionControlComponent {
    @Input() toolbarItem?: ToolbarItem;

    toolbarPosition = ToolbarPosition;
    currentViewerState?: StateData;

    readonly currentViewerState$: Observable<StateData>;
    readonly isLeftRightPosition$: Observable<boolean>;
    private readonly destroyRef: DestroyRef = inject(DestroyRef);
    private readonly viewerService: ViewerService = inject(ViewerService);

    constructor() {
        this.currentViewerState$ = this.viewerService.viewerState$.pipe(
            tap((state) => {
                this.currentViewerState = state;
            }),
            takeUntilDestroyed(this.destroyRef)
        );

        this.isLeftRightPosition$ = this.currentViewerState$.pipe(
            map((state) => state.currentToolbarPosition),
            map((position) => [ToolbarPosition.Right, ToolbarPosition.Left].includes(position))
        );
    }

    onToolbarAction(item?: ToolbarItem, subitem?: ToolbarSubItem): void {
        if (item?.type === ToolbarItemTypes.LayerSelection && subitem) {
            let currentLayer;
            if (subitem.id === 'text') {
                currentLayer = ViewerLayerType.TextOnly;
            } else if (subitem.id === 'image') {
                currentLayer = ViewerLayerType.Image;
            }

            this.viewerService.changeViewerState({ currentLayer }, EventTypes.ViewChanged);
        }
    }
}
