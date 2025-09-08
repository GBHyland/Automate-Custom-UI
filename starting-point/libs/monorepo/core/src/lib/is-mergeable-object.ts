/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

// FORK OF https://github.com/TehShrike/is-mergeable-object

export function isMergeableObject(value) {
    return isNonNullObject(value) && !isSpecial(value);
}

function isNonNullObject(value) {
    return !!value && typeof value === 'object';
}

function isSpecial(value) {
    const stringValue = Object.prototype.toString.call(value);
    return stringValue === '[object RegExp]' || stringValue === '[object Date]' || isReactElement(value);
}

const canUseSymbol = typeof Symbol === 'function' && Symbol.for;
const REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

function isReactElement(value) {
    return value.$$typeof === REACT_ELEMENT_TYPE;
}
