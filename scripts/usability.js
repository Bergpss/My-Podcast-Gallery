#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const OUTPUT_DIR = path.join(ROOT_DIR, 'docs', 'evidence', 'usability');

function formatTimestamp(date) {
  return date.toISOString().replaceAll(':', '-');
}

async function prepareUsabilityTemplate() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const timestamp = formatTimestamp(new Date());
  const filePath = path.join(OUTPUT_DIR, `session-${timestamp}.md`);
  const content = `# Moderated Usability Session\n\n` +
    `## Scenario\n` +
    `- Goal: Evaluate first-impression clarity and navigation for the Personal Podcast Gallery.\n` +
    `- Script: Ask participants to describe what the site offers within 5 seconds, then locate a podcast of interest.\n\n` +
    `## Participants\n` +
    `- Participant 1 — Notes:\n` +
    `- Participant 2 — Notes:\n` +
    `- Participant 3 — Notes:\n\n` +
    `## Observations\n` +
    `- Strengths:\n` +
    `- Pain Points:\n\n` +
    `## Metrics\n` +
    `- 5-second recognition success rate: \n` +
    `- Task completion time (seconds): \n` +
    `- Follow-up actions:\n`;

  await writeFile(filePath, content, 'utf8');
  console.log('Usability session template ready.');
  console.log(`Document: ${path.relative(ROOT_DIR, filePath)}`);
  console.log('\nNext steps:\n- Schedule three participants.\n- Capture qualitative notes in the generated template.\n- Summarize actionable follow-ups.');
}

prepareUsabilityTemplate().catch((error) => {
  console.error('Usability session preparation failed:', error.message);
  process.exitCode = 1;
});
