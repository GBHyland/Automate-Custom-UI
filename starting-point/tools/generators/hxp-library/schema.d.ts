/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export interface LibraryGeneratorSchema {
    type: string;
    name?: string;
    addTailwind?: boolean;
    skipFormat?: boolean;
    simpleModuleName?: boolean;
    addModuleSpec?: boolean;
    directory: string;
    sourceDir?: string;
    buildable?: boolean;
    publishable?: boolean;
    importPath?: string;
    standaloneConfig?: boolean;
    spec?: boolean;
    flat?: boolean;
    commonModule?: boolean;
    prefix?: string;
    routing?: boolean;
    lazy?: boolean;
    parentModule?: string;
    tags?: string;
    strict?: boolean;
    linter?: AngularLinter;
    unitTestRunner?: UnitTestRunner;
    compilationMode?: 'full' | 'partial';
    setParserOptionsProject?: boolean;
}
