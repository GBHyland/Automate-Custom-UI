import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
    templateUrl: './coffee-time-menu-item.component.html',
    styleUrls: ['./coffee-time-menu-item.component.scss'],
    standalone: true,
    imports: [MatButtonModule],
})
export class CoffeeTimeMenuItemComponent {
    constructor(
        private router: Router,
    ) {}

    navigateToPage(): void {
        void this.router.navigate(['/coffee-time']);
    }
}
