/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export const generateMockResponse = (content: any) => {
    return Promise.resolve({
        ...content,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
    });
};

export const generateMockErrorResponse = (message: string, status: number = 400) => {
    return Promise.reject({
        'entity-type': 'exception',
        message,
        status,
    });
};

export const generateMockError = (message: string, status: number = 400) => {
    const error: any = new Error(message);
    error.response = {
        'entity-type': 'exception',
        status,
        message,
        errors: [{ description: message, warning: false }],
    };
    return error;
};
