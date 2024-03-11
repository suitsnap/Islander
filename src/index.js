const {
    Client,
    GatewayIntentBits,
    Collection,
    Events,
    ActivityType,
    ChannelType,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require("discord.js");
const {ticketButton} = require("./events/ticketButton");
const {currencyButton} = require("./events/currencyButton");
const {token, databaseToken} = require("./config.json");
const {connect} = require("mongoose");
const fs = require("fs");
const {REST} = require("@discordjs/rest");
const {Routes} = require("discord-api-types/v9");
const path = require("path");
const cron = require("node-cron");

const reset = "\x1b[0m";
const red = "\x1b[31m";
const green = "\x1b[32m";
const yellow = "\x1b[33m";
const aqua = "\x1b[36m";
const purple = "\x1b[35m";
const blue = "\x1b[34m";

const client = new Client({
    intents: [GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates,],
});

client.cooldowns = new Collection();

const statusOptions = [
    ["Battle Box", ActivityType.Playing],
    ["Dynaball", ActivityType.Playing],
    ["Hole in the Wall", ActivityType.Playing],
    ["Parkour Warrior: Dojo", ActivityType.Playing],
    ["Parkour Warrior: Survivor", ActivityType.Playing],
    ["Sky Battle", ActivityType.Playing],
    ["To Get to the Other Side", ActivityType.Playing],
    ["play.mccisland.net", ActivityType.Playing],
    ["MCC Island Speedruns", ActivityType.Watching],
    ["Admin Streams", ActivityType.Streaming, "https://twitch.tv/thenoxcrew"],
    ["the MCC Soundtrack", ActivityType.Listening],
    ["MCCI Tournaments", ActivityType.Competing],];
let statusIndex = 0;

/**
 * Updates the bot's status to the next status in the list every 5 seconds
 */
function updateStatus() {
    const newStatus = statusOptions[statusIndex];
    const activities = [{name: newStatus[0], type: newStatus[1]}];
    if (newStatus[1] === ActivityType.Streaming && newStatus[2]) {
        activities[0].url = newStatus[2];
    }
    client.user.setPresence({
        activities, status: "online",
    });
    statusIndex = (statusIndex + 1) % statusOptions.length;
}

const commands = [];
client.commands = new Collection();

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
}

const scheduledEventsPath = path.join(__dirname, "scheduledEvents");

getCommands(scheduledEventsPath, (command) => {
    cron.schedule(command.data.interval, () => {
        command.execute(client);
    });
});

/**
 * Gets all the commands in a directory
 * @param {string} dir The directory to get the commands from
 * @param {Function} callback The callback function to run on each command
 */
function getCommands(dir, callback) {
    const files = fs.readdirSync(dir).filter((file) => file.endsWith(".js"));

    for (const file of files) {
        const command = require(`${dir}/${file}`);
        callback(command);
    }
}

client.on("ready", () => {
    updateStatus();
    setInterval(updateStatus, 5000);
    console.log(`Ready! Logged in as ${client.user.tag}`);
});

process.on("unhandledRejection", async (reason, promise) => {
    console.log(red + "ERROR - Unhandled Rejection" + reset, `Reason: ${reason}\nPromise: ${promise}`);
});

process.on("uncaughtException", (err) => {
    console.log(red + "ERROR - Uncaught Exception" + reset, `Error: ${err}`);
});

process.on("uncaughtExceptionMonitor", (err, origin) => {
    console.log(red + "ERROR - Uncaught Exception Monitor" + reset, `Error: ${err}\nOrigin: ${origin}`);
});

client.on("error", (err) => {
    console.log(red + "ERROR - Discord.js Error in Index" + reset, `Error: ${err}`);
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    let command = client.commands.get(interaction.commandName);
    if (!command) command = client.guildCommands.get(interaction.commandName);

    const {cooldowns} = client;

    if (!cooldowns.has(command.data.name)) {
        cooldowns.set(command.data.name, new Collection());
    }

    //Add logging for commands. Should log the guild, command name and arguments, user and time.
    console.log(`${blue} ${new Date.toLocaleString()}- ${green}${interaction.guild.name}${reset} - ${yellow}${interaction.user.tag}${reset} - ${aqua}${interaction.commandName}${reset} - ${purple}${interaction.options.data
        .map((option) => option.name + " | " + option.value)
        .join(" - ")}${reset}`);

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
        console.log(red + "ERROR - Discord.js Error in Command" + reset, `Error: ${error}`);
        await interaction.reply({
            content: "There was an error executing this command",
        });
    }
});

client.on("interactionCreate", async (buttonInteraction) => {
    if (buttonInteraction.isButton()) {
        if (buttonInteraction.customId === "ticket-button") {
            ticketButton(buttonInteraction);
        }
        if (buttonInteraction.customId === "close-button") {
            await buttonInteraction.channel.delete();
        }
        if (buttonInteraction.customId === "ping-button") {
            buttonInteraction.reply(`Pinging ${buttonInteraction.guild.roles.cache
                .get("1105256862670127196")
                .toString()}! Please remember not to abuse this feature as our staff are human too!`);
        }
        if (buttonInteraction.customId === "currency") {
            await currencyButton(buttonInteraction);
            const disabledButton = new ButtonBuilder()
                .setCustomId("currency")
                .setLabel("View Currency")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true)
                .setEmoji({id: "1215997826216099910", name: "coin"});

            const actionRow = new ActionRowBuilder().addComponents(disabledButton);
            await buttonInteraction.message.edit({components: [actionRow]});
        }
    }
});


client.login(token);
(async () => {
    await connect(databaseToken, {
        keepAlive: true, useNewUrlParser: true, useUnifiedTopology: true,
    });
    if (connect) {
        console.log("Database is running!");
    }
})();
