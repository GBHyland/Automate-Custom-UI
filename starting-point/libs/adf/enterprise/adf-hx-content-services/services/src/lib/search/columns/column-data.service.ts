/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Document, Schema, User } from '@hylandsoftware/hxcs-js-client';
import { UserResolverService } from '../../user/user-resolver.service';
import { PermissionLevelPipe } from '../../pipes/permission-level.pipe';
import { PropertyUtilService } from '../../document/document-properties/document-properties.util.service';
import { DocumentModel } from '../../document/document-model/document-model.model';
import { FieldType } from '@alfresco/adf-hx-content-services/api';
import { DatePipe } from '@angular/common';
import { DecimalNumberPipe, FileSizePipe, TimeAgoPipe, TranslationService } from '@alfresco/adf-core';
import { ColumnKeys } from '../configs/column-keys.enum';
import { CustomSchemaField } from '../models/custom-schema.interface';

@Injectable({
    providedIn: 'root',
})
export class ColumnDataService {
    constructor(
        private adfFileSize: FileSizePipe,
        private timeAgoService: TimeAgoPipe,
        private userResolverService: UserResolverService,
        private translationService: TranslationService,
        private permissionService: PermissionLevelPipe,
        private decimalNumberService: DecimalNumberPipe,
        private datePipe: DatePipe,
        private propertyUtilService: PropertyUtilService
    ) {}

    doesColumnValueExist(document: Document, columnKey: string): boolean {
        const keys = columnKey.split('.');
        let current = document;

        for (const key of keys) {
            if (current && key in current) {
                current = current[key];
            } else {
                return false;
            }
        }
        return true;
    }

    getColumnValue(document: Document, columnKey: ColumnKeys): Observable<string> {
        switch (columnKey) {
            case ColumnKeys.Icon: {
                return of(document.sys_primaryType);
            }
            case ColumnKeys.SysFileBlobLength: {
                return of(this.adfFileSize.transform(document['sysfile_blob']?.length));
            }
            case ColumnKeys.SysCreated: {
                return this.formatDateWithUser(document.sys_creator, document.sys_created, 'DOCUMENT_LIST.COLUMNS.CREATED.BY');
            }
            case ColumnKeys.SysModified: {
                return this.formatDateWithUser(document.sys_lastContributor, document.sys_modified, 'DOCUMENT_LIST.COLUMNS.LAST_MODIFIED.BY');
            }
            case ColumnKeys.SysEffectivePermissions: {
                const permissions = this.permissionService.transform(document.sys_effectivePermissions);
                return of(permissions ? `${this.translationService.instant(permissions.value)}` : '');
            }
            case ColumnKeys.SysParentPath: {
                return document.sys_parentPath === '/'
                    ? of(this.translationService.instant('DOCUMENT_LIST.LOCATION.HOME'))
                    : of(`${this.translationService.instant('DOCUMENT_LIST.LOCATION.HOME')}${document.sys_parentPath}`);
            }
            default: {
                return of(document[columnKey] || '');
            }
        }
    }

    getCustomColumnValue(document: Document, columnKey: string, model: DocumentModel, type: FieldType) {
        if (!this.doesColumnValueExist(document, columnKey)) {
            return of(undefined);
        }

        const rawValue = this.propertyUtilService.propertyValue(columnKey, document, model);

        switch (type) {
            case FieldType.Date: {
                return of(this.datePipe.transform(rawValue));
            }
            case FieldType.DateArray: {
                return of(rawValue.map((date: any) => this.datePipe.transform(date)));
            }
            case FieldType.Float: {
                return of(this.decimalNumberService.transform(rawValue));
            }
            case FieldType.Boolean: {
                return of(rawValue ? 'True' : 'False');
            }
            default: {
                return of(rawValue);
            }
        }
    }

    public getCustomSchemaFields(model: DocumentModel): CustomSchemaField[] {
        if (!model) {
            return [];
        }

        const customSchemaFields: CustomSchemaField[] = [];
        const allCustomSchema = model.documentModel.schemas || {};
        for (const [schemaName, value] of Object.entries(allCustomSchema)) {
            if (model.isCustomSchema(schemaName)) {
                const prefix = value.prefix || '';
                const fieldNames = this.getSchemaFieldNames(value);
                for (const fieldName of fieldNames) {
                    customSchemaFields.push(...this.generateCustomPropertyFields(fieldName, prefix, model));
                }
            }
        }
        return customSchemaFields;
    }

