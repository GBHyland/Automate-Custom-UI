/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Json5VariantMerger } from './json5-variant-merger';
import * as fs from 'node:fs';
import { join, parse } from 'node:path';

const mockedCWD = join(parse(process.cwd()).root, 'mocked', 'directory', 'path');

describe('Json5VariantMerger', () => {
    beforeEach(() => {
        jest.spyOn(process, 'cwd').mockReturnValue(mockedCWD);
        delete process.env.CI;
        delete process.env.VARIANT_ENV_KEY;
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should load default variant if "defaultVariantName" is not set', () => {
        const expectedFilePath = join(mockedCWD, `variables.json5`);

        jest.spyOn(fs, 'existsSync').mockReturnValue(true);
        jest.spyOn(fs, 'readFileSync').mockReturnValue('{}');

        Json5VariantMerger.read(process.cwd(), 'variables');

        expect(fs.existsSync).toHaveBeenCalledWith(expectedFilePath);
        expect(fs.readFileSync).toHaveBeenCalledWith(expectedFilePath, 'utf8');
    });

    it('should load the "defaultVariantName" if it was set as third parameter', () => {
        const expectedFilePath = join(mockedCWD, `variables.default.json5`);

        jest.spyOn(fs, 'existsSync').mockReturnValue(true);
        jest.spyOn(fs, 'readFileSync').mockReturnValue('{}');

        Json5VariantMerger.read(process.cwd(), 'variables', 'default');

        expect(fs.existsSync).toHaveBeenCalledWith(expectedFilePath);
        expect(fs.readFileSync).toHaveBeenCalledWith(expectedFilePath, 'utf8');
    });

    it('should load the "ci" variant automatically if the "CI" environment variable is set', () => {
        const expectedFilePath = join(mockedCWD, `variables.ci.json5`);

        jest.spyOn(fs, 'existsSync').mockReturnValue(true);
        jest.spyOn(fs, 'readFileSync').mockReturnValue('{}');

        process.env.CI = 'true';

        Json5VariantMerger.read(process.cwd(), 'variables');

        expect(fs.existsSync).toHaveBeenCalledWith(expectedFilePath);
        expect(fs.readFileSync).toHaveBeenCalledWith(expectedFilePath, 'utf8');
    });

    it('should load the variant based on the "VARIANT_ENV_KEY" environment variable besides the default one', () => {
        const expectedFilePath = join(mockedCWD, `variables.chimichanga.json5`);

        jest.spyOn(fs, 'existsSync').mockReturnValue(true);
        jest.spyOn(fs, 'readFileSync').mockReturnValue('{}');

        process.env.VARIANT_ENV_KEY = 'chimichanga';

        Json5VariantMerger.read(process.cwd(), 'variables');

        expect(fs.existsSync).toHaveBeenCalledWith(expectedFilePath);
        expect(fs.readFileSync).toHaveBeenCalledWith(expectedFilePath, 'utf8');
    });

    it('should read the variant only if the file exists even if the environment var is set', () => {
        const expectedFilePath = join(mockedCWD, `variables.chimichanga.json5`);

        jest.spyOn(fs, 'existsSync').mockReturnValue(false);
        jest.spyOn(fs, 'readFileSync').mockReturnValue('{}');

        process.env.VARIANT_ENV_KEY = 'chimichanga';

        Json5VariantMerger.read(process.cwd(), 'variables');

        expect(fs.existsSync).toHaveBeenCalledWith(expectedFilePath);
        expect(fs.readFileSync).not.toHaveBeenCalledWith(expectedFilePath, 'utf8');
    });

    it('should return the object of the JSON5 file simply if no variant is specified', () => {
        const expectedFilePath = join(mockedCWD, `variables.json5`);
        const expectedObject = { foo: 'bar' };

        jest.spyOn(fs, 'existsSync').mockReturnValue(true);
        jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(expectedObject));

        const result = Json5VariantMerger.read(process.cwd(), 'variables');

        expect(fs.existsSync).toHaveBeenCalledWith(expectedFilePath);
        expect(fs.readFileSync).toHaveBeenCalledWith(expectedFilePath, 'utf8');
        expect(result).toEqual(expectedObject);
    });

    it('should return the object of the JSON5 file merged with the variant if it exists', () => {
        const expectedFilePathDefault = join(mockedCWD, `variables.json5`);
        const expectedFilePathVariant = join(mockedCWD, `variables.chimichanga.json5`);
        const expectedObjectDefault = { foo: 'bar' };
        const expectedObjectVariant = { foo: 'baz', chimichanga: 'chimichanga' };

        jest.spyOn(fs, 'existsSync').mockReturnValueOnce(true).mockReturnValueOnce(true);
        jest.spyOn(fs, 'readFileSync')
            .mockReturnValueOnce(JSON.stringify(expectedObjectDefault))
            .mockReturnValueOnce(JSON.stringify(expectedObjectVariant));

        process.env.VARIANT_ENV_KEY = 'chimichanga';

        const result = Json5VariantMerger.read(process.cwd(), 'variables');

        expect(fs.existsSync).toHaveBeenCalledWith(expectedFilePathDefault);
        expect(fs.existsSync).toHaveBeenCalledWith(expectedFilePathVariant);
        expect(fs.readFileSync).toHaveBeenCalledWith(expectedFilePathDefault, 'utf8');
        expect(fs.readFileSync).toHaveBeenCalledWith(expectedFilePathVariant, 'utf8');
        expect(result).toEqual(expectedObjectVariant);
    });

    it('should return the object of the JSON5 file merged with the variant if it exists, even in case of deeper object (deep-merge)', () => {
        const expectedObjectDefault = { foo: { bar: 'baz' } };
        const expectedObjectVariant = { foo: { bar: 'chimichanga' }, rootChimichanga: 'rootChimichanga' };
        const expectedObjectMerged = { foo: { bar: 'chimichanga' }, rootChimichanga: 'rootChimichanga' };

        jest.spyOn(fs, 'existsSync').mockReturnValueOnce(true).mockReturnValueOnce(true);
        jest.spyOn(fs, 'readFileSync')
            .mockReturnValueOnce(JSON.stringify(expectedObjectDefault))
            .mockReturnValueOnce(JSON.stringify(expectedObjectVariant));

        process.env.VARIANT_ENV_KEY = 'chimichanga';

        const result = Json5VariantMerger.read(process.cwd(), 'variables');

        expect(result).toEqual(expectedObjectMerged);
    });

    it('should return the merged object if either "ci" and "VARIANT_ENV_KEY" are set, with "VARIANT_ENV_KEY" taking precedence', () => {
        const expectedObjectDefault = { foo: 'bar' };
        const expectedObjectCIVariant = { foo: 'baz', ci: 'ci' };
        const expectedObjectChimichangaVariant = { foo: 'overridden-baz', chimichanga: 'chimichanga' };
        const expectedObjectMerged = { foo: 'overridden-baz', ci: 'ci', chimichanga: 'chimichanga' };

        jest.spyOn(fs, 'existsSync').mockReturnValueOnce(true).mockReturnValueOnce(true).mockReturnValueOnce(true);
        jest.spyOn(fs, 'readFileSync')
            .mockReturnValueOnce(JSON.stringify(expectedObjectDefault))
            .mockReturnValueOnce(JSON.stringify(expectedObjectCIVariant))
            .mockReturnValueOnce(JSON.stringify(expectedObjectChimichangaVariant));

        process.env.CI = 'true';
        process.env.VARIANT_ENV_KEY = 'chimichanga';

        const result = Json5VariantMerger.read(process.cwd(), 'variables');

        expect(result).toEqual(expectedObjectMerged);
    });

    it('should return null if no variant is specified and the file does not exist', () => {
        const expectedFilePath = join(mockedCWD, `variables.json5`);

        jest.spyOn(fs, 'existsSync').mockReturnValue(false);
        jest.spyOn(fs, 'readFileSync').mockReturnValue('{}');

        const result = Json5VariantMerger.read(process.cwd(), 'variables');

        expect(fs.existsSync).toHaveBeenCalledWith(expectedFilePath);
        expect(fs.readFileSync).not.toHaveBeenCalledWith(expectedFilePath, 'utf8');
        expect(result).toBeNull();
    });

    it('should return null if the merged object is empty', () => {
        const expectedObjectDefault = {};
        const expectedObjectVariant = {};

        jest.spyOn(fs, 'existsSync').mockReturnValueOnce(true).mockReturnValueOnce(true);
        jest.spyOn(fs, 'readFileSync')
            .mockReturnValueOnce(JSON.stringify(expectedObjectDefault))
            .mockReturnValueOnce(JSON.stringify(expectedObjectVariant));

        process.env.VARIANT_ENV_KEY = 'chimichanga';

        const result = Json5VariantMerger.read(process.cwd(), 'variables');

        expect(result).toBeNull();
    });
});
