/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class RouterExtService {
    private previousUrl!: string;
    private currentUrl: string;

    constructor(private router: Router, private route: ActivatedRoute) {
        this.currentUrl = this.router.url;
        router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.previousUrl = this.currentUrl;
                this.currentUrl = event.url;
            }
        });
    }

    getPreviousUrl() {
        return this.previousUrl;
    }

    redirectToReferer(refererURL: string, defaultPath: string): void {
        if (/search/i.test(refererURL)) {
            void this.router.navigateByUrl(refererURL);
        } else {
            void this.router.navigate([defaultPath], { relativeTo: this.route });
        }
    }
}
