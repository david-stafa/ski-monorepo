/*
    Single source of truth for equipment input schemas.
    Each `<type>.ts` file owns the get / create / update schemas + inferred
    types, shared by both the API procedures and the web forms (imported via
    `@ski-blazek/api/schemas`).
 */

export {
	type CreateHelmetInput,
	createHelmetInputSchema,
	type GetHelmetInput,
	getHelmetInputSchema,
	type UpdateHelmetInput,
	updateHelmetInputSchema,
} from './helmet'
export { type PaginationInput, paginationSchema } from './pagination'
export {
	type CreateReservationInput,
	createReservationInputSchema,
	type GetReservationsInput,
	getReservationsInputSchema,
	personInputSchema,
	type ReservationIdInput,
	reservationIdInputSchema,
} from './reservation'
export {
	type CreateSkiInput,
	createSkiInputSchema,
	type GetSkiInput,
	getSkiInputSchema,
	type UpdateSkiInput,
	updateSkiInputSchema,
} from './ski'
export {
	type CreateSkiBootInput,
	createSkiBootInputSchema,
	type GetSkiBootInput,
	getSkiBootInputSchema,
	type UpdateSkiBootInput,
	updateSkiBootInputSchema,
} from './skiBoot'
export {
	type CreateSnowboardInput,
	createSnowboardInputSchema,
	type GetSnowboardInput,
	getSnowboardInputSchema,
	type UpdateSnowboardInput,
	updateSnowboardInputSchema,
} from './snowboard'
export {
	type CreateSnowboardBootInput,
	createSnowboardBootInputSchema,
	type GetSnowboardBootInput,
	getSnowboardBootInputSchema,
	type UpdateSnowboardBootInput,
	updateSnowboardBootInputSchema,
} from './snowboardBoot'
export {
	type CheckedFilter,
	isChecked,
	type SetCheckedInput,
	type StockSweepInput,
	seasonStart,
	setCheckedInputSchema,
	stockCheckFilterSchema,
	stockSweepInputSchema,
} from './stockCheck'
