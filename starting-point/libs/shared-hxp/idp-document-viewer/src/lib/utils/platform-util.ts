/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export enum Platform {
    Windows = 'windows',
    Mac = 'mac',
}

export const PlatformUtil = {
    getPlatform: (): Platform => {
        const osTestStrings = [
            { s: Platform.Windows, r: /(Win|Windows NT)/ },
            { s: Platform.Mac, r: /(Mac OS|Mac OS X|MacPPC|MacIntel|Mac_PowerPC|Macintosh)/ },
        ];

        const platform = osTestStrings.find((os) => os.r.test(navigator.userAgent));
        return platform ? platform.s : Platform.Windows;
    },
};
