import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
    templateUrl: './nine-si-menu-item.component.html',
    styleUrls: ['./nine-si-menu-item.component.scss'],
    standalone: true,
    imports: [MatButtonModule],
})
export class NineSiMenuItemComponent {
    constructor(
        private router: Router,
    ) {}

    navigateToPage(): void {
        void this.router.navigate(['/nine-si']);
    }
}
