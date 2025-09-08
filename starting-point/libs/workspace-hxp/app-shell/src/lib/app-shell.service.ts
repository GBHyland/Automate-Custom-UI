/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AppConfigService, UserPreferencesService } from '@alfresco/adf-core';
import { ShellAppService } from '@alfresco/adf-core/shell';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable()
export class HxpAppShellService implements ShellAppService {
    pageHeading$: Observable<string> = of('HxP Workspace');
    minimizeSidenavConditions: string[] = [];
    hideSidenavConditions: string[] = [];

    constructor(public preferencesService: UserPreferencesService, public appConfigService: AppConfigService) {
        const customCssPath = this.appConfigService.get<string>('customCssPath');
        const webFontPath = this.appConfigService.get<string>('webFontPath');

        if (customCssPath) {
            this.createLink(customCssPath);
        }

        if (webFontPath) {
            this.createLink(webFontPath);
        }
    }

    private createLink(url: string): void {
        const cssLinkElement = document.createElement('link');
        cssLinkElement.setAttribute('rel', 'stylesheet');
        cssLinkElement.setAttribute('type', 'text/css');
        cssLinkElement.setAttribute('href', url);
        document.head.append(cssLinkElement);
    }
}
