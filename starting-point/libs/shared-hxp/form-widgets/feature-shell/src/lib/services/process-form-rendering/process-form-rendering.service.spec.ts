/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ProcessFormRenderingService } from './process-form-rendering.service';
import { AttachFileWidgetComponent, FileViewerWidgetComponent, PropertiesViewerWidgetComponent } from '../../widgets';
import { FormFieldTypes } from '@alfresco/adf-core';
import {
    DateCloudWidgetComponent,
    DropdownCloudWidgetComponent,
    GroupCloudWidgetComponent,
    PeopleCloudWidgetComponent,
    RadioButtonsCloudWidgetComponent,
    DisplayRichTextWidgetComponent,
} from '@alfresco/adf-process-services-cloud';

describe('ProcessFormRenderingService', () => {
    let service: ProcessFormRenderingService;

    const resolved = (type: string) => {
        const resolver = service.getComponentTypeResolver(type);
        return resolver({ type: '' });
    };

    beforeEach(() => {
        service = new ProcessFormRenderingService();
    });

    it('should resolve AttachFile widget for hxp-upload', () => {
        expect(resolved('hxp-upload')).toBe(AttachFileWidgetComponent);
    });

    it('should resolve FileViewer widget for hxp-file-viewer', () => {
        expect(resolved('hxp-file-viewer')).toBe(FileViewerWidgetComponent);
    });

    it('should resolve PropertiesViewer widget for hxp-properties-viewer', () => {
        expect(resolved('hxp-properties-viewer')).toBe(PropertiesViewerWidgetComponent);
    });

    it('should resolve Dropdown widget for dropdown', () => {
        expect(resolved(FormFieldTypes.DROPDOWN)).toBe(DropdownCloudWidgetComponent);
    });

    it('should resolve Date widget for date', () => {
        expect(resolved(FormFieldTypes.DATE)).toBe(DateCloudWidgetComponent);
    });

    it('should resolve People widget for people', () => {
        expect(resolved(FormFieldTypes.PEOPLE)).toBe(PeopleCloudWidgetComponent);
    });

    it('should resolve Group widget for functional-group', () => {
        expect(resolved(FormFieldTypes.FUNCTIONAL_GROUP)).toBe(GroupCloudWidgetComponent);
    });

    it('should resolve RadioButtons widget for radio-buttons', () => {
        expect(resolved(FormFieldTypes.RADIO_BUTTONS)).toBe(RadioButtonsCloudWidgetComponent);
    });

    it('should resolve DisplayRichText widget for display-rich-text', () => {
        expect(resolved(FormFieldTypes.DISPLAY_RICH_TEXT)).toBe(DisplayRichTextWidgetComponent);
    });
});
