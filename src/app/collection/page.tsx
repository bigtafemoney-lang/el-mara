"use client";

import {
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import Link from "next/link";
import gsap from "gsap";
import Lenis from "lenis";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Stars,
} from "@react-three/drei";
import { authClient } from "@/lib/auth-client";

const products = [
  {
    number: "01",
    category: "Essential",
    name: "EL MARA Polo",
    price: "35 000 Kz",
    type: "POLO",
    description:
      "A refined essential designed with a clean silhouette, modern proportions and the EL MARA signature aesthetic.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    number: "02",
    category: "Signature",
    name: "EL MARA Shirt",
    price: "45 000 Kz",
    type: "SHIRT",
    description:
      "A signature men's shirt combining precise lines, refined details and a contemporary EL MARA attitude.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    number: "03",
    category: "Essential",
    name: "EL MARA Pants",
    price: "50 000 Kz",
    type: "PANTS",
    description:
      "Modern tailored pants designed for a confident silhouette and effortless everyday wear.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    number: "04",
    category: "Signature",
    name: "EL MARA Blazer",
    price: "85 000 Kz",
    type: "BLAZER",
    description:
      "A structured blazer created to bring precision, presence and distinction to the EL MARA wardrobe.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    number: "05",
    category: "Essential",
    name: "EL MARA T-Shirt",
    price: "30 000 Kz",
    type: "T-SHIRT",
    description:
      "A versatile everyday essential with a refined silhouette and understated EL MARA character.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    number: "06",
    category: "Premium",
    name: "EL MARA Jacket",
    price: "95 000 Kz",
    type: "JACKET",
    description:
      "A premium outer layer designed around clean architecture, depth and contemporary luxury.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    number: "07",
    category: "Essential",
    name: "EL MARA Shorts",
    price: "32 000 Kz",
    type: "SHORTS",
    description:
      "A refined relaxed essential designed for modern everyday movement and effortless style.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    number: "08",
    category: "Premium",
    name: "EL MARA Suit",
    price: "120 000 Kz",
    type: "SUIT",
    description:
      "A complete premium silhouette created with a sharp, elegant and unmistakably EL MARA presence.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    number: "09",
    category: "Signature",
    name: "EL MARA Collection",
    price: "150 000 Kz",
    type: "COLLECTION",
    description:
      "A complete EL MARA statement combining signature pieces into one refined wardrobe selection.",
    sizes: ["S", "M", "L", "XL"],
  },
];

/* =========================================================
   SITE INFORMATION
========================================================= */

const siteInfo = {
  email: "",
  whatsapp: "",
  instagram: "",
  tiktok: "",
};

/* =========================================================
   GEOJSON
========================================================= */

type GeoJSONGeometry = {
  type: "Polygon" | "MultiPolygon";
  coordinates: number[][][] | number[][][][];
};

type CountryFeature = {
  type: "Feature";
  properties: {
    ADMIN?: string;
    NAME?: string;
  };
  geometry: GeoJSONGeometry;
};

type CountriesData = {
  type: "FeatureCollection";
  features: CountryFeature[];
};

/* =========================================================
   CART
========================================================= */

type CartItem = {
  productNumber: string;
  name: string;
  price: string;
  size: string;
  quantity: number;
};

type PendingOrder = {
  id: string;
  items: CartItem[];
  status:
    | "pending"
    | "processing"
    | "awaiting_payment";
  createdAt: string;
};

/* =========================================================
   GLOBE CONFIG
========================================================= */

const GLOBE_RADIUS = 2.4;
const TEXTURE_WIDTH = 2048;
const TEXTURE_HEIGHT = 1024;

/* =========================================================
   LAT/LONG → 3D
========================================================= */

function latLonToVector3(
  latitude: number,
  longitude: number,
  radius = GLOBE_RADIUS
) {
  const phi =
    (90 - latitude) *
    (Math.PI / 180);

  const theta =
    (longitude + 180) *
    (Math.PI / 180);

  return new THREE.Vector3(
    -radius *
      Math.sin(phi) *
      Math.cos(theta),
    radius * Math.cos(phi),
    radius *
      Math.sin(phi) *
      Math.sin(theta)
  );
}

/* =========================================================
   GEOJSON → CONTINENTS DORÉS
========================================================= */

