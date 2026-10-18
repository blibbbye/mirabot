# MiraBot — local Discord bot

This repository contains a small Discord bot with the screenshot-style `!dih` joke command.

## Command behavior

- `!dih`: usually gives 1–10 inches. There is a 25% chance of 10–20 inches instead.
- Discord user ID `863446773326151700`: gets exactly 98 inches every time and is the only user allowed to turn the command off or on. (The ID `1561402004947865621` is the application ID, not a user ID.)
- Discord user ID `926417866922811392`: gets 1–10 millimeters.
- The embed shows the sender's display name, profile picture, result, and an `8===D` line with one equals sign per number in the result.
- `disable!dih`: disables the command for everyone. Controller only.
- `enable!dih`: enables the command again. Controller only.
- The enabled state is written to `dih_settings.json` and persists across normal restarts while the file is kept.

## Run on Windows

1. Install Node.js from https://nodejs.org/ (choose the recommended LTS version).
2. Download this repository using GitHub's **Code → Download ZIP**, then extract the ZIP into a folder.
3. In the extracted folder, copy `.env.example` and rename the copy to `.env`.
4. Open `.env` with Notepad and replace the placeholder with your bot token:
   `DISCORD_TOKEN=your_real_bot_token_here`
5. In the Discord Developer Portal (https://discord.com/developers/applications), select your bot, open **Bot**, and enable **Message Content Intent** under **Privileged Gateway Intents**. Save the setting.
6. Invite the bot to your server with the `bot` scope and permissions to **View Channels**, **Send Messages**, and **Embed Links**.
7. Double-click `start.bat`. On the first run it installs the dependencies automatically. Keep the black terminal window open while you want the bot online.

You can also open Command Prompt in this folder and run:

```bat
npm install
npm start
```

## Important

- The bot runs only while your computer is on, connected to the internet, and the terminal window is running. Prevent the computer from sleeping while you want the bot online.
- Keep the bot token private. Never post it in chat, screenshots, or GitHub.
- If the bot says it is online but ignores `!dih`, make sure **Message Content Intent** is enabled in both the Developer Portal and the code (the code already requests it).
- This is a standalone starter bot because the repository was empty when it was set up; it does not include any other MiraBot features.
