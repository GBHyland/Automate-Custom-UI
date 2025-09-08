/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ContentActionRef, ContentActionType, ExtensionService } from '@alfresco/adf-extensions';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { ToolbarMenuItemComponent } from './toolbar-menu-item.component';
import { By } from '@angular/platform-browser';
import { NoopTranslateModule } from '@alfresco/adf-core';

const CONTENT_ACTION_REF: ContentActionRef = {
    id: 'custom-action-ref-id',
    type: ContentActionType.custom,
    component: 'custom-action-ref-id',
};

describe('ToolbarMenuItemComponent', () => {
    let component: ToolbarMenuItemComponent;
    let fixture: ComponentFixture<ToolbarMenuItemComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule, ToolbarMenuItemComponent],
            providers: [MockProvider(ExtensionService)],
        });

        fixture = TestBed.createComponent(ToolbarMenuItemComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should use adf-dynamic-component for custom menu item', () => {
        component.item = CONTENT_ACTION_REF;
        fixture.detectChanges();

        const dynamicComponent = fixture.debugElement.query(By.css('adf-dynamic-component'));
        expect(dynamicComponent.componentInstance.id).toBe(CONTENT_ACTION_REF.component);
    });
});
