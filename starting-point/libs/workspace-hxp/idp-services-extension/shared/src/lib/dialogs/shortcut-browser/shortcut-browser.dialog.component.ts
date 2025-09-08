/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { IdpShortcutService } from '../../services/shortcut/idp-shortcut.service';
import { TransformPascalCaseStringPipe } from '../../pipes/capitalize-string.pipe';
import { TranslatePipe } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export const SHORTCUT_BROWSER_FILTER_DEBOUNCE_TIME = 500;

@Component({
    templateUrl: './shortcut-browser.dialog.component.html',
    styleUrls: ['./shortcut-browser.dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        TransformPascalCaseStringPipe,
        TranslatePipe,
    ],
})
export class ShortcutBrowserDialogComponent implements OnDestroy {
    shortcutSummaries = this.shortcutService.getShortcutSummary();
    showNoResults = false;

    private readonly searchFilter$ = new BehaviorSubject<string>('');

    constructor(private readonly shortcutService: IdpShortcutService, private readonly cdr: ChangeDetectorRef) {
        this.searchFilter$.pipe(debounceTime(SHORTCUT_BROWSER_FILTER_DEBOUNCE_TIME), distinctUntilChanged()).subscribe((s) => {
            this.shortcutSummaries = this.shortcutService.getShortcutSummary(s);
            this.showNoResults = !this.shortcutSummaries || !Object.values(this.shortcutSummaries).some((arr) => arr.length > 0);

            this.cdr.markForCheck();
        });
    }

    static openDialog(dialog: MatDialog, config: MatDialogConfig = {}): void {
        const dialogConfig: MatDialogConfig = {
            width: '40%',
            height: '65%',
            autoFocus: '.idp-search-input',
            delayFocusTrap: true,
            restoreFocus: true,
            ...config,
        };
        dialog.open(ShortcutBrowserDialogComponent, dialogConfig);
    }

    ngOnDestroy(): void {
        this.searchFilter$.complete();
    }

    onSearchInput(search: string) {
        this.searchFilter$.next(search.trim());
    }

    clearSearchInput(input: HTMLInputElement): void {
        input.value = '';
        this.onSearchInput(input.value);
    }

    generateItemAutomationId(name: string): string {
        if (!name) {
            return '';
        }
        return 'idp-shortcut-list-item-' + name.toLowerCase().replace(/ /g, '-');
    }
}
