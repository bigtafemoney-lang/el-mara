"use client";

import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";

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

const RADIUS = 2.4;
const MAP_WIDTH = 2048;
const MAP_HEIGHT = 1024;

/* =========================================================
   COORDONNÉES -> GLOBE
========================================================= */

function latLonToVector3(
  latitude: number,
  longitude: number,
  radius = RADIUS
) {
  const phi = (90 - latitude) * (Math.PI / 180);
  const theta = (longitude + 180) * (Math.PI / 180);

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

/* =========================================================
   GEOJSON -> CANVAS TEXTURE
   Cette texture contient les continents ET frontières.
========================================================= */

function drawRing(
  ctx: CanvasRenderingContext2D,
  ring: number[][],
  width: number,
  height: number
) {
  if (!ring.length) return;

  ring.forEach(([longitude, latitude], index) => {
    const x = ((longitude + 180) / 360) * width;
    const y = ((90 - latitude) / 180) * height;

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.closePath();
}

function drawPolygon(
  ctx: CanvasRenderingContext2D,
  polygon: number[][][],
  width: number,
  height: number
) {
  ctx.beginPath();

  polygon.forEach((ring) => {
    drawRing(ctx, ring, width, height);
  });

  /*
   * Remplissage doré très subtil
   * pour rendre les continents visibles
   * sans perdre l'effet noir/luxe.
   */
  ctx.fillStyle = "rgba(199, 169, 107, 0.38)";
  ctx.fill("evenodd");

  /*
   * Frontières dorées.
   */
  ctx.strokeStyle = "rgba(199, 169, 107, 0.95)";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function createWorldTexture(
  countries: CountriesData
) {
  const canvas = document.createElement("canvas");

  canvas.width = MAP_WIDTH;
  canvas.height = MAP_HEIGHT;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  /*
   * Fond transparent.
   */
  ctx.clearRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

  countries.features.forEach((feature) => {
    const geometry = feature.geometry;

    if (geometry.type === "Polygon") {
      drawPolygon(
        ctx,
        geometry.coordinates as number[][][],
        MAP_WIDTH,
        MAP_HEIGHT
      );
    }

    if (geometry.type === "MultiPolygon") {
      geometry.coordinates.forEach((polygon) => {
        drawPolygon(
          ctx,
          polygon,
          MAP_WIDTH,
          MAP_HEIGHT
        );
      });
    }
  });

  const texture = new THREE.CanvasTexture(canvas);

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;

  return texture;
}

/* =========================================================
   ANGOLA
========================================================= */

function AngolaMarker() {
  /*
   * Position de Luanda.
   * Le point reste fixé à la surface du globe.
   */
  const position = latLonToVector3(
    -8.8383,
    13.2344,
    RADIUS + 0.055
  );

  return (
    <group position={position}>
      {/* POINT ROUGE */}
      <mesh>
        <sphereGeometry args={[0.08, 32, 32]} />

        <meshBasicMaterial color="#ff2020" />
      </mesh>

      {/* HALO ROUGE */}
      <mesh>
        <sphereGeometry args={[0.17, 32, 32]} />

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

function Globe({
  texture,
}: {
  texture: THREE.CanvasTexture;
}) {
  return (
    <group
      /*
       * Orientation initiale :
       * on place l'Afrique dans la zone visible.
       */
      rotation={[0, -0.62, 0]}
    >
      {/* SPHÈRE NOIRE */}
      <mesh>
        <sphereGeometry args={[RADIUS, 96, 96]} />

        <meshStandardMaterial
          color="#020202"
          roughness={0.58}
          metalness={0.82}
        />
      </mesh>

      {/* CONTINENTS + FRONTIÈRES */}
      <mesh
        scale={[
          RADIUS / 2.4 + 0.008,
          RADIUS / 2.4 + 0.008,
          RADIUS / 2.4 + 0.008,
        ]}
      >
        <sphereGeometry args={[2.4, 96, 96]} />

        <meshBasicMaterial
          map={texture}
          transparent
          opacity={1}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* ANGOLA */}
      <AngolaMarker />
    </group>
  );
}

/* =========================================================
   SCÈNE
========================================================= */

function GlobeScene({
  countries,
}: {
  countries: CountriesData;
}) {
  const texture = useMemo(() => {
    return createWorldTexture(countries);
  }, [countries]);

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
      {/* LUMIÈRE GÉNÉRALE */}
      <ambientLight intensity={0.28} />

      {/* LUMIÈRE DORÉE PRINCIPALE */}
      <directionalLight
        position={[5, 4, 6]}
        intensity={2.8}
        color="#c7a96b"
      />

      {/* LUMIÈRE D'APPOINT */}
      <pointLight
        position={[-4, -2, 4]}
        intensity={1.3}
        color="#c7a96b"
      />

      {/* ESPACE */}
      <Stars
        radius={70}
        depth={45}
        count={1800}
        factor={2}
        saturation={0}
        fade
        speed={0.2}
      />

      {/* GLOBE */}
      <Globe texture={texture} />

      {/* CONTRÔLES */}
      <OrbitControls
        enablePan={false}
        enableZoom
        enableRotate
        enableDamping
        dampingFactor={0.055}
        rotateSpeed={0.55}
        zoomSpeed={0.7}
        minDistance={4}
        maxDistance={9}
      />
    </>
  );
}

/* =========================================================
   COMPOSANT PRINCIPAL
========================================================= */

export default function Globe() {
  const [countries, setCountries] =
    useState<CountriesData | null>(null);

  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/data/countries.geojson")
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Impossible de charger la carte."
          );
        }

        return response.json();
      })
      .then((data: CountriesData) => {
        setCountries(data);
      })
      .catch(() => {
        setError(true);
      });
  }, []);

  return (
    <div className="relative h-[650px] w-full">
      {/* ERREUR */}
      {error && (
        <div className="absolute inset-0 z-20 flex items-center justify-center text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-red-400">
            Globe data unavailable
          </p>
        </div>
      )}

      {/* CHARGEMENT */}
      {!countries && !error && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#c7a96b]/60">
            Loading EL MARA Globe
          </p>
        </div>
      )}

      <Canvas
        dpr={[1, 2]}
        camera={{
          /*
           * Vue initiale orientée vers l'Afrique.
           */
          position: [3.2, 0.8, 5.4],
          fov: 45,
        }}
      >
        {countries && (
          <GlobeScene countries={countries} />
        )}
      </Canvas>
    </div>
  );
}