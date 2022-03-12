export const getColor: (
  element:
    | 'ball'
    | 'end-point'
    | 'path'
    | 'control-point'
    | 'control-arm'
    | 'labels'
) => string = element =>
  getComputedStyle(document.documentElement)
    .getPropertyValue(`--belead-${element}`)
    .trim();
