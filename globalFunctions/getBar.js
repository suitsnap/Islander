function getBar(percentage) {
  let bar = "[";
  if (percentage === 0) {
    bar += "░░░░░░░░░░";
  } else if (percentage % 10 === 0) {
    bar += "▓".repeat(percentage / 10);
    bar += "░".repeat(10 - percentage / 10);
  } else {
    bar += "▓".repeat(Math.floor(percentage / 10));
    bar += "▒";
    bar += "░".repeat(9 - Math.floor(percentage / 10));
  }
  bar += "]";
  return bar;
}

module.exports = { getBar };
