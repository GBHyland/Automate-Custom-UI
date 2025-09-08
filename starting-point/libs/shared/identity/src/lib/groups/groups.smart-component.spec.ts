/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AppConfigService, AppConfigServiceMock, NoopTranslateModule } from '@alfresco/adf-core';
import { AlfrescoApiService, AlfrescoApiServiceMock } from '@alfresco/adf-content-services';
import { CommonModule } from '@angular/common';
import { SimpleChange } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { mockFoodGroups, mockVegetableAubergine, mockMeatChicken } from '../mock/group.mock';
import { IdentityGroupService } from '../services/identity-group.service';
import { ChipHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';

import { GroupsSmartComponent } from './groups.smart-component';
import { SHARED_IDENTITY_GROUP_SERVICE_TOKEN } from '../services/identity-group-service.token';

const TYPING_DEBOUNCE_TIME = 500;

describe('GroupsSmartComponent', () => {
    let component: GroupsSmartComponent;
    let fixture: ComponentFixture<GroupsSmartComponent>;
    let element: HTMLElement;
    let identityGroupService: IdentityGroupService;
    let findGroupsByNameSpy: jasmine.Spy;

    function getElement<T = HTMLElement>(selector: string): T {
        return fixture.nativeElement.querySelector(selector);
    }

    async function searchGroup(value: string) {
        const input = getElement<HTMLInputElement>('input');
        input.focus();
        input.value = value;
        input.dispatchEvent(new Event('keyup'));
        input.dispatchEvent(new Event('input'));

        tick(TYPING_DEBOUNCE_TIME);
        fixture.detectChanges();
        tick();
    }

    async function searchGroupsAndBlur(value: string) {
        const input = getElement<HTMLInputElement>('input');
        input.focus();
        input.value = value;
        input.dispatchEvent(new Event('keyup'));
        input.dispatchEvent(new Event('input'));

        await fixture.whenStable();
        fixture.detectChanges();

        input.blur();
        fixture.detectChanges();
    }

    function getGroupListUI() {
        return fixture.debugElement.queryAll(By.css('[data-automation-id="ama-identity-group-row"]'));
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [CommonModule, NoopTranslateModule, NoopAnimationsModule, GroupsSmartComponent],
            providers: [
                {
                    provide: AlfrescoApiService,
                    useClass: AlfrescoApiServiceMock,
                },
                { provide: AppConfigService, useClass: AppConfigServiceMock },
                {
                    provide: SHARED_IDENTITY_GROUP_SERVICE_TOKEN,
                    useClass: IdentityGroupService,
                },
            ],
        });
        fixture = TestBed.createComponent(GroupsSmartComponent);
        component = fixture.componentInstance;
        element = fixture.nativeElement;

        identityGroupService = TestBed.inject(SHARED_IDENTITY_GROUP_SERVICE_TOKEN);
    });

    it('should populate placeholder when title is present', () => {
        component.title = 'TITLE_KEY';

        fixture.detectChanges();

        const matLabel = element.querySelector<HTMLInputElement>('#ama-identity-group-title-id');
        expect(matLabel?.textContent?.trim()).toEqual('TITLE_KEY');
    });

    describe('Search group', () => {
        beforeEach(() => {
            fixture.detectChanges();
            findGroupsByNameSpy = spyOn(identityGroupService, 'search').and.returnValue(of(mockFoodGroups));
        });

        it('should list the groups as dropdown options if the search term has results', fakeAsync(() => {
            searchGroup('All');

            const groupList = getGroupListUI();
            expect(groupList.length).toEqual(2);
        }));

        it('should not be able to search for a group that its name matches one of the preselected groups name', fakeAsync(() => {
            component.preSelectGroups = [{ name: mockVegetableAubergine.name }];
            const changes = new SimpleChange(null, [{ name: mockVegetableAubergine.name }], false);
            component.ngOnChanges({ preSelectGroups: changes });
            fixture.detectChanges();
            tick();

            searchGroup('Aubergine');

            const groupList = getGroupListUI();
            expect(groupList.length).toEqual(1);
        }));

        it('should hide result list if input is empty', fakeAsync(() => {
            searchGroup('');

            expect(element.querySelector('[data-automation-id="ama-identity-group-row"]')).toBeNull();
        }));

        it('should update selected groups when a group is selected', async () => {
            const selectEmitSpy = spyOn(component.selectGroup, 'emit');
            const changedGroupsSpy = spyOn(component.changedGroups, 'emit');

            component.onSelect(mockMeatChicken);

            fixture.detectChanges();
            await fixture.whenStable();

            expect(selectEmitSpy).toHaveBeenCalledWith(mockMeatChicken);
            expect(changedGroupsSpy).toHaveBeenCalledWith([mockMeatChicken]);
            expect(component.selectedGroups).toEqual([mockMeatChicken]);
        });

        it('should replace the group in single-selection mode', () => {
            component.mode = 'single';

            component.onSelect(mockVegetableAubergine);
            expect(component.selectedGroups).toEqual([mockVegetableAubergine]);

            component.onSelect(mockMeatChicken);
            expect(component.selectedGroups).toEqual([mockMeatChicken]);
        });

        it('should allow multiple groups in multi-selection mode', () => {
            component.mode = 'multiple';

            component.onSelect(mockVegetableAubergine);
            component.onSelect(mockMeatChicken);

            expect(component.selectedGroups).toEqual([mockVegetableAubergine, mockMeatChicken]);
        });

        it('should allow only unique groups in multi-selection mode', () => {
            component.mode = 'multiple';

            component.onSelect(mockVegetableAubergine);
            component.onSelect(mockMeatChicken);
            component.onSelect(mockMeatChicken);
            component.onSelect(mockVegetableAubergine);

            expect(component.selectedGroups).toEqual([mockVegetableAubergine, mockMeatChicken]);
        });

        it('should show an error message if the search result empty', async () => {
            findGroupsByNameSpy.and.returnValue(of([]));

            await searchGroupsAndBlur('INCORRECT_VALUE');

            const errorMessage = element.querySelector('[data-automation-id="invalid-groups-typing-error"]');
            expect(errorMessage).not.toBeNull();
            expect(errorMessage?.textContent).toContain('SHARED_IDENTITY.GROUPS.ERROR.NOT_FOUND');
        });
    });

    describe('No preselected groups', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should not pre-select any group when preSelectGroups is empty - single mode', async () => {
            component.mode = 'single';
            fixture.detectChanges();

            const chips = await ChipHarnessUtils.getChipRows({ fixture });
            expect(chips.length).toEqual(0);
        });

        it('should not pre-select any group when preSelectGroups is empty - multiple mode', async () => {
            component.mode = 'multiple';
            fixture.detectChanges();

            const chips = await ChipHarnessUtils.getChipRows({ fixture });
            expect(chips.length).toEqual(0);
        });
    });

    describe('Single Mode with pre-selected groups', async () => {
        const changes = new SimpleChange(null, mockFoodGroups, false);

        beforeEach(async () => {
            component.mode = 'single';
            component.preSelectGroups = mockFoodGroups;
            await component.ngOnChanges({ preSelectGroups: changes });
            fixture.detectChanges();
        });

        it('should show only one mat chip with the first preSelectedGroup', async () => {
            const chips = await ChipHarnessUtils.getChipRows({ fixture });

            expect(chips.length).toEqual(1);
            const chip = await chips[0].host();
            expect(await chip.matchesSelector(`[data-automation-id="ama-identity-group-chip-${mockVegetableAubergine.name}"]`)).toBeTrue();
        });
    });

    describe('Multiple Mode with pre-selected groups', () => {
        const change = new SimpleChange(null, mockFoodGroups, false);

        beforeEach(async () => {
            component.mode = 'multiple';
            component.preSelectGroups = mockFoodGroups;
            await component.ngOnChanges({ preSelectGroups: change });
            fixture.detectChanges();
        });

        it('should render all preselected groups', async () => {
            component.mode = 'multiple';
            fixture.detectChanges();
            await component.ngOnChanges({ preSelectGroups: change });
            fixture.detectChanges();
            const chips = await ChipHarnessUtils.getChipRows({ fixture });
            expect(chips.length).toBe(2);
        });

        it('should removeGroup and changedGroups emit when a selected group is removed', async () => {
            const removeGroupEmitterSpy = spyOn(component.removeGroup, 'emit');
            const changedGroupsEmitterSpy = spyOn(component.changedGroups, 'emit');
            component.mode = 'multiple';

            await ChipHarnessUtils.removeChipRowItems({
                fixture,
                chipRowFilter: { text: mockVegetableAubergine.name },
            });

            expect(removeGroupEmitterSpy).toHaveBeenCalledWith(mockVegetableAubergine);
            expect(changedGroupsEmitterSpy).toHaveBeenCalledWith([mockMeatChicken]);
            expect(
                component.selectedGroups.indexOf({
                    id: mockMeatChicken.id,
                    name: mockMeatChicken.name,
                })
            ).toEqual(-1);
        });
    });

    describe('Multiple Mode with read-only', () => {
        it('Should not show remove icon for pre-selected groups if readonly property set to true', async () => {
            component.mode = 'multiple';
            component.preSelectGroups = [
                {
                    id: mockVegetableAubergine.id,
                    name: mockVegetableAubergine.name,
                    readonly: true,
                },
                mockMeatChicken,
            ];
            const changes = new SimpleChange(null, [{ name: mockVegetableAubergine.name }], false);
            await component.ngOnChanges({ preSelectGroups: changes });
            fixture.detectChanges();

            await fixture.whenStable();

            const chipList = await ChipHarnessUtils.getChipRows({ fixture });

            expect(chipList.length).toBe(2);
            const removeIconAubergine = getElement(`[data-automation-id="ama-identity-group-chip-remove-icon-${mockVegetableAubergine.name}"]`);
            expect(removeIconAubergine).toBeNull();
            const removeIconPepper = getElement(`[data-automation-id="ama-identity-group-chip-remove-icon-${mockMeatChicken.name}"]`);
            expect(removeIconPepper).not.toBeNull();
        });

        it('Should be able to remove preselected groups if readonly property set to false', async () => {
            component.mode = 'multiple';
            component.preSelectGroups = mockFoodGroups;

            const change = new SimpleChange(null, component.preSelectGroups, false);
            await component.ngOnChanges({ preSelectGroups: change });

            const removeGroupSpy = spyOn(component.removeGroup, 'emit');
            fixture.detectChanges();

            const chipList = await ChipHarnessUtils.getChipGrid({ fixture });
            expect((await chipList.getRows()).length).toBe(2);

            await ChipHarnessUtils.removeChipRowItems({
                fixture,
                chipRowFilter: { text: mockMeatChicken.name },
            });

            expect(removeGroupSpy).toHaveBeenCalled();
            expect((await chipList.getRows()).length).toBe(1);
        });

        it('should removeDuplicatedGroups return only unique groups', () => {
            const duplicatedGroups = [mockMeatChicken, mockMeatChicken];
            expect(component.removeDuplicatedGroups(duplicatedGroups)).toEqual([mockMeatChicken]);
        });
    });

    describe('Preselected groups and validation enabled', () => {
        let identitySpy;

        beforeEach(() => {
            component.validate = true;
            component.preSelectGroups = mockFoodGroups;
        });

        it('should check validation only for the first group and emit warning when group is invalid - single mode', async () => {
            identitySpy = spyOn(identityGroupService, 'search').and.throwError('Invalid group');
            component.mode = 'single';

            await component.ngOnChanges({
                preSelectGroups: new SimpleChange(null, [mockVegetableAubergine, mockMeatChicken], false),
            });
            fixture.detectChanges();
            await fixture.whenStable();

            expect(component.invalidGroups.length).toEqual(1);
        });

        it('should check validation for all the groups and emit warning - multiple mode', async () => {
            identitySpy = spyOn(identityGroupService, 'search').and.throwError('Invalid group');
            component.mode = 'multiple';

            await component.ngOnChanges({
                preSelectGroups: new SimpleChange(null, [mockVegetableAubergine, mockMeatChicken], false),
            });
            fixture.detectChanges();
            await fixture.whenStable();

            expect(component.invalidGroups.length).toEqual(2);
        });

        it('should retrieve groups from identity provider when validated', async () => {
            identitySpy = spyOn(identityGroupService, 'search').and.returnValues(of([mockVegetableAubergine]), of([mockMeatChicken]));
            component.validate = true;
            component.mode = 'multiple';
            component.preSelectGroups = mockFoodGroups.map((group) => ({
                name: group.name,
            }));

            await component.ngOnChanges({
                preSelectGroups: new SimpleChange(
                    null,
                    mockFoodGroups.map((group) => ({ name: group.name })),
                    false
                ),
            });
            fixture.detectChanges();
            await fixture.whenStable();

            expect(component.selectedGroups).toEqual(mockFoodGroups);
            expect(identitySpy).toHaveBeenCalled();
        });
    });

    describe('Component readonly mode', () => {
        const change = new SimpleChange(null, mockFoodGroups, false);

        it('should chip list be disabled and show one single chip - single mode', async () => {
            component.mode = 'single';
            component.readOnly = true;
            component.preSelectGroups = mockFoodGroups;
            await component.ngOnChanges({ preSelectGroups: change });

            fixture.detectChanges();

            const chipList = await ChipHarnessUtils.getChipGrid({ fixture });

            expect((await chipList.getRows()).length).toBe(1);
            expect(await chipList.isDisabled()).toBeTrue();
        });

        it('should chip list be disabled and show all the chips - multiple mode', async () => {
            component.mode = 'multiple';
            component.readOnly = true;
            component.preSelectGroups = mockFoodGroups;
            await component.ngOnChanges({ preSelectGroups: change });

            fixture.detectChanges();

            const chipList = await ChipHarnessUtils.getChipGrid({ fixture });

            expect((await chipList.getRows()).length).toBe(2);
            expect(await chipList.isDisabled()).toBeTrue();
        });
    });
});
