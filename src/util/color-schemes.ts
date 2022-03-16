// cSpell:ignore intercolor saharatwilight
import Color from 'color-js/color';

// 🐉🐉🐉
// ColorScheme's are Primarily used by Dashboard Charts, and are listed in a dropdown menu in the Edit Chart Form.
// Additional options must also be added to `colorSchemeMessages` in `axiom` proper.
export const CHART_COLOR_SCHEME = ['Blue', 'Green', 'Orange', 'Purple', 'Red', 'Teal'] as const;
export type ChartColorScheme = typeof CHART_COLOR_SCHEME[number];

// FIXME: Remove if we're not going to do these gradient based themes.
// // if you are here to add more themes, you also need to update DashboardStore.ChartColorScheme
// // as well as QueryEditor.messages and ColorSchemeIcon.less
export const THEMES = {
  //   // provided for compatibility with the old themes
  //   ['Aubergine']: ['#8060C9', '#F57286'],
  //   ['Coral']: ['#C83346', '#F47F76'],
  //   ['Sunset']: ['#EED372', '#C96060'],
  //   [ChartColorScheme.Blue]: ['#497FAB', '#F68798'],
  ['Blue']: ['#D4EEE2', '#1070CA', '#37248F'],
  //   [ChartColorScheme.Green]: ['#FBF08E', '#497FAB'],
  //   [ChartColorScheme.Orange]: ['#FBF08E', '#DB94AD', '#497FAB'],
  // [ChartColorScheme.Purple]: ['#94C960', '#E7D535', '#E96143'],
  ['Purple']: ['#14b5d0', '#1070ca', '#735dd0'],
  // [ChartColorScheme.Red]: ['#BBE195', '#90C7F1', '#A786EF', '#F57286'],
  //   [ChartColorScheme.Teal]: ['#6540B3', '#6090C9', '#72F59F'],
  ['GreenToRed']: ['#47b881', '#f7d154', '#d9822b', '#ec4c47'],
  ['BlueToPurple']: ['#D4EEE2', '#1070CA', '#37248F'],
};

// this array is generated from src/tools/frontend-intercolor-lookup-generator.js
// it is used as a lookup table to make finding distinct colours in a gradient a lookup
// rather than a probing search
// prettier-ignore
const interColorPositionLookup = [0, 1, 0.5, 0.25, 0.75, 0.125, 0.625, 0.375, 0.875, 0.0625, 0.8125, 0.1875, 0.6875, 0.3125, 0.5625, 0.4375, 0.9375, 0.03125, 0.90625, 0.09375, 0.84375, 0.15625, 0.78125, 0.21875, 0.71875, 0.28125, 0.65625, 0.34375, 0.59375, 0.40625, 0.53125, 0.46875, 0.96875, 0.015625, 0.953125, 0.046875, 0.921875, 0.078125, 0.890625, 0.109375, 0.859375, 0.140625, 0.828125, 0.171875, 0.796875, 0.203125, 0.765625, 0.234375, 0.734375, 0.265625, 0.703125, 0.296875, 0.671875, 0.328125, 0.640625, 0.359375, 0.609375, 0.390625, 0.578125, 0.421875, 0.546875, 0.453125, 0.515625, 0.484375, 0.984375, 0.0078125, 0.9765625, 0.0234375, 0.9609375, 0.0390625, 0.9453125, 0.0546875, 0.9296875, 0.0703125, 0.9140625, 0.0859375, 0.8984375, 0.1015625, 0.8828125, 0.1171875, 0.8671875, 0.1328125, 0.8515625, 0.1484375, 0.8359375, 0.1640625, 0.8203125, 0.1796875, 0.8046875, 0.1953125, 0.7890625, 0.2109375, 0.7734375, 0.2265625, 0.7578125, 0.2421875, 0.7421875, 0.2578125, 0.7265625, 0.2734375, 0.7109375, 0.2890625, 0.6953125, 0.3046875, 0.6796875, 0.3203125, 0.6640625, 0.3359375, 0.6484375, 0.3515625, 0.6328125, 0.3671875, 0.6171875, 0.3828125, 0.6015625, 0.3984375, 0.5859375, 0.4140625, 0.5703125, 0.4296875, 0.5546875, 0.4453125, 0.5390625, 0.4609375, 0.5234375, 0.4765625, 0.5078125, 0.4921875, 0.9921875, 0.00390625, 0.98828125, 0.01171875, 0.98046875, 0.01953125, 0.97265625, 0.02734375, 0.96484375, 0.03515625, 0.95703125, 0.04296875, 0.94921875, 0.05078125, 0.94140625, 0.05859375, 0.93359375, 0.06640625, 0.92578125, 0.07421875, 0.91796875, 0.08203125, 0.91015625, 0.08984375, 0.90234375, 0.09765625, 0.89453125, 0.10546875, 0.88671875, 0.11328125, 0.87890625, 0.12109375, 0.87109375, 0.12890625, 0.86328125, 0.13671875, 0.85546875, 0.14453125, 0.84765625, 0.15234375, 0.83984375, 0.16015625, 0.83203125, 0.16796875, 0.82421875, 0.17578125, 0.81640625, 0.18359375, 0.80859375, 0.19140625, 0.80078125, 0.19921875, 0.79296875, 0.20703125, 0.78515625, 0.21484375, 0.77734375, 0.22265625, 0.76953125, 0.23046875, 0.76171875, 0.23828125, 0.75390625, 0.24609375, 0.74609375, 0.25390625, 0.73828125, 0.26171875, 0.73046875, 0.26953125, 0.72265625, 0.27734375, 0.71484375, 0.28515625, 0.70703125, 0.29296875, 0.69921875, 0.30078125, 0.69140625, 0.30859375, 0.68359375, 0.31640625, 0.67578125, 0.32421875, 0.66796875, 0.33203125, 0.66015625, 0.33984375, 0.65234375, 0.34765625, 0.64453125, 0.35546875, 0.63671875, 0.36328125, 0.62890625, 0.37109375, 0.62109375, 0.37890625, 0.61328125, 0.38671875, 0.60546875, 0.39453125, 0.59765625, 0.40234375, 0.58984375, 0.41015625, 0.58203125, 0.41796875, 0.57421875, 0.42578125, 0.56640625, 0.43359375, 0.55859375, 0.44140625, 0.55078125, 0.44921875, 0.54296875, 0.45703125, 0.53515625, 0.46484375, 0.52734375, 0.47265625, 0.51953125, 0.48046875, 0.51171875, 0.48828125, 0.50390625, 0.49609375];

