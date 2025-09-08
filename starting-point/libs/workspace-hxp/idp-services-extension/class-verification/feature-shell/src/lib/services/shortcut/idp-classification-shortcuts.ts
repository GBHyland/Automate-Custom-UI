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
        key: 'a',
        modifierKeys: [ModifierKey.ctrlKey],
        action: IdpShortcutAction.SelectAllContextOnly,
        category: 'selection',
        description: 'IDP_CLASS_VERIFICATION.SHORTCUTS.SELECT_ALL_CONTEXT_ONLY',
    },
    {
        key: 'a',
        modifierKeys: [ModifierKey.ctrlKey, ModifierKey.shiftKey],
        action: IdpShortcutAction.SelectAllContextAll,
        category: 'selection',
        description: 'IDP_CLASS_VERIFICATION.SHORTCUTS.SELECT_ALL',
    },
    {
        key: 'Home',
        modifierKeys: [ModifierKey.shiftKey],
        action: IdpShortcutAction.SelectAllUntilFirstContextOnly,
        category: 'navigation_and_selection',
        description: 'IDP_CLASS_VERIFICATION.SHORTCUTS.SELECT_ALL_UNTIL_START_CONTEXT_ONLY',
    },
    {
        key: 'End',
        modifierKeys: [ModifierKey.shiftKey],
        action: IdpShortcutAction.SelectAllUntilLastContextOnly,
        category: 'navigation_and_selection',
        description: 'IDP_CLASS_VERIFICATION.SHORTCUTS.SELECT_ALL_UNTIL_END_CONTEXT_ONLY',
    },
    {
        key: 'Home',
        modifierKeys: [ModifierKey.shiftKey, ModifierKey.ctrlKey],
        action: IdpShortcutAction.SelectAllUntilFirstContextAll,
        category: 'navigation_and_selection',
        description: 'IDP_CLASS_VERIFICATION.SHORTCUTS.SELECT_ALL_UNTIL_START',
    },
    {
        key: 'End',
        modifierKeys: [ModifierKey.shiftKey, ModifierKey.ctrlKey],
        action: IdpShortcutAction.SelectAllUntilLastContextAll,
        category: 'navigation_and_selection',
        description: 'IDP_CLASS_VERIFICATION.SHORTCUTS.SELECT_ALL_UNTIL_END',
    },
    {
        key: 'Home',
        modifierKeys: [ModifierKey.ctrlKey],
        action: IdpShortcutAction.NavigateFirstContextAll,
        category: 'navigation',
        description: 'IDP_CLASS_VERIFICATION.SHORTCUTS.NAVIGATE_FIRST',
    },
    {
        key: 'End',
        modifierKeys: [ModifierKey.ctrlKey],
        action: IdpShortcutAction.NavigateLastContextAll,
        category: 'navigation',
        description: 'IDP_CLASS_VERIFICATION.SHORTCUTS.NAVIGATE_END',
    },
    {
        key: 'Home',
        modifierKeys: [],
        action: IdpShortcutAction.NavigateFirstContextOnly,
        category: 'navigation',
        description: 'IDP_CLASS_VERIFICATION.SHORTCUTS.NAVIGATE_FIRST_CONTEXT_ONLY',
    },
    {
        key: 'End',
        modifierKeys: [],
        action: IdpShortcutAction.NavigateLastContextOnly,
        category: 'navigation',
        description: 'IDP_CLASS_VERIFICATION.SHORTCUTS.NAVIGATE_END_CONTEXT_ONLY',
    },
    {
        key: 'ArrowUp',
        modifierKeys: [ModifierKey.shiftKey],
        action: IdpShortcutAction.NavigateSelectUp,
        category: 'navigation_and_selection',
        description: 'IDP_CLASS_VERIFICATION.SHORTCUTS.NAVIGATE_SELECT_UP',
    },
    {
        key: 'ArrowDown',
        modifierKeys: [ModifierKey.shiftKey],
        action: IdpShortcutAction.NavigateSelectDown,
        category: 'navigation_and_selection',
        description: 'IDP_CLASS_VERIFICATION.SHORTCUTS.NAVIGATE_SELECT_DOWN',
    },
    {
        key: 'ArrowUp',
        modifierKeys: [],
        action: IdpShortcutAction.NavigateUp,
        category: 'navigation',
        description: 'IDP_CLASS_VERIFICATION.SHORTCUTS.NAVIGATE_UP',
    },
    {
        key: 'ArrowDown',
        modifierKeys: [],
        action: IdpShortcutAction.NavigateDown,
        category: 'navigation',
        description: 'IDP_CLASS_VERIFICATION.SHORTCUTS.NAVIGATE_DOWN',
    },
    {
        key: 'ArrowUp',
        modifierKeys: [ModifierKey.ctrlKey],
        action: IdpShortcutAction.NavigateFirstContextOnly,
        category: 'navigation',
        description: 'IDP_CLASS_VERIFICATION.SHORTCUTS.NAVIGATE_TOP_CONTEXT_ONLY',
    },
    {
        key: 'ArrowDown',
        modifierKeys: [ModifierKey.ctrlKey],
        action: IdpShortcutAction.NavigateLastContextOnly,
        category: 'navigation',
        description: 'IDP_CLASS_VERIFICATION.SHORTCUTS.NAVIGATE_BOTTOM_CONTEXT_ONLY',
    },
    {
        key: 'Escape',
        modifierKeys: [],
        action: IdpShortcutAction.Collapse,
        category: 'navigation',
        description: 'IDP_CLASS_VERIFICATION.SHORTCUTS.COLLAPSE',
    },
    {
        key: 'ArrowUp',
        modifierKeys: [ModifierKey.altKey],
        action: IdpShortcutAction.NavigatePrevClass,
        category: 'navigation',
        description: 'IDP_CLASS_VERIFICATION.SHORTCUTS.NAVIGATE_PREV_CLASS',
    },
    {
        key: 'ArrowDown',
        modifierKeys: [ModifierKey.altKey],
        action: IdpShortcutAction.NavigateNextClass,
        category: 'navigation',
        description: 'IDP_CLASS_VERIFICATION.SHORTCUTS.NAVIGATE_NEXT_CLASS',
    },
    {
        key: 'Enter',
        modifierKeys: [],
        action: IdpShortcutAction.Toggle,
        category: 'navigation',
        description: 'IDP_CLASS_VERIFICATION.SHORTCUTS.TOGGLE_EXPAND_COLLAPSE',
    },
    {
        key: 's',
        modifierKeys: [],
        action: IdpShortcutAction.PageSplit,
        category: 'document_operation',
        description: 'IDP_CLASS_VERIFICATION.SHORTCUTS.PAGE_SPLIT',
    },
    {
        key: 's',
        modifierKeys: [ModifierKey.shiftKey],
        action: IdpShortcutAction.PageSplitAllAbove,
        category: 'document_operation',
        description: 'IDP_CLASS_VERIFICATION.SHORTCUTS.PAGE_SPLIT_ALL_ABOVE',
    },
    {
        key: 'm',
        modifierKeys: [],
        action: IdpShortcutAction.PageMerge,
        category: 'document_operation',
        description: 'IDP_CLASS_VERIFICATION.SHORTCUTS.PAGE_MERGE',
    },
    {
        key: 'delete',
        modifierKeys: [ModifierKey.shiftKey],
        action: IdpShortcutAction.PageDelete,
        category: 'document_operation',
        description: 'IDP_CLASS_VERIFICATION.SHORTCUTS.PAGE_DELETE',
    },
    {
        key: 'Space',
        modifierKeys: [ModifierKey.shiftKey],
        action: IdpShortcutAction.ChangeClass,
        category: 'document_operation',
        description: 'IDP_CLASS_VERIFICATION.SHORTCUTS.CHANGE_CLASS',
    },
    {
        key: 'i',
        modifierKeys: [ModifierKey.shiftKey],
        action: IdpShortcutAction.IssueOnlyFilter,
        category: 'general',
        description: 'IDP_CLASS_VERIFICATION.SHORTCUTS.ISSUE_ONLY_FILTER',
    },
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
        key: 'r',
        modifierKeys: [ModifierKey.shiftKey],
        action: IdpShortcutAction.DocumentReject,
        category: 'general',
        description: 'IDP_CLASS_VERIFICATION.SHORTCUTS.DOCUMENT_REJECT',
    },
];

export const CLASS_VERIFICATION_SCREEN_SHORTCUT_PROVIDER = {
    provide: IDP_SCREEN_SHORTCUTS_INJECTION_TOKEN,
    useValue: shortcuts,
};
