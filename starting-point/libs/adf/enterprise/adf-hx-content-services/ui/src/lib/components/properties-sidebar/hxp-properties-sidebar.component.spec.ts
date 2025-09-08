/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HxpPropertiesSidebarComponent } from './hxp-properties-sidebar.component';
import {
    DocumentService,
    DocumentUpdateInfo,
    provideAdfEnterpriseAdfHxContentServicesServices,
    DOCUMENT_PROPERTIES_SERVICE,
} from '@alfresco/adf-hx-content-services/services';
import { Subject, of } from 'rxjs';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { INFO_DRAWER_DIRECTIVES, NoopTranslateModule } from '@alfresco/adf-core';
import { a11yReport } from '@hxp/workspace-hxp/shared/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Component, Input } from '@angular/core';
import { MatButtonHarness } from '@angular/material/button/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HarnessLoader } from '@angular/cdk/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { mockHxcsJsClientConfigurationService } from '@alfresco/adf-hx-content-services/api';

@Component({
    standalone: false,
    selector: 'hxp-properties-viewer-container',
    template: '<div></div>',
})
class MockHxpPropertiesViewerContainerComponent {
    @Input() expanded?: boolean;
    @Input() useChipsForMultiValueProperty?: boolean;
    @Input() properties?: any[];
    @Input() editable?: boolean;
    @Input() document: any;
}

const EXPECTED_VIOLATIONS: { [violationId: string]: number }[] | undefined = [];

