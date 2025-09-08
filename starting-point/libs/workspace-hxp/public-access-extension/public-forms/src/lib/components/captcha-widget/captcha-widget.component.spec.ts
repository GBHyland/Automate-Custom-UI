/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CaptchaWidgetComponent } from './captcha-widget.component';
import { MockProvider } from 'ng-mocks';
import { AwsWafIntegrationService } from './aws-waf-integration.service';
import { Subject } from 'rxjs';
import { NoopTranslateModule } from '@alfresco/adf-core';

describe('CaptchaWidgetComponent', () => {
    const mockShowCaptcha$: Subject<boolean> = new Subject<boolean>();
    let component: CaptchaWidgetComponent;
    let fixture: ComponentFixture<CaptchaWidgetComponent>;
    let wafService: AwsWafIntegrationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [CaptchaWidgetComponent, NoopTranslateModule],
            providers: [
                MockProvider(AwsWafIntegrationService, {
                    showWafCaptcha$: mockShowCaptcha$.asObservable(),
                    hasValidWafToken: jest.fn(),
                    attachCaptchaBox: jest.fn(),
                    hideCaptcha: jest.fn(),
                }),
            ],
        });

        fixture = TestBed.createComponent(CaptchaWidgetComponent);
        component = fixture.componentInstance;

        wafService = TestBed.inject(AwsWafIntegrationService);

        fixture.detectChanges();
    });

    it('should show captcha container on subject change', () => {
        mockShowCaptcha$.next(true);

        expect(component.captchaContainer?.nativeElement?.tagName).toBe('DIV');
    });

    it('should render captcha on subject change', () => {
        mockShowCaptcha$.next(true);

        expect(wafService.attachCaptchaBox).toHaveBeenCalled();
    });

    it('should emit error on captcha error', () => {
        const captchaErrorEmitSpy = jest.spyOn(component.captchaError, 'emit');
        let onErrorFunction = jest.fn();
        wafService.attachCaptchaBox = jest.fn().mockImplementation((container, { onError }) => (onErrorFunction = onError.bind(component)));

        mockShowCaptcha$.next(true);

        const error = { kind: 'client_error' };
        onErrorFunction(error);

        expect(wafService.hideCaptcha).toHaveBeenCalled();
        expect(captchaErrorEmitSpy).toHaveBeenCalledWith(error);
    });

    it('should emit captcha token on captcha success', () => {
        const captchaSolvedEmitSpy = jest.spyOn(component.captchaSolved, 'emit');
        let onSuccessFunction = jest.fn();
        wafService.attachCaptchaBox = jest.fn().mockImplementation((_container, { onSuccess }) => (onSuccessFunction = onSuccess.bind(component)));

        mockShowCaptcha$.next(true);

        const token = 'token';
        onSuccessFunction(token);

        expect(wafService.hideCaptcha).toHaveBeenCalled();
        expect(captchaSolvedEmitSpy).toHaveBeenCalledWith(token);
    });

    it('should show captcha with cancel button when captcha is loaded', () => {
        let onLoadedFunction = jest.fn();
        wafService.attachCaptchaBox = jest.fn().mockImplementation((_container, { onLoad }) => (onLoadedFunction = onLoad.bind(component)));

        mockShowCaptcha$.next(true);

        onLoadedFunction();
        fixture.detectChanges();

        expect(component.showCancel).toBe(true);
        const element = fixture.nativeElement.querySelector('.hxp-captcha-visible');
        expect(element).not.toBeNull();
    });

    it('should hide captcha and emit canceled event on cancel button click', () => {
        const canceledEmitSpy = jest.spyOn(component.canceled, 'emit');
        component.onCancelClicked();

        expect(wafService.hideCaptcha).toHaveBeenCalled();
        expect(canceledEmitSpy).toHaveBeenCalled();
    });

    it('should hide captcha if showWafCaptcha$ emits false', () => {
        component.captchaContainer.nativeElement.innerHTML = 'not-empty';
        mockShowCaptcha$.next(false);

        expect(component.captchaContainer.nativeElement.innerHTML).toBe('');
        expect(component.showCancel).toBe(false);
        const element = fixture.nativeElement.querySelector('.hxp-captcha-visible');
        expect(element).toBeNull();
    });
});
