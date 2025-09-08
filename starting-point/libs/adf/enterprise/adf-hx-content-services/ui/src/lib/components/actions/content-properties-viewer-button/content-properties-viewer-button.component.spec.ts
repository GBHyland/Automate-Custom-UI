/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContentPropertiesViewerButtonComponent } from './content-properties-viewer-button.component';
import { DebugElement } from '@angular/core';
import { a11yReport, jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { By } from '@angular/platform-browser';
import { DocumentService, HXP_DOCUMENT_INFO_ACTION_SERVICE, DocumentPermissions } from '@alfresco/adf-hx-content-services/services';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { ContentPropertyViewerActionService } from './content-properties-viewer-button-action.service';

describe('ContentPropertiesViewerButtonComponent', () => {
    let component: ContentPropertiesViewerButtonComponent;
    let fixture: ComponentFixture<ContentPropertiesViewerButtonComponent>;
    let button: DebugElement;
    let documentServiceSpy: jest.Mocked<DocumentService>;

    const EXPECTED_VIOLATIONS: { [violationId: string]: number }[] | undefined = [];

    beforeEach(() => {
        documentServiceSpy = {
            documentSharedFromContext$: jest.fn(),
        } as any;
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, NoopTranslateModule, ContentPropertiesViewerButtonComponent],
            providers: [
                { provide: DocumentService, useValue: documentServiceSpy },
                {
                    provide: HXP_DOCUMENT_INFO_ACTION_SERVICE,
                    useClass: ContentPropertyViewerActionService,
                },
            ],
        });

        fixture = TestBed.createComponent(ContentPropertiesViewerButtonComponent);
        component = fixture.componentInstance;
        button = fixture.debugElement.query(By.css('button#document-properties-viewer-button'));
        fixture.detectChanges();
    });

    function setUpDocumentWithReadPermission() {
        if (!component.actionContext) {
            component.actionContext = { documents: [] };
        }
        component.actionContext.documents[0] = {
            ...jestMocks.fileDocument,
            sys_effectivePermissions: [DocumentPermissions.READ],
        };
        component.ngOnChanges();
        fixture.detectChanges();
    }

    it('should not be in DOM on element instantiation', () => {
        expect(button).toBeFalsy();
    });

    it('should not be in DOM when document is not set', () => {
        component.actionContext.documents[0] = undefined as any;
        component.ngOnChanges();
        fixture.detectChanges();
        expect(button).toBeFalsy();
    });

    it("should not be in DOM when user doesn't have `Read` permission", () => {
        component.actionContext.documents[0] = {
            ...jestMocks.fileDocument,
            sys_effectivePermissions: [],
        };
        component.ngOnChanges();
        fixture.detectChanges();

        button = fixture.debugElement.query(By.css('button#document-properties-viewer-button'));

        expect(button).toBeFalsy();
    });

    it('should be in DOM when user has `Read` permission', () => {
        setUpDocumentWithReadPermission();
        button = fixture.debugElement.query(By.css('button#document-properties-viewer-button'));

        expect(button).toBeTruthy();
    });

    it('should call showInfo when click info button', () => {
        setUpDocumentWithReadPermission();
        button = fixture.debugElement.query(By.css('button#document-properties-viewer-button'));
        const contentPropertyViewerActionService = TestBed.inject(HXP_DOCUMENT_INFO_ACTION_SERVICE);
        jest.spyOn(contentPropertyViewerActionService, 'execute').mockImplementation(() => {});

        expect(button).toBeTruthy();
        expect(contentPropertyViewerActionService.execute).not.toHaveBeenCalled();

        button.nativeElement.click();
        fixture.detectChanges();

        expect(contentPropertyViewerActionService.execute).toHaveBeenCalled();
    });

    it('should pass accessibility checks', async () => {
        setUpDocumentWithReadPermission();
        await fixture.whenStable();
        fixture.detectChanges();

        const res = await a11yReport('button');

        expect(res?.violations).toEqual(EXPECTED_VIOLATIONS);
    });
});
