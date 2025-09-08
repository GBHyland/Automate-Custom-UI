/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FloatingToolbarComponent } from './floating-toolbar.component';
import { IdpDocumentActionToolBarItems, IdpDocumentToolbarService } from '../../../services/document/idp-document-toolbar.service';
import { IdpDocumentService } from '../../../services/document/idp-document.service';
import { of, Subject } from 'rxjs';
import {
    IDP_SCREEN_SHORTCUTS_INJECTION_TOKEN,
    IdpShortcut,
    IdpShortcutAction,
    IdpShortcutService,
} from '@hxp/workspace-hxp/idp-services-extension/shared';
import { InjectionToken } from '@angular/core';
import { mockIdpDocuments } from '../../../models/mocked/mocked-documents';
import { IdpDocumentAction } from '../../../models/screen-models';
import { NoopTranslateModule } from '@alfresco/adf-core';

describe('FloatingToolbarComponent', () => {
    let component: FloatingToolbarComponent;
    let fixture: ComponentFixture<FloatingToolbarComponent>;
    let idpDocumentToolbarServiceMock: any;
    let shortcutServiceMock: any;
    let idpDocumentServiceMock: any;
    let element: HTMLElement;

    const mockedDocuments = mockIdpDocuments();
    const selectedPages = mockedDocuments[0].pages;

    const toolbarActions: IdpDocumentActionToolBarItems[] = [
        {
            label: 'ChangeClass',
            icon: 'icon 1',
            action: IdpDocumentAction.ChangeClass,
            disabled: false,
            onClick$: new Subject<void>(),
            renderType: 'static',
            displayOn: 'footer',
            displayOrder: 0,
            showDividerBefore: true,
            shortcutAction: IdpShortcutAction.ChangeClass,
        },
        {
            label: 'Redo',
            icon: 'icon 2',
            action: IdpDocumentAction.Redo,
            disabled: false,
            onClick$: new Subject<void>(),
            renderType: 'static',
            displayOn: 'header',
            displayOrder: 0,
            showDividerBefore: true,
            shortcutAction: IdpShortcutAction.Redo,
        },
        {
            label: 'Merge',
            icon: 'icon 2',
            action: IdpDocumentAction.Merge,
            disabled: false,
            onClick$: new Subject<void>(),
            renderType: 'static',
            displayOn: 'footer',
            displayOrder: 1,
            showDividerBefore: true,
            shortcutAction: IdpShortcutAction.PageMerge,
        },
        {
            label: 'Undo',
            icon: 'icon 2',
            action: IdpDocumentAction.Undo,
            disabled: false,
            onClick$: new Subject<void>(),
            renderType: 'static',
            displayOn: 'header',
            displayOrder: 1,
            showDividerBefore: true,
            shortcutAction: IdpShortcutAction.Undo,
        },
    ];

    beforeEach(() => {
        idpDocumentToolbarServiceMock = {
            getToolbarItems: jasmine.createSpy('getToolbarItems').and.returnValue(of([])),
            documentToolBarItems$: of(toolbarActions),
        };

        shortcutServiceMock = {
            getShortcutTooltipForAction: jasmine.createSpy('getShortcutTooltipForAction').and.returnValue('Ctrl + Z'),
        };

        idpDocumentServiceMock = {
            selectedPages$: of(selectedPages),
        };

        TestBed.configureTestingModule({
            imports: [NoopTranslateModule, FloatingToolbarComponent],
            providers: [
                { provide: IdpDocumentToolbarService, useValue: idpDocumentToolbarServiceMock },
                { provide: IdpDocumentService, useValue: idpDocumentServiceMock },
                { provide: IdpShortcutService, useValue: shortcutServiceMock },
                { provide: IDP_SCREEN_SHORTCUTS_INJECTION_TOKEN, useValue: new InjectionToken<IdpShortcut[]>('IDP_SCREEN_SHORTCUTS') },
            ],
        });

        fixture = TestBed.createComponent(FloatingToolbarComponent);
        component = fixture.componentInstance;
        element = fixture.debugElement.nativeElement;
        fixture.detectChanges();
    });

    it('should collapse on click', () => {
        expect(component.isCollapsed).toBe(false);
        const btn = getCollapseButton();
        btn.dispatchEvent(new Event('click'));
        fixture.detectChanges();

        expect(component.isCollapsed).toBe(true);
    });

    it('should collapse on Enter press', () => {
        expect(component.isCollapsed).toBe(false);
        const btn = getCollapseButton();
        btn.dispatchEvent(new KeyboardEvent('click', { key: 'Enter' }));
        fixture.detectChanges();

        expect(component.isCollapsed).toBe(true);
    });

    it('should display correct selected pages count', () => {
        expect(component.totalSelectedPages).toBe(selectedPages.length);
    });

    it('should display correct actions', fakeAsync(() => {
        const actualItems: any[] = [];
        const expectedItems = {
            changeClass: toolbarActions[0],
            merge: toolbarActions[2],
        };
        component.toolbarActionItems$.subscribe((items) => {
            actualItems.push(...items);
        });
        tick(2000);

        expect(actualItems.length).toBe(2);
        expect(actualItems).toEqual(
            jasmine.arrayContaining([
                jasmine.objectContaining({
                    ...expectedItems.changeClass,
                }),
                jasmine.objectContaining({
                    ...expectedItems.merge,
                }),
            ])
        );
    }));

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const getCollapseButton = (): HTMLButtonElement => element.querySelector('.idp-footer-toolbar__collapse-button')!;
});
