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

type Review = {
  id: string
  user_id: string
  rating: number
  comment: string
  created_at: string
}

export default function VinhosPage() {
  const [degustacoes, setDegustacoes] = useState<Degustacao[]>([])
  const [busca, setBusca] = useState("")
  const [filtroNota, setFiltroNota] = useState("")
  const [selectedVinho, setSelectedVinho] = useState<Degustacao | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [newRating, setNewRating] = useState(0)
  const [newComment, setNewComment] = useState("")

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

  async function loadReviews(vinhoId: string) {
    const { data } = await supabase
      .from("wine_reviews")
      .select("*")
      .eq("degustacao_id", vinhoId)
      .order("created_at", { ascending: false })
    if (data) setReviews(data)
  }

  async function handleSubmitReview() {
    if (!selectedVinho || newRating <= 0) return
    await supabase.from("wine_reviews").insert({
      degustacao_id: selectedVinho.id,
      rating: newRating,
      comment: newComment,
    })
    setNewRating(0)
    setNewComment("")
    loadReviews(selectedVinho.id)
  }

  const degustacoesFiltradas = degustacoes.filter((item) => {
    const matchBusca = item.nome_vinho.toLowerCase().includes(busca.toLowerCase())
    const matchNota = filtroNota ? item.nota === Number(filtroNota) : true
    return matchBusca && matchNota
  })

  return (
    <div className="px-2 md:px-0">
      <h2 className="text-3xl font-bold mb-6">Vinhos Degustados 🍷</h2>

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
            <p className="text-sm font-medium mb-2 text-stone-600">Filtrar por nota</p>
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
          </div>
        </div>
      </div>

      {/* LISTA DE VINHOS */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-2 md:gap-6">
        {degustacoesFiltradas.map((item) => (
          <div
            key={item.id}
            className="bg-white p-3 md:p-4 rounded-xl shadow border flex flex-col cursor-pointer hover:shadow-lg transition"
            onClick={() => {
              setSelectedVinho(item)
              loadReviews(item.id)
            }}
          >
            {item.imagem_url && (
              <img
                src={item.imagem_url}
                alt="Vinho"
                className="w-full h-32 md:h-48 object-cover rounded-lg mb-2 md:mb-4"
              />
            )}
            <h3 className="font-bold text-sm md:text-lg mb-1">{item.nome_vinho}</h3>
            <p className="text-xs md:text-sm text-stone-600 mb-1">{item.uva} • {item.pais}</p>
            <div className="text-yellow-400 mb-1 text-sm">{"★".repeat(item.nota)}</div>
            <p className="text-xs md:text-sm mb-2 line-clamp-3">{item.observacoes}</p>
          </div>
        ))}
      </div>

{/* MODAL DETALHE VINHO + AVALIAÇÕES */}
{selectedVinho && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
    {/* Container principal do modal, com scroll interno */}
    <div className="relative w-full max-w-lg max-h-[90vh] bg-white rounded-xl overflow-y-auto shadow-lg p-6">
      
      {/* Botão de fechar fixo no topo direito */}
      <button
        onClick={() => setSelectedVinho(null)}
        className="absolute top-4 right-4 text-xl font-bold bg-white rounded-full p-1 shadow hover:bg-gray-100"
      >
        ✕
      </button>

      {selectedVinho.imagem_url && (
        <img
          src={selectedVinho.imagem_url}
          className="w-full h-56 md:h-72 object-cover rounded-lg mb-4"
        />
      )}

      <h3 className="text-xl font-bold">{selectedVinho.nome_vinho}</h3>
      <p className="text-sm text-stone-600">{selectedVinho.uva} • {selectedVinho.pais}</p>
      <p className="text-yellow-400 text-lg mt-2">{"★".repeat(selectedVinho.nota)}</p>
      <p className="text-sm mt-4">{selectedVinho.observacoes}</p>
      <p className="text-xs text-stone-400 mt-2">
        Degustado em {new Date(selectedVinho.data_degustacao).toLocaleDateString("pt-BR")}
      </p>

      {/* BOTÃO DE EXCLUIR VINHO */}
      <button
        onClick={async () => {
          if (!selectedVinho) return;
          const confirmDelete = confirm(
            `Tem certeza que deseja excluir "${selectedVinho.nome_vinho}" e todas as avaliações?`
          );
          if (!confirmDelete) return;

          try {
            // 1. Deletar reviews
            await supabase
              .from("wine_reviews")
              .delete()
              .eq("degustacao_id", selectedVinho.id);

            // 2. Deletar vinho
            await supabase
              .from("degustacoes")
              .delete()
              .eq("id", selectedVinho.id);

            // 3. Atualizar lista local
            setDegustacoes((prev) =>
              prev.filter((v) => v.id !== selectedVinho.id)
            );

            // 4. Fechar modal
            setSelectedVinho(null);
          } catch (error) {
            console.error("Erro ao excluir vinho:", error);
            alert("Não foi possível excluir o vinho. Tente novamente.");
          }
        }}
        className="mt-4 w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Excluir Vinho
      </button>

      {/* AVALIAÇÃO */}
      <div className="mt-4 border-t pt-4">
        <h4 className="font-bold mb-2">Deixe sua avaliação</h4>
        <div className="flex items-center gap-2 mb-2">
          {[1,2,3,4,5].map((n) => (
            <button
              key={n}
              onClick={() => setNewRating(n)}
              className={`px-2 py-1 rounded border text-sm ${
                newRating === n ? "bg-purple-600 text-white" : "bg-white hover:bg-purple-50 border-stone-300"
              }`}
            >
              {n}★
            </button>
          ))}
        </div>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Seu comentário..."
          className="w-full border p-2 rounded mb-2"
        />
        <button
          onClick={handleSubmitReview}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Enviar
        </button>
      </div>

      {/* LISTA DE AVALIAÇÕES */}
<div className="mt-4 border-t pt-4">
  <h4 className="font-bold mb-2">Avaliações</h4>
  {reviews.length === 0 && <p className="text-sm text-stone-500">Nenhuma avaliação ainda.</p>}
  {reviews.map((r) => (
    <div key={r.id} className="border-b py-2 flex justify-between items-start">
      <div>
        <p className="text-yellow-400">{"★".repeat(r.rating)}</p>
        <p className="text-sm">{r.comment}</p>
        <p className="text-xs text-stone-400">
          {new Date(r.created_at).toLocaleDateString("pt-BR")}
        </p>
      </div>
      {/* Botão de excluir avaliação */}
      <button
        onClick={async () => {
          const confirmDelete = confirm("Deseja realmente excluir esta avaliação?")
          if (!confirmDelete) return

          try {
            await supabase
              .from("wine_reviews")
              .delete()
              .eq("id", r.id)

            // Atualiza lista local sem a avaliação excluída
            setReviews((prev) => prev.filter((rev) => rev.id !== r.id))
          } catch (error) {
            console.error("Erro ao excluir avaliação:", error)
            alert("Não foi possível excluir a avaliação. Tente novamente.")
          }
        }}
        className="ml-4 text-red-600 hover:text-red-800 text-sm font-bold"
        title="Excluir avaliação"
      >
        🗑️
      </button>
    </div>
  ))}
</div>

    </div>
  </div>
)}
    </div>
  )
}