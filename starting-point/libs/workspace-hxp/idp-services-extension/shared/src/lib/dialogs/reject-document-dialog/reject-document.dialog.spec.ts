/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { RejectReason } from '../../models/contracts/task-input';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { IdpContextTaskBaseService } from '../../services/context-task/context-task-base.service';
import { RejectDocumentDialogComponent } from './reject-document.dialog';
import { FilterableSelectionListItem } from '../../components/filterable-selection-list/filterable-selection-list.component';

class MatDialogRefMock {
    close(value: any) {
        return value;
    }
}

describe('RejectDocumentDialogComponent', () => {
    let component: RejectDocumentDialogComponent;
    let fixture: ComponentFixture<RejectDocumentDialogComponent>;
    let dialogRef: MatDialogRefMock;

    const mockRejectReasons: RejectReason[] = [
        { id: '1', value: 'rr1' },
        { id: '2', value: 'rr2' },
        { id: '3', value: 'rr3' },
    ];

    const idpContextTaskBaseServiceMock = {
        rejectReasons$: of(mockRejectReasons),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule, NoopAnimationsModule],
            providers: [
                { provide: MatDialogRef, useClass: MatDialogRefMock },
                { provide: IdpContextTaskBaseService, useValue: idpContextTaskBaseServiceMock },
            ],
        });

        fixture = TestBed.createComponent(RejectDocumentDialogComponent);
        component = fixture.componentInstance;
        dialogRef = TestBed.inject(MatDialogRef) as unknown as MatDialogRefMock;
        fixture.detectChanges();
    });

    it('should map reject reasons to list items correctly', fakeAsync(() => {
        let mapped: FilterableSelectionListItem<RejectReason>[] = [];

        component.items$.subscribe((items) => (mapped = items));

        flush();

        expect(mapped.length).toBe(mockRejectReasons.length);
        expect(mapped[0].item).toBe(mockRejectReasons[0]);
        expect(mapped[0].id).toBe(mockRejectReasons[0].id);
        expect(mapped[0].name).toBe(mockRejectReasons[0].value);
    }));

    it('should set active item correctly', fakeAsync(() => {
        let currentActiveItem: RejectReason | undefined;

        component.activeItem$.subscribe((item) => (currentActiveItem = item));
        component.onActiveItemChanged(mockRejectReasons[1]);

        flush();

        expect(currentActiveItem).toBe(mockRejectReasons[1]);
    }));

    it('should not close dialog on Enter press if element has not been selected', () => {
        const event = new KeyboardEvent('keydown', { key: 'Enter' });

        spyOn(dialogRef, 'close');
        spyOn(event, 'preventDefault');

        component.handleKeyEnter(event);
        expect(dialogRef.close).not.toHaveBeenCalled();
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should call handleKeyEnter with correct activeItem', () => {
        const rejectReasonData = { id: '1', value: 'Test 1' };
        const rejectResult = { rejectReason: rejectReasonData, rejectNote: undefined };
        const event = new Event('keydown');
        spyOn(dialogRef, 'close');

        component.handleKeyEnter(event, rejectReasonData);

        expect(dialogRef.close).toBeCalledWith(rejectResult);
    });

    it('should call dialog close with correct rejectNote', fakeAsync(() => {
        const rejectNoteInput = select<HTMLInputElement>('[data-automation-id="idp-reject-dialog__input__reject-note"]');
        const rejectNote = 'Reject note.';
        rejectNoteInput.value = rejectNote;
        rejectNoteInput.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        const rejectButton = select<HTMLElement>('[data-automation-id="idp-reject-dialog__save-button"]');

        spyOn(dialogRef, 'close');
        rejectButton.click();

        flush();

        expect(dialogRef.close).toHaveBeenCalledWith({ rejectReason: mockRejectReasons[0], rejectNote });
    }));

    function select<T>(selector: string): T {
        return fixture.debugElement.nativeElement.querySelector(selector) as T;
    }

    it('should sanitize rejectNote', fakeAsync(() => {
        const ogConsoleWarn = console.warn;
        console.warn = () => {};

        const rejectNoteInput = select<HTMLInputElement>('[data-automation-id="idp-reject-dialog__input__reject-note"]');
        const rejectNote = '<img src="javascript:alert(\'xss\')"><div>hello</div><script>alert("xss")</script>';
        rejectNoteInput.value = rejectNote;
        rejectNoteInput.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        flush();

        expect(component.sanitizedRejectNote).toBe('<img src="unsafe:javascript:alert(\'xss\')"><div>hello</div>');

        console.warn = ogConsoleWarn;
    }));
});
