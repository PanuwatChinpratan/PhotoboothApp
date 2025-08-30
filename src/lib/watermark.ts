export function drawWithWatermark(
  ctx: CanvasRenderingContext2D,
  text = "EVALUATION • NOT FOR COMMERCIAL USE",
) {
  const { width, height } = ctx.canvas;
  const padding = 8;
  ctx.save();
  ctx.font = "12px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.textBaseline = "bottom";
  const metrics = ctx.measureText(text);
  const x = width - metrics.width - padding;
  const y = height - padding;
  ctx.fillText(text, x, y);
  ctx.restore();
}
