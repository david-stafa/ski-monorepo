import { Button } from '@ski-blazek/ui/components/button'
import { TypographyH1 } from '@ski-blazek/ui/components/typography'
import { createFileRoute } from '@tanstack/react-router'
import { PlusIcon } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/equipment/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="p-2 md:p-4">
      <div className="mb-4 flex items-center justify-between">
        <TypographyH1>Vybavení</TypographyH1>
        <Button>
          <PlusIcon className="size-4" />
        </Button>
      </div>
    </div>
  )
}
