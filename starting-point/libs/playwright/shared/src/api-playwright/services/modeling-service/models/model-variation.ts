/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export interface ModelCustomParameters {
    processCategory?: string;
    variables?: object;
    errors?: object;
    entityUUID?: string;
}

export interface ModelVariation {
    displayName: string;
    namePrefix: string;
    type: string;
    contentType: string;
    contentExtension: string;

    getDefaultContent(entityName: string, entityId: string, customParameters?: ModelCustomParameters): string;
    getDefaultExtensionsContent(customParameters?: ModelCustomParameters): any;
}
