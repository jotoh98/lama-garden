import { randomVector, Vector2D } from "./vector"
import { allGameObjects, IS_DEV } from "./game"
import Color from "color"
import { cycleDayNightColors } from "./dayAndNight"

export type Grass = {
  type: "GRASS"
  position: Vector2D;
  amount: number;
  collisionShape: Path2D
}

export const randomGrass = (): Grass => ({
  type: "GRASS",
  position: randomVector(20, window.innerWidth / 5 - 20, 30, window.innerHeight / 5 - 20),
  amount: 1,
  collisionShape: GRASS_ICON_FULL
})


export const updateGrass = (grass: Grass, _frame: number, delta: number) => {
  if (grass.amount < 0) {
    const index = allGameObjects.findIndex(x => x === grass)
    if (index >= 0) {
      allGameObjects.splice(index, 1)
    }
  }
  if (grass.amount < 1) {
    grass.amount += delta / 10
    grass.amount = Math.min(1, grass.amount)
  }
}

export const renderGrass = (ctx: CanvasRenderingContext2D, grass: Grass) => {

  ctx.transform(5, 0, 0, 5, 5 * grass.position.x, 5 * grass.position.y)
  renderGrassIcon(ctx, grass)
  ctx.resetTransform()

  if (IS_DEV) {
    ctx.transform(1, 0, 0, 1, 5 * grass.position.x, 5 * grass.position.y)
    ctx.font = "15px Arial"
    ctx.fillText(grass.amount.toFixed(2), 25, 0)
    ctx.resetTransform()
  }
}

const GRASS_ICON_FULL = new Path2D(`M-2 -1L-2, 0L-1, 0L-1, 1L3, 1L3, 0L4, 0L4, -2L3, -2L3, 0L2, 0L2, -1L1, -1L1, -2L0, -2L0, 0L-1, 0L-1, -1L-2, -1`)
const grassColor = new Color("#0d7e0d")
export const renderGrassIcon = (ctx: CanvasRenderingContext2D, grass: Grass) => {
  const { amount } = grass
  if (amount < 0) return

  ctx.fillStyle = cycleDayNightColors(grassColor, grassColor.darken(0.5))
  ctx.fill(GRASS_ICON_FULL)

  ctx.lineWidth = 0.2
  ctx.strokeStyle = "#000"
  ctx.stroke(GRASS_ICON_FULL)
}