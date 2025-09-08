/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

interface LetContext<T> {
    hylandIdpLet: T;
    $implicit: T;
}

@Directive({
    selector: '[hylandIdpLet]',
    standalone: true,
})
export class TemplateLetDirective<T> {
    private context: LetContext<T | undefined> = { hylandIdpLet: undefined, $implicit: undefined };

    constructor(viewContainer: ViewContainerRef, templateRef: TemplateRef<LetContext<T>>) {
        viewContainer.createEmbeddedView(templateRef, this.context);
    }

    @Input()
    set hylandIdpLet(value: T) {
        this.context.$implicit = this.context.hylandIdpLet = value;
    }

    static ngTemplateContextGuard<T>(_dir: TemplateLetDirective<T>, _ctx: unknown): _ctx is LetContext<T> {
        return true;
    }
}
