import { cookies } from "next/headers";

export default async function CookieTestPage() {
  const cookieStore = await cookies();

  const cookieNames = cookieStore
    .getAll()
    .map((cookie) => cookie.name);

  const betterAuthCookies =
    cookieNames.filter((name) =>
      name.toLowerCase().includes("better-auth")
    );

  const sessionCookies =
    cookieNames.filter((name) =>
      name.toLowerCase().includes("session")
    );

  return (
    <main className="min-h-screen bg-[#080808] px-6 py-20 text-[#f4f0e8]">
      <div className="mx-auto max-w-2xl">
        <p className="text-[10px] uppercase tracking-[0.5em] text-[#c7a96b]">
          EL MARA / DEBUG
        </p>

        <h1 className="mt-6 text-4xl font-light">
          Cookies de session
        </h1>

        <div className="mt-10 border border-white/10 bg-[#0b0b0b] p-8">
          <p className="text-sm text-white/40">
            Cookies Better Auth
          </p>

          <pre className="mt-4 overflow-auto text-sm text-[#c7a96b]">
            {JSON.stringify(
              betterAuthCookies,
              null,
              2
            )}
          </pre>

          <p className="mt-8 text-sm text-white/40">
            Cookies contenant "session"
          </p>

          <pre className="mt-4 overflow-auto text-sm text-[#c7a96b]">
            {JSON.stringify(
              sessionCookies,
              null,
              2
            )}
          </pre>

          <p className="mt-8 text-sm text-white/40">
            Tous les noms de cookies
          </p>

          <pre className="mt-4 overflow-auto text-sm text-white/50">
            {JSON.stringify(
              cookieNames,
              null,
              2
            )}
          </pre>
        </div>
      </div>
    </main>
  );
}