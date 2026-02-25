import "./globals.css"

export const metadata = {
  title: "WineMind 🍷",
  description: "Diário Inteligente de Degustação",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}