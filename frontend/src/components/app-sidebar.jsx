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
import { LayoutDashboard, CloudSun, Tractor, LineChart, Settings, Sprout } from "lucide-react"

const items = [
    { title: "Visão Geral", url: "#", icon: LayoutDashboard },
    { title: "Mercado Físico", url: "#", icon: LineChart },
    { title: "Radar & Clima", url: "#", icon: CloudSun },
    { title: "Minhas Lavouras", url: "#", icon: Tractor },
    { title: "Ajustes", url: "#", icon: Settings },
]

export function AppSidebar() {
    const { state } = useSidebar();

    return (
        // Agora a barra acompanha o tema: Branca no light, Zinc no dark.
        <Sidebar collapsible="icon" className="bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800">

            <SidebarHeader className="pt-4 pb-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" className="hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors overflow-hidden">
                            {/* O Ícone da logo continua Verde para ancorar a marca */}
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
                                {items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                {/* A MÁGICA DO HOVER: 
                          Texto padrão é cinza. Quando passa o mouse, o fundo fica levemente verde 
                          e o texto acende em esmeralda, tanto no modo claro quanto no escuro!
                        */}
                                                <SidebarMenuButton
                                                    asChild
                                                    className="text-zinc-600 dark:text-zinc-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors mt-1 justify-start overflow-hidden"
                                                >
                                                    <a href={item.url} className="flex items-center gap-2">
                                                        <item.icon className="w-5 h-5 shrink-0" />
                                                        <span className="font-medium whitespace-nowrap truncate">{item.title}</span>
                                                    </a>
                                                </SidebarMenuButton>
                                            </TooltipTrigger>
                                            {state === 'collapsed' && (
                                                <TooltipContent side="right" sideOffset={12} className="bg-white dark:bg-zinc-800 text-zinc-800 dark:text-white border-zinc-200 dark:border-zinc-700 shadow-md">
                                                    {item.title}
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                    </SidebarMenuItem>
                                ))}
                            </TooltipProvider>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

        </Sidebar>
    )
}