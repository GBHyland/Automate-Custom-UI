/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TranslateLoaderService } from '@alfresco/adf-core';
import { HttpClientModule } from '@angular/common/http';
import { LOCALE_ID, NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import translations from '../../../../assets/i18n/en.json';
@NgModule({
    declarations: [],
    imports: [
        HttpClientModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useClass: TranslateLoaderService,
            },
        }),
    ],
    providers: [{ provide: LOCALE_ID, useValue: 'en' }, TranslateService],
    exports: [TranslateModule],
})
export class I18nModule {
    constructor(translate: TranslateService) {
        translate.setDefaultLang('en');
        translate.use('en');
        translate.setTranslation('en', translations);
    }
}
