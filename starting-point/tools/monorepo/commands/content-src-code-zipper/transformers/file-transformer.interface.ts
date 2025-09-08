/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export enum SupportedProject {
    ContentApa = 'content-ee-apa',
    WorkspaceHxp = 'workspace-hxp',
}

export type FileTransformer<T = any> = (filename: string, config: T) => string | Promise<string>;
