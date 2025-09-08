/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { ThumbnailService } from './thumbnail.service';

describe('ThumbnailService', () => {
    let thumbnailService: ThumbnailService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ThumbnailService],
        });
        thumbnailService = TestBed.inject(ThumbnailService);
    });

    it('should return the correct icon for a plain text file', () => {
        expect(thumbnailService.getMimeTypeIcon('text/plain')).toContain('Text.svg');
    });

    it('should return the correct icon for a PNG file', () => {
        expect(thumbnailService.getMimeTypeIcon('image/png')).toContain('Image.svg');
    });

    it('should return the correct icon for a MP4 video file', () => {
        expect(thumbnailService.getMimeTypeIcon('video/mp4')).toContain('Video.svg');
    });

    it('should return the correct icon for a MP3 audio file', () => {
        expect(thumbnailService.getMimeTypeIcon('audio/mp3')).toContain('Audio.svg');
    });

    it('should return a generic icon for an unknown file', () => {
        expect(thumbnailService.getMimeTypeIcon('x-unknown/yyy')).toContain('Generic.svg');
    });

    it('should return the correct icon for a mht file', () => {
        expect(thumbnailService.getMimeTypeIcon('multipart/related')).toContain('Code.svg');
    });
});
