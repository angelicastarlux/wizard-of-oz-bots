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

### 3.1) Verify the bot is online

In your Discord server where the bot is invited:

- Use the slash command `/characters` — you should see a list of Wizard of Oz characters.
- Or use the prefix command for a roll (default prefix `!`): `!ow`
	- If it responds with a character embed, your bot is online and responding.

### 4) (Optional) Register slash commands

If you need to re-register slash commands (e.g., first run or changed command definitions):

```
node wizard-of-oz-reg-commands.js
```

## Troubleshooting

- Embed images must use absolute URLs (e.g., GitHub raw links), not local file paths.
- If you change dependencies, commit both `package.json` and `package-lock.json`.
- Use `npm ci` in CI environments for reproducible installs.

## Invite the bot to a server

Use the Discord Developer Portal to generate a safe OAuth2 invite URL:

1. Open your application in the Discord Developer Portal.
2. Go to OAuth2 → URL Generator.
3. Scopes: check `bot` and `applications.commands`.
4. Bot Permissions (minimum recommended):
	- View Channels
	- Send Messages
	- Embed Links
	- Read Message History
	- Add Reactions (optional)
	- Use External Emojis (optional)
5. Copy the generated URL and open it in your browser to invite the bot to a server where you have permissions.

URL template if you prefer manual construction:

```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot%20applications.commands&permissions=PERMISSIONS_INTEGER
```

Replace `YOUR_CLIENT_ID` with the value from your `.env` and `PERMISSIONS_INTEGER` with the value from the URL Generator.

Quick invite link (pre-filled with your client ID and minimal perms):

```
https://discord.com/api/oauth2/authorize?client_id=1430116475422904422&scope=bot%20applications.commands&permissions=84992
```

Notes:

- 84992 = View Channels (1024) + Send Messages (2048) + Embed Links (16384) + Read Message History (65536)
- You can add more permissions (e.g., Add Reactions 64, Use External Emojis 262144) if your bot needs them.

Extended invite link (adds reactions + external emojis):

```
https://discord.com/api/oauth2/authorize?client_id=1430116475422904422&scope=bot%20applications.commands&permissions=347200
```

Breakdown:

- 347200 = 84992 (minimal) + Add Reactions (64) + Use External Emojis (262144)
