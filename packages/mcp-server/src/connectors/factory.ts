import type { KnowledgeConnector } from './types.js';
import { GitHubPublicConnector } from './github-public.js';
import { GitHubPrivateConnector } from './github-private.js';
import { LocalConnector } from './local.js';
import { SqlConnector } from './sql.js';
import { NoSqlConnector } from './nosql.js';

export function createConnector(): KnowledgeConnector {
  const type = (process.env.FLUENTLY_CONNECTOR ?? 'github-public').toLowerCase();
  switch (type) {
    case 'github-public':  return new GitHubPublicConnector();
    case 'github-private': return new GitHubPrivateConnector();
    case 'local':          return new LocalConnector();
    case 'sql':            return new SqlConnector();
    case 'nosql':          return new NoSqlConnector();
    default:
      throw new Error(
        `Unknown connector "${type}". ` +
        `Valid values: github-public (default), github-private, local, sql, nosql`
      );
  }
}
