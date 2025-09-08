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
import { NumberFilterComponent } from './number-filter.component';
import { NumberFilter } from '@alfresco-dbp/shared-filters-services';
import { OverlayContainer, OverlayModule } from '@angular/cdk/overlay';
import { FilterChipComponent } from '../../filter-chip/filter-chip.component';
import { clickChip } from '../../../utils/filter-testing-utils';
import { NumberFilterMenuComponent } from './number-filter-menu/number-filter-menu.component';
import { MockComponent } from 'ng-mocks';

describe('NumberFilterComponent', () => {
    let component: NumberFilterComponent;
    let fixture: ComponentFixture<NumberFilterComponent>;
    let overlay: HTMLElement;
    let overlayContainer: OverlayContainer;
    let filterChipId: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                NoopTranslateModule,
                NumberFilterComponent,
                OverlayModule,
                FilterChipComponent,
                MockComponent(NumberFilterMenuComponent),
            ],
        });

        fixture = TestBed.createComponent(NumberFilterComponent);
        component = fixture.componentInstance;
        component.filter = new NumberFilter({
            name: 'mockName',
            translationKey: 'mockLabel',
            value: {
                value1: null,
                operator: 'EQUALS',
                value2: null,
            },
            visible: true,
        });
        fixture.detectChanges();
        overlayContainer = TestBed.inject(OverlayContainer);
        overlay = overlayContainer.getContainerElement();

        filterChipId = component.filter.name + '-filter-chip';
    });

    it('should open and close menu on chip click', async () => {
        await clickChip(fixture, filterChipId);
        let menu = overlay.querySelector('[data-automation-id="hxp-number-filter-menu"]');
        expect(menu).not.toBeNull();

        await clickChip(fixture, filterChipId);
        expect(component.isMenuOpen).toBeFalse();
        menu = overlay.querySelector('[data-automation-id="hxp-number-filter-menu"]');
        expect(menu).toBeNull();
    });

    it('should update filter value, emit filterChange and close the menu when update button is clicked', async () => {
        spyOn(component.filterChange, 'emit');

        component.onUpdate({
            value1: 0,
            operator: 'EQUALS',
            value2: null,
        });

        if (component.filter) {
            expect(component.filter.value?.value1).toBe(0);
            expect(component.filter.value?.operator).toBe('EQUALS');
            expect(component.filter.value?.value2).toBeNull();
            expect(component.filterChange.emit).toHaveBeenCalledWith(component.filter);
            expect(component.isMenuOpen).toBeFalse();
        } else {
            fail('Filter should not be null');
        }
    });

    describe('should update label suffix correctly', () => {
        it('when operator is BETWEEN', () => {
            component.onUpdate({
                value1: 3,
                operator: 'BETWEEN',
                value2: 5,
            });
            fixture.detectChanges();

            expect(component.labelSuffix).toBe('FILTERS.NUMBER_FILTER.RANGE.BETWEEN_AND');
        });

        it('when operator is not BETWEEN', () => {
            component.onUpdate({
                value1: 4,
                operator: 'GREATER_THAN',
                value2: null,
            });
            fixture.detectChanges();

            expect(component.labelSuffix).toBe('FILTERS.NUMBER_FILTER.GREATER_THAN 4');
        });
    });
});
