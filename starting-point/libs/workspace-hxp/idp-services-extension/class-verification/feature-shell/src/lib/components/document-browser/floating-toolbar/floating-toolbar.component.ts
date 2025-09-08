/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ChangeDetectionStrategy, Component, DestroyRef } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IdpDocumentActionToolBarItems, IdpDocumentToolbarService } from '../../../services/document/idp-document-toolbar.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IdpDocumentService } from '../../../services/document/idp-document.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { IdpShortcutService } from '@hxp/workspace-hxp/idp-services-extension/shared';

type IdpDocumentActionToolBarItemsData = IdpDocumentActionToolBarItems & { tooltip: string };

@Component({
    selector: 'hyland-idp-floating-toolbar',
    templateUrl: './floating-toolbar.component.html',
    styleUrls: ['./floating-toolbar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, MatIconModule, MatTooltipModule, TranslatePipe],
})
export class FloatingToolbarComponent {
    readonly toolbarActionItems$: Observable<IdpDocumentActionToolBarItemsData[]>;
    totalSelectedPages = 0;
    isCollapsed = false;

    constructor(
        private readonly documentService: IdpDocumentService,
        private readonly documentToolbarService: IdpDocumentToolbarService,
        private readonly shortcutService: IdpShortcutService,
        private readonly destroyRef: DestroyRef,
        private readonly translateService: TranslateService
    ) {
        this.toolbarActionItems$ = this.documentToolbarService.documentToolBarItems$.pipe(
            takeUntilDestroyed(this.destroyRef),
            map((items) =>
                items
                    .filter((item) => item.displayOn === 'footer' && !item.disabled)
                    .map((item) => ({
                        ...item,
                        tooltip:
                            this.translateService.instant(item.label) +
                            (item.shortcutAction ? ` (${this.shortcutService.getShortcutTooltipForAction(item.shortcutAction)})` : ''),
                    }))
            )
        );

        this.documentService.selectedPages$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((selectedPages) => {
            this.totalSelectedPages = selectedPages.length;
        });
    }

    onCollapse() {
        this.isCollapsed = !this.isCollapsed;
    }
}
