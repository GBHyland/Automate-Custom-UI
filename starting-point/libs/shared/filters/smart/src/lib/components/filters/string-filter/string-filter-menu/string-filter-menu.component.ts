/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { A11yModule } from '@angular/cdk/a11y';

@Component({
    selector: 'hxp-string-filter-menu',
    standalone: true,
    imports: [
        CommonModule,
        MatFormFieldModule,
        FormsModule,
        MatInputModule,
        ReactiveFormsModule,
        MatDividerModule,
        MatButtonModule,
        TranslatePipe,
        A11yModule,
    ],
    templateUrl: './string-filter-menu.component.html',
    styleUrls: ['./string-filter-menu.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StringFilterMenuComponent implements OnInit {
    @Input() inputValue: string | null = null;
    @Output() update: EventEmitter<string | null> = new EventEmitter<string | null>();

    valueControl = new FormControl<string | null>(null);

    ngOnInit(): void {
        this.valueControl.setValue(this.inputValue);
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            this.onUpdate();
        }
    }

    onUpdate(): void {
        if (this.valueControl.value === '') {
            this.valueControl.setValue(null);
        }
        this.update.emit(this.valueControl.value);
    }
}
