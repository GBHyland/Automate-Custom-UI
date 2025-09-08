/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { incrementDBPVersion, ReleaseType } from './version-bumper';

describe('incrementDBPVersion', () => {
    it('should increment the major version properly', () => {
        expect(incrementDBPVersion('7.1.0', ReleaseType.major)).toBe('8.0.0');
    });

    it('should increment the pre-major version properly', () => {
        expect(incrementDBPVersion('7.1.0-3', ReleaseType.premajor)).toBe('8.0.0-0');
    });

    it('should increment the minor version properly', () => {
        expect(incrementDBPVersion('7.1.0', ReleaseType.minor)).toBe('7.2.0');
    });

    it('should increment the pre-minor version properly', () => {
        expect(incrementDBPVersion('7.1.0', ReleaseType.preminor)).toBe('7.2.0-0');
    });

    it('should increment the patch version properly', () => {
        expect(incrementDBPVersion('7.1.0', ReleaseType.patch)).toBe('7.1.1');
    });

    it('should increment the patch version properly in case of pre-release-patched version', () => {
        expect(incrementDBPVersion('7.1.0-M14.1', ReleaseType.patch)).toBe('7.1.0');
    });

    it('should increment the pre-patch version properly', () => {
        expect(incrementDBPVersion('7.1.0', ReleaseType.prepatch)).toBe('7.1.1-0');
    });

    it('should increment the pre-patch version properly in case of pre-release-patched version', () => {
        expect(incrementDBPVersion('7.1.0-M14.1', ReleaseType.prepatch)).toBe('7.1.1-0');
    });

    it('should increment the pre-release version properly', () => {
        expect(incrementDBPVersion('7.1.0-M14', ReleaseType.prerelease)).toBe('7.1.0-M15');
    });

    it('should increment the pre-release version properly in case of pre-release-patched version', () => {
        expect(incrementDBPVersion('7.1.0-M14.1', ReleaseType.prerelease)).toBe('7.1.0-M15');
    });

    it('should increment the pre-release-patch version properly in case of the first pre-release patch', () => {
        expect(incrementDBPVersion('7.1.0-M14', ReleaseType.prereleasepatch)).toBe('7.1.0-M14.1');
    });

    it('should increment the pre-release-patch version properly in case of any BUT the first pre-release patch', () => {
        expect(incrementDBPVersion('7.1.0-M14.1', ReleaseType.prereleasepatch)).toBe('7.1.0-M14.2');
    });

    it('should return the original version in case of incomprehensible version', () => {
        expect(incrementDBPVersion('<no valid version at all>', ReleaseType.prereleasepatch)).toBe('<no valid version at all>');
        expect(incrementDBPVersion('<no valid version at all>', ReleaseType.major)).toBe('<no valid version at all>');
    });
});
