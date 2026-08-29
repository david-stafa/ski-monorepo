/**
 * `numberRange(70, 190, 5)` → `[70, 75, … 190]`. Spelling the length options out
 * by hand would be ~30 lines per equipment type, and the range is the thing
 * worth reading anyway.
 *
 * Each value is computed from its index rather than accumulated, so a fractional
 * step can't drift a later value off by a rounding error.
 */
export const numberRange = (from: number, to: number, step: number) => {
	const count = Math.floor((to - from) / step) + 1

	return Array.from({ length: count }, (_, index) => from + index * step)
}
