import marketplace from "./marketplace"
import primitives from "./primitives"

const convertToCamelCase = (obj: Record<string, any>) => {
  return JSON.parse(
    JSON.stringify(obj)
      .split("_")
      .map((x, i) => (i === 0 ? x : x.charAt(0).toUpperCase() + x.slice(1)))
      .join("")
      .replace(/Enum/g, "_enum"),
  )
}

export const types = [marketplace, primitives].flat()

export const typesBundle = {
  spec: {
    ternoa: {
      types,
    },
  },
}

export default {
  types: types
    .map(convertToCamelCase)
    .map(({ types }) => types)
    .reduce((all, types) => Object.assign(all, types)),
}
