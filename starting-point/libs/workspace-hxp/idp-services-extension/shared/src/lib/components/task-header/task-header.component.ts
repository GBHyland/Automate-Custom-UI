/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    DestroyRef,
    Directive,
    ElementRef,
    inject,
    Injector,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { IdpContextTaskBaseService } from '../../services/context-task/context-task-base.service';
import { IdpTaskInfoBase } from '../../models/common-models';
import { TemplateLetDirective } from '../../directives/template-let.directive';
import { MatDialog, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { DiscardChangesDialogComponent } from '../../dialogs/discard-changes-dialog/discard-changes-dialog';

@Directive({
    selector: '[hylandIdpTaskHeaderAfterBack]',
    standalone: true,
})
export class TaskHeaderAfterBackDirective {}

@Component({
    selector: 'hyland-idp-task-header',
    templateUrl: './task-header.component.html',
    styleUrls: ['./task-header.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, TemplateLetDirective, TranslatePipe, MatDialogModule],
})
export class TaskHeaderComponent implements AfterContentInit {
    @ContentChild(TaskHeaderAfterBackDirective, { static: false }) afterBackContent: ElementRef | undefined;

    headerInfo$: Observable<IdpTaskInfoBase>;
    hasAfterBackContent = false;

    private readonly destroyRef = inject(DestroyRef);
    private readonly contextTaskService = inject(IdpContextTaskBaseService);
    private readonly dialog = inject(MatDialog);
    private readonly injector = inject(Injector);
    taskCanSave = false;

    constructor() {
        this.headerInfo$ = this.contextTaskService.taskInfo$.pipe(
            filter((task) => !!task),
            takeUntilDestroyed(this.destroyRef)
        );
        this.contextTaskService.taskCanSave$.subscribe((v) => {
            this.taskCanSave = v;
        });
    }

    ngAfterContentInit(): void {
        this.hasAfterBackContent = !!this.afterBackContent;
    }

    goBack() {
        if (!this.taskCanSave) {
            this.contextTaskService.cancelTask();
            return;
        }
        const dialogConfig: MatDialogConfig = {
            injector: this.injector,
            width: '600px',
            height: 'auto',
            autoFocus: '.idp-discard-changes-dialog__close-button',
            restoreFocus: true,
        };
        const dialogRef = this.dialog.open(DiscardChangesDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe((result) => {
            if (result === true) {
                this.contextTaskService.cancelTask();
            }
        });
    }

    generateAutomationId(label: string): string {
        if (!label) {
            return '';
        }
        return 'header-' + label.toLowerCase().replace(/ /g, '-');
    }
}
