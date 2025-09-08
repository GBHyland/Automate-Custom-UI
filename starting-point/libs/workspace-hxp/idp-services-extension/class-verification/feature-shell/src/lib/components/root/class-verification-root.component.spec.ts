/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClassVerificationRootComponent } from './class-verification-root.component';
import { ClassVerificationContextTaskService } from '../../services/context-task/class-verification-context-task.service';
import { IdpDocumentToolbarService } from '../../services/document/idp-document-toolbar.service';
import { BehaviorSubject } from 'rxjs';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { By } from '@angular/platform-browser';
import { FeaturesDirective, provideMockFeatureFlags } from '@alfresco/adf-core/feature-flags';
import { IDP } from '@features';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { IdpDocumentImportService } from '../../services/document-import/idp-document-import.service';
import { SessionService } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { TranslatePipe } from '@ngx-translate/core';

@Component({ selector: 'hyland-idp-task-header', template: '', standalone: true })
class MockTaskHeaderComponent {}

@Component({ selector: 'hyland-idp-class-list', template: '', standalone: true })
class MockClassListComponent {}

@Component({ selector: 'hyland-idp-class-verification-viewer', template: '', standalone: true })
class MockViewerComponent {}

@Component({ selector: 'hyland-idp-upload-document-button', template: '', standalone: true })
class MockDocumentUploadButtonComponent {}

