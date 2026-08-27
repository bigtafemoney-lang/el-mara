import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function SessionTestPage() {
  const requestHeaders = await headers();

  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#080808",
        color: "#f4f0e8",
        padding: "60px 24px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 300,
          }}
        >
          EL MARA — Session Test
        </h1>

        {session ? (
          <>
            <p
              style={{
                marginTop: "30px",
                color: "#c7a96b",
              }}
            >
              SESSION ACTIVE ✅
            </p>

            <pre
              style={{
                marginTop: "20px",
                padding: "20px",
                overflow: "auto",
                background: "#111",
                border: "1px solid #222",
              }}
            >
              {JSON.stringify(
                session,
                null,
                2
              )}
            </pre>
          </>
        ) : (
          <>
            <p
              style={{
                marginTop: "30px",
                color: "#ff5c5c",
              }}
            >
              AUCUNE SESSION ❌
            </p>

            <p
              style={{
                marginTop: "15px",
                color: "rgba(244,240,232,.5)",
              }}
            >
              Next.js ne reçoit pas actuellement
              une session Better Auth valide.
            </p>
          </>
        )}
      </div>
    </main>
  );
}