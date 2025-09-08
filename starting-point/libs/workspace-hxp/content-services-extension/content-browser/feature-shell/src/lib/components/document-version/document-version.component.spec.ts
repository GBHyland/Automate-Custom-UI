/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateDocumentVersionButtonComponent } from './document-version.component';
import { CreateDocumentVersionActionService } from './document-version.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { mocks } from '@hxp/workspace-hxp/shared/testing';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { By } from '@angular/platform-browser';
import { provideMockFeatureFlags } from '@alfresco/adf-core/feature-flags';
import { MockProviders } from 'ng-mocks';
import { MatSnackBar } from '@angular/material/snack-bar';
import { mockHxcsJsClientConfigurationService } from '@alfresco/adf-hx-content-services/api';
import { DocumentService } from '@alfresco/adf-hx-content-services/services';
import { map, of } from 'rxjs';

describe('CreateDocumentVersionButtonComponent', () => {
    let component: CreateDocumentVersionButtonComponent;
    let fixture: ComponentFixture<CreateDocumentVersionButtonComponent>;
    const createDocumentVersionActionServiceSpy: jasmine.SpyObj<CreateDocumentVersionActionService> = jasmine.createSpyObj(
        'CreateDocumentVersionActionService',
        ['isAvailable', 'execute']
    );
    let documentServiceSpyObj: any;
    const getCreateVersionButton = () => fixture.debugElement.query(By.css('.hxp-create-version-button'));

    beforeEach(async () => {
        documentServiceSpyObj = jasmine.createSpyObj('DocumentService', ['updateDocument']);
        documentServiceSpyObj.documentVersionCreated$ = of({ undefined });
        documentServiceSpyObj.documentUpdated$ = of({ document: undefined, updatedProperties: new Map() });

        await TestBed.configureTestingModule({
            imports: [CreateDocumentVersionButtonComponent, NoopTranslateModule, NoopAnimationsModule],
            providers: [
                mockHxcsJsClientConfigurationService,
                { provide: DocumentService, useValue: documentServiceSpyObj },
                { provide: CreateDocumentVersionActionService, useValue: createDocumentVersionActionServiceSpy },
                MockProviders(MatSnackBar),
                provideMockFeatureFlags({
                    'workspace-versioning': false,
                }),
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CreateDocumentVersionButtonComponent);
        component = fixture.componentInstance;
        createDocumentVersionActionServiceSpy.isAvailable.calls.reset();
        createDocumentVersionActionServiceSpy.execute.calls.reset();
        createDocumentVersionActionServiceSpy.isAvailable.and.returnValue(false);
        fixture.detectChanges();
    });

    it('should display the component if the action is available', () => {
        let button = getCreateVersionButton();

        expect(button).toBeFalsy();

        documentServiceSpyObj.documentVersionCreated$ = of({ document: mocks.fileDocument }).pipe(map((response) => response.document));
        documentServiceSpyObj.documentUpdated$ = of({ document: mocks.fileDocument, updatedProperties: new Map() });

        createDocumentVersionActionServiceSpy.isAvailable.and.returnValue(true);
        component.data = { documents: [mocks.fileDocument] };

        component.ngOnChanges();
        fixture.detectChanges();

        button = getCreateVersionButton();

        expect(button).toBeTruthy();
    });

    it('should not display the component if the action is not available', () => {
        let button = getCreateVersionButton();

        expect(button).toBeFalsy();

        createDocumentVersionActionServiceSpy.isAvailable.and.returnValue(false);
        component.data = { documents: [mocks.fileDocument] };
        fixture.detectChanges();

        button = getCreateVersionButton();

        expect(button).toBeFalsy();
    });

    it('should call execute on the service when the button is clicked', () => {
        component.data = { documents: [mocks.fileDocument] };

        createDocumentVersionActionServiceSpy.isAvailable.and.returnValue(true);
        documentServiceSpyObj.documentVersionCreated$ = of({ document: mocks.fileDocument }).pipe(map((response) => response.document));
        documentServiceSpyObj.documentUpdated$ = of({ document: mocks.fileDocument, updatedProperties: new Map() });

        component.ngOnChanges();
        fixture.detectChanges();

        const button = getCreateVersionButton();

        expect(button).toBeTruthy();

        button.nativeElement.click();

        expect(createDocumentVersionActionServiceSpy.execute).toHaveBeenCalledWith(component.data);
    });

    it('should update isAvailable when data changes', () => {
        createDocumentVersionActionServiceSpy.isAvailable.and.returnValue(true);
        component.data = { documents: [mocks.fileDocument] };

        documentServiceSpyObj.documentVersionCreated$ = of({ document: mocks.fileDocument }).pipe(map((response) => response.document));
        documentServiceSpyObj.documentUpdated$ = of({ document: mocks.fileDocument, updatedProperties: new Map() });

        component.ngOnChanges();
        fixture.detectChanges();

        expect(component.isAvailable).toBe(true);
    });

    it('should not call execute if the action is not available', () => {
        createDocumentVersionActionServiceSpy.isAvailable.and.returnValue(false);
        component.data = { documents: [mocks.fileDocument] };

        documentServiceSpyObj.documentVersionCreated$ = of({ document: mocks.fileDocument }).pipe(map((response) => response.document));
        documentServiceSpyObj.documentUpdated$ = of({ document: mocks.fileDocument, updatedProperties: new Map() });

        component.ngOnChanges();
        fixture.detectChanges();

        const button = getCreateVersionButton();

        expect(button).toBeFalsy();
        expect(createDocumentVersionActionServiceSpy.execute).not.toHaveBeenCalled();
    });
});
