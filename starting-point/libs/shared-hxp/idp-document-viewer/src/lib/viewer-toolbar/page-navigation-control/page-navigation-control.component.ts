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
import { Observable, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TemplateLetDirective } from '../../utils/template-let.directive';
import { IdpJoinPipe } from '../../utils/join-pipe';

@Component({
    standalone: true,
    imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule, TranslatePipe, TemplateLetDirective, IdpJoinPipe],
    selector: 'hyland-idp-viewer-page-navigation',
    templateUrl: './page-navigation-control.component.html',
    styleUrls: ['./page-navigation-control.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageNavigationControlComponent {
    @Input() toolbarItem?: ToolbarItem;

    toolbarPosition = ToolbarPosition;
    currentViewerState?: StateData;
    inputValue = '';

    readonly currentViewerState$: Observable<StateData>;
    private readonly destroyRef: DestroyRef = inject(DestroyRef);
    private readonly viewerService: ViewerService = inject(ViewerService);

    constructor() {
        this.currentViewerState$ = this.viewerService.viewerState$.pipe(
            tap((state) => {
                this.currentViewerState = state;
                this.inputValue = ((state?.pageNavInfo?.currentPageIndex || 0) + ((state?.pageNavInfo?.totalPages || 0) > 0 ? 1 : 0)).toString();
            }),
            takeUntilDestroyed(this.destroyRef)
        );
    }

    onToolbarAction(item?: ToolbarItem, subitem?: ToolbarSubItem): void {
        if (item?.type === ToolbarItemTypes.PageNavigation && subitem) {
            this.onPageNavigation(subitem.id === 'next' ? 'next' : 'prev');
        }
    }

    onPageNavigation(page: 'next' | 'prev' | number | string): void {
        const currentPageNumber = (this.currentViewerState?.pageNavInfo.currentPageIndex || 0) + 1;
        let newPageNumber = currentPageNumber;

        if (typeof page === 'string') {
            if (page === 'next') {
                newPageNumber = currentPageNumber + 1;
            } else if (page === 'prev') {
                newPageNumber = currentPageNumber - 1;
            } else {
                newPageNumber = Number.parseInt(page, 10);
            }
            page = page === 'next' ? currentPageNumber + 1 : currentPageNumber - 1;
        } else {
            newPageNumber = page;
        }

        if (Number.isNaN(newPageNumber) || newPageNumber < 1 || newPageNumber > (this.currentViewerState?.pageNavInfo?.totalPages || 0)) {
            newPageNumber = currentPageNumber;
            this.inputValue = newPageNumber.toString();
        }

        this.viewerService.changePageSelection({ pageIndex: newPageNumber - 1 });
    }

    onBlur(pageNavGoToInput: HTMLInputElement): void {
        pageNavGoToInput.value = this.inputValue;
    }
}
