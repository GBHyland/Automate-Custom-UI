/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BaseComponent } from '.';
import { Page } from '@playwright/test';

export const FormActionsButtonNames = {
    Cancel: 'Cancel',
    Save: 'Save',
    SaveAndAddNew: 'Save and add new',
} as const;

export class StudioVariablesEditorFormActions extends BaseComponent {
    private static rootElement = `.studio-variables-editor-form-actions`;

    constructor(page: Page) {
        super(page, StudioVariablesEditorFormActions.rootElement);
    }
}
