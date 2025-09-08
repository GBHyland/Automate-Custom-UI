/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { map, take, withLatestFrom } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { IdpKeyboardNavAction, IdpKeyboardNavContextIdentifier } from '../../../services/document/idp-keyboard-navigation.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TemplateLetDirective } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { DocumentListDirective } from '../../../directives/document-list.directive';
import { DocumentListComponent } from '../document-list/document-list.component';
import { IdpDocument, REJECTED_CLASS_ID, UNCLASSIFIED_CLASS_ID, UNSORTED_DOCUMENT_LIST_ID } from '../../../models/screen-models';
import { IdpDocumentClassService } from '../../../services/document-class/idp-document-class.service';

@Component({
    selector: 'hyland-idp-unsorted-document-list',
    templateUrl: './unsorted-document-list.component.html',
    styleUrls: ['./unsorted-document-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [AsyncPipe, DocumentListComponent, TemplateLetDirective],
})
export class UnsortedDocumentListComponent extends DocumentListDirective {
    override classDropListId = 'unsorted-document-list-drop-list';

    private readonly documentClassService: IdpDocumentClassService = inject(IdpDocumentClassService);

    protected override initDocuments(): void {
        this.documents$ = combineLatest([this.documentService.allDocuments$, this.documentService.documentViewFilter$]).pipe(
            map(([documents, viewFilter]) => {
                return documents
                    .filter((document) => !document.rejectedReasonId && (viewFilter === 'OnlyIssues' ? document.hasIssue : true))
                    .map((document) => ({
                        ...document,
                        allPagesSelected: document.pages.every((page) => page.isSelected),
                    }));
            })
        );
    }

    protected override onItemMouseDown(item: IdpDocument, event: MouseEvent, mode: 'toggle' | 'select') {
        if (!item.rejectedReasonId) {
            this.documentClassService.toggleExpandClass(item.class?.id ?? UNCLASSIFIED_CLASS_ID);
            this.documentClassService.setSelectedClass(item.class?.id ?? UNCLASSIFIED_CLASS_ID);
        }

        this.clickEvent$.next({
            itemContext: { contextId: item.id, contextType: 'document' },
            containerContext: this.keyboardNavContext,
            event,
            data: item,
        });

        this.onItemListChanged(item, event, mode);
    }

    protected override initSelectedDocumentsCount(): void {
        this.selectedDocumentsCount$ = this.documentService.selectedDocuments$.pipe(
            takeUntilDestroyed(this.destroyRef),
            map((documents) => documents.length)
        );
    }

    protected override handleSelectionNavigationAction(action: IdpKeyboardNavAction, selectedDocumentId: string, actionDocument: IdpDocument): void {
        this.documentClassService.selectedClass$.pipe(take(1), withLatestFrom(this.documentService.allDocuments$)).subscribe(([cls, documents]) => {
            const doc = documents.find((d) => d.id === selectedDocumentId);
            if (doc && cls?.id === REJECTED_CLASS_ID && !doc.rejectedReasonId) {
                this.documentClassService.setSelectedClass(doc.class?.id ?? UNCLASSIFIED_CLASS_ID);
            }
        });

        super.handleSelectionNavigationAction(action, selectedDocumentId, actionDocument);
    }

    override get keyboardNavContext(): IdpKeyboardNavContextIdentifier {
        return {
            contextId: UNSORTED_DOCUMENT_LIST_ID,
            contextType: 'class',
        };
    }
}
