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
import { MockComponent } from 'ng-mocks';
import { FilterService } from '@alfresco-dbp/shared-filters-services';
import { FiltersContainerComponent } from './filters-container.component';
import { FilterSaveAsDialogComponent } from '../filter-save-as-dialog/filter-save-as-dialog.component';
import { FiltersContainerActionsComponent } from '../filters-container-actions/filters-container-actions.component';
import { of } from 'rxjs';
import { MoreFiltersMenuComponent } from '../more-filters-menu/more-filters-menu.component';
import { getAllFiltersMock, getRadioFilterMock } from '../../mock/filters.mock';
import { ExpansionPanelHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';

describe('FiltersContainerComponent', () => {
    let component: FiltersContainerComponent;
    let fixture: ComponentFixture<FiltersContainerComponent>;
    let filterService: FilterService;

    const getExpansionPanel = async () => {
        return ExpansionPanelHarnessUtils.getExpansionPanel({
            fixture,
            expansionPanelFilters: {
                selector: `[data-automation-id="hxp-filters-container-expansion-panel"]`,
            },
        });
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                NoopTranslateModule,
                FiltersContainerComponent,
                MockComponent(FilterSaveAsDialogComponent),
                MockComponent(FiltersContainerActionsComponent),
                MockComponent(MoreFiltersMenuComponent),
            ],
        }).overrideProvider(FilterService, {
            useValue: {
                getAllFilters: () => {
                    return of(getAllFiltersMock());
                },
                updateFilter: () => of({}),
                setFilters: () => of({}),
                filterValuesChanged$: of(true),
            },
        });

        filterService = TestBed.inject(FilterService);
        fixture = TestBed.createComponent(FiltersContainerComponent);
        component = fixture.componentInstance;
        component.visibleActions = ['save', 'saveAs', 'delete', 'reset'];
    });

    it('should subscribe to get filters on init', () => {
        const allFiltersMock = getAllFiltersMock();

        fixture.detectChanges();

        expect(component.allFilters).toEqual(allFiltersMock);
        expect(component.visibleFilters).toEqual(allFiltersMock.filter((filter) => filter.visible));
    });

    it('should emit filtersChange if filters changed ', async () => {
        filterService.filterValuesChanged$ = of(true);
        const filtersChangeSpy = spyOn(component.filtersChange, 'emit');

        fixture.detectChanges();
        await fixture.whenStable();

        expect(filtersChangeSpy).toHaveBeenCalled();
    });

    it('should not emit filtersChange if filters have not changed ', () => {
        filterService.filterValuesChanged$ = of(false);
        const filtersChangeSpy = spyOn(component.filtersChange, 'emit');

        fixture.detectChanges();

        expect(filtersChangeSpy).not.toHaveBeenCalled();
    });

    it('should set filters on change', () => {
        const allFiltersMock = getAllFiltersMock();
        const setFiltersSpy = spyOn(filterService, 'setFilters');

        component.filters = allFiltersMock;
        component.ngOnChanges();

        expect(setFiltersSpy).toHaveBeenCalledWith(allFiltersMock);
    });

    it('should expansion panel be folded and disabled when loading is true', async () => {
        fixture.detectChanges();
        const expansionPanel = await getExpansionPanel();
        const expanded = await expansionPanel.isExpanded();
        const disabled = await expansionPanel.isDisabled();

        expect(expanded).toBeFalse();
        expect(disabled).toBeTrue();
    });

    it('should expansion panel be expanded and enabled when loading is false', async () => {
        component.loading = false;
        fixture.detectChanges();

        const expansionPanel = await getExpansionPanel();
        const expanded = await expansionPanel.isExpanded();
        const disabled = await expansionPanel.isDisabled();

        expect(expanded).toBeTrue();
        expect(disabled).toBeFalse();
    });

    it('should update filter value', () => {
        spyOn(filterService, 'updateFilter');
        component.onFilterValueChange(getRadioFilterMock());

        expect(filterService.updateFilter).toHaveBeenCalledWith(getRadioFilterMock());
    });

    it('should remove filter', () => {
        const radioFilterMock = getRadioFilterMock();
        spyOn(filterService, 'updateFilter');
        component.onFilterRemove(radioFilterMock);

        expect(radioFilterMock.visible).toBeFalse();
        expect(filterService.updateFilter).toHaveBeenCalledWith(radioFilterMock);
    });

    it('should save filters', () => {
        const allFiltersMock = getAllFiltersMock();
        const setFiltersSpy = spyOn(filterService, 'setFilters');
        const saveFilterSpy = spyOn(component.saveFilter, 'emit');

        component.filters = allFiltersMock;
        fixture.detectChanges();
        component.onFiltersSave();

        expect(setFiltersSpy).toHaveBeenCalledWith(allFiltersMock);
        expect(saveFilterSpy).toHaveBeenCalled();
    });
});
