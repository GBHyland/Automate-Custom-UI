/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContentUploadListComponent } from './upload-list.component';
import { FileModel, FileUploadStatus } from '@hxp/workspace-hxp/shared/upload-files/feature-shell';
import { DataColumnComponent, DataColumnListComponent, DataTableComponent, NoopTranslateModule, ToolbarComponent } from '@alfresco/adf-core';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CheckboxHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { a11yReport } from '@hxp/workspace-hxp/shared/testing';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MimeTypeIconComponent } from '@alfresco/adf-hx-content-services/icons';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { generateMockUploadData, UploadDocumentModelStatus } from '@hxp/workspace-hxp/content-services-extension/shared/upload/feature-shell';
import { provideContentServicesExtensionContentBrowserFeatureShell } from '../../../../content-services-extension-content-browser-feature-shell.providers';

const EXPECTED_VIOLATIONS: jasmine.Expected<{ [violationId: string]: number }[] | undefined> = [];

describe('ContentUploadListComponent', () => {
    let component: ContentUploadListComponent;
    let fixture: ComponentFixture<ContentUploadListComponent>;

    const categorizedMockData = [...generateMockUploadData(2, 'SysFile'), ...generateMockUploadData(1, 'SysFolder')];

    const getUploadLists = () => fixture.debugElement.queryAll(By.css('.hxp-workspace-upload-list__container__table'));

    const getUploadListTableComponents = (uploadList: DebugElement) => {
        return {
            header: uploadList.query(By.css('.hxp-workspace-upload-list__container__table__header')),
            table: uploadList.query(By.css('adf-datatable')),
            rows: uploadList.queryAll(By.css('.adf-datatable-body .adf-datatable-row')),
        };
    };

    const getUploadListToolbarComponents = () => {
        return {
            deleteSelectionButton: fixture.debugElement.query(By.css('.hxp-workspace-upload-list__toolbar__delete_button')),
            retryUploadButton: fixture.debugElement.query(By.css('.hxp-workspace-upload-list__toolbar__retry_button')),
            resetSelectionButton: fixture.debugElement.query(By.css('.hxp-workspace-upload-list__toolbar__selection_reset_button')),
            selectionPanel: fixture.debugElement.query(By.css('.hxp-workspace-upload-list__toolbar__selection')),
            selectionCount: fixture.debugElement.query(By.css('.hxp-workspace-upload-list__toolbar__selection_count')),
        };
    };

    const getUploadTableCheckboxes = async (filteredChecked: boolean) => {
        return CheckboxHarnessUtils.getAllCheckboxes({
            fixture,
            checkboxFilters: {
                checked: filteredChecked,
            },
        });
    };

    const getRowComponents = (row: DebugElement) => {
        return {
            progressBar: row.query(By.css('[data-automation-id="upload-progress-bar"]')),
            progressLabel: row.query(By.css('.hxp-workspace-upload-list__container__table__loading-column__progress')),
            mimetypeIcon: row.query(By.css('hxp-mime-type-icon')),
            columns: {
                loading: row.query(By.css('.hxp-workspace-upload-list__container__table__loading-column')),
                title: row.query(By.css('.hxp-workspace-upload-list__container__table__title-column__title')),
            },
        };
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                CommonModule,
                NoopAnimationsModule,
                NoopTranslateModule,
                MimeTypeIconComponent,
                ToolbarComponent,
                DataTableComponent,
                DataColumnComponent,
                DataColumnListComponent,
                MatTooltipModule,
                MatExpansionModule,
                MatIconModule,
                MatProgressBarModule,
                ContentUploadListComponent,
            ],
            providers: [provideContentServicesExtensionContentBrowserFeatureShell()],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ContentUploadListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should not render any upload list if no data is provided', () => {
        fixture.componentInstance.data = [];
        const uploadLists = getUploadLists();

        expect(uploadLists).toHaveSize(0);
    });

    it('should render uncategorized upload list on data changes', () => {
        component.data = generateMockUploadData(1, '');
        component.ngOnChanges();
        fixture.detectChanges();

        const uploadLists = getUploadLists();

        expect(uploadLists).toHaveSize(1);

        const uncategorizedUploadList = uploadLists[0];
        const { header, table, rows } = getUploadListTableComponents(uncategorizedUploadList);

        expect(header.nativeElement.textContent.trim()).toBe('FILE_UPLOAD.LIST.HEADER.UNASSIGNED_DOCUMENT_CATEGORY');
        expect(table.nativeElement.getAttribute('id')).toBe('table-');
        expect(rows).toHaveSize(1);
    });

    it('should render multiple upload lists on data changes based on document categories', () => {
        component.data = categorizedMockData;
        component.ngOnChanges();
        fixture.detectChanges();

        const uploadLists = getUploadLists();

        expect(uploadLists).toHaveSize(2);

        let categorizedUploadList = uploadLists[0];
        let { header, table, rows } = getUploadListTableComponents(categorizedUploadList);

        expect(header.nativeElement.textContent.trim()).toBe('SysFile');
        expect(table.nativeElement.getAttribute('id')).toBe('table-SysFile');
        expect(rows).toHaveSize(2);

        categorizedUploadList = uploadLists[1];
        ({ header, table, rows } = getUploadListTableComponents(categorizedUploadList));

        expect(header.nativeElement.textContent.trim()).toBe('SysFolder');
        expect(table.nativeElement.getAttribute('id')).toBe('table-SysFolder');
        expect(rows).toHaveSize(1);
    });

    it('should render toolbar when uploads are selected', async () => {
        component.data = categorizedMockData;
        component.ngOnChanges();
        fixture.detectChanges();

        let { deleteSelectionButton, resetSelectionButton, selectionPanel, selectionCount } = getUploadListToolbarComponents();

        expect(selectionPanel).toBeFalsy();
        expect(resetSelectionButton).toBeFalsy();
        expect(deleteSelectionButton).toBeFalsy();
        expect(selectionCount).toBeFalsy();

        const uploadLists = getUploadLists();

        expect(uploadLists).toHaveSize(2);

        let checkboxList = await getUploadTableCheckboxes(false);

        expect(checkboxList.length).toBe(5);

        await checkboxList[1].check();
        await checkboxList[3].check();

        checkboxList = await getUploadTableCheckboxes(true);

        expect(checkboxList.length).toBe(3);

        ({ deleteSelectionButton, resetSelectionButton, selectionPanel, selectionCount } = getUploadListToolbarComponents());

        expect(selectionPanel).toBeTruthy();
        expect(resetSelectionButton).toBeTruthy();
        expect(selectionCount).toBeTruthy();
        expect(selectionCount.nativeElement.textContent.trim()).toBe('2 APP.TOOLBAR.SELECTED');
    });

    it('should select uploads from different categories', async () => {
        component.data = categorizedMockData;
        component.ngOnChanges();
        fixture.detectChanges();

        const uploadLists = getUploadLists();

        expect(uploadLists).toHaveSize(2);

        let checkboxList = await getUploadTableCheckboxes(false);

        expect(checkboxList.length).toBe(5);

        await checkboxList[1].check();
        await checkboxList[3].check();

        checkboxList = await getUploadTableCheckboxes(true);

        expect(checkboxList.length).toBe(3);

        let uploadList = uploadLists[0];
        let { header, table, rows } = getUploadListTableComponents(uploadList);

        expect(header.nativeElement.textContent.trim()).toBe('SysFile');
        expect(table.nativeElement.getAttribute('id')).toBe('table-SysFile');
        expect(rows).toHaveSize(2);
        expect(table.componentInstance.selection).toHaveSize(1);

        uploadList = uploadLists[1];
        ({ header, table, rows } = getUploadListTableComponents(uploadList));

        expect(header.nativeElement.textContent.trim()).toBe('SysFolder');
        expect(table.nativeElement.getAttribute('id')).toBe('table-SysFolder');
        expect(rows).toHaveSize(1);
        expect(table.componentInstance.selection).toHaveSize(1);
    });

    it('should delete selected uploads', async () => {
        component.data = categorizedMockData;
        component.ngOnChanges();
        fixture.detectChanges();

        let { deleteSelectionButton } = getUploadListToolbarComponents();

        expect(deleteSelectionButton).toBeFalsy();

        const uploadLists = getUploadLists();

        expect(uploadLists).toHaveSize(2);

        let checkboxList = await getUploadTableCheckboxes(false);

        expect(checkboxList.length).toBe(5);

        await checkboxList[1].check();
        await checkboxList[3].check();

        checkboxList = await getUploadTableCheckboxes(true);

        expect(checkboxList.length).toBe(3);

        ({ deleteSelectionButton } = getUploadListToolbarComponents());

        expect(deleteSelectionButton).toBeTruthy();

        component.itemsDeleted.subscribe((items) => {
            expect(items).toBeTruthy();
            expect(items.length).toBe(2);
        });

        component.itemsSelected.subscribe((items) => {
            expect(items).toBeFalsy();
        });

        deleteSelectionButton.nativeElement.click();
        fixture.detectChanges();
    });

    it('should clear selection', async () => {
        component.data = categorizedMockData;
        component.ngOnChanges();
        fixture.detectChanges();

        let { resetSelectionButton, selectionPanel } = getUploadListToolbarComponents();

        expect(resetSelectionButton).toBeFalsy();
        expect(selectionPanel).toBeFalsy();

        const uploadLists = getUploadLists();

        expect(uploadLists).toHaveSize(2);

        let checkboxList = await getUploadTableCheckboxes(false);

        expect(checkboxList.length).toBe(5);

        await checkboxList[1].check();
        await checkboxList[3].check();

        checkboxList = await getUploadTableCheckboxes(true);

        expect(checkboxList.length).toBe(3);

        ({ resetSelectionButton } = getUploadListToolbarComponents());

        expect(resetSelectionButton).toBeTruthy();

        resetSelectionButton.nativeElement.click();
        fixture.detectChanges();

        ({ resetSelectionButton, selectionPanel } = getUploadListToolbarComponents());
        checkboxList = await getUploadTableCheckboxes(true);

        expect(resetSelectionButton).toBeFalsy();
        expect(checkboxList.length).toBe(0);
        expect(selectionPanel).toBeFalsy();
    });

    it('should emit selected items on row selection', async () => {
        component.data = categorizedMockData;
        component.ngOnChanges();
        fixture.detectChanges();

        const uploadLists = getUploadLists();

        expect(uploadLists).toHaveSize(2);

        const checkboxList = await getUploadTableCheckboxes(false);

        expect(checkboxList.length).toBe(5);

        component.itemsSelected.subscribe((items) => {
            expect(items).toBeTruthy();
            expect(items.length).toBe(2);
        });

        await checkboxList[0].check();
        fixture.detectChanges();
    });

    it('should handle item unselect', async () => {
        component.data = categorizedMockData;
        component.ngOnChanges();
        fixture.detectChanges();

        const uploadLists = getUploadLists();

        expect(uploadLists).toHaveSize(2);

        let checkboxList = await getUploadTableCheckboxes(false);

        expect(checkboxList.length).toBe(5);

        await checkboxList[1].check();
        await checkboxList[3].check();

        checkboxList = await getUploadTableCheckboxes(true);

        expect(checkboxList.length).toBe(3);

        component.itemsSelected.subscribe((items) => {
            expect(items).toBeTruthy();
            expect(items.length).toBe(2);
        });

        await checkboxList[0].check();
    });

    it('should display file upload progress', () => {
        const size = 1_000_000;
        const data = [
            {
                fileModel: new FileModel({ name: 'bigFile.png', size } as File),
                documentModel: {
                    status: UploadDocumentModelStatus.PENDING,
                    document: {
                        sys_primaryType: 'DocumentCategory1',
                        sys_title: 'Document 1',
                    },
                },
            },
        ];

        component.data = data;
        component.ngOnChanges();
        fixture.detectChanges();

        const uploadLists = getUploadLists();

        expect(uploadLists).toHaveSize(1);

        const { rows } = getUploadListTableComponents(uploadLists[0]);

        expect(rows).toHaveSize(1);

        let { progressBar, progressLabel, mimetypeIcon } = getRowComponents(rows[0]);

        expect(progressBar).toBeTruthy();
        expect(progressLabel).toBeFalsy();
        expect(mimetypeIcon).toBeTruthy(); // icon is displayed when upload is pending or completed
        expect(progressBar.componentInstance.value).toBe(0);

        data[0].fileModel.status = FileUploadStatus.Progress;
        data[0].fileModel.progress = {
            loaded: size / 2,
            total: size,
            percent: 50,
            bytes: size / 2,
            lengthComputable: true,
        };
        fixture.detectChanges();

        ({ progressBar, progressLabel, mimetypeIcon } = getRowComponents(rows[0]));

        expect(mimetypeIcon).toBeFalsy();
        expect(progressLabel).toBeTruthy();
        expect(progressLabel.nativeElement.textContent.trim()).toBe('50%');
        expect(progressBar.componentInstance.value).toBe(50);

        data[0].fileModel.status = FileUploadStatus.Progress;
        data[0].fileModel.progress = {
            loaded: size,
            total: size,
            percent: 100,
            bytes: size,
            lengthComputable: true,
        };
        fixture.detectChanges();

        ({ progressBar, progressLabel, mimetypeIcon } = getRowComponents(rows[0]));

        expect(progressLabel).toBeTruthy();
        expect(progressLabel.nativeElement.textContent.trim()).toBe('100%');
        expect(mimetypeIcon).toBeFalsy();
        expect(progressBar.componentInstance.value).toBe(100);

        let progressBarStyle = window.getComputedStyle(progressBar.nativeElement);

        expect(progressBarStyle.visibility).not.toBe('hidden');

        data[0].fileModel.status = FileUploadStatus.Complete;
        fixture.detectChanges();

        ({ progressBar, progressLabel, mimetypeIcon } = getRowComponents(rows[0]));

        expect(progressLabel).toBeFalsy();
        expect(mimetypeIcon).toBeTruthy();

        progressBarStyle = window.getComputedStyle(progressBar.nativeElement);

        expect(progressBarStyle.visibility).toBe('hidden');
    });

    it('should display upload error', () => {
        const data = [
            {
                fileModel: new FileModel({
                    name: 'bigFile.png',
                    size: 1_000_000,
                } as File),
                documentModel: {
                    status: UploadDocumentModelStatus.PENDING,
                    document: {
                        sys_primaryType: 'DocumentCategory1',
                        sys_title: 'Document 1',
                    },
                },
            },
        ];

        component.data = data;
        component.ngOnChanges();
        fixture.detectChanges();

        const uploadLists = getUploadLists();

        expect(uploadLists).toHaveSize(1);

        const { rows } = getUploadListTableComponents(uploadLists[0]);

        expect(rows).toHaveSize(1);

        let { loading, title } = getRowComponents(rows[0]).columns;

        expect(loading).toBeTruthy();
        expect(title).toBeTruthy();
        expect(title.nativeElement.classList.contains('hxp-workspace-upload-list__container__table__error')).toBe(false);

        let errorIcon = loading.query(By.css('.hxp-workspace-upload-list__container__table__error'));

        expect(errorIcon).toBeFalsy();

        data[0].fileModel.status = FileUploadStatus.Error;
        fixture.detectChanges();

        ({ loading, title } = getRowComponents(rows[0]).columns);

        expect(loading).toBeTruthy();
        expect(title).toBeTruthy();
        expect(title.nativeElement.classList.contains('hxp-workspace-upload-list__container__table__error')).toBe(true);

        errorIcon = loading.query(By.css('.hxp-workspace-upload-list__container__table__error'));

        expect(errorIcon).toBeTruthy();
    });

    it('should retry failed uploads', async () => {
        const data = generateMockUploadData(2, 'SysFile');
        component.data = data;
        component.ngOnChanges();
        fixture.detectChanges();

        const uploadLists = getUploadLists();

        expect(uploadLists).toHaveSize(1);

        let { retryUploadButton } = getUploadListToolbarComponents();

        expect(retryUploadButton).toBeFalsy();

        let checkboxList = await getUploadTableCheckboxes(false);

        expect(checkboxList.length).toBe(3);

        await checkboxList[1].check();
        fixture.detectChanges();

        checkboxList = await getUploadTableCheckboxes(true);

        expect(checkboxList.length).toBe(1);

        ({ retryUploadButton } = getUploadListToolbarComponents());

        expect(retryUploadButton).toBeFalsy();

        data[0].fileModel.status = FileUploadStatus.Error;
        fixture.detectChanges();

        ({ retryUploadButton } = getUploadListToolbarComponents());

        expect(retryUploadButton).toBeTruthy();

        component.uploadRetry.subscribe((items) => {
            expect(items).toBeTruthy();
            expect(items.length).toBe(1);

            data[0].fileModel.status = FileUploadStatus.Complete;
            fixture.detectChanges();
        });

        retryUploadButton.nativeElement.click();
        fixture.detectChanges();

        ({ retryUploadButton } = getUploadListToolbarComponents());

        expect(retryUploadButton).toBeFalsy();
    });

    it('should pass accessibility checks', async () => {
        component.data = categorizedMockData;
        const res = await a11yReport('.hxp-workspace-upload-list');

        expect(res?.violations).toEqual(EXPECTED_VIOLATIONS);
    });
});
