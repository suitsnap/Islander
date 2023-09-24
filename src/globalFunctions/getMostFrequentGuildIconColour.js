const axios = require("axios");
const Jimp = require("jimp");

async function getMostFrequentGuildIconColour(guild, stepSize = 1) {
  const iconURL = guild.iconURL({ extension: "png" });
  if (!iconURL) return null;

  const response = await axios.get(iconURL, { responseType: "arraybuffer" });
  const buffer = Buffer.from(response.data, "binary");
  const image = await Jimp.read(buffer);

  const pixelCounts = {};
  for (let y = 0; y < image.getHeight(); y += stepSize) {
    for (let x = 0; x < image.getWidth(); x += stepSize) {
      const { r, g, b } = Jimp.intToRGBA(image.getPixelColor(x, y));
      const colorHex = rgbToHex(r, g, b);
      pixelCounts[colorHex] = (pixelCounts[colorHex] || 0) + 1;
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
