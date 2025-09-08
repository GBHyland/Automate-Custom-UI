/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ContentActionRef, ContentActionType } from '@alfresco/adf-extensions';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';
import { ToolbarMoreMenuComponent } from './toolbar-more-menu.component';
import { ToolbarMenuItemsFactoryService } from '../services/menu-items-factory.service';
import { By } from '@angular/platform-browser';
import { ToolbarMenuItemComponent } from '../menu-item/toolbar-menu-item.component';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NoopTranslateModule } from '@alfresco/adf-core';

const MORE_MENU_CONTENT_ACTION_REF: ContentActionRef = {
    id: 'more-menu-content-action-ref',
    type: ContentActionType.menu,
    icon: 'more_vert',
    children: [
        {
            id: 'menu1',
            type: ContentActionType.button,
            actions: {
                click: 'menu1-click',
            },
        },
        {
            id: 'menu2',
            type: ContentActionType.button,
            actions: {
                click: 'menu2-click',
            },
        },
    ],
};

describe('ToolbarMoreMenuComponent', () => {
    let fixture: ComponentFixture<ToolbarMoreMenuComponent>;
    let loader: HarnessLoader;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, NoopTranslateModule],
            providers: [
                MockProvider(ToolbarMenuItemsFactoryService, {
                    getMoreMenuItems: () => {
                        return of(MORE_MENU_CONTENT_ACTION_REF);
                    },
                }),
            ],
        });

        fixture = TestBed.createComponent(ToolbarMoreMenuComponent);
        loader = TestbedHarnessEnvironment.loader(fixture);

        fixture.detectChanges();
        await fixture.whenStable();
    });

    it('should display correct menu items', async () => {
        const moreButton = await loader.getHarness(MatButtonHarness);
        await moreButton.click();

        fixture.detectChanges();
        await fixture.whenStable();

        const menuItems = fixture.debugElement.queryAll(By.css('hxp-toolbar-menu-item'));
        const children = MORE_MENU_CONTENT_ACTION_REF.children ?? [];

        expect(menuItems.length).toBe(children.length);

        menuItems.forEach((menuItem, index) => {
            const componentInstance: ToolbarMenuItemComponent = menuItem.componentInstance;
            expect(componentInstance.item).toEqual(children[index]);
        });
    });
});
