import { Button } from "@/components/ui/button"

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-6">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-green-700 tracking-tight">
          Agro Advisor 2.0
        </h1>
        <p className="mt-2 text-lg text-slate-600">
          Tailwind CSS e Shadcn/ui configurados com sucesso!
        </p>
      </div>
      
      <Button onClick={() => alert("O Shadcn está vivo!")}>
        Meu Primeiro Botão
      </Button>
    </div>
  )
}

export default App