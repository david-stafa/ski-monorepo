import { Button } from '@ski-blazek/ui/components/button'
import { Link, type LinkProps } from '@tanstack/react-router'
import type { ComponentProps, ReactNode } from 'react'

type ButtonLinkProps = LinkProps &
	Partial<Pick<ComponentProps<typeof Button>, 'variant' | 'size' | 'className'>> & {
		children: ReactNode
	}

/**
 * A link that looks like a shadcn Button. Uses TanStack Router's Link with
 * Button styles via Base UI's render prop — valid HTML (anchor, not button inside anchor).
 */
export function ButtonLink({ variant, size, className, children, ...linkProps }: ButtonLinkProps) {
	return (
		<Button
			variant={variant}
			size={size}
			className={className}
			nativeButton={false}
			render={<Link {...linkProps} />}
		>
			{children}
		</Button>
	)
}
