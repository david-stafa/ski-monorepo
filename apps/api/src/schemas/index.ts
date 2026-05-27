/* 
    - Shared schemas used also both in API and Web.
    - Other schemas ised only in API are located in the routers folder.
 */

export { paginationSchema, type PaginationInput } from './pagination'
export { getSkiInputSchema, type GetSkiInput } from './ski'
export { getSkiBootInputSchema, type GetSkiBootInput } from './skiBoot'
export { getSnowboardInputSchema, type GetSnowboardInput } from './snowboard'
export {
  getSnowboardBootInputSchema,
  type GetSnowboardBootInput,
} from './snowboardBoot'
export { getHelmetInputSchema, type GetHelmetInput } from './helmet'
