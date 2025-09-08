/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    ChangeDetectionStrategy,
    Component,
    Injector,
    ViewEncapsulation,
    ViewChildren,
    QueryList,
    ElementRef,
    AfterViewInit,
    DestroyRef,
    OnDestroy,
    EventEmitter,
    Output,
    Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { BehaviorSubject, filter, map, Observable, switchMap } from 'rxjs';
import { ExtractionResultComponent } from '../extraction-result/extraction-result.component';
import { ActionHistoryService } from '../../services/action-history.service';
import { IdpField } from '../../models/screen-models';
import { BasicOcrWord, findSingleTypeaheadMatch, findOcrMatches, IdpVerificationService } from '../../services/verification/verification.service';
import {
    IdpShortcutAction,
    IdpShortcutService,
    RejectDocumentDialogComponent,
    IdpFieldDataType,
} from '@hxp/workspace-hxp/idp-services-extension/shared';
import { MetadataTableFieldComponent } from '../metadata-table-field/metadata-table-field.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IdpViewerOcrCandidate } from '@hyland/idp-document-viewer';

@Component({
    selector: 'hyland-idp-extraction-metadata-panel',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatTooltipModule,
        ExtractionResultComponent,
        MetadataTableFieldComponent,
        TranslatePipe,
    ],
    templateUrl: './metadata-panel.component.html',
    styleUrls: ['./metadata-panel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class MetadataPanelComponent implements AfterViewInit, OnDestroy {
    readonly documentFields$: Observable<IdpField[]>;
    readonly activeField$: Observable<IdpField | undefined>;
    readonly undoTooltip = this.shortcutService.getFullTooltipForAction(IdpShortcutAction.Undo);
    readonly redoTooltip = this.shortcutService.getFullTooltipForAction(IdpShortcutAction.Redo);

    @ViewChildren('metadataInput') metadataInputs!: QueryList<ElementRef<HTMLInputElement>>;

    private readonly viewInitialized$ = new BehaviorSubject<boolean>(false);
    private lastKeyDownEvent?: KeyboardEvent;

    @Input()
    ocrWords = new Array<BasicOcrWord>();

    @Output()
    readonly fieldValuePending = new EventEmitter<{ field: IdpField; pendingValue: string }>();

    @Output() showTable = new EventEmitter<void>();

    constructor(
        readonly dialog: MatDialog,
        private readonly injector: Injector,
        private readonly history: ActionHistoryService,
        private readonly shortcutService: IdpShortcutService,
        private readonly verificationService: IdpVerificationService,
        destroyRef: DestroyRef
    ) {
        this.documentFields$ = this.verificationService.documentFields$.pipe(takeUntilDestroyed(destroyRef));
        this.activeField$ = this.verificationService.activeField$.pipe(takeUntilDestroyed(destroyRef));

        this.activeField$
            .pipe(
                switchMap((field) =>
                    this.viewInitialized$.pipe(
                        filter((v) => v), // Proceed only when the view is initialized
                        map(() => field) // Map to the current field
                    )
                )
            )
            .subscribe((field) => {
                if (field?.needsKeyboardFocus) {
                    // setTimeout prevents ExpressionChangedAfterItHasBeenCheckedError in test
                    setTimeout(() => this.metadataInputs.find((input) => input.nativeElement.id === field?.id)?.nativeElement.focus(), 0);
                }
                if (field?.dataType === IdpFieldDataType.Table) {
                    this.showTable.emit();
                }
            });
    }

    ngAfterViewInit() {
        this.viewInitialized$.next(true);
    }

    ngOnDestroy() {
        this.viewInitialized$.next(false);
    }

    openRejectDocumentDialog() {
        const dialogConfig: MatDialogConfig = {
            injector: this.injector,
            width: '600px',
            height: '80%',
            autoFocus: '.idp-filterable-selection-list__search-field-input',
            restoreFocus: true,
        };
        const dialogRef = this.dialog.open(RejectDocumentDialogComponent, dialogConfig);
        return dialogRef.afterClosed().subscribe((result) => {
            if (result?.rejectReason) {
                this.verificationService.updateRejectReason(result.rejectReason.id, result.rejectNote);
            }
        });
    }

    canUndo() {
        return this.history.canUndo();
    }
    onUndo() {
        this.history.undo();
    }

    canRedo() {
        return this.history.canRedo();
    }
    onRedo() {
        this.history.redo();
    }

    onFieldKeyDown(event: KeyboardEvent, field: IdpField, value: string) {
        this.lastKeyDownEvent = event;
        // keyboard shortcuts should not propagate to parent components
        event.stopPropagation();

        if (event.key === 'Enter') {
            event.preventDefault();
            this.confirmFieldUpdate(field, value);
            this.verificationService.selectNextField();
        }
    }

    onFieldFocus(field: IdpField) {
        // needed to make sure that the activeField in the store stays in sync
        this.verificationService.selectField(field);
        this.fieldValuePending.emit({ field, pendingValue: field.value ?? '' });
    }

    onFieldInput(field: IdpField, input: HTMLInputElement) {
        // if the user is deleting text, we don't want to auto-complete
        const isDismissal = this.lastKeyDownEvent?.key === 'Backspace' || this.lastKeyDownEvent?.key === 'Delete';
        if (!isDismissal) {
            const userValue = input.value;
            const suggestion = findSingleTypeaheadMatch(this.ocrWords, userValue);
            if (suggestion) {
                input.value = suggestion.map((word) => word.text).join(' ');
                input.setSelectionRange(userValue.length, input.value.length);
            }
        }

        this.fieldValuePending.emit({ field, pendingValue: input.value });
    }

    onFieldFocusOut(field: IdpField, value: string): void {
        this.confirmFieldUpdate(field, value);
    }

    private confirmFieldUpdate(field: IdpField, value: string) {
        // Early exit if value hasn't changed (no undo required)
        if ((field.value ?? '') === value) {
            this.verificationService.updateField(field);
            return;
        }

        let updatedFieldData: Partial<IdpField> = {};

        const matches = [...findOcrMatches(this.ocrWords, value.trim(), false, true)];

        if (matches.length > 0 && matches[0].length > 0) {
            const primaryMatch = matches[0] as IdpViewerOcrCandidate[];
            const firstWord = primaryMatch[0];

            const bounds = primaryMatch.reduce(
                (acc, word) => ({
                    minLeft: Math.min(acc.minLeft, word.left),
                    minTop: Math.min(acc.minTop, word.top),
                    maxRight: Math.max(acc.maxRight, word.left + word.width),
                    maxBottom: Math.max(acc.maxBottom, word.top + word.height),
                }),
                {
                    minLeft: firstWord.left,
                    minTop: firstWord.top,
                    maxRight: firstWord.left + firstWord.width,
                    maxBottom: firstWord.top + firstWord.height,
                }
            );

            updatedFieldData = {
                boundingBox: {
                    pageId: firstWord.pageId,
                    left: bounds.minLeft,
                    top: bounds.minTop,
                    width: bounds.maxRight - bounds.minLeft,
                    height: bounds.maxBottom - bounds.minTop,
                },
            };
        } else {
            updatedFieldData = {
                boundingBox: undefined,
            };
        }

        const fieldForUpdate = {
            ...field,
            value,
            confidence: 1,
            ...updatedFieldData,
        };

        this.history.do({
            do: () => this.verificationService.updateField(fieldForUpdate),
            undo: () => this.verificationService.updateField(field),
        });
    }

    onShowTable(tableId: string) {
        this.verificationService.selectField(tableId);
    }

    // This custom trackBy function prevents Angular from re-rendering the entire list of fields on each change, which can cause focus loss.
    // The implementation might need to be updated if the number or ordering of fields could change.
    // https://github.com/ngrx/store/issues/176
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    trackField(index: number, field: IdpField) {
        return index;
    }

    isFieldSelected(field: IdpField, activeField?: IdpField) {
        return field.id === activeField?.id || field.id === activeField?.tableId;
    }
}
