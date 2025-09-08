/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchMenuItemComponent } from './search-menu-item.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FeaturesDirective } from '@alfresco/adf-core/feature-flags';
import { MockProvider } from 'ng-mocks';
import { AppConfigService, NoopTranslateModule } from '@alfresco/adf-core';
import { SearchActionIconComponent } from '@alfresco/adf-hx-content-services/icons';
import { a11yReport } from '@hxp/workspace-hxp/shared/testing';
import { ButtonHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';
import { MatIconTestingModule } from '@angular/material/icon/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SidenavExpansionService } from '@hxp/workspace-hxp/shared/services';

const EXPECTED_VIOLATIONS: Array<{ [violationId: string]: number }> | undefined = [];

describe('SearchMenuItemComponent', () => {
    let component: SearchMenuItemComponent;
    let fixture: ComponentFixture<SearchMenuItemComponent>;

    const buttonFilter = () => ({
        fixture,
        buttonFilters: { selector: '.hxp-search-menu-item_button' },
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                SearchMenuItemComponent,
                FeaturesDirective,
                NoopTranslateModule,
                MatIconModule,
                MatIconTestingModule,
                MatButtonModule,
                SearchActionIconComponent,
                RouterTestingModule.withRoutes([{ path: 'search', component: SearchMenuItemComponent }]),
            ],
            providers: [SidenavExpansionService, MockProvider(AppConfigService)],
        }).compileComponents();

        fixture = TestBed.createComponent(SearchMenuItemComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should display the search menu item component', async () => {
        const hasButton = await ButtonHarnessUtils.hasButton(buttonFilter());
        expect(hasButton).toBeTruthy();
    });

    it('should navigate to search page when button is clicked', async () => {
        spyOn(component, 'navigateToSearch');

        await ButtonHarnessUtils.clickButton(buttonFilter());
        expect(component.navigateToSearch).toHaveBeenCalled();
    });

    it('should display collapsed button if state is not expanded', async () => {
        component.data = {
            state: 'collapsed',
        };
        fixture.detectChanges();

        const button = await ButtonHarnessUtils.getButton(buttonFilter());

        expect(button).toBeTruthy();
        expect(await (await button.host()).hasClass('hxp-search-menu-item_button_collapsed')).toBeTruthy();
    });

    it('should pass accessibility checks', async () => {
        const res = await a11yReport('.hxp-search-menu-item_button');

        expect(res?.violations).toEqual(EXPECTED_VIOLATIONS);
    });
});
