/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import * as rules from './start-process.rules';
import {
    mockLockedFileSelection,
    mockMultiFileLinkSelection,
    mockSingleFileLinkSelection,
    mockMultiLibrarySelection,
    mockSingleLibrarySelection,
    mockMultiFolderSelection,
    mockSingleFolderSelection,
    mockMultiFileSelection,
} from '../mock/start-process.mock';

describe('Start Process Cloud rule', () => {
    let getItemSpy: jasmine.Spy;

    const getContext = (isFile: boolean, url: string): any => ({
        selection: {
            nodes: [
                {
                    entry: {
                        isFile: isFile,
                    },
                },
            ],
        },
        navigation: {
            url: url,
        },
    });

    beforeEach(() => {
        getItemSpy = spyOn(localStorage, 'getItem');
        getItemSpy.and.returnValue('true');
    });

    it('Should return false when processService cloud is disabled', () => {
        getItemSpy.and.returnValue('false');
        const context = getContext(true, '/personal-files');
        expect(rules.canShow(context)).toBe(false);
    });

    it('should return true in shared files context', () => {
        expect(rules.canShow(getContext(true, '/shared'))).toBe(true);
    });

    it('should return true in recent files context', () => {
        expect(rules.canShow(getContext(true, '/recent'))).toBe(true);
    });

    it('should return true in favourite files context', () => {
        expect(rules.canShow(getContext(true, '/favorites'))).toBe(true);
    });

    it('Should return true when selection contains only files', () => {
        const context: any = mockMultiFileSelection;
        expect(rules.canShow(context)).toBe(true);
    });

    it('Should return false when selection is a folder', () => {
        const context: any = mockSingleFolderSelection;
        expect(rules.canShow(context)).toBe(false);
    });

    it('Should return false when selection contains files and at least one folders', () => {
        const context: any = mockMultiFolderSelection;
        expect(rules.canShow(context)).toBe(false);
    });

    it('Should return false when selection contains at least one library', () => {
        const context: any = mockSingleLibrarySelection;
        expect(rules.canShow(context)).toBe(false);
    });

    it('Should return false when selection contains different libraries with favorite', () => {
        const context: any = mockMultiLibrarySelection;
        expect(rules.canShow(context)).toBe(false);
    });

    it('Should return false when selection is a fileLink', () => {
        const context: any = mockSingleFileLinkSelection;
        expect(rules.canShow(context)).toBe(false);
    });

    it('Should return false when selection contains files and at least one fileLink', () => {
        const context: any = mockMultiFileLinkSelection;
        expect(rules.canShow(context)).toBe(false);
    });

    it('should return true in personal files context', () => {
        const context = getContext(true, '/personal-files');
        expect(rules.canShow(context)).toBe(true);
    });

    it('Should return false when selection is file and if url does start with `/trashcan`', () => {
        const context = getContext(true, '/trashcan');
        expect(rules.canShow(context)).toBe(false);
    });

    it('Should return false when selection is not file and if url does start with `/trashcan`', () => {
        const context = getContext(false, '/trashcan');
        expect(rules.canShow(context)).toBe(false);
    });

    it('Should return false when selection is file, process services extension is not enabled and if url does start with `/trashcan`', () => {
        getItemSpy.and.returnValue('false');
        const context = getContext(true, '/trashcan');
        expect(rules.canShow(context)).toBe(false);
    });

    it('Should return true when selection is file and the url does start with `/search`', () => {
        getItemSpy.and.returnValue('false');
        const context = getContext(true, '/search');
        expect(rules.canShow(context)).toBe(false);
    });

    it('should return true when file is locked', () => {
        const context: any = mockLockedFileSelection;
        expect(rules.canShow(context)).toBe(true);
    });
});
