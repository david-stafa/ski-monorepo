import { Button } from '@ski-blazek/ui/components/button'
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@ski-blazek/ui/components/collapsible'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarProvider,
	SidebarRail,
	SidebarTrigger,
} from '@ski-blazek/ui/components/sidebar'
import { createFileRoute, Link, Outlet, redirect, useRouteContext } from '@tanstack/react-router'
import {
	CalendarDays,
	ChevronDown,
	Footprints,
	FootprintsIcon,
	HardHat,
	ListIcon,
	Mountain,
	MountainSnowIcon,
	Package,
	PackageOpenIcon,
	PlusCircleIcon,
	Snowflake,
} from 'lucide-react'
import { UserMenu } from '~/components/ui/UserMenu'

export const Route = createFileRoute('/_authenticated')({
	beforeLoad: async ({ location, context }) => {
		if (!context.user) {
			throw redirect({
				to: '/',
				search: {
					redirect: location.href,
				},
			})
		}
	},
	component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
	return (
		<SidebarProvider>
			<AppSidebar />
			<main className="flex-1">
				<header className="flex h-12 items-center justify-between gap-2 border-b px-2 md:hidden">
					<SidebarTrigger />
					<UserMenu />
				</header>
				<Outlet />
			</main>
		</SidebarProvider>
	)
}

export function AppSidebar() {
	const { user } = useRouteContext({ from: '__root__' })
	return (
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton tooltip="Ski Blažek" render={<Link to="/dashboard" />}>
							<Mountain />
							<span>Ski Blažek</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuSubItem>
								<Button
									className="w-full mb-1"
									variant="default"
									size="default"
									nativeButton={false}
									render={<Link to="/reservation/create" />}
								>
									<PlusCircleIcon />
									<span>Vytvořit rezervaci</span>
								</Button>
							</SidebarMenuSubItem>
							<Collapsible defaultOpen className="group/collapsible">
								<SidebarMenuItem>
									<SidebarMenuButton
										tooltip="Rezervace"
										render={<Link to="/reservation" className="w-full" />}
									>
										<CalendarDays />
										<span>Rezervace</span>
									</SidebarMenuButton>

									<CollapsibleTrigger
										render={
											<SidebarMenuAction className="transition-transform aria-expanded:rotate-180" />
										}
									>
										<ChevronDown />
										<span className="sr-only">Přepnout</span>
									</CollapsibleTrigger>

									<CollapsibleContent>
										<SidebarMenuSub>
											<SidebarMenuSubItem>
												<SidebarMenuSubButton render={<Link to="/reservation" />}>
													<ListIcon />
													<span>Přehled</span>
												</SidebarMenuSubButton>
											</SidebarMenuSubItem>
											<SidebarMenuSubItem>
												<SidebarMenuSubButton render={<Link to="/reservation/pick-up" />}>
													<PackageOpenIcon />
													<span>Výdej</span>
												</SidebarMenuSubButton>
											</SidebarMenuSubItem>
										</SidebarMenuSub>
									</CollapsibleContent>
								</SidebarMenuItem>
							</Collapsible>

							<Collapsible defaultOpen className="group/collapsible">
								<SidebarMenuItem>
									<SidebarMenuButton
										tooltip="Vybavení"
										render={<Link to="/equipment" className="w-full" />}
									>
										<Package />
										<span>Vybavení</span>
									</SidebarMenuButton>

									<CollapsibleTrigger
										render={
											<SidebarMenuAction className="transition-transform aria-expanded:rotate-180" />
										}
									>
										<ChevronDown />
										<span className="sr-only">Přepnout</span>
									</CollapsibleTrigger>

									<CollapsibleContent>
										<SidebarMenuSub>
											<SidebarMenuSubItem>
												<SidebarMenuSubButton render={<Link to="/equipment/ski" />}>
													<MountainSnowIcon />
													<span>Lyže</span>
												</SidebarMenuSubButton>
											</SidebarMenuSubItem>
											<SidebarMenuSubItem>
												<SidebarMenuSubButton render={<Link to="/equipment/ski-boot" />}>
													<Footprints />
													<span>Lyžařské boty</span>
												</SidebarMenuSubButton>
											</SidebarMenuSubItem>
											<SidebarMenuSubItem>
												<SidebarMenuSubButton render={<Link to="/equipment/snowboard" />}>
													<Snowflake />
													<span>Snowboardy</span>
												</SidebarMenuSubButton>
											</SidebarMenuSubItem>
											<SidebarMenuSubItem>
												<SidebarMenuSubButton render={<Link to="/equipment/snowboard-boot" />}>
													<FootprintsIcon />
													<span>Snowboardové boty</span>
												</SidebarMenuSubButton>
											</SidebarMenuSubItem>
											<SidebarMenuSubItem>
												<SidebarMenuSubButton render={<Link to="/equipment/helmet" />}>
													<HardHat />
													<span>Helmy</span>
												</SidebarMenuSubButton>
											</SidebarMenuSubItem>
										</SidebarMenuSub>
									</CollapsibleContent>
								</SidebarMenuItem>
							</Collapsible>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem className="flex items-center gap-2 overflow-hidden p-1 group-data-[collapsible=icon]:p-0">
						<UserMenu />
						<span className="truncate text-sm group-data-[collapsible=icon]:hidden">
							{user?.name || user?.email || 'Uživatel'}
						</span>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	)
}
