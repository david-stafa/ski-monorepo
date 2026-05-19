import type { ComponentProps, ReactNode } from 'react'
import { Link, type LinkProps } from '@tanstack/react-router'
import { Button } from '@ski-blazek/ui/components/button'

type ButtonLinkProps = LinkProps &
  Partial<
    Pick<ComponentProps<typeof Button>, 'variant' | 'size' | 'className'>
  > & {
    children: ReactNode
  }

/**
 * A link that looks like a shadcn Button. Uses TanStack Router's Link with
 * Button styles via asChild — valid HTML (anchor, not button inside anchor).
 */
export function ButtonLink({
  variant,
  size,
  className,
  children,
  ...linkProps
}: ButtonLinkProps) {
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <Link {...linkProps}>{children}</Link>
    </Button>
  )
}
