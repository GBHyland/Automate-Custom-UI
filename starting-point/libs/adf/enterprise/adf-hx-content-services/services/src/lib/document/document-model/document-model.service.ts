/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Inject, Injectable } from '@angular/core';
import { ModelApi } from '@hylandsoftware/hxcs-js-client';
import { MODEL_API_TOKEN } from '@alfresco/adf-hx-content-services/api';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { DocumentModel } from './document-model.model';

@Injectable({
    providedIn: 'root',
})
export class DocumentModelService {
    private model$: Observable<DocumentModel> | undefined;

    constructor(@Inject(MODEL_API_TOKEN) protected modelApi: ModelApi) {
        this.model$ = this.getModel();
    }

    getModel(): Observable<DocumentModel> {
        if (!this.model$) {
            this.model$ = from(this.modelApi.getModel()).pipe(map((response) => new DocumentModel(response.data)));
        }
        return this.model$;
    }
}
