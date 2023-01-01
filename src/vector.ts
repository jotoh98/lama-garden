export type Vector2D = {
  x: number;
  y: number;
}
export const distance = (a: Vector2D, b: Vector2D) => {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
}

export const vectorLength = (a: Vector2D) => distance(a, nullVector())
export const randomVector = (minX = 0, maxX = 100, minY = 0, maxY = 100): Vector2D => ({
  x: randomBetween(minX, maxX),
  y: randomBetween(minY, maxY)
})

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min)

const computeVectors = (op: (...a: number[]) => number, ...vectors: Vector2D[]) => {
  const x = vectors.map(x => x.x)
  const y = vectors.map(x => x.y)
  return {
    x: op(...x),
    y: op(...y)
  }
}

export const vectorDiff = (a: Vector2D, b: Vector2D): Vector2D => computeVectors((n1, n2) => n1 - n2, a, b)

export const vectorSum = (a: Vector2D, b: Vector2D) => computeVectors((n1, n2) => n1 + n2, a, b)

export const scaleVector = (a: Vector2D, scale: number) => computeVectors(n => n * scale, a)

export const normalize = (v: Vector2D) => scaleVector(v, 1 / vectorLength(v))

export const circleVector = (angle: number): Vector2D => ({
  x: Math.cos(angle),
  y: Math.sin(angle)
})

export const clampValue = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

export const clampVector = (v: Vector2D, min: Vector2D, max: Vector2D) =>
  computeVectors(clampValue, v, min, max)

export const nullVector = (): Vector2D => ({ x: 0, y: 0 })

export const windowVector = (): Vector2D => ({ x: window.innerWidth / 5, y: window.innerHeight / 5 })
export const clampVectorToScreen = (vector: Vector2D) => {
  return clampVector(vector, ({ x: 20, y: 30 }), ({ x: window.innerWidth / 5 - 20, y: window.innerHeight / 5 - 30 }))
}