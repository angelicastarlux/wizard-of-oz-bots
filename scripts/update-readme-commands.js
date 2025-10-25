#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Paths
const repoRoot = path.resolve(__dirname, '..');
const registerPath = path.join(repoRoot, 'registerCommands.js');
const nonSlashPath = path.join(repoRoot, 'nonSlashCommands.js');
const configPath = path.join(repoRoot, 'config.json');
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

function loadPrefixCommands() {
  const content = fs.readFileSync(nonSlashPath, 'utf8');
  const prefix = (() => {
    try {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      const cfg = require(configPath);
      return cfg.prefix || '!';
    } catch (e) {
      return '!';
    }
  })();

  // Extract case 'xxx': occurrences in order
  const re = /case\s+["'`]([a-zA-Z0-9_-]+)["'`]\s*:/g;
  const seen = new Set();
  const names = [];
  let m;
  while ((m = re.exec(content))) {
    const name = m[1];
    if (!seen.has(name)) {
      seen.add(name);
      // Capture trailing inline comment on the same line, if present
      const lineStart = content.lastIndexOf('\n', m.index) + 1;
      const lineEnd = content.indexOf('\n', m.index);
      const line = content.slice(lineStart, lineEnd === -1 ? content.length : lineEnd);
      const commentMatch = line.match(/\/\/\s*(.+)$/);
      const inlineComment = commentMatch ? commentMatch[1].trim() : '';
      names.push({ name, inlineComment });
    }
  }

  // Descriptions for known commands
  const descMap = {
    ow: 'Roll a random Wizard of Oz character (10 rolls per hour; claim with 💖)',
    pl: 'Show the character list with pagination buttons',
    or: 'Show your roll status (rolls remaining, reset time, claims left)',
    r: 'Quick view of rolls remaining and time until next roll',
  };

  return names.map((obj) => {
    const cmd = obj.name;
    const desc = descMap[cmd] || (obj.inlineComment ? obj.inlineComment : 'Prefix command');
    return { name: `${prefix}${cmd}`, description: desc };
  });
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

  // Prefix commands: parsed from nonSlashCommands.js
  const prefixRows = loadPrefixCommands();
  const prefixHeader = '| Command | Description |\n| --- | --- |\n';
  const prefixBody = prefixRows.map((p) => `| \`${p.name}\` | ${p.description} |`).join('\n');
  const prefixTable = prefixHeader + prefixBody + '\n';

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
