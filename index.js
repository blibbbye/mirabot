import "dotenv/config";
import { Client, EmbedBuilder, Events, GatewayIntentBits } from "discord.js";
import { readFile, writeFile } from "node:fs/promises";

const TOKEN = process.env.DISCORD_TOKEN;

// Only this user account can enable/disable !dih; it always gets 98 inches.
// The Discord application ID is not a user ID and is intentionally not used here.
const DIH_CONTROL_USER_ID = "863446773326151700";
// This account receives a 1–10 millimeter result.
const DIH_MILLIMETER_USER_ID = "926417866922811392";
const DIH_SETTINGS_FILE = new URL("./dih_settings.json", import.meta.url);

if (!TOKEN) {
  throw new Error("Missing DISCORD_TOKEN. Copy .env.example to .env and add your bot token.");
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function loadDihSettings() {
  try {
    const settings = JSON.parse(await readFile(DIH_SETTINGS_FILE, "utf8"));
    return { enabled: settings?.enabled !== false };
  } catch {
    return { enabled: true };
  }
}

async function saveDihSettings(settings) {
  await writeFile(DIH_SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf8");
}

async function handleDihMessage(message) {
  if (!message.guild || message.author.bot) return;

  const content = message.content.trim().toLowerCase();

  if (
    message.author.id === DIH_CONTROL_USER_ID &&
    (content === "disable!dih" || content === "enable!dih")
  ) {
    const enabled = content === "enable!dih";
    await saveDihSettings({
      enabled,
      updatedBy: message.author.id,
      updatedAt: new Date().toISOString()
    });

    await message.reply({
      content: enabled
        ? "🟣 The !dih command is enabled again."
        : "🔒 The !dih command has been disabled.",
      allowedMentions: { repliedUser: false }
    });
    return;
  }

  if (content !== "!dih") return;

  const settings = await loadDihSettings();
  if (!settings.enabled) {
    console.log("!dih was requested, but the feature is disabled in dih_settings.json.");
    await message.reply({
      content: "🔒 !dih is currently disabled. Only the controller can turn it back on with enable!dih.",
      allowedMentions: { repliedUser: false }
    });
    return;
  }

  let size;
  let unit = "inches";

  if (message.author.id === DIH_CONTROL_USER_ID) {
    size = 98;
  } else if (message.author.id === DIH_MILLIMETER_USER_ID) {
    size = randomInt(1, 10);
    unit = "millimeters";
  } else if (Math.random() < 0.25) {
    size = randomInt(10, 20);
  } else {
    size = randomInt(1, 10);
  }

  const avatar = message.author.displayAvatarURL({ extension: "png", size: 512 });
  const displayName =
    message.member?.displayName ||
    message.author.globalName ||
    message.author.username;

  const embed = new EmbedBuilder()
    .setColor(0x7c3aed)
    .setTitle(displayName + "'s dih size")
    .setThumbnail(avatar)
    .setDescription("**" + size + " " + unit + "**\n" + "8" + "=".repeat(size) + "D");

  await message.reply({
    embeds: [embed],
    allowedMentions: { repliedUser: false }
  });
}

client.once(Events.ClientReady, readyClient => {
  console.log("✅ MiraBot is online as " + readyClient.user.tag);
  console.log("🤖 Bot user ID: " + readyClient.user.id);
  console.log("ℹ️ !dih listens for regular server messages; Message Content Intent must be enabled in the Developer Portal.");
  console.log("!dih enabled by default unless dih_settings.json says otherwise. Controller: " + DIH_CONTROL_USER_ID);
});

let emptyMessageContentWarnings = 0;

client.on(Events.MessageCreate, async message => {
  if (message.author?.bot || !message.guild) return;

  const content = typeof message.content === "string" ? message.content.trim() : "";
  const lowerContent = content.toLowerCase();

  if (content) {
    if (lowerContent === "!dih" || lowerContent === "enable!dih" || lowerContent === "disable!dih") {
      console.log("📨 DIH command received from user " + message.author.id + ": " + lowerContent);
    }
  } else if (emptyMessageContentWarnings < 3) {
    emptyMessageContentWarnings++;
    console.warn("⚠️ A server message arrived with empty content. If !dih is not triggering, check Message Content Intent on the same app as the token in .env.");
  }

  try {
    await handleDihMessage(message);
  } catch (error) {
    console.error("Message handler error:", error);
    if (lowerContent === "!dih") {
      await message.reply("I couldn't run !dih. Check the bot console for details.")
        .catch(replyError => console.error("Couldn't send error reply:", replyError.message));
    }
  }
});

client.login(TOKEN).catch(error => {
  console.error("❌ MiraBot could not log in. Check that DISCORD_TOKEN belongs to the intended bot application.", error);
});
