/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FileUtils } from '@alfresco/adf-core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'hyland-idp-upload-document-button',
    templateUrl: './upload-button.component.html',
    styleUrls: ['./upload-button.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [MatButtonModule, MatIconModule, TranslatePipe],
})
export class DocumentUploadButtonComponent implements OnChanges {
    @Input() acceptedFileExtensions: string[] = [];
    @Input() disabled = false;

    @Output() uploadDocuments = new EventEmitter<File[]>();

    inputFileAccept: string | undefined;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['acceptedFileExtensions'] && !this.inputFileAccept) {
            this.inputFileAccept = this.acceptedFileExtensions.map((ext) => `.${ext.trim()}`).join(',');
        }
    }

    onUploadDocuments(event: any): void {
        const eventFileList: FileList = event.target.files;
        if (eventFileList && eventFileList.length > 0) {
            this.uploadDocuments.emit(FileUtils.toFileArray(eventFileList));
        }
    }
}
