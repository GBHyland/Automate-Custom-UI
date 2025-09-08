/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export * from './lib/workspace-hxp-idp-services-extension-shared.module';

export * from './lib/models/common-models';
export * from './lib/models/contracts/task-input';
export * from './lib/models/contracts/idp-configuration';
export * from './lib/models/api-models/idp-api-recognition-models';
export * from './lib/models/api-models/task-context';

export * from './lib/services/context-task/context-task-base.service';
export * from './lib/services/backend/process-task-backend.service';
export * from './lib/services/backend/idp-backend.service';
export * from './lib/services/image/idp-shared-image-loading.service';
export * from './lib/services/shortcut/idp-shortcut.service';
export * from './lib/services/uuid/uuid.service';

export * from './lib/components/filterable-selection-list/filterable-selection-list.component';
export * from './lib/components/task-header/task-header.component';

export * from './lib/dialogs/reject-document-dialog/reject-document.dialog';
export * from './lib/dialogs/shortcut-browser/shortcut-browser.dialog.component';

export * from './lib/directives/template-let.directive';

export * from './lib/pipes/capitalize-string.pipe';

export * from './lib/dedicated-screens/dedicated-screen-base.component';

export * from './lib/services/session/session.service';
