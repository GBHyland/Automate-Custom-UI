/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { DecimalNumberPipe, LocalizedDatePipe, FileSizePipe, CardViewItem, CardViewSelectItemOption, NoopTranslateModule } from '@alfresco/adf-core';
import { AsyncPipe } from '@angular/common';
import { PropertyUtilService } from './document-properties.util.service';
import { FieldType } from '@alfresco/adf-hx-content-services/api';
import { MockProvider } from 'ng-mocks';
import { jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { of } from 'rxjs';
import { DocumentModel } from '../document-model/document-model.model';
import { UserResolverPipe } from '../../pipes/user-resolver.pipe';
import { DocumentService } from '../document.service';

describe('PropertyUtilService', () => {
    let service: PropertyUtilService;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule],
            providers: [
                PropertyUtilService,
                MockProvider(DecimalNumberPipe),
                MockProvider(UserResolverPipe),
                MockProvider(AsyncPipe),
                MockProvider(LocalizedDatePipe),
                MockProvider(FileSizePipe),
                {
                    provide: DocumentService,
                    useValue: {
                        getDocumentById: jasmine.createSpy().and.returnValue(of(jestMocks.fileDocument)),
                    },
                },
            ],
        });

        service = TestBed.inject(PropertyUtilService);
    });

    it('should create CardViewItem for Boolean type', () => {
        const property = 'sysver_isCheckedIn';
        const document: Document = jestMocks.fileDocument;
        const model: any = {
            getFieldType: (prop: string) => {
                if (prop === property) {
                    return FieldType.Boolean;
                }
                return undefined;
            },
            isMultivaluedType: () => false,
        };

        const cardItem = service.createCardItemUtil(property, model, document);

        expect(cardItem).toBeDefined();
        expect(cardItem).toHaveLength(1);
        expect((cardItem[0] as CardViewItem).key).toBe(property);
    });

    it('should return property type from a model', () => {
        const model: any = {
            getFieldType: jasmine.createSpy('getFieldType').and.returnValue(FieldType.String),
        };
        const property = 'sys_title';

        const result = service.propertyType(model, property);

        expect(result).toBe(FieldType.String);
        expect(model.getFieldType).toHaveBeenCalledWith(property);
    });

    it('should return document categories for a Filish document', (done: () => void) => {
        const mockSubTypes = ['type1', 'type2'];
        const mockModel: Partial<DocumentModel> = {
            getFilishTypes: jasmine.createSpy().and.returnValue(mockSubTypes),
        };

        (service as any)
            .availableDocumentCategories(mockModel as DocumentModel, jestMocks.fileDocument)
            .subscribe((results: CardViewSelectItemOption<string>[]) => {
                expect(mockModel.getFilishTypes).toHaveBeenCalled();
                expect(results).toEqual([
                    { label: 'type1', key: 'type1' },
                    { label: 'type2', key: 'type2' },
                ]);
                done();
            });
    });
});
