/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { MockProvider, MockService, ngMocks } from 'ng-mocks';
import { generateMockResponse, jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { DocumentPropertiesService } from './document-properties.service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { CardViewModule, DecimalNumberPipe, FileSizePipe, LocalizedDatePipe, NoopTranslateModule } from '@alfresco/adf-core';
import { firstValueFrom, Observable, of } from 'rxjs';
import { Document, ModelApi, User, DocumentApi } from '@hylandsoftware/hxcs-js-client';
import { MODEL_API_TOKEN, DOCUMENT_API_TOKEN } from '@alfresco/adf-hx-content-services/api';
import { DOCUMENT_PROPERTIES_SERVICE } from './shared-document-properties.service';
import { DocumentModelService } from '../document-model/document-model.service';
import { UserService } from '../../user/user.service';
import { UserResolverPipe } from '../../pipes/user-resolver.pipe';
import { DocumentService } from '../document.service';

const mockModelApi: ModelApi = MockService(ModelApi);
const mockUserService: UserService = MockService(UserService);

const mockDocumentApi: DocumentApi = MockService(DocumentApi);

describe('DocumentPropertiesService', () => {
    let documentPropertiesService: DocumentPropertiesService;
    let modelApiSpy: jest.SpyInstance<Promise<any>>;
    let resolveUserSpy: jest.SpyInstance<Observable<User>>;
    const user = jestMocks.users[1];
    const wrongUser = jestMocks.users[0];

    beforeEach(() => {
        ngMocks.autoSpy('jest');
        resolveUserSpy = jest.spyOn(mockUserService, 'resolveUser').mockImplementation((id) => {
            if (id === user.id) {
                return of(user);
            }
            return of(wrongUser);
        });

        modelApiSpy = jest.spyOn(mockModelApi, 'getModel').mockReturnValue(generateMockResponse({ data: jestMocks.modelApi }));

        TestBed.configureTestingModule({
            imports: [CommonModule, CardViewModule, NoopTranslateModule],
            providers: [
                { provide: MODEL_API_TOKEN, useValue: mockModelApi },
                { provide: DOCUMENT_API_TOKEN, useValue: mockDocumentApi },
                { provide: DOCUMENT_PROPERTIES_SERVICE, useClass: DocumentPropertiesService },
                MockProvider(UserService, mockUserService),
                MockProvider(FileSizePipe),
                MockProvider(AsyncPipe),
                MockProvider(DecimalNumberPipe),
                MockProvider(LocalizedDatePipe),
                DocumentModelService,
                UserResolverPipe,
                {
                    provide: DocumentService,
                    useValue: {
                        getDocumentById: jasmine.createSpy().and.returnValue(of(jestMocks.fileDocument)),
                    },
                },
            ],
        });
        documentPropertiesService = TestBed.inject(DOCUMENT_PROPERTIES_SERVICE) as DocumentPropertiesService;
    });

    afterEach(() => {
        resolveUserSpy.mockRestore();
        modelApiSpy.mockRestore();
    });

    it('should return an empty array of properties if document is unknown', (done) => {
        expect(documentPropertiesService).toBeTruthy();

        expect(resolveUserSpy).not.toHaveBeenCalled();
        expect(modelApiSpy).toHaveBeenCalled();

        documentPropertiesService.getDefaultPropertiesFromDocument().subscribe((properties) => {
            expect(properties).toHaveLength(0);
            expect(resolveUserSpy).not.toHaveBeenCalled();
            done();
        });
    });

    it('should get default properties from document', (done) => {
        expect(resolveUserSpy).not.toHaveBeenCalled();
        expect(modelApiSpy).toHaveBeenCalledTimes(1);

        const document: Document = jestMocks.fileDocument;
        documentPropertiesService.getDefaultPropertiesFromDocument(document).subscribe((properties) => {
            expect(modelApiSpy).toHaveBeenCalledTimes(1);
            expect(resolveUserSpy).not.toHaveBeenCalled();
            expect(properties).toHaveLength(12);
            expect(resolveUserSpy).not.toHaveBeenCalled();

            expect(properties[0].label).toEqual('TITLE');
            expect(properties[0].value).toEqual(document['sys_title']);
            expect(properties[0].key).toEqual('sys_title');

            expect(properties[1].label).toEqual('PRIMARY_TYPE');
            expect(properties[1].value).toEqual(document['sys_primaryType']);
            expect(properties[1].key).toEqual('sys_primaryType');

            expect(properties[2].label).toEqual('DESCRIPTION');
            expect(properties[2].value).toEqual(document['sys_description']);
            expect(properties[2].key).toEqual('sys_description');

            expect(properties[3].label).toEqual('CREATED');
            expect(properties[3].value).toEqual(document['sys_created']);
            expect(properties[3].key).toEqual('sys_created');

            expect(properties[4].label).toEqual('MODIFIED');
            expect(properties[4].value).toEqual(document['sys_modified']);
            expect(properties[4].key).toEqual('sys_modified');

            expect(properties[5].label).toEqual('CREATOR');
            expect(properties[5].value).toEqual(user);
            expect(properties[5].key).toEqual('sys_creator');

            expect(properties[6].label).toEqual('LAST_CONTRIBUTOR');
            expect(properties[6].value).toEqual(user);
            expect(properties[6].key).toEqual('sys_lastContributor');

            expect(properties[7].label).toEqual('BLOB.FILENAME');
            expect(properties[7].value).toEqual(document['sysfile_blob'].filename);
            expect(properties[7].key).toEqual('sysfile_blob.filename');

            expect(properties[8].label).toEqual('BLOB.MIME_TYPE');
            expect(properties[8].value).toEqual(document['sysfile_blob'].mimeType);
            expect(properties[8].key).toEqual('sysfile_blob.mimeType');

            expect(properties[9].label).toEqual('BLOB.LENGTH');
            expect(properties[9].value).toEqual(document['sysfile_blob'].length);
            expect(properties[9].key).toEqual('sysfile_blob.length');

            expect(properties[10].label).toEqual('CONTRIBUTORS');
            expect(properties[10].value).toEqual([user]);
            expect(properties[10].key).toEqual('sys_contributors');
            expect(properties[11].value).toEqual(document.sys_path);
            expect(properties[11].key).toEqual('sys_path');

            done();
        });
    });

    it('should get all properties from document', (done) => {
        expect(resolveUserSpy).not.toHaveBeenCalled();
        expect(modelApiSpy).toHaveBeenCalledTimes(1);

        const document: Document = jestMocks.fileDocument;
        documentPropertiesService.getPropertiesFromDocument(document).subscribe((properties) => {
            expect(modelApiSpy).toHaveBeenCalledTimes(1);
            expect(resolveUserSpy).not.toHaveBeenCalled();
            expect(properties).toHaveLength(29);

            done();
        });
    });

    it('should exclude properties from document', (done) => {
        expect(resolveUserSpy).not.toHaveBeenCalled();
        expect(modelApiSpy).toHaveBeenCalledTimes(1);

        const document: Document = jestMocks.fileDocument;
        const options = {
            exclude: {
                properties: ['sysfile_blob'],
                schemas: ['sys_', 'sysver_'],
            },
        };

        documentPropertiesService.getPropertiesFromDocument(document, options).subscribe((properties) => {
            expect(modelApiSpy).toHaveBeenCalledTimes(1);
            expect(resolveUserSpy).not.toHaveBeenCalled();
            expect(properties).toHaveLength(0);

            done();
        });
    });

    it('should exclude schemas from document', (done) => {
        expect(resolveUserSpy).not.toHaveBeenCalled();
        expect(modelApiSpy).toHaveBeenCalledTimes(1);

        const document: Document = jestMocks.fileDocument;
        const options = {
            exclude: {
                schemas: ['sys'],
            },
        };
        documentPropertiesService.getPropertiesFromDocument(document, options).subscribe((properties) => {
            expect(modelApiSpy).toHaveBeenCalledTimes(1);
            expect(resolveUserSpy).not.toHaveBeenCalled();
            expect(properties).toHaveLength(0);

            done();
        });
    });

    it('should include properties from document', (done) => {
        expect(resolveUserSpy).not.toHaveBeenCalled();
        expect(modelApiSpy).toHaveBeenCalledTimes(1);

        const document: Document = jestMocks.fileDocument;
        const options = {
            include: {
                properties: ['sysfile_blob'],
            },
            exclude: {
                schemas: ['sys_'],
            },
        };
        documentPropertiesService.getPropertiesFromDocument(document, options).subscribe((properties) => {
            expect(modelApiSpy).toHaveBeenCalledTimes(1);
            expect(resolveUserSpy).not.toHaveBeenCalled();
            expect(properties).toHaveLength(3);

            expect(properties[0].label).toEqual('BLOB.FILENAME');
            expect(properties[0].value).toEqual(document['sysfile_blob'].filename);
            expect(properties[0].key).toEqual('sysfile_blob.filename');

            expect(properties[1].label).toEqual('BLOB.LENGTH');
            expect(properties[1].value).toEqual(document['sysfile_blob'].length);
            expect(properties[1].key).toEqual('sysfile_blob.length');

            expect(properties[2].label).toEqual('BLOB.MIME_TYPE');
            expect(properties[2].value).toEqual(document['sysfile_blob'].mimeType);
            expect(properties[2].key).toEqual('sysfile_blob.mimeType');

            done();
        });
    });

    it('should extract custom schema fields', async () => {
        const result = await firstValueFrom(documentPropertiesService.extractCustomSchemaFields('SysFile'));

        expect(result).toEqual({
            test_multiblob: '',
            test_multiboolean: '',
            test_multidate: '',
            test_multifloat: '',
            test_multiint: '',
            test_multistring: '',
            test_blob: '',
            test_boolean: '',
            test_complex: { field1: '', field2: '' },
            test_date: '',
            test_float: '',
            test_int: '',
            test_: '',
            test_string: '',
            test_complexRef: { refSubField1: '', refSubField2: '' },
        });
    });
});
