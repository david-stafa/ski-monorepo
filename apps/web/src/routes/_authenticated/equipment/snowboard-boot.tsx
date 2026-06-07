import {
  getSnowboardBootInputSchema,
  type GetSnowboardBootInput,
} from '@ski-blazek/api/schemas'
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
import { SearchField } from '~/components/ui/SearchField'
import { AddSnowboardBootButton } from '~/domains/equipment/snowboardBoot/AddSnowboardBootButton'
import { SnowboardBootActions } from '~/domains/equipment/snowboardBoot/SnowboardBootActions'
import { useFilters } from '~/hooks/useFilter'
import { trpc } from '~/lib/trpc'

export const Route = createFileRoute(
  '/_authenticated/equipment/snowboard-boot'
)({
  validateSearch: getSnowboardBootInputSchema,
  loaderDeps: ({
    search: { page, itemsPerPage, orderBy, orderDirection, search },
  }) => ({ page, itemsPerPage, orderBy, orderDirection, search }),
  loader: async ({ context, deps }) => {
    return context.queryClient.ensureQueryData(
      context.trpc.equipment.snowboardBoot.getSnowboardBoot.queryOptions(deps)
    )
  },
  component: RouteComponent,
})

function RouteComponent() {
  const {
    filters: { page, itemsPerPage, orderBy, orderDirection, search },
    setFilters,
    resetFilters,
  } = useFilters(Route.id)

  const handleFilterClick = (nextOrderBy: GetSnowboardBootInput['orderBy']) => {
    setFilters({
      orderBy: nextOrderBy,
      orderDirection:
        nextOrderBy === orderBy && orderDirection === 'asc' ? 'desc' : 'asc',
      page: 1,
    })
  }

  /*  Get Snowboard Boot Query   */
  const { data } = useSuspenseQuery(
    trpc.equipment.snowboardBoot.getSnowboardBoot.queryOptions({
      page,
      itemsPerPage,
      orderBy,
      orderDirection,
      search,
    })
  )

  return (
    <div className="p-2 md:p-4">
      {/*  Title  with total count */}
      <TypographyH1 className="mb-6">
        Snowboardové boty
        <span className="ml-1 align-super text-sm text-gray-500">
          ({data.totalCount})
        </span>
      </TypographyH1>

      {/*  Add snowboard boot and reset filters button  */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <AddSnowboardBootButton />

        <SearchField
          searchValue={search}
          onSearch={(search) => setFilters({ search, page: 1 })}
        />

        <ResetFiltersButton
          resetFilters={resetFilters}
          defaultSearch={getSnowboardBootInputSchema.parse({})}
          currentSearch={{
            page,
            itemsPerPage,
            orderBy,
            orderDirection,
            search,
          }}
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
              sorted={orderBy === 'isBoa' ? orderDirection : false}
              onClick={() => handleFilterClick('isBoa')}
            >
              BOA systém
            </TableHeadSortable>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.snowboardBoots.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-50 text-center">
                Žádné snowboardové boty nebyly nalezeny.
              </TableCell>
            </TableRow>
          ) : (
            data.snowboardBoots.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="flex items-center gap-2">
                  <SnowboardBootActions defaultValues={item} />
                </TableCell>
                <TableCell>{item.brand}</TableCell>
                <TableCell>{item.model}</TableCell>
                <TableCell>{item.length}</TableCell>
                <TableCell>{item.isBoa ? 'Ano' : 'Ne'}</TableCell>
              </TableRow>
            ))
          )}
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
