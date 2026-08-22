import { Button } from '@ski-blazek/ui/components/button'
import {
  Collapsible,
  CollapsibleContent,
} from '@ski-blazek/ui/components/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
} from '@ski-blazek/ui/components/sidebar'
import { createFileRoute, Link, Outlet, redirect } from '@tanstack/react-router'
import {
  CalendarDays,
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
  User,
} from 'lucide-react'

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
    <>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1">
          {/* <SidebarTrigger /> */}
          <Outlet />
        </main>
      </SidebarProvider>
    </>
  )
}

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Ski Blazek" asChild>
              <Link to="/dashboard">
                <Mountain />
                <span>Ski Blazek</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuSubItem>
                <Button asChild className="w-full" variant="default" size="sm">
                  <Link to="/reservation/create">
                    <PlusCircleIcon />
                    <span>Vytvořit rezervaci</span>
                  </Link>
                </Button>
              </SidebarMenuSubItem>
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Rezervace" asChild>
                    <Link to="/reservation" className="w-full">
                      <CalendarDays />
                      <span>Rezervace</span>
                    </Link>
                  </SidebarMenuButton>
                  {/* <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="transition-transform data-[state=open]:rotate-180">
                      <ChevronDown />
                      <span className="sr-only">Přepnout</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger> */}
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link to="/reservation">
                            <ListIcon />
                            <span>Přehled</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link to="/reservation/pick-up">
                            <PackageOpenIcon />
                            <span>Výdej</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Vybavení" asChild>
                    <Link to="/equipment" className="w-full">
                      <Package />
                      <span>Vybavení</span>
                    </Link>
                  </SidebarMenuButton>
                  {/* <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="transition-transform data-[state=open]:rotate-180">
                      <ChevronDown />
                      <span className="sr-only">Přepnout</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger> */}
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link to="/equipment/ski">
                            <MountainSnowIcon />
                            <span>Lyže</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link to="/equipment/ski-boot">
                            <Footprints />
                            <span>Lyžařské boty</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link to="/equipment/snowboard">
                            <Snowflake />
                            <span>Snowboardy</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link to="/equipment/snowboard-boot">
                            <FootprintsIcon />
                            <span>Snowboardové boty</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link to="/equipment/helmet">
                            <HardHat />
                            <span>Helmy</span>
                          </Link>
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
          <SidebarMenuItem>
            <SidebarMenuButton>
              <User /> Username
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
