/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { IdpKeyboardNavContextIdentifier } from '../../../services/document/idp-keyboard-navigation.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TemplateLetDirective } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { DocumentListDirective } from '../../../directives/document-list.directive';
import { DocumentListComponent } from '../document-list/document-list.component';
import { AsyncPipe } from '@angular/common';

@Component({
    selector: 'hyland-idp-class-document-list',
    templateUrl: './class-document-list.component.html',
    styleUrls: ['./class-document-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [AsyncPipe, TemplateLetDirective, DocumentListComponent],
})
export class ClassDocumentListComponent extends DocumentListDirective implements OnInit, OnDestroy {
    @Input() classId!: string;
    @Input() previewMode = false;

    override classDropListId!: string;

    override ngOnInit(): void {
        this.classDropListId = `class-${this.classId}-drop-list`;
        this.dragDropService.addDropList(this.classDropListId);
        this.initDocuments();
        this.initSelectedDocumentsCount();
    }

    protected override afterViewInitProtected() {
        if (!this.previewMode) {
            this.keyboardNavigationService.registerContext({
                ...this.keyboardNavContext,
                items: this.items,
                itemType: 'document',
                keydownEvent$: this.keydownEvent$,
                clickEvent$: this.clickEvent$,
                canExpand: true,
                activateItemOnRegister: true,
                multiSelectAllowed: true,
            });
        }
    }

    protected override onDestroyProtected() {
        this.dragDropService.removeDropList(this.classDropListId);
        if (!this.previewMode) {
            this.keyboardNavigationService.unregisterContext(this.keyboardNavContext);
        }
    }

    protected override initDocuments(): void {
        this.documents$ = this.documentService.getDocumentsForClass(this.classId).pipe(
            takeUntilDestroyed(this.destroyRef),
            map((documents) => {
                return documents.map((document) => ({
                    ...document,
                    allPagesSelected: document.pages.every((page) => page.isSelected),
                }));
            })
        );
    }

    protected override initSelectedDocumentsCount(): void {
        this.selectedDocumentsCount$ = this.documentService.selectedDocuments$.pipe(
            takeUntilDestroyed(this.destroyRef),
            map((documents) => documents.length)
        );
    }

    override get keyboardNavContext(): IdpKeyboardNavContextIdentifier {
        return {
            contextId: this.classId,
            contextType: 'class',
        };
    }
}
