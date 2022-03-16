// cSpell:ignore incrs mults mult expa linthresh
// 🐉🐉🐉
// This is code taken from uPlot. It's used for split calculation. It's copied and modified here so that
// we can control the split generation.
// FUTURE: Use commented out code as reference when finally asked to implement non-linear scales
const M = Math;

const abs = M.abs;
const floor = M.floor;
const pow = M.pow;
const round = M.round;
const ceil = M.ceil;

function incrRoundUp(num: number, incr: number) {
  return ceil(num / incr) * incr;
}

function roundDec(val: number, theDec: number) {
  let dec = theDec;

  return round(val * (dec = 10 ** dec)) / dec;
}

function guessDec(num: number) {
  return (`${num}`.split('.')[1] || '').length;
}

const fixedDec = new Map<any, number>();

function genIncrs(base: number, minExp: number, maxExp: number, mults: number[]) {
  const incrs = [];

  const multDec = mults.map(guessDec);

  for (let exp = minExp; exp < maxExp; exp += 1) {
    const expa = abs(exp);
    const mag = roundDec(pow(base, exp), expa);

    for (let i = 0; i < mults.length; i += 1) {
      const theIncr = mults[i] * mag;
      const dec = (theIncr >= 0 && exp >= 0 ? 0 : expa) + (exp >= multDec[i] ? 0 : multDec[i]);
      const incr = roundDec(theIncr, dec);
      incrs.push(incr);
      fixedDec.set(incr, dec);
    }
  }

  return incrs;
}

const onlyWhole = (v: any) => v % 1 === 0;

const allMults = [1, 2, 2.5, 5];

// ...0.01, 0.02, 0.025, 0.05, 0.1, 0.2, 0.25, 0.5
const decIncrs = genIncrs(10, -16, 0, allMults);

// 1, 2, 2.5, 5, 10, 20, 25, 50...
const oneIncrs = genIncrs(10, 0, 16, allMults);

// 1, 2,      5, 10, 20, 25, 50...
const wholeIncrs = oneIncrs.filter(onlyWhole);

const numIncrs = decIncrs.concat(oneIncrs);

function numAxisSplits(
  theScaleMin: number,
  scaleMax: number,
  foundIncr: number,
  foundSpace: number,
  forceMin: boolean
) {
  const splits = [];

  const numDec = fixedDec.get(foundIncr) || 0;

  const scaleMin = forceMin ? theScaleMin : roundDec(incrRoundUp(theScaleMin, foundIncr), numDec);

  for (let val = scaleMin; val <= scaleMax; val = roundDec(val + foundIncr, numDec)) {
    splits.push(Object.is(val, -0) ? 0 : val); // coalesces -0
  }

  return splits;
}

// this doesn't work for sin, which needs to come off from 0 independently in pos and neg dirs
// function logAxisSplits(self, axisIdx, scaleMin, scaleMax, foundIncr, foundSpace, forceMin) {
//   const splits = [];

//   const logBase = self.scales[self.axes[axisIdx].scale].log;

//   const logFn = logBase == 10 ? log10 : log2;

//   const exp = floor(logFn(scaleMin));

//   foundIncr = pow(logBase, exp);

//   if (exp < 0) foundIncr = roundDec(foundIncr, -exp);

//   let split = scaleMin;

//   do {
//     splits.push(split);
//     split = roundDec(split + foundIncr, fixedDec.get(foundIncr));

//     if (split >= foundIncr * logBase) foundIncr = split;
//   } while (split <= scaleMax);

//   return splits;
// }

// function asinhAxisSplits(self, axisIdx, scaleMin, scaleMax, foundIncr, foundSpace, forceMin) {
//   let sc = self.scales[self.axes[axisIdx].scale];

//   let linthresh = sc.asinh;

//   let posSplits =
//     scaleMax > linthresh ? logAxisSplits(self, axisIdx, max(linthresh, scaleMin), scaleMax, foundIncr) : [linthresh];
//   let zero = scaleMax >= 0 && scaleMin <= 0 ? [0] : [];
//   let negSplits =
//     scaleMin < -linthresh ? logAxisSplits(self, axisIdx, max(linthresh, -scaleMax), -scaleMin, foundIncr) : [linthresh];

//   return negSplits
//     .reverse()
//     .map((v) => -v)
//     .concat(zero, posSplits);
// }

function defaultIncrs(scDistr: number = 1) {
  return scDistr === 2 ? wholeIncrs : numIncrs;
}

function defaultSplits(scDistr: number = 1) {
  // return scDistr == 3 ? logAxisSplits : scDistr == 4 ? asinhAxisSplits : numAxisSplits;
  return numAxisSplits;
}

// function scaleIncr() {
//   return numIncrs;
// }

function findIncr(min: number, max: number, incrs: number[], dim: number, minSpace: number) {
  const pxPerUnit = dim / (max - min);

  const minDec = `${floor(min)}`.length;

  for (let i = 0; i < incrs.length; i += 1) {
    const space = incrs[i] * pxPerUnit;

    const incrDec = incrs[i] < 10 ? fixedDec.get(incrs[i]) : 0;

    if (space >= minSpace && incrDec !== undefined && minDec + incrDec < 17) {
      return [incrs[i], space];
    }
  }

  return [0, 0];
}

export function getIncrSpace(min: number, max: number, fullDim: number, tickMinSpace: number, scDistr?: number) {
  // let axis = axes[axisIdx];

  let incrSpace;

  if (fullDim <= 0) {
    incrSpace = [0, 0];
  } else {
    // let minSpace = (axis._space = axis.space(self, axisIdx, min, max, fullDim));
    // let incrs = (axis._incrs = axis.incrs(self, axisIdx, min, max, fullDim, minSpace));
    const minSpace = tickMinSpace;
    const incrs = defaultIncrs(scDistr);
    incrSpace = findIncr(min, max, incrs, fullDim, minSpace);
  }

  return incrSpace;
}

export function getSplits(min: number, max: number, fullDim: number, tickMinSpace: number, scDistr?: number) {
  const [incr, space] = getIncrSpace(min, max, fullDim, tickMinSpace, scDistr);

  if (space === 0) {
    return;
  }

  // if we're using index positions, force first tick to match passed index
  const forceMin = scDistr === 2;

  // eslint-disable-next-line
  const splits = defaultSplits(scDistr)(min, max, incr, space, forceMin);

  // FUTURE: we'll probably need this
  // let splits = scale.distr == 2 ? _splits.map(i => data0[i]) : _splits;
  // let incr   = scale.distr == 2 ? data0[_splits[1]] - data0[_splits[0]] : _incr;

  return splits;
}
