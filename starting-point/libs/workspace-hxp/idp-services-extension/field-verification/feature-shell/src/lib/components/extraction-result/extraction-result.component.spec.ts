/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NoopTranslateModule } from '@alfresco/adf-core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtractionResultComponent } from './extraction-result.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MetadataPanelComponent } from '../metadata-panel/metadata-panel.component';
import { IdpField } from '../../models/screen-models';
import { IdpFieldDataType, IdpVerificationStatus } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { By } from '@angular/platform-browser';

describe('ExtractionResultComponent', () => {
    let component: ExtractionResultComponent;
    let fixture: ComponentFixture<ExtractionResultComponent>;

    const mockField: IdpField = {
        dataType: IdpFieldDataType.Text,
        format: '',
        isSelected: false,
        hasIssue: false,
        value: 'value',
        verificationStatus: IdpVerificationStatus.ManualValid,
        confidence: 0.8,
        id: 'field_id',
        name: 'Field 1',
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule, HttpClientTestingModule, MetadataPanelComponent, NoopTranslateModule],
        });

        fixture = TestBed.createComponent(ExtractionResultComponent);
        component = fixture.componentInstance;
    });

    it('should set status to "Extraction issue" if field has issue', () => {
        component.field = { ...mockField, hasIssue: true };
        expect(component.status).toBe('EXTRACTION.VERIFICATION.EXTRACTION_RESULT.EXTRACTION_ISSUE');
        expect(component.hasIssue).toBe(true);
    });

    const statusTestCases = [
        { status: IdpVerificationStatus.AutoValid, expected: 'EXTRACTION.VERIFICATION.EXTRACTION_RESULT.EXTRACTED_SUCCESSFULLY', hasIssue: false },
        { status: IdpVerificationStatus.ManualValid, expected: 'EXTRACTION.VERIFICATION.EXTRACTION_RESULT.VERIFIED', hasIssue: false },
        { status: IdpVerificationStatus.AutoInvalid, expected: 'EXTRACTION.VERIFICATION.EXTRACTION_RESULT.NOT_VERIFIED', hasIssue: true },
        { status: IdpVerificationStatus.ManualInvalid, expected: 'EXTRACTION.VERIFICATION.EXTRACTION_RESULT.NOT_VERIFIED', hasIssue: true },
    ];

    for (const testCase of statusTestCases) {
        it(`should set status text to "${testCase.expected}" if field status is ${testCase.status}`, () => {
            component.field = { ...mockField, verificationStatus: testCase.status };
            fixture.detectChanges();
            expect(component.status).toBe(testCase.expected);
            expect(component.hasIssue).toBe(testCase.hasIssue);
        });
    }

    it('should set status to "Verified" if field status is ManualValid', () => {
        component.field = mockField;
        fixture.detectChanges();
        expect(component.status).toBe('EXTRACTION.VERIFICATION.EXTRACTION_RESULT.VERIFIED');
        expect(component.hasIssue).toBe(false);

        const span = fixture.debugElement.query(By.css('.idp-extraction-result-text'));
        expect(span.nativeElement.textContent).toEqual('EXTRACTION.VERIFICATION.EXTRACTION_RESULT.VERIFIED');
    });

    it('should set the right result text and style class if field has issue', () => {
        component.field = { ...mockField, hasIssue: true };
        fixture.detectChanges();

        const iconElement = fixture.debugElement.query(By.css('.idp-extraction-result-icon'));
        expect(iconElement.nativeElement.classList).toContain('idp-has-issue');

        const spanElement = fixture.debugElement.query(By.css('.idp-extraction-result-text'));
        expect(spanElement.nativeElement.textContent).toEqual('EXTRACTION.VERIFICATION.EXTRACTION_RESULT.EXTRACTION_ISSUE');
    });
});
