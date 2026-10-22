import { Injectable, signal, Signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Task, TaskDraft } from './task';

function seedTasks(): Task[] {
  const now = Date.now();
  return [
    {
      id: crypto.randomUUID(),
      title: 'Set up project structure',
      description: 'Scaffold the dashboard feature and routing.',
      status: 'Done',
      createdAt: new Date(now - 2 * 86_400_000)
    },
    {
      id: crypto.randomUUID(),
      title: 'Design the task list UI',
      description: 'Table with title, status, and createdAt columns.',
      status: 'In Progress',
      createdAt: new Date(now - 86_400_000)
    },
    {
      id: crypto.randomUUID(),
      title: 'Wire up create/edit dialog',
      description: 'Shared dialog for both the create and edit flows.',
      status: 'Todo',
      createdAt: new Date(now)
    }
  ];
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly tasksSignal = signal<Task[]>(seedTasks());

  readonly tasks: Signal<Task[]> = this.tasksSignal.asReadonly();

  create(draft: TaskDraft): Observable<Task> {
    const task: Task = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      ...draft
    };
    this.tasksSignal.update((tasks) => [...tasks, task]);
    return of(task);
  }

  update(id: string, draft: TaskDraft): Observable<Task> {
    let updated: Task | undefined;
    this.tasksSignal.update((tasks) =>
      tasks.map((task) => {
        if (task.id !== id) {
          return task;
        }
        updated = { ...task, ...draft };
        return updated;
      })
    );
    if (!updated) {
      throw new Error(`Task not found: ${id}`);
    }
    return of(updated);
  }

  remove(id: string): Observable<void> {
    this.tasksSignal.update((tasks) => tasks.filter((task) => task.id !== id));
    return of(undefined);
  }
}
