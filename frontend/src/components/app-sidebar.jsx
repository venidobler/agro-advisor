import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { LayoutDashboard, CloudSun, Tractor, LineChart, Settings, Sprout, Package } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

const items = [
  { title: "Visão Geral", url: "/", icon: LayoutDashboard },
  { title: "Mercado Físico", url: "/mercado", icon: LineChart },
  { title: "Insumos", url: "/insumos", icon: Package },
  { title: "Radar & Clima", url: "/clima", icon: CloudSun },
  { title: "Minhas Lavouras", url: "/lavouras", icon: Tractor },
  { title: "Ajustes", url: "/ajustes", icon: Settings },
]

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation(); // <-- Isso descobre em qual página estamos

  return (
    <Sidebar collapsible="icon" className="bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800">
      <SidebarHeader className="pt-4 pb-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors overflow-hidden">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-emerald-600 text-white shrink-0 shadow-sm">
                <Sprout className="size-5" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none truncate ml-1">
                <span className="font-bold text-lg text-zinc-900 dark:text-zinc-50 tracking-tight truncate">Agro Advisor</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <TooltipProvider delayDuration={0}>
                {items.map((item) => {
                  // A mágica: se a URL atual for igual a do botão, ele ganha a classe 'active'
                  const isActive = location.pathname === item.url;

                  return (
                    <SidebarMenuItem key={item.title}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <SidebarMenuButton
                            asChild
                            className={`mt-1 justify-start overflow-hidden transition-colors ${isActive
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold"
                              : "text-zinc-600 dark:text-zinc-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-400"
                              }`}
                          >
                            <Link to={item.url} className="flex items-center gap-2">
                              <item.icon className="w-5 h-5 shrink-0" />
                              <span className="whitespace-nowrap truncate">{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </TooltipTrigger>
                        {state === 'collapsed' && (
                          <TooltipContent side="right" sideOffset={12} className="bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white border-zinc-200 dark:border-zinc-700 shadow-md">
                            {item.title}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </SidebarMenuItem>
                  )
                })}
              </TooltipProvider>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}