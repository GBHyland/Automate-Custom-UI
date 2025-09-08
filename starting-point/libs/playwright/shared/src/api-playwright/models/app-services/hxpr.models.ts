/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export interface Document {
    [key: string]: any;
    sys_repository?: string;
    sys_id?: string;
    /**
     * Required for document creation.
     */
    sys_primaryType?: string;
    sys_title?: string;
    sys_name?: string;
    sys_path?: string;
    sys_pathDepth?: number;
    sys_parentId?: string;
    sys_parentPath?: string;
    sys_version?: number;
    sys_versionSeriesId?: string;
    sysver_isCheckedIn?: boolean;
    sys_isFolderish?: boolean;
    sys_isTrashed?: boolean;
    sysver_isVersion?: boolean;
    sys_isLatestVersion?: boolean;
    sys_isRecord?: boolean;
    sys_retainUntil?: string;
    sys_hasLegalHold?: boolean;
    sys_mixinTypes?: Array<string>;
    sys_changeToken?: string;
    sys_lifecycleState?: string;
    sys_pos?: number;
    sys_acl?: Array<ACE>;
    sys_effectiveAcl?: Array<ACE>;
    sys_effectivePermissions?: Array<string>;
    sys_lockCreated?: string;
    sys_lockOwner?: User;
    sys_fulltextBinary?: string;
    sys_contributors?: Array<User>;
    sys_created?: string;
    sys_creator?: User;
    sys_description?: string;
    sys_lastContributor?: User;
    sys_modified?: string;
    sysfile_blob?: Blob;
}

interface User {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
}

interface Group {
    id?: string;
    name?: string;
    label?: string;
}

interface Blob {
    digest?: string;
    filename?: string;
    key?: string;
    length?: number;
    mimeType?: string;
}

export interface ACE {
    /**
     *
     * @type {string}
     * @memberof ACE
     */
    creator?: string;
    /**
     *
     * @type {string}
     * @memberof ACE
     */
    permission?: string;
    /**
     *
     * @type {boolean}
     * @memberof ACE
     */
    granted?: boolean;
    /**
     *
     * @type {User}
     * @memberof ACE
     */
    user?: User;
    /**
     *
     * @type {Group}
     * @memberof ACE
     */
    group?: Group;
    /**
     *
     * @type {string}
     * @memberof ACE
     */
    end?: string;
    /**
     *
     * @type {string}
     * @memberof ACE
     */
    begin?: string;
    /**
     *
     * @type {string}
     * @memberof ACE
     */
    status?: string;
}

export interface Model {
    // /**
    //  *
    //  * @type {{ [key: string]: Schema; }}
    //  * @memberof Model
    //  */
    // schemas?: {
    //     [key: string]: Schema;
    // };
    /**
     *
     * @type {{ [key: string]: Type; }}
     * @memberof Model
     */
    types?: {
        [key: string]: Type;
    };
    /**
     *
     * @type {{ [key: string]: MixinType; }}
     * @memberof Model
     */
    mixinTypes?: {
        [key: string]: MixinType;
    };
    /**
     *
     * @type {{ [key: string]: PrimaryType; }}
     * @memberof Model
     */
    primaryTypes?: {
        [key: string]: PrimaryType;
    };
}

// export interface Schema {
//     /**
//      *
//      * @type {string}
//      * @memberof Schema
//      */
//     projectId?: string;
//     /**
//      *
//      * @type {{ [key: string]: Field; }}
//      * @memberof Schema
//      */
//     fields?: {
//         [key: string]: Field;
//     };
//     /**
//      *
//      * @type {boolean}
//      * @memberof Schema
//      */
//     versionWritable?: boolean;
//     /**
//      *
//      * @type {string}
//      * @memberof Schema
//      */
//     prefix?: string;
// }

export interface Type {
    /**
     *
     * @type {string}
     * @memberof Type
     */
    projectId?: string;
    /**
     *
     * @type {{ [key: string]: Field; }}
     * @memberof Type
     */
    fields?: {
        [key: string]: Field;
    };
    /**
     *
     * @type {Constraint}
     * @memberof Type
     */
    constraints?: Constraint;
    /**
     *
     * @type {List}
     * @memberof Type
     */
    list?: List;
    /**
     *
     * @type {string}
     * @memberof Type
     */
    extends?: string;
}

