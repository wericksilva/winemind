"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function RegisterPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleRegister() {
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      alert(error.message)
      return
    }

    alert("Conta criada com sucesso!")
    router.push("/dashboard")
  }

  return (
    <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-stone-800">
        Criar Conta 🍷
      </h2>

      <input
        type="email"
        placeholder="Email"
        className="w-full mb-4 p-3 border border-stone-300 rounded-lg"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Senha"
        className="w-full mb-6 p-3 border border-stone-300 rounded-lg"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleRegister}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg font-semibold"
      >
        {loading ? "Criando..." : "Cadastrar"}
      </button>
    </div>
  )
}