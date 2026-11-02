import type { ProjectState } from './types.ts';

export interface StateTransitionResult {
  from: ProjectState;
  to: ProjectState;
  timestamp: string;
  reason?: string;
}

export class ProjectStateMachine {
  private currentState: ProjectState;
  private history: StateTransitionResult[] = [];
  private revisionCount = 0;
  private maxRevisions: number;

  private static readonly VALID_TRANSITIONS: Record<ProjectState, ProjectState[]> = {
    QUEUED: ['RUNNING', 'CANCELLED'],
    RUNNING: ['AWAITING_REVIEW', 'NEEDS_REVISION', 'FAILED', 'COMPLETED', 'CANCELLED'],
    AWAITING_REVIEW: ['APPROVED', 'NEEDS_REVISION', 'CANCELLED'],
    NEEDS_REVISION: ['RUNNING', 'FAILED', 'CANCELLED'],
    APPROVED: ['RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'],
    COMPLETED: [],
    FAILED: ['QUEUED', 'RUNNING', 'CANCELLED'], // allows restart
    CANCELLED: ['QUEUED'], // allows un-canceling
  };

  constructor(
    initialState: ProjectState = 'QUEUED',
    maxRevisions = 5
  ) {
    this.currentState = initialState;
    this.maxRevisions = maxRevisions;
    this.history.push({
      from: initialState,
      to: initialState,
      timestamp: new Date().toISOString(),
      reason: 'Initial state'
    });
  }

  getState(): ProjectState {
    return this.currentState;
  }

  getRevisionCount(): number {
    return this.revisionCount;
  }

  getHistory(): StateTransitionResult[] {
    return [...this.history];
  }

  canTransitionTo(nextState: ProjectState): boolean {
    const allowed = ProjectStateMachine.VALID_TRANSITIONS[this.currentState];
    return allowed ? allowed.includes(nextState) : false;
  }

  transition(nextState: ProjectState, reason?: string): StateTransitionResult {
    if (!this.canTransitionTo(nextState)) {
      throw new Error(
        `Invalid state transition: Cannot transition from '${this.currentState}' to '${nextState}'. Allowed: [${(ProjectStateMachine.VALID_TRANSITIONS[this.currentState] || []).join(', ')}]`
      );
    }

    if (nextState === 'NEEDS_REVISION') {
      this.revisionCount += 1;
      if (this.revisionCount > this.maxRevisions) {
        this.currentState = 'FAILED';
        const failRecord: StateTransitionResult = {
          from: this.currentState,
          to: 'FAILED',
          timestamp: new Date().toISOString(),
          reason: `Exceeded maximum allowable revision loops (${this.maxRevisions}). Transitioned to FAILED to prevent infinite loop.`
        };
        this.history.push(failRecord);
        throw new Error(failRecord.reason);
      }
    }

    const record: StateTransitionResult = {
      from: this.currentState,
      to: nextState,
      timestamp: new Date().toISOString(),
      reason
    };

    this.currentState = nextState;
    this.history.push(record);
    return record;
  }
}
