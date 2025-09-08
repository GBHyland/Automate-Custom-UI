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
import { ToolbarItem, ToolbarItemTypes, ToolbarSubItem, ZoomConfig } from '../../models/toolbar';
import { map, Observable, tap } from 'rxjs';
import { StateData } from '../../models/state-data';
import { ViewerService } from '../../services/viewer.service';
import { ToolbarPosition } from '../../models/config-options';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EventTypes } from '../../models/events';
import { TemplateLetDirective } from '../../utils/template-let.directive';
import { IdpJoinPipe } from '../../utils/join-pipe';

@Component({
    standalone: true,
    imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule, TranslatePipe, TemplateLetDirective, IdpJoinPipe],
    selector: 'hyland-idp-viewer-zoom',
    templateUrl: './zoom-control.component.html',
    styleUrls: ['./zoom-control.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZoomControlComponent {
    @Input() toolbarItem?: ToolbarItem;

    readonly isLeftRightPosition$: Observable<boolean>;
    readonly currentViewerState$: Observable<StateData>;
    private readonly destroyRef: DestroyRef = inject(DestroyRef);
    private readonly viewerService: ViewerService = inject(ViewerService);
    currentViewerState?: StateData;
    zoomConfig?: ZoomConfig;
    inputValue = '';

    constructor() {
        this.currentViewerState$ = this.viewerService.viewerState$.pipe(
            tap((state) => {
                this.currentViewerState = state;
                this.zoomConfig = state.defaultZoomConfig ?? (this.toolbarItem?.config as ZoomConfig);
                this.inputValue = (state?.currentZoomLevel ?? this.viewerService.viewerConfig.defaultZoomLevel).toString();
            }),
            takeUntilDestroyed(this.destroyRef)
        );

        this.isLeftRightPosition$ = this.currentViewerState$.pipe(
            map((state) => state.currentToolbarPosition),
            map((position) => [ToolbarPosition.Right, ToolbarPosition.Left].includes(position))
        );
    }

    onToolbarAction(item?: ToolbarItem, subitem?: ToolbarSubItem): void {
        if (item?.type === ToolbarItemTypes.Zoom) {
            const zoomConfig = this.viewerService.viewerConfig.defaultZoomConfig ?? (item.config as ZoomConfig);
            const scaleChange = !subitem || !zoomConfig ? 0 : subitem.id === 'zoom_in' ? zoomConfig.step : -zoomConfig.step;
            const newZoomValue = this.currentViewerState?.currentZoomLevel ?? this.viewerService.viewerConfig.defaultZoomLevel;

            const divisionResult = Math.floor(newZoomValue / zoomConfig.step);
            const newScale =
                newZoomValue % zoomConfig.step > 0 && zoomConfig.step
                    ? scaleChange < 0
                        ? divisionResult * zoomConfig.step
                        : (divisionResult + 1) * zoomConfig.step
                    : newZoomValue + scaleChange;
            this.onZoomChange(newScale, item);
        }
    }

    onZoomChange(zoomPercent: string | number, item?: ToolbarItem) {
        const zoomConfig = this.viewerService.viewerConfig.defaultZoomConfig ?? (item?.config as ZoomConfig);
        let zoom = typeof zoomPercent === 'string' ? Number.parseInt(zoomPercent, 10) : zoomPercent;
        if (!zoomConfig || Number.isNaN(zoom) || zoom < zoomConfig.min || zoom > zoomConfig.max) {
            zoom = this.currentViewerState?.currentZoomLevel ?? this.viewerService.viewerConfig.defaultZoomLevel;
            this.inputValue = zoom.toString();
        }

        this.viewerService.changeViewerState({ currentZoomLevel: zoom }, EventTypes.ZoomChanged);
    }

    onBlur(zoomInput: HTMLInputElement): void {
        zoomInput.value = this.inputValue;
    }
}
