import { router } from '../_context'
import { equipmentItemRouter } from './_shared/equipmentItem'
import { helmetRouter } from './helmet/helmet'
import { skiRouter } from './ski/ski'
import { skiBootRouter } from './skiBoot/skiBoot'
import { snowboardRouter } from './snowboard/snowboard'
import { snowboardBootRouter } from './snowboardBoot/snowboardBoot'

export const equipmentRouter = router({
  equipmentItem: equipmentItemRouter,
  ski: skiRouter,
  skiBoot: skiBootRouter,
  snowboard: snowboardRouter,
  snowboardBoot: snowboardBootRouter,
  helmet: helmetRouter,
})
