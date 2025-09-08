/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { APP_INITIALIZER, EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { ExtensionService, provideExtensionConfig } from '@alfresco/adf-extensions';
import {
    PublicFormContainerComponent,
    SubmissionSuccessComponent,
    submissionSuccessGuard,
} from '@hxp/workspace-hxp/public-access-extension/public-forms';
import { PublicAccessShellComponent } from './components/public-access-shell/public-access-shell.component';
import { ErrorContentComponent } from '@alfresco/adf-core';

export function setupPublicAccessExtensions(extensions: ExtensionService): () => void {
    return () => {
        extensions.setComponents({
            'public-access.shell.main-content': PublicAccessShellComponent,
            'public-access.shell.error': ErrorContentComponent,
            'public-access.forms-container': PublicFormContainerComponent,
            'public-access.forms.success': SubmissionSuccessComponent,
        });

        extensions.setAuthGuards({
            'public-access.forms.success.auth': submissionSuccessGuard,
        });
    };
}

export function providePublicAccessShell(): EnvironmentProviders {
    return makeEnvironmentProviders([
        provideExtensionConfig(['public-access.extension.json']),
        {
            provide: APP_INITIALIZER,
            useFactory: setupPublicAccessExtensions,
            deps: [ExtensionService],
            multi: true,
        },
    ]);
}
