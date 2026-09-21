import { formatArticleNumber } from '~/domains/equipment/_shared/helpers/formatArticleNumber'
import { HelmetOption } from './equipmentOptions/HelmetOption'
import { SkiBootOption } from './equipmentOptions/SkiBootOption'
import { SkiOption } from './equipmentOptions/SkiOption'
import { SnowboardBootOption } from './equipmentOptions/SnowboardBootOption'
import { SnowboardOption } from './equipmentOptions/SnowboardOption'
import type { AvailableItem } from './equipmentOptions/types'

/** A detail row is missing, which the app cannot produce — see below. */
const ArticleOnly = ({ article }: { article: string }) => (
	<span className="tabular-nums">{article}</span>
)

export const EquipmentItemOptionLabel = ({ item }: { item: AvailableItem }) => {
	const article = formatArticleNumber(item)

	switch (item.type) {
		case 'SKI':
			if (!item.ski) return <ArticleOnly article={article} />
			return <SkiOption article={article} ski={item.ski} />

		case 'SNOWBOARD':
			if (!item.snowboard) return <ArticleOnly article={article} />
			return <SnowboardOption article={article} snowboard={item.snowboard} />

		case 'SKI_BOOT':
			if (!item.skiBoot) return <ArticleOnly article={article} />
			return <SkiBootOption article={article} boot={item.skiBoot} />

		case 'SNOWBOARD_BOOT':
			if (!item.snowboardBoot) return <ArticleOnly article={article} />
			return <SnowboardBootOption article={article} boot={item.snowboardBoot} />

		case 'HELMET':
			if (!item.helmet) return <ArticleOnly article={article} />
			return <HelmetOption article={article} helmet={item.helmet} />
	}
}
