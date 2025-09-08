/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, SecurityContext } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { IdpContextTaskBaseService } from '../../services/context-task/context-task-base.service';
import { MatButtonModule } from '@angular/material/button';
import { TemplateLetDirective } from '../../directives/template-let.directive';
import { MatDividerModule } from '@angular/material/divider';
import {
    FilterableSelectionListComponent,
    FilterableSelectionListItem,
} from '../../components/filterable-selection-list/filterable-selection-list.component';
import { RejectReason } from '../../models/contracts/task-input';
import { A11yModule } from '@angular/cdk/a11y';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TextFieldModule } from '@angular/cdk/text-field';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    templateUrl: './reject-document.dialog.html',
    styleUrls: ['./reject-document.dialog.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        A11yModule,
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatDialogModule,
        MatDividerModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        ReactiveFormsModule,
        TextFieldModule,
        TranslatePipe,
        TemplateLetDirective,
        FilterableSelectionListComponent,
    ],
})
export class RejectDocumentDialogComponent {
    private readonly contextService = inject(IdpContextTaskBaseService);
    private readonly dialogRef = inject(MatDialogRef<RejectDocumentDialogComponent>);
    private readonly formBuilder = inject(FormBuilder);
    private readonly sanitizer = inject(DomSanitizer);
    public destroyRef = inject(DestroyRef);

    items$!: Observable<FilterableSelectionListItem<RejectReason>[]>;
    activeItemSubject$ = new BehaviorSubject<RejectReason | undefined>(undefined);
    activeItem$: Observable<RejectReason | undefined> = this.activeItemSubject$.asObservable();
    rejectNoteMaxLength = 256;

    rejectForm: FormGroup;

    constructor() {
        this.items$ = this.contextService.rejectReasons$.pipe(
            takeUntilDestroyed(this.destroyRef),
            map((items) => items.map((item) => ({ item, id: item.id, name: item.value })))
        );

        this.rejectForm = this.formBuilder.group({
            rejectNote: [undefined],
        });
    }

    get rejectNote(): string {
        return this.rejectForm.controls['rejectNote'].value;
    }

    get sanitizedRejectNote(): string | undefined {
        return this.rejectNote ? this.sanitizer.sanitize(SecurityContext.HTML, this.rejectNote) ?? undefined : undefined;
    }

    onActiveItemChanged(item: RejectReason | undefined): void {
        this.activeItemSubject$.next(item);
    }

    handleKeyEnter(event: Event, selectedItem?: RejectReason): void {
        if (selectedItem) {
            this.dialogRef.close({ rejectReason: selectedItem, rejectNote: this.sanitizedRejectNote });
        }
        event.preventDefault();
    }
}
