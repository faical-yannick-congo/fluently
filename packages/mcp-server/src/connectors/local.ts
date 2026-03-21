import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import type { KnowledgeConnector, KnowledgeEntry, ContributionResult } from './types.js';

export class LocalConnector implements KnowledgeConnector {
  readonly name = 'local';
  private dir: string;

  constructor() {
    this.dir = process.env.FLUENTLY_LOCAL_PATH ?? path.join(process.cwd(), 'knowledge');
  }

  async load(): Promise<KnowledgeEntry[]> {
    const indexPath = path.join(this.dir, 'index.json');
    if (fs.existsSync(indexPath)) {
      const data = JSON.parse(fs.readFileSync(indexPath, 'utf8')) as { entries: KnowledgeEntry[] };
      return data.entries;
    }
    // Fall back to reading individual YAML files
    const files = fs.readdirSync(this.dir).filter(f => f.endsWith('.yaml') && f !== 'index.yaml');
    return files.map(file => yaml.load(fs.readFileSync(path.join(this.dir, file), 'utf8')) as KnowledgeEntry);
  }

  async contribute(cycle: unknown): Promise<ContributionResult> {
    const entry = cycle as any;
    const filename = `${entry.domain}-${entry.id}.yaml`;
    const filePath = path.join(this.dir, filename);
    const yamlStr = yaml.dump(cycle);
    fs.writeFileSync(filePath, yamlStr, 'utf8');
    return {
      success: true,
      message: `Cycle written to ${filePath}. Commit and push to share with your team.`,
      url: filePath,
      yaml: yamlStr,
    };
  }
}
