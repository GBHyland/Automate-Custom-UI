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
import { DateFilterComponent } from './date-filter.component';
import { DATE_OPTIONS, DateFilter, RANGE_DATE_OPTION } from '@alfresco-dbp/shared-filters-services';
import { OverlayContainer, OverlayModule } from '@angular/cdk/overlay';
import { FilterChipComponent } from '../../filter-chip/filter-chip.component';
import { clickChip } from '../../../utils/filter-testing-utils';
import { DateFilterMenuComponent } from './date-filter-menu/date-filter-menu.component';
import { MockComponent } from 'ng-mocks';

describe('DateFilterComponent', () => {
    let component: DateFilterComponent;
    let fixture: ComponentFixture<DateFilterComponent>;
    let overlay: HTMLElement;
    let overlayContainer: OverlayContainer;
    let filterChipId: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                NoopTranslateModule,
                DateFilterComponent,
                OverlayModule,
                FilterChipComponent,
                MockComponent(DateFilterMenuComponent),
            ],
        });

        fixture = TestBed.createComponent(DateFilterComponent);
        component = fixture.componentInstance;
        component.filter = new DateFilter({
            name: 'mockName',
            translationKey: 'mockLabel',
            value: {
                selectedOption: null,
                range: null,
            },
            options: DATE_OPTIONS,
            visible: true,
        });
        fixture.detectChanges();
        overlayContainer = TestBed.inject(OverlayContainer);
        overlay = overlayContainer.getContainerElement();

        filterChipId = component.filter.name + '-filter-chip';
    });

    it('should open and close menu on chip click', async () => {
        await clickChip(fixture, filterChipId);
        let menu = overlay.querySelector('[data-automation-id="hxp-date-filter-menu"]');
        expect(menu).not.toBeNull();

        await clickChip(fixture, filterChipId);
        expect(component.isMenuOpen).toBeFalse();
        menu = overlay.querySelector('[data-automation-id="hxp-date-filter-menu"]');
        expect(menu).toBeNull();
    });

    it('should update filter value, emit filterChange and close the menu when update button is clicked', async () => {
        spyOn(component.filterChange, 'emit');

        component.onUpdate({
            selectedOption: DATE_OPTIONS[0],
            range: null,
        });

        if (component.filter?.value) {
            expect(component.filter.value?.selectedOption?.value).toBe(DATE_OPTIONS[0].value);
            expect(component.filterChange.emit).toHaveBeenCalledWith(component.filter);
            expect(component.isMenuOpen).toBeFalse();
        } else {
            fail('Filter value is not set');
        }
    });

    describe('should update suffix properly', () => {
        it('when filter value is null', async () => {
            component.onUpdate({
                selectedOption: null,
                range: null,
            });

            expect(component.labelSuffix).toBe('');
        });

        it('when filter value is not range', async () => {
            component.onUpdate({
                selectedOption: DATE_OPTIONS[0],
                range: null,
            });

            expect(component.labelSuffix).toBe(DATE_OPTIONS[0].label);
        });

        it('when filter value is range and from is set', async () => {
            const newDate = new Date('2021-01-01T00:00:00.000Z');
            component.onUpdate({
                selectedOption: RANGE_DATE_OPTION,
                range: {
                    from: newDate,
                    to: null,
                },
            });

            expect(component.labelSuffix).toBe(`FILTERS.DATE_FILTER.FROM_DATE`);
            expect(component.filter?.value?.range?.from).toEqual(newDate);
        });

        it('when filter value is range and to is set', async () => {
            const newDate = new Date('2021-01-01T00:00:00.000Z');
            component.onUpdate({
                selectedOption: RANGE_DATE_OPTION,
                range: {
                    from: null,
                    to: newDate,
                },
            });

            expect(component.labelSuffix).toBe('FILTERS.DATE_FILTER.TO_DATE');
            expect(component.filter?.value?.range?.to).toEqual(newDate);
        });

        it('when filter value is range and both from and to are set', async () => {
            component.onUpdate({
                selectedOption: RANGE_DATE_OPTION,
                range: {
                    from: new Date('2021-01-01T00:00:00.000Z'),
                    to: new Date('2021-01-02T00:00:00.000Z'),
                },
            });

            const expectedSuffix = `${component.filter?.value?.range?.from?.toLocaleDateString()} - ${component.filter?.value?.range?.to?.toLocaleDateString()}`;
            expect(component.labelSuffix).toBe(expectedSuffix);
        });

        it('when filter value is range and both "from" and "to" are set and filter should use time', async () => {
            component.filter.useTime = true;
            const from = new Date(`2021-01-01T20:10:00.000Z`);
            const to = new Date('2021-01-02T10:00:00.000Z');

            component.onUpdate({
                selectedOption: RANGE_DATE_OPTION,
                range: {
                    from,
                    to,
                },
            });

            const expectedSuffix = `${from.toLocaleString()} - ${to.toLocaleString()}`;
            expect(component.labelSuffix).toBe(expectedSuffix);
        });
    });
});
