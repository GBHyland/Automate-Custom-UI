/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { RecordStatusLabelPipe } from './record-status-label.pipe';
import { RecordStatus, STATUS_LABEL_MAP } from '../../filters/status/status-options.data';

describe('RecordStatusLabelPipe', () => {
    let pipe: RecordStatusLabelPipe;

    beforeEach(() => {
        pipe = new RecordStatusLabelPipe();
    });

    it('should return the correct label for each status key', () => {
        for (const key of Object.keys(STATUS_LABEL_MAP)) {
            expect(pipe.transform(key as RecordStatus)).toBe(STATUS_LABEL_MAP[key as RecordStatus]);
        }
    });

    it('should return an empty string for an unknown status', () => {
        expect(pipe.transform('UnknownStatus')).toBe('');
    });
});
