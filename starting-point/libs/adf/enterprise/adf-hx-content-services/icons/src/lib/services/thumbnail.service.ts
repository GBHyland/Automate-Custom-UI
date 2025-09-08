/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ThumbnailService as AdfThumbnailService } from '@alfresco/adf-core';
import { Injectable } from '@angular/core';
import { DefaultIcon } from '../configs/icons.config';
import { mimeTypeLinkedImages } from '../configs/mime-type.config';

export type MimeType = keyof typeof mimeTypeLinkedImages;

@Injectable({
    providedIn: 'root',
})
export class ThumbnailService extends AdfThumbnailService {
    override mimeTypeIcons: Record<string, string> = {
        ...mimeTypeLinkedImages,
        [DefaultIcon.FOLDER]: './assets/images/Folder.svg',
        [DefaultIcon.OPEN_FOLDER]: './assets/images/Folder_open.svg',
    };
    private readonly DEFAULT_ICON = './assets/images/Generic.svg';

    override getMimeTypeIcon(mimeType: string): string {
        return this.mimeTypeIcons[mimeType] ? super.getMimeTypeIcon(mimeType) : this.DEFAULT_ICON;
    }

    override getDefaultMimeTypeIcon(): string {
        return this.DEFAULT_ICON;
    }
}
