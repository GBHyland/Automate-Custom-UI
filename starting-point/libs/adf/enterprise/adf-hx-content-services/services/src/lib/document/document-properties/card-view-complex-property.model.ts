/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { CardViewItem, CardViewItemProperties, CardViewBaseItemModel, DynamicComponentModel } from '@alfresco/adf-core';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { PropertyUtilService } from './document-properties.util.service';
import { DocumentModel } from '../document-model/document-model.model';

export interface ComplexCardViewItemProperties {
    document: Document;
    model: DocumentModel | undefined;
    propertyUtilService: PropertyUtilService;
}

export class ComplexFieldCardViewItemModel extends CardViewBaseItemModel implements CardViewItem, DynamicComponentModel {
    override type = 'complex';
    private property: string;
    private complexCardViewItemProperties: ComplexCardViewItemProperties;

    constructor(cardViewItemProperties: CardViewItemProperties, complexCardViewItemProperties: ComplexCardViewItemProperties) {
        super(cardViewItemProperties);
        this.property = cardViewItemProperties.key;
        this.complexCardViewItemProperties = complexCardViewItemProperties;
    }

    get displayValue(): CardViewItem[] {
        const cardItems: CardViewItem[] = [];
        for (const field of this.value) {
            const cardItem = this.createCardItem(`${this.property}.${field.name}`);
            cardItems.push(...cardItem);
        }

        return cardItems;
    }

    private createCardItem(property: string): CardViewItem[] {
        return this.complexCardViewItemProperties.propertyUtilService.createCardItemUtil(
            property,
            this.complexCardViewItemProperties.model,
            this.complexCardViewItemProperties.document
        );
    }
}
