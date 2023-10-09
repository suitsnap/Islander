const { REST, Routes } = require("discord.js");
const { clientID, token } = require("./config.json");
const fs = require("node:fs");
const path = require("node:path");

///Create a bunch of variables for text colouring
const reset = "\x1b[0m";
const red = "\x1b[31m";
const green = "\x1b[32m";
const aqua = "\x1b[36m";

const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ("data" in command && "execute" in command) {
    commands.push(command.data.toJSON());
    console.log(
      `${green}Loaded command named ${command.data.name} from file ${filePath}${reset}`
    );
  } else {
    console.log(
      `${red}[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.${reset}`
    );
  }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// and deploy your commands!
(async () => {
  try {
    console.log(
      `${aqua}Started refreshing ${commands.length} application (/) commands.${reset}`
    );

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(Routes.applicationCommands(clientID), {
      body: commands,
    });

    console.log(
      `${green}Successfully reloaded ${data.length} application (/) commands.${reset}`
    );
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
})();
