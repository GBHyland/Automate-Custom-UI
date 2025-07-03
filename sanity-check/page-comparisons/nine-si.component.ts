import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    templateUrl: './nine-si-component.html',
    styleUrls: ['./nine-si-component.scss'],
    imports: [TranslateModule],
    standalone: true,
})
export class NineSiComponent {
        constructor(
        private router: Router,
    ) {}

    navigateToPage(): void {
        void this.router.navigate(['/yourpagename']);
    }
}
