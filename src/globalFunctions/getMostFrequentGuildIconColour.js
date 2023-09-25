const axios = require("axios");
const Jimp = require("jimp");

/**
 * Gets the most frequent colour in a guild's icon
 * @param {Guild} guild The guild to get the icon colour of
 * @param {number} [stepSize=1] The step size to use when iterating over the image
 * @returns {Promise<string>} The most frequent colour in the guild's icon
 * */
async function getMostFrequentGuildIconColour(guild, stepSize = 1) {
  const iconURL = guild.iconURL({ extension: "png" });
  if (!iconURL) return null;

  const response = await axios.get(iconURL, {
    responseType: "arraybuffer",
  });
  const buffer = Buffer.from(response.data, "binary");

  const image = await Jimp.read(buffer);
  const pixelCounts = {};

  for (let y = 0; y < image.getHeight(); y += stepSize) {
    for (let x = 0; x < image.getWidth(); x += stepSize) {
      const { r, g, b } = Jimp.intToRGBA(image.getPixelColor(x, y));
      const colorHex = rgbToHex(r, g, b);

      if (!pixelCounts[colorHex]) {
        pixelCounts[colorHex] = 0;
      }

      pixelCounts[colorHex]++;
    }
  }

  const mostFrequentColor = Object.keys(pixelCounts).reduce((a, b) =>
    pixelCounts[a] > pixelCounts[b] ? a : b
  );

  return mostFrequentColor;
}

function rgbToHex(r, g, b) {
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

module.exports = { getMostFrequentGuildIconColour };
