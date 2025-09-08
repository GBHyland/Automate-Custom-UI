/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentMoreActionComponent } from './document-more-action.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { HttpClientModule } from '@angular/common/http';

describe('DocumentMoreActionComponent', () => {
    let component: DocumentMoreActionComponent;
    let fixture: ComponentFixture<DocumentMoreActionComponent>;
    let button: DebugElement;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [DocumentMoreActionComponent, HttpClientModule],
        }).compileComponents();

        fixture = TestBed.createComponent(DocumentMoreActionComponent);
        component = fixture.componentInstance;
        button = fixture.debugElement.query(By.css('button.hxp-more-action-button'));
        fixture.detectChanges();
    });

    it('should not be in DOM on element instantiation', () => {
        expect(button).toBeNull();
    });

    it('should not be in DOM the button when file without blob', () => {
        component.actionContext = { documents: [] };
        fixture.detectChanges();
        expect(button).toBeFalsy();
    });

    it('should be in DOM when file contains blob', () => {
        component.actionContext = { documents: [jestMocks.fileDocument] };
        fixture.detectChanges();
        button = fixture.debugElement.query(By.css('div.hxp-more-action-button'));
        expect(button).toBeTruthy();
    });
});
