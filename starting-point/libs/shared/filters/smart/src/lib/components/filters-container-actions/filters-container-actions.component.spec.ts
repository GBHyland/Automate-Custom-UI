/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FiltersContainerActionsComponent } from './filters-container-actions.component';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ButtonHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';
import { MatButtonHarness } from '@angular/material/button/testing';
import { FilterService, RadioFilter } from '@alfresco-dbp/shared-filters-services';
import { of } from 'rxjs';
import { FilterSaveAsDialogComponent } from '../filter-save-as-dialog/filter-save-as-dialog.component';
import { getAllFiltersMock, getRadioFilterMock } from '../../mock/filters.mock';
import { MatDialogModule } from '@angular/material/dialog';

const ActionLabel = {
    SAVE: 'FILTERS.SAVE',
    SAVE_AS: 'FILTERS.SAVE_AS',
    DELETE: 'FILTERS.DELETE',
    RESET: 'FILTERS.RESET',
} as const;
type ActionLabel = typeof ActionLabel[keyof typeof ActionLabel];

describe('FiltersContainerActionsComponent', () => {
    let component: FiltersContainerActionsComponent;
    let fixture: ComponentFixture<FiltersContainerActionsComponent>;
    let filterService: FilterService;

    const getActionButton = async (actionLabel: ActionLabel): Promise<MatButtonHarness | null> => {
        const allButtons = await ButtonHarnessUtils.getAllButtons({ fixture });
        const allButtonsTextPromises = allButtons.map((button) => button.getText());
        const allButtonsText = await Promise.all(allButtonsTextPromises);

        const actionButtonIndex = allButtonsText.findIndex((text) => text === actionLabel);
        return actionButtonIndex === -1 ? null : allButtons[actionButtonIndex];
    };

    const setDefaultFilter = (isDefault: boolean) => {
        if (isDefault) {
            component.isDefaultFilter = true;
            component.ngOnChanges({
                isDefaultFilter: {
                    currentValue: true,
                    previousValue: false,
                    firstChange: false,
                    isFirstChange: () => false,
                },
            });
        } else {
            component.isDefaultFilter = false;
            component.ngOnChanges({
                isDefaultFilter: {
                    currentValue: false,
                    previousValue: true,
                    firstChange: false,
                    isFirstChange: () => false,
                },
            });
        }
    };

    const setFiltersDirty = (isDirty: boolean) => {
        if (isDirty) {
            filterService.setFilters(getAllFiltersMock());
            filterService.updateFilter({
                ...getRadioFilterMock(),
                value: { value: 'mockValue2', label: 'mockLabel2', checked: true },
            } as RadioFilter);
        } else {
            filterService.setFilters(getAllFiltersMock());
        }
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, NoopTranslateModule, FiltersContainerActionsComponent, MatDialogModule],
            providers: [FilterService],
        });

        fixture = TestBed.createComponent(FiltersContainerActionsComponent);
        filterService = TestBed.inject(FilterService);

        component = fixture.componentInstance;
        component.visibleActions = ['save', 'saveAs', 'delete', 'reset'];
    });

    describe('Reset Action', () => {
        it('should be disabled when filtersDirty is false', async () => {
            setFiltersDirty(false);
            fixture.detectChanges();

            let resetButton = await getActionButton(ActionLabel.RESET);
            expect(await resetButton?.isDisabled()).toBeTrue();

            setFiltersDirty(true);
            fixture.detectChanges();

            resetButton = await getActionButton(ActionLabel.RESET);
            expect(await resetButton?.isDisabled()).toBeFalse();
        });

        it('should call resetFilters on click', async () => {
            const resetSpy = spyOn(filterService, 'resetFilters');
            setFiltersDirty(true);
            fixture.detectChanges();

            const resetButton = await getActionButton(ActionLabel.RESET);
            if (resetButton) {
                await resetButton.click();
                expect(resetSpy).toHaveBeenCalled();
            } else {
                fail('Reset button not found');
            }
        });
    });

    describe('Save Action', () => {
        it('should be disabled when filtersDirty is false', async () => {
            setDefaultFilter(false);
            setFiltersDirty(false);
            fixture.detectChanges();

            let saveButton = await getActionButton(ActionLabel.SAVE);
            expect(await saveButton?.isDisabled()).toBeTrue();

            setDefaultFilter(false);
            setFiltersDirty(true);
            fixture.detectChanges();

            saveButton = await getActionButton(ActionLabel.SAVE);
            expect(await saveButton?.isDisabled()).toBeFalse();
        });

        it('should not be visible for default filters', async () => {
            setDefaultFilter(true);
            fixture.detectChanges();

            const saveButton = await getActionButton(ActionLabel.SAVE);
            expect(saveButton).toBeNull();
        });

        it('should be visible for non-default filters', async () => {
            setDefaultFilter(false);
            fixture.detectChanges();

            const saveButton = await getActionButton(ActionLabel.SAVE);
            expect(saveButton).not.toBeNull();
        });

        it('should emit saveClick', async () => {
            const saveSpy = spyOn(component.saveClick, 'emit');
            setFiltersDirty(true);
            setDefaultFilter(false);
            fixture.detectChanges();

            const saveButton = await getActionButton(ActionLabel.SAVE);

            if (saveButton) {
                await saveButton.click();
                expect(saveSpy).toHaveBeenCalled();
            } else {
                fail('Save button not found');
            }
        });
    });

    describe('Save As Action', () => {
        it('should be disabled when filtersDirty is false', async () => {
            setFiltersDirty(false);
            fixture.detectChanges();

            let saveAsButton = await getActionButton(ActionLabel.SAVE_AS);
            expect(await saveAsButton?.isDisabled()).toBeTrue();

            setFiltersDirty(true);
            fixture.detectChanges();

            saveAsButton = await getActionButton(ActionLabel.SAVE_AS);
            expect(await saveAsButton?.isDisabled()).toBeFalse();
        });

        it('should open FilterSaveAsDialogComponent on click and emit saveAsClick with name', async () => {
            const dialogOpenSpy = spyOn(component.dialog, 'open').and.returnValue({
                afterClosed: () => of({ name: 'name' }),
            } as any);
            const saveAsSpy = spyOn(component.saveAsClick, 'emit');
            setFiltersDirty(true);
            fixture.detectChanges();

            const saveAsButton = await getActionButton(ActionLabel.SAVE_AS);
            if (saveAsButton) {
                await saveAsButton.click();

                expect(dialogOpenSpy).toHaveBeenCalledWith(FilterSaveAsDialogComponent, {
                    height: 'auto',
                    minWidth: '500px',
                });
                expect(saveAsSpy).toHaveBeenCalledWith('name');
            } else {
                fail('Save As button not found');
            }
        });
    });

    describe('Delete Action', () => {
        it('should not be visible for default filters', async () => {
            setDefaultFilter(true);
            fixture.detectChanges();

            const deleteButton = await getActionButton(ActionLabel.DELETE);
            expect(deleteButton).toBeNull();
        });

        it('should be visible for non-default filters', async () => {
            setDefaultFilter(false);
            fixture.detectChanges();

            const deleteButton = await getActionButton(ActionLabel.DELETE);
            expect(deleteButton).not.toBeNull();
        });

        it('should emit deleteClick', async () => {
            const deleteSpy = spyOn(component.deleteClick, 'emit');
            setDefaultFilter(false);
            fixture.detectChanges();

            const deleteButton = await getActionButton(ActionLabel.DELETE);
            if (deleteButton) {
                await deleteButton.click();
                expect(deleteSpy).toHaveBeenCalled();
            } else {
                fail('Delete button not found');
            }
        });
    });
});