function drawRingOnTexture(
  context: CanvasRenderingContext2D,
  ring: number[][]
) {
  if (!ring.length) {
    return;
  }

  ring.forEach(
    ([longitude, latitude], index) => {
      const x =
        ((longitude + 180) / 360) *
        TEXTURE_WIDTH;

      const y =
        ((90 - latitude) / 180) *
        TEXTURE_HEIGHT;

      if (index === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }
  );

  context.closePath();
}

function drawCountry(
  context: CanvasRenderingContext2D,
  polygon: number[][][]
) {
  context.beginPath();

  polygon.forEach((ring) => {
    drawRingOnTexture(
      context,
      ring
    );
  });

  context.fillStyle =
    "rgba(199, 169, 107, 0.32)";

  context.fill("evenodd");
}

function createLandTexture(
  countries: CountriesData
) {
  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width =
    TEXTURE_WIDTH;

  canvas.height =
    TEXTURE_HEIGHT;

  const context =
    canvas.getContext("2d");

  if (!context) {
    return null;
  }

  context.clearRect(
    0,
    0,
    TEXTURE_WIDTH,
    TEXTURE_HEIGHT
  );

  countries.features.forEach(
    (feature) => {
      if (
        feature.geometry.type ===
        "Polygon"
      ) {
        drawCountry(
          context,
          feature.geometry
            .coordinates as number[][][]
        );
      }

      if (
        feature.geometry.type ===
        "MultiPolygon"
      ) {
        feature.geometry.coordinates.forEach(
          (polygon) => {
            drawCountry(
              context,
              polygon
            );
          }
        );
      }
    }
  );

  const texture =
    new THREE.CanvasTexture(
      canvas
    );

  texture.colorSpace =
    THREE.SRGBColorSpace;

  texture.needsUpdate =
    true;

  return texture;
}

/* =========================================================
   FRONTIÈRES DES PAYS
========================================================= */

function createBorderLine(
  coordinates: number[][]
) {
  if (coordinates.length < 2) {
    return null;
  }

  const points =
    coordinates.map(
      ([longitude, latitude]) =>
        latLonToVector3(
          latitude,
          longitude,
          GLOBE_RADIUS + 0.018
        )
    );

  const geometry =
    new THREE.BufferGeometry().setFromPoints(
      points
    );

  const material =
    new THREE.LineBasicMaterial({
      color: "#d8bd78",
      transparent: true,
      opacity: 0.82,
      depthWrite: false,
    });

  return new THREE.Line(
    geometry,
    material
  );
}

function CountryBorders({
  countries,
}: {
  countries: CountriesData;
}) {
  const lines = useMemo(
    () => {
      const result: THREE.Line[] =
        [];

      countries.features.forEach(
        (feature) => {
          const geometry =
            feature.geometry;

          if (
            geometry.type ===
            "Polygon"
          ) {
            geometry.coordinates.forEach(
              (ring) => {
                const line =
                  createBorderLine(
                    ring
                  );

                if (line) {
                  result.push(line);
                }
              }
            );
          }

          if (
            geometry.type ===
            "MultiPolygon"
          ) {
            geometry.coordinates.forEach(
              (polygon) => {
                polygon.forEach(
                  (ring) => {
                    const line =
                      createBorderLine(
                        ring
                      );

                    if (line) {
                      result.push(line);
                    }
                  }
                );
              }
            );
          }
        }
      );

      return result;
    },
    [countries]
  );

  return (
    <group>
      {lines.map(
        (line, index) => (
          <primitive
            key={index}
            object={line}
          />
        )
      )}
    </group>
  );
}

/* =========================================================
   ANGOLA
========================================================= */

function AngolaMarker() {
  const position =
    latLonToVector3(
      -8.8383,
      13.2344,
      GLOBE_RADIUS + 0.07
    );

  return (
    <group
      position={position}
    >
      <mesh>
        <sphereGeometry
          args={[
            0.075,
            32,
            32,
          ]}
        />

        <meshBasicMaterial
          color="#ff2020"
        />
      </mesh>

      <mesh>
        <sphereGeometry
          args={[
            0.17,
            32,
            32,
          ]}
        />

        <meshBasicMaterial
          color="#ff2020"
          transparent
          opacity={0.18}
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   GLOBE
========================================================= */

function GlobeWithBorders({
  countries,
  texture,
}: {
  countries: CountriesData;
  texture: THREE.CanvasTexture;
}) {
  return (
    <group
      rotation={[
        0.04,
        -0.58,
        0,
      ]}
    >
      <mesh>
        <sphereGeometry
          args={[
            GLOBE_RADIUS,
            128,
            128,
          ]}
        />

        <meshStandardMaterial
          color="#020202"
          roughness={0.42}
          metalness={0.92}
        />
      </mesh>

      <mesh
        scale={[
          1.005,
          1.005,
          1.005,
        ]}
      >
        <sphereGeometry
          args={[
            GLOBE_RADIUS,
            128,
            128,
          ]}
        />

        <meshBasicMaterial
          map={texture}
          transparent
          opacity={1}
          depthWrite={false}
          side={THREE.FrontSide}
        />
      </mesh>

      <CountryBorders
        countries={
          countries
        }
      />

      <AngolaMarker />
    </group>
  );
}

/* =========================================================
   GLOBE SCENE
========================================================= */

function GlobeScene({
  countries,
}: {
  countries: CountriesData;
}) {
  const texture = useMemo(
    () =>
      createLandTexture(
        countries
      ),
    [countries]
  );

  useEffect(() => {
    return () => {
      texture?.dispose();
    };
  }, [texture]);

  if (!texture) {
    return null;
  }

  return (
    <>
      <ambientLight
        intensity={0.3}
      />

      <directionalLight
        position={[
          5,
          4,
          6,
        ]}
        intensity={2.5}
        color="#c7a96b"
      />

      <pointLight
        position={[
          -4,
          -2,
          4,
        ]}
        intensity={1.2}
        color="#c7a96b"
      />

      <Stars
        radius={70}
        depth={45}
        count={1400}
        factor={1.8}
        saturation={0}
        fade
        speed={0.15}
      />

      <GlobeWithBorders
        countries={
          countries
        }
        texture={
          texture
        }
      />

      <OrbitControls
        enableZoom
        enablePan={false}
        enableRotate
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        minDistance={2.8}
        maxDistance={9}
      />
    </>
  );
}

/* =========================================================
   GLOBE LOADER
========================================================= */

function GlobeLoader() {
  const [
    countries,
    setCountries,
  ] =
    useState<CountriesData | null>(
      null
    );

  const [
    error,
    setError,
  ] = useState(false);

  useEffect(() => {
    fetch(
      "/data/countries.geojson"
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Carte introuvable"
          );
        }

        return response.json();
      })
      .then(
        (data: CountriesData) => {
          setCountries(data);
        }
      )
      .catch(() => {
        setError(true);
      });
  }, []);

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-xs uppercase tracking-[0.3em] text-white/20">
          Globe unavailable
        </p>
      </div>
    );
  }

  if (!countries) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-[#c7a96b]/60">
          Loading
        </p>
      </div>
    );
  }

  return (
    <Canvas
      camera={{
        position: [
          3.2,
          0.8,
          5.4,
        ],
        fov: 38,
      }}
      dpr={[
        1,
        2,
      ]}
      gl={{
        antialias: true,
        alpha: true,
      }}
    >
      <GlobeScene
        countries={
          countries
        }
      />
    </Canvas>
  );
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({
  product,
  index,
  onOpen,
}: {
  product: (typeof products)[number];
  index: number;
  onOpen: (
    product: (typeof products)[number]
  ) => void;
}) {
  const cardRef =
    useRef<HTMLElement>(
      null
    );

  const visualRef =
    useRef<HTMLDivElement>(
      null
    );

  const lightRef =
    useRef<HTMLDivElement>(
      null
    );

  useEffect(() => {
    const card =
      cardRef.current;

    const visual =
      visualRef.current;

    const light =
      lightRef.current;

    if (
      !card ||
      !visual ||
      !light
    ) {
      return;
    }

    const handleMove =
      (event: MouseEvent) => {
        const rect =
          card.getBoundingClientRect();

        const x =
          event.clientX -
          rect.left;

        const y =
          event.clientY -
          rect.top;

        const rotateX =
          ((y -
            rect.height / 2) /
            rect.height) *
          -5;

        const rotateY =
          ((x -
            rect.width / 2) /
            rect.width) *
          5;

        const moveX =
          ((x -
            rect.width / 2) /
            rect.width) *
          10;

        const moveY =
          ((y -
            rect.height / 2) /
            rect.height) *
          10;

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
          x:
            (x -
              rect.width / 2) *
            0.12,
          y:
            (y -
              rect.height / 2) *
            0.12,
          duration: 0.5,
          ease: "power3.out",
        });
      };

    const handleLeave =
      () => {
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

    card.addEventListener(
      "mousemove",
      handleMove
    );

    card.addEventListener(
      "mouseleave",
      handleLeave
    );

    return () => {
      card.removeEventListener(
        "mousemove",
        handleMove
      );

      card.removeEventListener(
        "mouseleave",
        handleLeave
      );
    };
  }, []);

  return (
    <article
      ref={cardRef}
      onClick={() =>
        onOpen(product)
      }
      className="product-card group cursor-pointer"
      style={{
        perspective:
          "1200px",
      }}
    >
      <div
        className="relative aspect-[3/4] overflow-hidden bg-[#111]"
        style={{
          transformStyle:
            "preserve-3d",
        }}
      >
        <div
          className={`absolute inset-0 ${
            index % 3 === 0
              ? "bg-[radial-gradient(circle_at_50%_30%,rgba(199,169,107,0.18),transparent_45%)]"
              : index % 3 === 1
                ? "bg-[radial-gradient(circle_at_50%_30%,rgba(199,169,107,0.14),transparent_45%)]"
                : "bg-[radial-gradient(circle_at_50%_30%,rgba(199,169,107,0.16),transparent_45%)]"
          }`}
        />

        <div className="absolute left-6 top-6 z-20 text-[10px] tracking-[0.4em] text-white/40">
          {product.number}
        </div>

        <div
          ref={visualRef}
          className="product-visual absolute inset-0 flex items-center justify-center"
          style={{
            transformStyle:
              "preserve-3d",
          }}
        >
          <div
            className={`relative flex items-center justify-center border border-white/10 bg-gradient-to-b from-white/[0.08] to-transparent shadow-2xl transition-transform duration-1000 ease-out ${
              index % 3 === 0
                ? "h-[55%] w-[55%] group-hover:scale-[1.12] group-hover:-translate-y-3"
                : index % 3 === 1
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

        <div
          ref={lightRef}
          className="pointer-events-none absolute -left-24 -top-24 z-10 h-48 w-48 rounded-full bg-[#c7a96b]/10 opacity-0 blur-3xl"
        />

        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08),transparent_45%)] opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

        <div className="absolute bottom-6 right-6 z-20 flex h-12 w-12 scale-75 items-center justify-center rounded-full border border-[#c7a96b]/50 text-xs text-[#c7a96b] opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100">
          →
        </div>
      </div>

      <div className="flex items-end justify-between border-b border-white/10 py-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#c7a96b]">
            {product.category}
          </p>

          <h3 className="mt-2 text-2xl font-light">
            {product.name}
          </h3>

          <div className="mt-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-white/40 transition-colors duration-500 group-hover:text-[#c7a96b]">
            <span>
              View product
            </span>

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
  );
}

/* =========================================================
   ACCOUNT MENU
========================================================= */

function AccountMenu({
  isOpen,
  onClose,
  session,
  onSignOut,
}: {
  isOpen: boolean;
  onClose: () => void;
  session: {
    user: {
      name: string;
      email: string;
    };
  } | null;
  onSignOut: () => void;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="absolute right-0 top-12 w-72 border border-white/10 bg-[#090909]/95 p-5 shadow-2xl backdrop-blur-xl">
      <div className="border-b border-white/10 pb-5">
        <p className="text-[9px] uppercase tracking-[0.4em] text-[#c7a96b]">
          Compte
        </p>

        {session ? (
          <>
            <p className="mt-3 text-sm text-white/80">
              {session.user.name}
            </p>

            <p className="mt-1 break-all text-xs text-white/30">
              {session.user.email}
            </p>
          </>
        ) : (
          <p className="mt-3 text-sm text-white/40">
            Vous n'êtes pas connecté.
          </p>
        )}
      </div>

      {session ? (
        <div className="mt-3 flex flex-col">

          <Link
            href="/account"
            onClick={onClose}
            className="border-b border-white/5 px-2 py-4 text-left text-[10px] uppercase tracking-[0.25em] text-white/55 transition-colors hover:text-[#c7a96b]"
          >
            Mon compte
          </Link>

          <Link
            href="/account?edit=true"
            onClick={onClose}
            className="border-b border-white/5 px-2 py-4 text-left text-[10px] uppercase tracking-[0.25em] text-white/55 transition-colors hover:text-[#c7a96b]"
          >
            Modifier mes informations
          </Link>

          <Link
            href="/orders"
            onClick={onClose}
            className="border-b border-white/5 px-2 py-4 text-left text-[10px] uppercase tracking-[0.25em] text-white/55 transition-colors hover:text-[#c7a96b]"
          >
            Mes commandes
          </Link>

          <button
            type="button"
            onClick={onSignOut}
            className="px-2 py-4 text-left text-[10px] uppercase tracking-[0.25em] text-red-400/70 transition-colors hover:text-red-400"
          >
            Déconnexion
          </button>

        </div>
      ) : (
        <div className="mt-3 flex flex-col">

          <Link
            href="/login"
            onClick={onClose}
            className="border-b border-white/5 px-2 py-4 text-left text-[10px] uppercase tracking-[0.25em] text-white/55 transition-colors hover:text-[#c7a96b]"
          >
            Se connecter
          </Link>

          <Link
            href="/register"
            onClick={onClose}
            className="px-2 py-4 text-left text-[10px] uppercase tracking-[0.25em] text-white/55 transition-colors hover:text-[#c7a96b]"
          >
            Créer un compte
          </Link>

        </div>
      )}
    </div>
  );
}

/* =========================================================
   CART MENU
========================================================= */

function CartMenu({
  isOpen,
  onClose,
  cart,
  orders,
  onRemove,
  onContinue,
}: {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  orders: PendingOrder[];
  onRemove: (index: number) => void;
  onContinue: () => void;
}) {
  if (!isOpen) {
    return null;
  }

  const cartTotal = cart.reduce(
    (total, item) => {
      const numericPrice =
        Number(
          item.price
            .replace(/\s/g, "")
            .replace("Kz", "")
        ) || 0;

      return (
        total +
        numericPrice *
          item.quantity
      );
    },
    0
  );

  return (
    <div className="absolute right-0 top-12 w-[360px] max-w-[calc(100vw-32px)] border border-white/10 bg-[#090909]/95 shadow-2xl backdrop-blur-xl">
      <div className="border-b border-white/10 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-[0.4em] text-[#c7a96b]">
              Shopping
            </p>

            <h3 className="mt-2 text-xl font-light">
              Mon panier
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-white/30 transition-colors hover:text-[#c7a96b]"
            aria-label="Fermer le panier"
          >
            ×
          </button>
        </div>
      </div>

      <div className="max-h-[520px] overflow-y-auto">

        {/* CART */}

        <div className="px-6 py-6">

          <div className="flex items-center justify-between">
            <p className="text-[9px] uppercase tracking-[0.35em] text-white/30">
              Articles
            </p>

            <span className="text-[9px] uppercase tracking-[0.25em] text-white/20">
              {cart.length}
            </span>
          </div>

          {cart.length === 0 ? (
            <div className="border-b border-white/5 py-10 text-center">
              <p className="text-sm text-white/30">
                Ton panier est vide.
              </p>

              <button
                type="button"
                onClick={onContinue}
                className="mt-5 text-[9px] uppercase tracking-[0.3em] text-[#c7a96b]"
              >
                Continuer mes achats
              </button>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {cart.map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={`${item.productNumber}-${item.size}-${index}`}
                    className="border-b border-white/5 pb-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-white/75">
                          {item.name}
                        </p>

                        <p className="mt-1 text-[9px] uppercase tracking-[0.25em] text-white/25">
                          Taille {item.size} · Qté {item.quantity}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          onRemove(index)
                        }
                        className="text-[9px] uppercase tracking-[0.2em] text-white/20 transition-colors hover:text-red-400"
                      >
                        Retirer
                      </button>
                    </div>

                    <p className="mt-3 text-xs text-[#c7a96b]">
                      {item.price}
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* ORDERS IN PROGRESS */}

        <div className="border-t border-white/10 px-6 py-6">

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-[0.35em] text-[#c7a96b]">
                Commandes
              </p>

              <h4 className="mt-2 text-lg font-light">
                En cours
              </h4>
            </div>

            <Link
              href="/orders"
              onClick={onClose}
              className="text-[9px] uppercase tracking-[0.25em] text-white/30 transition-colors hover:text-[#c7a96b]"
            >
              Voir tout
            </Link>
          </div>

          {orders.length === 0 ? (
            <p className="mt-6 text-xs leading-6 text-white/25">
              Aucune commande en cours.
            </p>
          ) : (
            <div className="mt-5 space-y-4">
              {orders.map(
                (order) => (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    onClick={onClose}
                    className="block border border-white/5 p-4 transition-colors hover:border-[#c7a96b]/30"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase tracking-[0.25em] text-white/25">
                        #{order.id}
                      </span>

                      <span className="text-[9px] uppercase tracking-[0.2em] text-[#c7a96b]"
                      >
                        {order.status ===
                        "awaiting_payment"
                          ? "Paiement"
                          : order.status ===
                              "processing"
                            ? "Traitement"
                            : "En attente"}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-white/65">
                      {order.items.length} article
                      {order.items.length > 1
                        ? "s"
                        : ""}
                    </p>
                  </Link>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* TOTAL */}

      {cart.length > 0 && (
        <div className="border-t border-white/10 px-6 py-5">

          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase tracking-[0.3em] text-white/30">
              Total
            </span>

            <span className="text-lg text-[#c7a96b]">
              {cartTotal.toLocaleString("fr-FR")} Kz
            </span>
          </div>

          <Link
            href="/cart"
            onClick={onClose}
            className="mt-5 flex min-h-12 items-center justify-center border border-[#c7a96b]/60 bg-[#c7a96b] text-[10px] uppercase tracking-[0.3em] text-black transition-all duration-500 hover:bg-transparent hover:text-[#c7a96b]"
          >
            Voir le panier
          </Link>

        </div>
      )}
    </div>
  );
}

/* =========================================================
   ACCOUNT MODAL
========================================================= */

function AccountModal({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">

      <button
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      <div className="relative z-10 w-full max-w-md border border-white/10 bg-[#090909] p-8 shadow-2xl md:p-10">

        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/40 transition-colors hover:border-[#c7a96b]/60 hover:text-[#c7a96b]"
        >
          ×
        </button>

        <p className="text-[10px] uppercase tracking-[0.45em] text-[#c7a96b]">
          EL MARA
        </p>

        <h2 className="mt-5 text-3xl font-light md:text-4xl">
          Votre compte
        </h2>

        <p className="mt-5 max-w-sm text-sm leading-7 text-white/40">
          Connectez-vous ou créez un compte pour
          continuer avec votre panier.
        </p>

        <div className="mt-8">
          <Link
            href="/login"
            className="flex min-h-14 w-full items-center justify-center border border-[#c7a96b] bg-[#c7a96b] px-6 text-xs uppercase tracking-[0.3em] text-black transition-all duration-500 hover:bg-transparent hover:text-[#c7a96b]"
          >
            Se connecter
          </Link>

          <Link
            href="/register"
            className="mt-3 flex min-h-14 w-full items-center justify-center border border-white/10 px-6 text-xs uppercase tracking-[0.3em] text-white/60 transition-all duration-500 hover:border-[#c7a96b]/60 hover:text-[#c7a96b]"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PRODUCT DETAIL
========================================================= */

function ProductDetail({
  product,
  onClose,
  onRequireAccount,
}: {
  product: (typeof products)[number];
  onClose: () => void;
  onRequireAccount: (
    product: (typeof products)[number],
    size: string,
    quantity: number
  ) => void;
}) {
  const [size, setSize] =
    useState(product.sizes[0]);

  const [
    quantity,
    setQuantity,
  ] = useState(1);

  const detailRef =
    useRef<HTMLDivElement>(
      null
    );

  useEffect(() => {
    document.body.style.overflow =
      "hidden";

    const context =
      gsap.context(() => {
        gsap.fromTo(
          ".product-detail-backdrop",
          {
            opacity: 0,
          },
          {
            opacity: 1,
            duration: 0.45,
            ease: "power2.out",
          }
        );

        gsap.fromTo(
          ".product-detail-panel",
          {
            opacity: 0,
            scale: 0.9,
            y: 40,
          },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.75,
            ease: "power4.out",
          }
        );

        gsap.fromTo(
          ".product-detail-image",
          {
            opacity: 0,
            x: -30,
          },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            delay: 0.12,
            ease: "power4.out",
          }
        );
      }, detailRef);

    return () => {
      context.revert();
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      ref={detailRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
    >
      <button
        type="button"
        aria-label="Fermer le produit"
        onClick={onClose}
        className="product-detail-backdrop absolute inset-0 bg-black/75 backdrop-blur-[8px]"
      />

      <div className="product-detail-panel relative z-10 flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden border border-white/10 bg-[#0a0a0a] shadow-2xl lg:flex-row">

        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="absolute right-5 top-5 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/40 text-sm text-white/60 backdrop-blur-md transition-all duration-300 hover:border-[#c7a96b]/60 hover:text-[#c7a96b]"
        >
          ×
        </button>

        <div className="product-detail-image relative flex min-h-[360px] flex-1 items-center justify-center overflow-hidden bg-[#111] lg:min-h-[680px]">

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(199,169,107,0.16),transparent_48%)]" />

          <div className="relative flex h-[72%] w-[60%] items-center justify-center border border-white/10 bg-gradient-to-b from-white/[0.08] to-transparent shadow-2xl md:h-[78%] md:w-[55%]">

            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.09),transparent_35%,rgba(199,169,107,0.09))]" />

            <span className="relative text-sm uppercase tracking-[0.5em] text-white/25 md:text-base">
              {product.type}
            </span>

          </div>

          <span className="absolute left-6 top-6 text-[10px] tracking-[0.4em] text-white/30">
            {product.number}
          </span>

        </div>

        <div className="flex flex-1 flex-col overflow-y-auto p-7 md:p-10 lg:max-w-[48%] lg:p-12">

          <p className="text-[10px] uppercase tracking-[0.45em] text-[#c7a96b]">
            {product.category}
          </p>

          <h2 className="mt-4 text-4xl font-light tracking-tight md:text-5xl">
            {product.name}
          </h2>

          <p className="mt-5 text-lg text-white/70">
            {product.price}
          </p>

          <div className="mt-10 h-px bg-white/10" />

          <div className="mt-8">

            <div className="flex items-center justify-between">

              <span className="text-[10px] uppercase tracking-[0.35em] text-white/40">
                Size
              </span>

              <span className="text-[10px] uppercase tracking-[0.25em] text-white/20">
                Select
              </span>

            </div>

            <div className="mt-4 grid grid-cols-4 gap-2">

              {product.sizes.map(
                (itemSize) => (
                  <button
                    key={itemSize}
                    type="button"
                    onClick={() =>
                      setSize(
                        itemSize
                      )
                    }
                    className={`h-12 border text-xs uppercase tracking-[0.2em] transition-all duration-300 ${
                      size ===
                      itemSize
                        ? "border-[#c7a96b] bg-[#c7a96b] text-black"
                        : "border-white/10 text-white/50 hover:border-[#c7a96b]/60 hover:text-[#c7a96b]"
                    }`}
                  >
                    {itemSize}
                  </button>
                )
              )}

            </div>
          </div>

          <div className="mt-8">

            <span className="text-[10px] uppercase tracking-[0.35em] text-white/40">
              Quantity
            </span>

            <div className="mt-4 flex h-12 w-fit items-center border border-white/10">

              <button
                type="button"
                onClick={() =>
                  setQuantity(
                    (current) =>
                      Math.max(
                        1,
                        current - 1
                      )
                  )
                }
                className="flex h-full w-12 items-center justify-center text-white/50 transition-colors hover:text-[#c7a96b]"
              >
                −
              </button>

              <span className="flex h-full min-w-12 items-center justify-center border-x border-white/10 text-sm">
                {quantity}
              </span>

              <button
                type="button"
                onClick={() =>
                  setQuantity(
                    (current) =>
                      current + 1
                  )
                }
                className="flex h-full w-12 items-center justify-center text-white/50 transition-colors hover:text-[#c7a96b]"
              >
                +
              </button>

            </div>
          </div>

          <div className="mt-10">

            <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">
              Description
            </p>

            <p className="mt-4 text-sm leading-7 text-white/45">
              {product.description}
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              onRequireAccount(
                product,
                size,
                quantity
              )
            }
            className="mt-10 flex min-h-14 w-full items-center justify-center border border-[#c7a96b]/70 bg-[#c7a96b] px-6 text-xs uppercase tracking-[0.35em] text-black transition-all duration-500 hover:bg-transparent hover:text-[#c7a96b]"
          >
            Ajouter au panier
          </button>

          <p className="mt-4 text-center text-[9px] uppercase tracking-[0.3em] text-white/20">
            Size {size} · Quantity {quantity}
          </p>

        </div>
      </div>
    </div>
  );
}

/* =========================================================
   COLLECTION PAGE
========================================================= */

export default function CollectionPage() {
  const introRef =
    useRef<HTMLDivElement>(
      null
    );

  const collectionRef =
    useRef<HTMLElement>(
      null
    );

  const [
    selectedProduct,
    setSelectedProduct,
  ] =
    useState<
      (typeof products)[number] | null
    >(null);

  const [
    showAccountModal,
    setShowAccountModal,
  ] = useState(false);

  const [
    accountMenuOpen,
    setAccountMenuOpen,
  ] = useState(false);

  const [
    cartMenuOpen,
    setCartMenuOpen,
  ] = useState(false);

  const [
    cart,
    setCart,
  ] = useState<CartItem[]>(
    []
  );

  const [
    orders,
    setOrders,
  ] = useState<PendingOrder[]>(
    []
  );

  const [
    sessionReady,
    setSessionReady,
  ] = useState(false);

  const {
    data: session,
    isPending:
      sessionPending,
  } =
    authClient.useSession();

  useEffect(() => {
    if (!sessionPending) {
      setSessionReady(true);
    }
  }, [sessionPending]);

  useEffect(() => {
    const lenis =
      new Lenis({
        autoRaf: true,
      });

    const intro =
      introRef.current;

    const collection =
      collectionRef.current;

    if (
      !intro ||
      !collection
    ) {
      return () => {
        lenis.destroy();
      };
    }

    const reduceMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

    const ctx =
      gsap.context(() => {
        const tl =
          gsap.timeline();

        if (reduceMotion) {
          gsap.set(
            ".intro-letter",
            {
              opacity: 1,
              y: 0,
            }
          );

          gsap.set(
            ".intro-line",
            {
              scaleX: 1,
            }
          );

          gsap.set(intro, {
            yPercent: -100,
          });

          gsap.set(
            ".collection-content",
            {
              opacity: 1,
              y: 0,
            }
          );

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
            duration: 0.8,
            stagger: 0.08,
            ease: "power4.out",
          }
        )
          .to(
            ".intro-line",
            {
              scaleX: 1,
              duration: 1,
              ease: "power4.inOut",
            }
          )
          .to(intro, {
            yPercent: -100,
            duration: 1.2,
            ease: "power4.inOut",
            delay: 0.35,
          })
          .fromTo(
            ".collection-content",
            {
              opacity: 0,
              y: 50,
            },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: "power4.out",
            },
            "-=0.4"
          );
      });

    return () => {
      ctx.revert();
      lenis.destroy();
    };
  }, []);

  /* =======================================================
     LOAD CART + ORDERS
  ======================================================= */

  useEffect(() => {
    try {
      const savedCart =
        localStorage.getItem(
          "el-mara-cart"
        );

      if (savedCart) {
        const parsedCart =
          JSON.parse(
            savedCart
          );

        if (
          Array.isArray(
            parsedCart
          )
        ) {
          setCart(
            parsedCart
          );
        }
      }
    } catch {
      localStorage.removeItem(
        "el-mara-cart"
      );
    }

    try {
      const savedOrders =
        localStorage.getItem(
          "el-mara-orders"
        );

      if (savedOrders) {
        const parsedOrders =
          JSON.parse(
            savedOrders
          );

        if (
          Array.isArray(
            parsedOrders
          )
        ) {
          setOrders(
            parsedOrders.filter(
              (order: PendingOrder) =>
                order.status !==
                  "processing" ||
                true
            )
          );
        }
      }
    } catch {
      localStorage.removeItem(
        "el-mara-orders"
      );
    }
  }, []);

  /* =======================================================
     CLOSE MENUS WHEN CLICKING ESC
  ======================================================= */

  useEffect(() => {
    const handleKeyDown =
      (
        event: KeyboardEvent
      ) => {
        if (
          event.key ===
          "Escape"
        ) {
          setAccountMenuOpen(
            false
          );

          setCartMenuOpen(
            false
          );

          if (
            showAccountModal
          ) {
            setShowAccountModal(
              false
            );
          }

          if (
            selectedProduct
          ) {
            setSelectedProduct(
              null
            );
          }
        }
      };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    selectedProduct,
    showAccountModal,
  ]);

  /* =======================================================
     CART HELPERS
  ======================================================= */

  const saveCart = (
    nextCart: CartItem[]
  ) => {
    setCart(
      nextCart
    );

    localStorage.setItem(
      "el-mara-cart",
      JSON.stringify(
        nextCart
      )
    );
  };

  const removeCartItem = (
    index: number
  ) => {
    const nextCart =
      cart.filter(
        (_, itemIndex) =>
          itemIndex !==
          index
      );

    saveCart(
      nextCart
    );
  };

  const handleAddToCart = (
    product: (typeof products)[number],
    size: string,
    quantity: number
  ) => {
    if (
      !sessionReady
    ) {
      return;
    }

    if (!session) {
      setShowAccountModal(
        true
      );

      return;
    }

    const existingIndex =
      cart.findIndex(
        (item) =>
          item.productNumber ===
            product.number &&
          item.size ===
            size
      );

    const nextCart = [
      ...cart,
    ];

    if (
      existingIndex >=
      0
    ) {
      nextCart[
        existingIndex
      ] = {
        ...nextCart[
          existingIndex
        ],
        quantity:
          nextCart[
            existingIndex
          ].quantity +
          quantity,
      };
    } else {
      nextCart.push({
        productNumber:
          product.number,
        name:
          product.name,
        price:
          product.price,
        size,
        quantity,
      });
    }

    saveCart(
      nextCart
    );

    setSelectedProduct(
      null
    );

    setCartMenuOpen(
      true
    );
  };

  /* =======================================================
     SIGN OUT
  ======================================================= */

  const handleSignOut =
    async () => {
      try {
        await authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              setAccountMenuOpen(
                false
              );

              setCartMenuOpen(
                false
              );

              window.location.href =
                "/";
            },
          },
        });
      } catch (error) {
        console.error(
          "SIGN_OUT_ERROR",
          error
        );
      }
    };

  const cartCount =
    cart.reduce(
      (
        total,
        item
      ) =>
        total +
        item.quantity,
      0
    );

  return (
    <main className="min-h-screen bg-[#080808] text-[#f4f0e8]">

      {/* =====================================================
          INTRO
      ====================================================== */}

      <section
        ref={introRef}
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#080808]"
      >
        <div className="flex flex-col items-center">

          <div className="flex overflow-hidden text-[clamp(3rem,10vw,9rem)] font-light tracking-[0.35em]">

            {"EL MARA"
              .split("")
              .map(
                (
                  letter,
                  index
                ) => (
                  <span
                    key={
                      index
                    }
                    className="intro-letter inline-block"
                  >
                    {letter ===
                    " "
                      ? "\u00A0"
                      : letter}
                  </span>
                )
              )}

          </div>

          <div className="intro-line mt-8 h-px w-40 origin-left scale-x-0 bg-[#c7a96b]" />

        </div>
      </section>

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between px-6 py-6 mix-blend-difference md:px-12">

        {/* HOME */}

        <Link
          href="/"
          className="group flex items-center gap-3 text-[10px] uppercase tracking-[0.35em] text-white/70 transition-colors duration-500 hover:text-[#c7a96b]"
        >
          <span className="transition-transform duration-500 group-hover:-translate-x-1">
            ←
          </span>

          <span>
            Home
          </span>
        </Link>

        {/* BRAND */}

        <div className="text-xs font-light tracking-[0.45em] text-white">
          EL MARA
        </div>

        {/* RIGHT ACTIONS */}

        <div className="relative flex items-center gap-3">

          {/* ACCOUNT */}

          <button
            type="button"
            onClick={() => {
              setAccountMenuOpen(
                (current) =>
                  !current
              );

              setCartMenuOpen(
                false
              );
            }}
            aria-label="Compte"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition-all duration-300 hover:border-[#c7a96b]/60 hover:text-[#c7a96b]"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle
                cx="12"
                cy="8"
                r="3.5"
              />
              <path d="M4.5 20c.8-3.2 3.2-5 7.5-5s6.7 1.8 7.5 5" />
            </svg>
          </button>

          {/* CART */}

          <button
            type="button"
            onClick={() => {
              setCartMenuOpen(
                (current) =>
                  !current
              );

              setAccountMenuOpen(
                false
              );
            }}
            aria-label="Panier"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition-all duration-300 hover:border-[#c7a96b]/60 hover:text-[#c7a96b]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
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

            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c7a96b] px-1 text-[8px] font-medium text-black">
                {cartCount}
              </span>
            )}
          </button>

          {/* ACCOUNT MENU */}

          <AccountMenu
            isOpen={
              accountMenuOpen
            }
            onClose={() =>
              setAccountMenuOpen(
                false
              )
            }
            session={
              session
                ? {
                    user: {
                      name:
                        session.user
                          .name,
                      email:
                        session.user
                          .email,
                    },
                  }
                : null
            }
            onSignOut={
              handleSignOut
            }
          />

          {/* CART MENU */}

          <CartMenu
            isOpen={
              cartMenuOpen
            }
            onClose={() =>
              setCartMenuOpen(
                false
              )
            }
            cart={cart}
            orders={orders}
            onRemove={
              removeCartItem
            }
            onContinue={() => {
              setCartMenuOpen(
                false
              );

              window.scrollTo({
                top: document.body.scrollHeight,
                behavior:
                  "smooth",
              });
            }}
          />

        </div>

      </header>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <section
        ref={
          collectionRef
        }
        className="collection-content px-6 pb-24 pt-32 md:px-12 md:pt-40"
      >
        <div className="mx-auto max-w-[1600px]">

          {/* TITLE + GLOBE */}

          <div className="mb-24 grid items-center gap-12 lg:grid-cols-2">

            <div>
              <p className="mb-5 text-xs uppercase tracking-[0.5em] text-[#c7a96b]">
                EL MARA / 01
              </p>

              <h1 className="text-[clamp(3.5rem,9vw,9rem)] font-light leading-[0.9] tracking-[-0.05em]">
                The
                <br />
                Collection
              </h1>

              <p className="mt-8 max-w-md text-sm leading-8 text-white/40 md:text-base">
                Discover the complete EL MARA collection.
                Nine pieces created around modern menswear,
                precision and distinction.
              </p>
            </div>

            <div className="h-[420px] w-full md:h-[520px]">

              <div className="relative h-full w-full overflow-hidden">

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(199,169,107,0.12),transparent_55%)]" />

                <GlobeLoader />

              </div>

            </div>

          </div>

          {/* PRODUCTS */}

          <div className="mb-16 flex items-end justify-between border-b border-white/10 pb-8">

            <div>

              <p className="mb-4 text-xs uppercase tracking-[0.4em] text-[#c7a96b]">
                02
              </p>

              <h2 className="text-4xl font-light md:text-6xl">
                All Products
              </h2>

            </div>

            <span className="hidden text-xs uppercase tracking-[0.3em] text-white/30 md:block">
              09 Pieces
            </span>

          </div>

          <div className="grid gap-x-6 gap-y-16 md:grid-cols-2 lg:grid-cols-3">

            {products.map(
              (
                product,
                index
              ) => (
                <ProductCard
                  key={
                    product.name
                  }
                  product={
                    product
                  }
                  index={
                    index
                  }
                  onOpen={
                    setSelectedProduct
                  }
                />
              )
            )}

          </div>

          {/* LOGO */}

          <div className="mt-40 flex flex-col items-center border-t border-white/10 pt-24">

            <img
              src="/logo.png"
              alt="EL MARA"
              className="h-32 w-auto object-contain md:h-40"
            />

            <p className="mt-6 text-[9px] uppercase tracking-[0.55em] text-white/30">
              EL MARA
            </p>

          </div>

          {/* BACK HOME */}

          <div className="mt-20 flex justify-center">

            <Link
              href="/"
              className="group border border-[#c7a96b]/50 px-8 py-4 text-[10px] uppercase tracking-[0.35em] transition-all duration-500 hover:bg-[#c7a96b] hover:text-black"
            >
              <span className="mr-3 transition-transform duration-500 group-hover:-translate-x-1">
                ←
              </span>

              Retour à l'accueil
            </Link>

          </div>

          {/* FOOTER */}

          <footer className="mt-32 border-t border-white/10 pt-20">

            <div className="grid gap-16 md:grid-cols-3">

              <div>
                <p className="text-xs uppercase tracking-[0.45em] text-[#c7a96b]">
                  EL MARA
                </p>

                <p className="mt-6 max-w-xs text-sm leading-7 text-white/35">
                  Modern menswear designed with character,
                  precision and distinction.
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.45em] text-[#c7a96b]">
                  Contact
                </p>

                <div className="mt-6 flex flex-col gap-4 text-sm text-white/45">

                  {siteInfo.email && (
                    <a
                      href={`mailto:${siteInfo.email}`}
                      className="transition-colors duration-300 hover:text-[#c7a96b]"
                    >
                      {siteInfo.email}
                    </a>
                  )}

                  {siteInfo.whatsapp && (
                    <a
                      href={`https://wa.me/${siteInfo.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors duration-300 hover:text-[#c7a96b]"
                    >
                      WhatsApp
                    </a>
                  )}

                  {!siteInfo.email &&
                    !siteInfo.whatsapp && (
                      <span className="text-white/20">
                        Contact information coming soon.
                      </span>
                    )}

                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.45em] text-[#c7a96b]">
                  Follow EL MARA
                </p>

                <div className="mt-6 flex flex-col gap-4 text-sm text-white/45">

                  {siteInfo.instagram && (
                    <a
                      href={siteInfo.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors duration-300 hover:text-[#c7a96b]"
                    >
                      Instagram
                    </a>
                  )}

                  {siteInfo.tiktok && (
                    <a
                      href={siteInfo.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors duration-300 hover:text-[#c7a96b]"
                    >
                      TikTok
                    </a>
                  )}

                  {!siteInfo.instagram &&
                    !siteInfo.tiktok && (
                      <span className="text-white/20">
                        Social networks coming soon.
                      </span>
                    )}

                </div>
              </div>

            </div>

            <div className="mt-20 flex flex-col justify-between gap-6 border-t border-white/10 pt-8 text-[9px] uppercase tracking-[0.35em] text-white/20 md:flex-row">

              <p>
                © 2026 EL MARA
              </p>

              <p>
                All Rights Reserved
              </p>

            </div>

          </footer>

        </div>
      </section>

      {/* =====================================================
          PRODUCT DETAIL
      ====================================================== */}

      {selectedProduct && (
        <ProductDetail
          product={
            selectedProduct
          }
          onClose={() =>
            setSelectedProduct(
              null
            )
          }
          onRequireAccount={
            handleAddToCart
          }
        />
      )}

      {/* =====================================================
          ACCOUNT MODAL
      ====================================================== */}

      {showAccountModal && (
        <AccountModal
          onClose={() =>
            setShowAccountModal(
              false
            )
          }
        />
      )}

    </main>
  );
}