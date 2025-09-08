/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ListByCategoryProcess } from '../process-list-by-category/process-list-by-category.component';
import { ProcessListByCategoryItemComponent } from './process-list-item.component';

describe('ProcessListByCategoryItemComponent', () => {
    let component: ProcessListByCategoryItemComponent;
    let fixture: ComponentFixture<ProcessListByCategoryItemComponent>;
    let process: ListByCategoryProcess;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ProcessListByCategoryItemComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ProcessListByCategoryItemComponent);
        component = fixture.componentInstance;
        process = {
            id: 'id',
            key: 'key',
            name: 'name',
            description: 'description',
        };
        component.process = process;

        fixture.detectChanges();
    });

    it('should display process', () => {
        fixture.detectChanges();

        const name = fixture.debugElement.query(By.css('.app-processes-list-item-name')).nativeElement;
        const description = fixture.debugElement.query(By.css('.app-processes-list-item-description')).nativeElement;

        expect(name.innerText.trim()).toBe('name');
        expect(description.innerText.trim()).toBe('description');
    });

    it('should emit on item click', () => {
        const selectProcessSpy = spyOn(component.selectProcess, 'emit').and.callThrough();
        const listItem = fixture.debugElement.query(By.css('.app-processes-list-item')).nativeElement;
        listItem.click();

        expect(selectProcessSpy).toHaveBeenCalledWith(process);
    });

    it('should emit process on enter keydown', () => {
        const selectProcessSpy = spyOn(component.selectProcess, 'emit').and.callThrough();
        const onProcessListItemKeydownSpy = spyOn(component, 'onProcessListItemKeydown').and.callThrough();
        const listItem = fixture.debugElement.query(By.css('.app-processes-list-item')).nativeElement;
        listItem.dispatchEvent(
            new KeyboardEvent('keydown', {
                key: 'Enter',
                bubbles: true,
            })
        );
        expect(onProcessListItemKeydownSpy).toHaveBeenCalledTimes(1);
        expect(selectProcessSpy).toHaveBeenCalledOnceWith(process);
    });
});
