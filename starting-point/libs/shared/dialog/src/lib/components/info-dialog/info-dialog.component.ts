/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ErrorLogGroup } from '@alfresco-dbp/shared-core';
import { Component, inject, OnInit, SecurityContext } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { NgIf, NgFor } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { DialogData } from '../../interfaces/dialog.interface';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface InfoDialogPayload {
    subject: Subject<boolean>;
    title?: string;
    subtitle?: string;
    messages?: string[];
}

export interface MessageGroupData {
    key?: string;
    params?: { [key: string]: string };
    description: string;
}

@Component({
    templateUrl: './info-dialog.component.html',
    styleUrls: ['./info-dialog.component.scss'],
    standalone: true,
    imports: [NgIf, NgFor, TranslatePipe, MatDialogModule, MatButtonModule],
})
export class InfoDialogComponent implements OnInit {
    title!: string;
    subtitle: string | undefined;
    messages!: string[];
    messageGroups: ErrorLogGroup[] = [];
    messageGroupsData: Record<string, MessageGroupData[]> = {};
    isValidationErrors = false;
    subject: Subject<boolean> | undefined;
    htmlContent: string | null = null;

    private sanitizer = inject(DomSanitizer);
    public dialog = inject(MatDialogRef<InfoDialogComponent>);
    public data: DialogData = inject(MAT_DIALOG_DATA, { optional: true });

    ngOnInit() {
        this.title = this.data.title || 'APP.DIALOGS.CONFIRM.TITLE';
        this.subtitle = this.data.subtitle;
        this.subject = this.data.subject;
        this.messages = this.data.messages || [];
        this.messageGroups = this.data.messageGroups || [];
        this.isValidationErrors = !!this.data.isValidationErrors;
        this.messageGroupsData = this.messageGroups.reduce(this.generateMessageGroups, Object.create(null));

        if (this.data.htmlContent) {
            const safeHtml: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(this.data.htmlContent);
            this.htmlContent = this.sanitizer.sanitize(SecurityContext.HTML, safeHtml);
        }
    }

    close(): void {
        this.dialog.close();
        this.subject?.next(true);
    }

    private generateMessageGroups(
        messageGroups: Record<string, MessageGroupData[]>,
        { modelType = '', modelName = '', key, params, description }: ErrorLogGroup
    ): Record<string, MessageGroupData[]> {
        const groupKey = `${modelType ? modelType + ' -- ' : ''}${modelName}`;

        messageGroups[groupKey] = messageGroups[groupKey] || [];
        messageGroups[groupKey].push({
            key,
            params,
            description,
        });

        return messageGroups;
    }

    get messageGroupsKeys(): string[] {
        return Object.keys(this.messageGroupsData);
    }
}
