const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
} = require("@discordjs/builders");
const { ButtonStyle } = require("discord.js");

const { apiToken } = require("../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("inspect_player")
    .setDescription("Inspects a player.")
    .addStringOption((option) =>
      option
        .setName("username")
        .setDescription("The username of the player to inspect.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const username = interaction.options.getString("username");
    const uuid = await getUUID(username, interaction);

    const query = `
            query {
                player(uuid: "${uuid}") {
                    username
                    firstJoin
                    lastJoin
                    ranks
                    status {
                        online
                        server {
                            associatedGame
                            category
                            id
                            subType
                        }
                    }
                    party {
                        active
                        leader {
                            username
                        }
                        members {
                            username
                            uuid
                            ranks
                        }
                    }
                    friends {
                        username
                    }
                }
            }
        `;

    const response = await fetch("https://api.mccisland.net/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-API-Key": apiToken,
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();

    if (data.errors) {
      const errorEmbed = new EmbedBuilder()
        .setTitle("Player has no data")
        .setThumbnail(`https://mc-heads.net/avatar/${uuid}/128.png`)
        .setDescription(
          `The username \`${username}\` has no data. This could be due to the player not having joined the server, or an error with the API.`
        )
        .setColor(0x058fd0);

      return await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    const joinedTimestamp = convertToUnixTimestamp(data.data.player.firstJoin);
    const lastOnlineTimestamp = convertToUnixTimestamp(
      data.data.player.lastJoin
    );

    const displayedRank = getDisplayedRank(data.data.player.ranks);

    const isOnline = data.data.player.status.online;
    const isPartied = data.data.player.party.active;

    const playerEmbed = new EmbedBuilder()
      .setColor(isOnline ? (isPartied ? 0xaff7ff : 0x77dd77) : 0xff6961)
      .setTitle(`${displayedRank} ${data.data.player.username}'s Profile`)
      .setThumbnail(`https://mc-heads.net/avatar/${uuid}/128.png`)
      .addFields(
        {
          name: "First Joined:  ",
          value: `<t:${joinedTimestamp}:F>`,
          inline: true,
        },
        {
          name: "Last Joined: ",
          value: `<t:${lastOnlineTimestamp}:R>`,
          inline: true,
        },
        {
          name: "Status: ",
          value: isOnline ? "Online" : "Offline",
          inline: true,
        },
        {
          name: "Friends: ",
          value:
            data.data.player.friends.length > 0
              ? data.data.player.friends.length.toString()
              : "None",
          inline: true,
        }
      );

    const currencyButton = new ButtonBuilder()
      .setCustomId("currency")
      .setLabel("View Currency")
      .setStyle(ButtonStyle.Primary)
      .setEmoji({ id: "1215997826216099910", name: "coin" });

    const actionRow = new ActionRowBuilder().addComponents(currencyButton);

    if (isOnline && data.data.player.status.server.associatedGame) {
      let currentGame = allCapsToTitleCase(
        data.data.player.status.server.associatedGame
      );
      if (currentGame.includes("Parkour")) {
        const subType = data.data.player.status.server.subType;
        const parkourType = subType.includes("survival") ? "Survivor" : "Dojo";
        currentGame += ` - ${parkourType}`;
      }
      playerEmbed.addFields({
        name: "Playing: ",
        value: currentGame,
        inline: true,
      });
    }

    if (!isPartied)
      return interaction.reply({
        embeds: [playerEmbed],
        components: [actionRow],
      });

    if (isPartied) {
      const usersInParty = data.data.player.party.members.map((member) => ({
        username: member.username,
        ranks: member.ranks,
      }));
      const partyLeader = data.data.player.party.leader.username;
      const partyArray = [];
      for (let member of usersInParty) {
        let memberDisplayRank = getDisplayedRank(member.ranks);
        if (member.username === partyLeader) {
          partyArray.push(`${memberDisplayRank} **${member.username}**`);
          continue;
        }
        partyArray.push(`${memberDisplayRank} ${member.username}`);
      }
      partyArray.sort((a, b) => {
        if (a.includes(partyLeader)) return -1;
        if (b.includes(partyLeader)) return 1;
        return 0;
      });
      playerEmbed.addFields({
        name: "Party Members: ",
        value: partyArray.join("\n"),
        inline: false,
      });
      interaction.reply({ embeds: [playerEmbed], components: [actionRow] });
    }
  },
};

async function getUUID(username, interaction) {
  const apiUrl = `https://api.mojang.com/users/profiles/minecraft/${username}`;
  const response = await fetch(apiUrl);
  const data = await response.json();
  if (data.errorMessage) {
    const unknownEmbed = new EmbedBuilder()
      .setTitle("Unknown Minecraft account")
      .setThumbnail(`https://cdn.suitsnap.tech/assets/questionLarge.png`)
      .setDescription(`The username \`${username}\` does not exist.`)
      .setColor(0x058fd0);

    return await interaction.reply({ embeds: [unknownEmbed], ephemeral: true });
  }
  const undashedUUID = data.id;
  const formatUUID = (uuid) =>
    uuid.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");
  const dashedUUID = formatUUID(undashedUUID);
  return dashedUUID;
}

function convertToUnixTimestamp(isoTimestamp) {
  return Math.floor(new Date(isoTimestamp).getTime() / 1000);
}

function allCapsToTitleCase(str) {
  return str
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getDisplayedRank(ranks) {
  let displayedRank = "";
  const rankDisplayMap = {
    NOXCREW: "<:noxcrew:1215850277693816913>",
    MODERATOR: "<:mod_shield:1215850276611821649>",
    CONTESTANT: "<:contestant:1215997827482910831>",
    CREATOR: "<:creator:1215997839495266395>",
    GRAND_CHAMP_ROYALE: "<:grand_champ_royale:1215997834097328138>",
    GRAND_CHAMP: "<:grand_champ:1215997832360755251>",
    CHAMP: "<:champ:1215997831068913794>",
  };

  for (let rank in rankDisplayMap) {
    if (ranks.includes(rank)) {
      displayedRank = rankDisplayMap[rank];
      break;
    }
  }
  if (displayedRank == "") {
    displayedRank = "<:none:1215997824416878602>";
  }
  return displayedRank;
}
