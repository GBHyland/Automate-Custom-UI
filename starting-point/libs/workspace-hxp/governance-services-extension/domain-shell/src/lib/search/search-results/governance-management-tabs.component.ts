/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Inject, ViewChild } from '@angular/core';
import { GovernanceLegalHoldComponent } from './tabs/governance-legal-hold.component';
import { GovernanceSearchResultsComponent } from './tabs/governance-search-results.component';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslatePipe } from '@ngx-translate/core';
import { FeaturesServiceToken, IFeaturesService } from '@alfresco/adf-core/feature-flags';
import { ADF_HX_CONTENT_SERVICES_INTERNAL } from '@alfresco/adf-hx-content-services/features';
import { GovernanceRecord, ActionContext } from '../../mocks/record.type';
import { RecordPropertiesSidebarComponent } from '../../record-management/dialogs/record-properties-sidebar/record-properties-sidebar.component';

@Component({
    selector: 'hxp-governance-management-tabs',
    templateUrl: './governance-management-tabs.component.html',
    styleUrls: ['./governance-management-tabs.component.scss'],
    standalone: true,
    imports: [GovernanceLegalHoldComponent, GovernanceSearchResultsComponent, MatTabsModule, TranslatePipe, RecordPropertiesSidebarComponent],
})
export class GovernanceManagementTabsComponent {
    @ViewChild('legalHold') legalHoldComponent?: GovernanceLegalHoldComponent;

    activeTabIndex = 0;
    showSidebar = false;
    actionContext: ActionContext = {
        records: [],
        showPanel: false,
    };
    selectedRecords: GovernanceRecord[] = [];
    protected isLegalHoldFeatureFlagOn = false;

    constructor(
        @Inject(FeaturesServiceToken)
        private featuresService: IFeaturesService
    ) {
        this.featuresService.isOn$(ADF_HX_CONTENT_SERVICES_INTERNAL.CIC_GOVERNANCE_WORKSPACE_LEGAL_HOLD).subscribe((isOn) => {
            this.isLegalHoldFeatureFlagOn = isOn;
        });
    }

    onSidebarToggle(show: boolean) {
        this.showSidebar = show;
    }

    onActionContextChange(ctx: ActionContext) {
        this.actionContext = ctx;
    }

    onSelectedRecordsChange(records: GovernanceRecord[]) {
        this.selectedRecords = records;
    }

    onTabChanged(): void {
        this.showSidebar = false;
    }
}
