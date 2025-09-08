/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

interface AxiosError extends Error {
    config: {
        url: string;
        method: string;
    };
    code?: string;
    response?: {
        data: any;
        status: number;
        statusText: string;
    };
}

export function formatAxiosError(error: AxiosError): any {
    return {
        message: error.message,
        method: error.config.method,
        url: error.config.url,
        response: error.response
            ? {
                  status: error.response.status,
                  statusText: error.response.statusText,
                  data: error.response.data,
              }
            : null,
    };
}

export function logError(message: string, error: AxiosError) {
    console.error(message + ':', formatAxiosError(error));
}
