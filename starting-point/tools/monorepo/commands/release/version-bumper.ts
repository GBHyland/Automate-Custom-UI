/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import * as semver from 'semver';

/* @cspell:disable */

export enum ReleaseType {
    prereleasepatch = 'prereleasepatch',
    prerelease = 'prerelease',
    prepatch = 'prepatch',
    patch = 'patch',
    preminor = 'preminor',
    minor = 'minor',
    premajor = 'premajor',
    major = 'major',
}

export function incrementDBPVersion(versionInDbpFormat: string, incrementType: semver.ReleaseType | 'prereleasepatch' = 'patch'): string {
    let increasedVersionInDbpFormat: string;
    if (incrementType === 'prereleasepatch') {
        increasedVersionInDbpFormat = versionInDbpFormat.replace(
            /-M([0-9.]*)$/,
            (_match, prereleaseVersion) => `-M${parseFloat(prereleaseVersion) + 0.1}`
        );
    } else {
        const semanticVersion = versionInDbpFormat.replace(/-M([0-9.]*)$/, (_match, prereleaseVersion) => `-M.${parseInt(prereleaseVersion, 10)}`);
        const increased = semver.inc(semanticVersion, incrementType, /prerelease/.test(incrementType) ? 'M' : '');
        increasedVersionInDbpFormat = increased?.replace(/-M\.([0-9]*)$/, '-M$1') || versionInDbpFormat;
    }

    return increasedVersionInDbpFormat;
}
