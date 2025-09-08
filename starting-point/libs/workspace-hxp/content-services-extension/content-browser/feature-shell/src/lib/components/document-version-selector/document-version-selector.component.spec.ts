/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { DocumentVersionSelectorComponent } from './document-version-selector.component';
import {
    DocumentService,
    DocumentRouterService,
    DocumentVersionsService,
    versionsMocks,
    DocumentUpdateInfo,
} from '@alfresco/adf-hx-content-services/services';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectHarness } from '@angular/material/select/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { DatePipe } from '@angular/common';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { ADF_HX_CONTENT_SERVICES_INTERNAL } from '@alfresco/adf-hx-content-services/features';
import { provideMockFeatureFlags } from '@alfresco/adf-core/feature-flags';
import { By } from '@angular/platform-browser';

describe('DocumentVersionSelectorComponent', () => {
    let component: DocumentVersionSelectorComponent;
    let fixture: ComponentFixture<DocumentVersionSelectorComponent>;
    let documentVersionsServiceSpy: jasmine.SpyObj<DocumentVersionsService>;
    let documentServiceSpy: jasmine.SpyObj<DocumentService>;
    let documentRouterServiceSpy: jasmine.SpyObj<DocumentRouterService>;
    const documentUpdated$ = new Subject<DocumentUpdateInfo>();
    const documentDeleted$ = new Subject<string>();

    const versionDocument: Document = {
        sys_primaryType: 'MyVersionable',
        sys_id: '123',
        sysver_title: 'Custom version',
        sysver_isVersion: true,
        sys_parentId: '456',
        sys_mixinTypes: ['SysVersionable'],
    };
    const workingCopyDocument: Document = {
        sys_primaryType: 'MyVersionable',
        sys_id: '456',
        sysver_isVersion: false,
        sys_mixinTypes: ['SysVersionable'],
    };

    beforeEach(async () => {
        documentVersionsServiceSpy = jasmine.createSpyObj('DocumentVersionsService', ['getVersions']);
        documentServiceSpy = jasmine.createSpyObj('DocumentService', ['getDocumentById']);
        documentRouterServiceSpy = jasmine.createSpyObj('DocumentRouterService', ['navigateTo']);

        await TestBed.configureTestingModule({
            imports: [NoopTranslateModule, NoopAnimationsModule, DocumentVersionSelectorComponent],
            providers: [
                DatePipe,
                { provide: DocumentVersionsService, useValue: documentVersionsServiceSpy },
                { provide: DocumentService, useValue: documentServiceSpy },
                { provide: DocumentRouterService, useValue: documentRouterServiceSpy },
                provideMockFeatureFlags({
                    [ADF_HX_CONTENT_SERVICES_INTERNAL.WORKSPACE_VERSIONING]: true,
                }),
            ],
        }).compileComponents();
        documentServiceSpy.documentUpdated$ = documentUpdated$.asObservable();
        documentServiceSpy.documentDeleted$ = documentDeleted$.asObservable();

        fixture = TestBed.createComponent(DocumentVersionSelectorComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        documentVersionsServiceSpy.getVersions.calls.reset();
        documentServiceSpy.getDocumentById.calls.reset();
        documentRouterServiceSpy.navigateTo.calls.reset();
    });

    it('should not display the version selector button when the document is not versionable', async () => {
        component.actionContext = { documents: [{ ...workingCopyDocument, sys_mixinTypes: [] }] };

        fixture.detectChanges();
        component.ngOnChanges();

        const select = fixture.debugElement.query(By.css('.hxp-document-version-selector'));

        expect(select).toBeFalsy();
    });

    it('should fetch versions on context change', () => {
        expect(documentVersionsServiceSpy.getVersions).not.toHaveBeenCalled();
        expect(documentServiceSpy.getDocumentById).not.toHaveBeenCalled();
        expect(component.versions).toEqual([]);

        documentVersionsServiceSpy.getVersions.and.returnValue(of(versionsMocks));
        component.actionContext = { documents: [workingCopyDocument] };

        fixture.detectChanges();
        component.ngOnChanges();

        expect(documentVersionsServiceSpy.getVersions).toHaveBeenCalledWith(workingCopyDocument);
        expect(documentServiceSpy.getDocumentById).not.toHaveBeenCalled();
        expect(component.versions).toEqual([workingCopyDocument, ...versionsMocks]);
    });

    it('should fetch working copy and versions on context change', () => {
        expect(documentVersionsServiceSpy.getVersions).not.toHaveBeenCalled();
        expect(documentServiceSpy.getDocumentById).not.toHaveBeenCalled();
        expect(component.versions).toEqual([]);

        documentVersionsServiceSpy.getVersions.and.returnValue(of(versionsMocks));
        documentServiceSpy.getDocumentById.and.returnValue(of(workingCopyDocument));
        component.actionContext = { documents: [versionDocument] };

        fixture.detectChanges();
        component.ngOnChanges();

        expect(documentVersionsServiceSpy.getVersions).toHaveBeenCalledWith(workingCopyDocument);
        expect(documentServiceSpy.getDocumentById).toHaveBeenCalledWith(workingCopyDocument.sys_id);
        expect(component.versions).toEqual([workingCopyDocument, ...versionsMocks]);
    });

    it('should handle error when fetching versions', () => {
        expect(documentVersionsServiceSpy.getVersions).not.toHaveBeenCalled();
        expect(component.versions).toEqual([]);

        documentVersionsServiceSpy.getVersions.withArgs(workingCopyDocument).and.returnValue(throwError('Error'));
        component.actionContext = { documents: [workingCopyDocument] };

        fixture.detectChanges();
        component.ngOnChanges();

        expect(documentVersionsServiceSpy.getVersions).toHaveBeenCalledWith(workingCopyDocument);
        expect(component.versions).toEqual([workingCopyDocument]);
    });

    it('should navigate to selected document version', async () => {
        expect(documentRouterServiceSpy.navigateTo).not.toHaveBeenCalled();

        documentVersionsServiceSpy.getVersions.and.returnValue(of(versionsMocks));
        component.actionContext = { documents: [workingCopyDocument] };

        fixture.detectChanges();
        component.ngOnChanges();

        const loader = TestbedHarnessEnvironment.loader(fixture);
        const matSelect = await loader.getHarness(MatSelectHarness);

        expect(matSelect).toBeDefined();

        await matSelect.open();
        const options = await matSelect.getOptions();

        expect(options.length).toEqual(3);

        // The first option is the working copy
        await options[1].click();

        expect(documentRouterServiceSpy.navigateTo).toHaveBeenCalledWith(versionsMocks[0]);
    });

    it('should handle error when fetching working copy', () => {
        expect(documentVersionsServiceSpy.getVersions).not.toHaveBeenCalled();
        expect(documentServiceSpy.getDocumentById).not.toHaveBeenCalled();
        expect(component.versions).toEqual([]);

        documentVersionsServiceSpy.getVersions.and.returnValue(of(versionsMocks));
        documentServiceSpy.getDocumentById.and.returnValue(throwError('Error'));
        component.actionContext = { documents: [versionDocument] };

        fixture.detectChanges();
        component.ngOnChanges();

        expect(documentVersionsServiceSpy.getVersions).not.toHaveBeenCalledWith(versionDocument);
        expect(documentServiceSpy.getDocumentById).toHaveBeenCalledWith(versionDocument.sys_parentId);
        expect(component.versions).toEqual([versionDocument]);
    });

    it('should match the input document with the correct selected version', async () => {
        documentVersionsServiceSpy.getVersions.and.returnValue(of(versionsMocks));
        documentServiceSpy.getDocumentById.and.returnValue(of(workingCopyDocument));
        component.actionContext = { documents: [versionsMocks[0]] };

        fixture.detectChanges();
        component.ngOnChanges();

        await fixture.whenStable();

        const loader = TestbedHarnessEnvironment.loader(fixture);
        const matSelect = await loader.getHarness(MatSelectHarness);

        expect(matSelect).toBeDefined();

        await matSelect.open();
        const options = await matSelect.getOptions();

        expect(options.length).toEqual(3);

        const selectedText = await matSelect.getValueText();
        const expectedText = versionsMocks[0].sysver_title;

        expect(selectedText).toContain(expectedText);
    });

    it('should re-fetch versions when a document in the versions list is updated', () => {
        documentVersionsServiceSpy.getVersions.and.returnValue(of(versionsMocks));
        component.actionContext = { documents: [workingCopyDocument] };
        fixture.detectChanges();
        component.ngOnChanges();

        documentVersionsServiceSpy.getVersions.calls.reset();
        documentUpdated$.next({
            document: versionsMocks[0],
            updatedProperties: undefined,
        });

        expect(documentVersionsServiceSpy.getVersions).toHaveBeenCalled();
    });

    it('should re-fetch versions when a document in the versions list is deleted', () => {
        documentVersionsServiceSpy.getVersions.and.returnValue(of(versionsMocks));
        component.actionContext = { documents: [workingCopyDocument] };
        fixture.detectChanges();
        component.ngOnChanges();

        documentVersionsServiceSpy.getVersions.calls.reset();
        documentDeleted$.next(versionsMocks[0].sys_id);

        expect(documentVersionsServiceSpy.getVersions).toHaveBeenCalled();
    });

    it('should not re-fetch versions when updated/deleted document is not in the versions list', () => {
        documentVersionsServiceSpy.getVersions.and.returnValue(of(versionsMocks));
        component.actionContext = { documents: [workingCopyDocument] };
        fixture.detectChanges();
        component.ngOnChanges();

        documentVersionsServiceSpy.getVersions.calls.reset();

        const unrelatedDocument: Document = {
            sys_id: 'unrelated-id',
            sys_primaryType: 'MyVersionable',
            sys_mixinTypes: ['SysVersionable'],
        };

        documentUpdated$.next({
            document: unrelatedDocument,
            updatedProperties: undefined,
        });
        documentDeleted$.next(unrelatedDocument.sys_id);

        expect(documentVersionsServiceSpy.getVersions).not.toHaveBeenCalled();
    });
});
