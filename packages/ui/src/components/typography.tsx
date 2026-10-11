import { cn } from '../lib/utils'

export function TypographyH1({ children, className, ...props }: React.ComponentProps<'h1'>) {
	return (
		<h1
			className={cn('scroll-m-20 text-balance font-extrabold text-4xl tracking-tight', className)}
			{...props}
		>
			{children}
		</h1>
	)
}

export function TypographyH2({ children, className, ...props }: React.ComponentProps<'h2'>) {
	return (
		<h2 className={cn('scroll-m-20 font-semibold text-3xl tracking-tight', className)} {...props}>
			{children}
		</h2>
	)
}

export function TypographyH3({ children, className, ...props }: React.ComponentProps<'h3'>) {
	return (
		<h3 className={cn('scroll-m-20 font-semibold text-2xl tracking-tight', className)} {...props}>
			{children}
		</h3>
	)
}

export function TypographyH4({ children, className, ...props }: React.ComponentProps<'h4'>) {
	return (
		<h4 className={cn('scroll-m-20 font-semibold text-xl tracking-tight', className)} {...props}>
			{children}
		</h4>
	)
}

export function TypographyP({ children, className, ...props }: React.ComponentProps<'p'>) {
	return (
		<p className={cn('leading-7', className)} {...props}>
			{children}
		</p>
	)
}

export function TypographyBlockquote({
	children,
	className,
	...props
}: React.ComponentProps<'blockquote'>) {
	return (
		<blockquote className={cn('border-l-2 pl-6 italic', className)} {...props}>
			{children}
		</blockquote>
	)
}

export function TypographyLarge({ children, className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div className={cn('font-semibold text-lg', className)} {...props}>
			{children}
		</div>
	)
}

export function TypographySmall({ children, className, ...props }: React.ComponentProps<'small'>) {
	return (
		<small className={cn('font-medium text-sm leading-tight', className)} {...props}>
			{children}
		</small>
	)
}

export function TypographyMuted({ children, className, ...props }: React.ComponentProps<'p'>) {
	return (
		<p className={cn('text-muted-foreground text-sm', className)} {...props}>
			{children}
		</p>
	)
}
