/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Document } from '@hylandsoftware/hxcs-js-client';
import { Observable } from 'rxjs';

export type DocumentCreateProperties = Partial<Document> & Pick<Document, 'sys_primaryType'>;

export interface DocumentFetchOptions {
    limit: number;
    offset: number;
    sort: Array<string>; // sort options as a tuple of key/value (document property, asc / desc)
}

export interface DocumentFetchResults {
    documents: Array<Document>;
    limit: number;
    offset: number;
    totalCount: number;
}

export interface DocumentUpdateInfo {
    document?: Document;
    updatedProperties: Map<string, any>;
}

export interface ToggleNodeOptions {
    limit?: number;
    offset?: number;
    isRefresh?: boolean;
    expand: boolean;
}

export type DocumentType = 'FOLDER' | 'FILE';

export interface IDocumentService {
    /**
     * Observable that emits Document values when a new document is loaded.
     */
    documentLoaded$: Observable<Document | undefined>;

    /**
     * Observable that emits Document values when a new document is created.
     */
    documentCreated$: Observable<Document>;

    /**
     * Observable that emits document ids, when a document is deleted.
     */
    documentDeleted$: Observable<string>;

    /**
     * Get the document model given the id.
     * @param id the id of the model
     * @param repositoryId the id of the repository
     * @returns an observable that emits the document if it exists
     */
    getDocumentById(documentId: string, repositoryId: string): Observable<Document>;

    /**
     * Get the document model given the path.
     * @param path the path of the document
     * @param repositoryId the id of the repository
     * @returns an observable that emits the document if it exists
     */
    getDocumentByPath(path: string, repositoryId: string): Observable<Document>;

    /**
     * Get the document ancestors.
     * @param documentId the id of the document
     * @param repositoryId the id of the repository
     * @returns an observable that emits an array with the document ancestors if any exists
     */
    getAncestors(documentId: string, repositoryId: string): Observable<Document[]>;

    /**
     * Get the children documents of the given document including non folderish ones.
     * @param parentId the id of the parent document
     * @param options the options used to fetch the documents
     * @param repositoryId the id of the repository
     * @returns an observable that emits an array with the children documents
     */
    getAllChildren(parentId: string, options?: DocumentFetchOptions, repositoryId?: string): Observable<DocumentFetchResults>;

    /**
     * Get the children documents of the given document excluding non folderish ones.
     * @param parentId the id of the parent document
     * @param repositoryId the id of the repository
     * @returns an observable that emits an object with the get results
     */
    getFolderChildren(parentId: string, repositoryId: string, options: DocumentFetchOptions): Observable<DocumentFetchResults>;

    /**
     * Create a new document with the given properties.
     * `sys_primaryType` is mandatory for document creation.
     * @param properties the properties of the new document
     * @param repositoryId the id of the repository
     * @returns an observable that emits the newly created document
     */
    createDocument(properties: DocumentCreateProperties, repositoryId: string): Observable<Document>;

    /**
     * Delete a document given the id.
     * @param documentId the id of the document to be deleted
     * @param repositoryId the id of the repository
     * @return an observable that emits the id of the document deleted
     */
    deleteDocument(documentId: string, repositoryId: string): Observable<string>;

    /**
     * Notifies that the given document has been loaded successfully.
     * @param document the document that was loaded
     */
    notifyDocumentLoaded(document: Document): void;
}
