/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReplaceFileButtonComponent } from './replace-file-button-component';
import { ReplaceFileButtonComponentActionService } from './replace-file-button-component-action.service';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { ActionContext } from '@alfresco/adf-hx-content-services/services';
import { By } from '@angular/platform-browser';
import { mocks } from '@hxp/workspace-hxp/shared/testing';

describe('ReplaceFileButtonComponent', () => {
    let component: ReplaceFileButtonComponent;
    let fixture: ComponentFixture<ReplaceFileButtonComponent>;

    const replaceFileButtonServiceSpy = jasmine.createSpyObj('ReplaceFileButtonComponentService', ['execute', 'isAvailable']);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NoopTranslateModule, ReplaceFileButtonComponent],
            providers: [{ provide: ReplaceFileButtonComponentActionService, useValue: replaceFileButtonServiceSpy }],
        });

        fixture = TestBed.createComponent(ReplaceFileButtonComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        replaceFileButtonServiceSpy.isAvailable.calls.reset();
        replaceFileButtonServiceSpy.execute.calls.reset();
    });

    it('should not be visible if action is not available', () => {
        let replaceFileButton = fixture.debugElement.query(By.css('.hxp-replace-file-button'));

        expect(component.isAvailable).toBeFalse();
        expect(replaceFileButton).toBeFalsy();

        replaceFileButtonServiceSpy.isAvailable.and.returnValue(false);

        component.data = { documents: [mocks.fileDocument] } as ActionContext;
        component.ngOnChanges();
        fixture.detectChanges();

        expect(component.isAvailable).toBeFalse();

        replaceFileButton = fixture.debugElement.query(By.css('.hxp-replace-file-button'));

        expect(replaceFileButton).toBeFalsy();
    });

    it('should be visible if action is available', () => {
        let replaceFileButton = fixture.debugElement.query(By.css('.hxp-replace-file-button'));

        expect(component.isAvailable).toBeFalse();
        expect(replaceFileButton).toBeFalsy();

        replaceFileButtonServiceSpy.isAvailable.and.returnValue(true);

        component.data = { documents: [mocks.fileDocument] } as ActionContext;
        component.ngOnChanges();
        fixture.detectChanges();

        replaceFileButton = fixture.debugElement.query(By.css('.hxp-replace-file-button'));

        expect(component.isAvailable).toBeTruthy();
        expect(replaceFileButton).toBeTruthy();
    });

    it('should execute replace file action when button is clicked', () => {
        expect(replaceFileButtonServiceSpy.execute).not.toHaveBeenCalled();

        replaceFileButtonServiceSpy.isAvailable.and.returnValue(true);

        component.data = { documents: [mocks.fileDocument] } as ActionContext;
        component.ngOnChanges();
        fixture.detectChanges();

        const replaceFileButton = fixture.debugElement.query(By.css('.hxp-replace-file-button'));

        expect(replaceFileButton).toBeTruthy();

        replaceFileButton.nativeElement.click();

        expect(replaceFileButtonServiceSpy.execute).toHaveBeenCalledWith(component.data);
    });
});
