const { getTextColorFromBackground } = require("./colours");
const { easeOutQuad } = require("./easing");

const styles = {
  circle: {
    margin: 5,
    fillColor: "#fff",
    strokeColor: "#000",
    strokeWidth: 2,
  },
  options: {
    font: "14px Montserrat",
    textBaseline: "middle",
    portionStrokeColor: "#000",
    portionStrokeWidth: 1,
  },
  centerDot: {
    fillColor: "#000",
    radius: 5,
  },
  arrow: {
    height: 20,
    width: 10,
    fillColor: "#fff",
    strokeColor: "#000",
    strokeWidth: 2,
  },
};

const createCanvasWheel = (
  canvas,
  ctx,
  options,
  endAngleDegrees,
  totalSteps
) => {
  options = options.filter((option) => option.votes > 0);
  const colors = options.map((option) => option.colour);
  let portionSizes = options.map((option) => option.weight);
  options = options.map((option) => option.name);
  console.log(options);
  const cw = canvas.width;
  const ch = canvas.height;
  const cx = cw / 2;
  const cy = ch / 2;
  const radius = Math.min(cw, ch) / 2 - styles.circle.margin;
  const endAngle = (endAngleDegrees * Math.PI) / 180;
  console.log(portionSizes);

  const easing = (step) => easeOutQuad(step, 0, endAngle, totalSteps);

  const drawCicle = () => {
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = styles.circle.fillColor;
    ctx.strokeStyle = styles.circle.strokeColor;
    ctx.lineWidth = styles.circle.strokeWidth;
    ctx.fill();
    ctx.stroke();

    ctx.setTransform(1, 0, 0, 1, 0, 0);
  };

  const drawOption = (angle, index, option, backgroundColor) => {
    const optionAngle =
      angle +
      portionSizes.slice(0, index).reduce((a, b) => a + b, 0) * Math.PI * 2;
    const textColor = getTextColorFromBackground(backgroundColor);

    //console.log(`${optionAngle}\n${angle}\n${index}\n${option}`);

    const drawPortion = () => {
      ctx.beginPath();
      ctx.fillStyle = backgroundColor;
      ctx.strokeStyle = styles.options.portionStrokeColor;
      ctx.lineWidth = styles.options.portionStrokeWidth;
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
    };

    const drawText = () => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(optionAngle);
      ctx.fillStyle = textColor;
      ctx.font = styles.options.font;
      ctx.textBaseline = styles.options.textBaseline;

      const textWidth = Math.min(ctx.measureText(option).width, radius);
      const centeredTextX = (radius - textWidth) / 2;

      ctx.fillText(option, centeredTextX, 0, radius);
      ctx.restore();
    };

    drawPortion();
    drawText();
  };

  const drawOptions = (angle) => {
    const [first, ...rest] = options;
    const orderedOptions = [first, ...rest.reverse()];

    const [firstColor, ...restColors] = colors;
    const orderedColors = [firstColor, ...restColors.reverse()];

    for (let i = 0; i < orderedOptions.length; i++) {
      const option = orderedOptions[i];
      const color = orderedColors[i];
      drawOption(angle, i, option, color);
    }
  };

  const drawCenterDot = () => {
    ctx.beginPath();
    ctx.arc(cw / 2, ch / 2, styles.centerDot.radius, 0, Math.PI * 2);
    ctx.fillStyle = styles.centerDot.fillColor;
    ctx.fill();
  };

  const drawArrow = () => {
    const initialX = cw - styles.circle.margin;
    const initialY = cy - styles.arrow.width;
    ctx.beginPath();
    ctx.moveTo(initialX, initialY);
    ctx.lineTo(initialX, initialY + styles.arrow.width * 2);
    ctx.lineTo(initialX - styles.arrow.height, initialY + styles.arrow.width);
    ctx.closePath();
    ctx.fillStyle = styles.arrow.fillColor;
    ctx.strokeStyle = styles.arrow.strokeColor;
    ctx.lineWidth = styles.arrow.strokeWidth;
    ctx.fill();
    ctx.stroke();
  };

  const draw = (step) => {
    const angle = easing(step);

    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.clearRect(0, 0, cw, ch);

    drawCicle();
    drawOptions(angle);
    drawCenterDot();
    drawArrow();
  };

  const rotate = (step) => {
    draw(step);
  };

  const getOptionByStep = (step) => {
    const angle = easing(step) % (Math.PI * 2); // Ensure the angle is less than a full circle
    const optionIndex = portionSizes.findIndex((size, index) => angle < portionSizes.slice(0, index + 1).reduce((a, b) => a + b, 0) * Math.PI * 2);
    return {
      option: options[optionIndex],
      color: colors[optionIndex],
    };
  };

  return {
    rotate,
    getOptionByStep,
  };
};

module.exports = { createCanvasWheel };
