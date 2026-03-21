import type { KnowledgeConnector, KnowledgeEntry, ContributionResult } from './types.js';
import yaml from 'js-yaml';

export class GitHubPublicConnector implements KnowledgeConnector {
  readonly name = 'github-public';
  private repo: string;
  private branch: string;
  private rawBase: string;

  constructor() {
    this.repo = process.env.FLUENTLY_GITHUB_REPO ?? 'faical-yannick-congo/fluently';
    this.branch = process.env.FLUENTLY_GITHUB_BRANCH ?? 'main';
    this.rawBase = `https://raw.githubusercontent.com/${this.repo}/${this.branch}`;
  }

  async load(): Promise<KnowledgeEntry[]> {
    const res = await fetch(`${this.rawBase}/knowledge/index.json`);
    if (!res.ok) throw new Error(`Failed to fetch knowledge index: HTTP ${res.status}`);
    const data = await res.json() as { entries: KnowledgeEntry[] };
    return data.entries;
  }

  async contribute(cycle: unknown): Promise<ContributionResult> {
    const entry = cycle as any;
    const yamlStr = yaml.dump(cycle);
    const filename = `${entry.domain}-${entry.id}.yaml`;

    // If a token is present, could create a PR — for now return YAML + instructions
    const token = process.env.FLUENTLY_GITHUB_TOKEN;
    const prUrl = `https://github.com/${this.repo}/compare`;

    return {
      success: true,
      message: token
        ? `Cycle validated. Use the YAML below to open a PR at ${prUrl}. A future release will automate this step with your token.`
        : `Cycle validated. To contribute to the community:\n1. Fork https://github.com/${this.repo}\n2. Add the YAML below to knowledge/${filename}\n3. Open a PR at ${prUrl}`,
      url: prUrl,
      yaml: yamlStr,
    };
  }
}
