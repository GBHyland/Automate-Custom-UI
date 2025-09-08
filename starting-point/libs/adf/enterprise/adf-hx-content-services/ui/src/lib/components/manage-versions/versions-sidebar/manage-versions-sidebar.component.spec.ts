/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManageVersionsSidebarComponent } from './manage-versions-sidebar.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { AsyncPipe, DatePipe } from '@angular/common';
import {
    DocumentRouterService,
    DocumentVersionsService,
    HXP_DOCUMENT_COPY_ACTION_SERVICE,
    HXP_DOCUMENT_DELETE_ACTION_SERVICE,
    HXP_DOCUMENT_MOVE_ACTION_SERVICE,
    HXP_DOCUMENT_PERMISSIONS_ACTION_SERVICE,
    HXP_DOCUMENT_SHARE_ACTION_SERVICE,
    HXP_DOCUMENT_SINGLE_ITEM_DOWNLOAD_ACTION_SERVICE,
    HXP_DOCUMENT_INFO_ACTION_SERVICE,
    UserResolverPipe,
    UserResolverService,
    versionsMocks,
    DocumentActionService,
    ManageVersionsButtonActionService,
} from '@alfresco/adf-hx-content-services/services';
import { VersionContextMenuActionsService } from './version-context-menu.service';
import { MockService } from 'ng-mocks';
import { By } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatMenuHarness } from '@angular/material/menu/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { provideMockFeatureFlags } from '@alfresco/adf-core/feature-flags';
import { Subject } from 'rxjs';

