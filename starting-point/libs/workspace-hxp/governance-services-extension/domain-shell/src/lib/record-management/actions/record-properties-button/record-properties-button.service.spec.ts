/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { RecordPropertiesButtonService } from './record-properties-button.service';
import { GovernanceRecord, ActionContext } from '../../../mocks/record.type';

describe('RecordPropertiesButtonService', () => {
    let service: RecordPropertiesButtonService;

    const createMockRecord = (overrides?: Partial<GovernanceRecord>): GovernanceRecord => ({
        id: 'rec-001',
        contentID: '1',
        fileName: 'Test Record',
        status: 'Ready',
        environmentDataSourceId: '',
        cutOffDate: new Date().toISOString(),
        categoryId: '',
        retainUntil: new Date().toISOString(),
        ...overrides,
    });

    beforeEach(() => {
        service = new RecordPropertiesButtonService();
    });

    describe('isAvailable()', () => {
        it('should return true when exactly one record is selected', () => {
            const records: GovernanceRecord[] = [createMockRecord()];
            expect(service.isAvailable(records)).toBe(true);
        });

        it('should return false when no records are selected', () => {
            expect(service.isAvailable([])).toBe(false);
        });

        it('should return false when multiple records are selected', () => {
            const records: GovernanceRecord[] = [createMockRecord({ contentID: '1' }), createMockRecord({ contentID: '2' })];
            expect(service.isAvailable(records)).toBe(false);
        });
    });

    describe('execute()', () => {
        it('should emit `true` when actionContext.showPanel is true', (done) => {
            const context: ActionContext = {
                records: [],
                showPanel: true,
            };

            service.showSidebar$.subscribe((value) => {
                expect(value).toBe(true);
                done();
            });

            service.execute(context);
        });

        it('should emit `false` when actionContext.showPanel is false or undefined', (done) => {
            const context: ActionContext = {
                records: [],
                showPanel: undefined,
            };

            service.showSidebar$.subscribe((value) => {
                expect(value).toBe(false);
                done();
            });

            service.execute(context);
        });
    });
});
