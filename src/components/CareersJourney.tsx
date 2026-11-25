"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { COUNTRIES } from "@/lib/countries";
import { WORLD_PATHS } from "@/lib/world-paths";
import s from "./careers.module.css";

/* ---------- content ---------- */

/* Seven fixed beats, each holding the screen for ~2.7 viewports of scroll —
   the pacing careers.atlys.com uses, so every line has room to arrive. */
const BEATS = [
  { key: "hero", label: "First light" },
  { key: "mission", label: "Mission" },
  { key: "story", label: "2021" },
  { key: "runway", label: "Numbers" },
  { key: "orbit", label: "Reach" },
  { key: "values", label: "Values" },
  { key: "finale", label: "Open roles" },
] as const;

const SPAN = 1 / BEATS.length;

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

const RUNWAY: [number, string, string][] = [
  [2021, "", "Founded"],
  [45, "+", "Destinations"],
  [24, "×7", "Human support"],
];

const ORBIT: [string, string][] = [
  ["99.2%", "On-time delivery"],
  ["24h", "Median approval"],
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
  const revealEls = useRef<HTMLElement[][]>([]);
  const countEls = useRef<HTMLElement[]>([]);
  const pinEls = useRef<(SVGGElement | null)[]>([]);
  const worldEl = useRef<HTMLDivElement>(null);
  const progressEl = useRef<HTMLDivElement>(null);
  const countEl = useRef<HTMLSpanElement>(null);
  const railEls = useRef<(HTMLDivElement | null)[]>([]);

  const [isStatic, setIsStatic] = useState(false);
  const [liveBeat, setLiveBeat] = useState(0);

  const heroLines = useMemo(
    () => [
      [<em key="j">journey</em>, " "],
      ["to a more open world"],
      ["starts here."],
    ],
    [],
  );

  /* respect reduced motion on first paint */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setIsStatic(true);
  }, []);

  /* collect the reveal targets once the markup exists */
  useEffect(() => {
    revealEls.current = beatEls.current.map((el) =>
      el ? (Array.from(el.querySelectorAll<HTMLElement>("[data-reveal]")) as HTMLElement[]) : [],
    );
    countEls.current = Array.from(
      stage.current?.querySelectorAll<HTMLElement>("[data-count]") ?? [],
    );
  }, [isStatic]);

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
      if (progressEl.current) progressEl.current.style.width = `${(p * 100).toFixed(2)}%`;

      let activeBeat = 0;
      const locals: number[] = [];

      BEATS.forEach((_, i) => {
        const from = i * SPAN;
        const t = (p - from) / SPAN;
        locals[i] = t;
        const el = beatEls.current[i];
        if (t > 0.02 && t < 0.98) activeBeat = i;
        if (i === BEATS.length - 1 && t >= 0.02) activeBeat = i;
        if (!el) return;

        /* every beat is on screen for its whole slice, cross-fading only at the
           joins, so the page never blinks between scenes */
        if (t <= -0.06 || t >= 1.06) {
          el.style.opacity = "0";
          el.style.pointerEvents = "none";
          el.dataset.live = "0";
          return;
        }
        const inT = i === 0 ? 1 : easeOut(clamp((t + 0.06) / 0.16));
        /* the last beat stays put at the end of the page instead of fading away */
        const outT = i === BEATS.length - 1 ? 0 : easeInOut(clamp((t - 0.9) / 0.14));
        const opacity = clamp(inT - outT);
        el.style.opacity = opacity.toFixed(3);
        el.style.transform = `translate3d(0,${((1 - inT) * 60 - outT * 60).toFixed(2)}px,0) scale(${(1 - outT * 0.03).toFixed(4)})`;
        el.style.pointerEvents = t > 0.05 && t < 0.92 ? "auto" : "none";
        el.dataset.live = t > 0.12 && (t < 0.9 || i === BEATS.length - 1) ? "1" : "0";

        /* line-by-line reveals: each [data-reveal] child waits 4.5% behind the
           previous one, so long copy arrives as a wave instead of a block */
        const reveals = revealEls.current[i] ?? [];
        /* the hero plays on arrival, so it is already lit before the first scroll */
        const local = i === 0 ? Math.max(t, intro) : t;
        reveals.forEach((node, j) => {
          const rt = easeOut(clamp((local - 0.1 - j * 0.045) / 0.24));
          node.style.opacity = rt.toFixed(3);
          node.style.transform = `translate3d(0,${((1 - rt) * 30).toFixed(2)}px,0)`;
        });

        /* runway numbers count up while the beat settles */
        if (i === 3) {
          const cp = easeOut(clamp((t - 0.16) / 0.5));
          countEls.current.forEach((node) => {
            const to = Number(node.dataset.count ?? 0);
            const suffix = node.dataset.suffix ?? "";
            const shown = Math.round(to * cp);
            node.textContent = `${shown}${suffix}`;
          });
        }

        /* orbit: map drifts and pins ignite one after another */
        if (i === 4) {
          if (worldEl.current) {
            worldEl.current.style.transform = `scale(${(0.94 + easeOut(t) * 0.08).toFixed(4)}) translateY(${((1 - easeOut(t)) * 18).toFixed(1)}px)`;
          }
          let lit = 0;
          pinEls.current.forEach((pin, j) => {
            if (!pin) return;
            const start = 0.12 + (j / Math.max(1, PINS.length)) * 0.62;
            const pt = easeOut(clamp((t - start) / 0.1));
            if (pt > 0.15) lit += 1;
            pin.style.opacity = pt.toFixed(3);
            pin.style.transform = `translateY(${((1 - pt) * 8).toFixed(2)}px) scale(${(0.7 + pt * 0.3).toFixed(3)})`;
          });
          if (countEl.current) countEl.current.textContent = String(lit);
        }
      });

      if (activeBeat !== lastBeat) {
        lastBeat = activeBeat;
        setLiveBeat(activeBeat);
      }

      if (stage.current) {
        stage.current.style.setProperty("--scroll-y", `${(clamp(locals[0]) * 120).toFixed(1)}px`);
      }

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
    const born = performance.now();
    let intro = 0;

    const tick = () => {
      const now = performance.now();
      const dt = Math.min(0.1, Math.max(0.001, (now - last) / 1000));
      last = now;
      const delta = target - current;
      intro = Math.min(1, (now - born) / 1100);
      if (Math.abs(delta) > 0.0002 || intro < 1) {
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
    kick();

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
    const y = wrapEl.offsetTop + i * SPAN * total + total * 0.02;
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
          <p className={s.kicker} data-reveal>
            Careers · First light
          </p>
          <h1 className={s.h1}>
            {heroLines.map((line, i) => (
              <span
                key={i}
                className={`${s.heroLine} ${i === 2 ? s.heroLineStrong : ""}`}
                data-reveal
              >
                {line}
              </span>
            ))}
          </h1>
          <p className={s.lede} data-reveal>
            Visas on time, for every person on Earth. Scroll to walk the journey, or jump straight to the open roles.
          </p>
          <button
            type="button"
            className={s.skip}
            data-reveal
            style={{ position: "static", marginTop: "1.5rem", alignSelf: "flex-start" }}
            onClick={() => jumpTo(6)}
          >
            View open roles ↓
          </button>
          <div className={s.hint}>
            <span>Scroll</span>
            <i />
          </div>
        </div>

        {/* 02 · mission */}
        <div ref={(el) => { beatEls.current[1] = el; }} className={s.beat}>
          <p className={s.kicker} data-reveal>
            Our mission
          </p>
          <h2 className={s.h2} data-reveal>
            Enable every person on Earth to <span className={s.em}>travel freely</span>.
          </h2>
          <p className={s.lede} data-reveal>
            We’re building an AI-first platform that makes travel simpler and seamless, starting with visas that arrive
            on time.
          </p>
        </div>

        {/* 03 · story */}
        <div ref={(el) => { beatEls.current[2] = el; }} className={s.beat}>
          <p className={s.kicker} data-reveal>
            2021 · Dhaka
          </p>
          <h2 className={s.h2} data-reveal>
            Took off in <span className={s.em}>2021</span>.
          </h2>
          <p className={s.lede} data-reveal>
            Small enough that your work is visible, fast enough that it ships. If you want a blank page and a real
            deadline, this is the place.
          </p>
        </div>

        {/* 04 · runway numbers */}
        <div ref={(el) => { beatEls.current[3] = el; }} className={`${s.beat} ${s.beatWide}`}>
          <div className={s.runwayRow}>
            {RUNWAY.map(([value, suffix, label], i) => (
              <div key={label} className={s.runwayStat} data-reveal>
                <b data-count={value} data-suffix={suffix} style={{ ["--i" as string]: i }}>
                  {value}
                  {suffix}
                </b>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 05 · orbit */}
        <div ref={(el) => { beatEls.current[4] = el; }} className={s.beat}>
          <h2 className={s.h2} data-reveal style={{ textAlign: "center", margin: "0 auto", maxWidth: "24ch" }}>
            Making the world a <span className={s.em}>smaller</span> place.
          </h2>
          <div ref={worldEl} className={s.worldWrap} data-reveal>
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
          <div className={s.orbitRow}>
            {ORBIT.map(([v, k]) => (
              <div key={k} className={s.orbitStat} data-reveal>
                <b>{v}</b>
                <span>{k}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 06 · values */}
        <div ref={(el) => { beatEls.current[5] = el; }} className={`${s.beat} ${s.beatWide}`}>
          <h2 className={s.h2} data-reveal>
            The five things we <span className={s.em}>actually</span> mean.
          </h2>
          <div className={s.values}>
            {VALUES.map(([t, d], i) => (
              <div key={t} className={s.valueRow} data-reveal>
                <span className={s.valueNum}>0{i + 1}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 07 · finale */}
        <div ref={(el) => { beatEls.current[6] = el; }} className={`${s.beat} ${s.beatWide}`}>
          <div className={s.finale}>
            <h2 data-reveal>
              Not <span className={s.em}>for everyone</span>.
            </h2>
            <p data-reveal>
              But probably for you, if you’ve read this far. Fast, unglamorous, and mostly unmapped. If that reads like
              a warning, good. If it reads like an invitation, take the lift.
            </p>
            <div className={s.roleList}>
              {ROLES.map(([title, team, loc]) => (
                <a
                  key={title}
                  href={`mailto:careers@nspacevisa.com?subject=${encodeURIComponent("Application: " + title)}`}
                  className={s.roleRow}
                  data-reveal
                >
                  <b>{title}</b>
                  <em>
                    {team} · {loc}
                  </em>
                  <Arrow />
                </a>
              ))}
            </div>
            <div className={s.depts} data-reveal>
              {DEPTS.map(([name, n]) => (
                <span key={name} className={s.dept}>
                  {name} <b>{n}</b>
                </span>
              ))}
            </div>
            <a
              className={s.lift}
              data-reveal
              href="mailto:careers@nspacevisa.com?subject=Careers%20at%20Nspace"
            >
              careers@nspacevisa.com <Arrow />
            </a>
            <p className={s.meta} data-reveal>
              Visas on time. © 2026 Nspace Visa Agency. <a href="/">Back to the site</a>
            </p>
          </div>
        </div>

        {/* progress rail */}
        <div className={s.rail} aria-hidden>
          {BEATS.map((b, i) => (
            <div
              key={b.key}
              ref={(el) => { railEls.current[i] = el; }}
              className={s.railItem}
              data-active={i === liveBeat}
              onClick={() => jumpTo(i)}
            >
              <i />
              <span>{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
