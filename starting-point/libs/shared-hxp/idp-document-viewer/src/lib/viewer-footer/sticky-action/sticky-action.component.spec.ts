/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterStickyActionComponent } from './sticky-action.component';

describe('FooterStickyActionComponent', () => {
    let fixture: ComponentFixture<FooterStickyActionComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [FooterStickyActionComponent],
        });

        fixture = TestBed.createComponent(FooterStickyActionComponent);
        fixture.detectChanges();
    });

    it('should have nativeElement', () => {
        const compiled = fixture.nativeElement;
        expect(compiled.querySelector('.idp-viewer-sticky-button')).not.toBeNull();
    });
});
