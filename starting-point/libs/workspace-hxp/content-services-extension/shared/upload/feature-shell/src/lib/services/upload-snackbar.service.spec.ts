/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { UploadSnackbarService } from './upload-snackbar.service';
import { lastValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';

describe('UploadSnackbarService', () => {
    let service: UploadSnackbarService;

    beforeEach(() => {
        service = new UploadSnackbarService();
    });

    it('should emit maximize event when requestMaximize is called', async () => {
        const maximizePromise = lastValueFrom(service.maximize$.pipe(take(1)));
        service.requestMaximize();
        await maximizePromise;
    });

    it('should emit minimize event when requestMinimize is called', async () => {
        const minimizePromise = lastValueFrom(service.minimize$.pipe(take(1)));
        service.requestMinimize();
        await minimizePromise;
    });
});
