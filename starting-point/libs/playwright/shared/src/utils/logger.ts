/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable unicorn/escape-case,unicorn/no-hex-escape */

export const infoColor = '\x1b[36m%s\x1b[0m';
export const logColor = '\x1b[35m%s\x1b[0m';
export const warnColor = '\x1b[33m%s\x1b[0m';
export const errorColor = '\x1b[31m%s\x1b[0m';

export type LOG_LEVEL = 'TRACE' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'SILENT';

export class LogLevelsEnum extends Number {
    static TRACE = 5;
    static DEBUG = 4;
    static INFO = 3;
    static WARN = 2;
    static ERROR = 1;
    static SILENT = 0;
}

export const logLevels: { level: number; name: LOG_LEVEL }[] = [
    { level: LogLevelsEnum.TRACE, name: 'TRACE' },
    { level: LogLevelsEnum.DEBUG, name: 'DEBUG' },
    { level: LogLevelsEnum.INFO, name: 'INFO' },
    { level: LogLevelsEnum.WARN, name: 'WARN' },
    { level: LogLevelsEnum.ERROR, name: 'ERROR' },
    { level: LogLevelsEnum.SILENT, name: 'SILENT' },
];

export interface LoggerLike {
    info(...messages: string[]): void;
    log(...messages: string[]): void;
    warn(...messages: string[]): void;
    error(...messages: string[]): void;
}

/* eslint-disable no-console */
export class GenericLogger implements LoggerLike {
    private level: number;

    constructor(logLevel: string) {
        this.level = logLevels.find(({ name }) => name === logLevel)?.level || LogLevelsEnum.ERROR;
    }

    info(...messages: string[]): void {
        if (this.level >= LogLevelsEnum.INFO) {
            console.log(infoColor, messages.join(''));
        }
    }

    log(...messages: string[]): void {
        if (this.level >= LogLevelsEnum.TRACE) {
            console.log(logColor, messages.join(''));
        }
    }

    warn(...messages: string[]): void {
        if (this.level >= LogLevelsEnum.WARN) {
            console.log(warnColor, messages.join(''));
        }
    }

    error(...messages: string[]): void {
        console.log(errorColor, messages.join(''));
    }
}
