const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("tournament_commands")
    .setDescription(
      "A group of commands relating to general tournament management."
    )
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("substitute")
        .setDescription(
          "Gives a player the tournament roles another player has."
        )
        .addUserOption((option) =>
          option
            .setName("original_player")
            .setDescription("The user who is subbing out.")
            .setRequired(true)
        )
        .addUserOption((option) =>
          option
            .setName("new_player")
            .setDescription("The user who is subbing in.")
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("tournament_role")
            .setDescription(
              "The tournament role that you wish to swap e.g. Team"
            )
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("extra_tournament_role")
            .setDescription(
              "Another tournament role that you wish to swap e.g. Participant"
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("team_role_give")
        .setDescription("Gives 4 members tournament role(s)")
        .addUserOption((option) =>
          option
            .setName("player_one")
            .setDescription("The X user to obtain the tournament roles(s)")
            .setRequired(true)
        )
        .addUserOption((option) =>
          option
            .setName("player_two")
            .setDescription("The X user to obtain the tournament roles(s)")
            .setRequired(true)
        )
        .addUserOption((option) =>
          option
            .setName("player_three")
            .setDescription("The X user to obtain the tournament roles(s)")
            .setRequired(true)
        )
        .addUserOption((option) =>
          option
            .setName("player_four")
            .setDescription("The X user to obtain the tournament roles(s)")
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("tournament_role")
            .setDescription(
              "The tournament role that you wish to swap e.g. Team"
            )
            .setRequired(true)
        )
        .addRoleOption((option) =>
          option
            .setName("extra_tournament_role")
            .setDescription(
              "Another tournament role that you wish to swap e.g. Participant"
            )
        )
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    switch (subcommand) {
      case "substitute":
        const originalPlayer = interaction.options.getUser("original_player");
        const newPlayer = interaction.options.getUser("new_player");
        const tournamentRoleForSubstitute =
          interaction.options.getRole("tournament_role");
        const extraTournamentRoleForSubstitute = interaction.options.getRole(
          "extra_tournament_role"
        );

        const guild = interaction.guild;
        const originalMember = await guild.members.fetch(originalPlayer.id);
        const newMember = await guild.members.fetch(newPlayer.id);

        if (!originalMember.roles.cache.has(tournamentRoleForSubstitute.id)) {
          return await interaction.reply(
            `Original user does not have Role: ${tournamentRoleForSubstitute.name}`
          );
        }

        await originalMember.roles.remove(tournamentRoleForSubstitute);
        await newMember.roles.add(tournamentRoleForSubstitute);

        let messageContent = `Removed Role: ${tournamentRoleForSubstitute.name} from ${originalMember.displayName}\nAdded Role: ${tournamentRoleForSubstitute.name} to ${newMember.displayName}\n`;

        if (extraTournamentRoleForSubstitute) {
          if (
            !originalMember.roles.cache.has(extraTournamentRoleForSubstitute.id)
          ) {
            return await interaction.reply(
              `Original user does not have Role: ${extraTournamentRoleForSubstitute.name}`
            );
          }
          await originalMember.roles.remove(extraTournamentRoleForSubstitute);
          await newMember.roles.add(extraTournamentRoleForSubstitute);
          messageContent += `Also removed Role - ${extraTournamentRoleForSubstitute.name} from ${originalMember.displayName}\nAdded Role - ${extraTournamentRoleForSubstitute.name} to ${newMember.displayName}`;
        }

        await interaction.reply(messageContent);

        break;
      case "team_role_give":
        const tournamentRoleForTeam =
          interaction.options.getRole("tournament_role");
        const extraTournamentRoleForTeam = interaction.options.getRole(
          "extra_tournament_role"
        );

        const userArray = [
          interaction.options.getUser("player_one"),
          interaction.options.getUser("player_two"),
          interaction.options.getUser("player_three"),
          interaction.options.getUser("player_four"),
        ];
        let messageForBase = `Added Role -  ${tournamentRoleForTeam.name} to Members:\n`;
        let messageForExtra = extraTournamentRoleForTeam ? `Also added Role - ${
          extraTournamentRoleForTeam?.name } to Members:\n` : ""
        for (const user of userArray) {
          const member = await interaction.guild.members.fetch(user.id);
          await member.roles.add(tournamentRoleForTeam);
          messageForBase += `${member.displayName}\n`;
          if (extraTournamentRoleForTeam) {
            await member.roles.add(extraTournamentRoleForTeam);
            messageForExtra += `${member.displayName}\n`;
          }
        }
        const finalMessage = messageForBase + messageForExtra;
        //Why do I have this if statement here? The string would only be affected with the extras if it's entered. Useless. TODO: Refactor.
        if (extraTournamentRoleForTeam) {
          await interaction.reply({ content: finalMessage });
        } else {
          await interaction.reply({ content: messageForBase });
        }

        break;
    }
  },
};
