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

export default function DegustacoesPage() {
  const [degustacoes, setDegustacoes] = useState<Degustacao[]>([])
  const [loading, setLoading] = useState(false)
  const [imagem, setImagem] = useState<File | null>(null)
  const [busca, setBusca] = useState("")
  const [filtroNota, setFiltroNota] = useState("")

  const [form, setForm] = useState({
    nome_vinho: "",
    uva: "",
    pais: "",
    data_degustacao: "",
    nota: 0,
    observacoes: "",
  })

  // ✅ React 19 safe
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()

    let imagemUrl: string | null = null

    if (imagem) {
      const fileExt = imagem.name.split(".").pop()
      const fileName = `${crypto.randomUUID()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from("vinhos")
        .upload(fileName, imagem)

      if (!uploadError) {
        const { data } = supabase.storage
          .from("vinhos")
          .getPublicUrl(fileName)

        imagemUrl = data.publicUrl
      }
    }

    await supabase.from("degustacoes").insert({
      ...form,
      imagem_url: imagemUrl,
      user_id: userData.user?.id,
    })

    setForm({
      nome_vinho: "",
      uva: "",
      pais: "",
      data_degustacao: "",
      nota: 0,
      observacoes: "",
    })

    setImagem(null)
    await loadDegustacoes()
    setLoading(false)
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

    const matchNota = filtroNota
      ? item.nota === Number(filtroNota)
      : true

    return matchBusca && matchNota
  })

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">
        Minhas Degustações 🍷
      </h2>

      {/* FILTROS */}
      {/* FILTROS */}
<div className="bg-white p-5 rounded-xl shadow border mb-8">
  <div className="flex flex-col md:flex-row gap-6 md:items-center md:justify-between">

    {/* BUSCA */}
    <input
      placeholder="🔎 Buscar vinho..."
      value={busca}
      onChange={(e) => setBusca(e.target.value)}
      className="p-3 border rounded-lg w-full md:w-1/2 focus:ring-2 focus:ring-purple-500 outline-none"
    />

    {/* FILTRO POR NOTA */}
 {/* FILTROS */}
<div className="bg-white p-5 rounded-xl shadow border mb-8">
  <div className="flex flex-col md:flex-row gap-6 md:items-center md:justify-between">

    

    <div className="flex flex-col gap-2">

      {/* FILTRO POR NOTA */}
      <div>
        <p className="text-sm font-medium mb-2 text-stone-600">
          Filtrar por nota
        </p>

        <div className="flex gap-2">
          {[1,2,3,4,5].map((n) => (
            <button
              key={n}
              onClick={() =>
                setFiltroNota(filtroNota === String(n) ? "" : String(n))
              }
              className={`px-3 py-2 rounded-lg border transition ${
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

      {/* LIMPAR FILTROS */}
      {(busca || filtroNota) && (
        <button
          onClick={limparFiltros}
          className="text-sm text-purple-600 hover:underline text-left"
        >
          Limpar filtros
        </button>
      )}
    </div>

  </div>
</div>

  </div>
</div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow border mb-10 space-y-6"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <input
            placeholder="Nome do vinho"
            required
            value={form.nome_vinho}
            onChange={(e) =>
              setForm({ ...form, nome_vinho: e.target.value })
            }
            className="p-3 border rounded-lg"
          />

          <input
            placeholder="Uva"
            value={form.uva}
            onChange={(e) =>
              setForm({ ...form, uva: e.target.value })
            }
            className="p-3 border rounded-lg"
          />

          <input
            placeholder="País"
            value={form.pais}
            onChange={(e) =>
              setForm({ ...form, pais: e.target.value })
            }
            className="p-3 border rounded-lg"
          />

          <input
            type="date"
            value={form.data_degustacao}
            onChange={(e) =>
              setForm({ ...form, data_degustacao: e.target.value })
            }
            className="p-3 border rounded-lg"
          />
        </div>

        {/* NOTA EM ESTRELAS */}
        <div>
          <label className="block font-semibold mb-2">
            Nota do vinho
          </label>
          <div className="flex gap-2 text-2xl cursor-pointer">
            {[1,2,3,4,5].map((n) => (
              <span
                key={n}
                onClick={() =>
                  setForm({ ...form, nota: n })
                }
                className={
                  n <= form.nota
                    ? "text-yellow-400"
                    : "text-gray-300"
                }
              >
                ★
              </span>
            ))}
          </div>
        </div>

        {/* UPLOAD MODERNO */}
        <div>
          <label className="block font-semibold mb-3">
            Foto do vinho
          </label>

          <div className="border-2 border-dashed border-stone-300 rounded-xl p-6 text-center hover:border-purple-500 transition bg-stone-50">
            {imagem ? (
              <div className="space-y-4">
                <img
                  src={URL.createObjectURL(imagem)}
                  alt="Preview"
                  className="mx-auto h-48 object-cover rounded-lg shadow"
                />

                <button
                  type="button"
                  onClick={() => setImagem(null)}
                  className="text-sm text-red-500 hover:underline"
                >
                  Remover imagem
                </button>
              </div>
            ) : (
              <label className="cursor-pointer inline-block bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition">
                Selecionar imagem
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    setImagem(e.target.files?.[0] || null)
                  }
                />
              </label>
            )}
          </div>
        </div>

        <textarea
          placeholder="Observações"
          value={form.observacoes}
          onChange={(e) =>
            setForm({ ...form, observacoes: e.target.value })
          }
          className="w-full p-3 border rounded-lg"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
        >
          {loading ? "Salvando..." : "Salvar Degustação"}
        </button>
      </form>

      {/* LISTA */}
      <div className="grid md:grid-cols-2 gap-6">
        {degustacoesFiltradas.map((item) => (
          <div
            key={item.id}
            className="bg-white p-6 rounded-xl shadow border"
          >
            {item.imagem_url && (
              <img
                src={item.imagem_url}
                alt="Vinho"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}

            <h3 className="font-bold text-lg mb-1">
              {item.nome_vinho}
            </h3>

            <p className="text-sm text-stone-600 mb-2">
              {item.uva} • {item.pais}
            </p>

            <div className="text-yellow-400 mb-2">
              {"★".repeat(item.nota)}
            </div>

            <p className="text-sm mb-4">
              {item.observacoes}
            </p>

            <button
              onClick={() => handleDelete(item.id)}
              className="text-red-500 text-sm hover:underline"
            >
              Excluir
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}