    private generateCustomPropertyFields(fieldName: string, prefix: string, model: DocumentModel): CustomSchemaField[] {
        const customFields: CustomSchemaField[] = [];
        const fieldType = model.getFieldType(fieldName);
        if (fieldType === FieldType.Complex) {
            for (const complexFieldDetail of model.getComplexFieldDetails(fieldName)) {
                customFields.push(...this.generateCustomPropertyFieldsComplexType(fieldName, complexFieldDetail, prefix, model));
            }
        } else if (fieldType === FieldType.Blob) {
            for (const blobField of this.getBlobFields(fieldType, model)) {
                const blobFieldTitle = `${fieldName}_${blobField.name}`;
                customFields.push({
                    name: `${fieldName}.${blobField.name}`,
                    title: blobFieldTitle.slice(Math.max(0, prefix.length > 0 ? prefix.length + 1 : 0)),
                    type: blobField.type as FieldType,
                });
            }
        } else {
            customFields.push({
                name: fieldName,
                title: fieldName.slice(Math.max(0, prefix.length > 0 ? prefix.length + 1 : 0)),
                type: fieldType,
            });
        }
        return customFields;
    }

    private generateCustomPropertyFieldsComplexType(
        fieldName: string,
        complexFieldDetail: any,
        prefix: string,
        model: DocumentModel
    ): CustomSchemaField[] {
        const customFields: CustomSchemaField[] = [];
        const matchingFieldType = model.getFieldType(`${fieldName}.${complexFieldDetail.name}`);
        if (matchingFieldType === FieldType.Blob) {
            for (const complexBlobField of this.getBlobFields(matchingFieldType, model)) {
                const complexBlobFieldTitle = `${fieldName}_${complexFieldDetail.name}_${complexBlobField.name}`;
                customFields.push({
                    name: `${fieldName}.${complexFieldDetail.name}.${complexBlobField.name}`,
                    title: complexBlobFieldTitle.slice(Math.max(0, prefix.length > 0 ? prefix.length + 1 : 0)),
                    type: complexBlobField.type as FieldType,
                });
            }
        } else {
            const complexFieldTitle = `${fieldName}_${complexFieldDetail.name}`;
            customFields.push({
                name: `${fieldName}.${complexFieldDetail.name}`,
                title: complexFieldTitle.slice(Math.max(0, prefix.length > 0 ? prefix.length + 1 : 0)),
                type: complexFieldDetail.type,
            });
        }
        return customFields;
    }

    private getSchemaFieldNames(schema: Schema): string[] {
        const fieldDetails = schema.fields || {};
        return Object.keys(fieldDetails);
    }

    private getBlobFields(matchingFieldType: FieldType, model: DocumentModel): Partial<CustomSchemaField>[] {
        const blobPropertyFields: Partial<CustomSchemaField>[] = [];
        if (model.documentModel?.types?.[matchingFieldType]) {
            const complexType = model.documentModel.types[matchingFieldType];
            if (!complexType?.fields) {
                return [];
            }
            for (const [name, fieldDef] of Object.entries(complexType.fields)) {
                if (['filename', 'mimeType', 'length'].includes(name)) {
                    blobPropertyFields.push({ name, type: model.resolveType(fieldDef.type) });
                }
            }
        }
        return blobPropertyFields;
    }

    private formatDateWithUser(user: User | undefined, date: string = '', translationKey: string): Observable<string> {
        const parsedDate = new Date(date);
        const userNameObservable = user ? this.userResolverService.parse([user]) : of('');

        return userNameObservable.pipe(
            map((userName) => {
                if (Number.isNaN(parsedDate.getTime())) {
                    return '';
                }
                return `${this.timeAgoService.transform(parsedDate)} ${this.translationService.instant(translationKey)} ${userName}`;
            })
        );
    }
}
