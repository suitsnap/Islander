const { createCanvas } = require("canvas");
const GIFEncoder = require("gifencoder");
const { createCanvasWheel } = require("./canvas-wheel");

const generateSpinWheel = (
  options,
  angle,
  duration,
  frameDelayMs,
  canvasWidth,
  canvasHeight,
  lastFrameDurationMs
) => {
  const encoder = new GIFEncoder(canvasWidth, canvasHeight);
  encoder.start();
  encoder.setRepeat(-1);
  encoder.setDelay(frameDelayMs);
  encoder.setQuality(10);
  encoder.setTransparent("#fff");

  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext("2d");

  const wheel = createCanvasWheel(canvas, ctx, options, angle, duration);

  for (let i = 0; i < duration; i++) {
    wheel.rotate(i);
    encoder.addFrame(ctx);
  }

  for (let i = 0; i < lastFrameDurationMs; i++) {
    encoder.addFrame(ctx);
  }

  encoder.finish();

  const selectedOption = wheel.getOptionByStep(duration);

  return {
    getGif: () => encoder.out.getData(),
    getLastFrame: () => canvas.toBuffer(),
    selectedOption: selectedOption.option,
    selectedOptionColor: selectedOption.colour,
  };
};

module.exports = { generateSpinWheel };
