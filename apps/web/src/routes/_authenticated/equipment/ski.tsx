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
import { useMutation, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Trash2Icon } from 'lucide-react'
import { AddSkiButton } from '~/domains/equipment/ski/AddSkiButton'
import { queryClient, trpc } from '~/lib/trpc'

export const Route = createFileRoute('/_authenticated/equipment/ski')({
  component: RouteComponent,
})

function RouteComponent() {
  const deleteSki = useMutation(
    trpc.equipment.ski.deleteSki.mutationOptions({
      onSuccess: () =>
        queryClient.invalidateQueries({
          queryKey: trpc.equipment.ski.getSki.queryKey(),
        }),
    })
  )

  const { data: ski } = useQuery(trpc.equipment.ski.getSki.queryOptions())
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
          {ski?.map((ski) => (
            <TableRow key={ski.id}>
              <TableCell>{ski.brand}</TableCell>
              <TableCell>{ski.model}</TableCell>
              <TableCell>{ski.length}</TableCell>
              <TableCell>{ski.isVIP ? 'VIP' : 'Standart'}</TableCell>
              <TableCell>
                <Button onClick={() => deleteSki.mutate(ski.id)}>
                  <Trash2Icon />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
