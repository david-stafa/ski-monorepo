import { getSkiInputSchema, type GetSkiInput } from '@ski-blazek/api/schemas'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableHeadSortable,
  TableRow,
} from '@ski-blazek/ui/components/table'
import { TypographyH1 } from '@ski-blazek/ui/components/typography'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import {
  CustomItemPerPageSelect,
  CustomPagination,
} from '~/components/ui/CustomPagination'
import { ResetFiltersButton } from '~/components/ui/ResetFiltersButton'
import { AddSkiButton } from '~/domains/equipment/ski/AddSkiButton'
import { SkiActions } from '~/domains/equipment/ski/SkiActions'
import { useFilters } from '~/hooks/useFilter'
import { trpc } from '~/lib/trpc'

export const Route = createFileRoute('/_authenticated/equipment/ski')({
  validateSearch: getSkiInputSchema,
  loaderDeps: ({
    search: { page, itemsPerPage, orderBy, orderDirection },
  }) => ({ page, itemsPerPage, orderBy, orderDirection }),
  loader: async ({ context, deps }) => {
    return context.queryClient.ensureQueryData(
      context.trpc.equipment.ski.getSki.queryOptions(deps)
    )
  },
  component: RouteComponent,
})

function RouteComponent() {
  const {
    filters: { page, itemsPerPage, orderBy, orderDirection },
    setFilters,
    resetFilters,
  } = useFilters(Route.id)

  const handleFilterClick = (orderBy: GetSkiInput['orderBy']) => {
    setFilters({
      orderBy,
      orderDirection:
        orderBy === orderBy && orderDirection === 'asc' ? 'desc' : 'asc',
    })
  }

  /*  Get Ski Query   */
  const { data } = useSuspenseQuery(
    trpc.equipment.ski.getSki.queryOptions({
      page,
      itemsPerPage,
      orderBy,
      orderDirection,
    })
  )

  return (
    <div className="p-2 md:p-4">
      {/*  Title  with total count */}
      <TypographyH1 className="mb-6">
        Lyže
        <span className="ml-1 align-super text-sm text-gray-500">
          ({data.totalCount})
        </span>
      </TypographyH1>

      {/*  Add ski and reset filters button  */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <AddSkiButton />
        <ResetFiltersButton
          resetFilters={resetFilters}
          defaultSearch={getSkiInputSchema.parse({})}
          currentSearch={{ page, itemsPerPage, orderBy, orderDirection }}
        />
      </div>

      {/*  Table  */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Akce</TableHead>
            <TableHeadSortable
              sorted={orderBy === 'brand' ? orderDirection : false}
              onClick={() => handleFilterClick('brand')}
            >
              Značka
            </TableHeadSortable>
            <TableHeadSortable
              sorted={orderBy === 'model' ? orderDirection : false}
              onClick={() => handleFilterClick('model')}
            >
              Model
            </TableHeadSortable>
            <TableHeadSortable
              sorted={orderBy === 'length' ? orderDirection : false}
              onClick={() => handleFilterClick('length')}
            >
              Délka
            </TableHeadSortable>
            <TableHeadSortable
              sorted={orderBy === 'isVIP' ? orderDirection : false}
              onClick={() => handleFilterClick('isVIP')}
            >
              VIP
            </TableHeadSortable>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.ski.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="flex items-center gap-2">
                <SkiActions id={item.id} defaultValues={item} />
              </TableCell>
              <TableCell>{item.brand}</TableCell>
              <TableCell>{item.model}</TableCell>
              <TableCell>{item.length}</TableCell>
              <TableCell>{item.isVIP ? 'VIP' : 'Standart'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between">
        {/*  Pagination   */}
        <CustomPagination
          currentPage={page}
          itemsCount={data.totalCount}
          itemsPerPage={itemsPerPage}
        />
        {/*  Item per page select  */}
        <CustomItemPerPageSelect
          itemsPerPage={itemsPerPage}
          onValueChange={(value) => {
            setFilters({
              itemsPerPage: Number(value),
              page: 1,
            })
          }}
        />
      </div>
    </div>
  )
}
