/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { REJECTED_CLASS_ID } from '../../models/screen-models';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { IdpDocumentClassService } from '../../services/document-class/idp-document-class.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { A11yModule } from '@angular/cdk/a11y';
import { ChangeClassListDialogData } from './change-class.dialog.extension';
import { TranslatePipe } from '@ngx-translate/core';
import {
    FilterableSelectionListComponent,
    FilterableSelectionListItem,
    IdentifierData,
    TemplateLetDirective,
} from '@hxp/workspace-hxp/idp-services-extension/shared';

@Component({
    templateUrl: './change-class.dialog.html',
    styleUrls: ['./change-class.dialog.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        A11yModule,
        CommonModule,
        MatButtonModule,
        MatDialogModule,
        MatDividerModule,
        MatIconModule,
        TemplateLetDirective,
        TranslatePipe,
        FilterableSelectionListComponent,
    ],
})
export class ChangeClassListDialogComponent {
    private readonly documentClassService = inject(IdpDocumentClassService);
    private readonly dialogRef = inject(MatDialogRef<ChangeClassListDialogComponent>);
    public dialogData: ChangeClassListDialogData = inject(MAT_DIALOG_DATA);
    public destroyRef = inject(DestroyRef);

    items$!: Observable<FilterableSelectionListItem<IdentifierData>[]>;
    activeItemSubject$ = new BehaviorSubject<IdentifierData | undefined>(undefined);
    activeItem$: Observable<IdentifierData | undefined> = this.activeItemSubject$.asObservable();

    private readonly ignoredClassIds = [REJECTED_CLASS_ID];
    readonly contextSelectedClassId: string | undefined;

    constructor() {
        this.contextSelectedClassId = this.dialogData.currentClassId;

        this.items$ = this.documentClassService.allClasses$.pipe(
            takeUntilDestroyed(this.destroyRef),
            map((items) => {
                return items.filter((item) => !this.ignoredClassIds.includes(item.id)).map((item) => ({ item, id: item.id, name: item.name }));
            })
        );
    }

    onActiveItemChanged(item: IdentifierData | undefined): void {
        this.activeItemSubject$.next(item);
    }

    handleKeyEnter(event: Event, selectedItem?: IdentifierData): void {
        if (selectedItem) {
            this.dialogRef.close(selectedItem);
        }
        event.preventDefault();
    }
}
