/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { UserFilterComponent } from './user-filter.component';
import { UserFilter } from '@alfresco-dbp/shared-filters-services';
import { OverlayContainer, OverlayModule } from '@angular/cdk/overlay';
import { FilterChipComponent } from '../../filter-chip/filter-chip.component';
import { clickChip } from '../../../utils/filter-testing-utils';
import { UserFilterMenuComponent } from './user-filter-menu/user-filter-menu.component';
import { MockComponent } from 'ng-mocks';

describe('UserFilterComponent', () => {
    let component: UserFilterComponent;
    let fixture: ComponentFixture<UserFilterComponent>;
    let overlay: HTMLElement;
    let overlayContainer: OverlayContainer;
    let filterChipId: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                NoopTranslateModule,
                UserFilterComponent,
                OverlayModule,
                FilterChipComponent,
                MockComponent(UserFilterMenuComponent),
            ],
        });

        fixture = TestBed.createComponent(UserFilterComponent);
        component = fixture.componentInstance;
        component.filter = new UserFilter({
            name: 'mockName',
            translationKey: 'mockLabel',
            value: null,
            appName: 'mockAppName',
            visible: true,
        });
        fixture.detectChanges();
        overlayContainer = TestBed.inject(OverlayContainer);
        overlay = overlayContainer.getContainerElement();

        filterChipId = component.filter.name + '-filter-chip';
    });

    it('should open and close menu on chip click', async () => {
        await clickChip(fixture, filterChipId);
        let menu = overlay.querySelector('[data-automation-id="hxp-user-filter-menu"]');
        expect(menu).not.toBeNull();

        await clickChip(fixture, filterChipId);
        expect(component.isMenuOpen).toBeFalse();
        menu = overlay.querySelector('[data-automation-id="hxp-user-filter-menu"]');
        expect(menu).toBeNull();
    });

    it('should update filter value, emit filterChange and close the menu when update button is clicked', async () => {
        spyOn(component.filterChange, 'emit');

        component.onUpdate([{ id: 'newMockId', username: 'newMockValue' }]);

        if (component.filter && component.filter.value) {
            expect(component.filter.value[0].id).toBe('newMockId');
            expect(component.filterChange.emit).toHaveBeenCalledWith(component.filter);
            expect(component.isMenuOpen).toBeFalse();
        } else {
            fail('Filter should not be null');
        }
    });
});