// generateColor will for a given index (0, 1, 2, 3, etc...) generate a colour between
// gradStart and gradEnd - and makes it's best effort to generate colours that are as
// visually distinct from all the colours that it has already generated
// assuming that it is generating colours in ascending index order
// it generates colours based on a HSV colour wheel, so they should look
// natural rather than a linear sliding of rgb values
// this function supports up to 256 colours before it starts repeating
export function generateColorContrast(theme: string[], index: number): Color {
  return blendColors(theme, interColorPositionLookup[index % interColorPositionLookup.length]);
}

// generateColorLinear works like generateColorContrast but linearly steps
// through a theme in order to preserve gradients and not contrast too much
export function generateColorLinear(theme: string[], index: number, size: number): Color {
  // special case for charts with only one series, stops us from dividing by zero
  const segments = Math.max(1, size - 1);

  return blendColors(theme, (1.0 / segments) * index);
}

// blendColors will blend between the hex colours defined in the given theme array
// depending on the position given (0.0 -> 1.0), 0.0 will always be the first colour
// in the array. 1.0 will always be the final colour in the array
// passing in positions outside of 0->1 is undefined
function blendColors(theme: string[], pos: number): Color {
  const maxIndex = theme.length - 1;
  const segmentSize = 1.0 / maxIndex;

  // get the indexes of the two colours we are blending between
  const startIndex = Math.floor(maxIndex * pos) % theme.length;
  const endIndex = (startIndex + 1) % theme.length;

  // figure out where between these two colours we are
  const adjPos = (pos - startIndex * segmentSize) * (1.0 / segmentSize);

  const start = Color(theme[startIndex]);
  const end = Color(theme[endIndex]);

  let hueDiff = (end.getHue() % 360) - (start.getHue() % 360);
  const satDiff = end.getSaturation() - start.getSaturation();
  const valDiff = end.getLightness() - start.getLightness(); // note for any future people, do not use Color.getValue() - it's wrong on many levels.

  // the hue value is represented as 0..360 so to ensure that we always take the shortest
  // route round the colour wheel, we want to detect 'long' routes and force them the
  // other way
  if (hueDiff > 180) {
    hueDiff = 0.0 - (360 - hueDiff);
  }
  if (hueDiff < -180) {
    hueDiff = hueDiff + 360;
  }

  const newSat = start.getSaturation() + adjPos * satDiff;
  const newLight = start.getLightness() + adjPos * valDiff;

  return start
    .shiftHue(adjPos * hueDiff)
    .setLightness(newLight) // do *NOT* change the order here, saturation *must* come after lightness because color-js is super buggy and weird, changing the lightness will affect the value of any SetSaturation dramatically
    .setSaturation(newSat);
}
