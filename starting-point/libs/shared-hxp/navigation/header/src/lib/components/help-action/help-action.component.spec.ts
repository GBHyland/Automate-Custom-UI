/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HelpActionComponent } from './help-action.component';
import { By } from '@angular/platform-browser';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { HEADER_CONFIG_TOKEN } from '../../tokens/header-config.token';
import { mockHeaderConfig, mockDocumentationUrl } from '../../mocks/help-action.component.mock';

describe('HelpActionComponent', () => {
    let fixture: ComponentFixture<HelpActionComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HelpActionComponent, NoopTranslateModule],
            providers: [
                {
                    provide: HEADER_CONFIG_TOKEN,
                    useValue: mockHeaderConfig,
                },
            ],
        });

        fixture = TestBed.createComponent(HelpActionComponent);
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should set href to documentation url', () => {
        const helpAction = fixture.debugElement.query(By.css('.hxp-header-action-help'));

        expect(helpAction).toBeTruthy();
        expect(helpAction.nativeElement.href).toBe(mockDocumentationUrl);
    });
});
