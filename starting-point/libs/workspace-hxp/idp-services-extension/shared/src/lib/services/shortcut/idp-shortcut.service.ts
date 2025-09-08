/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Inject, Injectable, InjectionToken } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export enum ModifierKey {
    ctrlKey = 'ctrlKey',
    shiftKey = 'shiftKey',
    altKey = 'altKey',
}

export const MODIFIER_KEYS = Object.keys(ModifierKey)
    .filter((key) => Number.isNaN(Number(key)))
    .map((key) => key as ModifierKey);

export type IdpShortcutCategory = 'navigation' | 'selection' | 'navigation_and_selection' | 'document_operation' | 'general';

export enum IdpShortcutAction {
    SelectAllContextOnly = 'SelectAllContextOnly',
    SelectAllContextAll = 'SelectAllContextAll',
    SelectAllUntilFirstContextOnly = 'SelectAllUntilFirstContextOnly',
    SelectAllUntilLastContextOnly = 'SelectAllUntilLastContextOnly',
    SelectAllUntilFirstContextAll = 'SelectAllUntilFirstContextAll',
    SelectAllUntilLastContextAll = 'SelectAllUntilLastContextAll',
    NavigateSelectUp = 'NavigateSelectUp',
    NavigateSelectDown = 'NavigateSelectDown',

    NavigateUp = 'NavigateUp',
    NavigateDown = 'NavigateDown',
    NavigateLeft = 'NavigateLeft',
    NavigateRight = 'NavigateRight',
    NavigateFirstContextOnly = 'NavigateFirstContextOnly',
    NavigateLastContextOnly = 'NavigateLastContextOnly',
    NavigateFirstContextAll = 'NavigateFirstContextAll',
    NavigateLastContextAll = 'NavigateLastContextAll',

    Toggle = 'Toggle',
    Collapse = 'Collapse',

    DocumentReject = 'DocumentReject',
    ChangeClass = 'ChangeClass',
    PageSplit = 'PageSplit',
    PageSplitAllAbove = 'PageSplitAllAbove',
    PageMerge = 'PageMerge',
    PageDelete = 'PageDelete',

    NavigatePrevClass = 'NavigatePrevClass',
    NavigateNextClass = 'NavigateNextClass',

    NavigateFirstPage = 'NavigateFirstPage',
    NavigateLastPage = 'NavigateLastPage',

    NavigateNextField = 'NavigateNextField',
    NavigatePrevField = 'NavigatePrevField',

    IssueOnlyFilter = 'IssueOnlyFilter',
    Undo = 'Undo',
    Redo = 'Redo',
    Save = 'Save',
    Submit = 'Submit',
}

export interface IdpShortcut {
    key: string;
    modifierKeys: ModifierKey[];
    action: IdpShortcutAction;
    category: IdpShortcutCategory;
    description: string;
}

export type IdpShortcutSummary = Record<
    string,
    Array<{
        description: string;
        keys: Array<{
            text: string;
            icon?: string;
        }>;
    }>
>;

export const IDP_SCREEN_SHORTCUTS_INJECTION_TOKEN = new InjectionToken<IdpShortcut[]>('IDP_SCREEN_SHORTCUTS');

@Injectable()
export class IdpShortcutService {
    constructor(
        @Inject(IDP_SCREEN_SHORTCUTS_INJECTION_TOKEN) private readonly shortcuts: IdpShortcut[],
        private readonly translateService: TranslateService
    ) {}

    getShortcutSummary(inputText?: string): IdpShortcutSummary {
        const summary: IdpShortcutSummary = {};
        for (const shortcut of this.shortcuts) {
            if (!summary[shortcut.category]) {
                summary[shortcut.category] = [];
            }

            const description = this.translateService.instant(shortcut.description);

            if (!inputText || description.toLowerCase().includes(inputText.toLowerCase())) {
                summary[shortcut.category].push({
                    description,
                    keys: [
                        ...shortcut.modifierKeys.map((modifierKey) => ({
                            text: modifierKey.replace('Key', ''),
                        })),
                        {
                            text: shortcut.key,
                            icon: this.getShortcutIcon(shortcut.key),
                        },
                    ],
                });
            }
        }
        return summary;
    }

    getFullTooltipForAction(action: IdpShortcutAction): string | undefined {
        const shortcut = this.shortcuts.find((s) => s.action === action);
        if (!shortcut) {
            return undefined;
        }
        const shortcutTooltip = this.getShortcutTooltipForAction(action);
        const shortcutPostfix = shortcutTooltip ? ` (${shortcutTooltip})` : '';
        return this.translateService.instant(shortcut.description) + shortcutPostfix;
    }

    getShortcutTooltipForAction(action: IdpShortcutAction): string | undefined {
        const shortcut = this.shortcuts.find((s) => s.action === action);
        if (!shortcut) {
            return undefined;
        }
        const keys = [...shortcut.modifierKeys.map((modifierKey) => modifierKey.replace('Key', '').toUpperCase()), shortcut.key.toUpperCase()];
        return keys.join(' + ');
    }

    getShortcutIcon(eventKey: string): string | undefined {
        switch (eventKey) {
            case 'ArrowUp':
            case 'ArrowDown':
            case 'ArrowRight':
            case 'ArrowLeft': {
                return eventKey.toLocaleLowerCase().replace('arrow', 'keyboard_arrow_');
            }
            default: {
                return undefined;
            }
        }
    }

    getShortcutForEvent(event: KeyboardEvent): IdpShortcut | undefined {
        if (!event || !event.key) {
            return undefined;
        }

        return this.shortcuts.find((shortcut) => {
            const modifiersInEvent = MODIFIER_KEYS.filter((modifierKey) => event[modifierKey] || (modifierKey === 'ctrlKey' && event.metaKey));
            const modifiersInShortcut = shortcut.modifierKeys;

            const hasKey = [event.code.toLowerCase(), event.key.toLowerCase()].includes(shortcut.key.toLowerCase());
            const noModifierMatch = modifiersInShortcut.length === 0 && modifiersInEvent.length === 0;
            const exactMatchingModifier =
                modifiersInShortcut.length === modifiersInEvent.length && modifiersInShortcut.every((m) => modifiersInEvent.includes(m));
            const hasModifierKeys = noModifierMatch || exactMatchingModifier;

            return hasKey && hasModifierKeys;
        });
    }
}
