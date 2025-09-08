/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable, inject } from '@angular/core';
import { NotificationCloudService } from '@alfresco/adf-process-services-cloud';
import { NotificationModel, NotificationService, AuthenticationService } from '@alfresco/adf-core';
import { TranslateService } from '@ngx-translate/core';
import { filter, map } from 'rxjs/operators';
import { IdentityUserService } from '@alfresco-dbp/shared/identity';
import { AlfrescoApiService } from '@alfresco/adf-content-services';

const SUBSCRIPTION_QUERY = `
    subscription {
        engineEvents(eventType: [TASK_COMPLETED, TASK_ASSIGNED, TASK_ACTIVATED, TASK_SUSPENDED, TASK_CANCELLED, TASK_UPDATED]) {
            eventType
            entity
        }
    }
`;

@Injectable({
    providedIn: 'root',
})
export class AppSubscriptionService {
    private authenticationService = inject(AuthenticationService);

    constructor(
        private notificationCloudService: NotificationCloudService,
        private notificationService: NotificationService,
        private translateService: TranslateService,
        private identityUserService: IdentityUserService,
        private apiService: AlfrescoApiService
    ) {}

    initAppNotifications(config) {
        this.apiService.alfrescoApiInitialized
            .pipe(filter((appInitialized) => !!appInitialized && this.authenticationService.isLoggedIn()))
            .subscribe(() => {
                if (config['alfresco-deployed-apps']?.length) {
                    config['alfresco-deployed-apps'].forEach((app) => {
                        this.notificationCloudService
                            .makeGQLQuery(app.name, SUBSCRIPTION_QUERY)
                            .pipe(map((events: any) => events.data.engineEvents))
                            .subscribe((result) => {
                                result.map((engineEvent) => this.notifyEvent(engineEvent));
                            });
                    });
                }
            });
    }

    notifyEvent(engineEvent) {
        let message;
        switch (engineEvent.eventType) {
            case 'TASK_ASSIGNED':
                message = this.translateService.instant('NOTIFICATIONS.TASK_ASSIGNED', {
                    taskName: engineEvent.entity.name || '',
                    assignee: engineEvent.entity.assignee,
                });
                this.pushNotification(engineEvent, message);
                break;
            case 'TASK_UPDATED':
                message = this.translateService.instant('NOTIFICATIONS.TASK_UPDATED', { taskName: engineEvent.entity.name || '' });
                this.pushNotification(engineEvent, message);
                break;
            case 'TASK_COMPLETED':
                message = this.translateService.instant('NOTIFICATIONS.TASK_COMPLETED', { taskName: engineEvent.entity.name || '' });
                this.pushNotification(engineEvent, message);
                break;
            case 'TASK_ACTIVATED':
                message = this.translateService.instant('NOTIFICATIONS.TASK_ACTIVATED', { taskName: engineEvent.entity.name || '' });
                this.pushNotification(engineEvent, message);
                break;
            case 'TASK_CANCELLED':
                message = this.translateService.instant('NOTIFICATIONS.TASK_CANCELLED', { taskName: engineEvent.entity.name || '' });
                this.pushNotification(engineEvent, message);
                break;
            case 'TASK_SUSPENDED':
                message = this.translateService.instant('NOTIFICATIONS.TASK_SUSPENDED', { taskName: engineEvent.entity.name || '' });
                this.pushNotification(engineEvent, message);
                break;
            default:
        }
    }

    pushNotification(engineEvent: any, message: string) {
        if (engineEvent.entity.assignee === this.identityUserService.getCurrentUserInfo().username) {
            const notification = {
                messages: [message],
                icon: 'info',
                datetime: new Date(),
                initiator: { displayName: engineEvent.entity.initiator || 'System' },
            } as NotificationModel;

            this.notificationService.pushToNotificationHistory(notification);
        }
    }
}
