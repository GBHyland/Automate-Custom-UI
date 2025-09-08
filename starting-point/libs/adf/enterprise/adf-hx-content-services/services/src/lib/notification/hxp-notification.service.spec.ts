/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NotificationService } from '@alfresco/adf-core';
import { TestBed } from '@angular/core/testing';
import { DefaultStatusSnackBarIcon } from '@alfresco/adf-hx-content-services/api';
import { HxpNotificationService } from './hxp-notification.service';

describe('HxpNotificationService', () => {
    let hxpNotificationService: HxpNotificationService;
    let notificationService: NotificationService;
    let notificationServiceSpy: any;
    let icon: DefaultStatusSnackBarIcon;
    const message = 'A snack-bar message';

    const mockNotificationService = {
        openSnackMessage: jest.fn(),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: NotificationService,
                    useValue: mockNotificationService,
                },
            ],
        });
        hxpNotificationService = TestBed.inject(HxpNotificationService);
        notificationService = TestBed.inject(NotificationService);
        notificationServiceSpy = jest.spyOn(notificationService, 'openSnackMessage').mockImplementation();
    });

    it('when a Snack-Bar should be displayed with a custom icon, calls the NotificationService openSnackMessage method with a message and a custom icon', () => {
        const customIcon = 'folder';
        expect(notificationService.openSnackMessage).toHaveBeenCalledTimes(0);

        hxpNotificationService.openSnackBar(message, customIcon);

        expect(notificationServiceSpy.mock.calls).toHaveLength(1);

        const args = notificationServiceSpy.mock.calls[0];

        expect(args).toHaveLength(3);
        expect(args[0]).toBe(message);
        expect(args[1]).toBeDefined();
        expect(args[1].panelClass).toBeDefined();
        expect(args[1].data).toBeDefined();
        expect(args[1].data.decorativeIcon).toBe(customIcon);
    });
    it('when an informative Snack-Bar should be displayed, calls the NotificationService showInfo method with a message', () => {
        jest.clearAllMocks();
        icon = 'info';

        hxpNotificationService.showInfo(message);

        expect(notificationServiceSpy.mock.calls).toHaveLength(1);

        const args = notificationServiceSpy.mock.calls[0];

        expect(args).toHaveLength(3);
        expect(args[1].data.decorativeIcon).toBe(icon);
    });

    it('when a success Snack-Bar should be displayed, calls the NotificationService showSuccess method with a message', () => {
        jest.clearAllMocks();
        icon = 'done';

        hxpNotificationService.showSuccess(message);

        expect(notificationServiceSpy.mock.calls).toHaveLength(1);

        const args = notificationServiceSpy.mock.calls[0];

        expect(args).toHaveLength(3);
        expect(args[1].data.decorativeIcon).toBe(icon);
    });

    it('when an error Snack-Bar should be displayed, calls the NotificationService showError method with a message', () => {
        jest.clearAllMocks();
        icon = 'error';

        hxpNotificationService.showError(message);

        expect(notificationServiceSpy.mock.calls).toHaveLength(1);

        const args = notificationServiceSpy.mock.calls[0];

        expect(args).toHaveLength(3);
        expect(args[1].data.decorativeIcon).toBe(icon);
    });
});
