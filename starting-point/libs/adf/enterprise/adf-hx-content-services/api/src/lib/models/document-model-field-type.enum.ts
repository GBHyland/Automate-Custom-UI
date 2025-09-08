/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export const FieldType = {
    Boolean: 'boolean',
    BooleanArray: 'boolean[]',
    Blob: 'blob',
    BlobArray: 'blob[]',
    Complex: 'complex',
    Date: 'date',
    DateArray: 'date[]',
    Float: 'double',
    FloatArray: 'double[]',
    Integer: 'long',
    IntegerArray: 'long[]',
    Object: 'object',
    String: 'string',
    StringArray: 'string[]',
    User: 'user',
    UserArray: 'user[]',
} as const;

export type FieldType = typeof FieldType[keyof typeof FieldType];
