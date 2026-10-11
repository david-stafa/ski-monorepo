import { cn } from '@ski-blazek/ui/lib/utils'
import { formatArticleNumber } from '../../helpers/formatArticleNumber'

export const ArticleNumberBadge = ({
	articleGroup,
	articleNumber,
	className,
}: {
	articleGroup: number | null
	articleNumber: number
	className?: string
}) => (
	<span className={cn('w-fit rounded-md bg-muted px-2 py-1 font-medium tracking-wide', className)}>
		{formatArticleNumber({
			articleGroup,
			articleNumber,
		})}
	</span>
)
