#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Paths
const repoRoot = path.resolve(__dirname, '..');
const registerPath = path.join(repoRoot, 'registerCommands.js');
const readmePath = path.join(repoRoot, 'README.md');

function loadSlashCommands() {
  // eslint-disable-next-line import/no-dynamic-require, global-require
  const { commands } = require(registerPath);
  // commands should be an array of JSON command data (from SlashCommandBuilder().toJSON())
  return commands
    .map((c) => ({ name: c.name, description: c.description || '' }))
    .filter((c) => !!c.name);
}

function renderTable(rows) {
  const header = '| Command | Description |\n| --- | --- |\n';
  const body = rows.map((r) => `| \`/${r.name}\` | ${r.description} |`).join('\n');
  return header + body + '\n';
}

function updateSection(content, startMarker, endMarker, newBlock) {
  const startIdx = content.indexOf(startMarker);
  const endIdx = content.indexOf(endMarker);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    throw new Error('Markers not found or in wrong order');
  }
  const before = content.slice(0, startIdx + startMarker.length);
  const after = content.slice(endIdx);
  return `${before}\n\n${newBlock}\n${after}`;
}

function main() {
  const readme = fs.readFileSync(readmePath, 'utf8');

  // Slash commands
  const slash = loadSlashCommands();
  const slashTable = renderTable(slash);
  const updated1 = updateSection(
    readme,
    '<!-- COMMANDS_SLASH_START -->',
    '<!-- COMMANDS_SLASH_END -->',
    slashTable
  );

  // Prefix commands: keep static table here; adjust if you later want to parse from code
  const prefixTable = `| Command | Description |\n| --- | --- |\n| \`!ow\` | Roll a random Wizard of Oz character (10 rolls per hour; claim with 💖) |\n| \`!pl\` | Show the character list with pagination buttons |\n| \`!or\` | Show your roll status (rolls remaining, reset time, claims left) |\n| \`!r\` | Quick view of rolls remaining and time until next roll |\n`;

  const updated2 = updateSection(
    updated1,
    '<!-- COMMANDS_PREFIX_START -->',
    '<!-- COMMANDS_PREFIX_END -->',
    prefixTable
  );

  fs.writeFileSync(readmePath, updated2, 'utf8');
  // eslint-disable-next-line no-console
  console.log('README commands sections updated.');
}

main();
