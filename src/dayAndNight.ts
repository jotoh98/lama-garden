import Color from "color"

let fakeTime = [0, 0]

const convertMsToHM = (milliseconds: number) => {
  let seconds = Math.floor(milliseconds / 1000)
  let minutes = Math.floor(seconds / 60)
  let hours = Math.floor(minutes / 60)
  seconds = seconds % 60
  minutes = seconds >= 30 ? minutes + 1 : minutes
  minutes = minutes % 60
  hours = hours % 24

  return [hours, minutes]
}

export const updateFakeTime = () => {
  fakeTime = convertMsToHM(Date.now() * 600)
}

export const getColorWeight = () => {
  const [simulatedHours, simulatedMinutes] = fakeTime
  const dayFraction = (simulatedHours * 60 + simulatedMinutes) / 1440
  return Math.sin(dayFraction * Math.PI * 2 + Math.PI / 2) * 0.5 + 0.5
}

export const cycleDayNightColors = (day: string | Color, night: string | Color) => {
  const color = new Color(day).mix(new Color(night), getColorWeight())
  return color.hex()
}