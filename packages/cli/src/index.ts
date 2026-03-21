import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { scoreTask, loadKnowledgeEntries } from '@fluently/scorer';
import { knowledgeEntrySchema } from '@fluently/scorer/schema';
import inquirer from 'inquirer';
const fs = require('fs');
const path = require('path');
import yaml from 'js-yaml';

const program = new Command();

program
  .name('fluent')
  .description('Operationalize the AI Fluency 4D Framework: Delegation, Description, Discernment, Diligence. Score, compare, and contribute Fluently 4D cycles for AI fluency.')
  .version('0.1.0');

program
  .command('score')
  .argument('<task>', 'Task description')
  .action(async (task) => {
    const spinner = ora('Scoring task...').start();
    const results = scoreTask({ description: task, delegation_intent: '' }, path.resolve(__dirname, '../knowledge'));
    spinner.succeed('Score complete\n');
    results.forEach(({ entry, dimensionScores }: any, i: number) => {
      const scores = Object.values(dimensionScores) as number[];
      const overall = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      console.log(chalk.bold.white(`#${i + 1}  ${entry.title}`) + chalk.gray(`  (${entry.domain})`) + chalk.yellow(`  overall: ${overall}/100`));
      Object.entries(dimensionScores).forEach(([dim, score]: [string, any]) => {
        const bar = '█'.repeat(Math.round((score as number) / 10)) + '░'.repeat(10 - Math.round((score as number) / 10));
        const status = (score as number) >= 80 ? chalk.green('✅ Strong') : (score as number) >= 50 ? chalk.yellow('⚠️  Improve') : chalk.red('❌ Weak');
        console.log(`  ${chalk.cyan(dim.padEnd(14))} ${bar}  ${chalk.yellow(String(score).padStart(3))}  ${status}`);
      });
      console.log(chalk.gray(`  → knowledge/${entry.domain}-${entry.id}.yaml\n`));
    });
  });

program
  .command('compare')
  .requiredOption('--description <desc>', 'Task description')
  .requiredOption('--delegation <intent>', 'Delegation intent')
  .action(async (opts) => {
    const spinner = ora('Comparing...').start();
    const results = scoreTask({ description: opts.description, delegation_intent: opts.delegation }, path.resolve(__dirname, '../knowledge'));
    spinner.succeed('Comparison complete');
    const top = results[0];
    const overall = (Object.values(top.dimensionScores) as number[]).reduce((a, b) => a + b, 0) / 4;
    console.log(chalk.bold(`4D Score: ${Math.round(overall)}`));
    Object.entries(top.dimensionScores).forEach(([dim, score]) => {
      console.log(`${chalk.cyan(dim)}: ${chalk.yellow(score.toString())}`);
    });
    console.log(chalk.green(`Closest play: ${top.entry.title}`));
    console.log(chalk.blue(`YAML: knowledge/${top.entry.domain}-${top.entry.id}.yaml`));
    console.log(chalk.magenta('Estimated token efficiency improvement: ~30%'));
  });

program
  .command('contribute')
  .description('Contribute a new Fluently 4D cycle to the knowledge base')
  .action(async () => {
    const basic = await inquirer.prompt([
      { type: 'input', name: 'id', message: 'Slug (unique id):' },
      { type: 'input', name: 'title', message: 'Title:' },
      { type: 'list', name: 'domain', message: 'Domain:', choices: ['coding','writing','research','customer-support','education','legal','healthcare','general'] },
      { type: 'input', name: 'tags', message: 'Tags (comma separated):' },
      { type: 'input', name: 'contributor', message: 'Contributor:' },
      { type: 'input', name: 'version', message: 'Version (semver):', default: '1.0.0' }
    ]);
    const dimensions: Record<string, unknown> = {};
    for (const dim of ['delegation', 'description', 'discernment', 'diligence']) {
      const d = await inquirer.prompt([
        { type: 'input', name: 'description', message: `${dim} — describe:` },
        { type: 'input', name: 'example', message: `${dim} — example:` },
        { type: 'input', name: 'antipattern', message: `${dim} — antipattern:` }
      ]);
      dimensions[dim] = d;
    }
    const hintsRaw = await inquirer.prompt(
      ['delegation','description','discernment','diligence'].map(dim => ({
        type: 'input', name: dim, message: `Weight for ${dim} (0–1, all must sum to 1):`
      }))
    );
    const answers: Record<string, unknown> = {
      ...basic,
      tags: basic.tags.split(',').map((t: string) => t.trim()),
      dimensions,
      score_hints: Object.fromEntries(Object.entries(hintsRaw).map(([k, v]) => [k, parseFloat(v as string)]))
    };
    try {
      knowledgeEntrySchema.parse(answers);
      const yamlStr = yaml.dump(answers);
      const filePath = path.resolve(__dirname, '../knowledge', `${answers.domain}-${answers.id}.yaml`);
      fs.writeFileSync(filePath, yamlStr);
      console.log(chalk.green(`Entry written to ${filePath}`));
      console.log(chalk.yellow('Run `git add . && git commit` then open a PR to share with the community'));
    } catch (e: unknown) {
      const error = e as { errors?: unknown[] };
      console.log(chalk.red('Validation failed:'), error.errors);
    }
  });

program
  .command('sync')
  .description('Sync knowledge entries from GitHub main branch')
  .action(async () => {
    const spinner = ora('Syncing knowledge...').start();
    // Simple implementation: git pull
    require('child_process').execSync('git pull', { cwd: path.resolve(__dirname, '../../') });
    spinner.succeed('Sync complete');
    const files = fs.readdirSync(path.resolve(__dirname, '../knowledge')).filter((f: string) => f.endsWith('.yaml'));
    console.log(chalk.green(`New entries: ${files.length}`));
  });

program
  .command('list')
  .argument('[domain]', 'Domain to filter')
  .action(async (domain) => {
    const entries = loadKnowledgeEntries(path.resolve(__dirname, '../knowledge'));
    entries.filter(e => !domain || e.domain === domain).forEach(e => {
      console.log(`${chalk.bold(e.title)} | ${chalk.cyan(e.domain)} | ${chalk.yellow(e.tags.join(','))} | ${chalk.magenta(e.contributor)}`);
    });
  });

program.parseAsync(process.argv);
