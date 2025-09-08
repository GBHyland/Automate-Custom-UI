/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    CardViewBoolItemModel,
    CardViewDateItemModel,
    CardViewFloatItemModel,
    CardViewIntItemModel,
    CardViewTextItemModel,
    CardViewItem,
    DecimalNumberPipe,
    LocalizedDatePipe,
    FileSizePipe,
    CardViewSelectItemModel,
    CardViewSelectItemOption,
} from '@alfresco/adf-core';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FieldType, ROOT_DOCUMENT } from '@alfresco/adf-hx-content-services/api';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { DocumentModel } from '../document-model/document-model.model';
import { UserResolverPipe } from '../../pipes/user-resolver.pipe';
import { DocumentService } from '../document.service';
import { isFile, isFolder } from '../configs/document.utils';

@Injectable({
    providedIn: 'root',
})
export class PropertyUtilService {
    readonly DEFAULT_EXCLUDED_SCHEMAS = ['system', 'sysfile', 'sysfiles', 'sysversionable', 'sysgovernable'];

    readonly TOP_DEFAULT_PROPERTIES = [
        'sys_title',
        'sys_primaryType',
        'sys_description',
        'sys_created',
        'sys_modified',
        'sys_creator',
        'sys_lastContributor',
        'sysfile_blob',
    ];

    readonly OTHER_PROPERTIES = ['sys_contributors', 'sys_path'];

    readonly REQUIRED_PROPERTIES = ['sys_title', 'sysfile_blob.filename'];

    private readonly EDITABLE_DEFAULT_PROPERTIES = ['sys_title', 'sys_primaryType', 'sys_description', 'sysfile_blob'];

    private readonly NON_EDITABLE_DEFAULT_PROPERTIES = [
        'sys_created',
        'sys_modified',
        'sys_creator',
        'sys_lastContributor',
        'sys_contributors',
        'sys_path',
        'sysfile_blob.length',
        'sysfile_blob.mimeType',
    ];

    constructor(
        private decimalNumberPipe: DecimalNumberPipe,
        private userResolverPipe: UserResolverPipe,
        private translationService: TranslateService,
        private localizedDatePipe: LocalizedDatePipe,
        private fileSizePipe: FileSizePipe,
        private documentService: DocumentService
    ) {}

    createCardItemUtil(property: string, model: DocumentModel | undefined, document: Document): CardViewItem[] {
        const type = this.propertyType(model, property);
        const defaultParameters = this.setupDefaultCardParameters(property, document, model);
        switch (type) {
            case FieldType.Boolean:
            case FieldType.BooleanArray: {
                return [new CardViewBoolItemModel(defaultParameters)];
            }
            case FieldType.Date:
            case FieldType.DateArray: {
                return [
                    new CardViewDateItemModel({
                        ...defaultParameters,
                        format: 'mediumDate',
                    }),
                ];
            }
            case FieldType.Float:
            case FieldType.FloatArray: {
                return [
                    new CardViewFloatItemModel({
                        ...defaultParameters,
                        pipes: [{ pipe: this.decimalNumberPipe }],
                    }),
                ];
            }
            case FieldType.Integer:
            case FieldType.IntegerArray: {
                return [new CardViewIntItemModel(defaultParameters)];
            }
            case FieldType.User:
            case FieldType.UserArray: {
                return [
                    new CardViewTextItemModel({
                        ...defaultParameters,
                        multivalued: false,
                        pipes: [{ pipe: this.userResolverPipe }], // TODO - remove it once all user fields are resolved at the server level
                    }),
                ];
            }
            case FieldType.Blob: {
                return this.createBlobCardItems(property, document, model);
            }
            case FieldType.String: {
                return property === 'sys_primaryType'
                    ? [
                          new CardViewSelectItemModel({
                              ...defaultParameters,
                              options$: this.availableDocumentCategories(model, document),
                              displayNoneOption: false,
                          }),
                      ]
                    : [new CardViewTextItemModel(defaultParameters)];
            }
            case FieldType.StringArray:
            default: {
                return [new CardViewTextItemModel(defaultParameters)];
            }
        }
    }

    propertyType(model: DocumentModel | undefined, property: string): FieldType | undefined {
        return model?.getFieldType(property);
    }

