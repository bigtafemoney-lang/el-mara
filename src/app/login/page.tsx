"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { signIn } from "@/lib/auth-client";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const callbackUrl =
    searchParams.get("callbackUrl") || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError(null);
    setLoading(true);

    try {
      const result = await signIn.email({
        email: email.trim().toLowerCase(),
        password,
        callbackURL: callbackUrl,
      });

      if (result.error) {
        setError(
          result.error.message ||
            "Email ou mot de passe incorrect."
        );
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      console.error("LOGIN_ERROR", error);

      setError(
        "Une erreur est survenue pendant la connexion."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#080808] px-6 py-20 text-[#f4f0e8]">
      <div className="mx-auto max-w-md">

        <Link
          href="/"
          className="text-[10px] uppercase tracking-[0.35em] text-white/40 transition-colors hover:text-[#c7a96b]"
        >
          ← EL MARA
        </Link>

        <div className="mt-20">
          <p className="text-[10px] uppercase tracking-[0.5em] text-[#c7a96b]">
            EL MARA ACCOUNT
          </p>

          <h1 className="mt-5 text-5xl font-light">
            Connexion
          </h1>

          <p className="mt-5 text-sm leading-7 text-white/40">
            Connecte-toi à ton espace client EL MARA.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-4"
        >
          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
            autoComplete="email"
            placeholder="Email"
            className="h-14 w-full border border-white/10 bg-transparent px-4 text-sm outline-none placeholder:text-white/20 focus:border-[#c7a96b]/60"
          />

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
            autoComplete="current-password"
            placeholder="Mot de passe"
            className="h-14 w-full border border-white/10 bg-transparent px-4 text-sm outline-none placeholder:text-white/20 focus:border-[#c7a96b]/60"
          />

          {error && (
            <p className="text-sm leading-6 text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-14 w-full items-center justify-center bg-[#c7a96b] text-xs uppercase tracking-[0.3em] text-black transition-all hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Connexion..."
              : "Se connecter"}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-4 text-sm text-white/30">
          <p>
            Pas encore de compte ?{" "}
            <Link
              href="/register"
              className="text-[#c7a96b] transition-colors hover:text-white"
            >
              Créer un compte
            </Link>
          </p>

          <Link
            href="/forgot-password"
            className="text-[10px] uppercase tracking-[0.3em] text-white/25 transition-colors hover:text-[#c7a96b]"
          >
            Mot de passe oublié
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
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
      <LoginContent />
    </Suspense>
  );
}