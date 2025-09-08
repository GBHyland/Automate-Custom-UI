/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent, materialLocators } from '@alfresco-dbp/playwright/shared';
import { HxpUploadPropertiesEditor } from './hxp-upload-properties-editor.component';

export class HxpUploadDialogComponent extends BaseComponent {
    static rootElement = '.hxp-workspace-upload-dialog';

    constructor(page: Page) {
        super(page, HxpUploadDialogComponent.rootElement);
    }

    propertiesEditor = new HxpUploadPropertiesEditor(this.page);

    tableRowLocator = this.getChild('hxp-workspace-upload-list adf-datatable-row');
    checkboxLocator = this.getChild(`.hxp-workspace-upload-dialog__content ${materialLocators.Checkbox.root}`);
    submitButtonLocator = this.getChild('#hxp-workspace-upload-dialog-upload');
    clearSelectionButtonLocator = this.getChild('.hxp-workspace-upload-list__toolbar__selection_reset_button');
    deleteButtonLocator = this.getChild('.hxp-workspace-upload-list__toolbar__delete_button');
    uploadListRetryButtonLocator = this.getChild('.hxp-workspace-upload-list__toolbar__retry_button');
    getUploadListFileError = (fileName: string) => this.getChild(`.hxp-workspace-upload-list__container__table__error`, { hasText: fileName });
    getTableRowFileTitle = (fileName: string) => this.getChild(`hxp-workspace-upload-list adf-datatable-row`, { hasText: fileName });
    getUploadListSelectedRowByName = (name: string | number) =>
        this.getChild(`adf-datatable-row[aria-selected="true"]`, { hasText: name.toString() });
}
