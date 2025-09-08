/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { RecordDeleteButtonService } from './record-delete-button.service';
import { GovernanceRecord, ActionContext } from '../../../mocks/record.type';
import { RecordDeleteConfirmationComponent } from '../../dialogs/record-delete-confirmation/record-delete-confirmation.component';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { DialogConfig } from '@alfresco/adf-hx-content-services/ui';
import { RecordStatus, BLOCK_DELETE_STATUSES, RecordStatusType } from '@alfresco/adf-hx-content-services/services';

describe('RecordDeleteButtonService', () => {
    let service: RecordDeleteButtonService;
    let dialogMock: jest.Mocked<MatDialog>;

    const mockRecord: GovernanceRecord = {
        id: 'rec-001',
        contentID: '1',
        fileName: 'Test Record',
        status: RecordStatus.Ready,
        environmentDataSourceId: '',
        cutOffDate: new Date().toISOString(),
        categoryId: '',
        retainUntil: new Date().toISOString(),
    };

    const mockContext: ActionContext = { records: [mockRecord] };

    beforeEach(() => {
        dialogMock = {
            open: jest.fn(),
        } as unknown as jest.Mocked<MatDialog>;

        TestBed.configureTestingModule({
            providers: [provideHttpClientTesting(), RecordDeleteButtonService, { provide: MatDialog, useValue: dialogMock }],
        });

        service = TestBed.inject(RecordDeleteButtonService);
    });

    describe('isAvailable()', () => {
        it('should return true when all records are deletable', () => {
            const records: GovernanceRecord[] = [
                { ...mockRecord, status: RecordStatus.Ready },
                { ...mockRecord, status: RecordStatus.Incomplete },
                { ...mockRecord, status: RecordStatus.ReachedDisposition },
            ];
            expect(service.isAvailable(records)).toBe(true);
        });

        it.each(BLOCK_DELETE_STATUSES)('should return false when any record has blocked status: %s', (blockedStatus: RecordStatusType) => {
            const records: GovernanceRecord[] = [
                { ...mockRecord, status: blockedStatus },
                { ...mockRecord, status: RecordStatus.Ready },
            ];
            expect(service.isAvailable(records)).toBe(false);
        });

        it('should return false when no records are provided', () => {
            expect(service.isAvailable([])).toBe(false);
        });
    });

    describe('execute()', () => {
        it('should open the delete confirmation dialog with context', () => {
            dialogMock.open.mockReturnValue({} as any);
            service.execute(mockContext);

            expect(dialogMock.open).toHaveBeenCalledWith(RecordDeleteConfirmationComponent, {
                width: DialogConfig.small.width,
                data: mockContext,
            });
        });
    });
});
