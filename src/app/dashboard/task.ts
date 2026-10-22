export type TaskStatus = 'Todo' | 'In Progress' | 'Done';

export const TASK_STATUSES: TaskStatus[] = ['Todo', 'In Progress', 'Done'];

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: Date;
}

export type TaskDraft = Pick<Task, 'title' | 'description' | 'status'>;
