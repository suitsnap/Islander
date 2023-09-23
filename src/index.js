const {
  Client,
  GatewayIntentBits,
  Collection,
  Events,
  ActivityType,
  ChannelType,
} = require("discord.js");
const { ticketButton } = require("./events/ticketButton");
const { token, clientID, guildID, databaseToken } = require("./config.json");
const { connect } = require("mongoose");
const fs = require("fs");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const path = require("path");
var cron = require("node-cron");

const reset = "\x1b[0m";
const red = "\x1b[31m";
const green = "\x1b[32m";

const client = new Client({
  intents: [
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.cooldowns = new Collection();

const statusOptions = [
  ["Parkour Warrior: Survivor", ActivityType.Playing],
  ["To Get to the Other Side", ActivityType.Playing],
  ["Hole in the Wall", ActivityType.Playing],
  ["Battle Box", ActivityType.Playing],
  ["Sky Battle", ActivityType.Playing],
  ["Parkour Warrior: Dojo", ActivityType.Playing],
  ["play.mccisland.net", ActivityType.Playing],
  ["MCC Island Speedruns", ActivityType.Watching],
  ["Admin Streams", ActivityType.Streaming],
  ["the MCC Soundtrack", ActivityType.Listening],
  ["IW Tournaments", ActivityType.Competing],
];
let statusIndex = 0;

function updateStatus() {
  const newStatus = statusOptions[statusIndex];
  client.user.setPresence({
    activities: [{ name: newStatus[0], type: newStatus[1] }],
    status: "online",
  });
  statusIndex = (statusIndex + 1) % statusOptions.length;
}

const commands = [];
client.commands = new Collection();
const guildCommands = [];
client.guildCommands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  const commandName = command.data.name;

  client.commands.set(commandName, command);
  commands.push(command.data.toJSON());
  client.guildCommands.set(commandName, command);
  guildCommands.push(command.data.toJSON());
}

const guildCommandsPath = path.join(
  __dirname,
  "islandWarriorsSpecificCommands"
);
const guildCommandFiles = fs
  .readdirSync(guildCommandsPath)
  .filter((file) => file.endsWith(".js"));
for (const file of guildCommandFiles) {
  const guildFilePath = path.join(guildCommandsPath, file);
  const command = require(guildFilePath);

  const commandName = command.data.name;

  client.guildCommands.set(commandName, command);
  guildCommands.push(command.data.toJSON());
}

const scheduledEventsPath = path.join(__dirname, "scheduledEvents");

getCommands(scheduledEventsPath, (command) => {
  cron.schedule(command.data.interval, () => {
    command.execute(client);
  });
});

function getCommands(dir, callback) {
  const files = fs.readdirSync(dir).filter((file) => file.endsWith(".js"));

  for (const file of files) {
    const command = require(`${dir}/${file}`);
    callback(command);
  }
}

client.on("ready", () => {
  const rest = new REST({ version: "9" }).setToken(token);

  // Get all ids of the servers
  const guild_ids = client.guilds.cache.map((guild) => guild.id);

  for (const guildId of guild_ids) {
    rest
      .put(Routes.applicationGuildCommands(clientID, guildId), {
        body: commands,
      })
      .catch(console.error);
  }
  rest
    .put(Routes.applicationGuildCommands(clientID, guildID), {
      body: guildCommands,
    })
    .catch(console.error);
  updateStatus();
  setInterval(updateStatus, 5000);
  console.log(`Ready! Logged in as ${client.user.tag}`);
});

process.on("unhandledRejection", async (reason, promise) => {
  console.log(
    red + "ERROR - Unhandled Rejection" + reset,
    `Reason: ${reason}\nPromise: ${promise}`
  );
});

process.on("uncaughtException", (err) => {
  console.log(red + "ERROR - Uncaught Exception" + reset, `Error: ${err}`);
});

process.on("uncaughtExceptionMonitor", (err, origin) => {
  console.log(
    red + "ERROR - Uncaught Exception Monitor" + reset,
    `Error: ${err}\nOrigin: ${origin}`
  );
});

client.on("error", (err) => {
  console.log(red + "ERROR - Discord.js Error" + reset, `Error: ${err}`);
});

client.on("guildCreate", (guild) => {
  const rest = new REST({ version: "9" }).setToken(token);

  rest
    .put(Routes.applicationGuildCommands(clientID, guild.id), {
      body: commands,
    })
    .catch(console.error);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  let command = client.commands.get(interaction.commandName);
  if (!command) command = client.guildCommands.get(interaction.commandName);

  const { cooldowns } = client;

  if (!cooldowns.has(command.data.name)) {
    cooldowns.set(command.data.name, new Collection());
  }

  console.log(
    `Guild named: ${interaction.guild.name}, ran command named: ${command.data.name}`
  );

  const now = Date.now();
  const timestamps = cooldowns.get(command.data.name);
  const defaultCooldownDuration = 3;
  const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

  if (timestamps.has(interaction.user.id)) {
    const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

    if (now < expirationTime) {
      const expiredTimestamp = Math.round(expirationTime / 1000);
      return interaction.reply({
        content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
        ephemeral: true,
      });
    }
  }

  timestamps.set(interaction.user.id, now);
  setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

  try {
    await command.execute(interaction);
  } catch (error) {
    console.log(red + "ERROR - Discord.js Error" + reset, `Error: ${error}`);
    await interaction.reply({
      content: "There was an error executing this command",
    });
  }
});

client.on("interactionCreate", (buttonInteraction) => {
  if (buttonInteraction.isButton()) {
    if (buttonInteraction.customId === "ticket-button") {
      ticketButton(buttonInteraction);
    }
    if (buttonInteraction.customId === "close-button") {
      buttonInteraction.channel.delete();
    }
    if (buttonInteraction.customId === "ping-button") {
      buttonInteraction.reply(
        `Pinging ${buttonInteraction.guild.roles.cache
          .get("1105256862670127196")
          .toString()}! Please remember not to abuse this feature as our staff are human too!`
      );
    }
  }
});

const guildId = "1052015794395037776";
const roleId = "1086084386790850630";

client.on("guildMemberAdd", (member) => {
  if (member.guild.id === guildId) {
    const role = member.guild.roles.cache.get(roleId);
    member.roles.add(role);
  }
});

let userToVCMap = new Map();
let channelCount = 0;
const joinToCreateChannelId = "1096110594077237399";
const categoryId = "1086418807293219006";

client.on("voiceStateUpdate", async (oldState, newState) => {
  const oldStateChannel =
    oldState.guild.channels.cache.get(oldState.channelId) ?? [];
  const newStateChannel =
    newState.guild.channels.cache.get(newState.channelId) ?? [];
  const oldParent = oldStateChannel?.parentId || "Joined from none";
  const newParent = newStateChannel?.parentId || "Did not join another";
  if (
    (oldParent != categoryId && newParent != categoryId) ||
    oldStateChannel.id == "1086419539153137747" ||
    newStateChannel.id == "1086419539153137747" ||
    oldStateChannel.id == "1148651127043280917" ||
    newStateChannel.id == "1148651127043280917"
  ) {
    return;
  }
  console.log("made it");
  try {
    if (newState.channel.id === joinToCreateChannelId) {
      const guild = newState.guild;
      let vc = userToVCMap.get(newState.member.user.id);

      if (vc) {
        // User already has a temporary VC, move them to it
      } else {
        // Create new temporary VC
        vc = await createNewVC(guild);

        // Move user to new VC
        await newState.setChannel(vc);

        // Add user to VC map
        userToVCMap.set(user.id, vc);
      }
    }
  } catch (err) {}

  try {
    if (oldState.channel.id) {
      const oldChannel = oldState.guild.channels.cache.get(oldState.channel.id);

      if (oldChannel.id === userToVCMap.get(oldState.member.user.id)) {
        userToVCMap.delete(oldState.member.user.id);
      }

      if (
        oldChannel.parent.id === categoryId &&
        oldChannel.id !== joinToCreateChannelId &&
        oldChannel.members.size === 0
      ) {
        await oldChannel.delete();
        channelCount--;
      }
    }
  } catch (err) {}
});

async function createNewVC(guild) {
  channelCount++;
  const vc = await guild.channels.create({
    name: `VC ${channelCount}`,
    type: ChannelType.GuildVoice,
    parent: categoryId,
    userLimit: 10,
  });
  return vc;
}

client.login(token);
(async () => {
  await connect(databaseToken, {
    keepAlive: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  if (connect) {
    console.log("Database is running!");
  }
})();