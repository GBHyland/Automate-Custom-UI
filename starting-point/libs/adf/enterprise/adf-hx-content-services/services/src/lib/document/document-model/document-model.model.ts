/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Model as HXCSModel, Schema, Field, Type } from '@hylandsoftware/hxcs-js-client';
import { FieldType } from '@alfresco/adf-hx-content-services/api';

const multivaluedTypes = new Set<string>([
    FieldType.BlobArray,
    FieldType.BooleanArray,
    FieldType.DateArray,
    FieldType.FloatArray,
    FieldType.IntegerArray,
    FieldType.StringArray,
    FieldType.UserArray,
]);

const DEFAULT_EXCLUDED_SCHEMAS = new Set([
    'system',
    'sysfile',
    'sysfiles',
    'sysrelation',
    'sysrendition',
    'sysvocab',
    'user',
    'group',
    'sysversionable',
    'sysgovernable',
]);

interface ComplexPropertyField {
    name: string;
    type: FieldType;
}

export class DocumentModel {
    SYS_ROOT = 'SysRoot';

    constructor(private model: HXCSModel) {}

    get documentModel() {
        return this.model;
    }

    getFieldType(field: string): FieldType {
        let rawType: any = '';
        let type: FieldType = FieldType.String;
        try {
            const fieldDefinition = this.getFieldDefinition(field);
            if (!fieldDefinition) {
                return FieldType.String;
            }

            if (fieldDefinition.type) {
                rawType = fieldDefinition.type;
            } else if (this.hasResolver(fieldDefinition)) {
                rawType = this.getResolverType(fieldDefinition);
            } else if (fieldDefinition.extends) {
                rawType = fieldDefinition.extends;
            } else if (fieldDefinition.fields) {
                return FieldType.Complex;
            } else if (fieldDefinition.list?.type) {
                return `${this.resolveType(fieldDefinition.list.type)}[]` as FieldType;
            }
            type = this.resolveType(rawType) as FieldType;
        } catch (error) {
            console.error(error);
        }

        return type;
    }

    isMultivaluedType(type: FieldType | undefined): boolean {
        return !!type && multivaluedTypes.has(type);
    }

    isFieldTypeArray(fieldType: FieldType): boolean {
        return (
            fieldType === FieldType.FloatArray ||
            fieldType === FieldType.IntegerArray ||
            fieldType === FieldType.DateArray ||
            fieldType === FieldType.StringArray
        );
    }

    getComplexFieldDetails(fieldName: string): ComplexPropertyField[] {
        const fieldSchema = this.getSchemaByPrefix(fieldName);
        if (!fieldSchema?.fields) {
            return [];
        }
        const matchingField = fieldSchema.fields[fieldName];
        if (!matchingField) {
            return [];
        }
        const matchingFieldType = matchingField.type || 'string';

        // If the field has its own subfields defined inline
        if (matchingField.fields) {
            return Object.entries(matchingField.fields).map(([name, fieldDef]) => ({
                name,
                type: this.resolveType(fieldDef.type),
            }));
        }

        // If the field type is complex and references a pre-defined type
        if (this.resolveType(matchingFieldType) === FieldType.Complex && this.model?.types?.[matchingFieldType]) {
            const complexType = this.model.types[matchingFieldType];
            if (!complexType?.fields) {
                return [];
            }
            return Object.entries(complexType.fields).map(([name, fieldDef]) => ({
                name,
                type: this.resolveType(fieldDef.type),
            }));
        }
        return [];
    }

    resolveType(type: string = 'string'): FieldType {
        if (!this.model?.types || !this.model.types[type]) {
            return type as FieldType;
        }
        const typeObj: Type = this.model.types[type];
        if (typeObj.extends) {
            return typeObj.extends as FieldType;
        }
        if (typeObj.list) {
            if (this.hasResolver(typeObj.list)) {
                return `${this.resolveType(this.getResolverType(typeObj.list))}[]` as FieldType;
            }
            return `${this.resolveType(typeObj.list?.extends || typeObj.list?.type || '')}[]` as FieldType;
        }
        if (type === FieldType.Blob) {
            return FieldType.Blob;
        }
        if (typeObj.fields) {
            return FieldType.Complex;
        }
        return `${typeObj}` as FieldType;
    }

    getSubtypes(primaryType: string): string[] {
        return this.model?.primaryTypes?.[primaryType]?.subtypes || this.getAllTypes();
    }

    getFilishTypes(): string[] {
        return this.getAllTypes().filter((type: string) => this.hasMixin(type, 'SysFilish'));
    }

    getFolderishTypes(): string[] {
        return this.getAllTypes().filter((type: string) => this.hasMixin(type, 'SysFolderish'));
    }

    hasMixin(primaryType: string, mixin: string): boolean {
        const typeObj = this.model?.primaryTypes?.[primaryType];
        if (!typeObj) {
            return false;
        }
        const parentType = typeObj.extends;
        return !!typeObj.mixins?.includes(mixin) || !!(parentType && this.hasMixin(parentType, mixin));
    }

    getAllTypes(): string[] {
        if (!this.model?.primaryTypes) {
            return [];
        }
        return Object.keys(this.model?.primaryTypes).filter((category: string) => category !== this.SYS_ROOT);
    }

    isCustomSchema(schemaName: string): boolean {
        return !DEFAULT_EXCLUDED_SCHEMAS.has(schemaName);
    }

    private getSchemaByPrefix(fieldName: string): Schema | undefined {
        const fieldPrefix = fieldName.split('_')[0];
        return Object.values(this.getSchemas()).find((schema) => schema.prefix === fieldPrefix);
    }

    private hasResolver(field: Field): boolean {
        return !!this.getResolverType(field);
    }

    private getResolverType(field: Field): FieldType {
        return field?.constraints?.resolver?.type as FieldType;
    }

    private getSchemas(): { [key: string]: Schema } {
        return this.model.schemas || {};
    }

    private getFieldDefinition(field: string): Field | undefined {
        const res = field.split('_').filter(Boolean);
        let returnValue: Field | undefined;

        if (res.length > 1) {
            const fieldPrefix = res[0];
            const fieldSchema: Schema | undefined = Object.values(this.getSchemas()).find((schema) => schema.prefix === fieldPrefix);

            if (fieldSchema) {
                const restOfString = res.slice(1).join('_');

                if (restOfString.includes('.')) {
                    const [firstPart, secondPart] = restOfString.split('.');
                    const subfieldKey = `${fieldPrefix}_${firstPart}`;
                    const subfield = fieldSchema.fields?.[subfieldKey];

                    if (subfield?.fields) {
                        returnValue = subfield.fields[secondPart];
                    } else if (subfield?.type && this.model.types) {
                        const typeDefinition = this.model.types[subfield.type];
                        if (typeDefinition && typeDefinition.fields) {
                            returnValue = typeDefinition.fields[secondPart];
                        }
                    }
                } else {
                    returnValue = fieldSchema.fields?.[field];
                }
            }
        }

        return returnValue;
    }
}
