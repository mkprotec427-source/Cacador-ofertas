import "./globals.css";
import Link from "next/link";
export const metadata = { title: "Caçador de Ofertas" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-stone-100 text-stone-900 min-h-screen">
        <header className="bg-stone-900 text-white">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-bold text-lg">🎯 Caçador de Ofertas</Link>
            <Link href="/nova" className="rounded bg-orange-500 px-3 py-1.5 text-sm font-semibold hover:bg-orange-600">Adicionar oferta</Link>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
        <footer className="mx-auto max-w-5xl px-4 pb-8 text-xs text-stone-500">Esta ferramenta é um assistente de curadoria. Os preços, cupons, estoque e condições devem ser conferidos antes da publicação.</footer>
      </body>
    </html>
  );
}
