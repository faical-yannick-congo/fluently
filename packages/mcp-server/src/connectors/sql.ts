import type { KnowledgeConnector, KnowledgeEntry, ContributionResult } from './types.js';

export class SqlConnector implements KnowledgeConnector {
  readonly name = 'sql';

  async load(): Promise<KnowledgeEntry[]> {
    throw new Error(
      'SQL connector is not yet implemented. ' +
      'Set FLUENTLY_CONNECTOR=github-public (default), github-private, or local. ' +
      'SQL support is planned for a future release.'
    );
  }

  async contribute(_cycle: unknown): Promise<ContributionResult> {
    return {
      success: false,
      message: 'SQL connector is not yet implemented. See docs for available connectors.',
    };
  }
}
