/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { inject, Injectable } from '@angular/core';
import { ToolbarItemTypes } from '../models/toolbar';
import { TranslationService } from '@alfresco/adf-core';
import { Platform, PlatformUtil } from '../utils/platform-util';

export enum ViewerModifierKey {
    ctrlKey = 'ctrlKey',
    shiftKey = 'shiftKey',
    altKey = 'altKey',
}

export const MODIFIER_KEYS = Object.keys(ViewerModifierKey)
    .filter((key) => Number.isNaN(Number(key)))
    .map((key) => key as ViewerModifierKey);

export type ViewerShortcutCategory = 'viewer_navigation' | 'viewer_general';

export enum ViewerShortcutAction {
    LayoutChange = 'LayoutChange',
    ThumbnailViewer = 'ThumbnailViewer',

    NavigateUp = 'NavigateUp',
    NavigateDown = 'NavigateDown',
    NavigateLeft = 'NavigateLeft',
    NavigateRight = 'NavigateRight',

    NavigatePreviousPage = 'NavigatePreviousPage',
    NavigateNextPage = 'NavigateNextPage',
    NavigateFirstPage = 'NavigateFirstPage',
    NavigateLastPage = 'NavigateLastPage',

    ZoomIn = 'ZoomIn',
    ZoomOut = 'ZoomOut',

    BestFit = 'BestFit',
    Rotate = 'Rotate',
    FullScreen = 'FullScreen',

    Image = 'Image',
    Text = 'Text',

    CopyToClipboard = 'CopyToClipboard',
}

export interface ViewerShortcut {
    key: string;
    modifierKeys: ViewerModifierKey[];
    action: ViewerShortcutAction;
    category: ViewerShortcutCategory;
    toolbarItemType?: ToolbarItemTypes;
    description: string;
}

export type ViewerShortcutSummary = Record<
    string,
    Array<{
        description: string;
        keys: Array<{
            text: string;
            icon?: string;
        }>;
    }>
>;

@Injectable({
    providedIn: 'root',
})
export class ViewerShortcutService {
    private readonly translationService: TranslationService = inject(TranslationService);
    shortcuts: ViewerShortcut[] = [
        {
            key: 'l',
            modifierKeys: [ViewerModifierKey.shiftKey],
            action: ViewerShortcutAction.LayoutChange,
            category: 'viewer_general',
            toolbarItemType: ToolbarItemTypes.LayoutChange,
            description: 'VIEWER.SERVICES.SHORTCUT.LAYOUT_CHANGE',
        },
        {
            key: 't',
            modifierKeys: [ViewerModifierKey.shiftKey],
            action: ViewerShortcutAction.ThumbnailViewer,
            category: 'viewer_general',
            toolbarItemType: ToolbarItemTypes.ThumbnailViewer,
            description: 'VIEWER.SERVICES.SHORTCUT.THUMBNAIL_VIEWER',
        },
        {
            key: 'i',
            modifierKeys: [ViewerModifierKey.shiftKey],
            action: ViewerShortcutAction.Image,
            category: 'viewer_general',
            toolbarItemType: ToolbarItemTypes.LayerSelection,
            description: 'VIEWER.SERVICES.SHORTCUT.IMAGE_LAYER',
        },
        {
            key: 'w',
            modifierKeys: [ViewerModifierKey.shiftKey],
            action: ViewerShortcutAction.Text,
            category: 'viewer_general',
            toolbarItemType: ToolbarItemTypes.LayerSelection,
            description: 'VIEWER.SERVICES.SHORTCUT.TEXT_LAYER',
        },
        {
            key: 'p',
            modifierKeys: [ViewerModifierKey.shiftKey],
            action: ViewerShortcutAction.NavigatePreviousPage,
            category: 'viewer_navigation',
            toolbarItemType: ToolbarItemTypes.PageNavigation,
            description: 'VIEWER.SERVICES.SHORTCUT.NAVIGATE_PREVIOUS_PAGE',
        },
        {
            key: 'n',
            modifierKeys: [ViewerModifierKey.shiftKey],
            action: ViewerShortcutAction.NavigateNextPage,
            category: 'viewer_navigation',
            toolbarItemType: ToolbarItemTypes.PageNavigation,
            description: 'VIEWER.SERVICES.SHORTCUT.NAVIGATE_NEXT_PAGE',
        },
        {
            key: 'Home',
            modifierKeys: [],
            action: ViewerShortcutAction.NavigateFirstPage,
            category: 'viewer_navigation',
            toolbarItemType: ToolbarItemTypes.PageNavigation,
            description: 'VIEWER.SERVICES.SHORTCUT.NAVIGATE_FIRST_PAGE',
        },
        {
            key: 'End',
            modifierKeys: [],
            action: ViewerShortcutAction.NavigateLastPage,
            category: 'viewer_navigation',
            toolbarItemType: ToolbarItemTypes.PageNavigation,
            description: 'VIEWER.SERVICES.SHORTCUT.NAVIGATE_LAST_PAGE',
        },
        {
            key: 'ArrowUp',
            modifierKeys: [],
            action: ViewerShortcutAction.NavigateUp,
            category: 'viewer_navigation',
            toolbarItemType: ToolbarItemTypes.PageNavigation,
            description: 'VIEWER.SERVICES.SHORTCUT.NAVIGATE_UP',
        },
        {
            key: 'ArrowDown',
            modifierKeys: [],
            action: ViewerShortcutAction.NavigateDown,
            category: 'viewer_navigation',
            toolbarItemType: ToolbarItemTypes.PageNavigation,
            description: 'VIEWER.SERVICES.SHORTCUT.NAVIGATE_DOWN',
        },
        {
            key: 'ArrowLeft',
            modifierKeys: [],
            action: ViewerShortcutAction.NavigateLeft,
            category: 'viewer_navigation',
            toolbarItemType: ToolbarItemTypes.PageNavigation,
            description: 'VIEWER.SERVICES.SHORTCUT.NAVIGATE_LEFT',
        },
        {
            key: 'ArrowRight',
            modifierKeys: [],
            action: ViewerShortcutAction.NavigateRight,
            category: 'viewer_navigation',
            toolbarItemType: ToolbarItemTypes.PageNavigation,
            description: 'VIEWER.SERVICES.SHORTCUT.NAVIGATE_RIGHT',
        },
        {
            key: '+',
            modifierKeys: [ViewerModifierKey.shiftKey, ViewerModifierKey.altKey],
            action: ViewerShortcutAction.ZoomIn,
            category: 'viewer_general',
            toolbarItemType: ToolbarItemTypes.Zoom,
            description: 'VIEWER.SERVICES.SHORTCUT.ZOOM_IN',
        },
        {
            key: '-',
            modifierKeys: [ViewerModifierKey.shiftKey, ViewerModifierKey.altKey],
            action: ViewerShortcutAction.ZoomOut,
            category: 'viewer_general',
            toolbarItemType: ToolbarItemTypes.Zoom,
            description: 'VIEWER.SERVICES.SHORTCUT.ZOOM_OUT',
        },
        {
            key: 'r',
            modifierKeys: [ViewerModifierKey.shiftKey],
            action: ViewerShortcutAction.Rotate,
            category: 'viewer_general',
            toolbarItemType: ToolbarItemTypes.Rotate,
            description: 'VIEWER.SERVICES.SHORTCUT.ROTATE_RIGHT',
        },
        {
            key: 'f',
            modifierKeys: [ViewerModifierKey.shiftKey],
            action: ViewerShortcutAction.FullScreen,
            category: 'viewer_general',
            toolbarItemType: ToolbarItemTypes.FullScreen,
            description: 'VIEWER.SERVICES.SHORTCUT.FULL_SCREEN',
        },
        {
            key: 'c',
            modifierKeys: [ViewerModifierKey.ctrlKey],
            action: ViewerShortcutAction.CopyToClipboard,
            category: 'viewer_general',
            description: 'VIEWER.SERVICES.SHORTCUT.CLIPBOARD_COPY',
        },
    ];

