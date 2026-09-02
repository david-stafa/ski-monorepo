import { TypographyH2, TypographyP } from '@ski-blazek/ui/components/typography'
import { MountainSnowIcon } from 'lucide-react'
import { LogInForm } from '~/components/auth/LogInFom'

/**
 * Split layout: the brand panel carries the identity so the form side can stay
 * plain. Below `md` the panel is dropped entirely rather than stacked — on a
 * phone the only thing worth showing is the form — so the wordmark is repeated
 * above it there.
 */
export const LogInPage = () => {
	return (
		<div className="flex min-h-screen">
			{/*  Brand panel  */}
			<div className="bg-primary text-primary-foreground relative hidden w-1/2 flex-col justify-between overflow-hidden p-12 md:flex">
				{/*  Decorative ridgeline — inert, so it stays out of the a11y tree  */}
				<svg
					aria-hidden="true"
					className="pointer-events-none absolute inset-x-0 bottom-0 w-full"
					viewBox="0 0 800 320"
					preserveAspectRatio="none"
				>
					<title>Hory</title>
					<path
						d="M0 320V190l150-95 130 80 90-55 150 105 110-70 170 110v55z"
						fill="currentColor"
						opacity="0.08"
					/>
					<path
						d="M0 320V235l190-120 160 100 120-70 180 125 150-95v145z"
						fill="currentColor"
						opacity="0.12"
					/>
				</svg>

				{/*  Wordmark  */}
				<div className="relative flex items-center gap-2.5">
					<MountainSnowIcon className="size-7" />
					<span className="text-xl font-semibold tracking-tight">Ski Blažek</span>
				</div>

				{/*  Claim  */}
				<div className="relative max-w-md">
					<p className="text-3xl leading-snug font-semibold tracking-tight text-balance">
						Půjčovna, která má přehled.
					</p>
					<p className="text-primary-foreground/70 mt-4 leading-7">
						Rezervace, výdej a evidence vybavení na jednom místě.
					</p>
				</div>

				<p className="text-primary-foreground/60 relative text-sm">
					© {new Date().getFullYear()} Ski Blazek
				</p>
			</div>

			{/*  Form  */}
			<div className="flex w-full items-center justify-center px-6 py-12 md:w-1/2 md:px-14">
				<div className="w-full max-w-sm">
					{/*  Stands in for the brand panel below `md`, where it is hidden  */}
					<div className="text-primary mb-10 flex items-center gap-2.5 md:hidden">
						<MountainSnowIcon className="size-6" />
						<span className="text-lg font-semibold tracking-tight">Ski Blažek</span>
					</div>

					<TypographyH2 className="pb-0">Přihlášení</TypographyH2>
					<TypographyP className="text-muted-foreground mt-2 mb-8">
						Vyplňte formulář níže a přihlaste se do svého účtu.
					</TypographyP>

					<LogInForm />
				</div>
			</div>
		</div>
	)
}
