/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { IdpShortcut, ModifierKey, IdpShortcutAction, IDP_SCREEN_SHORTCUTS_INJECTION_TOKEN } from '@hxp/workspace-hxp/idp-services-extension/shared';

const shortcuts: IdpShortcut[] = [
    {
        key: 'z',
        modifierKeys: [ModifierKey.ctrlKey],
        action: IdpShortcutAction.Undo,
        category: 'general',
        description: 'IDP_CLASS_VERIFICATION.SHORTCUTS.UNDO',
    },
    {
        key: 'y',
        modifierKeys: [ModifierKey.ctrlKey],
        action: IdpShortcutAction.Redo,
        category: 'general',
        description: 'IDP_CLASS_VERIFICATION.SHORTCUTS.REDO',
    },
    {
        key: 'enter',
        modifierKeys: [ModifierKey.ctrlKey, ModifierKey.shiftKey],
        action: IdpShortcutAction.Save,
        category: 'general',
        description: 'EXTRACTION.VERIFICATION.TASK_ACTIONS.SAVE',
    },
    {
        key: 'enter',
        modifierKeys: [ModifierKey.ctrlKey],
        action: IdpShortcutAction.Submit,
        category: 'general',
        description: 'EXTRACTION.VERIFICATION.TASK_ACTIONS.SUBMIT',
    },

    {
        key: 'enter',
        modifierKeys: [],
        action: IdpShortcutAction.NavigateNextField,
        category: 'navigation',
        description: 'EXTRACTION.VERIFICATION.SHORTCUTS.NAVIGATE_NEXT_FIELD',
    },
    {
        key: 'page up',
        modifierKeys: [],
        action: IdpShortcutAction.NavigateUp,
        category: 'navigation',
        description: 'EXTRACTION.VERIFICATION.SHORTCUTS.NAVIGATE_PREVIOUS_TABLE_ROW',
    },
    {
        key: 'page down',
        modifierKeys: [],
        action: IdpShortcutAction.NavigateDown,
        category: 'navigation',
        description: 'EXTRACTION.VERIFICATION.SHORTCUTS.NAVIGATE_NEXT_TABLE_ROW',
    },
    {
        key: 'home',
        modifierKeys: [],
        action: IdpShortcutAction.NavigateLeft,
        category: 'navigation',
        description: 'EXTRACTION.VERIFICATION.SHORTCUTS.NAVIGATE_PREVIOUS_TABLE_COLUMN',
    },
    {
        key: 'end',
        modifierKeys: [],
        action: IdpShortcutAction.NavigateRight,
        category: 'navigation',
        description: 'EXTRACTION.VERIFICATION.SHORTCUTS.NAVIGATE_NEXT_TABLE_COLUMN',
    },
];

export const FIELD_VERIFICATION_SCREEN_SHORTCUT_PROVIDER = {
    provide: IDP_SCREEN_SHORTCUTS_INJECTION_TOKEN,
    useValue: shortcuts,
};
