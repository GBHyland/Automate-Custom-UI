/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export const enum LogLevel {
    error = 'error',
    warn = 'warn',
    info = 'info',
    verbose = 'verbose',
    debug = 'debug',
    silly = 'silly',
}

export interface LoggerLike {
    level: LogLevel;
    getLevels(): LogLevel[];
    error(message: any): void;
    warn(message: any): void;
    info(message: any): void;
    verbose(message: any): void;
    debug(message: any): void;
    silly(message: any): void;
    ln(message: any): void;
}
