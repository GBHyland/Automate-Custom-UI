/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Input } from '@angular/core';
import { ThumbnailService as AdfThumbnailService } from '@alfresco/adf-core';
import { ThumbnailService } from '../services/thumbnail.service';
import { DefaultIcon } from '../configs/icons.config';
import { MimeTypeIconPipe } from '../pipes/mime-type-icon.pipe';

/**
 * Component representing a mime type icon.
 *
 * To use the `MimeTypeIconComponent`, you need first to import the component in your module
 *
 * ```ts
 * import { MimeTypeIconComponent } from '@alfresco/adf-hx-content-services/icons';
 * @NgModule({
 *     imports: [
 *         MimeTypeIconComponent,
 *         ...
 *     ],
 *    [...]
 * })
 * export class AppModule {}
 * ```
 *
 * Then use it in your Angular template as shown in the example below:
 *
 * @example
 * <hxp-mime-type-icon [mimeType]="'image/png'"></hxp-mime-type-icon>
 *
 */
@Component({
    selector: 'hxp-mime-type-icon',
    templateUrl: './mime-type-icon.component.html',
    styleUrls: ['./mime-type-icon.component.scss'],
    standalone: true,
    imports: [MimeTypeIconPipe],
    providers: [{ provide: AdfThumbnailService, useClass: ThumbnailService }],
})
export class MimeTypeIconComponent {
    /**
     * A string representing a valid mime type.
     * @type {string}
     *
     * <details>
     * <summary>Supported mime types</summary>
     *
     * - 'image/png'
     * - 'image/jpeg'
     * - 'image/gif'
     * - 'image/bmp'
     * - 'image/cgm'
     * - 'image/ief'
     * - 'image/jp2'
     * - 'image/tiff'
     * - 'image/vnd.adobe.photoshop'
     * - 'image/vnd.adobe.premiere'
     * - 'image/x-cmu-raster'
     * - 'image/x-dwt'
     * - 'image/x-portable-anymap'
     * - 'image/x-portable-bitmap'
     * - 'image/x-portable-graymap'
     * - 'image/x-portable-pixmap'
     * - 'image/x-raw-adobe'
     * - 'image/x-raw-canon'
     * - 'image/x-raw-fuji'
     * - 'image/x-raw-hasselblad'
     * - 'image/x-raw-kodak'
     * - 'image/x-raw-leica'
     * - 'image/x-raw-minolta'
     * - 'image/x-raw-nikon'
     * - 'image/x-raw-olympus'
     * - 'image/x-raw-panasonic'
     * - 'image/x-raw-pentax'
     * - 'image/x-raw-red'
     * - 'image/x-raw-sigma'
     * - 'image/x-raw-sony'
     * - 'image/x-xbitmap'
     * - 'image/x-xpixmap'
     * - 'image/x-xwindowdump'
     * - 'image/svg+xml'
     * - 'application/eps'
     * - 'application/illustrator'
     * - 'application/pdf'
     * - 'application/vnd.ms-excel'
     * - 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
     * - 'application/vnd.openxmlformats-officedocument.spreadsheetml.template'
     * - 'application/vnd.ms-excel.addin.macroenabled.12'
     * - 'application/vnd.ms-excel.sheet.binary.macroenabled.12'
     * - 'application/vnd.ms-excel.sheet.macroenabled.12'
     * - 'application/vnd.ms-excel.template.macroenabled.12'
     * - 'application/vnd.sun.xml.calc'
     * - 'application/vnd.sun.xml.calc.template'
     * - 'application/vnd.ms-outlook'
     * - 'application/msword'
     * - 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
     * - 'application/vnd.openxmlformats-officedocument.wordprocessingml.template'
     * - 'application/vnd.ms-word.document.macroenabled.12'
     * - 'application/vnd.ms-word.template.macroenabled.12'
     * - 'application/vnd.sun.xml.writer'
     * - 'application/vnd.sun.xml.writer.template'
     * - 'application/rtf'
     * - 'text/rtf'
     * - 'application/vnd.ms-powerpoint'
     * - 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
     * - 'application/vnd.openxmlformats-officedocument.presentationml.template'
     * - 'application/vnd.openxmlformats-officedocument.presentationml.slideshow'
     * - 'application/vnd.oasis.opendocument.presentation'
     * - 'application/vnd.oasis.opendocument.presentation-template'
     * - 'application/vnd.openxmlformats-officedocument.presentationml.slide'
     * - 'application/vnd.sun.xml.impress'
     * - 'application/vnd.sun.xml.impress.template'
     * - 'application/vnd.oasis.opendocument.spreadsheet'
     * - 'application/vnd.oasis.opendocument.spreadsheet-template'
     * - 'application/vnd.ms-powerpoint.addin.macroenabled.12'
     * - 'application/vnd.ms-powerpoint.presentation.macroenabled.12'
     * - 'application/vnd.ms-powerpoint.slide.macroenabled.12'
     * - 'application/vnd.ms-powerpoint.slideshow.macroenabled.12'
     * - 'application/vnd.ms-powerpoint.template.macroenabled.12'
     * - 'video/mp4'
     * - 'video/3gpp'
     * - 'video/3gpp2'
     * - 'video/mp2t'
     * - 'video/mpeg'
     * - 'video/mpeg2'
     * - 'video/ogg'
     * - 'video/quicktime'
     * - 'video/webm'
     * - 'video/x-flv'
     * - 'video/x-m4v'
     * - 'video/x-ms-asf'
     * - 'video/x-ms-wmv'
     * - 'video/x-msvideo'
     * - 'video/x-rad-screenplay'
     * - 'video/x-sgi-movie'
     * - 'video/x-matroska'
     * - 'audio/mpeg'
     * - 'audio/ogg'
     * - 'audio/wav'
     * - 'audio/basic'
     * - 'audio/mp3'
     * - 'audio/mp4'
     * - 'audio/vnd.adobe.soundbooth'
     * - 'audio/vorbis'
     * - 'audio/x-aiff'
     * - 'audio/x-flac'
     * - 'audio/x-ms-wma'
     * - 'audio/x-wav'
     * - 'x-world/x-vrml'
     * - 'text/plain'
     * - 'application/vnd.oasis.opendocument.text'
     * - 'application/vnd.oasis.opendocument.text-template'
     * - 'application/x-javascript'
     * - 'application/json'
     * - 'text/csv'
     * - 'text/xml'
     * - 'text/html'
     * - 'text/css'
     * - 'application/x-compressed'
     * - 'application/x-zip-compressed'
     * - 'application/zip'
     * - 'application/x-tar'
     * - 'application/vnd.apple.keynote'
     * - 'application/vnd.apple.pages'
     * - 'application/vnd.apple.numbers'
     * - 'application/vnd.visio'
     * - 'application/wordperfect'
     * - 'application/x-cpio'
     * - 'multipart/related'
     *
     * </details>
     *
     *
     */
    @Input()
    mimeType: string = DefaultIcon.UNKNOWN;

    constructor(
        // ThumbnailService is required to display icons
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        thumbnailService: ThumbnailService
    ) {}
}
