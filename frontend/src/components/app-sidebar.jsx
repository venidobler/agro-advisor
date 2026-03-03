import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar, // Import the hook to know if it's collapsed!
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip" // Add Tooltip imports
import { LayoutDashboard, FileText, Settings, Sprout } from "lucide-react"

const items = [
    { title: "Dashboard", url: "#", icon: LayoutDashboard },
    { title: "Relatórios", url: "#", icon: FileText },
    { title: "Configurações", url: "#", icon: Settings },
]

export function AppSidebar() {
  const { state } = useSidebar(); // We grab the 'state' to check if it's 'expanded' or 'collapsed'

  return (
    <Sidebar collapsible="icon" className="bg-slate-950 border-r-slate-900 text-slate-300">
      
      {/* HEADER DA SIDEBAR */}
      <SidebarHeader className="pt-4 pb-2 bg-slate-950">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-slate-800 hover:text-white transition-colors overflow-hidden">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-green-600 text-white shrink-0">
                <Sprout className="size-5" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none truncate">
                <span className="font-bold text-lg text-slate-50 tracking-tight truncate">Agro Advisor</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* CONTEÚDO DA SIDEBAR */}
      <SidebarContent className="bg-slate-950">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <TooltipProvider delayDuration={0}>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton 
                           asChild 
                           // Note the added 'truncate' and 'whitespace-nowrap' logic
                           className="text-slate-400 hover:bg-slate-800 hover:text-white transition-colors mt-1 justify-start overflow-hidden"
                        >
                          <a href={item.url} className="flex items-center gap-2">
                            <item.icon className="w-5 h-5 shrink-0" />
                            <span className="font-medium whitespace-nowrap truncate">{item.title}</span>
                          </a>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      
                      {/* Tooltip Content only shows if sidebar is collapsed */}
                      {state === 'collapsed' && (
                        <TooltipContent side="right" sideOffset={12}>
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