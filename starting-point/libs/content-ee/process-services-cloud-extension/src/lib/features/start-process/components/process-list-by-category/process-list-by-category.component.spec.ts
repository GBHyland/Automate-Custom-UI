/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListByCategoryProcess, ProcessListByCategoryComponent } from './process-list-by-category.component';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DebugElement } from '@angular/core';
import { NoopTranslateModule } from '@alfresco/adf-core';

const createProcess = (categoryData: Partial<ListByCategoryProcess>): ListByCategoryProcess => {
    const randomCharacters = (Math.random() + 1).toString(36).substring(7);

    return {
        id: `id_${randomCharacters}`,
        name: `name_${randomCharacters}`,
        category: `cat_${randomCharacters}`,
        key: `key_${randomCharacters}`,
        ...categoryData,
    };
};

const getElementText = (element: DebugElement, cssSelector: string): string => element.query(By.css(cssSelector))?.nativeElement.textContent.trim();

describe('ProcessListByCategoryComponent', () => {
    let processesListComponent: ProcessListByCategoryComponent;
    let fixture: ComponentFixture<ProcessListByCategoryComponent>;
    let processes: ListByCategoryProcess[];

    let categoryOneProcesses: ListByCategoryProcess[];
    let categoryTwoProcesses: ListByCategoryProcess[];
    let categoryThreeProcesses: ListByCategoryProcess[];

    beforeEach(() => {
        categoryOneProcesses = [
            createProcess({ category: 'cat1', name: 'cat1_process1' }),
            createProcess({ category: 'cat1', name: 'cat1_process2' }),
        ];

        categoryTwoProcesses = [
            createProcess({ category: 'cat2', name: 'cat2_process1' }),
            createProcess({ category: 'cat2', name: 'cat2_process2' }),
        ];

        categoryThreeProcesses = [
            createProcess({ category: '', name: 'cat3_process1' }),
            createProcess({
                category: 'http://bpmn.io/schema/bpmn',
                name: 'cat3_process2',
            }),
        ];

        processes = [...categoryOneProcesses, ...categoryTwoProcesses, ...categoryThreeProcesses];

        TestBed.configureTestingModule({
            imports: [NoopTranslateModule, NoopAnimationsModule, ProcessListByCategoryComponent],
        });

        fixture = TestBed.createComponent(ProcessListByCategoryComponent);
        processesListComponent = fixture.componentInstance;

        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    describe('no filtered processes available', () => {
        beforeEach(() => {
            processesListComponent.filteredProcesses = [];
        });

        it('should show no processes message', () => {
            const noProcessesMessage = fixture.debugElement.query(By.css('.app-no-processes-message'));

            expect(noProcessesMessage).toBeTruthy();
            expect(noProcessesMessage.nativeElement.textContent.trim()).toBe('SHARED.PROCESSES_LIST.NO_PROCESS_DEFINITIONS');
        });

        it('should not display any processes', () => {
            const processesListItems = fixture.debugElement.query(By.css('.app-processes-list-items'));

            expect(processesListItems).toBeFalsy();
        });
    });

    it('should display processes data', async () => {
        processesListComponent.processes = processes;

        processesListComponent.ngOnChanges({
            processes: {
                currentValue: processes,
                previousValue: undefined,
                isFirstChange: () => true,
                firstChange: true,
            },
        });

        const searchInput = fixture.debugElement.query(By.css('[data-automation-id="start-process-dialog-search-input"]')).nativeElement;

        searchInput.click();
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        await fixture.whenStable();
        fixture.detectChanges();

        const processesByCategory = fixture.debugElement.queryAll(By.css('.app-processes-list-items'));

        expect(processesByCategory.length).toBe(3, 'should display all processes by category');

        const categoryOneLabel = getElementText(processesByCategory[0], '.app-process-label');
        expect(categoryOneLabel).toBe('cat1');

        const categoryTwoLabel = getElementText(processesByCategory[1], '.app-process-label');
        expect(categoryTwoLabel).toBe('cat2');

        const categoryThreeLabel = getElementText(processesByCategory[2], '.app-process-without-category-list');
        expect(categoryThreeLabel).toBe('SHARED.PROCESSES_LIST.UNCATEGORIZED');

        const categoryOneProcessesElements = processesByCategory[0].queryAll(By.css('.app-processes-list-item'));
        expect(categoryOneProcessesElements.length).toBe(categoryOneProcesses.length);
        categoryOneProcesses.forEach((process, index) => {
            const categoryProcessName = getElementText(categoryOneProcessesElements[index], '.app-processes-list-item-name');
            expect(categoryProcessName).toEqual(process.name);
        });

        const categoryTwoProcessesElements = processesByCategory[1].queryAll(By.css('.app-processes-list-item'));
        expect(categoryTwoProcessesElements.length).toBe(categoryTwoProcesses.length);
        categoryTwoProcesses.forEach((process, index) => {
            const categoryProcessName = getElementText(categoryTwoProcessesElements[index], '.app-processes-list-item-name');
            expect(categoryProcessName).toEqual(process.name);
        });

        const categoryThreeProcessesElements = processesByCategory[2].queryAll(By.css('.app-processes-list-item'));
        expect(categoryThreeProcessesElements.length).toBe(categoryThreeProcesses.length);
        categoryThreeProcesses.forEach((process, index) => {
            const categoryProcessName = getElementText(categoryThreeProcessesElements[index], '.app-processes-list-item-name');
            expect(categoryProcessName).toEqual(process.name);
        });
    });

    it('should filter processes', () => {
        processesListComponent.processes = processes;

        processesListComponent.ngOnChanges({
            processes: {
                currentValue: processes,
                previousValue: undefined,
                isFirstChange: () => true,
                firstChange: true,
            },
        });

        const searchInput = fixture.debugElement.query(By.css('[data-automation-id="start-process-dialog-search-input"]')).nativeElement;

        searchInput.click();
        searchInput.value = 'cat1_process';
        searchInput.dispatchEvent(new Event('input'));

        fixture.detectChanges();

        const processesByCategory = fixture.debugElement.queryAll(By.css('.app-processes-list-items'));

        expect(processesByCategory.length).toBe(1, 'should filter out all other categories');

        const categoryOneLabel = getElementText(processesByCategory[0], '.app-process-label');
        expect(categoryOneLabel).toBe('cat1');

        const categoryOneProcessesElements = processesByCategory[0].queryAll(By.css('.app-processes-list-item'));
        expect(categoryOneProcessesElements.length).toBe(categoryOneProcesses.length);
        categoryOneProcesses.forEach((process, index) => {
            const categoryProcessName = getElementText(categoryOneProcessesElements[index], '.app-processes-list-item-name');
            expect(categoryProcessName).toEqual(process.name);
        });
    });

    it('should not display default category', () => {
        processesListComponent.processes = [createProcess({ category: undefined })];
        processesListComponent.ngOnChanges({
            processes: {
                currentValue: [createProcess({ category: undefined })],
                previousValue: undefined,
                isFirstChange: () => true,
                firstChange: true,
            },
        });

        const searchInput = fixture.debugElement.query(By.css('[data-automation-id="start-process-dialog-search-input"]')).nativeElement;
        searchInput.click();
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        const processCategoryElements = fixture.debugElement.queryAll(By.css('.app-processes-list-items .app-process-label'));

        expect(processCategoryElements.length).withContext('category element should not be found').toBe(0);
    });

    it('should display items under default category when process has specific category set', async () => {
        const processesByCategory = [
            createProcess({
                category: 'http://bpmn.io/schema/bpmn',
                name: 'name1',
            }),
            createProcess({
                category: 'http://www.activiti.org/processdef',
                name: 'name2',
            }),
            createProcess({ category: '', name: 'name3' }),
        ];
        processesListComponent.processes = processesByCategory;
        processesListComponent.ngOnChanges({
            processes: {
                currentValue: processesByCategory,
                previousValue: undefined,
                isFirstChange: () => true,
                firstChange: true,
            },
        });

        const searchInput = fixture.debugElement.query(By.css('[data-automation-id="start-process-dialog-search-input"]')).nativeElement;
        searchInput.click();
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));

        fixture.detectChanges();
        await fixture.whenStable();

        const categoryLabel = fixture.debugElement.query(By.css('.app-processes-list-items .app-process-label'));

        expect(categoryLabel).withContext('should not display any category label').toBeNull();

        const processItems = fixture.debugElement.queryAll(By.css('.app-processes-list-item'));

        expect(processItems.length).toBe(processesByCategory.length);

        const name1 = getElementText(processItems[0], '.app-processes-list-item-name');
        const name2 = getElementText(processItems[1], '.app-processes-list-item-name');
        const name3 = getElementText(processItems[2], '.app-processes-list-item-name');

        expect(name1).toBe(name1);
        expect(name2).toBe(name2);
        expect(name3).toBe(name3);
    });
});
