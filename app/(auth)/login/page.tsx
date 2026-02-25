"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log("LOGIN DATA:", data)
    console.log("LOGIN ERROR:", error)

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    // 🔥 ESSENCIAL para sincronizar sessão com Server Components
    router.refresh()

    // Pequeno delay garante que cookie foi salvo
    setTimeout(() => {
      router.push("/dashboard")
    }, 100)
  }

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-stone-200">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Entrar no WineMind 🍷
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Seu email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded-lg border border-stone-300 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
        />

        <input
          type="password"
          placeholder="Sua senha"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-lg border border-stone-300 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="mt-6 text-sm text-center text-stone-600">
        Não tem conta?{" "}
        <a href="/register" className="text-purple-600 font-semibold">
          Criar conta
        </a>
      </p>
    </div>
  )
}