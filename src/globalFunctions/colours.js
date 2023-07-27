const getTextColorFromBackground = (background) => {
  const bg = parseInt(background.substr(1), 16);
  const r = (bg >> 16) & 0xff;
  const g = (bg >> 8) & 0xff;
  const b = bg & 0xff;
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma > 130 ? "#000" : "#fff";
};

module.exports = { getTextColorFromBackground };
