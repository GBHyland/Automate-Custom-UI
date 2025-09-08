/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IdpDocumentActionToolBarItems, IdpDocumentToolbarService } from '../../../services/document/idp-document-toolbar.service';
import { IdpDocumentService } from '../../../services/document/idp-document.service';
import { MatIcon } from '@angular/material/icon';
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
import { ClassListHeaderToolbarComponent } from './class-list-header-toolbar.component';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { IdpScreenViewFilter, IdpScreenViewSortOption } from '../../../models/common-models';
import { By } from '@angular/platform-browser';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { MatSelectChange } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ClassListHeaderToolbarComponent', () => {
    let component: ClassListHeaderToolbarComponent;
    let fixture: ComponentFixture<ClassListHeaderToolbarComponent>;
    let idpDocumentToolbarServiceMock: any;
    let shortcutServiceMock: any;
    let idpDocumentServiceMock: any;

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
            icon: 'Redo',
            action: IdpDocumentAction.Redo,
            disabled: false,
            onClick$: new Subject<void>(),
            renderType: 'dynamic',
            displayOn: 'header',
            displayOrder: 0,
            showDividerBefore: true,
            shortcutAction: IdpShortcutAction.Redo,
        },
        {
            label: 'Merge',
            icon: 'icon 3',
            action: IdpDocumentAction.Merge,
            disabled: false,
            onClick$: new Subject<void>(),
            renderType: 'dynamic',
            displayOn: 'footer',
            displayOrder: 1,
            showDividerBefore: true,
            shortcutAction: IdpShortcutAction.PageMerge,
        },
        {
            label: 'Undo',
            icon: 'Undo',
            action: IdpDocumentAction.Undo,
            disabled: false,
            onClick$: new Subject<void>(),
            renderType: 'dynamic',
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
            setDocumentSortOption: jasmine.createSpy('setDocumentSortOption', (option: IdpScreenViewSortOption) => option),
            selectedPages$: of(selectedPages),
            documentViewFilter$: of(IdpScreenViewFilter.All),
            setDocumentViewFilter: jasmine.createSpy('setDocumentViewFilter', (viewFilter: IdpScreenViewFilter) => viewFilter),
        };

        TestBed.configureTestingModule({
            imports: [NoopTranslateModule, NoopAnimationsModule, ClassListHeaderToolbarComponent],
            providers: [
                { provide: IdpDocumentToolbarService, useValue: idpDocumentToolbarServiceMock },
                { provide: IdpDocumentService, useValue: idpDocumentServiceMock },
                { provide: IdpShortcutService, useValue: shortcutServiceMock },
                { provide: IDP_SCREEN_SHORTCUTS_INJECTION_TOKEN, useValue: new InjectionToken<IdpShortcut[]>('IDP_SCREEN_SHORTCUTS') },
            ],
        });

        fixture = TestBed.createComponent(ClassListHeaderToolbarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should switch filter to OnlyIssues on toggle change', () => {
        testToggleSwitch(IdpScreenViewFilter.OnlyIssues, true);
    });

    it('should switch filter to All on toggle change', () => {
        testToggleSwitch(IdpScreenViewFilter.All, false);
    });

    it('should show correct sort options', () => {
        expect(component.sortOptions).toEqual([
            {
                value: IdpScreenViewSortOption.Original,
                label: 'IDP_CLASS_VERIFICATION.CLASS_LIST_HEADER.SORT_SELECTOR.ORIGINAL_ORDER_LABEL',
            },
            {
                value: IdpScreenViewSortOption.Classes,
                label: 'IDP_CLASS_VERIFICATION.CLASS_LIST_HEADER.SORT_SELECTOR.CLASSES_ORDER_LABEL',
            },
        ]);
    });

    it('should change current sort option', () => {
        spyOn(component, 'onIssuesFilterChange').and.callThrough();
        component.selectedSortOption = IdpScreenViewSortOption.Original;
        component.onSortChanged({
            value: IdpScreenViewSortOption.Classes,
        } as MatSelectChange);

        expect(component.selectedSortOption).toBe(IdpScreenViewSortOption.Classes);
        expect(idpDocumentServiceMock.setDocumentSortOption).toHaveBeenCalledOnceWith(IdpScreenViewSortOption.Classes);
    });

    it('should show only header dynamic actions', () => {
        const expectedItems = {
            redo: toolbarActions[1],
            undo: toolbarActions[3],
        };
        const buttons = fixture.debugElement.queryAll(By.css('button[mat-icon-button]'));
        expect(buttons.length).toBe(2);

        const iconRedo = buttons[0].query(By.directive(MatIcon)).nativeElement.textContent.trim();
        const iconUndo = buttons[1].query(By.directive(MatIcon)).nativeElement.textContent.trim();

        expect(iconRedo).toBe(expectedItems.redo.icon);
        expect(iconUndo).toBe(expectedItems.undo.icon);
    });

    const testToggleSwitch = (calledWith: IdpScreenViewFilter, isIssuesOnlyView: boolean) => {
        component.isIssuesOnlyView = isIssuesOnlyView;
        expect(component.isIssuesOnlyView).toBe(isIssuesOnlyView);

        spyOn(component, 'onIssuesFilterChange').and.callThrough();

        const toggle = fixture.debugElement.query(By.directive(MatSlideToggle));
        toggle.triggerEventHandler('change', { checked: isIssuesOnlyView });
        fixture.detectChanges();

        expect(component.onIssuesFilterChange).toHaveBeenCalledOnceWith(isIssuesOnlyView);
        expect(idpDocumentServiceMock.setDocumentViewFilter).toHaveBeenCalledOnceWith(calledWith);
    };
});
