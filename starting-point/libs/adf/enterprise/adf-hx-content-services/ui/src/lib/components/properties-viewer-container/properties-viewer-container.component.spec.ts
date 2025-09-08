/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

// TODO? This is an empty test file so that karma does not fail
// It will be removed once a real test file will be added in this library
// reason for the need of empty test is https://hyland.atlassian.net/browse/AAE-12347

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PropertiesViewerContainerComponent } from './properties-viewer-container.component';
import { CardViewTextItemModel, CardViewUpdateService, NoopTranslateModule } from '@alfresco/adf-core';
import { FieldType } from '@alfresco/adf-hx-content-services/api';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonHarness } from '@angular/material/button/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HarnessLoader } from '@angular/cdk/testing';
import { DOCUMENT_SERVICE, DOCUMENT_PROPERTIES_SERVICE, HxpNotificationService } from '@alfresco/adf-hx-content-services/services';
import { jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { of } from 'rxjs';

describe('PropertiesViewerContainerComponent', () => {
    let component: PropertiesViewerContainerComponent;
    let fixture: ComponentFixture<PropertiesViewerContainerComponent>;
    let loader: HarnessLoader;

    const mockDocumentService = {
        updateDocument: jest.fn(),
    };
    const mockCardViewUpdateService = {
        itemUpdated$: of(),
    };
    const mockHxpNotificationService = {
        openSnackBar: jest.fn(),
    };
    const mockDocumentPropertiesService = {
        propertyType: jest.fn(),
        isFieldTypeArray: jest.fn(),
        getRequiredProperties: jest.fn(),
    };

    const createEditableWorkingDoc = () => ({
        ...jestMocks.fileDocument,
        sysver_isVersion: false,
        sys_mixinTypes: [],
    });

    beforeEach(() => {
        mockDocumentService.updateDocument.mockReturnValue(of());

        TestBed.configureTestingModule({
            imports: [PropertiesViewerContainerComponent, NoopAnimationsModule, NoopTranslateModule],
            providers: [
                { provide: DOCUMENT_SERVICE, useValue: mockDocumentService },
                { provide: CardViewUpdateService, useValue: mockCardViewUpdateService },
                { provide: HxpNotificationService, useValue: mockHxpNotificationService },
                { provide: DOCUMENT_PROPERTIES_SERVICE, useValue: mockDocumentPropertiesService },
            ],
        });

        fixture = TestBed.createComponent(PropertiesViewerContainerComponent);
        loader = TestbedHarnessEnvironment.loader(fixture);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should toggle edit mode on button click', async () => {
        component.document = createEditableWorkingDoc();
        component.editable = true;
        component.ngOnChanges();
        fixture.detectChanges();
        await fixture.whenStable();

        expect((component as any).editMode).toBe(false);

        const buttonHarness = await loader.getHarness(MatButtonHarness.with({ selector: '.hxp-property-edit-button' }));
        await buttonHarness.click();
        fixture.detectChanges();

        expect((component as any).editMode).toBe(true);
    });

    it('should emit propertyUpdateRequest when cancel button is clicked', async () => {
        component.document = createEditableWorkingDoc();
        component.editable = true;
        component.ngOnChanges();
        fixture.detectChanges();
        await fixture.whenStable();

        const toggleSpy = jest.spyOn(component as any, 'toggleEditMode');
        const emitSpy = jest.spyOn(component.propertyUpdateRequest, 'emit');

        const buttonHarness = await loader.getHarness(MatButtonHarness.with({ selector: '.hxp-property-edit-button' }));
        await buttonHarness.click();
        fixture.detectChanges();

        const cancelButtonHarness = await loader.getHarness(MatButtonHarness.with({ selector: '.hxp-cancel-button' }));
        await cancelButtonHarness.click();
        fixture.detectChanges();

        expect(toggleSpy).toHaveBeenCalledTimes(2);
        expect(emitSpy).toHaveBeenCalledWith(true);
    });

    it('should call updateDocument when onSaveProperties is called with valid document.sys_id', () => {
        const testSysId = 'testSysId';
        const testPropertiesToUpdate = { testProperty: 'Test Value' };

        component.document = { sys_id: testSysId } as any;
        (component as any).documentPropertiesToUpdate = testPropertiesToUpdate;

        (component as any).onSaveProperties();

        expect(mockDocumentService.updateDocument).toHaveBeenCalledWith(testSysId, testPropertiesToUpdate);
    });

    it('should respond to card updates correctly when onSaveProperties is called', async () => {
        component.document = createEditableWorkingDoc();
        component.editable = true;
        component.ngOnChanges();
        fixture.detectChanges();
        await fixture.whenStable();

        const testFieldKey = 'testField';
        const testFieldValue = 'Test Value';

        mockDocumentPropertiesService.propertyType.mockReturnValue(FieldType.String);

        const updateNotification = {
            target: new CardViewTextItemModel({
                key: testFieldKey,
                label: 'Test Label',
                value: 'Initial Value',
                default: 'Default Value',
                editable: true,
            }),
            changed: {
                [testFieldKey]: testFieldValue,
            },
        };

        const editButtonHarness = await loader.getHarness(MatButtonHarness.with({ selector: '.hxp-property-edit-button' }));
        await editButtonHarness.click();
        fixture.detectChanges();

        component['respondToCardUpdate'](updateNotification);
        fixture.detectChanges();

        const saveButtonHarness = await loader.getHarness(MatButtonHarness.with({ selector: '.hxp-save-properties-button' }));
        await saveButtonHarness.click();

        expect(mockDocumentPropertiesService.propertyType).toHaveBeenCalledWith(testFieldKey);
        expect(component['documentPropertiesToUpdate'][testFieldKey]).toBe(testFieldValue);
    });

    it('should not present edit button for non-working document', async () => {
        component.document = {
            ...jestMocks.fileDocument,
            sysver_isVersion: true,
        } as any;

        component.editable = true;
        component.ngOnChanges();
        fixture.detectChanges();
        await fixture.whenStable();

        const editButtonHarness = await loader.getHarnessOrNull(MatButtonHarness.with({ selector: '.hxp-property-edit-button' }));

        expect((component as any).editMode).toBe(false);
        expect(editButtonHarness).toBeNull();
    });

    it('should not present edit button for governable (onHold) document', async () => {
        component.document = {
            ...jestMocks.fileDocument,
            sysver_isVersion: false,
            sys_mixinTypes: ['SysGovernable', 'SysFilish'],
            sysgov_isRecord: true,
            sysgov_hasLegalHold: true,
        } as any;

        component.editable = true;
        component.ngOnChanges();
        fixture.detectChanges();
        await fixture.whenStable();

        const editButtonHarness = await loader.getHarnessOrNull(MatButtonHarness.with({ selector: '.hxp-property-edit-button' }));

        expect((component as any).editMode).toBe(false);
        expect(editButtonHarness).toBeNull();
    });
});
