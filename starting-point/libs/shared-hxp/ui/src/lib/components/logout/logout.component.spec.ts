/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed, ComponentFixture } from '@angular/core/testing';
import { LogoutComponent } from './logout.component';
import { LogoutDirective, AuthenticationService, NoopTranslateModule } from '@alfresco/adf-core';
import { By } from '@angular/platform-browser';

describe('LogoutComponent', () => {
    let fixture: ComponentFixture<LogoutComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule, LogoutDirective],
            providers: [
                {
                    provide: AuthenticationService,
                    useValue: { getToken: () => 'fake token' },
                },
            ],
        });

        fixture = TestBed.createComponent(LogoutComponent);
        fixture.detectChanges();
    });

    it('should have button with adf-logout', () => {
        const button = fixture?.debugElement.queryAll(By.directive(LogoutDirective));
        const buttonText = button[0].nativeElement.textContent;
        expect(buttonText).toMatch('APP.HEADER.SIGN_OUT');
    });
});
