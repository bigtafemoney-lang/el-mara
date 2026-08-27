import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

function formatPrice(
  value: number
) {
  return `${value.toLocaleString("fr-FR")} Kz`;
}

function getStatusLabel(
  status: string
) {
  switch (status) {
    case "PENDING":
      return "En attente";

    case "PROCESSING":
      return "En traitement";

    case "COMPLETED":
      return "Terminée";

    case "CANCELLED":
      return "Annulée";

    default:
      return status;
  }
}

export default async function OrdersPage() {
  const session =
    await auth.api.getSession({
      headers: await headers(),
    });

  if (!session) {
    redirect("/login?callbackUrl=/orders");
  }

  const orders =
    await prisma.order.findMany({
      where: {
        userId:
          session.user.id,
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  return (
    <main className="min-h-screen bg-[#080808] text-[#f4f0e8]">

      <header className="border-b border-white/10 px-6 py-6 md:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between">

          <Link
            href="/account"
            className="text-[10px] uppercase tracking-[0.35em] text-white/40 hover:text-[#c7a96b]"
          >
            ← Compte
          </Link>

          <Link
            href="/"
            className="text-xs font-light tracking-[0.45em]"
          >
            EL MARA
          </Link>

          <Link
            href="/collection"
            className="text-[10px] uppercase tracking-[0.35em] text-white/40 hover:text-[#c7a96b]"
          >
            Collection
          </Link>

        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-16 md:px-12 md:py-24">

        <p className="text-[10px] uppercase tracking-[0.5em] text-[#c7a96b]">
          EL MARA / ORDERS
        </p>

        <h1 className="mt-5 text-5xl font-light md:text-7xl">
          Mes commandes
        </h1>

        <p className="mt-6 text-sm leading-7 text-white/35">
          Bonjour {session.user.name}.
          Retrouve ici l'historique de tes commandes.
        </p>

        {orders.length === 0 ? (
          <section className="mt-16 border border-white/10 bg-[#0b0b0b] p-10 text-center">

            <p className="text-sm text-white/30">
              Tu n'as encore aucune commande.
            </p>

            <Link
              href="/collection"
              className="mt-8 inline-flex min-h-14 items-center justify-center bg-[#c7a96b] px-8 text-[10px] uppercase tracking-[0.3em] text-black transition-all hover:bg-white"
            >
              Découvrir la collection
            </Link>

          </section>
        ) : (
          <div className="mt-16 space-y-6">

            {orders.map(
              (order) => (
                <article
                  key={order.id}
                  className="border border-white/10 bg-[#0b0b0b] p-7 md:p-9"
                >

                  <div className="flex flex-col gap-5 border-b border-white/10 pb-6 md:flex-row md:items-start md:justify-between">

                    <div>

                      <p className="text-[9px] uppercase tracking-[0.35em] text-[#c7a96b]">
                        Commande
                      </p>

                      <h2 className="mt-2 text-xl font-light">
                        #{order.id}
                      </h2>

                      <p className="mt-2 text-xs text-white/25">
                        {new Date(
                          order.createdAt
                        ).toLocaleString(
                          "fr-FR"
                        )}
                      </p>

                    </div>

                    <div className="text-left md:text-right">

                      <span className="inline-flex border border-[#c7a96b]/30 px-4 py-2 text-[9px] uppercase tracking-[0.25em] text-[#c7a96b]">
                        {getStatusLabel(
                          order.status
                        )}
                      </span>

                      <p className="mt-4 text-lg text-white/75">
                        {formatPrice(
                          order.totalAmount
                        )}
                      </p>

                    </div>

                  </div>

                  <div className="mt-6 space-y-4">

                    {order.items.map(
                      (item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0"
                        >

                          <div>
                            <p className="text-sm text-white/70">
                              {item.name}
                            </p>

                            <p className="mt-1 text-[9px] uppercase tracking-[0.25em] text-white/25">
                              Taille {item.size} · Quantité {item.quantity}
                            </p>
                          </div>

                          <p className="text-xs text-[#c7a96b]">
                            {formatPrice(
                              item.unitPrice *
                                item.quantity
                            )}
                          </p>

                        </div>
                      )
                    )}

                  </div>

                </article>
              )
            )}

          </div>
        )}

      </div>

    </main>
  );
}