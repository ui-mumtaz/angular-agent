import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TASK_STATUSES, Task, TaskDraft } from '../task';

export interface TaskFormDialogData {
  task?: Task;
}

interface TaskForm {
  title: FormControl<string>;
  description: FormControl<string>;
  status: FormControl<Task['status']>;
}

@Component({
  selector: 'app-task-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './task-form-dialog.html',
  styleUrl: './task-form-dialog.scss'
})
export class TaskFormDialog {
  private readonly dialogRef = inject(MatDialogRef<TaskFormDialog, TaskDraft>);
  readonly data = inject<TaskFormDialogData>(MAT_DIALOG_DATA);

  readonly statuses = TASK_STATUSES;
  readonly isEditMode = !!this.data.task;

  readonly form = new FormGroup<TaskForm>({
    title: new FormControl(this.data.task?.title ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)]
    }),
    description: new FormControl(this.data.task?.description ?? '', {
      nonNullable: true,
      validators: [Validators.maxLength(500)]
    }),
    status: new FormControl(this.data.task?.status ?? 'Todo', {
      nonNullable: true,
      validators: [Validators.required]
    })
  });

  cancel(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.form.getRawValue());
  }
}
