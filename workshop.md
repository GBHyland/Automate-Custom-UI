### header.component.ts
```
/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AppConfigService } from '@alfresco/adf-core';
import { ContentActionRef, ExtensionService } from '@alfresco/adf-extensions';
import { Component, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDividerModule } from '@angular/material/divider';
import { HeaderComponent } from '@hxp/shared-hxp/navigation/header';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { RouterLink } from '@angular/router';
import { IdentityUserService } from '@alfresco/adf-process-services-cloud';

interface HxpHeaderConfig {
    headerColor: string;
    headerTextColor: string;
    application: {
        name: string;
        logo: string;
        headerImagePath: string;
    };
    features?: {
        header?: ContentActionRef[];
    };
}

@Component({
    selector: 'hxp-workspace-header',
    templateUrl: './header.component.html',
    imports: [MatDividerModule, HeaderComponent, RouterLink],
})
export class HxpWorkspaceHeaderComponent {
    private readonly extensionService = inject(ExtensionService);
    private readonly appConfigService = inject(AppConfigService);

    readonly headerTextColor = signal<string>('');
    readonly backgroundColor = signal<string>('');
    readonly backgroundImage = signal<string>('');
    readonly logoPath = signal<string>('');

    readonly config = toSignal<HxpHeaderConfig | null>(
        this.extensionService.setup$.pipe(
            switchMap(() => of<HxpHeaderConfig | null>(this.appConfigService.config))
        ),
        { initialValue: null }
    );

    landingpageURL = 'portal';

    constructor(private identityUserService: IdentityUserService) {
        effect(() => {
            const config = this.config();
            if (config) {
                if (config.headerTextColor) {
                    this.headerTextColor.set(config.headerTextColor);
                }
                if (config.headerColor) {
                    this.backgroundColor.set(config.headerColor);
                }
                if (config.application.headerImagePath) {
                    this.backgroundImage.set(config.application.headerImagePath);
                }
                if (config.application.logo) {
                    this.logoPath.set(config.application.logo);
                }
            }
        });

        // load the page based on identity of user
        console.log("This is the user: "+this.identityUserService.getCurrentUserInfo().firstName+"  "+this.identityUserService.getCurrentUserInfo().lastName);
        this.identityUserService.search(
            this.identityUserService.getCurrentUserInfo().username, 
            {groups: ['Claims Admin']}).subscribe(users => {console.log(users);
                (users.length > 0) ?
                this.landingpageURL = '/dashboard': this.landingpageURL = '/portal'
            })
    }
}

```


### 
header.component.html
```
<!--<hxp-header
    [logoPath]="logoPath()"
    [backgroundColor]="backgroundColor()"
    [backgroundImage]="backgroundImage()"
    [headerTextColor]="headerTextColor()"
/>-->
<h4 
role="link"
class="px-5"
[routerLink]="landingpageURL"
>DASHBOARD</h4>
```


### experience-workspace-app-shell-routes.ts
```
/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Routes } from '@angular/router';
import { ExtensionsDataLoaderGuard } from './extensions/extensions-data-loader.guard';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from '@alfresco/adf-core';
import { FeatureFlagsWrapperComponent, IsFlagsOverrideOn } from '@alfresco/adf-core/feature-flags';
import { AppLayoutContainerComponent } from './layout-container/app-layout-container.component';
import { NineSiComponent } from 'libs/plugins/ninesi/src/lib/pages/nine-si/nine-si.component';
import { customDashComponent } from '../../../../dashboard/customDashComponent';

export const APP_ROUTES: Routes = [
    {
        path: 'flags',
        component: FeatureFlagsWrapperComponent,
        canMatch: [IsFlagsOverrideOn],
    },
    {
        path: '',
        component: AppLayoutContainerComponent,
        canActivate: [ExtensionsDataLoaderGuard],
        children: [
            {
                path: '',
                canActivate: [AuthGuard],
                component: HomeComponent,
                pathMatch: 'full',
            },
            {
                path: 'task-details-cloud/:id',
                loadChildren: () =>
                    import('@hxp/workspace-hxp/idp-services-extension/class-verification/feature-shell').then(
                        (m) => m.WorkspaceHxpIdpServicesClassVerificationFeatureShellModule
                    ),
            },
        ],
    },
    {
        path: 'portal',
        component: NineSiComponent
        
    },
    {
        path: 'dashboard',
        component: customDashComponent
        
    }
];


```

---

## Create these 2 files at: _libs/_

### customDashComponent.ts:
```
import { Component } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { HeaderComponent } from '@hxp/shared-hxp/navigation/header';
import { RouterLink } from '@angular/router';



@Component({
    selector: 'hxp-dashboard',
    templateUrl: './customDashComponent.html',
    imports: [MatDividerModule, HeaderComponent, RouterLink],
})
export class customDashComponent {
    constructor(){
    }
    ngOnInit(){

    }
}
```


### customDashComponent.html:
```
<html>
    <h4>Hello World!</h4>
    <p>I love Angular!</p>
</html>
```
