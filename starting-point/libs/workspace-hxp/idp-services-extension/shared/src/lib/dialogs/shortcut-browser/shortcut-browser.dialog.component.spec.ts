/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ShortcutBrowserDialogComponent, SHORTCUT_BROWSER_FILTER_DEBOUNCE_TIME } from './shortcut-browser.dialog.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IdpShortcutService, IdpShortcutSummary } from '../../services/shortcut/idp-shortcut.service';

describe('ShortcutBrowserDialogComponent', () => {
    describe('synchronous', () => {
        let subjectComponent: ShortcutBrowserDialogComponent;
        let mockIdpShortcutService: jest.Mocked<IdpShortcutService>;
        let mockDialog: jest.Mocked<MatDialog>;
        let fixture: ComponentFixture<ShortcutBrowserDialogComponent>;

        beforeEach(() => {
            mockIdpShortcutService = {
                getShortcutSummary: jest.fn(),
            } as unknown as jest.Mocked<IdpShortcutService>;
            mockDialog = {
                open: jest.fn(),
            } as unknown as jest.Mocked<MatDialog>;

            TestBed.configureTestingModule({
                imports: [CommonModule, NoopTranslateModule, MatDialogModule, MatFormFieldModule, NoopAnimationsModule],
                providers: [{ provide: IdpShortcutService, useValue: mockIdpShortcutService }],
            });
            fixture = TestBed.createComponent(ShortcutBrowserDialogComponent);
            subjectComponent = fixture.componentInstance;
        });
        describe('initialization', () => {
            it('calls the shortcutService getShortcutSummary once', () => {
                expect(mockIdpShortcutService.getShortcutSummary).toHaveBeenCalledTimes(1);
            });
            it('calls the shortcutService getShortcutSummary with nothing', () => {
                expect(mockIdpShortcutService.getShortcutSummary).toHaveBeenCalledWith();
            });
        });
        describe('openDialog', () => {
            it('should open the dialog with the correct configuration', () => {
                const config = { width: '50%' };
                ShortcutBrowserDialogComponent.openDialog(mockDialog, config);
                expect(mockDialog.open).toHaveBeenCalledWith(
                    ShortcutBrowserDialogComponent,
                    jasmine.objectContaining({
                        width: '50%',
                        height: '65%',
                        autoFocus: '.idp-search-input',
                        delayFocusTrap: true,
                        restoreFocus: true,
                    })
                );
            });
        });
        describe('ngOnDestroy', () => {
            it('should complete the searchFilter$ subject', () => {
                const completeSpy = spyOn(subjectComponent['searchFilter$'], 'complete');
                subjectComponent.ngOnDestroy();
                expect(completeSpy).toHaveBeenCalled();
            });
        });
    });

    describe('asynchronous', () => {
        let subjectComponent: ShortcutBrowserDialogComponent;
        let mockIdpShortcutService: jest.Mocked<IdpShortcutService>;
        let fixture: ComponentFixture<ShortcutBrowserDialogComponent>;

        const beforeEachTest = () => {
            mockIdpShortcutService = {
                getShortcutSummary: jest.fn(),
            } as unknown as jest.Mocked<IdpShortcutService>;

            TestBed.configureTestingModule({
                imports: [CommonModule, NoopTranslateModule, MatDialogModule, MatFormFieldModule, NoopAnimationsModule],
                providers: [{ provide: IdpShortcutService, useValue: mockIdpShortcutService }],
            });
            fixture = TestBed.createComponent(ShortcutBrowserDialogComponent);
            subjectComponent = fixture.componentInstance;
            mockIdpShortcutService.getShortcutSummary.mockClear();
        };
        describe('onSearchInput', () => {
            it(
                'given one invocation of onSearchInput before the debounce time, ' + 'calls the shortcutService getShortcutSummary once',
                fakeAsync(() => {
                    beforeEachTest();
                    subjectComponent.onSearchInput('test');
                    tick(SHORTCUT_BROWSER_FILTER_DEBOUNCE_TIME);
                    expect(mockIdpShortcutService.getShortcutSummary).toHaveBeenCalledTimes(1);
                })
            );
            it(
                'given multiple invocations of onSearchInput before the debounce time, ' + 'calls the shortcutService getShortcutSummary once',
                fakeAsync(() => {
                    beforeEachTest();
                    const search = 'test';
                    subjectComponent.onSearchInput(search);
                    subjectComponent.onSearchInput(search);
                    subjectComponent.onSearchInput(search);
                    tick(SHORTCUT_BROWSER_FILTER_DEBOUNCE_TIME);
                    expect(mockIdpShortcutService.getShortcutSummary).toHaveBeenCalledTimes(1);
                })
            );
            it(
                'given one invocation of onSearchInput before the first debounce time, ' +
                    'and given one invocation of onSearchInput after the first debounce time but before the second debounce time, ' +
                    'and the second invocation uses a different search parameter than the first invocation, ' +
                    'calls the shortcutService getShortcutSummary twice',
                fakeAsync(() => {
                    beforeEachTest();
                    let search = 'test';
                    subjectComponent.onSearchInput(search);
                    tick(SHORTCUT_BROWSER_FILTER_DEBOUNCE_TIME);
                    search = 'test2';
                    subjectComponent.onSearchInput(search);
                    tick(SHORTCUT_BROWSER_FILTER_DEBOUNCE_TIME);
                    expect(mockIdpShortcutService.getShortcutSummary).toHaveBeenCalledTimes(2);
                })
            );
            it(
                'given one invocations of onSearchInput before the first debounce time, ' +
                    'and given one invocation of onSearchInput after the first debounce time but before the second debounce time, ' +
                    'and the second invocation uses the same search parameter as the first invocation, ' +
                    'calls the shortcutService getShortcutSummary once',
                fakeAsync(() => {
                    beforeEachTest();
                    const search = 'test';
                    subjectComponent.onSearchInput(search);
                    tick(SHORTCUT_BROWSER_FILTER_DEBOUNCE_TIME);
                    subjectComponent.onSearchInput(search);
                    tick(SHORTCUT_BROWSER_FILTER_DEBOUNCE_TIME);
                    expect(mockIdpShortcutService.getShortcutSummary).toHaveBeenCalledTimes(1);
                })
            );
            it('calls the shortcutService getShortcutSummary with the search parameter', fakeAsync(() => {
                beforeEachTest();
                const search = 'test';
                subjectComponent.onSearchInput(search);
                tick(SHORTCUT_BROWSER_FILTER_DEBOUNCE_TIME);
                expect(mockIdpShortcutService.getShortcutSummary).toHaveBeenCalledWith(search);
            }));
            it('sets the shortcutSummaries to the result of the shortcutService getShortcutSummary', fakeAsync(() => {
                beforeEachTest();
                const search = 'test';
                const result: IdpShortcutSummary = {};
                mockIdpShortcutService.getShortcutSummary.mockReturnValue(result);
                subjectComponent.onSearchInput(search);
                tick(SHORTCUT_BROWSER_FILTER_DEBOUNCE_TIME);
                expect(subjectComponent.shortcutSummaries).toBe(result);
            }));
        });
    });
});
