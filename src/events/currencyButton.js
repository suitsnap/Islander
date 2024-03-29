const {EmbedBuilder, ButtonBuilder, ActionRowBuilder} = require("discord.js");
const {apiToken} = require("../config.json");
const {getUUID} = require("../util/getUUID");

/**
 * Handles the currency button interaction
 * @param {ButtonInteraction} interaction
 */
async function currencyButton(interaction) {
    const message = interaction.message;
    const embed = EmbedBuilder.from(message.embeds[0]);
    const nameOfPlayer = embed.data.title.toString().split(" ")[1].split("'")[0];
    const uuid = await getUUID(nameOfPlayer, interaction);

    const query = `
        query {
            player(uuid: "${uuid}") {
                currency {
                    coins
                    gems
                    materialDust
                    royalReputation
                    silver
                }
            }
        }
    `;

    const response = await fetch("https://api.mccisland.net/graphql", {
        method: "POST", headers: {
            "Content-Type": "application/json", Accept: "application/json", "X-API-Key": apiToken,
        }, body: JSON.stringify({query}),
    });

    const data = await response.json();

    const currency = data.data.player.currency;
    const currencyEmbed = new EmbedBuilder()
        .setTitle(`💰 ${nameOfPlayer}'s Currency 💰`)
        .addFields({
            name: "<:coin:1215997826216099910> Coins", value: formatNumber(currency.coins), inline: true,
        }, {
            name: "<:gem:1215997828548268052> Gems", value: formatNumber(currency.gems), inline: true,
        }, {
            name: "<:material_dust:1215997829978263723> Material Dust",
            value: formatNumber(currency.materialDust),
            inline: true,
        }, {
            name: "<:royal_reputation:1215997835623792691> Royal Reputation",
            value: formatNumber(currency.royalReputation),
            inline: true,
        }, {
            name: "<:silver:1215997877747449896> Silver", value: formatNumber(currency.silver), inline: true,
        })
        .setColor(0x058fd0)
        .setTimestamp();


    return interaction.reply({embeds: [currencyEmbed]});
}


function formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

module.exports = {currencyButton};
