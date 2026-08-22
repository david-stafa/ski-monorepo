import { Level } from '@ski-blazek/db/browser'

/**
 * Single source of truth for how a skill level is shown. The suffix after the
 * dash is the shop's own shorthand (L / A / S) that staff write on the sheet.
 *
 * Typed as `Record<Level, string>` so adding a level to the Prisma enum is a
 * compile error until it is labelled here.
 */
export const LEVEL_LABELS: Record<Level, string> = {
  [Level.BEGINNER]: 'Začátečník - L',
  [Level.BEGINNER_INTERMEDIATE]: 'Lepší začátečník - L/A',
  [Level.INTERMEDIATE]: 'Pokročilý - L',
  [Level.INTERMEDIATE_EXPERT]: 'Středně pokročilý - A/S',
  [Level.EXPERT]: 'Expert - S',
}

/** The levels in the order they should appear in a picker, easiest first. */
export const LEVEL_OPTIONS = Object.values(Level).map((level) => ({
  value: level,
  label: LEVEL_LABELS[level],
}))
