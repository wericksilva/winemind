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
  const [mensagem, setMensagem] = useState("")

  const [form, setForm] = useState({
    nome_vinho: "",
    uva: "",
    pais: "",
    data_degustacao: "",
    nota: 0,
    observacoes: "",
  })

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

  const { error } = await supabase.from("degustacoes").insert({
    ...form,
    imagem_url: imagemUrl,
    user_id: userData.user?.id,
  })

  if (!error) {
    // ✅ ALERTA PARA O USUÁRIO
    window.alert("Degustação cadastrada com sucesso! 🍷\nAgora você pode visualizar na lista de vinhos.")
  } else {
    window.alert("Erro ao cadastrar degustação 😢")
  }

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
    const matchNota = filtroNota ? item.nota === Number(filtroNota) : true
    return matchBusca && matchNota
  })

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Cadastrar Degustação 🍷</h2>

      {/* MENSAGEM DE SUCESSO */}
      {mensagem && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded shadow">
          {mensagem}
        </div>
      )}

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

          <div>
            <label className="block font-semibold mb-2">
              Data da degustação
            </label>

            <input
              type="date"
              value={form.data_degustacao}
              onChange={(e) =>
                setForm({ ...form, data_degustacao: e.target.value })
              }
              className="p-3 border rounded-lg"
            />
          </div>
        </div>

        {/* NOTA EM ESTRELAS */}
        <div>
          <label className="block font-semibold mb-2">Nota do vinho</label>
          <div className="flex gap-2 text-2xl cursor-pointer">
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                onClick={() => setForm({ ...form, nota: n })}
                className={n <= form.nota ? "text-yellow-400" : "text-gray-300"}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        {/* UPLOAD MODERNO */}
        <div>
          <label className="block font-semibold mb-3">Foto do vinho</label>

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
    </div>
  )
}