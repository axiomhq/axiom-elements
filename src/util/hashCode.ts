// cSpell:ignore axitemplate
/* eslint-disable no-bitwise */

// note - if this is ever changed please update src/common/axitemplate/extensions.go to match
export function hashCode(text?: string): number {
  let hash = 0;
  let chr: number;

  if (!text || text.length === 0) {
    return hash;
  }

  for (let ii = 0; ii < text.length; ii += 1) {
    chr = text.charCodeAt(ii);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }

  return Math.abs(hash);
}
