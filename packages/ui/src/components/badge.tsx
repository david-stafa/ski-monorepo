import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cn } from '@ski-blazek/ui/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const badgeVariants = cva(
	'group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-3xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!',
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground [a]:hover:bg-primary/80',
				secondary: 'bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80',
				destructive:
					'bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20',
				outline: 'border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground',
				ghost: 'hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50',
				link: 'text-primary underline-offset-4 hover:underline',
				// Custom semantic vatiants
				success:
					'bg-success/10 text-success focus-visible:ring-success/20 dark:bg-success/20 dark:focus-visible:ring-success/40 [a]:hover:bg-success/20',
				warning:
					'bg-warning/10 text-warning focus-visible:ring-warning/20 dark:bg-warning/20 dark:focus-visible:ring-warning/40 [a]:hover:bg-warning/20',
				info: 'bg-primary/10 text-primary focus-visible:ring-primary/20 dark:bg-primary/20 dark:focus-visible:ring-primary/40 [a]:hover:bg-primary/20',
				// Custom color variant
				blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 [a]:hover:bg-blue-100 dark:[a]:hover:bg-blue-900',
				cyan: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300 [a]:hover:bg-cyan-100 dark:[a]:hover:bg-cyan-900',
				indigo:
					'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 [a]:hover:bg-indigo-100 dark:[a]:hover:bg-indigo-900',
				violet:
					'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300 [a]:hover:bg-violet-100 dark:[a]:hover:bg-violet-900',
				pink: 'bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300 [a]:hover:bg-pink-100 dark:[a]:hover:bg-pink-900',
				slate:
					'bg-slate-50 text-slate-700 dark:bg-slate-950 dark:text-slate-300 [a]:hover:bg-slate-100 dark:[a]:hover:bg-slate-900',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	}
)

function Badge({
	className,
	variant = 'default',
	render,
	...props
}: useRender.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
	return useRender({
		defaultTagName: 'span',
		props: mergeProps<'span'>(
			{
				className: cn(badgeVariants({ variant }), className),
			},
			props
		),
		render,
		state: {
			slot: 'badge',
			variant,
		},
	})
}

export { Badge, badgeVariants }
