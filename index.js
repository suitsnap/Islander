const {
  Client,
  GatewayIntentBits,
  Collection,
  ButtonBuilder,
  ChannelType,
  PermissionFlagsBits,
  Activity,
  ActivityType,
} = require("discord.js");
const { ActionRowBuilder } = require("@discordjs/builders");
const { token, clientID, guildID, databaseToken } = require("./config.json");
const { connect } = require("mongoose");
const fs = require("fs");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const path = require("path");
var cron = require("node-cron");

const client = new Client({
  intents: [
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
});

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

getCommands("./ScheduledEvents", (command) => {
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
  client.user.setPresence({
    activities: [{ name: `MCC Island Open Beta!`, type: ActivityType.Playing }],
    status: "online",
  });
  console.log(`Ready! Logged in as ${client.user.tag}`);
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

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error executing this command",
    });
  }
});

client.on("interactionCreate", (buttonInteraction) => {
  if (buttonInteraction.isButton()) {
    if (buttonInteraction.customId === "ticket-button") {
      buttonInteraction.deferReply({ ephemeral: true });
      const category = buttonInteraction.client.channels.cache.get(
        "1054887073884151898"
      );
      const channelName =
        "ticket-" + buttonInteraction.user.username.toLowerCase();
      buttonInteraction.guild.channels
        .create({
          name: channelName,
          type: ChannelType.GuildText,
          parent: category,
          permissionOverwrites: [
            {
              id: buttonInteraction.guild.id,
              deny: PermissionFlagsBits.ViewChannel,
            },
            {
              id: "1105256862670127196",
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
              ],
            },
            {
              id: buttonInteraction.member,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
              ],
            },
          ],
        })
        .then((textChannel) => {
          const channelID = textChannel.id;
          buttonInteraction.followUp(
            "Ticket created! Please go to: " + `<#${channelID}>`
          );
          setTimeout(() => {
            const closeButton = new ButtonBuilder()
              .setStyle(4)
              .setLabel("\uD83D\uDD12 Close ticket")
              .setCustomId("close-button");
            const pingButton = new ButtonBuilder()
              .setStyle(2)
              .setLabel("Ping staff")
              .setEmoji("1115052247626305636")
              .setCustomId("ping-button");

            const row = new ActionRowBuilder().addComponents(
              closeButton,
              pingButton
            );
            textChannel.send({
              content: `Hi there, ${buttonInteraction.user.toString()}, welcome to your ticket! Here, staff can provide any necessary information or help! Once you are ready to close the ticket, just press the button below!`,
              components: [row],
            });
          }, 500);
        });
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

client.on("guildMemberAdd", async (member) => {
  if (member.guild.id === guildId) {
    const guild = await client.guilds.fetch(guildId);
    const role = guild.roles.cache.get(roleId);
    member.roles.add(role);
  }
});

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
