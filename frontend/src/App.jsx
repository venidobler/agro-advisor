import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

function App() {
  const [quotes, setQuotes] = useState([])

  // Essa função vai até o Django buscar os dados
  const fetchQuotes = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/quotes/")
      const data = await response.json()
      setQuotes(data)
    } catch (error) {
      console.error("Erro ao buscar dados:", error)
    }
  }

  // O useEffect faz a busca assim que a tela carrega
  useEffect(() => {
    fetchQuotes()
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-6 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-green-700 tracking-tight">
          Agro Advisor 2.0
        </h1>
        <p className="mt-2 text-lg text-slate-600">
          Frontend e Backend conectados com sucesso!
        </p>
      </div>
      
      {/* Aqui nós listamos os dados que vieram do banco */}
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md border border-slate-200">
        <h2 className="text-xl font-bold mb-4 text-slate-800">Cotações no Banco:</h2>
        
        {quotes.length === 0 ? (
          <p className="text-slate-500">Nenhuma cotação encontrada. Cadastre no /admin!</p>
        ) : (
          <ul className="space-y-3">
            {quotes.map((quote) => (
              <li key={quote.id} className="flex justify-between items-center p-3 bg-slate-100 rounded">
                <span className="font-semibold">{quote.commodity_display}</span>
                <span className="text-green-700 font-bold">R$ {quote.price}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Button onClick={fetchQuotes}>Atualizar Dados</Button>
    </div>
  )
}

export default App