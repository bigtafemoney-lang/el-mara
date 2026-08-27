import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function AccountPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[#080808] text-[#f4f0e8]">
      <div className="mx-auto max-w-6xl px-6 py-10 md:px-12">

        <header className="flex items-center justify-between border-b border-white/10 pb-8">
          <Link
            href="/"
            className="text-[10px] uppercase tracking-[0.35em] text-white/40 transition-colors hover:text-[#c7a96b]"
          >
            ← EL MARA
          </Link>

          <div className="text-xs tracking-[0.45em]">
            EL MARA
          </div>

          <Link
            href="/collection"
            className="text-[10px] uppercase tracking-[0.3em] text-[#c7a96b]"
          >
            Collection
          </Link>
        </header>

        <section className="mt-20">
          <p className="text-[10px] uppercase tracking-[0.5em] text-[#c7a96b]">
            MY ACCOUNT
          </p>

          <h1 className="mt-6 text-5xl font-light md:text-7xl">
            Bonjour,
            <br />
            <span className="text-white/50">
              {session.user.name}
            </span>
          </h1>

          <p className="mt-8 text-sm text-white/40">
            {session.user.email}
          </p>
        </section>

        <section className="mt-16 grid gap-6 md:grid-cols-3">

          <Link
            href="/account?edit=true"
            className="border border-white/10 bg-[#0b0b0b] p-8 transition-colors hover:border-[#c7a96b]/40"
          >
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#c7a96b]">
              Profil
            </p>

            <p className="mt-6 text-sm text-white/50">
              Modifier mes informations
            </p>
          </Link>

          <Link
            href="/cart"
            className="border border-white/10 bg-[#0b0b0b] p-8 transition-colors hover:border-[#c7a96b]/40"
          >
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#c7a96b]">
              Panier
            </p>

            <p className="mt-6 text-sm text-white/50">
              Voir mes articles
            </p>
          </Link>

          <Link
            href="/orders"
            className="border border-white/10 bg-[#0b0b0b] p-8 transition-colors hover:border-[#c7a96b]/40"
          >
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#c7a96b]">
              Commandes
            </p>

            <p className="mt-6 text-sm text-white/50">
              Voir mes commandes
            </p>
          </Link>

        </section>

      </div>
    </main>
  );
}