/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NoopTranslateModule, NoopTranslationService } from '@alfresco/adf-core';
import { TestBed } from '@angular/core/testing';
import { ViewerShortcutService, ViewerShortcutAction, ViewerModifierKey } from './viewer-shortcut.service';
import { Platform, PlatformUtil } from '../utils/platform-util';

describe('ViewerShortcutService', () => {
    let service: ViewerShortcutService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule],
            providers: [ViewerShortcutService, NoopTranslationService],
        });

        service = TestBed.inject(ViewerShortcutService);
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return shortcut summary', () => {
        const summary = service.getShortcutSummary();

        expect(summary['viewer_general'].length).toBeGreaterThan(0);
        expect(summary['viewer_navigation'].length).toBeGreaterThan(0);
    });

    it('should return shortcut tooltip for action', () => {
        const tooltip = service.getShortcutTooltipForAction(ViewerShortcutAction.LayoutChange);
        expect(tooltip).toBe('SHIFT + L');
    });

    it('should return undefined for non-existing action', () => {
        const tooltip = service.getShortcutTooltipForAction('NonExistingAction' as ViewerShortcutAction);
        expect(tooltip).toBeUndefined();
    });

    it('should return shortcut for event', () => {
        const event = new KeyboardEvent('keydown', { key: 'l', shiftKey: true });
        const shortcut = service.getShortcutForEvent(event);
        expect(shortcut?.action).toBe(ViewerShortcutAction.LayoutChange);
    });

    it('should return proper action for the text layer shortcut', () => {
        const event = new KeyboardEvent('keydown', { key: 'w', shiftKey: true });
        const shortcut = service.getShortcutForEvent(event);
        expect(shortcut?.action).toBe(ViewerShortcutAction.Text);
    });

    it('should return proper action for the image layer shortcut', () => {
        const event = new KeyboardEvent('keydown', { key: 'i', shiftKey: true });
        const shortcut = service.getShortcutForEvent(event);
        expect(shortcut?.action).toBe(ViewerShortcutAction.Image);
    });

    it('should return undefined for non-matching event', () => {
        const event = new KeyboardEvent('keydown', { key: 'x', shiftKey: true });
        const shortcut = service.getShortcutForEvent(event);
        expect(shortcut).toBeUndefined();
    });

    it('should return correct icon for arrow keys', () => {
        expect(service.getShortcutIcon('ArrowUp')).toBe('arrow_upward');
        expect(service.getShortcutIcon('ArrowDown')).toBe('arrow_downward');
        expect(service.getShortcutIcon('ArrowLeft')).toBe('arrow_back');
        expect(service.getShortcutIcon('ArrowRight')).toBe('arrow_forward');
    });

    it('should return undefined for non-arrow keys', () => {
        expect(service.getShortcutIcon('a')).toBeUndefined();
    });

    it('should not replace CTRL with COMMAND for Windows', () => {
        spyOn(PlatformUtil, 'getPlatform').and.returnValue(Platform.Windows);

        service.shortcuts = [
            {
                key: 'c',
                modifierKeys: [ViewerModifierKey.ctrlKey],
                action: ViewerShortcutAction.CopyToClipboard,
                category: 'viewer_general',
                description: 'VIEWER.SERVICES.SHORTCUT.CLIPBOARD_COPY',
            },
        ];
        spyOn(TestBed.inject(NoopTranslationService), 'instant').and.returnValue('Copy');

        const summary = service.getShortcutSummary();
        expect(summary['viewer_general'][0].keys[0].text).not.toBe('COMMAND');
        expect(summary['viewer_general'][0].keys[0].text).toBe('CTRL');
    });

    it('should replace CTRL with COMMAND for Mac', () => {
        spyOn(PlatformUtil, 'getPlatform').and.returnValue(Platform.Mac);

        service.shortcuts = [
            {
                key: 'c',
                modifierKeys: [ViewerModifierKey.ctrlKey],
                action: ViewerShortcutAction.CopyToClipboard,
                category: 'viewer_general',
                description: 'VIEWER.SERVICES.SHORTCUT.CLIPBOARD_COPY',
            },
        ];
        spyOn(TestBed.inject(NoopTranslationService), 'instant').and.returnValue('Copy');

        const summary = service.getShortcutSummary();
        expect(summary['viewer_general'][0].keys[0].text).toBe('COMMAND');
    });

    it('should filter shortcuts by partial text in getShortcutSummary', () => {
        service.shortcuts = [
            {
                key: 't',
                modifierKeys: [ViewerModifierKey.shiftKey],
                action: ViewerShortcutAction.ThumbnailViewer,
                category: 'viewer_general',
                description: 'VIEWER.SERVICES.SHORTCUT.THUMBNAIL_VIEWER',
            },
            {
                key: 'w',
                modifierKeys: [ViewerModifierKey.shiftKey],
                action: ViewerShortcutAction.Text,
                category: 'viewer_general',
                description: 'VIEWER.SERVICES.SHORTCUT.TEXT_LAYER',
            },
        ];

        const summary = service.getShortcutSummary('thumb');
        expect(summary['viewer_general'].length).toBe(1);
        expect(summary['viewer_general'][0].description).toBe('VIEWER.SERVICES.SHORTCUT.THUMBNAIL_VIEWER');
    });

    it('should add CTRL as a modifier on Mac when metaKey is pressed and no other modifiers are present', () => {
        spyOn(PlatformUtil, 'getPlatform').and.returnValue(Platform.Mac);

        const event = new KeyboardEvent('keydown', { key: 'c', metaKey: true });
        const shortcut = service.getShortcutForEvent(event);

        expect(shortcut?.action).toBe(ViewerShortcutAction.CopyToClipboard);
    });

    it('should not add CTRL as a modifier on non-Mac platforms when metaKey is pressed', () => {
        spyOn(PlatformUtil, 'getPlatform').and.returnValue(Platform.Windows);

        const event = new KeyboardEvent('keydown', { key: 'c', metaKey: true });
        const shortcut = service.getShortcutForEvent(event);

        expect(shortcut).toBeUndefined();
    });

    it('should not add CTRL as a modifier on Mac when other modifiers are present', () => {
        spyOn(PlatformUtil, 'getPlatform').and.returnValue(Platform.Mac);

        const event = new KeyboardEvent('keydown', { key: 'c', metaKey: true, shiftKey: true });
        const shortcut = service.getShortcutForEvent(event);

        expect(shortcut).toBeUndefined();
    });
});
