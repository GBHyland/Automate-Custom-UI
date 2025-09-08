/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export function formatDate(date: number): string {
    const d = new Date(date);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const padMs = (n: number) => n.toString().padStart(3, '0');

    const year = d.getUTCFullYear();
    const month = pad(d.getUTCMonth() + 1);
    const day = pad(d.getUTCDate());
    const hours = pad(d.getUTCHours());
    const minutes = pad(d.getUTCMinutes());
    const seconds = pad(d.getUTCSeconds());
    const milliseconds = padMs(d.getUTCMilliseconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}:${milliseconds}`;
}
