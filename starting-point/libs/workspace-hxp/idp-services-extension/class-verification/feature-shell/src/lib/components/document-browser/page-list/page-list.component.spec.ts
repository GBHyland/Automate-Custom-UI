/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { IdpDocumentToolbarService } from '../../../services/document/idp-document-toolbar.service';
import { IdpDocumentService } from '../../../services/document/idp-document.service';
import { of, Subject } from 'rxjs';
import { mockIdpDocuments } from '../../../models/mocked/mocked-documents';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { PageListComponent } from './page-list.component';
import {
    IdpKeyboardNavAction,
    IdpKeyboardNavigationService,
    IdpKeyboardNavActionTypeInternal,
} from '../../../services/document/idp-keyboard-navigation.service';
import { IdpDocumentMultiselectService } from '../../../services/document/idp-document-multiselect.service';
import { IdpDocumentPage, IdpDocumentAction } from '../../../models/screen-models';
import { IdpShortcutAction } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { IdpDocumentDragDropService } from '../../../services/document/idp-drag-drop.service';

describe('PageListComponent', () => {
    let component: PageListComponent;
    let fixture: ComponentFixture<PageListComponent>;
    let idpDocumentToolbarServiceMock: jasmine.SpyObj<IdpDocumentToolbarService>;
    let idpDocumentDragDropServiceMock: jasmine.SpyObj<IdpDocumentDragDropService>;
    let idpDocumentServiceMock: jasmine.SpyObj<IdpDocumentService>;
    let idpDocumentMultiselectServiceMock: jasmine.SpyObj<IdpDocumentMultiselectService>;
    let idpKeyboardNavigationServiceMock: jasmine.SpyObj<IdpKeyboardNavigationService>;
    let actionSubject$: Subject<IdpKeyboardNavAction>;

    const mockedDocuments = mockIdpDocuments();
    const documentId = mockedDocuments[1].id;
    const allPagesForSelectedClass = [...mockedDocuments[1].pages, ...mockedDocuments[2].pages];
    const selectedPages = [allPagesForSelectedClass[0], allPagesForSelectedClass[1]];
    const getMockedAction = (): IdpKeyboardNavAction => {
        return {
            type: IdpKeyboardNavActionTypeInternal.Expand,
            currentActiveInfo: { id: 'test', activeContext: undefined },
            selectionAction: 'single',
            event: undefined,
            containerContext: {
                contextId: documentId,
                contextType: 'document',
            },
            itemContext: {
                contextId: 'test',
                contextType: 'page',
            },
            data: selectedPages[0],
        };
    };

    beforeEach(() => {
        idpDocumentToolbarServiceMock = jasmine.createSpyObj<IdpDocumentToolbarService>('IdpDocumentToolbarService', ['handlePageSplit']);

        actionSubject$ = new Subject<IdpKeyboardNavAction>();

        idpDocumentMultiselectServiceMock = jasmine.createSpyObj<IdpDocumentMultiselectService>('IdpDocumentMultiselectService', [
            'selectAll',
            'pageSelected',
        ]);

        idpKeyboardNavigationServiceMock = jasmine.createSpyObj<IdpKeyboardNavigationService>(
            'IdpKeyboardNavigationService',
            ['registerContext', 'unregisterContext'],
            {
                action$: actionSubject$.asObservable(),
            }
        );

        idpDocumentServiceMock = jasmine.createSpyObj<IdpDocumentService>('IdpDocumentService', [], {
            allPagesForSelectedClass$: of(allPagesForSelectedClass),
            selectedPages$: of(selectedPages),
            allPages$: of(mockedDocuments.flatMap((d) => d.pages)),
            copyDocumentDetailsToClipboard: jasmine.createSpy('copyDocumentDetailsToClipboard'),
        });

        idpDocumentDragDropServiceMock = jasmine.createSpyObj<IdpDocumentDragDropService>('IdpDocumentDragDropService', ['setDraggingState']);

        TestBed.configureTestingModule({
            imports: [NoopTranslateModule, PageListComponent],
            providers: [
                { provide: IdpDocumentMultiselectService, useValue: idpDocumentMultiselectServiceMock },
                { provide: IdpKeyboardNavigationService, useValue: idpKeyboardNavigationServiceMock },
                { provide: IdpDocumentToolbarService, useValue: idpDocumentToolbarServiceMock },
                { provide: IdpDocumentService, useValue: idpDocumentServiceMock },
                { provide: IdpDocumentDragDropService, useValue: idpDocumentDragDropServiceMock },
            ],
        });

        fixture = TestBed.createComponent(PageListComponent);
        component = fixture.componentInstance;
        component.documentId = documentId;
        fixture.detectChanges();
    });

    it('should set correct pages', fakeAsync(() => {
        const pages: IdpDocumentPage[] = [];
        const selectedPagesIds = new Set(selectedPages.map((page) => page.id));
        component.pages$.subscribe((data) => {
            pages.push(...data);
        });
        tick(2000);

        expect(pages.length).toBe(mockedDocuments[1].pages.length);
        expect(pages[0]).toEqual({
            ...mockedDocuments[1].pages[0],
            isSelected: selectedPagesIds.has(mockedDocuments[1].pages[0].id),
        });
        expect(pages[1]).toEqual({
            ...mockedDocuments[1].pages[1],
            isSelected: selectedPagesIds.has(mockedDocuments[1].pages[1].id),
        });
    }));

    it('should trigger onItemKeyDown', () => {
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        prepareEvent('[data-automation-id="idp-list-item-page__0"]', 'onItemKeyDown', event);
        expect(component.onItemKeyDown).toHaveBeenCalledOnceWith({ ...selectedPages[0], isSelected: true }, event);
    });

    it('should trigger onContainerKeyDown', () => {
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        prepareEvent('[data-automation-id="idp-page-list"]', 'onContainerKeyDown', event);
        expect(component.onContainerKeyDown).toHaveBeenCalledOnceWith(
            selectedPages.map((p) => ({ ...p, isSelected: true })),
            event
        );
    });

    it('should trigger onItemMouseDown', () => {
        const event = new MouseEvent('mousedown');
        prepareEvent('[data-automation-id="idp-list-item-page__0"]', 'onItemMouseDown', event);
        expect(component.onItemMouseDown).toHaveBeenCalledOnceWith({ ...selectedPages[0], isSelected: true }, event);
    });

    it('should trigger onItemMouseUp without ctrlKey and metaKey', () => {
        const event = new MouseEvent('mouseup', { ctrlKey: false, metaKey: false, shiftKey: true });
        prepareEvent('[data-automation-id="idp-list-item-page__0"]', 'onItemMouseUp', event);

        expect(component.onItemMouseUp).toHaveBeenCalledOnceWith({ ...selectedPages[0], isSelected: true }, event);
        expect(idpDocumentMultiselectServiceMock.pageSelected).not.toHaveBeenCalled();
    });

    it('should trigger onItemMouseUp with metaKey', () => {
        testMouseUpWithKeysPositive(false, true);
    });

    it('should trigger onItemMouseUp with ctrlKey', () => {
        testMouseUpWithKeysPositive(true, false);
    });

    it('should trigger onItemMouseUp with metaKey and ctrlKey', () => {
        testMouseUpWithKeysPositive(true, true);
    });

    it('should unregister context on destroy', () => {
        component.ngOnDestroy();
        expect(idpKeyboardNavigationServiceMock.unregisterContext).toHaveBeenCalled();
    });

    it('should register context after init', () => {
        component.ngAfterViewInit();
        expect(idpKeyboardNavigationServiceMock.registerContext).toHaveBeenCalled();
    });

    it('should trigger onDragStarted', () => {
        const event = new Event('cdkDragStarted');
        spyOn(component, 'onDragStarted').and.callThrough();
        testDragging(true, event);
        expect(component.onDragStarted).toHaveBeenCalled();
    });

    it('should trigger onDragStopped', () => {
        const event = new Event('cdkDragReleased');
        spyOn(component, 'onDragStopped').and.callThrough();
        testDragging(false, event);
        expect(component.onDragStopped).toHaveBeenCalled();
    });

    it('should trigger handlePageSplit in onPageSplitAllAbove', fakeAsync(() => {
        const action = getMockedAction();
        action.type = IdpShortcutAction.PageSplitAllAbove;
        const pages: IdpDocumentPage[] = [];
        component.pages$.subscribe((data) => {
            pages.push(...data);
        });
        tick(2000);
        const item = selectedPages[0];
        const index = pages.findIndex((page) => page.id === item.id);
        const items = pages.splice(0, index + 1);
        action.data = item;

        actionSubject$.next(action);

        expect(idpDocumentToolbarServiceMock.handlePageSplit).toHaveBeenCalledOnceWith(items, IdpDocumentAction.Split);
    }));

    it('should return from onNavigationAction if contextType is not page', () => {
        const action = getMockedAction();
        action.type = IdpShortcutAction.SelectAllContextOnly;
        action.itemContext.contextType = 'class';

        actionSubject$.next(action);

        expect(idpDocumentMultiselectServiceMock.selectAll).not.toHaveBeenCalled();
    });

    it('should return from onNavigationAction if item does not exist', () => {
        const action = getMockedAction();
        action.data = undefined;
        action.type = IdpShortcutAction.SelectAllContextOnly;

        actionSubject$.next(action);

        expect(idpDocumentMultiselectServiceMock.selectAll).not.toHaveBeenCalled();
    });

    it('should call selectAll with page argument', () => {
        const action = getMockedAction();
        action.type = IdpShortcutAction.SelectAllContextOnly;
        action.data = selectedPages[0];

        actionSubject$.next(action);

        expect(idpDocumentMultiselectServiceMock.selectAll).toHaveBeenCalledOnceWith('page', documentId);
    });

    it('should call selectAll with document argument', () => {
        const action = getMockedAction();
        action.type = IdpShortcutAction.SelectAllContextAll;

        actionSubject$.next(action);

        expect(idpDocumentMultiselectServiceMock.selectAll).toHaveBeenCalledOnceWith('document');
    });

    it('should call next for collapseContainer if type is IdpKeyboardNavActionTypeInternal.Collapse', () => {
        const action = getMockedAction();
        action.type = IdpKeyboardNavActionTypeInternal.Collapse;

        spyOn(component.collapseContainer, 'next').and.callThrough();

        actionSubject$.next(action);

        expect(component.collapseContainer.next).toHaveBeenCalled();
        expect(idpDocumentMultiselectServiceMock.selectAll).not.toHaveBeenCalled();
    });

    it('should call next for collapseContainer if type is IdpShortcutAction.Collapse', () => {
        const action = getMockedAction();
        action.type = IdpShortcutAction.Collapse;

        spyOn(component.collapseContainer, 'next').and.callThrough();

        actionSubject$.next(action);

        expect(component.collapseContainer.next).toHaveBeenCalled();
        expect(idpDocumentMultiselectServiceMock.selectAll).not.toHaveBeenCalled();
    });

    it('should call handlePageSplit if type is IdpShortcutAction.PageSplitAllAbove', () => {
        const action = getMockedAction();
        action.type = IdpShortcutAction.PageSplitAllAbove;

        actionSubject$.next(action);

        expect(idpDocumentMultiselectServiceMock.selectAll).not.toHaveBeenCalled();
        expect(idpDocumentToolbarServiceMock.handlePageSplit).toHaveBeenCalled();
    });

    it('should return from onNavigationAction if currentActiveInfo.id is empty', () => {
        const action = getMockedAction();
        action.type = IdpShortcutAction.IssueOnlyFilter;
        action.selectionAction = 'multi';
        action.currentActiveInfo.id = '';

        actionSubject$.next(action);

        expect(idpDocumentMultiselectServiceMock.pageSelected).not.toHaveBeenCalled();
    });

    it('should return from onNavigationAction if selectionItem is none', () => {
        const action = getMockedAction();
        action.type = IdpShortcutAction.IssueOnlyFilter;
        action.selectionAction = 'none';

        actionSubject$.next(action);

        expect(idpDocumentMultiselectServiceMock.pageSelected).not.toHaveBeenCalled();
    });

    const testDragging = (dragState: boolean, event: Event) => {
        const element = fixture.debugElement.nativeElement.querySelector('[data-automation-id="idp-list-item-page__0"]') as HTMLElement;
        element.focus();
        element.dispatchEvent(event);
        fixture.detectChanges();

        expect(idpDocumentDragDropServiceMock.setDraggingState).toHaveBeenCalledOnceWith(dragState);
    };

    const testMouseUpWithKeysPositive = (ctrlKey: boolean, metaKey: boolean) => {
        const action = getMockedAction();
        action.selectionAction = 'multi';
        (component as any).pendingMouseUpToggle = { selectionAction: action.selectionAction };
        (action.data as IdpDocumentPage).isSelected = true;

        actionSubject$.next(action);

        const event = new MouseEvent('mouseup', { ctrlKey: ctrlKey, metaKey: metaKey });

        prepareEvent('.idp-list-item-page', 'onItemMouseUp', event);

        expect(component.onItemMouseUp).toHaveBeenCalledOnceWith({ ...selectedPages[0], isSelected: true }, event);
        expect(idpDocumentMultiselectServiceMock.pageSelected).toHaveBeenCalledWith(selectedPages[0].id, 'multi', true);
    };

    const prepareEvent = (selector: string, funcName: keyof PageListComponent, event: UIEvent) => {
        const element = fixture.debugElement.nativeElement.querySelector(selector) as HTMLElement;
        spyOn(component, funcName as any).and.callThrough();
        element.focus();
        element.dispatchEvent(event);

        fixture.detectChanges();
    };

    it('should copy document id on document double click', () => {
        const element = fixture.debugElement.nativeElement.querySelector('[data-automation-id="idp-list-item-page__0"]') as HTMLElement;

        spyOn(component, 'onDoubleClick').and.callThrough();

        element.dispatchEvent(new MouseEvent('dblclick'));
        fixture.detectChanges();

        expect(component.onDoubleClick).toHaveBeenCalledTimes(1);
        expect(idpDocumentServiceMock.copyDocumentDetailsToClipboard).toHaveBeenCalledOnceWith(component.documentId);
    });
});
