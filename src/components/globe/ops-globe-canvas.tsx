"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";
import { feature } from "topojson-client";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { GeometryCollection, Topology } from "topojson-specification";
import {
  OPS_HUBS,
  hubArcs,
  normalizeCountryName,
  primaryHubForCountry,
  type OpsHub,
} from "@/lib/ops-geo";

const EARTH = "https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg";
const BUMP = "https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png";
const COUNTRIES = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

type CountryFeature = Feature<Geometry, { name: string }>;

function countryName(obj: object) {
  const feat = obj as { properties?: { name?: string; NAME?: string } };
  return feat.properties?.name ?? feat.properties?.NAME ?? "";
}

function loadImage(url: string) {
  return new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load ${url}`));
    img.src = url;
  });
}

export function OpsGlobeCanvas({
  hub,
  onSelectHub,
}: {
  hub: OpsHub;
  onSelectHub: (hub: OpsHub) => void;
}) {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const interacted = useRef(false);
  const hubRef = useRef(hub);
  hubRef.current = hub;
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [countries, setCountries] = useState<CountryFeature[]>([]);
  const [hover, setHover] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const arcs = useMemo(() => hubArcs(), []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const apply = () => {
      const rect = el.getBoundingClientRect();
      setSize({ width: Math.max(1, Math.floor(rect.width)), height: Math.max(1, Math.floor(rect.height)) });
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    void loadImage(EARTH).catch(() => undefined);
    void loadImage(BUMP).catch(() => undefined);
    fetch(COUNTRIES)
      .then((res) => res.json())
      .then((world: Topology) => {
        if (cancelled) return;
        const object = world.objects.countries as GeometryCollection<{ name: string }>;
        const fc = feature(world, object) as FeatureCollection<Geometry, { name: string }>;
        setCountries(fc.features);
      })
      .catch(() => {
        if (!cancelled) setCountries([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const flyTo = useCallback((next: OpsHub, ms = 1100) => {
    globeRef.current?.pointOfView({ lat: next.lat, lng: next.lng, altitude: 1.55 }, ms);
  }, []);

  useEffect(() => {
    if (!ready) return;
    flyTo(hub, interacted.current ? 1100 : 0);
  }, [flyTo, hub, ready]);

  useEffect(() => {
    if (!ready) return;
    const el = containerRef.current;
    if (!el) return;
    el.dataset.ready = "1";
    el.dataset.countries = String(countries.length);
  }, [ready, countries.length]);

  const handleReady = useCallback(() => {
    const globe = globeRef.current;
    if (!globe) return;
    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.35;
    controls.minDistance = 120;
    const stop = () => {
      interacted.current = true;
      controls.autoRotate = false;
    };
    controls.addEventListener("start", stop);
    const current = hubRef.current;
    globe.pointOfView({ lat: current.lat, lng: current.lng, altitude: 1.85 }, 0);
    if (containerRef.current) {
      containerRef.current.dataset.ready = "1";
    }
    setReady(true);
  }, []);

  const selectCountry = useCallback(
    (obj: object) => {
      const name = countryName(obj);
      const next = primaryHubForCountry(name);
      if (!next) return;
      interacted.current = true;
      const controls = globeRef.current?.controls();
      if (controls) controls.autoRotate = false;
      onSelectHub(next);
    },
    [onSelectHub],
  );

  return (
    <div
      ref={containerRef}
      data-testid="ops-globe"
      className="relative h-full w-full overflow-hidden bg-[#04070b]"
    >
      {!ready ? (
        <div className="absolute inset-0 z-10 animate-pulse bg-[radial-gradient(circle_at_center,#12202c,transparent_55%)]" />
      ) : null}
      {size.width > 0 ? (
        <Globe
          ref={globeRef}
          width={size.width}
          height={size.height}
          backgroundColor="#04070b"
          globeImageUrl={EARTH}
          bumpImageUrl={BUMP}
          showAtmosphere
          atmosphereColor="#2ee6d6"
          atmosphereAltitude={0.18}
          animateIn={false}
          rendererConfig={{ antialias: true, alpha: false }}
          polygonsData={countries}
          polygonsTransitionDuration={0}
          polygonCapColor={(d) => {
            const name = normalizeCountryName(countryName(d as object));
            const selected = normalizeCountryName(hub.country) === name;
            if (selected) return "rgba(46,230,214,0.22)";
            if (hover && normalizeCountryName(hover) === name) return "rgba(46,230,214,0.14)";
            return "rgba(255, 255, 255, 0.02)";
          }}
          polygonSideColor={() => "rgba(46,230,214,0.08)"}
          polygonStrokeColor={() => "rgba(210, 228, 236, 0.85)"}
          polygonAltitude={(d) => {
            const name = normalizeCountryName(countryName(d as object));
            if (normalizeCountryName(hub.country) === name) return 0.01;
            if (hover && normalizeCountryName(hover) === name) return 0.007;
            return 0.004;
          }}
          polygonLabel={(d) => {
            const name = countryName(d as object);
            const next = primaryHubForCountry(name);
            const label = next ? `${name} · ${next.name}` : name;
            return `<div style="font:12px ui-sans-serif,system-ui;padding:4px 6px;background:#10161e;border:1px solid #243042;color:#e8eef6">${label}</div>`;
          }}
          onPolygonHover={(d) => setHover(d ? countryName(d) : null)}
          onPolygonClick={(d) => selectCountry(d)}
          pointsData={OPS_HUBS}
          pointLat="lat"
          pointLng="lng"
          pointAltitude={(d) => ((d as OpsHub).isHub ? 0.024 : 0.012)}
          pointRadius={(d) => ((d as OpsHub).isHub ? 0.42 : 0.22)}
          pointColor={(d) => {
            const city = d as OpsHub;
            if (city.slug === hub.slug) return "#2ee6d6";
            if (city.isHub) return "#e8b84a";
            return "#8b97a8";
          }}
          pointLabel={(d) => (d as OpsHub).name}
          onPointClick={(d) => {
            interacted.current = true;
            const controls = globeRef.current?.controls();
            if (controls) controls.autoRotate = false;
            onSelectHub(d as OpsHub);
          }}
          labelsData={OPS_HUBS.filter((h) => h.isHub)}
          labelLat="lat"
          labelLng="lng"
          labelText="name"
          labelSize={0.55}
          labelDotRadius={0}
          labelColor={() => "#e8eef6"}
          labelAltitude={0.02}
          labelResolution={2}
          arcsData={arcs}
          arcStartLat="startLat"
          arcStartLng="startLng"
          arcEndLat="endLat"
          arcEndLng="endLng"
          arcColor={() => ["rgba(46,230,214,0.05)", "rgba(46,230,214,0.75)"]}
          arcStroke={0.35}
          arcDashLength={0.35}
          arcDashGap={0.6}
          arcDashAnimateTime={3200}
          arcAltitudeAutoScale={0.45}
          onGlobeReady={handleReady}
        />
      ) : null}
    </div>
  );
}
