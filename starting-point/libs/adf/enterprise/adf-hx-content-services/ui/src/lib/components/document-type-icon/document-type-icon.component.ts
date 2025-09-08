/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Input, OnChanges } from '@angular/core';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { CommonModule } from '@angular/common';
import { DefaultIcon, MimeType, MimeTypeIconComponent } from '@alfresco/adf-hx-content-services/icons';
import { hasBlob, isFolder } from '@alfresco/adf-hx-content-services/services';

/**
 * Component that display the content type icon of a given `Document`.
 *
 * To use the `ContentTypeIconComponent`, you need first to import the component in your module
 *
 * ```ts
 * import { ContentTypeIconComponent } from '@alfresco/adf-hx-content-services/ui';
 *
 * @NgModule({
 *     imports: [
 *         ContentTypeIconComponent
 *         ...
 *     ],
 *    [...]
 * })
 *
 * export class AppModule {}
 *
 * ```
 *
 * Then use it in your Angular template as shown in the example below:
 *
 * @example
 *   <hxp-document-type-icon [document]="document" [isExpanded]="isExpanded"></hxp-document-type-icon>
 */

@Component({
    selector: 'hxp-document-type-icon',
    templateUrl: './document-type-icon.component.html',
    standalone: true,
    imports: [CommonModule, MimeTypeIconComponent],
})
export class ContentTypeIconComponent implements OnChanges {
    /**
     * The document for which the icon will be displayed.
     * @type {Document}
     */
    @Input()
    document?: Document;

    /**
     * Toggles between expanded and collapsed for folder type documents only.
     * If the document is not a folder, this property is ignored.
     * @type {boolean}
     * @default false
     */
    @Input()
    isExpanded = false;

    protected documentIconType: DefaultIcon | MimeType = DefaultIcon.UNKNOWN;

    /**
     * The mime type of the `Document`.
     * @type {string}
     * @readonly
     */
    get mimeType(): DefaultIcon | MimeType {
        return this.documentIconType;
    }

    ngOnChanges(): void {
        this.checkDocumentIconType();
    }

    private checkDocumentIconType(): void {
        this.documentIconType = DefaultIcon.UNKNOWN;
        if (!this.document) {
            return;
        }

        if (isFolder(this.document)) {
            this.documentIconType = this.getFolderIcon(this.isExpanded);
        } else if (hasBlob(this.document)) {
            this.documentIconType = this.document['sysfile_blob'].mimeType;
        }
    }

    private getFolderIcon(isExpanded: boolean): DefaultIcon {
        return isExpanded ? DefaultIcon.OPEN_FOLDER : DefaultIcon.FOLDER;
    }
}
