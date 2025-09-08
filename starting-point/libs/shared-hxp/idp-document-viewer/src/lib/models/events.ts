/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export enum EventTypes {
    // Viewer events
    ZoomChanged = 'ZoomChanged',
    RotationChanged = 'RotationChanged',
    FullScreenEnter = 'FullScreenEnter',
    FullScreenExit = 'FullScreenExit',
    LayoutChanged = 'LayoutChanged',
    PageSelected = 'PageSelected',
    ViewChanged = 'ViewChanged',
    DataSourceChanged = 'DataSourceChanged',
    Resize = 'Resize',
    ImageLoaded = 'ImageLoaded',
}

export interface DocumentRef {
    documentId: string;
    pageId: string;
    viewerRotation?: number;
}

export interface ViewerEvent<T> {
    type: EventTypes;
    timestamp: string; // UTC timestamp
    data?: {
        oldValue?: T;
        newValue?: T;
        dataSourceRef: DocumentRef[];
    };
}

export function isInstanceOfHxIdpViewerEvent<T>(event: unknown): event is ViewerEvent<T> {
    return (event as ViewerEvent<T>).type !== undefined;
}
