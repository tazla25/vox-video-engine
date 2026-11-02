import fs from 'node:fs';
import path from 'node:path';
import type { Task, TaskStatus, AgentRole } from './types.ts';
import type { StudioLogger } from './logger.ts';

export interface ProjectStateSnapshot {
  projectId: string;
  state: string;
  revisionCount: number;
  lastUpdated: string;
  tasks: Task[];
  outputs: Record<string, unknown>;
}

export class TaskQueue {
  private tasks: Map<string, Task> = new Map();
  private outputs: Map<string, unknown> = new Map();
  private stateFilePath: string;
  private projectId: string;
  private baseDir: string;
  private logger: StudioLogger;

  constructor(
    projectId: string,
    baseDir: string,
    logger: StudioLogger
  ) {
    this.projectId = projectId;
    this.baseDir = baseDir;
    this.logger = logger;
    const projectDir = path.join(this.baseDir, 'projects', this.projectId);
    fs.mkdirSync(projectDir, { recursive: true });
    this.stateFilePath = path.join(projectDir, 'state.json');
    this.loadCheckpoint();
  }

  addTask(task: Omit<Task, 'version' | 'status' | 'retryCount'>): Task {
    const existing = this.tasks.get(task.taskId);
    if (existing) {
      return existing;
    }

    const newTask: Task = {
      ...task,
      status: 'QUEUED',
      retryCount: 0,
      version: 1,
    };

    this.tasks.set(newTask.taskId, newTask);
    this.saveCheckpoint();
    return newTask;
  }

  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  getAllTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  getOutput<T = unknown>(key: string): T | undefined {
    return this.outputs.get(key) as T | undefined;
  }

  setOutput(key: string, data: unknown): void {
    this.outputs.set(key, data);
    this.saveCheckpoint();
  }

  updateTaskStatus(
    taskId: string,
    status: TaskStatus,
    updates?: Partial<Task>
  ): Task {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task with ID ${taskId} not found in TaskQueue`);
    }

    task.status = status;
    task.version += 1;
    if (updates) {
      Object.assign(task, updates);
    }

    if (status === 'RUNNING' && !task.startedAt) {
      task.startedAt = new Date().toISOString();
    }
    if ((status === 'COMPLETED' || status === 'FAILED') && !task.completedAt) {
      task.completedAt = new Date().toISOString();
    }

    this.saveCheckpoint();
    return task;
  }

  getReadyTasks(): Task[] {
    const ready: Task[] = [];
    for (const task of this.tasks.values()) {
      if (task.status === 'QUEUED') {
        const depsSatisfied = task.dependencies.every(depId => {
          const dep = this.tasks.get(depId);
          return dep && dep.status === 'COMPLETED';
        });
        if (depsSatisfied) {
          ready.push(task);
        }
      }
    }
    return ready;
  }

  saveCheckpoint(currentState = 'RUNNING', revisionCount = 0): void {
    const snapshot: ProjectStateSnapshot = {
      projectId: this.projectId,
      state: currentState,
      revisionCount,
      lastUpdated: new Date().toISOString(),
      tasks: Array.from(this.tasks.values()),
      outputs: Object.fromEntries(this.outputs.entries()),
    };

    try {
      fs.writeFileSync(this.stateFilePath, JSON.stringify(snapshot, null, 2), 'utf8');
      this.logger.debug(`Checkpoint persisted to ${this.stateFilePath}`);
    } catch (err) {
      this.logger.error(`Failed to write checkpoint to ${this.stateFilePath}`, { err: String(err) });
    }
  }

  loadCheckpoint(): boolean {
    if (!fs.existsSync(this.stateFilePath)) {
      return false;
    }

    try {
      const raw = fs.readFileSync(this.stateFilePath, 'utf8');
      const snapshot: ProjectStateSnapshot = JSON.parse(raw);
      for (const task of snapshot.tasks) {
        this.tasks.set(task.taskId, task);
      }
      for (const [key, val] of Object.entries(snapshot.outputs)) {
        this.outputs.set(key, val);
      }
      this.logger.info(`Successfully resumed from checkpoint with ${this.tasks.size} tasks.`);
      return true;
    } catch (err) {
      this.logger.warn(`Failed to parse checkpoint file, starting fresh`, { err: String(err) });
      return false;
    }
  }
}