describe('ClassVerificationRootComponent', () => {
    let component: ClassVerificationRootComponent;
    let fixture: ComponentFixture<ClassVerificationRootComponent>;
    let contextService: ClassVerificationContextTaskService;
    let documentToolbarService: IdpDocumentToolbarService;
    let documentImportServiceSpy: jasmine.SpyObj<IdpDocumentImportService>;
    let sessionServiceSpy: jasmine.SpyObj<SessionService>;

    let loader: HarnessLoader;

    const toggleScreenReady$ = new BehaviorSubject(true);
    const toggleCanSave$ = new BehaviorSubject(true);
    const toggleCanComplete$ = new BehaviorSubject(true);
    class MockContextService implements Partial<ClassVerificationContextTaskService> {
        screenReady$ = toggleScreenReady$.asObservable();
        taskCanSave$ = toggleCanSave$.asObservable();
        taskCanComplete$ = toggleCanComplete$.asObservable();
        completeTask = jasmine.createSpy('completeTask');
        saveTask = jasmine.createSpy('saveTask');
        destroy = jasmine.createSpy('destroy');
    }

    class MockDocumentToolbarService implements Partial<IdpDocumentToolbarService> {
        handleShortcutAction = jasmine.createSpy('handleShortcutAction');
    }

    const isAutoNextTaskChecked$ = new BehaviorSubject(false);

    beforeEach(() => {
        documentImportServiceSpy = jasmine.createSpyObj<IdpDocumentImportService>('IdpDocumentUploadService', ['queueDocumentUpload'], {
            isDocumentImportEnabled$: new BehaviorSubject(true),
            importAcceptedFileExtensions$: new BehaviorSubject(['.pdf', '.jpg']),
            isDocumentImportRunning$: new BehaviorSubject(false),
        });

        sessionServiceSpy = jasmine.createSpyObj<SessionService>('SessionService', ['toggleAutoNextTask'], {
            isAutoNextTaskChecked$: isAutoNextTaskChecked$.asObservable(),
        });

        TestBed.configureTestingModule({
            providers: [
                { provide: ClassVerificationContextTaskService, useClass: MockContextService },
                { provide: IdpDocumentToolbarService, useClass: MockDocumentToolbarService },
                provideMockFeatureFlags({
                    [IDP.CLASS_VERIFICATION_DOCUMENT_UPLOAD]: true,
                }),
                { provide: IdpDocumentImportService, useValue: documentImportServiceSpy },
                { provide: SessionService, useValue: sessionServiceSpy },
            ],
        }).overrideComponent(ClassVerificationRootComponent, {
            set: {
                imports: [
                    TranslatePipe,
                    CommonModule,
                    MatCheckboxModule,
                    MatProgressSpinnerModule,
                    NoopTranslateModule,
                    MockClassListComponent,
                    MockViewerComponent,
                    MockTaskHeaderComponent,
                    FeaturesDirective,
                    MockDocumentUploadButtonComponent,
                ],
            },
        });

        fixture = TestBed.createComponent(ClassVerificationRootComponent);
        component = fixture.componentInstance;
        contextService = TestBed.inject(ClassVerificationContextTaskService);
        documentToolbarService = TestBed.inject(IdpDocumentToolbarService);
        loader = TestbedHarnessEnvironment.loader(fixture);

        toggleScreenReady$.next(true);
        toggleCanSave$.next(true);
        toggleCanComplete$.next(true);

        fixture.detectChanges();
    });

    it('should call completeTask on onSubmit', async () => {
        toggleCanComplete$.next(true);
        fixture.detectChanges();

        const button = await loader.getHarness(MatButtonHarness.with({ selector: '[data-automation-id="idp-class-submit-button"]' }));
        await button.click();

        expect(contextService.completeTask).toHaveBeenCalled();
    });

    it('should call saveTask on onSave', async () => {
        toggleCanSave$.next(true);
        fixture.detectChanges();

        const button = await loader.getHarness(MatButtonHarness.with({ selector: '[data-automation-id="idp-class-save-button"]' }));
        await button.click();

        expect(contextService.saveTask).toHaveBeenCalled();
    });

    it('should handle shortcut key', () => {
        const event = new KeyboardEvent('keyup', { key: 'a' });
        component.onKeyUp(event);
        expect(documentToolbarService.handleShortcutAction).toHaveBeenCalledWith(event);
    });

    it('should prevent default action on repeated key event', () => {
        const event = new KeyboardEvent('keyup', { key: 'a', repeat: true });
        spyOn(event, 'preventDefault');
        component.onKeyUp(event);
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('should destroy context service on component destroy', () => {
        component.ngOnDestroy();
        expect(contextService.destroy).toHaveBeenCalled();
    });

    it('should show progress spinner based on screenReady', () => {
        toggleScreenReady$.next(false);
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.idp-class-verification-root__progress'))).toBeTruthy();
        expect(fixture.debugElement.query(By.css('.idp-class-verification-root'))).toBeFalsy();

        toggleScreenReady$.next(true);
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('.idp-class-verification-root__progress'))).toBeFalsy();
        expect(fixture.debugElement.query(By.css('.idp-class-verification-root'))).toBeTruthy();
    });

    it('should toggle save button based on taskCanSave', async () => {
        toggleCanSave$.next(false);
        fixture.detectChanges();
        const button = await loader.getHarness(MatButtonHarness.with({ selector: '[data-automation-id="idp-class-save-button"]' }));
        let isDisabled = await button.isDisabled();
        expect(isDisabled).toBeTrue();

        toggleCanSave$.next(true);
        fixture.detectChanges();
        isDisabled = await button.isDisabled();
        expect(isDisabled).toBeFalse();
    });

    it('should toggle submit button based on taskCanComplete', async () => {
        toggleCanComplete$.next(false);
        fixture.detectChanges();
        const button = await loader.getHarness(MatButtonHarness.with({ selector: '[data-automation-id="idp-class-submit-button"]' }));
        let isDisabled = await button.isDisabled();
        expect(isDisabled).toBeTrue();

        toggleCanComplete$.next(true);
        fixture.detectChanges();
        isDisabled = await button.isDisabled();
        expect(isDisabled).toBeFalse();
    });

    it('should dispatch queueDocumentUpload on onUploadDocuments', () => {
        const files = [new File([''], 'file1.txt', { type: 'text/plain' }), new File([''], 'file2.pdf', { type: 'application/pdf' })];
        component.onUploadDocuments(files);

        expect(documentImportServiceSpy.queueDocumentUpload).toHaveBeenCalledWith(files);
    });

    it('should check the checkbox when isNextTaskCheckboxChecked is true', async () => {
        isAutoNextTaskChecked$.next(true);
        fixture.detectChanges();

        const checkbox = await loader.getHarness(MatCheckboxHarness.with({ selector: '[data-automation-id="idp-class-open-next-task-checkbox"]' }));
        const isChecked = await checkbox.isChecked();
        expect(isChecked).toBeTrue();
    });

    it('should uncheck the checkbox when isNextTaskCheckboxChecked is false', async () => {
        isAutoNextTaskChecked$.next(false);
        fixture.detectChanges();

        const checkbox = await loader.getHarness(MatCheckboxHarness.with({ selector: '[data-automation-id="idp-class-open-next-task-checkbox"]' }));
        const isChecked = await checkbox.isChecked();
        expect(isChecked).toBeFalse();
    });

    it('should call onNextTaskCheckboxCheckedChanged when the checkbox value changes', async () => {
        spyOn(component, 'onNextTaskCheckboxCheckedChanged');

        const checkbox = await loader.getHarness(MatCheckboxHarness.with({ selector: '[data-automation-id="idp-class-open-next-task-checkbox"]' }));
        await checkbox.toggle();

        expect(component.onNextTaskCheckboxCheckedChanged).toHaveBeenCalled();
    });

    it('should call SessionService.toggleAutoNextTask on onNextTaskCheckboxCheckedChanged', () => {
        component.onNextTaskCheckboxCheckedChanged();
        expect(sessionServiceSpy.toggleAutoNextTask).toHaveBeenCalled();
    });
});
