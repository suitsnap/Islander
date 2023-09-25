const getTextColorFromBackground =
  require("./colours").getTextColorFromBackground;
const easeOutQuad = require("./easing").easeOutQuad;

/**
 * Create a canvas wheel
 * @param {Object} canvas The canvas object
 * @param {Object} ctx The canvas context
 * @param {Object[]} options The options for the spin wheel
 * @param {string} options[].option The option name
 * @param {string} options[].colour The option colour
 * @param {number} options[].weight The option weight
 * @param {number} endAngleDegrees The angle of the wheel
 * @param {number} totalSteps The total steps of the wheel
 * @returns {Object} The canvas wheel
 * @returns {Function} Object.rotate The rotate function
 * */
function createCanvasWheel(canvas, ctx, options, endAngleDegrees, totalSteps) {
  options = options.filter(function (option) {
    return option.votes > 0;
  });
  var colors = options.map(function (option) {
    return option.colour;
  });
  var portionSizes = options.map(function (option) {
    return option.weight;
  });
  options = options.map(function (option) {
    return option.name;
  });
  console.log(options);
  var cw = canvas.width;
  var ch = canvas.height;
  var cx = cw / 2;
  var cy = ch / 2;
  var radius = Math.min(cw, ch) / 2 - 5;
  var endAngle = (endAngleDegrees * Math.PI) / 180;
  console.log(portionSizes);

  /**
   * Easing function
   * @param {number} step The step
   * @returns {number} The easing 
   * */
  function easing(step) {
    return easeOutQuad(step, 0, endAngle, totalSteps);
  }

  /**
   * Draw the circle
   * */
  function drawCircle() {
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  /**
   * Draw the option
   * @param {number} angle The angle
   * @param {number} index The index
   * @param {string} option The option
   * @param {string} backgroundColor The background colour
   * */
  function drawOption(angle, index, option, backgroundColor) {
    var optionAngle =
      angle +
      portionSizes.slice(0, index).reduce(function (a, b) {
        return a + b;
      }, 0) *
        Math.PI *
        2;
    var textColor = getTextColorFromBackground(backgroundColor);

    //console.log(`${optionAngle}\n${angle}\n${index}\n${option}`);

    function drawPortion() {
      ctx.beginPath();
      ctx.fillStyle = backgroundColor;
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      ctx.moveTo(cx, cy);
      ctx.arc(
        cx,
        cy,
        radius,
        optionAngle,
        optionAngle + portionSizes[index] * Math.PI * 2,
        false
      );
      ctx.lineTo(cx, cy);
      ctx.fill();
      ctx.stroke();
    }

    /**
     * Draw the text
     * */
    function drawText() {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(optionAngle + (Math.PI / portionSizes[index]));

      ctx.fillStyle = textColor;
      ctx.font = "14px Montserrat";
      ctx.textBaseline = "middle";

      var textWidth = Math.min(ctx.measureText(option).width, radius);
      var centeredTextX = (radius - textWidth) / 2;

      ctx.fillText(option, centeredTextX, 0, radius);
      ctx.restore();
    }

    drawPortion();
    drawText();
  }

  /**
   * Draw the options
   * @param {number} angle The angle
   * */
  function drawOptions(angle) {
    var first = options[0],
      rest = options.slice(1).reverse();
    var orderedOptions = [first].concat(rest);

    var firstColor = colors[0],
      restColors = colors.slice(1).reverse();
    var orderedColors = [firstColor].concat(restColors);

    for (var i = 0; i < orderedOptions.length; i++) {
      var option = orderedOptions[i];
      var color = orderedColors[i];
      drawOption(angle, i, option, color);
    }
  }

  /**
   * Draw the center dot
   * */
  function drawCenterDot() {
    ctx.beginPath();
    ctx.arc(cw / 2, ch / 2, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#000";
    ctx.fill();
  }

  /**
   * Draw the arrow
   * */
  function drawArrow() {
    var initialX = cw - 5;
    var initialY = cy - 10;
    ctx.beginPath();
    ctx.moveTo(initialX, initialY);
    ctx.lineTo(initialX, initialY + 20);
    ctx.lineTo(initialX - 10, initialY + 10);
    ctx.closePath();
    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
  }

  /**
   * Draw the wheel
   * @param {number} step The step
   * */
  function draw(step) {
    var angle = easing(step);

    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.clearRect(0, 0, cw, ch);

    drawCircle();
    drawOptions(angle);
    drawCenterDot();
    drawArrow();
  }

  /**
   *  Rotate the wheel
   * @param {number} step The step
   * */
  function rotate(step) {
    draw(step);
  }

  /**
   *  Get the option by step
   * @param {number} step The step
   * @returns {Object} The option
   * @returns {string} Object.option The option
   * @returns {string} Object.color The option colour
   * */
  function getOptionByStep(step) {
    var angle = easing(step) % (Math.PI * 2); // Ensure the angle is less than a full circle
    var optionIndex = portionSizes.findIndex(function (size, index) {
      return (
        angle <
        portionSizes.slice(0, index + 1).reduce(function (a, b) {
          return a + b;
        }, 0) *
          Math.PI *
          2
      );
    });
    return {
      option: options[optionIndex],
      color: colors[optionIndex],
    };
  }

  return {
    rotate: rotate,
    getOptionByStep: getOptionByStep,
  };
}

module.exports = {
  createCanvasWheel: createCanvasWheel,
};