    setupDefaultCardParameters(property: string, document: Document, model: DocumentModel | undefined) {
        const isEditable = this.TOP_DEFAULT_PROPERTIES.includes(property)
            ? this.EDITABLE_DEFAULT_PROPERTIES.includes(property)
            : !this.NON_EDITABLE_DEFAULT_PROPERTIES.includes(property);
        return {
            label: this.translateProperty(property),
            value: this.propertyValue(property, document, model),
            key: property,
            multivalued: model?.isMultivaluedType(this.propertyType(model, property)),
            editable: isEditable,
        };
    }

    translateProperty(key: string): string {
        const splitIndex = key.indexOf('_');
        if (splitIndex === -1) {
            return '';
        }
        let schemaPrefix = key.slice(0, Math.max(0, splitIndex));
        let propName = key.slice(Math.max(0, splitIndex + 1));
        if (schemaPrefix && propName) {
            propName = propName.replace(new RegExp(/[A-Z]/, 'g'), (letter: string) => `_${letter.toLowerCase()}`).toUpperCase();
            schemaPrefix = schemaPrefix.replace(new RegExp(/[A-Z]/, 'g'), (letter: string) => `_${letter.toLowerCase()}`).toUpperCase();

            const translationKey = `DOCUMENT.PROPERTIES.${schemaPrefix}.${propName}`;
            const translation = this.translationService.instant(translationKey);
            return translation === translationKey ? propName : translation;
        }
        return '';
    }

    propertyValue(property: string, document: Document, model: DocumentModel | undefined): any {
        const propertyTypeValue = this.propertyType(model, property);
        const propertyValue = this.getPropertyValueFromDocument(property, document);

        switch (propertyTypeValue) {
            case FieldType.Complex: {
                return this.getComplexPropertyValue(property, document, model);
            }
            case FieldType.BlobArray: {
                return this.getBlobArrayPropertyValue(property, document);
            }
            case FieldType.Boolean: {
                return !!propertyValue;
            }
            default: {
                return propertyValue;
            }
        }
    }

    private createBlobCardItems(property: string, document: Document, model: DocumentModel | undefined): CardViewItem[] {
        const properties = ['filename', 'mimeType', 'length'].map((prop) => `${property}.${prop}`);
        return [
            new CardViewTextItemModel({
                ...this.setupDefaultCardParameters(properties[0], document, model),
            }),
            new CardViewTextItemModel({
                ...this.setupDefaultCardParameters(properties[1], document, model),
            }),
            new CardViewTextItemModel({
                ...this.setupDefaultCardParameters(properties[2], document, model),
                pipes: [{ pipe: this.fileSizePipe }],
            }),
        ];
    }

    private getComplexPropertyValue(property: string, document: Document, model: DocumentModel | undefined): any {
        return Object.entries(document[property]).map((entry) => ({
            name: this.translateProperty(`${property}.${entry[0]}`),
            value:
                this.propertyType(model, `${property}.${entry[0]}`) === FieldType.Date
                    ? this.localizedDatePipe.transform(entry[1] as Date, 'mediumDate')
                    : entry[1],
        }));
    }

    private getBlobArrayPropertyValue(property: string, document: Document): any {
        return Object.values(document[property]).map((entry: any) => entry.filename);
    }

    private getPropertyValueFromDocument(property: string, document: Document): any {
        return property.split('.').reduce((val: any, prop: string) => (val = val && val[prop]), document);
    }

    private availableDocumentCategories(model: DocumentModel | undefined, document: Document): Observable<CardViewSelectItemOption<string>[]> {
        if (!model) {
            return of([]);
        }

        return this.documentService.getDocumentById(document.sys_parentId || ROOT_DOCUMENT.sys_id).pipe(
            switchMap((parentDocument) => {
                const primaryType = parentDocument.sys_primaryType;
                let subTypes: string[] = [];
                if (isFile(document)) {
                    subTypes = [...subTypes, ...model.getFilishTypes()];
                }
                if (isFolder(document)) {
                    subTypes = [...subTypes, ...model.getFolderishTypes()];
                }

                const documentCategories =
                    subTypes.length === 0
                        ? [{ label: primaryType, key: primaryType }]
                        : subTypes.map((subType) => ({ label: subType, key: subType }));
                return of(documentCategories);
            })
        );
    }
}
