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
import { CheckboxFilterComponent } from './checkbox-filter.component';
import { CheckboxFilter } from '@alfresco-dbp/shared-filters-services';
import { OverlayContainer, OverlayModule } from '@angular/cdk/overlay';
import { FilterChipComponent } from '../../filter-chip/filter-chip.component';
import { clickChip } from '../../../utils/filter-testing-utils';
import { CheckboxFilterMenuComponent } from './checkbox-filter-menu/checkbox-filter-menu.component';
import { MockComponent } from 'ng-mocks';

describe('CheckboxFilterComponent', () => {
    let component: CheckboxFilterComponent;
    let fixture: ComponentFixture<CheckboxFilterComponent>;
    let overlay: HTMLElement;
    let overlayContainer: OverlayContainer;
    let filterChipId: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                NoopTranslateModule,
                CheckboxFilterComponent,
                OverlayModule,
                FilterChipComponent,
                MockComponent(CheckboxFilterMenuComponent),
            ],
        });

        fixture = TestBed.createComponent(CheckboxFilterComponent);
        component = fixture.componentInstance;
        component.filter = new CheckboxFilter({
            name: 'mockName',
            translationKey: 'mockLabel',
            value: null,
            options: [
                { value: 'mockValue', label: 'mockLabel' },
                { value: 'mockValue2', label: 'mockLabel2' },
            ],
            visible: true,
        });
        fixture.detectChanges();
        overlayContainer = TestBed.inject(OverlayContainer);
        overlay = overlayContainer.getContainerElement();

        filterChipId = component.filter.name + '-filter-chip';
    });

    it('should open and close menu on chip click', async () => {
        await clickChip(fixture, filterChipId);
        let menu = overlay.querySelector('[data-automation-id="hxp-checkbox-filter-menu"]');
        expect(menu).not.toBeNull();

        await clickChip(fixture, filterChipId);
        expect(component.isMenuOpen).toBeFalse();
        menu = overlay.querySelector('[data-automation-id="hxp-checkbox-filter-menu"]');
        expect(menu).toBeNull();
    });

    it('should update filter value, emit filterChange and close the menu when update button is clicked', async () => {
        spyOn(component.filterChange, 'emit');

        component.onUpdate([
            { value: 'newMockValue', label: 'newMockLabel' },
            { value: 'newMockValue2', label: 'newMockLabel2' },
        ]);

        if (component.filter?.value) {
            expect(component.filter.value?.map((option) => option.value)).toEqual(['newMockValue', 'newMockValue2']);
            expect(component.filterChange.emit).toHaveBeenCalledWith(component.filter);
            expect(component.isMenuOpen).toBeFalse();
        } else {
            fail('Filter value should not be null');
        }
    });
});
