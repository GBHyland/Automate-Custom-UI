/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { CommonModule, KeyValue } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { ToolbarItem, ToolbarItemTypes, ToolbarSubItem } from '../../models/toolbar';
import { ToolbarPosition } from '../../models/config-options';
import { ViewerService } from '../../services/viewer.service';
import { distinctUntilChanged, Observable, tap } from 'rxjs';
import { StateData } from '../../models/state-data';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { userLayoutOptionsFromString } from '../../models/layout';
import { EventTypes } from '../../models/events';
import { formatDate } from '../../utils/date-utils';
import { TemplateLetDirective } from '../../utils/template-let.directive';
import { IdpJoinPipe } from '../../utils/join-pipe';

@Component({
    standalone: true,
    imports: [CommonModule, MatIconModule, MatButtonModule, MatMenuModule, MatTooltipModule, TranslatePipe, TemplateLetDirective, IdpJoinPipe],
    selector: 'hyland-idp-viewer-generic-control',
    templateUrl: './generic-control.component.html',
    styleUrls: ['./generic-control.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenericControlComponent {
    @Input() toolbarItem?: ToolbarItem;
    toolbarPosition = ToolbarPosition;
    toolbarTypes = ToolbarItemTypes;

    readonly currentViewerState$: Observable<StateData>;
    private readonly destroyRef: DestroyRef = inject(DestroyRef);
    private readonly viewerService: ViewerService = inject(ViewerService);
    currentViewerState?: StateData;

    toolbarSubitemOrderFn = (a: KeyValue<string, ToolbarSubItem>, b: KeyValue<string, ToolbarSubItem>): number => {
        return a.value.order - b.value.order;
    };

    constructor() {
        this.currentViewerState$ = this.viewerService.viewerState$.pipe(
            distinctUntilChanged(),
            tap((state) => {
                this.currentViewerState = state;
            }),
            takeUntilDestroyed(this.destroyRef)
        );
    }

    onMenuItemClick(item?: ToolbarItem, subitem?: ToolbarSubItem) {
        if (item?.subItems) {
            for (const sub of Object.values(item.subItems)) {
                sub.selected = sub.id === subitem?.id;
            }
        }

        if (item?.type === ToolbarItemTypes.LayoutChange) {
            const layoutType = subitem ? userLayoutOptionsFromString(subitem.id) : undefined;
            if (!layoutType) {
                return;
            }
            this.viewerService.changeUserSelectedLayout(layoutType);
        }
    }

    onToolbarAction(item?: ToolbarItem) {
        switch (item?.type) {
            case ToolbarItemTypes.BestFit: {
                this.viewerService.changeViewerState({ bestFit: !this.currentViewerState?.bestFit }, item.eventType);
                break;
            }
            case ToolbarItemTypes.FullScreen: {
                this.onFullScreenChange();
                break;
            }
            case ToolbarItemTypes.Rotate: {
                this.onRotateChange(item);
                break;
            }
            default: {
                if (item?.eventType) {
                    this.viewerService.emitViewerEvent({ type: item?.eventType, timestamp: formatDate(Date.now()) });
                }
            }
        }
        if (item?.canStaySelected) {
            this.viewerService.changeToolbarItemSelectionState(item.type, item.eventType);
        }
    }

    private onFullScreenChange() {
        const newFullScreen = !this.currentViewerState?.fullscreen;
        this.viewerService.changeViewerState({ fullscreen: newFullScreen }, newFullScreen ? EventTypes.FullScreenEnter : EventTypes.FullScreenExit);
    }

    private onRotateChange(item: ToolbarItem) {
        this.viewerService.changeViewerState({ rotationStep: item.config?.step || 90 }, item.eventType);
    }
}
