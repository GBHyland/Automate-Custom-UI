/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const submissionSuccessGuard: CanActivateFn = (route: ActivatedRouteSnapshot): boolean => {
    const router = inject(Router);

    if (router.getCurrentNavigation()?.extras?.state?.['outcome']) {
        return true;
    } else {
        void router.navigate(['/public/process', route.params?.['processId']]);
        return false;
    }
};
