/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

/**
 * Recursively make all properties in `T` readonly.
 *
 * @see {@linkcode Readonly<T>} for TypeScript's built-in, non-recursive version of this type.
 * @see {@linkcode deepFreeze()} for a utility function that recursively freezes an object and returns this type.
 */
export type DeepReadonly<T> = T extends (...args: infer A) => infer R
    ? ((...args: A) => R) & { readonly [P in keyof T]: DeepReadonly<T[P]> }
    : T extends object
    ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
    : T;

/**
 * Apply `Object.freeze()` to the given object and recurse on all of its own data properties.
 *
 * @param obj - the object to recursively freeze
 * @returns the very same object, cast to {@linkcode DeepReadonly<T>} (for convenience)
 *
 * @see {@linkcode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze|Object.freeze()} on MDN.
 *
 * @remarks
 * If an object or property is already frozen, it will not be recursed into. This is mostly to prevent loops in the case of
 * circular references but may cause incomplete application if a shallow `Object.freeze()` call was made beforehand.
 *
 * All own properties that are data properties are frozen/recursed into (incl. symbol-keyed and non-enumerable ones).
 * Accessor properties (i.e., ones with getters/setters) and prototypical properties are skipped.
 */
export function deepFreeze<T extends object>(obj: T): DeepReadonly<T> {
    if (!Object.isFrozen(obj)) {
        Object.freeze(obj);
        const descriptors = Object.getOwnPropertyDescriptors(obj);
        for (const key of Reflect.ownKeys(descriptors)) {
            const { value } = descriptors[key as keyof typeof descriptors];
            if (value === 'object' || typeof value === 'function') {
                deepFreeze(value);
            }
        }
    }
    return obj as DeepReadonly<T>;
}
