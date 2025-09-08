/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, DestroyRef, ElementRef, EventEmitter, inject, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { AwsWafIntegrationService } from './aws-waf-integration.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CaptchaError } from './aws-waf-integration.types';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { NgClass, UpperCasePipe } from '@angular/common';

@Component({
    selector: 'hxp-captcha-widget',
    standalone: true,
    styleUrls: ['./captcha-widget.component.scss'],
    template: `
        <div [ngClass]="{ 'hxp-captcha-visible': captchaShown }">
            <div #captchaContainer></div>
            @if (showCancel) {
            <button mat-button (click)="onCancelClicked()">
                {{ 'APP.PUBLIC_FORM.ACTIONS.CANCEL' | translate | uppercase }}
            </button>
            }
        </div>
    `,
    imports: [MatButton, TranslatePipe, UpperCasePipe, NgClass],
})
export class CaptchaWidgetComponent implements OnInit {
    private readonly wafService = inject(AwsWafIntegrationService);
    private readonly destroyRef = inject(DestroyRef);
    private readonly ngZone = inject(NgZone);

    captchaShown = false;
    showCancel = false;

    @ViewChild('captchaContainer')
    captchaContainer!: ElementRef<HTMLDivElement>;

    @Output() captchaSolved = new EventEmitter<string>();
    @Output() captchaError = new EventEmitter<CaptchaError>();
    @Output() canceled = new EventEmitter<void>();

    async ngOnInit(): Promise<void> {
        await this.wafService.loadWafIntegration();
        this.handleCaptchaVisibility();
    }

    onCancelClicked(): void {
        this.wafService.hideCaptcha();
        this.canceled.emit();
    }

    private handleCaptchaVisibility(): void {
        this.wafService.showWafCaptcha$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((showCaptcha) => {
            this.captchaShown = showCaptcha;
            if (showCaptcha) {
                void this.renderCaptcha();
            } else {
                this.captchaContainer.nativeElement.innerHTML = '';
                this.showCancel = false;
            }
        });
    }

    private renderCaptcha(): Promise<void> {
        return this.wafService.attachCaptchaBox(this.captchaContainer.nativeElement, {
            onLoad: this.handleCaptchaLoaded.bind(this),
            onSuccess: this.handleCaptchaSuccess.bind(this),
            onError: this.handleCaptchaError.bind(this),
        });
    }

    private handleCaptchaLoaded(): void {
        this.ngZone.run(() => {
            if (this.captchaShown) {
                this.showCancel = true;
            }
        });
    }

    private handleCaptchaSuccess(wafToken: string): void {
        this.ngZone.run(() => {
            this.wafService.hideCaptcha();
            this.captchaSolved.emit(wafToken);
        });
    }

    private handleCaptchaError(error: CaptchaError): void {
        this.ngZone.run(() => {
            this.wafService.hideCaptcha();
            this.captchaError.emit(error);
        });
    }
}
