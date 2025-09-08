/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { ExtensionService } from '@alfresco/adf-extensions';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { fakeDefaultPresetColumns } from '../features/process-list/mock/process-list.mock';
import { ProcessServicesCloudExtensionService } from './process-services-cloud-extension.service';
import { selectProcessDefinitionsVariableColumnsSchema } from '../store/selectors/datatable-columns-schema.selector';

describe('ProcessServicesCloudExtensionService', () => {
    let extensionService: ExtensionService;
    let service: ProcessServicesCloudExtensionService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule],
            providers: [
                ProcessServicesCloudExtensionService,
                ExtensionService,
                provideMockStore({
                    initialState: {},
                    selectors: [
                        {
                            selector: selectProcessDefinitionsVariableColumnsSchema,
                            value: fakeDefaultPresetColumns,
                        },
                    ],
                }),
            ],
        });

        extensionService = TestBed.inject(ExtensionService);
        service = TestBed.inject(ProcessServicesCloudExtensionService);
    });

    it('should return true if column resizing is enabled', () => {
        spyOn(extensionService, 'getElements').and.returnValue([{ id: 'column-resizing', enabled: true } as any]);

        expect(service.isColumnResizingEnabled('features.taskList.presets.column-resizing')).toBeTrue();
    });

    it('should return false if column resizing is disabled', () => {
        spyOn(extensionService, 'getElements').and.returnValue([{ id: 'column-resizing', enabled: false } as any]);

        expect(service.isColumnResizingEnabled('features.taskList.presets.column-resizing')).toBeFalse();
    });

    it('should return false if column resizing ID is not correct [column-resizing]', () => {
        spyOn(extensionService, 'getElements').and.returnValue([{ id: 'columnResizing', enabled: true } as any]);

        expect(service.isColumnResizingEnabled('features.taskList.presets.column-resizing')).toBeFalse();
    });

    it('should return false if column resizing is not provided in the config json', () => {
        spyOn(extensionService, 'getElements').and.returnValue([]);

        expect(service.isColumnResizingEnabled('features.taskList.presets.column-resizing')).toBeFalse();
    });

    it('should call extensionService with the right param', () => {
        spyOn(extensionService, 'getElements').and.returnValue([]);

        service.isColumnResizingEnabled('features.taskList.presets.column-resizing');

        expect(extensionService.getElements).toHaveBeenCalledWith('features.taskList.presets.column-resizing');
    });
});
