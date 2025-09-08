/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProcessListByCategoryComponent } from '../process-list-by-category/process-list-by-category.component';
import { StartProcessDialogComponent } from './start-process-dialog.component';
import { MatDialogRef } from '@angular/material/dialog';
import { ProcessDefinitionCloud } from '@alfresco/adf-process-services-cloud';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import {
    selectProcessDefinitionEntities,
    selectRecentProcessDefinitionKeys,
    selectProcessDefinitionsLoadingError,
} from '../../../../store/selectors/process-definitions.selector';
import { FeatureCloudRootState } from '../../../../store/states/state';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { ButtonHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';

describe('StartProcessDialogComponent', () => {
    let fixture: ComponentFixture<StartProcessDialogComponent>;
    let processes: ProcessDefinitionCloud[];
    let store: MockStore<FeatureCloudRootState>;

    const mockDialogRef = {
        close: jasmine.createSpy('close'),
        open: jasmine.createSpy('open'),
    };

    beforeEach(() => {
        processes = [
            {
                id: 'id1',
                name: 'name1',
                appName: 'appName1',
                appVersion: 1,
                version: 1,
                category: 'category1',
                key: 'key1',
                description: 'description1',
            },
            {
                id: 'id2',
                name: 'name2',
                appName: 'appName2',
                appVersion: 1,
                version: 1,
                category: 'category2',
                key: 'key2',
                description: 'description2',
            },
        ];

        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, NoopTranslateModule, StartProcessDialogComponent],
            providers: [
                provideMockStore({
                    selectors: [
                        {
                            selector: selectProcessDefinitionEntities,
                            value: processes,
                        },
                        {
                            selector: selectRecentProcessDefinitionKeys,
                            value: ['key1'],
                        },
                        {
                            selector: selectProcessDefinitionsLoadingError,
                            value: '',
                        },
                    ],
                }),
                {
                    provide: MatDialogRef,
                    useValue: mockDialogRef,
                },
            ],
        });

        fixture = TestBed.createComponent(StartProcessDialogComponent);
        store = TestBed.inject(MockStore);

        fixture.detectChanges();
    });

    afterEach(() => {
        store.resetSelectors();
    });

    it('should pass list of processes to ProcessListByCategoryComponent', () => {
        const processListByCategory = fixture.debugElement.query(By.css('process-list-by-category'))
            .componentInstance as ProcessListByCategoryComponent;

        fixture.detectChanges();
        expect(processListByCategory.processes).toEqual(processes);
    });

    it('should pass list of recent processes keys', () => {
        const processListByCategory = fixture.debugElement.query(By.css('process-list-by-category'))
            .componentInstance as ProcessListByCategoryComponent;

        fixture.detectChanges();
        expect(processListByCategory.recentDefinitionKeys).toEqual(['key1']);
    });

    it('should show error', () => {
        selectProcessDefinitionsLoadingError.setResult('error');
        store.refreshState();
        fixture.detectChanges();

        const processListByCategory = fixture.debugElement.query(By.css('process-list-by-category'));

        const loadingProcessesError = fixture.debugElement.query(By.css('.apa-loading-processes-error')).nativeElement;

        expect(loadingProcessesError.textContent.trim()).toBe('PROCESS_CLOUD_EXTENSION.DIALOG.ERROR');
        expect(processListByCategory).toBe(null);
    });

    it('should emit on process select', () => {
        const processListByCategory = fixture.debugElement.query(By.css('process-list-by-category'));
        const expectedProcess = {
            id: 'id',
            name: 'name',
        };

        processListByCategory.triggerEventHandler('selectProcess', expectedProcess);
        expect(mockDialogRef.close).toHaveBeenCalledWith(expectedProcess.name);
    });

    it('should close dialog with button', async () => {
        await ButtonHarnessUtils.clickButton({
            fixture,
            buttonFilters: { selector: '[data-automation-id="apa-start-process-dialog-close-button"]' },
        });

        expect(mockDialogRef.close).toHaveBeenCalledWith('');
    });
});
