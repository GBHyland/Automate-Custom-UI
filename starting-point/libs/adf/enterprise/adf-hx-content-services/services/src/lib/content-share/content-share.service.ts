/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { DocumentRouterService } from '../document/document-router/document-router.service';

@Injectable({
    providedIn: 'root',
})
export class ContentShareService {
    constructor(private documentRouterService: DocumentRouterService) {}

    getSingleContentShareLink(document?: Document): string | undefined {
        return document ? this.documentRouterService.urlFor(document, { absolute: true }) : undefined;
    }
}
