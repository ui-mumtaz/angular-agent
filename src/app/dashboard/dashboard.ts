import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { TaskService } from './task.service';
import { Task, TaskDraft } from './task';
import { TaskFormDialog, TaskFormDialogData } from './task-form-dialog/task-form-dialog';
import { ConfirmDialog, ConfirmDialogData } from './confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  private readonly taskService = inject(TaskService);
  private readonly dialog = inject(MatDialog);

  readonly tasks = this.taskService.tasks;
  readonly columns = ['title', 'status', 'createdAt', 'actions'];

  openCreateDialog(): void {
    const ref = this.dialog.open<TaskFormDialog, TaskFormDialogData, TaskDraft>(TaskFormDialog, {
      data: {},
      width: '480px'
    });
    ref.afterClosed().subscribe((draft) => {
      if (draft) {
        this.taskService.create(draft).subscribe();
      }
    });
  }

  openEditDialog(task: Task): void {
    const ref = this.dialog.open<TaskFormDialog, TaskFormDialogData, TaskDraft>(TaskFormDialog, {
      data: { task },
      width: '480px'
    });
    ref.afterClosed().subscribe((draft) => {
      if (draft) {
        this.taskService.update(task.id, draft).subscribe();
      }
    });
  }

  confirmDelete(task: Task): void {
    const ref = this.dialog.open<ConfirmDialog, ConfirmDialogData, boolean>(ConfirmDialog, {
      data: {
        title: 'Delete task',
        message: `Delete "${task.title}"? This can't be undone.`,
        confirmLabel: 'Delete'
      },
      width: '420px'
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.taskService.remove(task.id).subscribe();
      }
    });
  }
}
