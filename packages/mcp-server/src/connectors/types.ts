export interface KnowledgeEntry {
  id: string;
  title: string;
  domain: string;
  tags: string[];
  contributor: string;
  version: string;
  summary?: string;
  dimensions: {
    delegation: { description: string; example: string; antipattern: string };
    description: { description: string; example: string; antipattern: string };
    discernment: { description: string; example: string; antipattern: string };
    diligence: { description: string; example: string; antipattern: string };
  };
  score_hints?: {
    delegation: number;
    description: number;
    discernment: number;
    diligence: number;
  };
}

export interface ContributionResult {
  success: boolean;
  message: string;
  url?: string;
  yaml?: string;
}

export interface KnowledgeConnector {
  readonly name: string;
  load(): Promise<KnowledgeEntry[]>;
  contribute(cycle: unknown): Promise<ContributionResult>;
}
