/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ChangeDetectionStrategy, Component, DestroyRef, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { IdpField, IdpTable } from '../../models/screen-models';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BehaviorSubject, distinctUntilChanged, filter, Observable, switchMap } from 'rxjs';
import { IdpVerificationService } from '../../services/verification/verification.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ExtractionResultComponent } from '../extraction-result/extraction-result.component';
import { ActionHistoryService } from '../../services/action-history.service';

@Component({
    selector: 'hyland-idp-metadata-table-field',
    standalone: true,
    templateUrl: './metadata-table-field.component.html',
    styleUrls: ['./metadata-table-field.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, ExtractionResultComponent, MatButtonModule, MatIconModule, MatTooltipModule, MatFormFieldModule, TranslatePipe],
})
export class MetadataTableFieldComponent {
    @Input() set id(value: string) {
        this.tableId$.next(value);
    }

    table$: Observable<IdpTable | undefined>;
    field$: Observable<IdpField | undefined>;

    private readonly tableId$ = new BehaviorSubject<string>('');

    private readonly verificationService = inject(IdpVerificationService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly history = inject(ActionHistoryService);

    constructor() {
        this.table$ = this.tableId$.pipe(
            takeUntilDestroyed(this.destroyRef),
            filter(Boolean),
            distinctUntilChanged(),
            switchMap((tableId) => {
                return this.verificationService.getTableById$(tableId);
            })
        );

        this.field$ = this.tableId$.pipe(
            takeUntilDestroyed(this.destroyRef),
            filter(Boolean),
            distinctUntilChanged(),
            switchMap((tableId) => this.verificationService.getFieldById$(tableId))
        );
    }

    addTable(tableId: string) {
        this.history.do({
            do: () => {
                this.verificationService.addTableRow(tableId, 0);
            },
            undo: () => {
                this.verificationService.deleteTableRow(tableId, 0);
                setTimeout(() => {
                    this.verificationService.selectNextField();
                }, 0);
            },
        });
    }
}
