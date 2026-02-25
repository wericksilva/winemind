"use client"

import Link from "next/link"
import { Users, Plus } from "lucide-react"

export default function GruposPage() {
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h2 className="text-3xl font-bold text-stone-800">
          Meus Grupos 👥
        </h2>

        <Link
          href="/grupos/novo"
          className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg font-semibold transition"
        >
          <Plus size={18} />
          Criar Grupo
        </Link>
      </div>

      {/* Lista vazia */}
      <div className="bg-white rounded-2xl shadow-sm border p-10 text-center">
        <Users className="mx-auto mb-4 text-stone-400" size={40} />

        <p className="text-stone-500">
          Você ainda não participa de nenhum grupo.
        </p>

        <p className="text-sm text-stone-400 mt-2">
          Crie um grupo e convide seus amigos 🍷
        </p>
      </div>
    </div>
  )
}