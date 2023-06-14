function getPositionalNumber(number) {
  if (typeof number !== "number" || !Number.isInteger(number) || number < 0) {
    throw new Error("Invalid input. Please provide a positive integer.");
  }

  if (number === 0) {
    return "0";
  }

  const lastDigit = number % 10;
  const lastTwoDigits = number % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return number + "th";
  }

  switch (lastDigit) {
    case 1:
      return number + "st";
    case 2:
      return number + "nd";
    case 3:
      return number + "rd";
    default:
      return number + "th";
  }
}

module.exports = getPositionalNumber;
