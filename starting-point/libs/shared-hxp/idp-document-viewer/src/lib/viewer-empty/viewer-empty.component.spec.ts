/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyComponent } from './viewer-empty.component';
import { NoopTranslateModule } from '@alfresco/adf-core';

describe('EmptyComponent', () => {
    let fixture: ComponentFixture<EmptyComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule],
        });

        fixture = TestBed.createComponent(EmptyComponent);
        fixture.detectChanges();
    });

    it('should have nativeElement', () => {
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('.idp-viewer-empty-view__text')).not.toBeNull();
    });
});
