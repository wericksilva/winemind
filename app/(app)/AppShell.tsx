"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function AppShell({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogout() {
    setLoading(true)
    await supabase.auth.signOut()
    setLoading(false)
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800">

      {/* HEADER MOBILE */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white border-b shadow-sm">
        <h1 className="text-xl font-bold text-purple-600">
          WineMind 🍷
        </h1>

        <button
          onClick={() => setOpen(true)}
          className="text-2xl"
        >
          ☰
        </button>
      </header>

      <div className="flex">

        {/* SIDEBAR */}
        <aside
          className={`
            fixed md:static top-0 left-0 h-screen
            w-64 md:w-72 lg:w-80
            bg-white border-r shadow-sm z-40
            transform ${open ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0 transition-transform duration-300
          `}
        >
          <div className="p-6 md:p-8 flex flex-col h-full">

            <h1 className="text-2xl font-bold text-purple-600 hidden md:block">
              WineMind 🍷
            </h1>

            <nav className="mt-8 space-y-2 text-stone-600 flex-1">

              <Link
                href="/dashboard"
                className="block px-4 py-3 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition"
                onClick={() => setOpen(false)}
              >
                Dashboard
              </Link>

              <Link
                href="/vinhos"
                className="block px-4 py-3 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition"
                onClick={() => setOpen(false)}
              >
                Vinhos
              </Link>

              <Link
                href="/degustacoes"
                className="block px-4 py-3 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition"
                onClick={() => setOpen(false)}
              >
                Degustações
              </Link>

              <Link
                href="/grupos"
                className="block px-4 py-3 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition"
                onClick={() => setOpen(false)}
              >
                Grupos
              </Link>

            </nav>

            <button
              onClick={handleLogout}
              disabled={loading}
              className="mt-6 w-full px-4 py-3 rounded-lg bg-stone-200 hover:bg-red-100 hover:text-red-600 transition font-medium disabled:opacity-50"
            >
              {loading ? "Saindo..." : "Sair da Conta"}
            </button>

          </div>
        </aside>

        {open && (
          <div
            className="fixed inset-0 bg-black/40 md:hidden z-30"
            onClick={() => setOpen(false)}
          />
        )}

        <main className="flex-1 p-6 md:p-10">
          {children}
        </main>

      </div>
    </div>
  )
}