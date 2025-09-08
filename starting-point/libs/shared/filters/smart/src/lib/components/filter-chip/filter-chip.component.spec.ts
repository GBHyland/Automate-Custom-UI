/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterChipComponent } from './filter-chip.component';
import { ChipHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NoopTranslateModule } from '@alfresco/adf-core';

describe('FilterChipComponent', () => {
    let component: FilterChipComponent;
    let fixture: ComponentFixture<FilterChipComponent>;

    const getChipRow = async () => {
        return ChipHarnessUtils.getChipRow({
            fixture,
            chipFilters: {
                selector: `[data-automation-id="hxp-filter-chip"]`,
            },
        });
    };

    const getLabel = () => {
        return fixture.nativeElement.querySelector(`[data-automation-id="hxp-filter-chip-label"]`);
    };

    const getSuffix = () => {
        return fixture.nativeElement.querySelector(`[data-automation-id="hxp-filter-chip-label-suffix"]`);
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, NoopTranslateModule, FilterChipComponent],
        });

        fixture = TestBed.createComponent(FilterChipComponent);
        component = fixture.componentInstance;
    });

    it('should emit chipClick on chip row click', async () => {
        fixture.detectChanges();
        const spy = spyOn(component.chipClick, 'emit');
        const chip = await getChipRow();
        const chipRowHost = await chip.host();

        await chipRowHost.click();

        expect(spy).toHaveBeenCalled();
    });

    it('should emit removeIconClick on remove icon click', async () => {
        fixture.detectChanges();
        const spy = spyOn(component.removeIconClick, 'emit');
        const chip = await getChipRow();

        await chip.remove();

        expect(spy).toHaveBeenCalled();
    });

    it('should display only label if no suffix provided', () => {
        component.label = 'test label';
        fixture.detectChanges();

        const suffix = getSuffix();
        const label = getLabel();
        const labelTextContent = (label.textContent as string).trim();

        expect(label).not.toBeNull();
        expect(labelTextContent).toBe('test label');
        expect(suffix).toBeNull();
    });

    it('should display label and colon if suffix provided', () => {
        component.label = 'test label';
        component.suffix = 'suffix';
        fixture.detectChanges();

        const label = getLabel();
        const labelTextContent = (label.textContent as string).trim();

        expect(label).not.toBeNull();
        expect(labelTextContent).toBe('test label:');
    });

    it('should display suffix if provided', () => {
        component.label = 'test label';
        component.suffix = 'suffix';
        fixture.detectChanges();

        const suffix = getSuffix();
        const suffixTextContent = (suffix.textContent as string).trim();

        expect(suffix).not.toBeNull();
        expect(suffixTextContent).toBe('suffix');
    });

    it('should display chip count if suffix and chipCount provided and chipCount greater than one', () => {
        component.label = 'test label';
        component.suffix = 'suffix';
        component.chipCount = 2;
        fixture.detectChanges();

        const suffix = getSuffix();
        const suffixTextContent = (suffix.textContent as string).trim();

        expect(suffix).not.toBeNull();
        expect(suffixTextContent).toBe('suffix +1');
    });
});
