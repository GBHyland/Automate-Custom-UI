/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ContentShareButtonComponent } from './content-share-button.component';
import { ContentShareDialogComponent } from '../content-share-dialog/content-share-dialog.component';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { a11yReport, jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { HXP_DOCUMENT_SHARE_ACTION_SERVICE, DocumentPermissions } from '@alfresco/adf-hx-content-services/services';
import { ContentShareButtonActionService } from './content-share-button-action.service';
import { NoopTranslateModule } from '@alfresco/adf-core';

describe('ContentShareButtonComponent', () => {
    let component: ContentShareButtonComponent;
    let fixture: ComponentFixture<ContentShareButtonComponent>;
    let button: DebugElement;

    const EXPECTED_VIOLATIONS: { [violationId: string]: number }[] | undefined = [];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ContentShareDialogComponent, ContentShareButtonComponent, MatDialogModule, NoopTranslateModule],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: MatDialogRef, useValue: {} },
                {
                    provide: HXP_DOCUMENT_SHARE_ACTION_SERVICE,
                    useClass: ContentShareButtonActionService,
                },
            ],
        });

        fixture = TestBed.createComponent(ContentShareButtonComponent);
        component = fixture.componentInstance;
        button = fixture.debugElement.query(By.css('button.hxp-content-share-button'));
        fixture.detectChanges();
    });

    it('should not be in DOM on element instantiation', () => {
        expect(button).toBeFalsy();
    });

    it('should not be in DOM the button when more than a Document is selected', () => {
        const contentShareButtonActionService = TestBed.inject<ContentShareButtonActionService>(HXP_DOCUMENT_SHARE_ACTION_SERVICE);
        const documentWithRightAcl = {
            ...jestMocks.fileDocument,
            sys_effectivePermissions: [DocumentPermissions.READ],
        };
        component.actionContext.documents = [{ ...documentWithRightAcl }, { ...documentWithRightAcl }];
        const result = contentShareButtonActionService.isAvailable(component.actionContext);
        expect(result).toBe(false);
        fixture.detectChanges();
        expect(button).toBeFalsy();
    });

    it('should be in DOM when only a Document is selected', () => {
        const contentShareButtonActionService = TestBed.inject<ContentShareButtonActionService>(HXP_DOCUMENT_SHARE_ACTION_SERVICE);
        const documentWithRightAcl = {
            ...jestMocks.fileDocument,
            sys_effectivePermissions: [DocumentPermissions.READ],
        };
        component.actionContext.documents = [{ ...documentWithRightAcl }];
        const result = contentShareButtonActionService.isAvailable(component.actionContext);
        expect(result).toBe(true);
        component.ngOnChanges();
        fixture.detectChanges();
        button = fixture.debugElement.query(By.css('button.hxp-content-share-button'));
        expect(button).toBeTruthy();
    });

    it("should not be in DOM when user doesn't have `Read` permission", () => {
        component.actionContext.documents = [{ ...jestMocks.fileDocument, sys_effectivePermissions: [] }];
        const contentShareButtonActionService = TestBed.inject<ContentShareButtonActionService>(HXP_DOCUMENT_SHARE_ACTION_SERVICE);
        const result = contentShareButtonActionService.isAvailable(component.actionContext);
        expect(result).toBe(false);
        component.ngOnChanges();
        fixture.detectChanges();
        expect(button).toBeFalsy();
    });

    it('should be in DOM when user has `Read` permission', () => {
        const contentShareButtonActionService = TestBed.inject<ContentShareButtonActionService>(HXP_DOCUMENT_SHARE_ACTION_SERVICE);
        component.actionContext.documents = [
            {
                ...jestMocks.fileDocument,
                sys_effectivePermissions: [DocumentPermissions.READ],
            },
        ];
        const result = contentShareButtonActionService.isAvailable(component.actionContext);
        expect(result).toBe(true);
        component.ngOnChanges();
        fixture.detectChanges();
        button = fixture.debugElement.query(By.css('button.hxp-content-share-button'));
        expect(button).toBeTruthy();
    });

    it('should call the share method when button is clicked', () => {
        const contentShareButtonActionService = TestBed.inject<ContentShareButtonActionService>(HXP_DOCUMENT_SHARE_ACTION_SERVICE);
        component.actionContext.documents = [jestMocks.fileDocument];
        component.ngOnChanges();
        fixture.detectChanges();
        button = fixture.debugElement.query(By.css('button.hxp-content-share-button'));
        jest.spyOn(contentShareButtonActionService, 'execute').mockImplementation(() => {});

        expect(contentShareButtonActionService.execute).not.toHaveBeenCalled();

        button.nativeElement.click();

        expect(contentShareButtonActionService.execute).toHaveBeenCalled();
    });

    it('should pass accessibility checks', async () => {
        component.actionContext = { documents: [jestMocks.fileDocument] };
        component.ngOnChanges();
        fixture.detectChanges();
        await fixture.whenStable();

        const res = await a11yReport('button');

        expect(res?.violations).toEqual(EXPECTED_VIOLATIONS);
    });
});
