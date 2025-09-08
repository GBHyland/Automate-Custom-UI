/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DataTableComponent, DropdownListComponent, FileProperties, ROOT_DOCUMENT } from '@alfresco-dbp/playwright/shared';
import { Page } from '@playwright/test';
import {
    MainContentContainer,
    AdfToolbarComponent,
    AdfContextMenuComponent,
    HxpDocumentViewerComponent,
    MainContentHeaderComponent,
    HxpFileUploadDialogComponent,
    HxpFileUploadSnackbarComponent,
    HxpUploadDialogComponent,
    HxpPermissionsManagementDialogContainer,
    FileActionDialog,
    HxpDocumentMoreMenuPanelComponent,
    HxpContextMenuComponent,
    HxpManageVersionsSidebarComponent,
    HxpEditVersionDialogComponent,
    HxpApplicationChromeComponent,
    SatoriHeaderComponent,
} from '../components';
import fs from 'node:fs';
import { HomePage } from './';

type ActionType = 'Copy' | 'Move' | 'Delete' | 'Share' | 'Info' | 'Download' | 'Permissions' | 'Replace file';

export class ContentBrowserPage extends HomePage {
    private static readonly defaultRepositoryId = 'default';
    private static readonly pageUrl = `/${ContentBrowserPage.defaultRepositoryId}/documents`;

    constructor(page: Page) {
        super(page, ContentBrowserPage.pageUrl);
    }

    mainContentContainer = new MainContentContainer(this.page);
    hxpDatatableBody = new DataTableComponent(this.page);
    adfToolbar = new AdfToolbarComponent(this.page);
    adfContextMenu = new AdfContextMenuComponent(this.page);
    fileActionDialog = new FileActionDialog(this.page);
    documentViewer = new HxpDocumentViewerComponent(this.page);
    mainContentHeader = new MainContentHeaderComponent(this.page);
    fileUploadDialog = new HxpFileUploadDialogComponent(this.page);
    uploadDialog = new HxpUploadDialogComponent(this.page);
    fileUploadSnackbar = new HxpFileUploadSnackbarComponent(this.page);
    permissionDialog = new HxpPermissionsManagementDialogContainer(this.page);
    dropdownListComponent = new DropdownListComponent(this.page, '.cdk-overlay-container');
    documentMoreMenuPanelComponent = new HxpDocumentMoreMenuPanelComponent(this.page);
    hxpContextMenuComponent = new HxpContextMenuComponent(this.page);
    manageVersionsSidebar = new HxpManageVersionsSidebarComponent(this.page);
    editVersionDialog = new HxpEditVersionDialogComponent(this.page);
    hxpApplicationChromeComponent = new HxpApplicationChromeComponent(this.page);
    satoriHeaderComponent = new SatoriHeaderComponent(this.page);

    private readonly dropzoneLocator = '.hxp-upload-drag-area [dropzone]';

    getUploadMenuButtonByText = (text: string) => this.dropdownListComponent.getChild('button', { hasText: text });

    async navigateToDocument(documentId: string): Promise<void> {
        await this.navigate({ query: `/${documentId}` });
    }

    async navigateToRoot(): Promise<void> {
        await this.navigateToDocument(ROOT_DOCUMENT.sys_id ?? '');
    }

    async switchLanguageTo(language: string): Promise<void> {
        await this.navigate();
        await this.satoriHeaderComponent.appHeaderActionsButton.click();
        await this.matMenuComponent.getLanguageMenu.hover();
        await this.matMenuComponent.getLanguageMenuItem(language).click();
        await this.page.waitForLoadState('networkidle');
    }

    async performToolbarAction(fileName: string, action: ActionType): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        await this.hxpDatatableBody.getCheckboxForElement(fileName).click();
        const isVisible = await this.adfToolbar.getButtonByNameLocator(action).isVisible();
        if (isVisible) {
            await this.adfToolbar.getButtonByNameLocator(action).click();
        } else {
            await this.adfToolbar.moreActionsMenuButton.click();
            await this.documentMoreMenuPanelComponent.getButtonByNameLocator(action).click();
        }
    }

    async performContextMenuAction(fileName: string, action: ActionType): Promise<void> {
        await this.page.waitForLoadState('networkidle');
        await this.hxpDatatableBody.getRowByName(fileName).click({ button: 'right' });
        await (action === 'Download'
            ? this.adfContextMenu.downloadFileFromContextMenu()
            : this.adfContextMenu.getButtonByNameLocator(action).click());
    }

    async selectFileForUpload(filePath: string): Promise<void> {
        const [fileChooser] = await Promise.all([this.page.waitForEvent('filechooser'), this.getUploadMenuButtonByText('Upload').click()]);
        await fileChooser.setFiles(filePath);
    }

    async dragAndDropFilesToUpload(files: FileProperties[]) {
        const filesData = files.map((file) => ({
            buffer: fs.readFileSync(file.path),
            fileName: file.title,
            mimeType: file.mimeType,
        }));

        await this.page.locator(this.dropzoneLocator).waitFor();

        const dataTransfer = await this.page.evaluateHandle((data) => {
            /*
             * `DataTransfer` objects hold the data that is being dragged during a drag and drop operation, and they
             * provide two properties to access the data being transferred:
             * - `DataTransfer.items` - contains a list of all of the drag data (more generic)
             * - `DataTransfer.files` - contains a list of all the local files available on the data transfer
             * More information at https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer
             *
             * The `HxpFileDraggableDirective` tries to access the data being transferred using both methods in the
             * `drop` event handler, getting the transferred files through the items property (if they exist),
             * and if not, it falls back to the files property.
             * For an unknown reason, the first method fails in e2e tests, but the second works as expected.
             * In the event handler, accessing `DataTransfer.items[x].webkitGetAsEntry()` returns null, instead of the
             * expected file. Notice that this is not consistent with what the documentation says, as the method should
             * only return null if the item is not a File.
             *
             * So, this hack consists in bypassing the access to the `DataTransfer.items` property, returning
             * an `undefined` value, leading the draggable directive to rely on the `DataTransfer.files` instead.
             *
             * Notice that we need a proper `DataTransfer` object, otherwise it will fail on `DragEventInit`,
             * trying to convert the value to a 'DataTransfer' object (it can't be a proxy or a vanilla object).
             */
            class NoItemsDataTransfer extends DataTransfer {
                addItem(item: File) {
                    super.items.add(item);
                }
                /*
                 * Returning undefined means we should use the `files` property instead of the `items` one.
                 * `this.files` contains the item added through `addItem`, but not `this.items`.
                 */
                override get items(): DataTransferItemList {
                    return undefined as any;
                }
            }

            const dt = new NoItemsDataTransfer();
            for (const file of data) {
                dt.addItem(new File([file.buffer.toString()], file.fileName, { type: file.mimeType }));
            }
            return dt;
        }, filesData);

        await this.page.dispatchEvent(this.dropzoneLocator, 'drop', { dataTransfer });
    }
}
