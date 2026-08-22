/** The extras a person takes on top of their assigned equipment. */
type Accessories = {
  poles: number | null
  backProtection: boolean
  skiCover: boolean
  bootCover: boolean
  goggles: boolean
}

/**
 * The accessories as pick-up-sheet labels, so the counter staff can read off
 * what to hand over alongside the numbered gear. `poles` is a length in cm
 * rather than a flag — null means no poles.
 */
export const getPersonAccessories = ({
  poles,
  backProtection,
  skiCover,
  bootCover,
  goggles,
}: Accessories): string[] => {
  const labels: string[] = []

  if (poles !== null) labels.push(`Hole ${poles} cm`)
  if (backProtection) labels.push('Chránič zad')
  if (skiCover) labels.push('Vak na lyže')
  if (bootCover) labels.push('Vak na boty')
  if (goggles) labels.push('Brýle')

  return labels
}
