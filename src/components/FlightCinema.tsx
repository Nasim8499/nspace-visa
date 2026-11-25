"use client";

import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ORIGIN,
  flagUrl,
  flightHours,
  formatBdt,
  getCountry,
  haversineKm,
  modeLabel,
  totalFeeBdt,
} from "@/lib/countries";
import { FlightSound } from "@/lib/flightSound";
import s from "./flightcinema.module.css";

const Veil = () => (
  <div className={s.loader}>
    <span />
  </div>
);

const AirportScene = dynamic(() => import("./flight/AirportScene"), { ssr: false, loading: Veil });
const GlobeScene = dynamic(() => import("./flight/GlobeScene"), { ssr: false, loading: Veil });

const TAKEOFF = 5600;
const FLIGHT = 7200;
const LANDING = 5000;
const TOTAL = TAKEOFF + FLIGHT + LANDING;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export function FlightCinema({ slug, onClose }: { slug: string | null; onClose: () => void }) {
  const dest = slug ? getCountry(slug) : undefined;
  const [mounted, setMounted] = useState(false);
  const [act, setAct] = useState(0);
  const [stats, setStats] = useState({ pct: 0, alt: 0, speed: 0, km: 0 });
  const [arrived, setArrived] = useState(false);
  const [muted, setMuted] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const bar = useRef<HTMLDivElement>(null);
  const sound = useRef<FlightSound | null>(null);
  const live = useRef(false);
  const started = useRef(0);
  const actRef = useRef(0);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    actRef.current = act;
  }, [act]);

  /* body lock + escape */
  useEffect(() => {
    if (!slug) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [slug, onClose]);

  /* sound */
  useEffect(() => {
    if (!slug || !dest) return;
    const snd = new FlightSound();
    sound.current = snd;
    let dead = false;
    snd.start()
      .then(() => {
        if (dead) return;
        live.current = true;
        snd.say(`Nspace Air. Dhaka to ${dest.name}.`);
      })
      .catch(() => !dead && setBlocked(true));
    return () => {
      dead = true;
      live.current = false;
      snd.stop();
      sound.current = null;
    };
  }, [slug, dest]);

  /* timeline + progress + stats */
  useEffect(() => {
    if (!slug || !dest) return;
    started.current = performance.now();
    let raf = 0;
    const km = haversineKm(ORIGIN, dest);

    const loop = () => {
      const el = performance.now() - started.current;
      const p = clamp(el / TOTAL);
      if (bar.current) bar.current.style.transform = `scaleX(${p.toFixed(4)})`;
      if (p < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const id = setInterval(() => {
      const el = performance.now() - started.current;
      const p = clamp(el / TOTAL);
      const alt =
        p < 0.16
          ? (p / 0.16) * 3200
          : p < 0.76
            ? 3200 + ((p - 0.16) / 0.6) * 31800
            : Math.max(0, 35000 * (1 - (p - 0.76) / 0.24));
      const speed =
        p < 0.16
          ? (p / 0.16) * 300
          : p < 0.76
            ? 300 + ((p - 0.16) / 0.6) * 580
            : Math.max(14, 880 - ((p - 0.76) / 0.24) * 866);
      const next = {
        pct: Math.round(p * 100),
        alt: Math.round(alt / 10) * 10,
        speed: Math.round(speed / 5) * 5,
        km: Math.round(km * (1 - clamp((p - 0.08) / 0.78))),
      };
      /* only re-render the shell when a number actually changes */
      setStats((prev) =>
        prev.pct === next.pct && prev.alt === next.alt && prev.speed === next.speed && prev.km === next.km ? prev : next,
      );
      if (live.current && sound.current) {
        const a = actRef.current;
        sound.current.update(a === 0 ? 0.95 : a === 1 ? 0.4 : a === 2 ? 0.72 : 0.15);
      }
    }, 220);

    const t1 = setTimeout(() => setAct(1), TAKEOFF);
    const t2 = setTimeout(() => setAct(2), TAKEOFF + FLIGHT);
    const t3 = setTimeout(() => {
      setAct(3);
      setArrived(true);
      if (live.current && sound.current) {
        sound.current.chime();
        sound.current.say(`Welcome to ${dest.name}.`);
      }
    }, TOTAL);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(id);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [slug, dest]);

  const skip = useCallback(() => {
    started.current = performance.now() - TOTAL;
    setAct(3);
    setArrived(true);
    if (live.current && sound.current) sound.current.chime();
  }, []);

  if (!slug || !dest || !mounted) return null;

  const km = Math.round(haversineKm(ORIGIN, dest));
  const phase = ["Taking off", "In the air", "Landing", "Arrived"][act];

  return createPortal(
    <div className={s.overlay} role="dialog" aria-modal="true" aria-label={`Flight to ${dest.name}`}>
      <div className={s.glow} />

      <div className={s.flash} key={`flash-${act}`} aria-hidden />
      <div className={s.stage} key={act === 3 ? 2 : act}>
        {act === 0 && <AirportScene mode="takeoff" duration={TAKEOFF} />}
        {act === 1 && (
          <GlobeScene from={[ORIGIN.lng, ORIGIN.lat]} to={[dest.lng, dest.lat]} duration={FLIGHT} />
        )}
        {(act === 2 || act === 3) && <AirportScene mode="landing" duration={LANDING} />}
      </div>

      <div className={s.topbar}>
        <div className={`${s.glass} ${s.pill}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={flagUrl(ORIGIN.iso, 80)} alt="" />
          DAC <i>✈</i> {dest.airport.match(/\(([A-Z]{3})\)/)?.[1] ?? "—"}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={flagUrl(dest.iso, 80)} alt="" />
        </div>
        <div className={s.actions}>
          {!arrived && (
            <button type="button" className={s.iconBtn} aria-label="Skip" onClick={skip}>
              ⏭
            </button>
          )}
          <button
            type="button"
            className={s.iconBtn}
            aria-label={muted ? "Unmute" : "Mute"}
            onClick={() => {
              const next = !muted;
              setMuted(next);
              sound.current?.setMuted(next);
            }}
          >
            {muted ? "🔇" : "🔊"}
          </button>
          <button type="button" className={s.iconBtn} aria-label="Close" onClick={onClose}>
            ✕
          </button>
        </div>
      </div>

      {blocked && (
        <button
          type="button"
          className={s.soundHint}
          onClick={() => {
            setBlocked(false);
            sound.current?.start().then(() => (live.current = true)).catch(() => setBlocked(true));
          }}
        >
          🔈 Sound on
        </button>
      )}

      <div className={s.bottom}>
        <div className={`${s.glass} ${s.panel}`}>
          <div className={s.head}>
            <div className={s.city}>
              <b>{dest.name}</b>
              <span>{phase}</span>
            </div>
            <div className={s.pct}>{stats.pct}%</div>
          </div>

          <div className={s.bar}>
            <div ref={bar} className={s.barFill} />
          </div>

          <div className={s.stats}>
            <div className={s.stat}>
              <span>Altitude</span>
              <b>
                {stats.alt.toLocaleString("en-US")}
                <small>ft</small>
              </b>
            </div>
            <div className={s.stat}>
              <span>Speed</span>
              <b>
                {stats.speed}
                <small>km/h</small>
              </b>
            </div>
            <div className={s.stat}>
              <span>Remaining</span>
              <b>
                {stats.km.toLocaleString("en-US")}
                <small>km</small>
              </b>
            </div>
          </div>

          {arrived && (
            <motion.div
              className={s.arrival}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 210, damping: 22, mass: 0.8 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={s.flag} src={flagUrl(dest.iso, 160)} alt="" />
              <div className={s.meta}>
                <b>{dest.visaType}</b>
                <span>
                  {formatBdt(totalFeeBdt(dest))} · {modeLabel(dest.mode)} · {dest.days}d
                </span>
              </div>
              <a className={s.cta} href={`/visa/${dest.slug}`}>
                Continue →
              </a>
            </motion.div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
