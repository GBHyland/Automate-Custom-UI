/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TranslateService } from '@ngx-translate/core';
import { Component, inject, OnInit } from '@angular/core';
import { PublicFormService } from './public-form.service';
import { FormModel, FormValues } from '@alfresco/adf-core';
import { MatButtonModule } from '@angular/material/button';
import { NgTemplateOutlet, Location } from '@angular/common';
import { catchError, EMPTY, forkJoin, map, take } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HxpNotificationService } from '@alfresco/adf-hx-content-services/services';
import { FormCloudComponent, FormCloudService, FormCustomOutcomesComponent, FormRepresentation } from '@alfresco/adf-process-services-cloud';
import { ActivatedRoute } from '@angular/router';
import { CaptchaWidgetComponent } from '../captcha-widget/captcha-widget.component';
import { AwsWafIntegrationService } from '../captcha-widget/aws-waf-integration.service';
import { TaskRedirectionConfig, TaskRedirectionMode } from '@alfresco/adf-process-services-cloud-extension';
import { PublicFormRedirectionService } from '../../services/public-form-redirection.service';

@Component({
    standalone: true,
    selector: 'hxp-public-form',
    templateUrl: './public-form.component.html',
    styleUrls: ['./public-form.component.scss'],
    imports: [MatProgressSpinnerModule, MatButtonModule, FormCloudComponent, FormCustomOutcomesComponent, NgTemplateOutlet, CaptchaWidgetComponent],
    providers: [PublicFormService, { provide: FormCloudService, useClass: PublicFormService }],
})
export class PublicFormComponent implements OnInit {
    private readonly location = inject(Location);
    private readonly translateService = inject(TranslateService);
    private readonly publicFormService = inject(PublicFormService);
    private readonly notificationService = inject(HxpNotificationService);
    private readonly wafService = inject(AwsWafIntegrationService);
    private readonly redirectionService = inject(PublicFormRedirectionService);
    private readonly relativeRoute = inject(ActivatedRoute);

    form!: FormModel;
    loading = true;
    captchaInProgress = false;

    outcome = '';
    showCancelButton = true;
    showStartProcessButton = true;
    cancelButtonLabel = this.translateService.instant('APP.PUBLIC_FORM.ACTIONS.CANCEL').toUpperCase();
    startProcessButtonLabel = this.translateService.instant('APP.PUBLIC_FORM.ACTIONS.START').toUpperCase();
    redirectionConfig: TaskRedirectionConfig = {
        redirectionMode: TaskRedirectionMode.SUCCESS,
        redirectionParameter: '',
    };

    ngOnInit(): void {
        forkJoin([
            this.publicFormService.fetchFormRepresentation(),
            this.publicFormService.fetchStaticFormValues(),
            this.publicFormService.fetchStartEventConstants(),
        ])
            .pipe(
                take(1),
                catchError(() => {
                    this.loading = false;
                    void this.redirectionService.redirectToError(404);
                    return EMPTY;
                }),
                map(([{ formRepresentation }, staticFormValues, constants]) => {
                    const flattenedForm = { ...formRepresentation, ...formRepresentation.formDefinition };
                    delete flattenedForm.formDefinition;
                    return {
                        normalizedFormData: flattenedForm,
                        staticFormValues,
                        constants,
                    };
                })
            )
            .subscribe(({ normalizedFormData, staticFormValues, constants }) => {
                this.handleFormLoadSuccess(normalizedFormData, staticFormValues);
                this.handleConstantValues(constants);
            });
    }

    onOutcomeClicked(outcome: string): void {
        this.outcome = outcome;
        this.showSubmissionCaptcha();
    }

    cancelStartProcess(): void {
        this.location.back();
    }

    showSubmissionCaptcha(): void {
        this.form.readOnly = true;
        this.captchaInProgress = true;
        this.wafService.showCaptcha();
    }

    handleCaptchaError(): void {
        this.notificationService.showError('APP.PUBLIC_FORM.ERROR.CAPTCHA');
        this.handleCaptchaCanceled();
    }

    handleCaptchaCanceled(): void {
        this.form.readOnly = false;
        this.captchaInProgress = false;
    }

    startProcess(): void {
        this.loading = true;
        this.publicFormService
            .startProcess(this.form.values, this.outcome)
            .pipe(
                take(1),
                catchError(() => {
                    this.loading = false;
                    void this.redirectionService.redirectToError(500);
                    return EMPTY;
                })
            )
            .subscribe(() => {
                this.redirectionService.redirect(this.redirectionConfig, this.relativeRoute);
                this.loading = false;
            });
    }

    private handleFormLoadSuccess(formRepresentation: FormRepresentation, staticFormValues: FormValues = {}): void {
        this.form = new FormModel(formRepresentation, staticFormValues);
        this.loading = false;
        this.notificationService.showSuccess('APP.PUBLIC_FORM.SUCCESS.LOADING_FORM');
    }

    private handleConstantValues(constants: Record<string, string>): void {
        this.showStartProcessButton = this.isStartButtonVisible(constants);
        this.showCancelButton = this.isCancelButtonVisible(constants);

        if (this.showStartProcessButton) {
            this.startProcessButtonLabel = constants['startLabel'] ?? this.startProcessButtonLabel;
        }
        if (this.showCancelButton) {
            this.cancelButtonLabel = constants['cancelLabel'] ?? this.cancelButtonLabel;
        }

        this.redirectionConfig = this.redirectionService.extractRedirectionConstants(constants);
    }

    private hasVisibleOutcomes(): boolean {
        return this.form.outcomes.some((outcome) => !outcome.isSystem);
    }

    private isStartButtonVisible(constants: Record<string, string>): boolean {
        if (this.hasVisibleOutcomes()) {
            return false;
        }

        return this.isStartEnabled(constants) && !this.captchaInProgress;
    }

    private isStartEnabled(constants: Record<string, string>): boolean {
        return constants['startEnabled'] ? constants['startEnabled'] === 'true' : this.showStartProcessButton;
    }

    private isCancelButtonVisible(constants: Record<string, string>): boolean {
        return this.isCancelEnabled(constants) && !this.captchaInProgress;
    }

    private isCancelEnabled(constants: Record<string, string>): boolean {
        return constants['cancelEnabled'] ? constants['cancelEnabled'] === 'true' : this.showCancelButton;
    }
}
