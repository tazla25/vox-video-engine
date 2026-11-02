import type { AgentRole, IAgent, AgentContext, AgentExecutionResult } from './types.ts';

export class AgentRegistry {
  private agents = new Map<AgentRole, IAgent>();

  register<TInput, TOutput>(agent: IAgent<TInput, TOutput>): void {
    if (this.agents.has(agent.role)) {
      throw new Error(`Agent for role '${agent.role}' is already registered.`);
    }
    this.agents.set(agent.role, agent as unknown as IAgent);
  }

  get<TInput = unknown, TOutput = unknown>(role: AgentRole): IAgent<TInput, TOutput> {
    const agent = this.agents.get(role);
    if (!agent) {
      throw new Error(`Agent for role '${role}' is not registered in the AgentRegistry.`);
    }
    return agent as unknown as IAgent<TInput, TOutput>;
  }

  has(role: AgentRole): boolean {
    return this.agents.has(role);
  }

  listRoles(): AgentRole[] {
    return Array.from(this.agents.keys());
  }

  async executeRole<TInput = unknown, TOutput = unknown>(
    role: AgentRole,
    input: TInput,
    context: AgentContext
  ): Promise<AgentExecutionResult<TOutput>> {
    const agent = this.get<TInput, TOutput>(role);
    const startTime = Date.now();
    context.logger.info(`Invoking Agent [${agent.name}] (${role})...`);

    try {
      const result = await agent.execute(input, context);
      const durationMs = Date.now() - startTime;
      const metrics = {
        durationMs,
        ...(result.metrics || {}),
      };

      if (result.success) {
        context.logger.info(`Agent [${agent.name}] completed successfully in ${durationMs}ms`);
      } else {
        context.logger.error(`Agent [${agent.name}] failed: ${result.error}`, { durationMs });
      }

      return {
        ...result,
        metrics,
      };
    } catch (err: unknown) {
      const durationMs = Date.now() - startTime;
      const errorMsg = err instanceof Error ? err.message : String(err);
      context.logger.error(`Unhandled error in Agent [${agent.name}]: ${errorMsg}`, { durationMs });
      return {
        success: false,
        error: errorMsg,
        metrics: { durationMs },
      };
    }
  }
}