    constructor() {}

    getShortcutSummary(inputText?: string) {
        const summary: ViewerShortcutSummary = {};

        for (const shortcut of this.shortcuts) {
            if (!summary[shortcut.category]) {
                summary[shortcut.category] = [];
            }

            const description = this.translationService.instant(shortcut.description);
            if (!inputText || description.toLowerCase().includes(inputText.toLowerCase())) {
                summary[shortcut.category].push({
                    description,
                    keys: [
                        ...shortcut.modifierKeys.map((modifierKey) => {
                            const text = modifierKey.replace('Key', '').toUpperCase();
                            return PlatformUtil.getPlatform() === Platform.Mac && text === 'CTRL' ? { text: 'COMMAND' } : { text };
                        }),
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

    getShortcutTooltipForAction(action: ViewerShortcutAction): string | undefined {
        const shortcut = this.shortcuts.find((sc) => sc.action === action);
        if (!shortcut) {
            return undefined;
        }
        const keys = [...shortcut.modifierKeys.map((modifierKey) => modifierKey.replace('Key', '').toUpperCase()), shortcut.key.toUpperCase()];
        return keys.join(' + ');
    }

    getShortcutIcon(eventKey: string): string | undefined {
        switch (eventKey) {
            case 'ArrowUp': {
                return 'arrow_upward';
            }
            case 'ArrowDown': {
                return 'arrow_downward';
            }
            case 'ArrowLeft': {
                return 'arrow_back';
            }
            case 'ArrowRight': {
                return 'arrow_forward';
            }
            default: {
                return undefined;
            }
        }
    }

    getShortcutForEvent(event: KeyboardEvent): ViewerShortcut | undefined {
        if (!event || !event.key) {
            return undefined;
        }

        return this.shortcuts.find((shortcut) => {
            const modifiersInEvent = MODIFIER_KEYS.filter((modifierKey) => event[modifierKey]);
            const modifiersInShortcut = shortcut.modifierKeys;

            if (event.metaKey && modifiersInEvent.length === 0 && PlatformUtil.getPlatform() === Platform.Mac) {
                modifiersInEvent.push(ViewerModifierKey.ctrlKey);
            }

            const hasKey =
                [event.code.toLowerCase(), event.key.toLowerCase()].includes(shortcut.key.toLowerCase()) ||
                (event.code.toLowerCase() === 'minus' && event.key === '_' && shortcut.key === '-');
            const noModifierMatch = modifiersInShortcut.length === 0 && modifiersInEvent.length === 0;
            const exactMatchingModifier =
                modifiersInShortcut.length === modifiersInEvent.length && modifiersInShortcut.every((m) => modifiersInEvent.includes(m));
            const hasModifierKeys = noModifierMatch || exactMatchingModifier;

            return hasKey && hasModifierKeys;
        });
    }
}
