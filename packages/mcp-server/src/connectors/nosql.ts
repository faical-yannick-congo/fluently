import type { KnowledgeConnector, KnowledgeEntry, ContributionResult } from './types.js';

export class NoSqlConnector implements KnowledgeConnector {
  readonly name = 'nosql';

  async load(): Promise<KnowledgeEntry[]> {
    throw new Error(
      'NoSQL connector is not yet implemented. ' +
      'Set FLUENTLY_CONNECTOR=github-public (default), github-private, or local. ' +
      'NoSQL support is planned for a future release.'
    );
  }

  async contribute(_cycle: unknown): Promise<ContributionResult> {
    return {
      success: false,
      message: 'NoSQL connector is not yet implemented. See docs for available connectors.',
    };
  }
}
