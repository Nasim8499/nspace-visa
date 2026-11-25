"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { COUNTRIES } from "@/lib/countries";
import { WORLD_PATHS } from "@/lib/world-paths";
import s from "./careers.module.css";

/* ---------- content ---------- */

const BEATS = [
  { key: "hero", label: "First light", from: 0, to: 0.15 },
  { key: "mission", label: "Mission", from: 0.15, to: 0.32 },
  { key: "world", label: "Reach", from: 0.32, to: 0.58 },
  { key: "values", label: "Values", from: 0.58, to: 0.76 },
  { key: "roles", label: "Roles", from: 0.76, to: 0.93 },
  { key: "finale", label: "Take the lift", from: 0.93, to: 1.0001 },
] as const;

const VALUES: [string, string][] = [
  ["Treat The Customer Like Your Date", "Care enough to impress them. Don’t hide behind process."],
  ["Ship It", "Own the whole thing. Finish what you start."],
  ["Move at the Speed of Light", "Make the call. Learn from it. Keep moving."],
  ["Conquer, Not Compete", "Don’t play for incremental wins. Build to lead."],
  ["No Asterisk", "Say what you mean. Do what you said."],
];

const ROLES: [string, string, string][] = [
  ["Senior Full-stack Engineer", "Engineering", "Dhaka · Hybrid"],
  ["Visa Operations Specialist", "Operations", "Dhaka · On-site"],
  ["Customer Experience Lead", "Support", "Dhaka · Hybrid"],
  ["Product Designer", "Design", "Remote · Bangladesh"],
  ["Growth Marketing Manager", "Marketing", "Dhaka · Hybrid"],
];

const DEPTS: [string, number][] = [
  ["Data", 1],
  ["Engineering", 4],
  ["Fulfilment", 6],
  ["Growth", 7],
  ["Guest Advisory", 4],
  ["Guest Delight", 3],
  ["Marketing", 7],
  ["Partnership", 1],
  ["Product", 2],
];

const STATS: [string, string][] = [
  ["2021", "Founded"],
  ["45+", "Destinations"],
  ["24×7", "Human support"],
  ["On time", "Or fee refunded"],
];

/* world map: equirectangular, same projection the app already uses */
const W = 1000;
const H = 500;
const proj = (lng: number, lat: number): [number, number] => [
  ((lng + 180) / 360) * W,
  ((90 - lat) / 180) * H,
];

