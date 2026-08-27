"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function VerifyEmailContent() {
  const searchParams = useSearchParams();

  const email = searchParams.get("email");
  const sent = searchParams.get("sent");
  const error = searchParams.get("error");

  const invalid = error === "invalid_token";

  if (invalid) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] px-6 text-[#f4f0e8]">
        <div className="w-full max-w-md text-center">

          <p className="text-[10px] uppercase tracking-[0.5em] text-[#c7a96b]">
            EL MARA
          </p>

          <div className="mx-auto mt-10 flex h-16 w-16 items-center justify-center rounded-full border border-red-500/40 text-2xl text-red-400">
            !
          </div>

          <h1 className="mt-8 text-4xl font-light">
            Vérification impossible
          </h1>

          <p className="mt-5 text-sm leading-7 text-white/40">
            Le lien de vérification est invalide ou a expiré.
          </p>

          <Link
            href="/register"
            className="mt-10 inline-flex min-h-14 items-center justify-center border border-[#c7a96b] bg-[#c7a96b] px-8 text-xs uppercase tracking-[0.3em] text-black transition-all duration-500 hover:bg-transparent hover:text-[#c7a96b]"
          >
            Créer un nouveau compte
          </Link>

        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080808] px-6 text-[#f4f0e8]">
      <div className="w-full max-w-md text-center">

        <p className="text-[10px] uppercase tracking-[0.5em] text-[#c7a96b]">
          EL MARA
        </p>

        <div className="mx-auto mt-10 flex h-16 w-16 items-center justify-center rounded-full border border-[#c7a96b]/60 text-2xl text-[#c7a96b]">
          ✓
        </div>

        <h1 className="mt-8 text-4xl font-light">
          Vérifie ton email
        </h1>

        <p className="mt-5 text-sm leading-7 text-white/40">
          Nous avons envoyé un email de vérification.
        </p>

        {email && (
          <p className="mt-4 break-all text-sm text-[#c7a96b]">
            {email}
          </p>
        )}

        {sent && (
          <p className="mt-8 text-xs leading-6 text-white/25">
            Clique sur le lien reçu dans ton email.
            Après une vérification réussie, tu seras
            automatiquement connecté et redirigé vers
            ton espace client EL MARA.
          </p>
        )}

        <Link
          href="/"
          className="mt-10 inline-flex min-h-14 items-center justify-center border border-white/10 px-8 text-xs uppercase tracking-[0.3em] text-white/50 transition-all duration-500 hover:border-[#c7a96b] hover:text-[#c7a96b]"
        >
          Retour à l'accueil
        </Link>

      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#080808] text-[#f4f0e8]">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#c7a96b]">
            Loading
          </p>
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}