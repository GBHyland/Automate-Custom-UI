/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SingleItemDownloadButtonComponent } from './single-item-download-button.component';
import { MockService } from 'ng-mocks';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { registerLocaleData } from '@angular/common';
import { By } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { a11yReport, jestMocks } from '@hxp/workspace-hxp/shared/testing';
import localeEn from '@angular/common/locales/en';
import localeEnExtra from '@angular/common/locales/extra/en';
import {
    DocumentService,
    HXP_DOCUMENT_SINGLE_ITEM_DOWNLOAD_ACTION_SERVICE,
    DocumentPermissions,
    BlobDownloadService,
    provideAdfEnterpriseAdfHxContentServicesServices,
} from '@alfresco/adf-hx-content-services/services';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SingleItemDownloadButtonActionService } from './single-item-download-button-action.service';
import { mockHxcsJsClientConfigurationService } from '@alfresco/adf-hx-content-services/api';
import { MatSnackBarModule } from '@angular/material/snack-bar';

registerLocaleData(localeEn, 'en', localeEnExtra);

const EXPECTED_VIOLATIONS: { [violationId: string]: number }[] | undefined = [];

describe('SingleItemDownloadButtonComponent', () => {
    let downloadButtonComponent: SingleItemDownloadButtonComponent;
    let fixture: ComponentFixture<SingleItemDownloadButtonComponent>;
    let downloadBlobSpy: jest.SpyInstance<Observable<Blob>>;
    const mockBlobDownloadService = MockService(BlobDownloadService);
    const documentServiceSpy = {
        documentSharedFromContext$: jest.fn(),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, NoopTranslateModule, MatSnackBarModule, SingleItemDownloadButtonComponent],
            providers: [
                provideAdfEnterpriseAdfHxContentServicesServices(),
                mockHxcsJsClientConfigurationService,
                { provide: DocumentService, useValue: documentServiceSpy },
                {
                    provide: BlobDownloadService,
                    useValue: mockBlobDownloadService,
                },
                {
                    provide: HXP_DOCUMENT_SINGLE_ITEM_DOWNLOAD_ACTION_SERVICE,
                    useClass: SingleItemDownloadButtonActionService,
                },
            ],
        });

        downloadBlobSpy = jest.spyOn(mockBlobDownloadService, 'downloadBlob').mockImplementation(() => of(new Blob()));

        fixture = TestBed.createComponent(SingleItemDownloadButtonComponent);
        downloadButtonComponent = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        downloadBlobSpy.mockReset();
        fixture.destroy();
    });

    it("should not be in DOM when user doesn't have `Read` permission", () => {
        downloadButtonComponent.actionContext.documents[0] = {
            ...jestMocks.fileDocument,
            sys_effectivePermissions: [],
        };
        downloadButtonComponent.ngOnChanges();
        fixture.detectChanges();
        const downloadButton = fixture.debugElement.query(By.css('#document-viewer-single-download-button'));

        expect(downloadButton).toBeFalsy();
    });

    it('should be in DOM when user has `Read` permission', () => {
        downloadButtonComponent.actionContext.documents[0] = {
            ...jestMocks.fileDocument,
            sys_effectivePermissions: [DocumentPermissions.READ],
        };
        downloadButtonComponent.ngOnChanges();
        fixture.detectChanges();
        const downloadButton = fixture.debugElement.query(By.css('#document-viewer-single-download-button'));

        expect(downloadButton).toBeTruthy();
    });

    it('should pass accessibility checks', async () => {
        downloadButtonComponent.actionContext = {
            documents: [jestMocks.fileDocument],
        };
        downloadButtonComponent.ngOnChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const res = await a11yReport('#document-viewer-single-download-button');

        expect(res?.violations).toEqual(EXPECTED_VIOLATIONS);
    });
});
