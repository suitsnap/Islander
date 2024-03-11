/**
 * Get the text colour that would be most visible on a given background colour
 * @param {string} background The background colour in hex format
 * @returns {string} The text colour in hex format
 */
const getTextColorFromBackground = (background) => {
    const [r, g, b] = background.slice(1).match(/.{2}/g).map((c) => parseInt(c, 16));
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luma > 130 ? "#000" : "#fff";
};

module.exports = {getTextColorFromBackground};