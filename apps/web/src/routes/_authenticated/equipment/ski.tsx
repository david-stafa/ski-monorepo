import { Button } from '@ski-blazek/ui/components/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ski-blazek/ui/components/table'
import { TypographyH1 } from '@ski-blazek/ui/components/typography'
import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Trash2Icon } from 'lucide-react'
import { CustomPagination } from '~/components/ui/CustomPagination'
import { AddSkiButton } from '~/domains/equipment/ski/AddSkiButton'
import { queryClient, trpc } from '~/lib/trpc'

export const Route = createFileRoute('/_authenticated/equipment/ski')({
  loaderDeps: ({ search: { page, itemsPerPage } }) => ({ page, itemsPerPage }),
  loader: async ({ context, deps: { page, itemsPerPage } }) => {
    await new Promise((resolve) => setTimeout(resolve, 10000))
    
    return context.queryClient.ensureQueryData(
      context.trpc.equipment.ski.getSki.queryOptions({ page, itemsPerPage })
    )
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { page, itemsPerPage } = Route.useSearch()

  /*  Delete Ski Mutation   */
  const deleteSki = useMutation(
    trpc.equipment.ski.deleteSki.mutationOptions({
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: trpc.equipment.ski.getSki.queryKey(),
        }),
    })
  )

  /*  Get Ski Query   */
  const { data } = useSuspenseQuery(
    trpc.equipment.ski.getSki.queryOptions({
      page,
      itemsPerPage,
    })
  )

  return (
    <div className="p-2 md:p-4">
      <div className="mb-4 flex items-center justify-between gap-2">
        <TypographyH1>Lyže</TypographyH1>
        <AddSkiButton />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Značka</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Délka</TableHead>
            <TableHead>VIP</TableHead>
            <TableHead>Akce</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.ski.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.brand}</TableCell>
              <TableCell>{item.model}</TableCell>
              <TableCell>{item.length}</TableCell>
              <TableCell>{item.isVIP ? 'VIP' : 'Standart'}</TableCell>
              <TableCell>
                <Button onClick={() => deleteSki.mutate(item.id)} size="icon-sm">
                  <Trash2Icon />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/*  Pagination   */}
      <CustomPagination
        currentPage={page}
        itemsCount={data.totalCount}
        itemsPerPage={itemsPerPage}
      />
    </div>
  )
}
