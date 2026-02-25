"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts"

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

type CountItem = {
  key: string
  quantidade: number
}

export default function DashboardPage() {
  const [degustacoes, setDegustacoes] = useState<Degustacao[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [melhorVinho, setMelhorVinho] = useState<Degustacao | null>(null)

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from("degustacoes").select("*")
      if (data) setDegustacoes(data)
    }
    fetchData()
  }, [])

  if (!degustacoes.length) {
    return <p>Nenhuma degustação cadastrada.</p>
  }

  const total = degustacoes.length

  const media =
    degustacoes.reduce((acc, d) => acc + d.nota, 0) / total

  const melhor =
    degustacoes.reduce((prev, current) =>
      prev.nota > current.nota ? prev : current
    )

  // 🍩 Donut Chart - Distribuição de Notas com exemplo de vinho
  const distribuicao = [1, 2, 3, 4, 5].map((nota) => {
    const vinhos = degustacoes
      .filter((d) => d.nota === nota)
      .map((d) => d.nome_vinho)
    return {
      name: `${nota}★`,
      value: vinhos.length,
      example: vinhos[0] || "",
    }
  })

  const COLORS = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#84cc16",
    "#22c55e",
  ]

  // 🌍 Ranking País
  const paisCount: { pais: string; quantidade: number }[] = Object.entries(
    degustacoes.reduce((acc: Record<string, number>, item) => {
      acc[item.pais] = (acc[item.pais] || 0) + 1
      return acc
    }, {})
  )
    .map(([pais, quantidade]) => ({ pais, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 5)

  // 🍇 Ranking Uva
  const uvaCount: { uva: string; quantidade: number }[] = Object.entries(
    degustacoes.reduce((acc: Record<string, number>, item) => {
      acc[item.uva] = (acc[item.uva] || 0) + 1
      return acc
    }, {})
  )
    .map(([uva, quantidade]) => ({ uva, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 5)

  return (
    <div className="space-y-10">
      <h2 className="text-3xl font-bold">Dashboard 🍷</h2>

      {/* CARDS PRINCIPAIS */}
      <div className="grid md:grid-cols-3 gap-6">
        <GlassCard titulo="Total Degustações" valor={total} />
        <GlassCard titulo="Média Geral" valor={media.toFixed(1)} />

        <div
          onClick={() => {
            setMelhorVinho(melhor)
            setModalOpen(true)
          }}
          className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-6 rounded-xl shadow-lg cursor-pointer hover:scale-105 transition"
        >
          <p className="text-sm opacity-80">🏆 Melhor Vinho</p>
          <h3 className="text-xl font-bold">{melhor.nome_vinho}</h3>
          <p>{"★".repeat(melhor.nota)}</p>
          <p className="text-xs mt-2">Clique para ver detalhes</p>
        </div>
      </div>

      {/* GRID GRÁFICOS */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* DONUT */}
        <div className="bg-white p-6 rounded-xl shadow border">
          <h3 className="font-bold mb-4">Distribuição de Notas</h3>

          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={distribuicao}
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                paddingAngle={5}
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${( (percent ?? 0) * 100 ).toFixed(0)}%`
                }
              >
                {distribuicao.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(_, name, props) => {
                  const d = props.payload as typeof distribuicao[0]
                  return [`${d.value} degustações`, d.example || name]
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* RANKING PAÍS */}
        <div className="bg-white p-6 rounded-xl shadow border">
          <h3 className="font-bold mb-4">Top Países 🌍</h3>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={paisCount}>
              <XAxis dataKey="pais" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="quantidade" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* RANKING UVA */}
        <div className="bg-white p-6 rounded-xl shadow border">
          <h3 className="font-bold mb-4">Top Uvas 🍇</h3>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={uvaCount}>
              <XAxis dataKey="uva" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="quantidade" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && melhorVinho && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-xl p-6 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-3"
            >
              ✕
            </button>

            {melhorVinho.imagem_url && (
              <img
                src={melhorVinho.imagem_url}
                className="w-full h-56 object-cover rounded-lg mb-4"
              />
            )}

            <h3 className="text-xl font-bold">{melhorVinho.nome_vinho}</h3>

            <p className="text-sm text-stone-600">
              {melhorVinho.uva} • {melhorVinho.pais}
            </p>

            <p className="text-yellow-400 text-lg mt-2">
              {"★".repeat(melhorVinho.nota)}
            </p>

            <p className="text-sm mt-4">{melhorVinho.observacoes}</p>

            <p className="text-xs text-stone-400 mt-4">
              Degustado em{" "}
              {new Date(
                melhorVinho.data_degustacao
              ).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function GlassCard({
  titulo,
  valor,
}: {
  titulo: string
  valor: number | string
}) {
  return (
    <div className="bg-white/70 backdrop-blur-lg p-6 rounded-xl shadow border">
      <p className="text-sm text-stone-500">{titulo}</p>
      <h3 className="text-2xl font-bold mt-2">{valor}</h3>
    </div>
  )
}