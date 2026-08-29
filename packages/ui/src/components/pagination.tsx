import { Button } from '@ski-blazek/ui/components/button'

import { cn } from '@ski-blazek/ui/lib/utils'
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react'
import * as React from 'react'

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
	return (
		<nav
			aria-label="pagination"
			data-slot="pagination"
			className={cn('mx-auto flex w-full justify-center', className)}
			{...props}
		/>
	)
}

function PaginationContent({ className, ...props }: React.ComponentProps<'ul'>) {
	return (
		<ul
			data-slot="pagination-content"
			className={cn('flex items-center gap-1', className)}
			{...props}
		/>
	)
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
	return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
	isActive?: boolean
	/** Swap the rendered anchor for another element, e.g. a router `Link`. */
	render?: React.ReactElement<Record<string, unknown>>
} & Pick<React.ComponentProps<typeof Button>, 'size'> &
	React.ComponentProps<'a'>

function PaginationLink({
	className,
	isActive,
	size = 'icon',
	render,
	...props
}: PaginationLinkProps) {
	const anchorProps = {
		'aria-current': isActive ? ('page' as const) : undefined,
		'data-slot': 'pagination-link',
		'data-active': isActive,
		...props,
	}

	// href and children arrive via anchorProps, which Biome cannot see.
	// biome-ignore lint/a11y/useValidAnchor: href comes from anchorProps.
	// biome-ignore lint/a11y/useAnchorContent: content comes from anchorProps.
	const element = render ?? <a />

	return (
		<Button
			variant={isActive ? 'outline' : 'ghost'}
			size={size}
			className={cn(className)}
			nativeButton={false}
			render={React.cloneElement(element, anchorProps)}
		/>
	)
}

function PaginationPrevious({
	className,
	text = 'Previous',
	...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
	return (
		<PaginationLink
			aria-label="Go to previous page"
			size="default"
			className={cn('pl-2!', className)}
			{...props}
		>
			<ChevronLeftIcon data-icon="inline-start" />
			<span className="hidden sm:block">{text}</span>
		</PaginationLink>
	)
}

function PaginationNext({
	className,
	text = 'Next',
	...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
	return (
		<PaginationLink
			aria-label="Go to next page"
			size="default"
			className={cn('pr-2!', className)}
			{...props}
		>
			<span className="hidden sm:block">{text}</span>
			<ChevronRightIcon data-icon="inline-end" />
		</PaginationLink>
	)
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
	return (
		<span
			aria-hidden
			data-slot="pagination-ellipsis"
			className={cn(
				"flex size-9 items-center justify-center [&_svg:not([class*='size-'])]:size-4",
				className
			)}
			{...props}
		>
			<MoreHorizontalIcon />
			<span className="sr-only">More pages</span>
		</span>
	)
}

export {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
}
