import type { ReactNode } from 'react'

/**
 * The shared shape of every dropdown row: article number on the left, the
 * type's own specs in the middle, flags pushed to the right. Layout only —
 * what goes in each slot is each type's business.
 */
export const OptionRow = ({
	article,
	children,
	flags,
}: {
	article: string
	children: ReactNode
	flags?: ReactNode
}) => (
	<span className="flex w-full items-center gap-2">
		<span className="text-muted-foreground tabular-nums">{article}</span>
		{children}
		{flags && <span className="ml-auto flex items-center gap-1">{flags}</span>}
	</span>
)

/** Brand plus the model that half the stock does not have recorded. */
export const OptionName = ({ brand, model }: { brand: string; model: string | null }) => (
	<>
		<span className="font-medium">{brand}</span>
		{model && <span className="text-muted-foreground">{model}</span>}
	</>
)