const PINS = COUNTRIES.filter((c) => c.popular).slice(0, 14);

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
const easeInOut = (t: number) => {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

const Arrow = () => (
  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M2.5 9.5 9.5 2.5M4 2.5h5.5V8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function CareersJourney() {
  const wrap = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const beatEls = useRef<(HTMLDivElement | null)[]>([]);
  const valueEls = useRef<(HTMLDivElement | null)[]>([]);
  const roleEls = useRef<(HTMLAnchorElement | null)[]>([]);
  const pinEls = useRef<(SVGGElement | null)[]>([]);
  const finaleEl = useRef<HTMLDivElement>(null);
  const worldEl = useRef<HTMLDivElement>(null);
  const progressEl = useRef<HTMLDivElement>(null);
  const countEl = useRef<HTMLSpanElement>(null);
  const statEls = useRef<(HTMLElement | null)[]>([]);
  const railEls = useRef<(HTMLDivElement | null)[]>([]);

  const [isStatic, setIsStatic] = useState(false);
  const [liveBeat, setLiveBeat] = useState(0);

  const words = useMemo(
    () => ["Your", "journey", "to", "a", "more", "open", "world", "starts", "here."],
    [],
  );

  /* respect reduced motion on first paint */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setIsStatic(true);
  }, []);

  /* the scroll engine */
  useEffect(() => {
    if (isStatic) return;
    const wrapEl = wrap.current;
    if (!wrapEl) return;

    let raf = 0;
    let target = 0;
    let current = -1;
    let lastBeat = -1;

    const read = () => {
      const total = wrapEl.offsetHeight - window.innerHeight;
      const passed = -wrapEl.getBoundingClientRect().top;
      target = total > 0 ? clamp(passed / total) : 0;
    };

    const apply = (p: number) => {
      /* progress bar */
      if (progressEl.current) progressEl.current.style.width = `${(p * 100).toFixed(2)}%`;

      let activeBeat = 0;
      const locals: number[] = [];

      BEATS.forEach((b, i) => {
        const t = (p - b.from) / (b.to - b.from);
        locals[i] = t;
        const el = beatEls.current[i];
        if (t > 0.04 && t < 0.96) activeBeat = i;
        if (!el) return;
        if (t <= -0.02 || t >= 1.02) {
          el.style.opacity = "0";
          el.style.pointerEvents = "none";
          el.dataset.live = "0";
          return;
        }
        const inT = i === 0 ? 1 : easeOut(clamp(t / 0.16));
        const outT = easeInOut(clamp((t - 0.84) / 0.16));
        const opacity = clamp(inT - outT);
        const y = (1 - inT) * 44 - outT * 46;
        const scale = 1 - outT * 0.045;
        el.style.opacity = opacity.toFixed(3);
        el.style.transform = `translate3d(0,${y.toFixed(2)}px,0) scale(${scale.toFixed(4)})`;
        el.style.pointerEvents = t > 0.08 && t < 0.9 ? "auto" : "none";
        el.dataset.live = t > 0.14 && t < 0.86 ? "1" : "0";
      });

      if (activeBeat !== lastBeat) {
        lastBeat = activeBeat;
        setLiveBeat(activeBeat);
      }

      /* hero parallax: drift the glow with scroll */
      if (stage.current) {
        const heroT = clamp(locals[0]);
        stage.current.style.setProperty("--scroll-y", `${(heroT * 120).toFixed(1)}px`);
      }

      /* mission stats: count up while the beat is live */
      const missionT = clamp(locals[1]);
      const statProgress = easeOut(clamp((missionT - 0.18) / 0.45));
      statEls.current.forEach((el, i) => {
        if (!el) return;
        el.style.opacity = clamp(statProgress * 1.4 - i * 0.12).toFixed(3);
        el.style.transform = `translateY(${((1 - statProgress) * 18).toFixed(1)}px)`;
      });

      /* world: map drift + pins igniting one by one */
      const worldT = clamp(locals[2]);
      if (worldEl.current) {
        worldEl.current.style.transform = `scale(${(0.96 + easeOut(worldT) * 0.06).toFixed(4)}) translateY(${((1 - easeOut(worldT)) * 16).toFixed(1)}px)`;
      }
      let lit = 0;
      pinEls.current.forEach((el, i) => {
        if (!el) return;
        const start = 0.14 + (i / Math.max(1, PINS.length)) * 0.62;
        const t = easeOut(clamp((worldT - start) / 0.1));
        if (t > 0.15) lit += 1;
        el.style.opacity = t.toFixed(3);
        el.style.transform = `translateY(${((1 - t) * 8).toFixed(2)}px) scale(${(0.7 + t * 0.3).toFixed(3)})`;
      });
      if (countEl.current) countEl.current.textContent = String(lit);

      /* values: staggered deck */
      const valuesT = clamp(locals[3]);
      valueEls.current.forEach((el, i) => {
        if (!el) return;
        const t = easeOut(clamp((valuesT - 0.1 - i * 0.075) / 0.16));
        el.style.opacity = t.toFixed(3);
        el.style.transform = `translateY(${((1 - t) * 24).toFixed(2)}px)`;
      });

      /* roles: rows rising */
      const rolesT = clamp(locals[4]);
      roleEls.current.forEach((el, i) => {
        if (!el) return;
        const t = easeOut(clamp((rolesT - 0.12 - i * 0.06) / 0.18));
        el.style.opacity = t.toFixed(3);
        el.style.transform = `translateY(${((1 - t) * 20).toFixed(2)}px)`;
      });

      /* finale panel */
      if (finaleEl.current) {
        const t = easeOut(clamp((clamp(locals[5]) - 0.08) / 0.4));
        finaleEl.current.style.opacity = t.toFixed(3);
        finaleEl.current.style.transform = `translateY(${((1 - t) * 34).toFixed(2)}px) scale(${(0.98 + t * 0.02).toFixed(4)})`;
      }

      /* rail */
      railEls.current.forEach((el, i) => {
        if (!el) return;
        el.dataset.active = String(i === activeBeat);
      });
    };

    /* the engine parks itself the moment it catches up with the scroll, so an
       idle page costs nothing; damping is exponential so 60/90/120 Hz all feel
       identical instead of the animation running faster on a ProMotion phone */
    let running = false;
    let last = performance.now();

    const tick = () => {
      const now = performance.now();
      const dt = Math.min(0.1, Math.max(0.001, (now - last) / 1000));
      last = now;
      const delta = target - current;
      if (Math.abs(delta) > 0.0002) {
        current = current < 0 ? target : current + delta * (1 - Math.exp(-8.5 * dt));
        apply(clamp(current));
        raf = requestAnimationFrame(tick);
      } else {
        current = target;
        apply(clamp(current));
        running = false;
        raf = 0;
      }
    };

    const kick = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      read();
      kick();
    };

    read();
    current = target;
    apply(current);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isStatic]);

  /* mouse parallax on the hero glow */
  useEffect(() => {
    if (isStatic) return;
    const el = stage.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      el.style.setProperty("--mx", x.toFixed(3));
      el.style.setProperty("--my", y.toFixed(3));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [isStatic]);

  const jumpTo = (i: number) => {
    const wrapEl = wrap.current;
    if (!wrapEl) return;
    const total = wrapEl.offsetHeight - window.innerHeight;
    const y = wrapEl.offsetTop + BEATS[i].from * total + total * 0.04;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <div ref={wrap} className={`${s.journey} ${isStatic ? s.static : ""}`}>
      <div ref={stage} className={s.stage}>
        <div className={s.glow} />
        <div className={s.glowRing} />
        <div ref={progressEl} className={s.progress} />
        <div className={s.barTop} />
        <div className={s.barBottom} />

        {/* 01 · hero */}
        <div ref={(el) => { beatEls.current[0] = el; }} className={s.beat}>
          <p className={s.kicker}>Careers · First light</p>
          <h1 className={s.h1}>
            {words.map((w, i) => (
              <span key={w + i}>
                <span className={s.word} style={{ ["--i" as string]: i }}>
                  {w === "open" || w === "here." ? <span className={s.accent}>{w}</span> : w}
                </span>
                {i < words.length - 1 ? " " : null}
              </span>
            ))}
          </h1>
          <p className={s.lede}>
            Visas on time, for every person on Earth. Scroll to walk the journey, or jump straight to the open roles.
          </p>
          <button type="button" className={s.skip} style={{ position: "static", marginTop: "1.5rem", alignSelf: "flex-start" }} onClick={() => jumpTo(4)}>
            View open roles ↓
          </button>
          <div className={s.hint}>
            <span>Scroll</span>
            <i />
          </div>
        </div>

        {/* 02 · mission */}
        <div ref={(el) => { beatEls.current[1] = el; }} className={s.beat}>
          <p className={s.kicker}>Our mission</p>
          <h2 className={s.h2}>
            Enable every person on Earth to <span className={s.em}>travel freely</span>.
          </h2>
          <p className={s.lede}>
            We’re building an AI-first platform that makes travel simpler and seamless, starting with visas that arrive on
            time. Took off in 2021, still small enough that your work is visible.
          </p>
          <div className={s.stats}>
            {STATS.map(([v, k], i) => (
              <div
                key={k}
                className={s.stat}
                ref={(el) => { statEls.current[i] = el; }}
                style={{ opacity: 0 }}
              >
                <b>{v}</b>
                <span>{k}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 03 · world */}
        <div ref={(el) => { beatEls.current[2] = el; }} className={s.beat}>
          <h2 className={s.h2} style={{ textAlign: "center", margin: "0 auto", maxWidth: "24ch" }}>
            Making the world a <span className={s.em}>smaller</span> place.
          </h2>
          <div ref={worldEl} className={s.worldWrap}>
            <svg className={s.worldSvg} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="World map with destinations">
              {WORLD_PATHS.map(([name, d]) => (
                <path key={name} d={d} className={s.land} />
              ))}
              {PINS.map((c, i) => {
                const [x, y] = proj(c.lng, c.lat);
                return (
                  <g
                    key={c.slug}
                    className={`${s.pin} ${s.pinGroup}`}
                    ref={(el) => { pinEls.current[i] = el; }}
                    style={{ transformOrigin: `${x}px ${y}px` }}
                  >
                    <circle className={s.pinRing} cx={x} cy={y} r={11} />
                    <circle className={s.pinDot} cx={x} cy={y} r={3.2} />
                    <circle className={s.pinHit} cx={x} cy={y} r={16} />
                    <text className={s.pinLabel} x={x + 8} y={y - 8}>
                      {c.name}
                    </text>
                  </g>
                );
              })}
            </svg>
            <p className={s.worldCount}>
              <span ref={countEl}>0</span> of {PINS.length} destinations · 45+ served
            </p>
          </div>
        </div>

        {/* 04 · values */}
        <div ref={(el) => { beatEls.current[3] = el; }} className={s.beat}>
          <h2 className={s.h2}>
            The five things we <span className={s.em}>actually</span> mean.
          </h2>
          <div className={s.values}>
            {VALUES.map(([t, d], i) => (
              <div key={t} className={s.valueRow} ref={(el) => { valueEls.current[i] = el; }}>
                <span className={s.valueNum}>0{i + 1}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 05 · roles */}
        <div ref={(el) => { beatEls.current[4] = el; }} className={s.beat}>
          <h2 className={s.h2}>
            Not <span className={s.em}>for everyone</span>.
          </h2>
          <p className={s.lede}>
            But probably for you, if you’ve read this far. Fast, unglamorous, and mostly unmapped. If that reads like a
            warning, good. If it reads like an invitation, take the lift.
          </p>
          <div className={s.roleList}>
            {ROLES.map(([title, team, loc], i) => (
              <a
                key={title}
                href={`mailto:careers@nspacevisa.com?subject=${encodeURIComponent("Application: " + title)}`}
                className={s.roleRow}
                ref={(el) => { roleEls.current[i] = el; }}
              >
                <b>{title}</b>
                <em>
                  {team} · {loc}
                </em>
                <Arrow />
              </a>
            ))}
            <div className={s.depts}>
              {DEPTS.map(([name, n]) => (
                <span key={name} className={s.dept}>
                  {name} <b>{n}</b>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 06 · finale */}
        <div ref={(el) => { beatEls.current[5] = el; }} className={s.beat}>
          <div ref={finaleEl} className={s.finale}>
            <h2>
              Take the <span className={s.em}>lift</span>.
            </h2>
            <p>
              Send one email: what you’ve shipped, what you want to own next. A human reads every application, usually
              within two days.
            </p>
            <a className={s.lift} href="mailto:careers@nspacevisa.com?subject=Careers%20at%20Nspace">
              careers@nspacevisa.com <Arrow />
            </a>
            <p className={s.meta}>
              Visas on time. © 2026 Nspace Visa Agency. <a href="/">Back to the site</a>
            </p>
          </div>
        </div>

        {/* rail */}
        <div className={s.rail} aria-hidden>
          {BEATS.map((b, i) => (
            <div
              key={b.key}
              className={s.railItem}
              ref={(el) => { railEls.current[i] = el; }}
              data-active={i === liveBeat}
            >
              <span>{b.label}</span>
              <i />
            </div>
          ))}
        </div>

        {!isStatic && (
          <button type="button" className={s.skip} onClick={() => setIsStatic(true)}>
            Read as a page
          </button>
        )}
      </div>
    </div>
  );
}
