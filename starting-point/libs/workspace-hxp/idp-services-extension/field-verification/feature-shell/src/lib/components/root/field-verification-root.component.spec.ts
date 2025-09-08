/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FieldVerificationRootComponent } from './field-verification-root.component';
import { FieldVerificationContextTaskService } from '../../services/context-task/field-verification-context-task.service';
import { BehaviorSubject } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { By } from '@angular/platform-browser';
import { IDP_SCREEN_SHORTCUTS_INJECTION_TOKEN, IdpShortcutService, SessionService } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { FeaturesDirective } from '@alfresco/adf-core/feature-flags';
import { TranslatePipe } from '@ngx-translate/core';

@Component({ selector: 'hyland-idp-extraction-view', template: '', standalone: true })
class MockExtractionViewComponent {}

describe('FieldVerificationRootComponent', () => {
    let component: FieldVerificationRootComponent;
    let fixture: ComponentFixture<FieldVerificationRootComponent>;
    let contextService: FieldVerificationContextTaskService;
    let sessionServiceSpy: jasmine.SpyObj<SessionService>;

    const toggleScreenReady$ = new BehaviorSubject(true);
    const toggleCanSave$ = new BehaviorSubject(true);
    const toggleCanComplete$ = new BehaviorSubject(true);
    class MockContextService implements Partial<FieldVerificationContextTaskService> {
        screenReady$ = toggleScreenReady$.asObservable();
        taskCanSave$ = toggleCanSave$.asObservable();
        taskCanComplete$ = toggleCanComplete$.asObservable();
        completeTask = jasmine.createSpy('completeTask');
        saveTask = jasmine.createSpy('saveTask');
        destroy = jasmine.createSpy('destroy');
    }

    beforeEach(() => {
        sessionServiceSpy = jasmine.createSpyObj<SessionService>('PersistenceService', ['toggleAutoNextTask'], {
            isAutoNextTaskChecked$: new BehaviorSubject(false).asObservable(),
        });

        TestBed.configureTestingModule({
            providers: [{ provide: FieldVerificationContextTaskService, useClass: MockContextService }],
        }).overrideComponent(FieldVerificationRootComponent, {
            set: {
                providers: [
                    IdpShortcutService,
                    { provide: IDP_SCREEN_SHORTCUTS_INJECTION_TOKEN, useValue: [] },
                    { provide: SessionService, useValue: sessionServiceSpy },
                ],
                imports: [
                    TranslatePipe,
                    CommonModule,
                    MatButtonModule,
                    MatProgressSpinnerModule,
                    NoopTranslateModule,
                    MockExtractionViewComponent,
                    FeaturesDirective,
                ],
            },
        });

        fixture = TestBed.createComponent(FieldVerificationRootComponent);
        component = fixture.componentInstance;
        contextService = TestBed.inject(FieldVerificationContextTaskService);
        fixture.detectChanges();
    });

    it('should call completeTask on onSubmit', () => {
        fixture.debugElement.query(By.css('.idp-footer-container__submit-button')).nativeElement.click();
        expect(contextService.completeTask).toHaveBeenCalled();
    });

    it('should call saveTask on onSave', () => {
        fixture.debugElement.query(By.css('.idp-footer-container__save-button')).nativeElement.click();
        expect(contextService.saveTask).toHaveBeenCalled();
    });

    it('should destroy context service on component destroy', () => {
        component.ngOnDestroy();
        expect(contextService.destroy).toHaveBeenCalled();
    });

    it('should show progress spinner based on screenReady', () => {
        toggleScreenReady$.next(false);
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.idp-field-verification-root__progress'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.idp-field-verification-root'))).toBeFalsy();

        toggleScreenReady$.next(true);
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.idp-field-verification-root__progress'))).toBeFalsy();
        expect(fixture.debugElement.query(By.css('.idp-field-verification-root'))).toBeTruthy();
    });

    it('should toggle save button based on taskCanSave', () => {
        toggleCanSave$.next(false);
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.idp-footer-container__save-button')).attributes['disabled']).toEqual('true');

        toggleCanSave$.next(true);
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.idp-footer-container__save-button')).attributes['disabled']).toBeUndefined();
    });

    it('should toggle submit button based on taskCanSave', () => {
        toggleCanComplete$.next(false);
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.idp-footer-container__submit-button')).attributes['disabled']).toEqual('true');

        toggleCanComplete$.next(true);
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.idp-footer-container__submit-button')).attributes['disabled']).toBeUndefined();
    });

    it('should call SessionService.toggleAutoNextTask on onNextTaskCheckboxCheckedChanged', () => {
        component.onNextTaskCheckboxCheckedChanged();
        expect(sessionServiceSpy.toggleAutoNextTask).toHaveBeenCalled();
    });
});
