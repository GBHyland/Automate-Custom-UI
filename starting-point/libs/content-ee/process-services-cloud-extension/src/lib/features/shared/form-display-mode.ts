/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FormCloudDisplayMode } from '@alfresco/adf-process-services-cloud';

export const FORM_DISPLAY_MODES = [
    {
        displayMode: FormCloudDisplayMode.inline,
        default: true,
    },
    {
        displayMode: FormCloudDisplayMode.fullScreen,
        options: {
            onDisplayModeOn: () => {},
            onDisplayModeOff: () => {},
            onCompleteTask: () => {},
            onSaveTask: () => {},
            fullscreen: true,
            displayToolbar: true,
            displayCloseButton: true,
            trapFocus: true,
        },
    },
    {
        displayMode: FormCloudDisplayMode.standalone,
        options: {
            onDisplayModeOn: () => {},
            onDisplayModeOff: () => {},
            onCompleteTask: () => {},
            onSaveTask: () => {},
            fullscreen: true,
            displayToolbar: false,
            trapFocus: true,
        },
    },
];