export interface MixinType {
    /**
     *
     * @type {string}
     * @memberof MixinType
     */
    projectId?: string;
    /**
     *
     * @type {boolean}
     * @memberof MixinType
     */
    noPerDocumentQuery?: boolean;
    /**
     *
     * @type {Array<string>}
     * @memberof MixinType
     */
    schemas?: Array<string>;
}

export interface PrimaryType {
    /**
     *
     * @type {string}
     * @memberof PrimaryType
     */
    projectId?: string;
    /**
     *
     * @type {boolean}
     * @memberof PrimaryType
     */
    special?: boolean;
    /**
     *
     * @type {string}
     * @memberof PrimaryType
     */
    extends?: string;
    /**
     *
     * @type {Array<string>}
     * @memberof PrimaryType
     */
    mixins?: Array<string>;
    /**
     *
     * @type {Array<string>}
     * @memberof PrimaryType
     */
    schemas?: Array<string>;
    /**
     *
     * @type {Array<string>}
     * @memberof PrimaryType
     */
    subtypes?: Array<string>;
}

export interface Field {
    /**
     *
     * @type {string}
     * @memberof Field
     */
    default?: string;
    /**
     *
     * @type {boolean}
     * @memberof Field
     */
    secured?: boolean;
    /**
     *
     * @type {string}
     * @memberof Field
     */
    type?: string;
    /**
     *
     * @type {boolean}
     * @memberof Field
     */
    deprecated?: boolean;
    /**
     *
     * @type {boolean}
     * @memberof Field
     */
    removed?: boolean;
    /**
     *
     * @type {string}
     * @memberof Field
     */
    fallback?: string;
    /**
     *
     * @type {Constraint}
     * @memberof Field
     */
    constraints?: Constraint;
    /**
     *
     * @type {string}
     * @memberof Field
     */
    extends?: string;
    /**
     *
     * @type {List}
     * @memberof Field
     */
    list?: List;
    /**
     *
     * @type {{ [key: string]: Field; }}
     * @memberof Field
     */
    fields?: {
        [key: string]: Field;
    };
}

export interface Constraint {
    /**
     *
     * @type {number}
     * @memberof Constraint
     */
    minLength?: number;
    /**
     *
     * @type {number}
     * @memberof Constraint
     */
    maxLength?: number;
    /**
     *
     * @type {Resolver}
     * @memberof Constraint
     */
    resolver?: Resolver;
    /**
     *
     * @type {boolean}
     * @memberof Constraint
     */
    nullable?: boolean;
    /**
     *
     * @type {object}
     * @memberof Constraint
     */
    minInclusive?: object;
    /**
     *
     * @type {object}
     * @memberof Constraint
     */
    minExclusive?: object;
    /**
     *
     * @type {object}
     * @memberof Constraint
     */
    maxInclusive?: object;
    /**
     *
     * @type {object}
     * @memberof Constraint
     */
    maxExclusive?: object;
    /**
     *
     * @type {string}
     * @memberof Constraint
     */
    pattern?: string;
    /**
     *
     * @type {Array<object>}
     * @memberof Constraint
     */
    enumeration?: Array<object>;
}

export interface List {
    /**
     *
     * @type {string}
     * @memberof List
     */
    type?: string;
    /**
     *
     * @type {Constraint}
     * @memberof List
     */
    constraints?: Constraint;
    /**
     *
     * @type {string}
     * @memberof List
     */
    extends?: string;
}

export interface Resolver {
    /**
     *
     * @type {string}
     * @memberof Resolver
     */
    name?: string;
    /**
     *
     * @type {boolean}
     * @memberof Resolver
     */
    validation?: boolean;
    /**
     *
     * @type {string}
     * @memberof Resolver
     */
    vocabulary?: string;
    /**
     *
     * @type {string}
     * @memberof Resolver
     */
    store?: string;
    /**
     *
     * @type {string}
     * @memberof Resolver
     */
    type?: string;
    /**
     *
     * @type {string}
     * @memberof Resolver
     */
    repository?: string;
}
