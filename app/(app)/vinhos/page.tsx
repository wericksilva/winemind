"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Degustacao = {
  id: string
  nome_vinho: string
  uva: string
  pais: string
  data_degustacao: string
  nota: number
  observacoes: string
  imagem_url?: string
}

export default function VinhosPage() {
  const [degustacoes, setDegustacoes] = useState<Degustacao[]>([])
  const [busca, setBusca] = useState("")
  const [filtroNota, setFiltroNota] = useState("")

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from("degustacoes")
        .select("*")
        .order("created_at", { ascending: false })
      if (data) setDegustacoes(data)
    }
    fetchData()
  }, [])

  async function loadDegustacoes() {
    const { data } = await supabase
      .from("degustacoes")
      .select("*")
      .order("created_at", { ascending: false })
    if (data) setDegustacoes(data)
  }

  async function handleDelete(id: string) {
    await supabase.from("degustacoes").delete().eq("id", id)
    loadDegustacoes()
  }

  function limparFiltros() {
    setBusca("")
    setFiltroNota("")
  }

  const degustacoesFiltradas = degustacoes.filter((item) => {
    const matchBusca = item.nome_vinho
      .toLowerCase()
      .includes(busca.toLowerCase())
    const matchNota = filtroNota ? item.nota === Number(filtroNota) : true
    return matchBusca && matchNota
  })

  return (
    <div className="px-2 md:px-0">
      <h2 className="text-3xl font-bold mb-6">
        Vinhos Degustados 🍷
      </h2>

      {/* FILTROS */}
      <div className="bg-white p-4 md:p-5 rounded-xl shadow border mb-8">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <input
            placeholder="🔎 Buscar vinho..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="p-2 md:p-3 border rounded-lg w-full md:w-1/2 focus:ring-2 focus:ring-purple-500 outline-none"
          />

          <div className="flex flex-col gap-2 mt-2 md:mt-0">
            <p className="text-sm font-medium mb-2 text-stone-600">
              Filtrar por nota
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() =>
                    setFiltroNota(filtroNota === String(n) ? "" : String(n))
                  }
                  className={`px-2 py-1 md:px-3 md:py-2 rounded-lg border text-sm transition ${
                    filtroNota === String(n)
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-white hover:bg-purple-50 border-stone-300"
                  }`}
                >
                  {n}★
                </button>
              ))}
            </div>

            {(busca || filtroNota) && (
              <button
                onClick={limparFiltros}
                className="text-sm text-purple-600 hover:underline text-left mt-1"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* LISTA DE VINHOS */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-2 md:gap-6">
        {degustacoesFiltradas.map((item) => (
          <div 
            key={item.id}
            className="bg-white p-3 md:p-4 rounded-xl shadow border flex flex-col"
          >
            {item.imagem_url && (
              <img
                src={item.imagem_url}
                alt="Vinho"
                className="w-full h-32 md:h-48 object-cover rounded-lg mb-2 md:mb-4"
              />
            )}

            <h3 className="font-bold text-sm md:text-lg mb-1">
              {item.nome_vinho}
            </h3>

            <p className="text-xs md:text-sm text-stone-600 mb-1">
              {item.uva} • {item.pais}
            </p>

            <div className="text-yellow-400 mb-1 text-sm">
              {"★".repeat(item.nota)}
            </div>

            <p className="text-xs md:text-sm mb-2 line-clamp-3">
              {item.observacoes}
            </p>

            <button
              onClick={() => handleDelete(item.id)}
              className="text-red-500 text-xs md:text-sm hover:underline mt-auto"
            >
              Excluir
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}