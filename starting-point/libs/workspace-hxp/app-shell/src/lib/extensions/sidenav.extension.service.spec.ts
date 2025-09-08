/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { SidenavExtensionService } from './sidenav.extension.service';
import { mockSidenavItems } from './mock/sidenav-items.mock';
import { ExtensionService } from '@alfresco/adf-extensions';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SidenavExtensionService', () => {
    let sidenavExtensionService: SidenavExtensionService;
    let extensionService: ExtensionService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [SidenavExtensionService],
        });

        sidenavExtensionService = TestBed.inject(SidenavExtensionService);
        extensionService = TestBed.inject(ExtensionService);
    });

    function mockEvaluateFunction(evaluator: string) {
        return evaluator === 'mock-my-files-evaluator' || evaluator === 'primary-sidenav-evaluator';
    }

    it('should keep only the groups and items that have a satisfied visibility rule', (done) => {
        const expectedSidenavItems = [
            {
                id: 'app.navbar.primary',
                items: [
                    {
                        id: 'mock-sidenav-item-my-files',
                        icon: 'file',
                        route: 'my-files-mock-route',
                        title: 'my files mock',
                        rules: {
                            visible: 'mock-my-files-evaluator',
                        },
                    },
                ],
                rules: {
                    visible: 'primary-sidenav-evaluator',
                },
            },
        ];

        sidenavExtensionService.sidenavGroups$.subscribe((sidenavItems) => {
            expect(sidenavItems).toEqual(expectedSidenavItems);
            done();
        });
        spyOn(extensionService, 'evaluateRule').and.callFake(mockEvaluateFunction);
        sidenavExtensionService.loadSidenavItems(mockSidenavItems);
    });

    it('should sort group items by order if available', (done) => {
        const unsortedItems = [
            {
                id: 'app.navbar.primary',
                items: [
                    {
                        id: 'mock-sidenav-item-my-files',
                        icon: 'file',
                        route: 'my-files-mock-route',
                        title: 'my files mock',
                        order: 3,
                    },
                    {
                        id: 'mock-sidenav-item-shared-files',
                        icon: 'file',
                        route: 'shared-files-mock-route',
                        title: 'shared files mock',
                    },
                    {
                        id: 'mock-sidenav-item-search-files',
                        icon: 'search',
                        route: 'search-files-mock-route',
                        title: 'search files mock',
                        order: 1,
                    },
                ],
            },
        ];
        const expectedSidenavItems = [
            {
                id: 'app.navbar.primary',
                items: [unsortedItems[0].items[2], unsortedItems[0].items[0], unsortedItems[0].items[1]],
            },
        ];

        sidenavExtensionService.sidenavGroups$.subscribe((sidenavItems) => {
            expect(sidenavItems).toEqual(expectedSidenavItems);
            done();
        });
        sidenavExtensionService.loadSidenavItems(unsortedItems);
    });
});
