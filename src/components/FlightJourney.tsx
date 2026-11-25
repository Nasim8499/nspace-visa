"use client";

import Link from "next/link";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  COUNTRIES,
  ORIGIN,
  flagUrl,
  flightHours,
  formatBdt,
  getCountry,
  haversineKm,
  totalFeeBdt,
} from "@/lib/countries";
import { WORLD_PATHS } from "@/lib/world-paths";
import { FlightSound } from "@/lib/flightSound";
import { useDestination } from "./DestinationProvider";

const W = 1000;
const H = 500;
const proj = (lng: number, lat: number): [number, number] => [
  ((lng + 180) / 360) * W,
  ((90 - lat) / 180) * H,
];

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => t * t * (3 - 2 * t);
const ease = (p: number) => 0.45 * p + 0.55 * smooth(p);

const Land = memo(function Land({ dest, origin }: { dest: string; origin: string }) {
  return (
    <>
      {WORLD_PATHS.map(([n, d]) => (
        <path
          key={n}
          d={d}
          fill={n === dest ? "#2f5bff" : n === origin ? "#ffcf3f" : "#ffffff"}
          stroke="#b7cbe6"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </>
  );
});

type Hud = { km: number; alt: number; speed: number; phase: string; hoursLeft: number; arrived: boolean };

export function FlightJourney() {
  const { slug, setSlug } = useDestination();
  const dest = getCountry(slug) ?? COUNTRIES[0];

  const secRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const mapBox = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const landG = useRef<SVGGElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const planeRef = useRef<SVGGElement>(null);
  const originRef = useRef<SVGGElement>(null);
  const destRef = useRef<SVGGElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const lutRef = useRef<{ x: Float32Array; y: Float32Array; n: number; total: number } | null>(null);

  const [hud, setHud] = useState<Hud>({ km: 0, alt: 0, speed: 0, phase: "Boarding at Dhaka", hoursLeft: 0, arrived: false });
  const [soundOn, setSoundOn] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const sound = useRef<FlightSound | null>(null);
  const soundOnRef = useRef(false);
  const destRefData = useRef(dest);
  destRefData.current = dest;

  const geo = useMemo(() => {
    const o = proj(ORIGIN.lng, ORIGIN.lat);
    const d = proj(dest.lng, dest.lat);
    const dx = d[0] - o[0];
    const dy = d[1] - o[1];
    const len = Math.hypot(dx, dy);
    const c: [number, number] = [(o[0] + d[0]) / 2 - dy * 0.12, (o[1] + d[1]) / 2 + dx * 0.0 - len * 0.22 - 6];
    return { o, d, c, dx, dy, path: `M${o[0]} ${o[1]} Q${c[0]} ${c[1]} ${d[0]} ${d[1]}` };
  }, [dest]);

  const km = useMemo(() => Math.round(haversineKm(ORIGIN, dest)), [dest]);
  const hours = flightHours(dest);

  // clock
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // sound toggle
  async function toggleSound() {
    if (soundOn) {
      sound.current?.stop();
      sound.current = null;
      soundOnRef.current = false;
      setSoundOn(false);
      return;
    }
    const s = new FlightSound();
    sound.current = s;
    try {
      await s.start();
      soundOnRef.current = true;
      setSoundOn(true);
      s.say(`Welcome aboard Nspace Air. Next stop, ${destRefData.current.name}. Scroll to take off.`);
    } catch {
      sound.current = null;
    }
  }
  useEffect(
    () => () => {
      sound.current?.stop();
    },
    [],
  );

  // arc-length lookup table for the route, rebuilt only when the route changes
  useEffect(() => {
    const path = routeRef.current;
    if (!path) return;
    const total = path.getTotalLength();
    const n = 480;
    const x = new Float32Array(n);
    const y = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const pt = path.getPointAtLength((total * i) / (n - 1));
      x[i] = pt.x;
      y[i] = pt.y;
    }
    lutRef.current = { x, y, n, total };
  }, [geo]);

  // main animation loop
  useEffect(() => {
    const st = { cur: 0, target: 0, prev: 0, visible: true, prevT: performance.now(), arrivedSaid: false, key: "", hudAt: 0 };
    let raf = 0;
    const box = mapBox.current!;
    let width = box.clientWidth || 1;
    let height = box.clientHeight || 1;
    const ro = new ResizeObserver(() => {
      width = box.clientWidth || 1;
      height = box.clientHeight || 1;
    });
    ro.observe(box);

    const io = new IntersectionObserver(
      ([e]) => {
        st.visible = e.isIntersecting;
        sound.current?.setMuted(!e.isIntersecting);
      },
      { threshold: 0 },
    );
    io.observe(secRef.current!);

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!st.visible) return;
      const sec = secRef.current!;
      const sticky = stickyRef.current!;
      const rect = sec.getBoundingClientRect();
      const stickyTop = 64;
      const range = Math.max(1, rect.height - sticky.offsetHeight);
      st.target = clamp((stickyTop - rect.top) / range, 0, 1);
      const nowT = performance.now();
      const dt = Math.min(0.1, Math.max(0.001, (nowT - st.prevT) / 1000));
      /* exponential damping: identical feel at 60, 90 and 120 Hz */
      st.cur += (st.target - st.cur) * (1 - Math.exp(-6.5 * dt));
      if (Math.abs(st.target - st.cur) < 0.0003) st.cur = st.target;
      const p = st.cur;
      const vel = Math.abs(p - st.prev) / dt;
      st.prev = p;
      st.prevT = nowT;

      const lut = lutRef.current;
      const e = ease(p);
      /* sample a pre-built arc-length table instead of asking the DOM path for
         its length and points on every frame (that forced layout + geometry
         work on each tick and was the visible hitch on phones) */
      let px = 0;
      let py = 0;
      let angle = 0;
      if (lut) {
        const f = clamp(e, 0, 1) * (lut.n - 1);
        const i0 = Math.min(lut.n - 2, Math.floor(f));
        const fr = f - i0;
        px = lut.x[i0] + (lut.x[i0 + 1] - lut.x[i0]) * fr;
        py = lut.y[i0] + (lut.y[i0 + 1] - lut.y[i0]) * fr;
        const j = Math.min(lut.n - 1, i0 + 2);
        angle = (Math.atan2(lut.y[j] - lut.y[i0], lut.x[j] - lut.x[i0]) * 180) / Math.PI;
      }
      const pt = { x: px, y: py };
      const total = lut?.total ?? 1;
      const at = total * e;

      // camera
      const g = geo;
      const aspect = width / height;
      const needW = Math.max(Math.abs(g.dx) * 1.7, Math.abs(g.dy) * 1.9 * aspect, 110);
      const zMid = clamp(W / needW, 1, 9);
      const zEdge = 9;
      const s = smooth(clamp(Math.sin(Math.PI * p) * 2.0, 0, 1));
      const z = Math.exp(Math.log(zEdge) * (1 - s) + Math.log(Math.min(zMid, zEdge)) * s);
      const vbW = W / z;
      const vbH = vbW / aspect;
      const midX = (g.o[0] + g.d[0]) / 2;
      const midY = (g.o[1] + g.d[1]) / 2 - Math.abs(g.dx + g.dy) * 0.05;
      const cx = pt.x * (1 - s * 0.9) + midX * s * 0.9;
      const cy = pt.y * (1 - s * 0.9) + midY * s * 0.9;
      const u = vbW / width;
      const svg = svgRef.current!;
      svg.setAttribute("viewBox", `${cx - vbW / 2} ${cy - vbH / 2} ${vbW} ${vbH}`);
      /* strokes are non-scaling, so only the flown trail needs a dash update */
      const trail = trailRef.current!;
      trail.setAttribute("stroke-dasharray", `${at} ${total * 2}`);
      planeRef.current!.setAttribute("transform", `translate(${pt.x} ${pt.y}) rotate(${angle}) scale(${u * 1.5})`);
      originRef.current!.setAttribute("transform", `translate(${g.o[0]} ${g.o[1]}) scale(${u})`);
      destRef.current!.setAttribute("transform", `translate(${g.d[0]} ${g.d[1]}) scale(${u})`);
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      if (hintRef.current) hintRef.current.style.opacity = String(clamp(1 - p * 14, 0, 1));

      // HUD
      const dist = haversineKm(ORIGIN, destRefData.current) * e;
      const ramp = Math.min(1, p / 0.1, (1 - p) / 0.1);
      const alt = Math.round((35000 * clamp(ramp, 0, 1)) / 100) * 100;
      const speed = Math.round((870 * clamp(ramp, 0, 1)) / 5) * 5;
      const d = destRefData.current;
      const phase =
        p < 0.005
          ? "Boarding · Dhaka (DAC)"
          : p < 0.1
            ? "Take-off from Dhaka"
            : p < 0.9
              ? "Cruising · 35,000 ft"
              : p < 0.995
                ? `Final approach · ${d.airport}`
                : `Landed in ${d.airport}`;
      const left = Math.max(0, flightHours(d) * (1 - e));
      const arrived = p > 0.94;
      const key = `${Math.round(dist / 5)}|${alt}|${speed}|${phase}|${arrived}|${Math.round(left * 10)}`;
      /* at most ~12 HUD renders per second, so React never competes with the scroll */
      if (key !== st.key && nowT - st.hudAt > 80) {
        st.key = key;
        st.hudAt = nowT;
        setHud({ km: Math.round(dist), alt, speed, phase, hoursLeft: left, arrived });
      }

      // sound
      if (sound.current && soundOnRef.current) {
        const base = p < 0.005 ? 0.12 : p < 0.1 ? 0.95 : p < 0.9 ? 0.42 : 0.7;
        sound.current.update(base + Math.min(0.35, vel * 4));
        if (p > 0.985 && !st.arrivedSaid) {
          st.arrivedSaid = true;
          sound.current.chime();
          sound.current.say(
            `We have landed in ${d.name}. Your ${d.visaType} is ready to apply. Thank you for flying Nspace Air.`,
          );
        }
        if (p < 0.9) st.arrivedSaid = false;
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [geo]);

  const fmtTime = (tz: string) =>
    now
      ? new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: tz }).format(now)
      : "--:--:--";
  const tzOffset = (tz: string) => {
    if (!now) return "";
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "shortOffset" }).formatToParts(now);
    return parts.find((x) => x.type === "timeZoneName")?.value ?? "";
  };

  return (
    <section id="journey" ref={secRef} className="relative bg-[#e9f1fc]" style={{ height: "480vh" }}>
      <div
        ref={stickyRef}
        className="sticky top-16 h-[calc(100svh-4rem-68px)] overflow-hidden md:h-[calc(100svh-4rem)]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-5%,#f4f9ff_0%,#dfeafb_45%,#cfe0f6_100%)]" />
        <div className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-sun/25 blur-3xl" />

        {/* map */}
        <div ref={mapBox} className="absolute inset-0">
          <svg ref={svgRef} className="h-full w-full" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet">
            <g ref={landG} strokeLinejoin="round">
              <Land dest={dest.world} origin={ORIGIN.world} />
            </g>
            <path ref={routeRef} d={geo.path} fill="none" stroke="rgba(11,15,26,0.22)" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            <path ref={trailRef} d={geo.path} fill="none" stroke="#2f5bff" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            <g ref={originRef}>
              <circle r="5" fill="#ffcf3f" stroke="#0b0f1a" strokeWidth="0.6" />
              <text y="-12" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0b0f1a" style={{ paintOrder: "stroke" }} stroke="rgba(255,255,255,.92)" strokeWidth="3">
                Dhaka
              </text>
            </g>
            <g ref={destRef}>
              <circle r="9" fill="#3d68ff" className="animate-pulse-ring" style={{ transformBox: "fill-box", transformOrigin: "center" }} />
              <circle r="5.5" fill="#fff" stroke="#3d68ff" strokeWidth="3" />
              <text y="-14" textAnchor="middle" fontSize="13" fontWeight="700" fill="#0b0f1a" style={{ paintOrder: "stroke" }} stroke="rgba(255,255,255,.92)" strokeWidth="3">
                {dest.name}
              </text>
            </g>
            <g ref={planeRef}>
              <circle r="15" fill="rgba(47,91,255,0.12)" />
              <g transform="rotate(90) translate(-12 -12)">
                <path
                  fill="#2f5bff"
                  stroke="#ffffff"
                  strokeWidth="1.1"
                  d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"
                />
              </g>
            </g>
          </svg>
        </div>

        {/* top bar */}
        <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-2 p-3 sm:p-6">
          <div className="pointer-events-auto rounded-[1.4rem] border border-black/5 bg-white/75 p-3 text-ink shadow-[0_18px_40px_-24px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/40">Live flight preview</p>
            <div className="mt-1.5 flex items-center gap-2 text-lg font-bold sm:text-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={flagUrl("bd", 80)} alt="Bangladesh" className="h-4 w-6 rounded-sm object-cover sm:h-5 sm:w-7" />
              <span>DAC</span>
              <span className="text-black/30">→</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={flagUrl(dest.iso, 80)} alt={dest.name} className="h-4 w-6 rounded-sm object-cover sm:h-5 sm:w-7" />
              <span>{dest.airport.match(/\((\w+)\)/)?.[1]}</span>
            </div>
            <p className="mt-1 text-xs text-black/50">
              {km.toLocaleString()} km · ~{hours.toFixed(1)} h flight
            </p>
          </div>
          <div className="pointer-events-auto flex items-center gap-2">
            <select
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              aria-label="Choose destination"
              className="max-w-[9.5rem] rounded-full border border-black/8 bg-white/85 px-3 py-2.5 text-sm font-semibold text-ink shadow-[0_10px_26px_-18px_rgba(15,23,42,0.6)] outline-none backdrop-blur-xl sm:max-w-none sm:px-4"
            >
              {COUNTRIES.map((c) => (
                <option key={c.slug} value={c.slug} className="text-black">
                  {c.name}
                </option>
              ))}
            </select>
            <button
              onClick={toggleSound}
              className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold backdrop-blur-md transition ${
                soundOn ? "bg-ink text-white shadow-[0_12px_28px_-16px_rgba(11,15,26,0.9)]" : "border border-black/8 bg-white/85 text-ink shadow-[0_10px_26px_-18px_rgba(15,23,42,0.6)]"
              }`}
              aria-pressed={soundOn}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 5 6 9H2v6h4l5 4z" />
                {soundOn ? <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" /> : <path d="m22 9-6 6m0-6 6 6" />}
              </svg>
              <span className="hidden sm:inline">{soundOn ? "Sound on" : "Turn sound on"}</span>
            </button>
          </div>
        </div>

        {/* scroll hint */}
        <div ref={hintRef} className="pointer-events-none absolute inset-x-0 top-[42%] text-center text-ink">
          <p className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/85 px-4 py-2 text-sm font-semibold shadow-[0_14px_34px_-22px_rgba(15,23,42,0.6)] backdrop-blur-xl">
            <span className="inline-block animate-bounce">↓</span> Scroll to fly to {dest.name}
          </p>
        </div>

        {/* bottom HUD / arrival */}
        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-6">
          {hud.arrived ? (
            <div key="arr" className="animate-fade-up mx-auto flex max-w-3xl flex-col items-start gap-4 rounded-3xl bg-white p-4 text-ink shadow-2xl sm:flex-row sm:items-center sm:p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={flagUrl(dest.iso, 160)} alt="" className="h-14 w-20 rounded-xl object-cover shadow" />
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-brand">Welcome to {dest.name}</p>
                <p className="text-lg font-bold leading-tight">{dest.visaType}</p>
                <p className="text-sm text-black/60">
                  From {formatBdt(totalFeeBdt(dest))} · ready in {dest.days} {dest.days === 1 ? "day" : "days"} · stay up to {dest.stay} days
                </p>
              </div>
              <div className="flex w-full gap-2 sm:w-auto">
                <Link href={`/visa/${dest.slug}`} className="btn btn-ghost flex-1 !px-4 !py-2.5 text-sm sm:flex-none">
                  Details
                </Link>
                <Link href={`/apply-visa?destination=${dest.slug}`} className="btn btn-brand flex-1 !px-5 !py-2.5 text-sm sm:flex-none">
                  Apply now
                </Link>
              </div>
            </div>
          ) : (
            <div key="hud" className="mx-auto max-w-4xl rounded-[1.6rem] border border-black/5 bg-white/80 p-3 text-ink shadow-[0_26px_60px_-30px_rgba(15,23,42,0.5)] backdrop-blur-xl sm:p-4">
              <div className="flex items-center justify-between text-xs font-semibold sm:text-sm">
                <span className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-mint" />
                  </span>
                  {hud.phase}
                </span>
                <span className="text-black/45">ETA {hud.hoursLeft.toFixed(1)} h</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/8">
                <div ref={barRef} className="h-full origin-left bg-gradient-to-r from-brand to-[#7aa2ff]" style={{ transform: "scaleX(0)" }} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
                <Stat label="Distance flown" value={`${hud.km.toLocaleString()} km`} />
                <Stat label="Altitude" value={`${hud.alt.toLocaleString()} ft`} />
                <Stat label="Ground speed" value={`${hud.speed} km/h`} />
                <div className="hidden text-center sm:block">
                  <p className="text-[10px] uppercase tracking-wider text-black/35">Local time</p>
                  <p className="text-sm font-bold tabular-nums">
                    DAC {fmtTime(ORIGIN.tz).slice(0, 5)} · {dest.airport.match(/\((\w+)\)/)?.[1]} {fmtTime(dest.tz).slice(0, 5)}
                  </p>
                  <p className="text-[10px] text-black/35">
                    {tzOffset(ORIGIN.tz)} / {tzOffset(dest.tz)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-black/35">{label}</p>
      <p className="text-sm font-bold tabular-nums sm:text-base">{value}</p>
    </div>
  );
}
