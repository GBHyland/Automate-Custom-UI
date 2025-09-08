/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ChangeClassListDialogComponent } from './change-class.dialog';

export interface ChangeClassListDialogData {
    currentClassId: string | undefined;
}

export function openChangeClassListDialog<R>(
    materialDialog: MatDialog,
    dialogData: ChangeClassListDialogData,
    onDialogClose: (selectedItem: R) => void,
    config?: MatDialogConfig
) {
    const dialogCfg = { ...(config || new MatDialogConfig()) };
    dialogCfg.autoFocus = config?.autoFocus ?? '.idp-filterable-selection-list__search-field-input';
    dialogCfg.restoreFocus = config?.restoreFocus ?? true;
    dialogCfg.data = dialogData;
    dialogCfg.width = config?.width ?? '30%';
    dialogCfg.height = config?.height ?? '65%';

    materialDialog
        .open(ChangeClassListDialogComponent, dialogCfg)
        .afterClosed()
        .subscribe((result) => {
            if (result) {
                onDialogClose(result);
            }
        });
}
