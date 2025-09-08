/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ChangeDetectionStrategy, Component, DestroyRef, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatSlideToggle, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { IdpDocumentActionToolBarItems, IdpDocumentToolbarService } from '../../../services/document/idp-document-toolbar.service';
import { IdpDocumentService } from '../../../services/document/idp-document.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { IdpScreenViewFilter, IdpScreenViewSortOption } from '../../../models/common-models';
import { IdpShortcutService, IdpShortcutAction } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';

type IdpDocumentActionToolBarItemsData = IdpDocumentActionToolBarItems & { tooltip: string };

@Component({
    selector: 'hyland-idp-class-list-header-toolbar',
    templateUrl: './class-list-header-toolbar.component.html',
    styleUrls: ['./class-list-header-toolbar.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatRippleModule,
        MatSlideToggleModule,
        MatTooltipModule,
        TranslatePipe,
    ],
})
export class ClassListHeaderToolbarComponent {
    @ViewChild('issueFilter') issueFilter?: MatSlideToggle;

    readonly toolbarActionItems$: Observable<IdpDocumentActionToolBarItemsData[]>;
    readonly sortOptions = [
        {
            value: IdpScreenViewSortOption.Original,
            label: 'IDP_CLASS_VERIFICATION.CLASS_LIST_HEADER.SORT_SELECTOR.ORIGINAL_ORDER_LABEL',
        },
        {
            value: IdpScreenViewSortOption.Classes,
            label: 'IDP_CLASS_VERIFICATION.CLASS_LIST_HEADER.SORT_SELECTOR.CLASSES_ORDER_LABEL',
        },
    ];

    isIssuesOnlyView = false;
    issuesOnlyFilterTooltip: string;
    selectedSortOption: IdpScreenViewSortOption = IdpScreenViewSortOption.Original;

    constructor(
        private readonly documentToolbarService: IdpDocumentToolbarService,
        private readonly documentService: IdpDocumentService,
        private readonly shortcutService: IdpShortcutService,
        private readonly destroyRef: DestroyRef,
        translateService: TranslateService
    ) {
        this.toolbarActionItems$ = this.documentToolbarService.documentToolBarItems$.pipe(
            takeUntilDestroyed(this.destroyRef),
            map((items) =>
                items.map((item) => ({
                    ...item,
                    tooltip:
                        translateService.instant(item.label) +
                        (item.shortcutAction ? ` (${this.shortcutService.getShortcutTooltipForAction(item.shortcutAction)})` : ''),
                }))
            )
        );

        this.documentService.documentViewFilter$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((filter) => {
            this.isIssuesOnlyView = filter === IdpScreenViewFilter.OnlyIssues;
            this.issueFilter?.focus();
        });

        const issuesOnlyShortcut = shortcutService.getShortcutTooltipForAction(IdpShortcutAction.IssueOnlyFilter);
        this.issuesOnlyFilterTooltip =
            translateService.instant('IDP_CLASS_VERIFICATION.CLASS_LIST_HEADER.SHOW_ISSUES_TOOLTIP') +
            ' ' +
            (issuesOnlyShortcut ? `(${issuesOnlyShortcut})` : '');
    }

    onIssuesFilterChange(issueOnly: boolean) {
        this.documentService.setDocumentViewFilter(issueOnly ? IdpScreenViewFilter.OnlyIssues : IdpScreenViewFilter.All);
    }

    onSortChanged(event: MatSelectChange) {
        this.selectedSortOption = event.value as IdpScreenViewSortOption;
        this.documentService.setDocumentSortOption(this.selectedSortOption);
    }
}
