/*
    Single source of truth for equipment input schemas.
    Each `<type>.ts` file owns the get / create / update schemas + inferred
    types, shared by both the API procedures and the web forms (imported via
    `@ski-blazek/api/schemas`).
 */

export { paginationSchema, type PaginationInput } from './pagination'

export {
  getSkiInputSchema,
  type GetSkiInput,
  createSkiInputSchema,
  type CreateSkiInput,
  updateSkiInputSchema,
  type UpdateSkiInput,
} from './ski'

export {
  getSkiBootInputSchema,
  type GetSkiBootInput,
  createSkiBootInputSchema,
  type CreateSkiBootInput,
  updateSkiBootInputSchema,
  type UpdateSkiBootInput,
} from './skiBoot'

export {
  getSnowboardInputSchema,
  type GetSnowboardInput,
  createSnowboardInputSchema,
  type CreateSnowboardInput,
  updateSnowboardInputSchema,
  type UpdateSnowboardInput,
} from './snowboard'

export {
  getSnowboardBootInputSchema,
  type GetSnowboardBootInput,
  createSnowboardBootInputSchema,
  type CreateSnowboardBootInput,
  updateSnowboardBootInputSchema,
  type UpdateSnowboardBootInput,
} from './snowboardBoot'

export {
  getHelmetInputSchema,
  type GetHelmetInput,
  createHelmetInputSchema,
  type CreateHelmetInput,
  updateHelmetInputSchema,
  type UpdateHelmetInput,
} from './helmet'

export {
  createReservationInputSchema,
  type CreateReservationInput,
  getReservationsInputSchema,
  type GetReservationsInput,
  getSingleReservationInputSchema,
  type GetSingleReservationInput,
} from './reservation'
