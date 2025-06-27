import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    templateUrl: './coffee-time-component.html',
    styleUrls: ['./coffee-time-component.scss'],
    imports: [TranslateModule],
    standalone: true,
})
export class CoffeeTimeComponent {
    constructor(
        private router: Router,
    ) {}

    navigateToPage(): void {
        void this.router.navigate(['/coffee-time']);
    }
}
