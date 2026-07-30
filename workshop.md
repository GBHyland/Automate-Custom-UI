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

    landingPageURL = 'portal';

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


### header.component.html
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
[routerLink]="landingPageUrl"
>DASHBOARD</h4>
```

**Optional Header:**
```
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>9 Second Insurance - Claims Portal</title>

<style>
  body {
    margin: 0;
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  }

  .header {
    background-color: #0B3D91; /* Dark blue */
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 24px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .logo {
    width: 40px;
    height: 40px;
    background-color: white;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #0B3D91;
    font-weight: bold;
    font-size: 14px;
  }

  .title {
    font-size: 20px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  .admin-btn {
    background-color: #ffffff;
    color: #0B3D91;
    border: none;
    padding: 10px 16px;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .admin-btn:hover {
    background-color: #e6eaf2;
  }
</style>
</head>

<body>

<header class="header">
  <div class="header-left">
    <!-- Replace this with an <img src="your-logo.png"> if you have a real logo -->
    <div class="logo">INS</div>
    <div class="title">9 Second Insurance - Claims Portal</div>
  </div>

  <button class="admin-btn" role="link" [routerLink]="landingPageURL">Admin Portal</button>
</header>

</body>
</html>
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
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>9SecondInsurance | Insurance Case Dashboard</title>

  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: Inter, Arial, sans-serif;
    }

    body {
      background: #f4f7fb;
      color: #1f2937;
    }

    .app {
      display: flex;
      min-height: 100vh;
    }

    .sidebar {
      width: 260px;
      background: linear-gradient(180deg, #111827, #1e3a8a);
      color: white;
      padding: 28px 22px;
    }

    .logo {
      font-size: 24px;
      font-weight: 800;
      margin-bottom: 34px;
    }

    .logo span {
      color: #38bdf8;
    }

    .nav a {
      display: block;
      color: #dbeafe;
      text-decoration: none;
      padding: 14px 16px;
      margin-bottom: 10px;
      border-radius: 12px;
      font-weight: 600;
    }

    .nav a.active,
    .nav a:hover {
      background: rgba(255, 255, 255, 0.14);
    }

    .main {
      flex: 1;
      padding: 30px;
    }

    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 28px;
    }

    .topbar h1 {
      font-size: 30px;
      color: #111827;
    }

    .search {
      padding: 12px 16px;
      border: 1px solid #d1d5db;
      border-radius: 14px;
      width: 320px;
      font-size: 14px;
    }

    .cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 18px;
      margin-bottom: 28px;
    }

    .card {
      background: white;
      border-radius: 18px;
      padding: 22px;
      box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
    }

    .card .label {
      color: #6b7280;
      font-size: 14px;
      margin-bottom: 8px;
    }

    .card .value {
      font-size: 30px;
      font-weight: 800;
    }

    .card.blue { border-left: 6px solid #2563eb; }
    .card.green { border-left: 6px solid #16a34a; }
    .card.orange { border-left: 6px solid #f97316; }
    .card.red { border-left: 6px solid #dc2626; }

    .content-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 22px;
    }

    .panel {
      background: white;
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
    }

    .panel h2 {
      margin-bottom: 18px;
      font-size: 20px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      text-align: left;
      color: #6b7280;
      font-size: 13px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e5e7eb;
    }

    td {
      padding: 16px 0;
      border-bottom: 1px solid #f1f5f9;
      font-size: 14px;
    }

    .claim-id {
      font-weight: 800;
      color: #1d4ed8;
    }

    .status {
      padding: 7px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 800;
      display: inline-block;
    }

    .open { background: #dbeafe; color: #1d4ed8; }
    .review { background: #ffedd5; color: #c2410c; }
    .approved { background: #dcfce7; color: #15803d; }
    .urgent { background: #fee2e2; color: #b91c1c; }

    .claim-detail {
      background: linear-gradient(135deg, #eff6ff, #ffffff);
      border: 1px solid #dbeafe;
      border-radius: 18px;
      padding: 20px;
      margin-bottom: 20px;
    }

    .claim-detail h3 {
      font-size: 18px;
      margin-bottom: 8px;
    }

    .claim-detail p {
      color: #4b5563;
      line-height: 1.5;
      margin-bottom: 14px;
    }

    .progress {
      height: 10px;
      background: #e5e7eb;
      border-radius: 999px;
      overflow: hidden;
      margin-top: 10px;
    }

    .progress div {
      height: 100%;
      width: 72%;
      background: linear-gradient(90deg, #2563eb, #38bdf8);
    }

    .activity {
      list-style: none;
    }

    .activity li {
      padding: 15px 0;
      border-bottom: 1px solid #f1f5f9;
    }

    .activity strong {
      display: block;
      margin-bottom: 4px;
    }

    .activity span {
      color: #6b7280;
      font-size: 13px;
    }

    .button {
      display: inline-block;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 12px;
      padding: 12px 16px;
      font-weight: 800;
      cursor: pointer;
      margin-top: 12px;
    }

    .button:hover {
      background: #1d4ed8;
    }

    @media (max-width: 1000px) {
      .cards,
      .content-grid {
        grid-template-columns: 1fr;
      }

      .sidebar {
        display: none;
      }

      .search {
        width: 100%;
      }

      .topbar {
        gap: 16px;
        flex-direction: column;
        align-items: flex-start;
      }
    }
  </style>
</head>

<body>
  <div class="app">
    <aside class="sidebar">
      <div class="logo">Claim<span>Guard</span></div>

      <nav class="nav">
        <a href="#" class="active">Dashboard</a>
        <a href="#">Claims</a>
        <a href="#">Policy Holders</a>
        <a href="#">Documents</a>
        <a href="#">Investigations</a>
        <a href="#">Payments</a>
        <a href="#">Reports</a>
      </nav>
    </aside>

    <main class="main">
      <div class="topbar">
        <div>
          <h1>Insurance Claims Dashboard</h1>
          <p>Case management overview for active claim processing</p>
        </div>
        <input class="search" type="text" placeholder="Search claim number, policy, claimant..." />
      </div>

      <section class="cards">
        <div class="card blue">
          <div class="label">Open Claims</div>
          <div class="value">128</div>
        </div>

        <div class="card green">
          <div class="label">Approved Today</div>
          <div class="value">34</div>
        </div>

        <div class="card orange">
          <div class="label">Under Review</div>
          <div class="value">57</div>
        </div>

        <div class="card red">
          <div class="label">High Priority</div>
          <div class="value">12</div>
        </div>
      </section>

      <section class="content-grid">
        <div class="panel">
          <h2>Recent Claim Cases</h2>

          <table>
            <thead>
              <tr>
                <th>Claim</th>
                <th>Claimant</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td class="claim-id">#CLM-10482</td>
                <td>Maria Thompson</td>
                <td>Auto Collision</td>
                <td>$8,420</td>
                <td><span class="status review">Review</span></td>
              </tr>

              <tr>
                <td class="claim-id">#CLM-10481</td>
                <td>David Chen</td>
                <td>Water Damage</td>
                <td>$14,760</td>
                <td><span class="status open">Open</span></td>
              </tr>

              <tr>
                <td class="claim-id">#CLM-10480</td>
                <td>Angela Brooks</td>
                <td>Theft</td>
                <td>$3,250</td>
                <td><span class="status approved">Approved</span></td>
              </tr>

              <tr>
                <td class="claim-id">#CLM-10479</td>
                <td>Robert Ellis</td>
                <td>Fire Damage</td>
                <td>$42,900</td>
                <td><span class="status urgent">Urgent</span></td>
              </tr>

              <tr>
                <td class="claim-id">#CLM-10478</td>
                <td>Sophia Martinez</td>
                <td>Medical</td>
                <td>$6,180</td>
                <td><span class="status open">Open</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <aside class="panel">
          <h2>Featured Case</h2>

          <div class="claim-detail">
            <h3>#CLM-10479</h3>
            <p>
              Fire damage claim for residential property. Awaiting inspection report,
              contractor estimate, and fraud review clearance.
            </p>

            <strong>Completion</strong>
            <div class="progress">
              <div></div>
            </div>

            <button class="button">Open Case</button>
          </div>

          <h2>Recent Activity</h2>

          <ul class="activity">
            <li>
              <strong>Document uploaded</strong>
              <span>Inspection photo added to #CLM-10482</span>
            </li>

            <li>
              <strong>Payment authorized</strong>
              <span>$3,250 approved for #CLM-10480</span>
            </li>

            <li>
              <strong>Adjuster assigned</strong>
              <span>New adjuster assigned to #CLM-10479</span>
            </li>

            <li>
              <strong>Policy verified</strong>
              <span>Coverage confirmed for #CLM-10481</span>
            </li>
          </ul>
        </aside>
      </section>
    </main>
  </div>
</body>
</html>
```
