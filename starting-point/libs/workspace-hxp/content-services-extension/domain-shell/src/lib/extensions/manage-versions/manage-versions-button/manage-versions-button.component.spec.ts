/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageVersionsButtonComponent } from './manage-versions-button.component';
import { DocumentPermissions, ManageVersionsButtonActionService } from '@alfresco/adf-hx-content-services/services';
import { MockService } from 'ng-mocks';
import { a11yReport, mocks } from '@hxp/workspace-hxp/shared/testing';
import { NoopTranslateModule } from '@alfresco/adf-core';

describe('ManageVersionsButtonComponent', () => {
    let component: ManageVersionsButtonComponent;
    let fixture: ComponentFixture<ManageVersionsButtonComponent>;

    const mockManageVersionsButtonActionService = MockService(ManageVersionsButtonActionService);

    // https://hyland.atlassian.net/browse/HXCS-5189
    const EXPECTED_VIOLATIONS: jasmine.Expected<{ [violationId: string]: number }[] | undefined> = [{ 'aria-required-parent': 1 }];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule, ManageVersionsButtonComponent],
            providers: [
                {
                    provide: ManageVersionsButtonActionService,
                    useValue: mockManageVersionsButtonActionService,
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ManageVersionsButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should request to open the version sidebar', () => {
        const spy = spyOn(mockManageVersionsButtonActionService, 'execute');
        component.data = {
            documents: [{ ...mocks.fileDocument, sys_mixinTypes: ['SysVersionable'], sys_effectivePermissions: [DocumentPermissions.READ_VERSION] }],
        };
        component.openManageVersions();

        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should pass accessibility checks', async () => {
        component.data = {
            documents: [{ ...mocks.fileDocument, sys_mixinTypes: ['SysVersionable'], sys_effectivePermissions: [DocumentPermissions.READ_VERSION] }],
        };
        component.isAvailable = true;
        fixture.detectChanges();
        await fixture.whenStable();

        const res = await a11yReport('button');

        expect(res?.violations).toEqual(EXPECTED_VIOLATIONS);
    });
});
