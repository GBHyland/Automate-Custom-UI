/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidenavProcessManagementComponent } from './sidenav-process-management.component';
import { provideMockStore } from '@ngrx/store/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatExpansionPanelHarness } from '@angular/material/expansion/testing';
import { NoopTranslateModule } from '@alfresco/adf-core';

describe('SidenavProcessManagementComponent', () => {
    let fixture: ComponentFixture<SidenavProcessManagementComponent>;
    let component: SidenavProcessManagementComponent;
    let loader: HarnessLoader;

    const mockStoreState = {
        processServicesCloud: {
            extension: {
                selectedFilter: {
                    filter: {
                        id: '1',
                    },
                },
            },
            application: 'mock app',
        },
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [BrowserAnimationsModule, NoopTranslateModule, SidenavProcessManagementComponent],
            providers: [
                provideMockStore({
                    initialState: mockStoreState,
                }),
            ],
        });
        fixture = TestBed.createComponent(SidenavProcessManagementComponent);
        component = fixture.componentInstance;
        component.data = {
            state: 'expanded',
        };

        loader = TestbedHarnessEnvironment.loader(fixture);

        fixture.detectChanges();
    });

    it('should process management section be expanded when a filter is selected', async () => {
        const processManagementExpansionPanel = await loader.getHarness(MatExpansionPanelHarness);
        const isPanelExpanded = await processManagementExpansionPanel.isExpanded();

        expect(component.currentFilter).toEqual({ id: '1' });
        expect(isPanelExpanded).toEqual(true);
    });
});
