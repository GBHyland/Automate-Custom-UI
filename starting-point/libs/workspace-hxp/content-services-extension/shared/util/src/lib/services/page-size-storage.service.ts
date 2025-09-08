/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { StorageService } from '@alfresco/adf-core';
import { PaginationDefault, SavedPaginationKey } from '../config/pagination.config';

@Injectable({
    providedIn: 'root',
})
export class PageSizeStorageService {
    constructor(private storageService: StorageService) {}
    public setSize(size: number): void {
        this.storageService.setItem(SavedPaginationKey, size.toString());
    }

    public getSize(): number {
        const size = parseInt(this.storageService.getItem(SavedPaginationKey) || `${PaginationDefault}`, 10);
        return isNaN(size) ? PaginationDefault : size;
    }
}
