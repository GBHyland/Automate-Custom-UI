/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { DEFAULT_ITEMS_PER_PAGE, DocumentFetchResults, DocumentService, isRoot } from '@alfresco/adf-hx-content-services/services';
import { BehaviorSubject, Observable, forkJoin, of } from 'rxjs';
import { catchError, map, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import { ROOT_DOCUMENT } from '@alfresco/adf-hx-content-services/api';

export interface BreadcrumbData {
    parentFolder: Document;
    currentFolder: Document;
    subFolders: Document[];
    totalCount: number;
}

export interface BreadcrumbEntry {
    document: Document;
    type: BreadcrumbEntryTypes;
}

export enum BreadcrumbEntryTypes {
    PARENT = 'PARENT',
    SELF = 'SELF',
}

export interface BreadcrumbSubFolders {
    subFolders: Document[];
    totalCount: number;
}

@Injectable({
    providedIn: 'root',
})
export class BreadcrumbDataService {
    isLoading$: Observable<boolean>;

    private isLoadingSubject = new BehaviorSubject<boolean>(false);
    private offset = 0;
    private childFolders: Document[] = [];
    private folderCount = 0;

    constructor(private documentService: DocumentService) {
        this.isLoading$ = this.isLoadingSubject.asObservable();
    }

    getBreadcrumbData(breadcrumbEntry: BreadcrumbEntry): Observable<BreadcrumbData> {
        this.isLoadingSubject.next(true);
        const parentFolder$: Observable<Document> = this.getParentFolder(breadcrumbEntry).pipe(shareReplay(1));

        const subFolders$: Observable<BreadcrumbSubFolders> = parentFolder$.pipe(
            switchMap((parentFolder) => this.getSubFolders(parentFolder, this.offset, DEFAULT_ITEMS_PER_PAGE, this.childFolders))
        );

        return forkJoin([parentFolder$, subFolders$]).pipe(
            map(([parentFolder, subFolderDetails]) => ({
                parentFolder,
                currentFolder: parentFolder,
                subFolders: subFolderDetails.subFolders,
                totalCount: subFolderDetails.totalCount,
            })),
            tap((breadcrumbData: BreadcrumbData) => {
                this.isLoadingSubject.next(false);
                this.childFolders = breadcrumbData.subFolders;
                this.folderCount = breadcrumbData.totalCount;
            })
        );
    }

    handleLoadMore(): Observable<boolean> {
        return this.isLoading$.pipe(take(1)).pipe(
            map((isLoading) => {
                if (this.childFolders?.length !== this.folderCount && !isLoading) {
                    this.isLoadingSubject.next(true);
                    this.offset += DEFAULT_ITEMS_PER_PAGE;
                    return true;
                }
                return false;
            })
        );
    }

    resetPagination(): void {
        this.offset = 0;
        this.folderCount = 0;
        this.childFolders = [];
    }

    filterSubfolders(breadcrumbData: BreadcrumbData | null, document: Document): BreadcrumbData | null {
        if (!breadcrumbData?.subFolders) {
            return breadcrumbData;
        }
        return {
            ...breadcrumbData,
            subFolders: breadcrumbData.subFolders.filter((subFolder) => subFolder.sys_id !== document.sys_id),
        };
    }

    private getParentFolder(breadcrumbEntry: BreadcrumbEntry): Observable<Document> {
        return this.documentService.getAncestors(breadcrumbEntry.document.sys_id || '')?.pipe(
            catchError(() => of([ROOT_DOCUMENT] as Document[])),
            map((ancestors: Document[]) => this.findAccessibleParent(ancestors, breadcrumbEntry))
        );
    }

    private getSubFolders(
        parentFolder: Document,
        offset = 0,
        limit = DEFAULT_ITEMS_PER_PAGE,
        childFolders: Document[] = []
    ): Observable<BreadcrumbSubFolders> {
        const options: any = {
            offset,
            limit,
            sort: [],
        };

        return this.documentService.getFolderChildren(parentFolder.sys_id || '', '', options).pipe(
            catchError(() =>
                of({
                    documents: [],
                    limit: 0,
                    offset: 0,
                    totalCount: 0,
                } as DocumentFetchResults)
            ),
            map(({ documents, totalCount }: DocumentFetchResults) => ({ subFolders: [...childFolders, ...documents], totalCount }))
        );
    }

    private findAccessibleParent(ancestors: Document[], breadcrumbEntry: BreadcrumbEntry) {
        const { sys_id } = breadcrumbEntry.document;

        const parentWithPermission = ancestors
            .slice()
            .reverse()
            .find(
                (ancestor) =>
                    ancestor &&
                    // This condition distinguishes between selection and navigation actions within the repository.
                    (breadcrumbEntry.type === BreadcrumbEntryTypes.SELF ? ancestor.sys_id === sys_id : ancestor.sys_id !== sys_id) &&
                    !isRoot(ancestor)
            );

        return parentWithPermission || ROOT_DOCUMENT;
    }
}