describe('HxpPropertySidebarComponent', () => {
    let component: HxpPropertiesSidebarComponent;
    let fixture: ComponentFixture<HxpPropertiesSidebarComponent>;
    let mockDocument: Document;
    let loader: HarnessLoader;

    const mockDocumentService = {
        getDocumentById: jest.fn(),
        updateDocument: jest.fn(),
        documentUpdated$: new Subject<DocumentUpdateInfo>(),
    };

    const mockDocumentPropertiesService = {
        extractCustomSchemaFields: jest.fn(),
        getDefaultPropertiesFromDocument: jest.fn(),
        getPropertiesFromDocument: jest.fn(),
        getRequiredProperties: jest.fn(),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, NoopTranslateModule, MatSnackBarModule, HxpPropertiesSidebarComponent, ...INFO_DRAWER_DIRECTIVES],
            declarations: [MockHxpPropertiesViewerContainerComponent],
            providers: [
                provideAdfEnterpriseAdfHxContentServicesServices(),
                mockHxcsJsClientConfigurationService,
                { provide: DocumentService, useValue: mockDocumentService },
                {
                    provide: DOCUMENT_PROPERTIES_SERVICE,
                    useValue: mockDocumentPropertiesService,
                },
            ],
        });

        mockDocumentService.getDocumentById.mockReturnValue(of(mockDocument));
        mockDocumentPropertiesService.extractCustomSchemaFields.mockReturnValue(of({}));

        mockDocument = {
            sys_id: '123',
            sys_primaryType: 'SysFile',
        } as Document;

        fixture = TestBed.createComponent(HxpPropertiesSidebarComponent);
        loader = TestbedHarnessEnvironment.loader(fixture);
        component = fixture.componentInstance;
        component.document = mockDocument;
    });

    it('should fetch document properties on document change', fakeAsync(() => {
        const fetchDocumentPropertiesSpy = jest.spyOn<any, any>(component, 'fetchDocumentProperties');
        mockDocumentService.getDocumentById.mockReturnValue(of(mockDocument));

        component.ngOnChanges();
        tick();

        expect((component as any).propertyLoading).toBe(false);
        expect((component as any).selectedDocument).toEqual(mockDocument);
        expect(fetchDocumentPropertiesSpy).toHaveBeenCalled();
    }));

    it('should reload the properties viewer when document category is updated', fakeAsync(() => {
        const newDocument = mockDocument;
        const updatedProperties = new Map<string, any>([['sys_primaryType', 'someValue']]);
        mockDocumentService.updateDocument.mockReturnValue(of(newDocument));
        const fetchDocumentPropertiesSpy = jest.spyOn<any, any>(component, 'fetchDocumentProperties');
        mockDocumentService.documentUpdated$.next({ document: newDocument, updatedProperties });
        tick();

        expect(component.document).toEqual(newDocument);
        expect(fetchDocumentPropertiesSpy).toHaveBeenCalled();
    }));

    it('should fetch default and other properties when handlePropertyUpdate is called', () => {
        const fetchDefaultPropertiesSpy = jest.spyOn(component as any, 'fetchDefaultProperties');
        const fetchOtherPropertiesSpy = jest.spyOn(component as any, 'fetchOtherProperties');

        (component as any).handlePropertyUpdate(true);

        expect(fetchDefaultPropertiesSpy).toHaveBeenCalled();
        expect(fetchOtherPropertiesSpy).toHaveBeenCalled();
    });

    it('should call the services while fetching the properties', () => {
        const mockSchemaFields = { field1: '' };
        mockDocumentPropertiesService.extractCustomSchemaFields.mockReturnValue(of(mockSchemaFields));
        (component as any).selectedDocument = mockDocument;

        component['fetchDocumentProperties']();

        expect(mockDocumentPropertiesService.extractCustomSchemaFields).toHaveBeenCalledWith('SysFile');
        expect(mockDocumentPropertiesService.getDefaultPropertiesFromDocument).toHaveBeenCalledWith(mockDocument);
        expect(mockDocumentPropertiesService.getPropertiesFromDocument).toHaveBeenCalledWith(mockDocument, {
            exclude: {
                schemas: ['sysfile_blob', 'sys_', 'sysver_', 'sysgov_'],
            },
        });
    });

    it('should properly initialize document with custom schema fields', () => {
        const mockSchemaFields = {
            field1: '',
            field2: {
                nestedField1: '',
                nestedField2: {
                    deepNestedField1: '',
                },
            },
            field3: '',
        };

        component['initializeDocumentWithSchema'](mockSchemaFields, mockDocument);

        expect(mockDocument['field1']).toEqual('');
        expect(mockDocument['field2'].nestedField1).toEqual('');
        expect(mockDocument['field2'].nestedField2.deepNestedField1).toEqual('');
        expect(mockDocument['field3']).toEqual('');
    });

    it('should close property sidebar', async () => {
        jest.spyOn(component.closePropertySidebar, 'emit').mockImplementation(() => {});
        const buttonHarness = await loader.getHarness(
            MatButtonHarness.with({
                selector: '.hxp-property-sidebar-close-button',
            })
        );
        await buttonHarness.click();
        fixture.detectChanges();

        expect(component.closePropertySidebar.emit).toHaveBeenCalledWith();
    });

    it('should react to document updates', fakeAsync(() => {
        const newDocument: Document = {
            sys_id: '123',
            sys_primaryType: 'SysFile',
        } as Document;
        const updatedProperties = new Map<string, any>([['sys_primaryType', 'someValue']]);

        component.document = mockDocument;
        mockDocumentService.getDocumentById.mockReturnValue(of(newDocument));
        const loadDocumentPropertiesSpy = jest.spyOn<any, any>(component, 'loadDocumentProperties');

        mockDocumentService.documentUpdated$.next({ document: newDocument, updatedProperties });
        tick();

        expect(loadDocumentPropertiesSpy).toHaveBeenCalledWith('123');
        expect(component.document).toEqual(newDocument);
    }));

    it('should pass accessibility checks', async () => {
        mockDocumentService.getDocumentById.mockReturnValue(of(mockDocument));
        mockDocumentPropertiesService.extractCustomSchemaFields.mockReturnValue(of({}));
        mockDocumentPropertiesService.getDefaultPropertiesFromDocument.mockReturnValue(of([]));
        mockDocumentPropertiesService.getPropertiesFromDocument.mockReturnValue(of([]));

        component.document = mockDocument;
        component['fetchDocumentProperties']();

        fixture.detectChanges();
        await fixture.whenStable();

        const res = await a11yReport('adf-info-drawer-layout');

        expect(res?.violations).toEqual(EXPECTED_VIOLATIONS);
    });
});
