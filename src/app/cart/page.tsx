"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type CartItem = {
  productNumber: string;
  name: string;
  price: string;
  size: string;
  quantity: number;
};

const WHATSAPP_NUMBER = "244956505582";
const CART_STORAGE_KEY = "el-mara-cart";

function getNumericPrice(
  price: string
) {
  const value = Number(
    price
      .replace(/\s/g, "")
      .replace("Kz", "")
      .replace(",", ".")
  );

  return Number.isFinite(value)
    ? value
    : 0;
}

function formatPrice(
  value: number
) {
  return `${value.toLocaleString("fr-FR")} Kz`;
}

export default function CartPage() {
  const [
    cart,
    setCart,
  ] = useState<CartItem[]>([]);

  const [
    loaded,
    setLoaded,
  ] = useState(false);

  const [
    ordering,
    setOrdering,
  ] = useState(false);

  const [
    orderError,
    setOrderError,
  ] = useState<string | null>(
    null
  );

  const [
    orderCreated,
    setOrderCreated,
  ] = useState<string | null>(
    null
  );

  useEffect(() => {
    try {
      const savedCart =
        localStorage.getItem(
          CART_STORAGE_KEY
        );

      if (savedCart) {
        const parsed =
          JSON.parse(
            savedCart
          );

        if (
          Array.isArray(
            parsed
          )
        ) {
          setCart(
            parsed
          );
        }
      }
    } catch (error) {
      console.error(
        "CART_LOAD_ERROR",
        error
      );

      localStorage.removeItem(
        CART_STORAGE_KEY
      );
    } finally {
      setLoaded(true);
    }
  }, []);

  const saveCart = (
    nextCart: CartItem[]
  ) => {
    setCart(
      nextCart
    );

    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(
        nextCart
      )
    );
  };

  const increaseQuantity = (
    index: number
  ) => {
    const nextCart =
      cart.map(
        (
          item,
          itemIndex
        ) =>
          itemIndex === index
            ? {
                ...item,
                quantity:
                  item.quantity +
                  1,
              }
            : item
      );

    saveCart(
      nextCart
    );
  };

  const decreaseQuantity = (
    index: number
  ) => {
    const nextCart =
      cart.map(
        (
          item,
          itemIndex
        ) =>
          itemIndex === index
            ? {
                ...item,
                quantity:
                  Math.max(
                    1,
                    item.quantity -
                      1
                  ),
              }
            : item
      );

    saveCart(
      nextCart
    );
  };

  const removeItem = (
    index: number
  ) => {
    const nextCart =
      cart.filter(
        (
          _,
          itemIndex
        ) =>
          itemIndex !== index
      );

    saveCart(
      nextCart
    );
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem(
      CART_STORAGE_KEY
    );
  };

  const total = useMemo(() => {
    return cart.reduce(
      (
        sum,
        item
      ) =>
        sum +
        getNumericPrice(
          item.price
        ) *
          item.quantity,
      0
    );
  }, [cart]);

  const totalQuantity =
    useMemo(() => {
      return cart.reduce(
        (
          sum,
          item
        ) =>
          sum +
          item.quantity,
        0
      );
    }, [cart]);

  const buildWhatsAppMessage =
    (
      orderId: string
    ) => {
      const lines: string[] = [
        "Bonjour EL MARA 👋",
        "",
        `Je souhaite confirmer ma commande #${orderId}.`,
        "",
      ];

      cart.forEach(
        (
          item,
          index
        ) => {
          const subtotal =
            getNumericPrice(
              item.price
            ) *
            item.quantity;

          lines.push(
            `${index + 1}. ${item.name}`
          );

          lines.push(
            `   Taille : ${item.size}`
          );

          lines.push(
            `   Quantité : ${item.quantity}`
          );

          lines.push(
            `   Prix unitaire : ${item.price}`
          );

          lines.push(
            `   Sous-total : ${formatPrice(
              subtotal
            )}`
          );

          lines.push("");
        }
      );

      lines.push(
        "────────────────"
      );

      lines.push(
        `TOTAL : ${formatPrice(total)}`
      );

      lines.push("");

      lines.push(
        "Merci de me confirmer la disponibilité et les modalités de livraison."
      );

      return lines.join(
        "\n"
      );
    };

  const handleWhatsAppOrder =
    async () => {
      if (
        cart.length === 0 ||
        ordering
      ) {
        return;
      }

      setOrdering(true);
      setOrderError(null);
      setOrderCreated(null);

      const popup =
        window.open(
          "",
          "_blank"
        );

      try {
        const response =
          await fetch(
            "/api/orders",
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                items:
                  cart.map(
                    (
                      item
                    ) => ({
                      productNumber:
                        item.productNumber,
                      size:
                        item.size,
                      quantity:
                        item.quantity,
                    })
                  ),
              }),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok
        ) {
          if (
            popup
          ) {
            popup.close();
          }

          if (
            response.status ===
            401
          ) {
            window.location.href =
              `/login?callbackUrl=${encodeURIComponent(
                "/cart"
              )}`;

            return;
          }

          throw new Error(
            data?.message ||
              "Impossible de créer la commande."
          );
        }

        const orderId =
          data.order.id;

        const message =
          buildWhatsAppMessage(
            orderId
          );

        const whatsappUrl =
          `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
            message
          )}`;

        setOrderCreated(
          orderId
        );

        if (
          popup
        ) {
          popup.location.href =
            whatsappUrl;
        } else {
          window.location.href =
            whatsappUrl;
        }

        clearCart();
      } catch (error) {
        console.error(
          "ORDER_ERROR",
          error
        );

        if (
          popup
        ) {
          popup.close();
        }

        setOrderError(
          error instanceof Error
            ? error.message
            : "Impossible de créer la commande."
        );
      } finally {
        setOrdering(false);
      }
    };

  if (!loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] text-[#f4f0e8]">
        <p className="text-[10px] uppercase tracking-[0.45em] text-[#c7a96b]">
          EL MARA
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] text-[#f4f0e8]">

      <header className="border-b border-white/10 px-6 py-6 md:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between">

          <Link
            href="/collection"
            className="group flex items-center gap-3 text-[10px] uppercase tracking-[0.35em] text-white/50 transition-colors hover:text-[#c7a96b]"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-1">
              ←
            </span>

            Collection
          </Link>

          <Link
            href="/"
            className="text-xs font-light tracking-[0.45em] text-white"
          >
            EL MARA
          </Link>

          <Link
            href="/account"
            className="text-[10px] uppercase tracking-[0.3em] text-white/50 transition-colors hover:text-[#c7a96b]"
          >
            Compte
          </Link>

        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-16 md:px-12 md:py-24">

        <div className="mb-14">

          <p className="text-[10px] uppercase tracking-[0.5em] text-[#c7a96b]">
            EL MARA / CART
          </p>

          <h1 className="mt-5 text-5xl font-light tracking-tight md:text-7xl">
            Mon panier
          </h1>

          <p className="mt-5 text-sm text-white/35">
            {totalQuantity} article
            {totalQuantity > 1
              ? "s"
              : ""}{" "}
            dans ton panier.
          </p>

        </div>

        {orderCreated && (
          <div className="mb-8 border border-[#c7a96b]/30 bg-[#0b0b0b] p-5">
            <p className="text-[9px] uppercase tracking-[0.35em] text-[#c7a96b]">
              Commande créée
            </p>

            <p className="mt-2 text-sm text-white/60">
              #{orderCreated}
            </p>

            <p className="mt-2 text-xs text-white/30">
              La commande a été enregistrée et WhatsApp a été ouvert.
            </p>

            <Link
              href="/orders"
              className="mt-4 inline-block text-[9px] uppercase tracking-[0.25em] text-[#c7a96b]"
            >
              Voir mes commandes →
            </Link>
          </div>
        )}

        {orderError && (
          <div className="mb-8 border border-red-500/20 bg-[#0b0b0b] p-5">
            <p className="text-sm text-red-400">
              {orderError}
            </p>
          </div>
        )}

        {cart.length === 0 ? (
          <section className="border border-white/10 bg-[#0b0b0b] px-8 py-20 text-center md:px-16">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 text-[#c7a96b]">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4h2l2.2 11.3a2 2 0 0 0 2 1.7h7.9a2 2 0 0 0 2-1.6L21 8H7" />
                <circle
                  cx="10"
                  cy="20"
                  r="1"
                />
                <circle
                  cx="18"
                  cy="20"
                  r="1"
                />
              </svg>
            </div>

            <h2 className="mt-8 text-3xl font-light">
              Ton panier est vide
            </h2>

            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-white/35">
              Découvre la collection EL MARA et ajoute tes
              pièces préférées à ton panier.
            </p>

            <Link
              href="/collection"
              className="mt-10 inline-flex min-h-14 items-center justify-center border border-[#c7a96b] bg-[#c7a96b] px-8 text-[10px] uppercase tracking-[0.3em] text-black transition-all duration-500 hover:bg-transparent hover:text-[#c7a96b]"
            >
              Découvrir la collection
            </Link>

          </section>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_400px]">

            <section>

              <div className="flex items-center justify-between border-b border-white/10 pb-5">

                <p className="text-[10px] uppercase tracking-[0.35em] text-white/30">
                  Articles
                </p>

                <button
                  type="button"
                  onClick={clearCart}
                  disabled={ordering}
                  className="text-[9px] uppercase tracking-[0.25em] text-white/25 transition-colors hover:text-red-400 disabled:opacity-30"
                >
                  Vider le panier
                </button>

              </div>

              <div className="mt-6 space-y-5">

                {cart.map(
                  (
                    item,
                    index
                  ) => (
                    <article
                      key={`${item.productNumber}-${item.size}-${index}`}
                      className="border border-white/10 bg-[#0b0b0b] p-5 md:p-7"
                    >

                      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

                        <div className="flex items-center gap-5">

                          <div className="flex h-28 w-24 items-center justify-center border border-white/10 bg-[#111]">
                            <span className="text-[9px] uppercase tracking-[0.3em] text-white/20">
                              {item.productNumber}
                            </span>
                          </div>

                          <div>

                            <p className="text-[9px] uppercase tracking-[0.35em] text-[#c7a96b]">
                              EL MARA
                            </p>

                            <h2 className="mt-2 text-xl font-light">
                              {item.name}
                            </h2>

                            <p className="mt-2 text-xs text-white/30">
                              Taille {item.size}
                            </p>

                            <p className="mt-3 text-sm text-white/65">
                              {item.price}
                            </p>

                          </div>

                        </div>

                        <div className="flex items-center justify-between gap-8 md:justify-end">

                          <div className="flex h-11 items-center border border-white/10">

                            <button
                              type="button"
                              onClick={() =>
                                decreaseQuantity(
                                  index
                                )
                              }
                              disabled={ordering}
                              className="flex h-full w-11 items-center justify-center text-white/40 transition-colors hover:text-[#c7a96b] disabled:opacity-30"
                            >
                              −
                            </button>

                            <span className="flex h-full min-w-11 items-center justify-center border-x border-white/10 text-xs">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                increaseQuantity(
                                  index
                                )
                              }
                              disabled={ordering}
                              className="flex h-full w-11 items-center justify-center text-white/40 transition-colors hover:text-[#c7a96b] disabled:opacity-30"
                            >
                              +
                            </button>

                          </div>

                          <div className="text-right">

                            <p className="text-xs text-[#c7a96b]">
                              {formatPrice(
                                getNumericPrice(
                                  item.price
                                ) *
                                  item.quantity
                              )}
                            </p>

                            <button
                              type="button"
                              onClick={() =>
                                removeItem(
                                  index
                                )
                              }
                              disabled={ordering}
                              className="mt-3 text-[9px] uppercase tracking-[0.2em] text-white/20 transition-colors hover:text-red-400 disabled:opacity-30"
                            >
                              Supprimer
                            </button>

                          </div>

                        </div>

                      </div>

                    </article>
                  )
                )}

              </div>

              <Link
                href="/collection"
                className="mt-8 inline-flex text-[10px] uppercase tracking-[0.3em] text-white/35 transition-colors hover:text-[#c7a96b]"
              >
                ← Continuer mes achats
              </Link>

            </section>

            <aside className="h-fit border border-white/10 bg-[#0b0b0b] p-7 md:p-8 lg:sticky lg:top-8">

              <p className="text-[10px] uppercase tracking-[0.45em] text-[#c7a96b]">
                Résumé
              </p>

              <h2 className="mt-5 text-3xl font-light">
                Votre commande
              </h2>

              <div className="mt-8 space-y-5 border-b border-white/10 pb-7">

                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/35">
                    Articles
                  </span>

                  <span className="text-white/65">
                    {totalQuantity}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/35">
                    Livraison
                  </span>

                  <span className="text-white/30">
                    À confirmer
                  </span>
                </div>

              </div>

              <div className="flex items-end justify-between py-7">

                <span className="text-[10px] uppercase tracking-[0.3em] text-white/35">
                  Total
                </span>

                <span className="text-2xl text-[#c7a96b]">
                  {formatPrice(total)}
                </span>

              </div>

              <button
                type="button"
                onClick={
                  handleWhatsAppOrder
                }
                disabled={
                  ordering
                }
                className="flex min-h-14 w-full items-center justify-center gap-3 bg-[#c7a96b] px-6 text-[10px] uppercase tracking-[0.3em] text-black transition-all duration-500 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >

                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.5 8.2 8.2 0 0 1-4.2-1.1L4 20l1.2-4.1a8.3 8.3 0 1 1 15.8-4.4Z" />
                  <path d="M8.5 9.3c.2 1.5 2.7 4 4.2 4.2.6.1 1.3-.4 1.7-.8l.7.2c.8.3 1.4.7 1.6 1.1.1.5-.2 1.2-.6 1.5-.7.5-1.7.2-2.5-.1-2-.7-4.9-3.6-5.6-5.6-.3-.8-.6-1.8-.1-2.5.3-.4 1-.7 1.5-1.6Z" />
                </svg>

                {ordering
                  ? "Création de la commande..."
                  : "Commander sur WhatsApp"}

              </button>

              <p className="mt-5 text-center text-[9px] uppercase leading-5 tracking-[0.2em] text-white/20">
                La commande est enregistrée avant l'ouverture de WhatsApp.
              </p>

            </aside>

          </div>
        )}

      </div>

      <footer className="border-t border-white/10 px-6 py-10 md:px-12">

        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 text-[9px] uppercase tracking-[0.3em] text-white/20 md:flex-row">

          <span>
            © 2026 EL MARA
          </span>

          <span>
            All Rights Reserved
          </span>

        </div>

      </footer>

    </main>
  );
}