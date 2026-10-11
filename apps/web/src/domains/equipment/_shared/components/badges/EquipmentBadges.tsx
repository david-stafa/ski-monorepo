import { Badge } from '@ski-blazek/ui/components/badge'
import { cn } from '@ski-blazek/ui/lib/utils'
import { formatArticleNumber } from '~/domains/equipment/_shared/helpers/formatArticleNumber'
import type {
	AvailableItem,
	HelmetDetail,
	SkiBootDetail,
	SkiDetail,
	SnowboardBootDetail,
	SnowboardDetail,
} from '~/domains/equipment/_shared/types'
import { formatCircumference, helmetSizeLabel } from '~/domains/equipment/helmet/helmetOptions'
import { GenderBadge } from './GenderBadge'
import { KidsBadge } from './KidsBadge'
import { LengthBadge } from './LengthBadge'
import { OldBadge } from './OldBadge'
import { VipBadge } from './VipBadge'

/** A detail row is missing, which the app cannot produce — see below. */
const ArticleOnly = ({ article }: { article: string }) => (
	<span className="tabular-nums">{article}</span>
)

export const EquipmentItemBadges = ({ item }: { item: AvailableItem }) => {
	const article = formatArticleNumber(item)

	switch (item.type) {
		case 'SKI':
			if (!item.ski) return <ArticleOnly article={article} />
			return <SkiBadges ski={item.ski} />

		case 'SNOWBOARD':
			if (!item.snowboard) return <ArticleOnly article={article} />
			return <SnowboardBadges snowboard={item.snowboard} />

		case 'SKI_BOOT':
			if (!item.skiBoot) return <ArticleOnly article={article} />
			return <SkiBootBadges boot={item.skiBoot} />

		case 'SNOWBOARD_BOOT':
			if (!item.snowboardBoot) return <ArticleOnly article={article} />
			return <SnowboardBootBadges boot={item.snowboardBoot} />

		case 'HELMET':
			if (!item.helmet) return <ArticleOnly article={article} />
			return <HelmetBadges helmet={item.helmet} />
	}
}

export const SkiBadges = ({ ski, className }: { ski: SkiDetail; className?: string }) => (
	<div className={cn('flex flex-row gap-1', className)}>
		<LengthBadge length={ski.length} />
		{ski.isKids && ski.length >= 140 && <KidsBadge />}
		{ski.gender === 'FEMALE' && (
			<GenderBadge gender="FEMALE" isKid={ski.isKids || ski.length < 140} />
		)}
		{ski.isOld && <OldBadge />}
		{ski.isVIP && <VipBadge />}
	</div>
)

export const SnowboardBadges = ({
	snowboard,
	className,
}: {
	snowboard: SnowboardDetail
	className?: string
}) => (
	<div className={cn('flex flex-row gap-1', className)}>
		<LengthBadge length={snowboard.length} />
		{snowboard.gender === 'FEMALE' && <GenderBadge gender="FEMALE" />}
	</div>
)

export const SkiBootBadges = ({ boot, className }: { boot: SkiBootDetail; className?: string }) => (
	<div className={cn('flex flex-row gap-1', className)}>
		<LengthBadge length={boot.length} unit="mp" />
		{boot.isKids && <KidsBadge />}
		{boot.gender === 'FEMALE' && <GenderBadge gender="FEMALE" isKid={boot.isKids} />}
	</div>
)

export const SnowboardBootBadges = ({
	boot,
	className,
}: {
	boot: SnowboardBootDetail
	className?: string
}) => (
	<div className={cn('flex flex-row gap-1', className)}>
		<LengthBadge length={boot.length} unit="mp" />
		{boot.isBoa && <Badge variant="outline">BOA</Badge>}
		{boot.isKids && boot.length > 22 && <KidsBadge />}
		{boot.gender === 'FEMALE' && <GenderBadge gender="FEMALE" isKid={boot.isKids} />}
	</div>
)

export const HelmetBadges = ({
	helmet,
	className,
}: {
	helmet: HelmetDetail
	className?: string
}) => {
	// Both are optional until stocktaking fills them in, so the badge only
	// appears once the whole range is known.
	const hasCircumference = helmet.circumferenceMin !== null && helmet.circumferenceMax !== null

	return (
		<div className={cn('flex flex-row gap-1', className)}>
			{helmet.size && <Badge variant="outline">{helmetSizeLabel(helmet.size)}</Badge>}
			{hasCircumference && (
				<Badge variant="outline">
					{formatCircumference(helmet.circumferenceMin, helmet.circumferenceMax)}
				</Badge>
			)}
			{helmet.withIntegratedGoggles && <Badge variant="outline">S brýlemi</Badge>}
			{helmet.gender === 'FEMALE' && <GenderBadge gender="FEMALE" />}
		</div>
	)
}
