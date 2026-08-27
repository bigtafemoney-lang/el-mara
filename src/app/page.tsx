"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Lenis from "lenis";

const products = [
  {
    number: "01",
    category: "Essential",
    name: "EL MARA Polo",
    price: "35 000 Kz",
    type: "POLO",
  },
  {
    number: "02",
    category: "Signature",
    name: "EL MARA Shirt",
    price: "45 000 Kz",
    type: "SHIRT",
  },
  {
    number: "03",
    category: "Essential",
    name: "EL MARA Pants",
    price: "50 000 Kz",
    type: "PANTS",
  },
];

export default function Home() {
  const introRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const collectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
    });

    const intro = introRef.current;
    const hero = heroRef.current;
    const collection = collectionRef.current;

    if (!intro || !hero || !collection) {
      return () => {
        lenis.destroy();
      };
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      if (reduceMotion) {
        gsap.set(".intro-letter", {
          opacity: 1,
          y: 0,
        });

        gsap.set(".intro-line", {
          scaleX: 1,
        });

        gsap.set(intro, {
          yPercent: -100,
        });

        gsap.set(".hero-content", {
          opacity: 1,
          y: 0,
        });

        gsap.set(".product-card", {
          opacity: 1,
          y: 0,
        });

        return;
      }

      tl.fromTo(
        ".intro-letter",
        {
          opacity: 0,
          y: 40,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.12,
          ease: "power4.out",
        }
      )
        .to(".intro-line", {
          scaleX: 1,
          duration: 1.2,
          ease: "power4.inOut",
        })
        .to(intro, {
          yPercent: -100,
          duration: 1.4,
          ease: "power4.inOut",
          delay: 0.5,
        })
        .fromTo(
          ".hero-content",
          {
            opacity: 0,
            y: 60,
          },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: "power4.out",
          },
          "-=0.5"
        );

      gsap.fromTo(
        ".product-card",
        {
          opacity: 0,
          y: 80,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          stagger: 0.18,
          ease: "power4.out",
          scrollTrigger: {
            trigger: collection,
            start: "top 70%",
          },
        }
      );
    });

    const cards =
      collection.querySelectorAll<HTMLElement>(".product-card");

    const cleanups: (() => void)[] = [];

    if (!reduceMotion) {
      cards.forEach((card) => {
        const visual = card.querySelector<HTMLElement>(
          ".product-visual"
        );

        const light = card.querySelector<HTMLElement>(
          ".product-light"
        );

        if (!visual || !light) return;

        const handleMove = (event: MouseEvent) => {
          const rect = card.getBoundingClientRect();

          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;

          const rotateX =
            ((y - rect.height / 2) / rect.height) * -5;

          const rotateY =
            ((x - rect.width / 2) / rect.width) * 5;

          const moveX =
            ((x - rect.width / 2) / rect.width) * 10;

          const moveY =
            ((y - rect.height / 2) / rect.height) * 10;

          gsap.to(visual, {
            x: moveX,
            y: moveY,
            rotateX,
            rotateY,
            duration: 0.5,
            ease: "power3.out",
          });

          gsap.to(light, {
            opacity: 1,
            x: (x - rect.width / 2) * 0.12,
            y: (y - rect.height / 2) * 0.12,
            duration: 0.5,
            ease: "power3.out",
          });
        };

        const handleLeave = () => {
          gsap.to(visual, {
            x: 0,
            y: 0,
            rotateX: 0,
            rotateY: 0,
            duration: 0.8,
            ease: "power3.out",
          });

          gsap.to(light, {
            opacity: 0,
            x: 0,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
          });
        };

        card.addEventListener("mousemove", handleMove);
        card.addEventListener("mouseleave", handleLeave);

        cleanups.push(() => {
          card.removeEventListener("mousemove", handleMove);
          card.removeEventListener("mouseleave", handleLeave);
        });
      });
    }

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      ctx.revert();
      lenis.destroy();
    };
  }, []);

  return (
    <main className="bg-[#080808] text-[#f4f0e8]">
      {/* INTRO */}
      <section
        ref={introRef}
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#080808]"
      >
        <div className="flex flex-col items-center">
          <div className="flex overflow-hidden text-[clamp(3rem,10vw,9rem)] font-light tracking-[0.35em]">
            {"EL MARA".split("").map((letter, index) => (
              <span
                key={index}
                className="intro-letter inline-block"
              >
                {letter === " " ? "\u00A0" : letter}
              </span>
            ))}
          </div>

          <div className="intro-line mt-8 h-px w-40 origin-left scale-x-0 bg-[#c7a96b]" />
        </div>
      </section>

      {/* HERO */}
      <section
        ref={heroRef}
        className="relative flex min-h-screen items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(199,169,107,0.13),transparent_42%)]" />

        <div className="hero-content relative z-10 px-6 text-center">
          <p className="mb-6 text-xs uppercase tracking-[0.55em] text-[#c7a96b]">
            New Collection
          </p>

          <h1 className="text-[clamp(4rem,13vw,12rem)] font-light leading-none tracking-[-0.05em]">
            EL MARA
          </h1>

          <p className="mx-auto mt-8 max-w-xl text-sm leading-7 text-white/55 md:text-base">
            Modern menswear. Designed with character, precision and
            distinction.
          </p>

          {/* DISCOVER → COLLECTION */}
          <a
            href="/collection"
            aria-label="Discover EL MARA collection"
            className="mt-10 inline-block border border-[#c7a96b]/60 px-10 py-4 text-xs uppercase tracking-[0.35em] transition-all duration-500 hover:bg-[#c7a96b] hover:text-black"
          >
            Discover
          </a>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.4em] text-white/35">
          Scroll
        </div>
      </section>

      {/* COLLECTION */}
      <section
        ref={collectionRef}
        className="min-h-screen overflow-hidden px-6 py-32 md:px-16"
      >
        <div className="mx-auto max-w-[1600px]">
          {/* HEADER */}
          <div className="mb-20 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-4 text-xs uppercase tracking-[0.4em] text-[#c7a96b]">
                01
              </p>

              <h2 className="text-4xl font-light tracking-tight md:text-7xl">
                The Collection
              </h2>
            </div>

            <p className="max-w-sm text-sm leading-7 text-white/40">
              A selection of modern menswear designed for those who
              appreciate precision, presence and detail.
            </p>

            <span className="hidden text-xs uppercase tracking-[0.3em] text-white/40 lg:block">
              EL MARA
            </span>
          </div>

          {/* PRODUCTS */}
          <div className="grid gap-6 md:grid-cols-3">
            {products.map((product, index) => (
              <article
                key={product.name}
                className="product-card group cursor-pointer"
                style={{
                  perspective: "1200px",
                }}
              >
                {/* PRODUCT VISUAL */}
                <div
                  className="relative aspect-[3/4] overflow-hidden bg-[#111]"
                  style={{
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* GOLD ATMOSPHERE */}
                  <div
                    className={`absolute inset-0 ${
                      index === 0
                        ? "bg-[radial-gradient(circle_at_50%_30%,rgba(199,169,107,0.18),transparent_45%)]"
                        : index === 1
                          ? "bg-[radial-gradient(circle_at_50%_30%,rgba(199,169,107,0.14),transparent_45%)]"
                          : "bg-[radial-gradient(circle_at_50%_30%,rgba(199,169,107,0.16),transparent_45%)]"
                    }`}
                  />

                  {/* PRODUCT NUMBER */}
                  <div className="absolute left-6 top-6 z-20 text-[10px] tracking-[0.4em] text-white/40">
                    {product.number}
                  </div>

                  {/* PRODUCT VISUAL */}
                  <div
                    className={`product-visual absolute inset-0 flex items-center justify-center ${
                      index === 1 ? "origin-center" : ""
                    }`}
                    style={{
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <div
                      className={`relative flex items-center justify-center border border-white/10 bg-gradient-to-b from-white/[0.08] to-transparent shadow-2xl transition-transform duration-1000 ease-out ${
                        index === 0
                          ? "h-[55%] w-[55%] group-hover:scale-[1.12] group-hover:-translate-y-3"
                          : index === 1
                            ? "h-[65%] w-[48%] group-hover:scale-[1.1] group-hover:rotate-1 group-hover:-translate-y-3"
                            : "h-[70%] w-[50%] group-hover:scale-[1.1] group-hover:-translate-y-3"
                      }`}
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_35%,rgba(199,169,107,0.08))]" />

                      <span className="relative text-xs uppercase tracking-[0.4em] text-white/30">
                        {product.type}
                      </span>
                    </div>
                  </div>

                  {/* MOUSE LIGHT */}
                  <div
                    className="product-light pointer-events-none absolute -left-24 -top-24 z-10 h-48 w-48 rounded-full bg-[#c7a96b]/10 opacity-0 blur-3xl"
                    style={{
                      transform: "translate3d(0, 0, 0)",
                    }}
                  />

                  {/* HOVER LIGHT */}
                  <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08),transparent_45%)] opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

                  {/* VIEW BUTTON */}
                  <div className="absolute bottom-6 right-6 z-20 flex h-12 w-12 scale-75 items-center justify-center rounded-full border border-[#c7a96b]/50 text-xs text-[#c7a96b] opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100">
                    →
                  </div>
                </div>

                {/* PRODUCT INFORMATION */}
                <div className="flex items-end justify-between border-b border-white/10 py-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.35em] text-[#c7a96b]">
                      {product.category}
                    </p>

                    <h3 className="mt-2 text-2xl font-light">
                      {product.name}
                    </h3>

                    <div className="mt-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-white/40 transition-colors duration-500 group-hover:text-[#c7a96b]">
                      <span>View product</span>
                      <span className="transition-transform duration-500 group-hover:translate-x-2">
                        →
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-white/60">
                    {product.price}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}