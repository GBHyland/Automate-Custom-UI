/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export interface AlfrescoPlaywrightGeneratorSchema {
    name: string;
    directory: string;
    importPath?: string;
    standaloneConfig?: boolean;
    tags?: string;
    strict?: boolean;
    provideExample?: boolean;
    skipFormat?: boolean;
    addModuleSpec?: boolean;
    unitTestRunner: UnitTestRunner;
    linter?: AngularLinter;
    appName?: 'admin-apa' | 'studio-apa' | 'content-ee-apa' | 'studio-hxp' | 'workspace-hxp' | 'none';
    ž;
}
