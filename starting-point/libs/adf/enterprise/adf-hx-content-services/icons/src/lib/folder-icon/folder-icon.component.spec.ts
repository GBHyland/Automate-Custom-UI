/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FolderIconComponent } from './folder-icon.component';
import { NoopTranslateModule } from '@alfresco/adf-core';

describe('FolderIconComponent', () => {
    let component: FolderIconComponent;
    let fixture: ComponentFixture<FolderIconComponent>;
    let srcImageAttribute: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule, FolderIconComponent],
        });

        fixture = TestBed.createComponent(FolderIconComponent);
        component = fixture.componentInstance;
    });

    it("should have 'Folder.svg' as img property value", () => {
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        srcImageAttribute = compiled.querySelector('img').src;
        expect(srcImageAttribute).toContain('Folder.svg');
    });

    it("when expanded, should have 'Folder_open.svg' as img property value", () => {
        component.isExpanded = true;
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        srcImageAttribute = compiled.querySelector('img').src;
        expect(srcImageAttribute).toContain('Folder_open.svg');
    });
});
