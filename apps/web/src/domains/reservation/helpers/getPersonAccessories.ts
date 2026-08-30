import type { Goggle } from '@ski-blazek/db/browser'
import { goggleLabel } from './goggleOptions'

/** The extras a person takes on top of their assigned equipment. */
type Accessories = {
	poles: number | null
	backProtection: boolean
	skiCover: boolean
	bootCover: boolean
	goggles: Goggle | null
}

/**
 * The accessories as pick-up-sheet labels, so the counter staff can read off
 * what to hand over alongside the numbered gear. `poles` and `goggles` are a
 * length and a variant rather than flags — null means the person is not taking
 * them, and anything else is the detail the counter needs to pick the item.
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
	if (goggles !== null) labels.push(`Brýle ${goggleLabel(goggles)}`)

	return labels
}
