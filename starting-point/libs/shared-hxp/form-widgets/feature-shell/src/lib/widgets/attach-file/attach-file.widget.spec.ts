/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    ContentLinkModel,
    ErrorWidgetComponent,
    FormFieldModel,
    FormModel,
    FormService,
    NoopTranslateModule,
    ThumbnailService,
    ViewerComponent,
    ViewUtilService,
} from '@alfresco/adf-core';
import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MockComponents, MockProvider } from 'ng-mocks';
import { Subject, of } from 'rxjs';
import { DOCUMENT_MOCK, DOCUMENT_WITH_NO_BLOB_MOCK } from '../../mocks/document.mock';
import { FormWidgetService } from '../../services/form-widget/form-widget.service';
import { AttachFileWidgetComponent } from './attach-file.widget';
import { SharedAttachFileDialogService, SharedDownloadService } from '@hxp/shared-hxp/services';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { ButtonHarnessUtils, MenuHarnessUtils, TableHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { BlobDownloadService, DOCUMENT_SERVICE, RenditionsService } from '@alfresco/adf-hx-content-services/services';
import { provideMockFeatureFlags } from '@alfresco/adf-core/feature-flags';
import { STUDIO_HXP } from '@features';
import { mockedForm } from '../../mocks/form.mock';
import { FileSourceServiceId } from './models/file-source-service-id';
import { TranslatePipe } from '@ngx-translate/core';
import { ADF_HX_CONTENT_SERVICES_INTERNAL } from '@alfresco/adf-hx-content-services/features';

/* eslint-disable @typescript-eslint/no-unused-vars */

describe('AttachFileWidgetComponent', () => {
    let component: AttachFileWidgetComponent;
    let fixture: ComponentFixture<AttachFileWidgetComponent>;
    let openAttachFileDialogSpy: jasmine.Spy;

    let defaultFolder = false;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                TranslatePipe,
                CommonModule,
                MatIconModule,
                MatTooltipModule,
                MatTableModule,
                MatMenuModule,
                MatButtonModule,
                MatProgressBarModule,
                NoopAnimationsModule,
                NoopTranslateModule,
                AttachFileWidgetComponent,
                ...MockComponents(ErrorWidgetComponent, ViewerComponent),
            ],
            providers: [
                MockProvider(FormService, {
                    formContentClicked: new Subject<ContentLinkModel>(),
                    formEvents: new Subject(),
                    formRulesEvent: new Subject(),
                }),
                MockProvider(ThumbnailService, {
                    getMimeTypeIcon: (mimeType: string) => '',
                }),
                MockProvider(SharedDownloadService),
                MockProvider(SharedAttachFileDialogService, {
                    openDialog: () => {},
                    closeDialog: () => {},
                    downloadDocuments: () => {},
                }),
                MockProvider(DOCUMENT_SERVICE, {
                    getDocumentById: (documentId: string) => {
                        return documentId === DOCUMENT_MOCK.sys_id
                            ? of({ ...DOCUMENT_MOCK, sys_id: documentId })
                            : of({
                                  ...DOCUMENT_WITH_NO_BLOB_MOCK,
                                  sys_id: documentId,
                              });
                    },
                    getDocumentByPath: (path: string) => {
                        return path === DOCUMENT_MOCK.sys_path ? of(DOCUMENT_MOCK) : of(DOCUMENT_WITH_NO_BLOB_MOCK);
                    },
                }),
                FormWidgetService,
                provideMockFeatureFlags({
                    [STUDIO_HXP.ATTACH_FILE_WIDGET_DEFAULT_FOLDER]: defaultFolder,
                    [ADF_HX_CONTENT_SERVICES_INTERNAL.CIC_WORKSPACE_SATORI_APPLICATION_CHROME]: false,
                }),
                MockProvider(ViewUtilService),
                MockProvider(BlobDownloadService),
                MockProvider(RenditionsService),
            ],
        });

        fixture = TestBed.createComponent(AttachFileWidgetComponent);
        openAttachFileDialogSpy = spyOn(TestBed.inject(SharedAttachFileDialogService), 'openDialog');
        component = fixture.componentInstance;
        component.field = new FormFieldModel(new FormModel(), {
            id: 'fakeField',
            value: null,
            params: {
                multiple: true,
                menuOptions: { show: true, download: true, remove: true },
            },
        });

        fixture.detectChanges();
    });

    async function setFiles(value: any) {
        component.field.value = value;
        component.fieldChanged.emit(component.field);
        await fixture.whenStable();
        fixture.detectChanges();
    }

    it('should not show attach button if the field is readonly', async () => {
        component.field.readOnly = true;
        fixture.detectChanges();

        const allButtons = await ButtonHarnessUtils.getAllButtons({
            fixture,
            buttonFilters: { selector: '[id="fakeField"]' },
        });

        expect(allButtons.length).toBe(0);
    });

    it('should show attach button if the field is not readonly', async () => {
        component.field.readOnly = false;
        fixture.detectChanges();

        const attachButton = await ButtonHarnessUtils.getButton({
            fixture,
            buttonFilters: { selector: '[id="fakeField"]' },
        });

        expect(attachButton).not.toBeNull();
    });

    it('should enable attach button if multiple is true and any amount of files have been attached', async () => {
        let attachButton = await ButtonHarnessUtils.getButton({
            fixture,
            buttonFilters: { selector: '[id="fakeField"]' },
        });

        expect(await attachButton.isDisabled()).toBeFalsy();

        await setFiles([DOCUMENT_MOCK, DOCUMENT_MOCK]);
        attachButton = await ButtonHarnessUtils.getButton({
            fixture,
            buttonFilters: { selector: '[id="fakeField"]' },
        });

        expect(await attachButton.isDisabled()).toBeFalsy();
    });

    it('should enable attach button if multiple is false and no files have been attached', async () => {
        component.field.params.multiple = false;
        fixture.detectChanges();

        let attachButton = await ButtonHarnessUtils.getButton({
            fixture,
            buttonFilters: { selector: '[id="fakeField"]' },
        });

        expect(await attachButton.isDisabled()).toBeFalsy();

        await setFiles([DOCUMENT_MOCK]);

        attachButton = await ButtonHarnessUtils.getButton({
            fixture,
            buttonFilters: { selector: '[id="fakeField"]' },
        });

        expect(await attachButton.isDisabled()).toBeTruthy();
    });

    it('should not show file table if there are no files attached', async () => {
        const allTables = await TableHarnessUtils.getAllTables({
            fixture,
            tableFilters: {
                selector: '[id="table-fakeField"]',
            },
        });

        expect(allTables.length).toBe(0);
    });

    it('should show file table if there are files attached', async () => {
        await setFiles([DOCUMENT_MOCK]);

        const table = await TableHarnessUtils.getTable({
            fixture,
            tableFilters: {
                selector: '[id="table-fakeField"]',
            },
        });

        expect(table).not.toBeNull();
    });

    it('should show file table with the correct number of rows', async () => {
        await setFiles([DOCUMENT_MOCK, DOCUMENT_MOCK]);

        const table = await TableHarnessUtils.getTable({
            fixture,
            tableFilters: {
                selector: '[id="table-fakeField"]',
            },
        });
        const rows = await table.getRows();

        expect(rows.length).toBe(2);
    });

    it('should show correct title in title column', async () => {
        await setFiles([DOCUMENT_MOCK, DOCUMENT_WITH_NO_BLOB_MOCK]);

        const table = await TableHarnessUtils.getTable({
            fixture,
            tableFilters: {
                selector: '[id="table-fakeField"]',
            },
        });
        const titles = await table.getCellTextByColumnName();

        expect(titles['title'].text).toEqual([DOCUMENT_MOCK.sysfile_blob.title, DOCUMENT_WITH_NO_BLOB_MOCK.sys_title]);
    });

    it('should show correct name in name column', async () => {
        await setFiles([DOCUMENT_MOCK, DOCUMENT_WITH_NO_BLOB_MOCK]);

        const table = await TableHarnessUtils.getTable({
            fixture,
            tableFilters: {
                selector: '[id="table-fakeField"]',
            },
        });
        const names = await table.getCellTextByColumnName();

        expect(names['name'].text).toEqual([DOCUMENT_MOCK.sysfile_blob.filename, DOCUMENT_WITH_NO_BLOB_MOCK.sys_name]);
    });

    it('should show actions menu button in actions column if at least one menu option is enabled', async () => {
        await setFiles([DOCUMENT_MOCK]);

        const actionsMenuButton = await ButtonHarnessUtils.getButton({
            fixture,
            buttonFilters: {
                selector: `[id="file-${DOCUMENT_MOCK.sys_id}-option-menu"]`,
            },
        });

        expect(actionsMenuButton).not.toBeNull();
    });

    it('should not show actions menu button in actions column if no menu option is enabled', async () => {
        await setFiles([DOCUMENT_MOCK]);
        component.field.params.menuOptions = {
            show: false,
            download: false,
            remove: false,
        };
        fixture.detectChanges();

        const allButtons = await ButtonHarnessUtils.getAllButtons({
            fixture,
            buttonFilters: {
                selector: `[id="file-${DOCUMENT_MOCK.sys_id}-option-menu"]`,
            },
        });

        expect(allButtons.length).toBe(0);
    });

    it('should show remove option if remove is enabled and field is not readOnly', async () => {
        await setFiles([DOCUMENT_MOCK]);
        component.field.params.menuOptions = {
            show: true,
            download: true,
            remove: true,
        };
        component.field.readOnly = false;
        fixture.detectChanges();

        const menu = await MenuHarnessUtils.getMenu({
            fixture,
            menuFilters: {
                selector: `[id="file-${DOCUMENT_MOCK.sys_id}-option-menu"]`,
            },
        });
        await menu.open();
        const items = await menu.getItems();

        expect(items.length).toBe(3);
        expect(await items[0].getText()).toContain('FORM.FIELD.VIEW_FILE');
        expect(await items[1].getText()).toContain('FORM.FIELD.DOWNLOAD_FILE');
        expect(await items[2].getText()).toContain('FORM.FIELD.REMOVE_FILE');
    });

    it('should not show remove option if remove is enabled and field is readOnly', async () => {
        await setFiles([DOCUMENT_MOCK]);
        component.field.params.menuOptions = {
            show: true,
            download: true,
            remove: true,
        };
        component.field.readOnly = true;
        fixture.detectChanges();

        const menu = await MenuHarnessUtils.getMenu({
            fixture,
            menuFilters: {
                selector: `[id="file-${DOCUMENT_MOCK.sys_id}-option-menu"]`,
            },
        });
        await menu.open();
        const items = await menu.getItems();

        expect(items.length).toBe(2);
        expect(await items[0].getText()).toContain('FORM.FIELD.VIEW_FILE');
        expect(await items[1].getText()).toContain('FORM.FIELD.DOWNLOAD_FILE');
    });

    it('should set the selected files when the current field value is null', () => {
        setFiles(null);
        const selectionSubject$ = new Subject<Document[]>();
        spyOn<any>(component, 'openUploadFileDialog').and.returnValue(selectionSubject$);
        spyOn(component.fieldChanged, 'emit');

        component.openSelectDialog();

        selectionSubject$.next([DOCUMENT_MOCK]);

        expect(component.field.value).toEqual([DOCUMENT_MOCK]);
    });

    it('should set the selected files when the current field value is undefined', () => {
        setFiles(undefined);
        const selectionSubject$ = new Subject<Document[]>();
        spyOn<any>(component, 'openUploadFileDialog').and.returnValue(selectionSubject$);
        spyOn(component.fieldChanged, 'emit');

        component.openSelectDialog();

        selectionSubject$.next([DOCUMENT_MOCK]);

        expect(component.field.value).toEqual([DOCUMENT_MOCK]);
    });

    it('should set the selected files when the current field value is not an array', () => {
        setFiles({});
        const selectionSubject$ = new Subject<Document[]>();
        spyOn<any>(component, 'openUploadFileDialog').and.returnValue(selectionSubject$);
        spyOn(component.fieldChanged, 'emit');

        component.openSelectDialog();

        selectionSubject$.next([DOCUMENT_MOCK]);

        expect(component.field.value).toEqual([DOCUMENT_MOCK]);
    });

    it('should set the selected files without duplication the current field value is an empty array', () => {
        setFiles([]);
        const selectionSubject$ = new Subject<Document[]>();
        spyOn<any>(component, 'openUploadFileDialog').and.returnValue(selectionSubject$);
        spyOn(component.fieldChanged, 'emit');

        component.openSelectDialog();

        selectionSubject$.next([DOCUMENT_MOCK]);

        expect(component.field.value).toEqual([DOCUMENT_MOCK]);
    });

    it('should not duplicate the files when selecting an already selected file', () => {
        setFiles([DOCUMENT_MOCK]);
        const selectionSubject$ = new Subject<Document[]>();
        spyOn<any>(component, 'openUploadFileDialog').and.returnValue(selectionSubject$);
        spyOn(component.fieldChanged, 'emit');

        component.openSelectDialog();

        selectionSubject$.next([DOCUMENT_MOCK, DOCUMENT_MOCK]);

        expect(component.field.value).toEqual([DOCUMENT_MOCK]);
    });

    describe(`When the ${STUDIO_HXP.ATTACH_FILE_WIDGET_DEFAULT_FOLDER} feature is ON`, () => {
        const path = DOCUMENT_MOCK.sys_path as string;
        const stringVariable = 'stringVar';
        const contentVariableById = 'contentVarById';
        const contentVariableByPath = 'contentVarByPath';
        const fieldForm = {
            ...mockedForm.formRepresentation.formDefinition,
            processVariables: [
                {
                    id: '3e6894c4-49c2-4b51-bc7d-34dec0cbef53',
                    name: 'variables.contentVarById',
                    type: 'content',
                    model: {
                        $ref: '#/$defs/primitive/content',
                    },
                    value: {
                        uri: `hxpr:/${DOCUMENT_MOCK.sys_id}`,
                    },
                },
                {
                    id: 'fd079c5c-e502-4484-9250-c8bd51bf9365',
                    name: 'variables.contentVarByPath',
                    type: 'content',
                    model: {
                        $ref: '#/$defs/primitive/content',
                    },
                    value: {
                        uri: `hxpr:/path${DOCUMENT_MOCK.sys_path}`,
                    },
                },
            ],
        };

        beforeAll(() => {
            defaultFolder = true;
        });

        afterAll(() => {
            defaultFolder = false;
        });

        async function checkDefaultFolder() {
            component.openSelectDialog();

            const receivedPath = await openAttachFileDialogSpy.calls.first().args[0].defaultDocumentPath$.toPromise();

            expect(receivedPath).toEqual(path);
        }

        function setFieldParam(type: string, value: string, serviceId = FileSourceServiceId.ALL_FILE_SOURCES) {
            component.field.params = {
                fileSource: {
                    name: 'HxP Content and Local',
                    serviceId,
                    destinationFolderPath: {
                        type,
                        value,
                    },
                },
            } as any;
            Object.defineProperty(component.field, 'form', {
                value: fieldForm,
            });
            fixture.detectChanges();
        }

        describe('File sources', () => {
            it('should enable content and local file sources when serviceId is all', () => {
                setFieldParam('static', path, FileSourceServiceId.ALL_FILE_SOURCES);

                component.openSelectDialog();
                const data = openAttachFileDialogSpy.calls.first().args[0];

                expect(data.isLocalUploadAvailable).toBeTruthy();
                expect(data.isContentUploadAvailable).toBeTruthy();
            });

            it('should enable only content file source when serviceId is content', async () => {
                setFieldParam('static', path, FileSourceServiceId.HXP_CONTENT);

                component.openSelectDialog();
                const data = openAttachFileDialogSpy.calls.first().args[0];

                expect(data.isLocalUploadAvailable).toBeFalsy();
                expect(data.isContentUploadAvailable).toBeTruthy();
            });

            it('should enable only local file source when serviceId is local', () => {
                setFieldParam('static', path, FileSourceServiceId.HXP_LOCAL);

                component.openSelectDialog();
                const data = openAttachFileDialogSpy.calls.first().args[0];

                expect(data.isLocalUploadAvailable).toBeTruthy();
                expect(data.isContentUploadAvailable).toBeFalsy();
            });
        });

        describe('Static default folder', () => {
            beforeEach(() => {
                setFieldParam('static', path);
            });

            it('should set the proper destination folder from the static path for the attach file dialog', async () => {
                await checkDefaultFolder();
            });
        });

        describe('String variable default folder', () => {
            beforeEach(() => {
                setFieldParam('string-variable', stringVariable);
            });

            it('should set the proper destination folder from the string variable for the attach file dialog', async () => {
                await checkDefaultFolder();
            });
        });

        describe('Content variable default folder', () => {
            describe('Content reference by id', () => {
                beforeEach(() => {
                    setFieldParam('content-variable', contentVariableById);
                });

                it('should set the proper destination folder from the content variable referencing the id for the attach file dialog', async () => {
                    await checkDefaultFolder();
                });
            });
            describe('Content reference by path', () => {
                beforeEach(() => {
                    setFieldParam('content-variable', contentVariableByPath);
                });

                it('should set the proper destination folder from the content variable referencing the path for the attach file dialog', async () => {
                    await checkDefaultFolder();
                });
            });
        });
    });
});
