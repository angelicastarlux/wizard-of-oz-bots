# wizard-of-oz-bots

Main bot for my "Wizard of Oz" waifus bot.

## Quick start

Prerequisites:

- Node.js 18+ (LTS recommended)
- npm (comes with Node)

### 1) Configure environment

Create a `.env` file (you can copy from `.env.example`) and fill in:

```
DISCORD_TOKEN=your-bot-token
CLIENT_ID=your-application-client-id
BOT_PREFIX=!  # optional, defaults to '!'
MONGO_URL=your-mongodb-connection-string
```

Notes:

- `DISCORD_TOKEN` comes from the Discord Developer Portal (Bot tab).
- `CLIENT_ID` is your application ID (General Information page).
- `MONGO_URL` should be a valid MongoDB URI if you want persistence.

### 2) Install dependencies (lockfile-respecting)

```
npm ci
```

Why `npm ci`? It installs strictly from `package-lock.json` for reproducible builds and faster CI.

### 3) Run the bot

```
npm start
```

This runs `node wizard-of-oz.js`.

### 4) (Optional) Register slash commands

If you need to re-register slash commands (e.g., first run or changed command definitions):

```
node wizard-of-oz-reg-commands.js
```

## Troubleshooting

- Embed images must use absolute URLs (e.g., GitHub raw links), not local file paths.
- If you change dependencies, commit both `package.json` and `package-lock.json`.
- Use `npm ci` in CI environments for reproducible installs.
