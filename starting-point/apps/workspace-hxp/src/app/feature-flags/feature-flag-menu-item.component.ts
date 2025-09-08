/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FlagsComponent, FlagsOverrideComponent, FlagsOverrideToken } from '@alfresco/adf-core/feature-flags';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    imports: [CommonModule, TranslatePipe, MatIconModule, MatButtonModule, MatMenuModule, FlagsOverrideComponent],
    selector: 'app-feature-flags-menu-item',
    template: `
        <button *ngIf="isVisible" mat-menu-item data-automation-id="features" class="features-button" (click)="openFeatureFlags()">
            <mat-icon>tune</mat-icon>
            {{ 'FEATURE-FLAGS.MENU-ITEM' | translate }}
            <adf-feature-flags-override-indicator size="small" />
        </button>
    `,
    styles: [
        `
            .features-button .activity-indicator {
                margin: 0 5px;
            }
            .override-features-dialog mat-dialog-container {
                padding: 0;
                overflow: auto;
                position: relative;
            }
        `,
    ],
    encapsulation: ViewEncapsulation.None,
})
export class FeatureFlagsMenuItemComponent {
    isVisible = false;

    constructor(private dialog: MatDialog, @Inject(FlagsOverrideToken) flagsOverridabilityToken = false) {
        this.isVisible = flagsOverridabilityToken;
    }

    openFeatureFlags() {
        this.dialog.open(FlagsComponent, { width: '700px', height: '500px', panelClass: 'override-features-dialog' });
    }
}
