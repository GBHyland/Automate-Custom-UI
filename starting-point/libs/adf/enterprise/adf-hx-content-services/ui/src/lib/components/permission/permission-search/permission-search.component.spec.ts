/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PermissionsSearchComponent } from './permission-search.component';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { PermissionsManagementRow } from '@alfresco/adf-hx-content-services/services';
import { InputHarnessUtils, AutocompleteHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('PermissionsSearchComponent', () => {
    let fixture: ComponentFixture<PermissionsSearchComponent>;
    let component: PermissionsSearchComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, NoopTranslateModule],
        });

        fixture = TestBed.createComponent(PermissionsSearchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should display search user', async () => {
        await InputHarnessUtils.getInput({
            fixture,
            inputFilters: {
                selector: '.hxp-permission-dialog-search',
            },
        });
    });

    it('should display input place holder text', async () => {
        component.placeHolder = 'Search Users';

        await InputHarnessUtils.getInput({
            fixture,
            inputFilters: {
                selector: '.hxp-permission-dialog-search',
                placeholder: component.placeHolder,
            },
        });
    });

    it('should receive activePermissionsManagementRows', async () => {
        component.activePermissionsManagementRows = jestMocks.userGroupList as PermissionsManagementRow[];
        const inputElement = await InputHarnessUtils.getInput({
            fixture,
            inputFilters: {
                selector: '.hxp-permission-dialog-search',
            },
        });

        await inputElement.focus();

        const options = await AutocompleteHarnessUtils.getAutocompleteOptions({
            fixture,
        });
        expect(options.length).toBe(component.activePermissionsManagementRows.length);
    });

    it('should return search', async () => {
        jest.spyOn(component.search, 'emit');
        const inputElement = await InputHarnessUtils.getInput({
            fixture,
            inputFilters: {
                selector: '.hxp-permission-dialog-search',
            },
        });

        await inputElement.setValue('abc');

        expect(component.search.emit).toHaveBeenCalledWith('abc');
    });

    it('should emit search event when emit is called', async () => {
        component.activePermissionsManagementRows = jestMocks.userGroupList as PermissionsManagementRow[];
        jest.spyOn(component.search, 'emit');
        const inputElement = await InputHarnessUtils.getInput({
            fixture,
            inputFilters: {
                selector: '.hxp-permission-dialog-search',
            },
        });
        await inputElement.focus();
        const options = await AutocompleteHarnessUtils.getAutocompleteOptions({
            fixture,
        });

        expect(await options[0].getText()).toBe('Admin');
        expect(component.search.emit).not.toHaveBeenCalled();

        await options[0].click();

        expect(component.search.emit).toHaveBeenCalledWith('Admin');
    });
});
