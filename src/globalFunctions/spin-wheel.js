const { createCanvas } = require("@napi-rs/canvas");
const GIFEncoder = require("gifencoder");
const { createCanvasWheel } = require("./canvas-wheel");

/**
 * Generates a spin wheel GIF.
 * @param {Object[]} options The options for the spin wheel
 * @param {string} options[].option The option name
 * @param {string} options[].colour The option colour
 * @param {number} angle The angle of the wheel
 * @param {number} duration The duration of the spin wheel
 * @param {number} frameDelayMs The delay between each frame
 * @param {number} canvasWidth The width of the canvas
 * @param {number} canvasHeight The height of the canvas
 * @param {number} lastFrameDurationMs The duration of the last frame
 * @returns {Object} The spin wheel GIF
 * @returns {Buffer} Object.getGif() The spin wheel GIF
 * @returns {Buffer} Object.getLastFrame() The last frame of the spin wheel GIF
 * @returns {string} Object.selectedOption The selected option
 * @returns {string} Object.selectedOptionColor The selected option colour
 * */
function generateSpinWheel(
  options,
  angle,
  duration,
  frameDelayMs,
  canvasWidth,
  canvasHeight,
  lastFrameDurationMs
) {
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
    getGif: function () {
      return encoder.out.getData();
    },
    getLastFrame: function () {
      return canvas.toBuffer();
    },
    selectedOption: selectedOption.option,
    selectedOptionColor: selectedOption.colour,
  };
}

module.exports = { generateSpinWheel };
