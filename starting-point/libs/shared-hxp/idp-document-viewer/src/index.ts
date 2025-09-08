/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export {
    IdpDocument as IdpViewerDocument,
    IdpPage as IdpViewerPage,
    ImageData as IdpViewerImageData,
    Datasource as IdpViewerDatasource,
    DatasourceOcr as IdpViewerDatasourceOcr,
} from './lib/models/datasource';
export {
    ToolbarPosition as IdpViewerToolbarPosition,
    ConfigOptions as IdpViewerConfigOptions,
    LayoutState as IdpViewerLayoutState,
} from './lib/models/config-options';
export { UserLayoutOptions as IdpViewerUserLayoutOptions, Layout as IdpViewerLayout, getAllowedActions } from './lib/models/layout';
export { ToolbarItemTypes as IdpViewerToolbarItemTypes } from './lib/models/toolbar';
export { EventTypes as IdpViewerEventTypes, ViewerEvent as IdpViewerEvent, DocumentRef as IdpViewerDocumentRef } from './lib/models/events';
export { ViewerLayerType as IdpViewerLayerType } from './lib/models/viewer-layer';
export {
    ViewerOcrCandidate as IdpViewerOcrCandidate,
    ViewerTextData as IdpViewerTextData,
    ViewerTextHighlightData as IdpViewerTextHighlightData,
} from './lib/models/text-layer/ocr-candidate';
export { DrawStyles as IdpViewerTextHighlightState } from './lib/models/text-layer/drawing-config';

export { IdpViewerComponent } from './lib/idp-viewer/idp-viewer.component';
export { EmptyComponent as IdpViewerEmptyComponent } from './lib/viewer-empty/viewer-empty.component';
export { FooterStickyActionComponent as IdpViewerFooterStickyActionComponent } from './lib/viewer-footer/sticky-action/sticky-action.component';
export { IdpViewerHeaderProjectionComponent } from './lib/viewer-header/idp-viewer-header-projection.component';
export {
    ViewerShortcutSummary as IdpViewerShortcutSummary,
    ViewerShortcutService as IdpViewerShortcutService,
} from './lib/services/viewer-shortcut.service';
export { ToolbarComponent as IdpViewerToolbar } from './lib/viewer-toolbar/toolbar.component';
export { ViewerTextLayerComponent as IdpViewerTextLayerComponent } from './lib/viewer-text-layer/viewer-text-layer.component';
export { ViewerContentLayerDirective as IdpViewerContentLayerDirective } from './lib/directives/viewer-content-layer.directive';
