/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FileReaderService } from './hxp-file-reader.service';

describe('FileReaderService', () => {
    let service: FileReaderService;

    beforeEach(() => {
        service = new FileReaderService();
    });

    describe('readFileAsText', () => {
        it('should read JSON file content as text', async () => {
            const jsonContent = JSON.stringify({ key: 'value' });
            const mockFile = new Blob([jsonContent], { type: 'application/json' });
            const file = new File([mockFile], 'test.json', { type: 'application/json' });

            const result = await service.readFileAsText(file);
            expect(result).toEqual(jsonContent);
        });

        it('should handle errors during file reading', (done) => {
            const mockFile = new Blob([''], { type: 'text/plain' });
            const file = new File([mockFile], 'test.txt', { type: 'text/plain' });

            const mockFrInstance = new FileReader();
            spyOn(window, 'FileReader').and.returnValue(mockFrInstance);
            spyOn(mockFrInstance, 'readAsText').and.callFake(function () {
                this.onerror(new ProgressEvent('error'));
            });

            service
                .readFileAsText(file)
                .then(() => {
                    fail('Expected readFileAsText to reject with an error');
                })
                .catch((error) => {
                    expect(error).toBeInstanceOf(ProgressEvent);
                    expect(error.type).toBe('error');
                    done();
                });
        });
    });
});
