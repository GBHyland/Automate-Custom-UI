/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { CardViewItem } from '@alfresco/adf-core';
import { Injectable } from '@angular/core';
import { FieldType } from '@alfresco/adf-hx-content-services/api';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay, take, tap } from 'rxjs/operators';
import { ComplexFieldCardViewItemModel, ComplexCardViewItemProperties } from './card-view-complex-property.model';
import { PropertyUtilService } from './document-properties.util.service';
import { SharedDocumentPropertiesService } from './shared-document-properties.service';
import { DocumentModel } from '../document-model/document-model.model';
import { DocumentModelService } from '../document-model/document-model.service';

type SchemaPrefix = string;
type PrefixedProperty = string;

interface DocumentPropertiesFilteringOptions {
    exclude?: {
        properties?: PrefixedProperty[];
        schemas?: SchemaPrefix[];
    };
    include?: {
        properties?: PrefixedProperty[];
        schemas?: SchemaPrefix[];
    };
}

@Injectable({
    providedIn: 'root',
})
export class DocumentPropertiesService extends SharedDocumentPropertiesService {
    private model: DocumentModel | undefined;
    constructor(private documentModelService: DocumentModelService, private propertyUtilService: PropertyUtilService) {
        super();
    }

    getPropertiesFromDocument(document?: Document, options?: DocumentPropertiesFilteringOptions): Observable<CardViewItem[]> {
        if (!document) {
            return of([]);
        }

        return this.fetchDocumentModel().pipe(
            map(() =>
                Object.keys(document)
                    .filter(this.filterProperty(options))
                    .flatMap((property) => this.getCardItem(property, document))
                    .sort(this.sortCardsByLabel.bind(this))
            ),
            catchError(() => of([]))
        );
    }

    getDefaultPropertiesFromDocument(document?: Document): Observable<CardViewItem[]> {
        if (!document) {
            return of([]);
        }

        return this.fetchDocumentModel().pipe(
            map(() => {
                const documentProperties = Object.keys(document);
                const defaultCards = this.propertyUtilService.TOP_DEFAULT_PROPERTIES.filter((property: string) =>
                    documentProperties.includes(property)
                ).flatMap((property: string) => this.getCardItem(property, document));

                const otherCards = Object.keys(document)
                    .filter(
                        this.filterProperty({
                            include: {
                                properties: this.propertyUtilService.OTHER_PROPERTIES,
                            },
                        })
                    )
                    .flatMap((property) => this.getCardItem(property, document))
                    .sort(this.sortCardsByLabel.bind(this));
                return [...defaultCards, ...otherCards];
            }),
            catchError(() => of([]))
        );
    }

    propertyType(property: string): FieldType | undefined {
        return this.model ? this.propertyUtilService.propertyType(this.model, property) : undefined;
    }

    isFieldTypeArray(property: FieldType): boolean | undefined {
        return this?.model?.isFieldTypeArray(property);
    }

    extractCustomSchemaFields(primaryType: string): Observable<Record<string, any>> {
        return this.fetchDocumentModel().pipe(
            take(1),
            map((customModel: DocumentModel) => {
                return this.getCustomSchemaFields(customModel, primaryType);
            })
        );
    }

    getRequiredProperties(): string[] {
        return this.propertyUtilService.REQUIRED_PROPERTIES;
    }

    private getCustomSchemaFields(customModel: DocumentModel, primaryType: string): Record<string, any> {
        const customSchemaFields: Record<string, any> = {};
        const primaryTypes = customModel.documentModel.primaryTypes ?? {
            [primaryType]: { schemas: [] },
        };
        const primaryTypeFileSchema = primaryTypes[primaryType].schemas;
        const allCustomSchema = customModel.documentModel.schemas || {};
        const customSchemaNames = Object.keys(allCustomSchema).filter(
            (schemaName: string) => !this.propertyUtilService.DEFAULT_EXCLUDED_SCHEMAS.includes(schemaName)
        );

        for (const schemaName of customSchemaNames) {
            if (primaryTypeFileSchema?.includes(schemaName)) {
                this.populateCustomSchemaFields(customModel, customSchemaFields, allCustomSchema[schemaName].fields);
            }
        }
        return customSchemaFields;
    }

    private populateCustomSchemaFields(customModel: DocumentModel, customSchemaFields: Record<string, any>, schemaFields: any): void {
        for (const fieldName in schemaFields) {
            if (schemaFields[fieldName] !== undefined) {
                const fieldType = this.propertyType(fieldName);
                if (fieldType === FieldType.Complex) {
                    this.handleComplexFieldType(customModel, customSchemaFields, fieldName, schemaFields);
                } else {
                    customSchemaFields[fieldName] = '';
                }
            }
        }
    }

    private handleComplexFieldType(customModel: DocumentModel, customSchemaFields: Record<string, any>, fieldName: string, schemaFields: any): void {
        const complexField = schemaFields[fieldName];

        if (complexField.fields) {
            customSchemaFields[fieldName] = {};
            const inlineFields = Object.keys(complexField.fields);
            for (const inlineField of inlineFields) {
                customSchemaFields[fieldName][inlineField] = '';
            }
        } else {
            const nestedFields = this.getNestedFields(schemaFields[fieldName], customModel.documentModel.types);
            customSchemaFields[fieldName] = nestedFields;
        }
    }

    private getNestedFields(fieldProperties: any, types: any): Record<string, any> {
        const fieldsWithType = types[fieldProperties.type].fields;
        const result: Record<string, any> = {};
        for (const key in fieldsWithType) {
            if (fieldsWithType[key]) {
                result[key] = '';
            }
        }
        return result;
    }

    private fetchDocumentModel(): Observable<DocumentModel> {
        return this.documentModelService.getModel().pipe(
            take(1),
            tap((model: DocumentModel) => (this.model = model)),
            shareReplay()
        );
    }

    private getCardItem(property: string, document: Document): CardViewItem[] {
        const type = this.propertyType(property);
        switch (type) {
            case FieldType.Complex: {
                return this.createComplexCardItems(property, document);
            }
            default: {
                return this.propertyUtilService.createCardItemUtil(property, this.model, document);
            }
        }
    }

    private createComplexCardItems(property: string, document: Document): CardViewItem[] {
        const complexCardViewItemProperties: ComplexCardViewItemProperties = {
            document,
            model: this.model,
            propertyUtilService: this.propertyUtilService,
        };
        const complexFieldGroupCardViewItem = new ComplexFieldCardViewItemModel(
            {
                label: this.propertyUtilService.translateProperty(property),
                value: this.model?.getComplexFieldDetails(property),
                key: property,
            },
            complexCardViewItemProperties
        );

        return complexFieldGroupCardViewItem.displayValue;
    }

    private filterProperty(options?: DocumentPropertiesFilteringOptions): (property: string) => boolean {
        const exclude = options?.exclude;
        const include = options?.include;

        return (property: string) => {
            if (exclude && exclude.schemas && exclude.schemas.findIndex((schemaPrefix) => property.startsWith(schemaPrefix)) >= 0) {
                return false;
            }
            if (exclude && exclude.properties && exclude.properties.includes(property)) {
                return false;
            }

            if (include && include.schemas && include.schemas.findIndex((schemaPrefix) => property.startsWith(schemaPrefix)) < 0) {
                return false;
            }
            if (include && include.properties && !include.properties.includes(property)) {
                return false;
            }
            return true;
        };
    }

    private sortCardsByLabel(card1: CardViewItem, card2: CardViewItem): number {
        return card1.label.localeCompare(card2.label);
    }
}
