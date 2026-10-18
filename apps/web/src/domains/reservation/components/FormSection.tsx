import { cn } from '@ski-blazek/ui/lib/utils'

/**
 * One titled block inside a reservation form card. The small caps heading
 * matches the "DOPLŇKY" label on the reservation detail page.
 */
export const FormSection = ({
	title,
	className,
	children,
}: {
	title: string
	className?: string
	children: React.ReactNode
}) => (
	<section className={cn('flex flex-col gap-3 px-3 py-4 md:px-4', className)}>
		<h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">{title}</h3>
		{children}
	</section>
)
