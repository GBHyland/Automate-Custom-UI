/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export interface AwsWafJSIntegrations {
    AwsWafIntegration: {
        hasToken: () => boolean;
        getToken: () => Promise<string>;
        fetch: typeof fetch;
    };
    AwsWafCaptcha: {
        renderCaptcha: (element: HTMLElement, options: RenderCaptchaOptions) => void;
    };
}

export interface RenderCaptchaOptions {
    apiKey: string;
    onSuccess: (wafToken: string) => void;
    onLoad?: () => void;
    onError?: (error: CaptchaError) => void;
    onPuzzleTimeout?: () => void;
    onPuzzleCorrect?: () => void;
    onPuzzleIncorrect?: () => void;
    defaultLocale?: string;
    disableLanguageSelector?: boolean;
    dynamicWidth?: boolean;
    skipTitle?: boolean;
}

export interface CaptchaError extends Error {
    kind: 'internal_error' | 'network_error' | 'token_error' | 'client_error';
    statusCode?: number;
}
