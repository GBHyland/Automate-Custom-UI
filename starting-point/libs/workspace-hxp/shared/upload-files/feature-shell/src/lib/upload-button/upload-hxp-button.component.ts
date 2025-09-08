/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { EXTENDIBLE_COMPONENT, FileUtils } from '@alfresco/adf-core';
import { Component, forwardRef, Input, ViewEncapsulation } from '@angular/core';
import { UploadBase } from '../base-upload/upload-base';
import { NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
    standalone: true,
    selector: 'hxp-upload-button',
    templateUrl: './upload-hxp-button.component.html',
    styleUrls: ['./upload-hxp-button.component.scss'],
    viewProviders: [{ provide: EXTENDIBLE_COMPONENT, useExisting: forwardRef(() => UploadHxpButtonComponent) }],
    encapsulation: ViewEncapsulation.None,
    imports: [NgIf, MatButtonModule, MatIconModule, TranslatePipe],
})
export class UploadHxpButtonComponent extends UploadBase {
    /** Allows/disallows upload folders (only for Chrome). */
    @Input()
    uploadFolders = false;

    /** Allows/disallows multiple files */
    @Input()
    multipleFiles = false;

    @Input()
    useAsMenuItem = false;

    /** Defines the text of the upload button. */
    @Input()
    staticTitle = '';

    /** Custom tooltip text. */
    @Input()
    tooltip = '';

    /** Custom added file. The upload button type will be 'button' instead of 'file' */
    @Input()
    file?: File;

    isButtonDisabled(): boolean | undefined {
        return this.disabled ?? undefined;
    }

    onFilesAdded($event: any): void {
        const files: File[] = FileUtils.toFileArray($event.currentTarget.files);

        this.uploadFiles(files);
        $event.target.value = '';
    }

    onDirectoryAdded($event: any): void {
        const files: File[] = FileUtils.toFileArray($event.currentTarget.files);
        this.uploadFiles(files);
        $event.target.value = '';
    }
}
