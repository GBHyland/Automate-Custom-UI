/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { inject, Injectable } from '@angular/core';
import { AppConfigService } from '@alfresco/adf-core';
import { ReplaySubject } from 'rxjs';
import { AwsWafJSIntegrations, RenderCaptchaOptions } from './aws-waf-integration.types';

declare const window: Window & AwsWafJSIntegrations;

@Injectable({ providedIn: 'root' })
export class AwsWafIntegrationService {
    private readonly appConfigService = inject(AppConfigService);

    private readonly showWafCaptchaSubject$ = new ReplaySubject<boolean>(1);

    showWafCaptcha$ = this.showWafCaptchaSubject$.asObservable();

    showCaptcha(): void {
        this.showWafCaptchaSubject$.next(true);
    }

    hideCaptcha(): void {
        this.showWafCaptchaSubject$.next(false);
    }

    async loadWafIntegration(): Promise<void> {
        if (!this.isWafIntegrationLoaded()) {
            await import(/* @vite-ignore */ this.captchaIntegrationUrl);
        }
    }

    async hasValidWafToken(): Promise<boolean> {
        if (this.isWafIntegrationLoaded()) {
            return this.checkStoredToken();
        } else {
            await this.loadWafIntegration();
            return this.checkStoredToken();
        }
    }

    async attachCaptchaBox(container: HTMLElement, options: Omit<RenderCaptchaOptions, 'apiKey'>): Promise<void> {
        if (this.isWafIntegrationLoaded()) {
            this.renderCaptcha(container, options);
        } else {
            await this.loadWafIntegration();
            return this.renderCaptcha(container, options);
        }
    }

    private get captchaIntegrationUrl(): string {
        const integrationUrl = this.appConfigService.get<string | undefined>('aws.captcha.integrationUrl');

        if (!integrationUrl || !this.isValidUrl(integrationUrl)) {
            throw new Error('Invalid AWS WAF Captcha Integration URL');
        }

        // cspell:disable-next-line
        return `${integrationUrl}jsapi.js`;
    }

    private get captchaApiKey(): string {
        const apiKey = this.appConfigService.get<string | undefined>('aws.captcha.apiKey');

        if (!apiKey) {
            throw new Error('Missing AWS WAF Captcha API Key');
        }

        return apiKey;
    }

    private isWafIntegrationLoaded(): boolean {
        return !!window.AwsWafIntegration && !!window.AwsWafCaptcha;
    }

    private isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    private checkStoredToken(): boolean {
        const hasValidToken: boolean = window.AwsWafIntegration.hasToken();
        this.showWafCaptchaSubject$.next(!hasValidToken);
        return hasValidToken;
    }

    private renderCaptcha(container: HTMLElement, options: Omit<RenderCaptchaOptions, 'apiKey'>): void {
        window.AwsWafCaptcha.renderCaptcha(container, {
            ...options,
            apiKey: this.captchaApiKey,
        });
    }
}
