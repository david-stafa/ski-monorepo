import { getSnowboardBootInputSchema } from '@ski-blazek/api/schemas'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/equipment/snowboard-boot'
)({
  validateSearch: getSnowboardBootInputSchema,
  loaderDeps: ({ search: { page, itemsPerPage } }) => ({ page, itemsPerPage }),
  loader: async ({ context, deps: { page, itemsPerPage } }) => {
    return context.queryClient.ensureQueryData(
      context.trpc.equipment.snowboardBoot.getSnowboardBoot.queryOptions({
        page,
        itemsPerPage,
      })
    )
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/equipment/snowboard-boot"!</div>
}
