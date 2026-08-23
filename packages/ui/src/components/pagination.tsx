import { Slot, Slottable } from '@radix-ui/react-slot'
import { type Button, buttonVariants } from '@ski-blazek/ui/components/button'
import { cn } from '@ski-blazek/ui/lib/utils'
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from 'lucide-react'
import type * as React from 'react'

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
	return (
		<nav
			// biome-ignore lint/a11y/noRedundantRoles: <This file is a UI component from shadcn/ui>
			role="navigation"
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
			className={cn('flex flex-row items-center gap-1', className)}
			{...props}
		/>
	)
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
	return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
	isActive?: boolean
	asChild?: boolean
} & Pick<React.ComponentProps<typeof Button>, 'size'> &
	React.ComponentProps<'a'>

function PaginationLink({
	className,
	isActive,
	size = 'icon',
	asChild = false,
	...props
}: PaginationLinkProps) {
	const Comp = asChild ? Slot : 'a'
	return (
		<Comp
			aria-current={isActive ? 'page' : undefined}
			data-slot="pagination-link"
			data-active={isActive}
			className={cn(
				buttonVariants({
					variant: isActive ? 'outline' : 'ghost',
					size,
				}),
				className
			)}
			{...props}
		/>
	)
}

function PaginationPrevious({
	className,
	asChild,
	children,
	...props
}: React.ComponentProps<typeof PaginationLink>) {
	return (
		<PaginationLink
			aria-label="Go to previous page"
			size="default"
			className={cn('gap-1 px-2.5 sm:pl-2.5', className)}
			asChild={asChild}
			{...props}
		>
			<ChevronLeftIcon />
			<Slottable>{children ?? <span className="hidden sm:block">Previous</span>}</Slottable>
		</PaginationLink>
	)
}

function PaginationNext({
	className,
	asChild,
	children,
	...props
}: React.ComponentProps<typeof PaginationLink>) {
	return (
		<PaginationLink
			aria-label="Go to next page"
			size="default"
			className={cn('gap-1 px-2.5 sm:pr-2.5', className)}
			asChild={asChild}
			{...props}
		>
			<Slottable>{children ?? <span className="hidden sm:block">Next</span>}</Slottable>
			<ChevronRightIcon />
		</PaginationLink>
	)
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
	return (
		<span
			aria-hidden
			data-slot="pagination-ellipsis"
			className={cn('flex size-9 items-center justify-center', className)}
			{...props}
		>
			<MoreHorizontalIcon className="size-4" />
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
