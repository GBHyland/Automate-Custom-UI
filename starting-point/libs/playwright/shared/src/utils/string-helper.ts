/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export const StringHelper = {
    capitalize(text: string) {
        return text && text[0].toUpperCase() + text.slice(1);
    },

    stripSpecialCharacters(text: string) {
        return text.replaceAll(/[^a-zA-Z0-9]+/g, '');
    },
};
