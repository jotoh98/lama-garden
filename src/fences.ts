import Color from "color"
import { cycleDayNightColors } from "./dayAndNight"

const fullRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
  ctx.fillRect(x, y, w, h)
  ctx.strokeRect(x, y, w, h)
}
const fenceColor = new Color("#83530b")
const fenceColorDark = new Color("#4f3205")
export const renderFences = (ctx: CanvasRenderingContext2D) => {
  const lightCycle = cycleDayNightColors(fenceColor, fenceColor.darken(0.5))
  const darkCycle = cycleDayNightColors(fenceColorDark, fenceColorDark.darken(0.5))
  ctx.fillStyle = lightCycle
  ctx.strokeStyle = "black"
  ctx.lineWidth = 1
  const { width, height } = ctx.canvas
  const number = (width % 20) / Math.floor(width / 20)
  const number1 = (height % 20) / Math.floor(height / 20)
  fullRect(ctx, 8, 10, width - 16, 4)
  ctx.fillStyle = darkCycle
  fullRect(ctx, 8, 14, width - 16, 12)
  ctx.fillStyle = lightCycle

  fullRect(ctx, 8, height - 10, width - 16, 4)
  ctx.fillStyle = darkCycle
  fullRect(ctx, 8, height - 6, width - 16, 12)
  ctx.fillStyle = lightCycle

  for (let x = 5; x < width; x += 20 + number) {
    fullRect(ctx, x, 5, 10, 8)
    fullRect(ctx, x, 13, 10, 16)
    fullRect(ctx, x, ctx.canvas.height - 15, 10, 8)
    fullRect(ctx, x, ctx.canvas.height - 7, 10, 8)
  }

  ctx.fillRect(5, 5, 10, height - 10)
  ctx.strokeRect(5, 5, 10, height - 14)
  ctx.strokeRect(8, 5, 4, height - 14)
  ctx.fillRect(width - 15, 5, 10, height - 10)
  ctx.strokeRect(width - 15, 5, 10, height - 14)
  ctx.strokeRect(width - 13, 5, 4, height - 14)
  for (let y = 5; y < ctx.canvas.height; y += 20 + number1) {
    fullRect(ctx, 5, y, 10, 8)
    fullRect(ctx, width - 15, y, 10, 8)
  }
}