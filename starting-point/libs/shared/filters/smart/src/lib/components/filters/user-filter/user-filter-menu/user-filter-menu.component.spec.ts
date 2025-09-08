/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NoopAuthModule, NoopTranslateModule } from '@alfresco/adf-core';
import { UserFilterMenuComponent } from './user-filter-menu.component';
import { getClearSelectionButton, getUpdateButton } from '../../../../utils/filter-testing-utils';

describe('UserFilterMenuComponent', () => {
    let component: UserFilterMenuComponent;
    let fixture: ComponentFixture<UserFilterMenuComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, NoopTranslateModule, UserFilterMenuComponent, NoopAuthModule],
        });

        fixture = TestBed.createComponent(UserFilterMenuComponent);
        component = fixture.componentInstance;
    });

    it('should enable clear selection button when there are selected users', async () => {
        component.selectedUsers = [{ id: 'mockId', username: 'mockUsername' }];
        fixture.detectChanges();

        const clearSelectionButton = await getClearSelectionButton(fixture);
        expect(await clearSelectionButton.isDisabled()).toBeFalse();
    });

    it('should disable clear selection button when there are no selected users', async () => {
        component.selectedUsers = [];
        fixture.detectChanges();
        await fixture.whenStable();

        const clearSelectionButton = await getClearSelectionButton(fixture);
        expect(await clearSelectionButton.isDisabled()).toBe(true);
    });

    it('should clear selected users when clear button is clicked', async () => {
        component.selectedUsers = [{ id: 'mockId', username: 'mockUsername' }];
        fixture.detectChanges();

        const clearSelectionButton = await getClearSelectionButton(fixture);
        await clearSelectionButton.click();

        expect(component.selectedUsers.length).toBe(0);
    });

    it('should emit update with selected users on update button click', async () => {
        spyOn(component.update, 'emit');
        component.selectedUsers = [{ id: 'mockId', username: 'mockUsername' }];
        fixture.detectChanges();

        const updateButton = await getUpdateButton(fixture);
        await updateButton.click();

        expect(component.update.emit).toHaveBeenCalledWith(component.selectedUsers);
    });
});
