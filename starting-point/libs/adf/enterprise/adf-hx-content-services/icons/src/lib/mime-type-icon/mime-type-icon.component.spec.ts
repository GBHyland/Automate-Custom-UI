/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MimeTypeIconComponent } from './mime-type-icon.component';
import { NoopTranslateModule } from '@alfresco/adf-core';

describe('MimeTypeIconComponent', () => {
    let component: MimeTypeIconComponent;
    let fixture: ComponentFixture<MimeTypeIconComponent>;
    let srcImageAttribute: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule, MimeTypeIconComponent],
        });

        fixture = TestBed.createComponent(MimeTypeIconComponent);
        component = fixture.componentInstance;
    });

    it('should display the correct icon for a plain text file', () => {
        component.mimeType = 'text/plain';
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        srcImageAttribute = compiled.querySelector('img').src;
        expect(srcImageAttribute).toContain('Text.svg');
    });

    it('should display the correct icon for a PDF file', () => {
        component.mimeType = 'application/pdf';
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        srcImageAttribute = compiled.querySelector('img').src;
        expect(srcImageAttribute).toContain('PDF.svg');
    });

    it('should display the correct icon for a PNG file', () => {
        component.mimeType = 'image/png';
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        srcImageAttribute = compiled.querySelector('img').src;
        expect(srcImageAttribute).toContain('Image.svg');
    });

    it('should display the correct icon for a MP3 audio file', () => {
        component.mimeType = 'audio/mp3';
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        srcImageAttribute = compiled.querySelector('img').src;
        expect(srcImageAttribute).toContain('Audio.svg');
    });

    it('should display the correct icon for a MP4 video file', () => {
        component.mimeType = 'video/mp4';
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        srcImageAttribute = compiled.querySelector('img').src;
        expect(srcImageAttribute).toContain('Video.svg');
    });

    it('should return a generic icon for an unknown file', () => {
        component.mimeType = 'x-unknown/yyy';
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        srcImageAttribute = compiled.querySelector('img').src;
        expect(srcImageAttribute).toContain('Generic.svg');
    });
});
