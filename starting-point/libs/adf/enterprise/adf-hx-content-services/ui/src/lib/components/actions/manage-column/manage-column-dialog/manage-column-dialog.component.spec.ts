/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ManageColumnDialogComponent } from './manage-column-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
    ColumnConfigService,
    ColumnConfig,
    DEFAULT_COLUMNS,
    IIdentityUserService,
    IDENTITY_USER_SERVICE_TOKEN,
} from '@alfresco/adf-hx-content-services/services';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NoopTranslateModule, NoopAuthModule } from '@alfresco/adf-core';
import { of } from 'rxjs';
import { FieldType } from '@alfresco/adf-hx-content-services/api';
import { a11yReport } from '@hxp/workspace-hxp/shared/testing';
import { CONTEXT_MENU_ACTIONS_PROVIDERS } from '../../../../adf-enterprise-adf-hx-content-services-ui.providers';

const EXPECTED_VIOLATIONS: Array<{ [violationId: string]: number }> | undefined = [];

describe('ManageColumnDialogComponent', () => {
    let component: ManageColumnDialogComponent;
    let fixture: ComponentFixture<ManageColumnDialogComponent>;
    let mockDialogRef: jest.Mocked<MatDialogRef<ManageColumnDialogComponent>>;
    let mockColumnConfigService: jest.Mocked<ColumnConfigService>;
    let identityUserService: jest.Mocked<IIdentityUserService>;

    beforeEach(async () => {
        mockDialogRef = {
            close: jest.fn(),
        } as unknown as jest.Mocked<MatDialogRef<ManageColumnDialogComponent>>;

        mockColumnConfigService = {
            getSelectedColumnsForCurrentUser: jest.fn().mockReturnValue(DEFAULT_COLUMNS),
            getDefaultColumns: jest.fn().mockReturnValue(DEFAULT_COLUMNS),
            getCustomColumns: jest.fn().mockReturnValue(of([])),
            setCurrentSelectedColumnsForCurrentUser: jest.fn(),
        } as unknown as jest.Mocked<ColumnConfigService>;

        identityUserService = {
            getCurrentUserInfo: jest.fn().mockReturnValue({ username: 'user@example.com' }),
        } as unknown as jest.Mocked<IIdentityUserService>;

        await TestBed.configureTestingModule({
            imports: [ManageColumnDialogComponent, NoopAnimationsModule, NoopTranslateModule, NoopAuthModule],
            providers: [
                ...CONTEXT_MENU_ACTIONS_PROVIDERS,
                { provide: MatDialogRef, useValue: mockDialogRef },
                { provide: MAT_DIALOG_DATA, useValue: {} },
                { provide: ColumnConfigService, useValue: mockColumnConfigService },
                { provide: IDENTITY_USER_SERVICE_TOKEN, useValue: identityUserService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ManageColumnDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should initialize columns on load', async () => {
        const defaultColumns: ColumnConfig[] = [
            { key: 'sys_title', title: 'Title', sortable: true, removable: false },
            { key: 'icon', title: 'File Type', sortable: false, removable: true },
            { key: 'sys_modified', title: 'Last Modified', sortable: true, removable: true },
        ];
        const customColumns: ColumnConfig[] = [
            { key: 'customField1', title: 'Custom Field 1', sortable: true, removable: true, type: FieldType.String },
            { key: 'customField2', title: 'Custom Field 2', sortable: true, removable: true, type: FieldType.String },
        ];
        const expectedColumns: ColumnConfig[] = [{ key: 'sys_title', title: 'Title', sortable: true, removable: false }];
        const availableColumns: ColumnConfig[] = [
            { key: 'icon', title: 'File Type', sortable: false, removable: true },
            { key: 'sys_modified', title: 'Last Modified', sortable: true, removable: true },
        ];

        mockColumnConfigService.getSelectedColumnsForCurrentUser.mockReturnValue(expectedColumns);
        mockColumnConfigService.getDefaultColumns.mockReturnValue(defaultColumns);
        mockColumnConfigService.getCustomColumns.mockReturnValue(of(customColumns));

        component.ngOnInit();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(component.selectedColumns).toEqual(expectedColumns);
        expect(component.availableColumns).toEqual(availableColumns);
        expect(mockColumnConfigService.getSelectedColumnsForCurrentUser).toHaveBeenCalledWith(component.userInfo);
        expect(mockColumnConfigService.getDefaultColumns).toHaveBeenCalled();
        expect(mockColumnConfigService.getCustomColumns).toHaveBeenCalled();
    });

    it('should handle search changes correctly', fakeAsync(() => {
        const initialColumns = [
            { key: 'sys_title', title: 'Title', sortable: true, removable: false },
            { key: 'icon', title: 'File Type', sortable: false, removable: true },
        ];

        (component as any).allColumns = initialColumns;
        component.selectedColumns = [];
        component.searchTerm = 'title';

        component.onSearchChange();
        tick(300);

        expect(component.availableColumns.length).toBe(1);
        expect(component.availableColumns[0].key).toBe('sys_title');
    }));

    it('should add selected column when selectColumn is called', () => {
        const column = { key: 'sys_modified', title: 'Last Modified', sortable: true, removable: true };
        component.availableColumns = [column];
        component.selectColumn(column);

        expect(component.selectedColumns.includes(column)).toBe(true);
        expect(component.availableColumns.includes(column)).toBe(false);
    });

    it('should close the dialog when closeDialog is called', () => {
        (component as any).closeDialog();
        expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('should reset to default columns when resetToDefault is called', () => {
        const defaultColumns = [{ key: 'sys_created', title: 'Created', sortable: true, removable: true }];

        (component as any).initialDefaultColumns = defaultColumns;
        component.resetToDefault();
        fixture.detectChanges();

        expect(component.selectedColumns).toEqual(defaultColumns);
        expect(component.availableColumns).toEqual([]);
    });

    it('should pass accessibility checks', async () => {
        const res = await a11yReport('.hxp-manage-columns-container');

        expect(res?.violations).toEqual(EXPECTED_VIOLATIONS);
    });
});
