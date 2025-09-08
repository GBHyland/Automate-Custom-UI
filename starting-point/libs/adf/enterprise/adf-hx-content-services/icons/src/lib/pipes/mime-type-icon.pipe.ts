/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { ThumbnailService } from '../services/thumbnail.service';

@Pipe({
    name: 'hxpMimeTypeIcon',
    standalone: true,
})
export class MimeTypeIconPipe implements PipeTransform {
    constructor(private thumbnailService: ThumbnailService) {}

    transform(text: string): string {
        return this.thumbnailService.getMimeTypeIcon(text);
    }
}
