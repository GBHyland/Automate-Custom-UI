/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TaskRedirectionConfig, TaskRedirectionConstants, TaskRedirectionMode } from '@alfresco/adf-process-services-cloud-extension';
import { inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class PublicFormRedirectionService {
    private readonly DEFAULT_REDIRECTION_MODE: TaskRedirectionMode = TaskRedirectionMode.SUCCESS;
    private document = inject(DOCUMENT);
    private readonly window = this.document.defaultView as Window;
    private readonly router = inject(Router);

    extractRedirectionConstants(constants: Record<string, string>): TaskRedirectionConfig {
        const redirectionConstants: TaskRedirectionConfig = {
            redirectionMode: constants[TaskRedirectionConstants.REDIRECTION_MODE] as TaskRedirectionMode,
            redirectionParameter: constants[TaskRedirectionConstants.REDIRECTION_PARAMETER],
        };

        return Object.values(TaskRedirectionMode).includes(redirectionConstants.redirectionMode)
            ? redirectionConstants
            : {
                  ...redirectionConstants,
                  redirectionMode: this.DEFAULT_REDIRECTION_MODE,
              };
    }

    redirect({ redirectionMode, redirectionParameter }: TaskRedirectionConfig, relativeRoute: ActivatedRoute): void {
        if (redirectionMode === TaskRedirectionMode.URL && redirectionParameter) {
            this.redirectToURL(redirectionParameter);
        } else {
            this.redirectToSuccess(relativeRoute);
        }
    }

    redirectToError(errorCode: number): Promise<boolean> {
        return this.router.navigate(['/public/error', ...(errorCode ? [errorCode] : [])]);
    }

    private redirectToURL(redirectionParameter: string): void {
        this.window.location.href = redirectionParameter;
    }

    private redirectToSuccess(relativeRoute: ActivatedRoute): void {
        void this.router.navigate(['./success'], {
            state: { outcome: 'submitted' },
            relativeTo: relativeRoute,
        });
    }
}
