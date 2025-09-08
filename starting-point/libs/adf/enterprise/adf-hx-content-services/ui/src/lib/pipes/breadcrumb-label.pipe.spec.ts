/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { BreadcrumbLabelPipe } from './breadcrumb-label.pipe';
import { CacheLabelService } from '../services/cache-label-service';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { NoopTranslateModule } from '@alfresco/adf-core';

describe('BreadcrumbLabelPipe', () => {
    let pipe: BreadcrumbLabelPipe;
    let cacheLabelService: CacheLabelService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule],
            providers: [BreadcrumbLabelPipe, CacheLabelService],
        });

        pipe = TestBed.inject(BreadcrumbLabelPipe);
        cacheLabelService = TestBed.inject(CacheLabelService);

        jest.spyOn(cacheLabelService, 'getTranslation').mockReturnValue('some translation');
    });

    it('should create the pipe', () => {
        expect(pipe).toBeTruthy();
    });

    describe('transform', () => {
        it('should return an empty string when doc is null or undefined', () => {
            // eslint-disable-next-line unicorn/no-null
            const resultNull = pipe.transform(null as unknown as Document, 'someKey');
            const resultUndefined = pipe.transform(undefined as unknown as Document, 'someKey');

            expect(resultNull).toBe('');
            expect(resultUndefined).toBe('');
        });

        it('should call getTranslation with the correct parameters and return the translated value', () => {
            const mockDoc = {} as Document;
            const translationKey = 'DOCUMENT_BREADCRUMB.ROOT';
            const translationValue = 'some translation';

            const result = pipe.transform(mockDoc, translationKey);

            expect(result).toBe(translationValue);

            expect(cacheLabelService.getTranslation).toHaveBeenCalledWith(mockDoc, translationKey);
        });
    });
});
