import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

// Importando as nossas Páginas Separadas!
import Dashboard from "./pages/Dashboard"
import Lavouras from "./pages/Lavouras"
import Insumos from "./pages/Insumos"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="bg-transparent border-border shrink-0 hover:bg-accent transition-colors"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-zinc-400" />
      <span className="sr-only">Mudar tema</span>
    </Button>
  )
}

function MainLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="bg-background min-h-screen transition-colors duration-300">
        
        {/* Header Fixo e Limpo com classes semânticas */}
        <header className="sticky top-0 flex h-16 w-[calc(100%)] items-center shrink-0 border-b border-border bg-card shadow-sm z-50 px-4 md:px-6 transition-colors duration-300">
          <div className="flex h-full items-center">
            <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground transition-colors hover:bg-accent rounded-lg" />
            <div className="hidden md:flex flex-col ml-4 pl-4 border-l border-border">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">Visão da Praça</span>
              <span className="text-sm font-semibold text-foreground leading-none mt-1">Toledo, PR</span>
            </div>
          </div>
          
          <div className="flex-1" />
          
          <div className="flex items-center gap-3">
            <ModeToggle />
          </div>
        </header>

        {/* O Roteador que decide qual página mostrar de forma dinâmica */}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/lavouras" element={<Lavouras />} />
          <Route path="/insumos" element={<Insumos />} />
        </Routes>

      </SidebarInset>
    </SidebarProvider>
  )
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme" attribute="class">
      <Router>
        <MainLayout />
      </Router>
    </ThemeProvider>
  )
}