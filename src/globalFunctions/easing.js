const easeOutQuad = (t, b, c, d) => {
  t = t / d - 1;
  return -c * (t * t * t * t - 1) + b;
};

module.exports = { easeOutQuad };
