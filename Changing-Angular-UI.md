## Changing the Angular UI

### Change the Home Page to a Custom Page
1. Open the file _experience-workspace-app-shell.routes.ts_ found the in the following directory: _libs/workspace-hxp/app-shell/src/lib/_
2. Change the following line: 
**FROM**:
```
import { HomeComponent } from './home/home.component';
```
**TO:**
```
import { NineSiComponent } from '../../../../plugins/ninesi/src/lib/pages/nine-si/nine-si.component';
```
3. Change the following line:
**FROM**
```
component: HomeComponent,
```
**TO:**
```
component: NineSiComponent,
```
4. If your Custom UI is not already running, start it using the following command in Terminal and ensure that the opening page is the new Custom Page you created.
```
npm start workspace-hxp
```