describe('ManageVersionsSidebarComponent', () => {
    let component: ManageVersionsSidebarComponent;
    let fixture: ComponentFixture<ManageVersionsSidebarComponent>;
    let loader: HarnessLoader;

    const mockDocumentRouterService = {
        navigateTo: jest.fn(),
    };
    const mockDocumentVersionsService = {
        versionDeleted$: new Subject<void>(),
        versionUpdated$: new Subject<void>(),
        getCurrentDocument: jest.fn(),
        getVersions: jest.fn(),
    };
    const mockUserResolverService: UserResolverService = MockService(UserResolverService);

    const mockDocumentCopyActionService = MockService(DocumentActionService);
    const mockDocumentMoveActionService = MockService(DocumentActionService);
    const mockContentShareButtonActionService = MockService(DocumentActionService);
    const mockDeleteButtonActionService = MockService(DocumentActionService);
    const mockPermissionsButtonActionService = MockService(DocumentActionService);
    const mockSingleItemDownloadButtonActionService = MockService(DocumentActionService);
    const mockSingleItemInfoButtonActionService = MockService(DocumentActionService);
    const mockManageVersionsButtonActionService = MockService(ManageVersionsButtonActionService);
    const mockVersionContextMenuService = MockService(VersionContextMenuActionsService);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, NoopTranslateModule, MatMenuModule, ManageVersionsSidebarComponent],
            providers: [
                DatePipe,
                UserResolverPipe,
                AsyncPipe,
                { provide: UserResolverService, useValue: mockUserResolverService },
                { provide: DocumentRouterService, useValue: mockDocumentRouterService },
                { provide: DocumentVersionsService, useValue: mockDocumentVersionsService },
                { provide: MatSnackBar, useValue: { open: jest.fn() } },
                { provide: MatDialog, useValue: { open: jest.fn() } },
                {
                    provide: HXP_DOCUMENT_MOVE_ACTION_SERVICE,
                    useValue: mockDocumentMoveActionService,
                },
                {
                    provide: HXP_DOCUMENT_SHARE_ACTION_SERVICE,
                    useValue: mockContentShareButtonActionService,
                },
                {
                    provide: HXP_DOCUMENT_DELETE_ACTION_SERVICE,
                    useValue: mockDeleteButtonActionService,
                },
                {
                    provide: HXP_DOCUMENT_COPY_ACTION_SERVICE,
                    useValue: mockDocumentCopyActionService,
                },
                {
                    provide: HXP_DOCUMENT_PERMISSIONS_ACTION_SERVICE,
                    useValue: mockPermissionsButtonActionService,
                },
                {
                    provide: HXP_DOCUMENT_SINGLE_ITEM_DOWNLOAD_ACTION_SERVICE,
                    useValue: mockSingleItemDownloadButtonActionService,
                },
                {
                    provide: HXP_DOCUMENT_INFO_ACTION_SERVICE,
                    useValue: mockSingleItemInfoButtonActionService,
                },
                {
                    provide: ManageVersionsButtonActionService,
                    useValue: mockManageVersionsButtonActionService,
                },
                {
                    provide: VersionContextMenuActionsService,
                    useValue: mockVersionContextMenuService,
                },
                provideMockFeatureFlags({ 'workspace-versioning': true, 'cic-versioning-new-context-menu': false }),
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(ManageVersionsSidebarComponent);
        component = fixture.componentInstance;
        loader = TestbedHarnessEnvironment.loader(fixture);
        fixture.detectChanges();
    });

    it('should list all versions including current version of document', () => {
        component.isLoading = false;
        component.documentVersions = [jestMocks.versionSupportedDocument, ...versionsMocks];
        fixture.detectChanges();

        const records = fixture.debugElement.queryAll(By.css('.hxp-version-item'));
        const descriptionRows = fixture.debugElement.queryAll(By.css('.hxp-version-description'));

        expect(records.length).toBeGreaterThan(0);
        expect(descriptionRows[0].nativeElement.textContent.trim()).toEqual('MANAGE_VERSIONS.DIALOG.CURRENT_VERSION');
        expect(component.documentVersions.filter((version) => !version.sysver_isVersion)).toHaveLength(1);
    });

    it('should not render version description if it does not exist', () => {
        component.isLoading = false;
        const versionsWithoutDescription = versionsMocks.map((version) => {
            return { ...version, sysver_description: '' };
        });
        component.documentVersions = versionsWithoutDescription;
        fixture.detectChanges();

        const records = fixture.debugElement.query(By.css('.hxp-version-description'));
        expect(records).toBeNull();
    });

    it('should navigate to a specific version', () => {
        component.isLoading = false;
        component.documentVersions = [jestMocks.versionSupportedDocument, ...versionsMocks];
        fixture.detectChanges();

        const records = fixture.debugElement.queryAll(By.css('.hxp-version-item'));
        records[1].nativeElement.click();
        fixture.detectChanges();

        expect(mockDocumentRouterService.navigateTo).toHaveBeenCalledTimes(1);
        expect(mockDocumentRouterService.navigateTo).toHaveBeenCalledWith(component.documentVersions[1] as any);
    });

    it('should open menu with Edit and Delete options when clicked', async () => {
        component.isLoading = false;
        component.documentVersions = [jestMocks.versionSupportedDocument, ...versionsMocks];
        fixture.detectChanges();
        await fixture.whenStable();

        const menuTrigger = await loader.getHarness(MatMenuHarness.with({ triggerText: 'more_vert' }));

        await menuTrigger.open();
        expect(await menuTrigger.isOpen()).toBe(true);

        const menuItems = await menuTrigger.getItems();

        expect(menuItems.length).toBe(2);
        expect(await menuItems[0].getText()).toContain('MANAGE_VERSIONS.DIALOG.MORE_MENU.EDIT');
        expect(await menuItems[1].getText()).toContain('MANAGE_VERSIONS.DIALOG.MORE_MENU.DELETE');
    });

    it('should show skeleton loader while loading and hide it after loading completes', async () => {
        component.isLoading = true;
        fixture.detectChanges();
        await fixture.whenStable();

        const skeletonLoader = fixture.debugElement.query(By.css('hxp-panel-skeleton-loader'));
        expect(skeletonLoader).toBeTruthy();

        component.isLoading = false;
        fixture.detectChanges();
        await fixture.whenStable();

        const skeletonLoaderAfterLoad = fixture.debugElement.query(By.css('hxp-panel-skeleton-loader'));
        expect(skeletonLoaderAfterLoad).toBeNull();
    });
});
