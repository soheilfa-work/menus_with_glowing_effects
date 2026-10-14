"use client";

import { useLayoutEffect, useRef } from "react";

export const TABS = [
  {
    id: "websites",
    label: "Websites",
    title: "Websites",
    subtitle: "Fast pages that help people find you and get in touch.",
    color: "#E85D18",
  },
  {
    id: "apps",
    label: "Apps",
    title: "Apps",
    subtitle: "Tools people keep on their phone and open every day.",
    color: "#C9B8FF",
  },
  {
    id: "branding",
    label: "Branding",
    title: "Branding",
    subtitle: "A name, a mark, and colors that stay the same everywhere.",
    color: "#F5C542",
  },
  {
    id: "security",
    label: "Security",
    title: "Security",
    subtitle: "Logins, private data, and payments kept locked down.",
    color: "#3DDC97",
  },
  {
    id: "launch",
    label: "Launch",
    title: "Launch",
    subtitle: "Take the idea live, then keep shipping the next version.",
    color: "#FF4D9A",
  },
] as const;

const W = 600;
const BEAD = 31;
const FILLET = 20;
const BAR_H = 68;
const PAD_TOP = 48;
const TOP = PAD_TOP + BEAD;
const BOTTOM = TOP + BAR_H;
const PAD_BOT = 36;
const H = BOTTOM + PAD_BOT;
const CAP = BAR_H / 2;
const STRAIGHT_L = CAP;
const STRAIGHT_R = W - CAP;
const TAB_X = [104, 202, 300, 398, 496];
const BEAD_LIFT = 16;
const BEAD_Y = TOP - BEAD_LIFT;
const ICON_Y = TOP + BAR_H / 2;
const LABEL_Y = ICON_Y;

type Rgb = [number, number, number];

type Side = {
  fx: number;
  qx: number;
  qy: number;
  f: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function hexToRgb(hex: string): Rgb {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToCss(rgb: Rgb) {
  return `rgb(${Math.round(rgb[0])} ${Math.round(rgb[1])} ${Math.round(rgb[2])})`;
}

/** Horizontal reach of a shoulder that stays tangent to the lifted bead. */
function reach(r: number, f: number) {
  const dy = f - BEAD_LIFT;
  return Math.sqrt(Math.max(0, (r + f) ** 2 - dy * dy));
}

function maxFillet(cx: number, dir: -1 | 1) {
  const room = dir < 0 ? cx - STRAIGHT_L : STRAIGHT_R - cx;
  const span = BEAD + BEAD_LIFT;
  if (room <= span) return 8;
  return (room * room / span - BEAD + BEAD_LIFT) / 2;
}

function fillet(cx: number, f: number, dir: -1 | 1): Side {
  const safe = clamp(f, 8, maxFillet(cx, dir));
  const span = reach(BEAD, safe);
  const fx = cx + dir * span;
  const fy = TOP - safe;
  const dist = BEAD + safe;
  const qx = fx + ((cx - fx) * safe) / dist;
  const qy = fy + ((BEAD_Y - fy) * safe) / dist;
  return { fx, qx, qy, f: safe };
}

function arcR(x1: number, y1: number, x2: number, y2: number, r: number) {
  return Math.max(r, Math.hypot(x2 - x1, y2 - y1) / 2 + 0.05);
}

export function skinPaths(cx: number, v: number) {
  const left = fillet(cx, FILLET * (1 + 0.8 * v), -1);
  const right = fillet(cx, FILLET * (1 - 0.5 * v), 1);
  const leftR = arcR(left.fx, TOP, left.qx, left.qy, left.f);
  const rightR = arcR(right.qx, right.qy, right.fx, TOP, right.f);
  const beadR = arcR(left.qx, left.qy, right.qx, right.qy, BEAD);

  const fill = [
    `M ${STRAIGHT_L} ${TOP}`,
    `L ${left.fx} ${TOP}`,
    `A ${leftR} ${leftR} 0 0 0 ${left.qx} ${left.qy}`,
    `A ${beadR} ${beadR} 0 0 1 ${right.qx} ${right.qy}`,
    `A ${rightR} ${rightR} 0 0 0 ${right.fx} ${TOP}`,
    `L ${STRAIGHT_R} ${TOP}`,
    `A ${CAP} ${CAP} 0 0 1 ${STRAIGHT_R} ${BOTTOM}`,
    `L ${STRAIGHT_L} ${BOTTOM}`,
    `A ${CAP} ${CAP} 0 0 1 ${STRAIGHT_L} ${TOP}`,
    "Z",
  ].join(" ");

  const stroke = [
    `M ${left.qx} ${left.qy}`,
    `A ${leftR} ${leftR} 0 0 1 ${left.fx} ${TOP}`,
    `L ${STRAIGHT_L} ${TOP}`,
    `A ${CAP} ${CAP} 0 0 0 ${STRAIGHT_L} ${BOTTOM}`,
    `L ${STRAIGHT_R} ${BOTTOM}`,
    `A ${CAP} ${CAP} 0 0 0 ${STRAIGHT_R} ${TOP}`,
    `L ${right.fx} ${TOP}`,
    `A ${rightR} ${rightR} 0 0 1 ${right.qx} ${right.qy}`,
  ].join(" ");

  return { fill, stroke, left, right };
}

const INITIAL = skinPaths(TAB_X[0], 0);

function Glyph({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {children}
    </svg>
  );
}

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Browser() {
  return (
    <Glyph>
      <rect x="3.2" y="4.2" width="17.6" height="15.4" rx="2.2" {...stroke} />
      <path d="M3.2 8.5h17.6" {...stroke} />
      <path d="M7 12.6h7.4M7 15.6h4.6" {...stroke} />
    </Glyph>
  );
}

function Apps() {
  return (
    <Glyph>
      <rect x="7.1" y="2.4" width="9.8" height="19.2" rx="2.2" {...stroke} />
      <rect x="9.15" y="6" width="2.35" height="2.35" rx="0.45" {...stroke} />
      <rect x="12.5" y="6" width="2.35" height="2.35" rx="0.45" {...stroke} />
      <rect x="9.15" y="9.3" width="2.35" height="2.35" rx="0.45" {...stroke} />
      <rect x="12.5" y="9.3" width="2.35" height="2.35" rx="0.45" {...stroke} />
      <path d="M11 18.7h2" {...stroke} />
    </Glyph>
  );
}

function Mark() {
  return (
    <Glyph>
      <path
        d="M14.6 3.5 20.2 9.1 10.2 19.1H4.6v-5.6z"
        {...stroke}
      />
      <path d="M12.4 5.7 18 11.3" {...stroke} />
      <path d="M4.2 21.2h6.4" {...stroke} />
    </Glyph>
  );
}

function Lock() {
  return (
    <Glyph>
      <rect x="5" y="10.2" width="14" height="9.8" rx="2" {...stroke} />
      <path d="M8.2 10.2V7.7a3.8 3.8 0 0 1 7.6 0v2.5" {...stroke} />
      <circle cx="12" cy="15" r="1.05" fill="currentColor" stroke="none" />
    </Glyph>
  );
}

function Ship() {
  return (
    <Glyph>
      <path
        d="M13.2 14.2 10.2 11.2a18 18 0 0 1 1.7-3.3A10.6 10.6 0 0 1 21 3c0 2.2-.6 6.1-4.8 9a18 18 0 0 1-3 2.2z"
        {...stroke}
      />
      <path d="M10.6 11.4H6.4s.5-2.5 1.7-3.3c1.3-.9 4.1 0 4.1 0" {...stroke} />
      <path d="M13.1 13.9v4.2s2.5-.5 3.3-1.7c.9-1.3 0-4.1 0-4.1" {...stroke} />
      <path
        d="M6.2 15.4c-1.2 1-1.6 4-1.6 4s3-.4 4-1.6c.6-.7.6-1.7-.1-2.3a1.8 1.8 0 0 0-2.3-.1z"
        {...stroke}
      />
    </Glyph>
  );
}

const ICONS = [Browser, Apps, Mark, Lock, Ship];

const pct = (value: number, total: number) => `${(value / total) * 100}%`;

export function DockMenu({
  index,
  onChange,
}: {
  index: number;
  onChange: (index: number) => void;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<SVGPathElement>(null);
  const strokeRef = useRef<SVGPathElement>(null);
  const beadRef = useRef<SVGGElement>(null);
  const motion = useRef({
    x: TAB_X[index],
    rgb: hexToRgb(TABS[index].color),
  });

  useLayoutEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const target = TAB_X[index];
    const targetRgb = hexToRgb(TABS[index].color);
    let raf = 0;
    let last = performance.now();
    let alive = true;

    const paint = () => {
      const m = motion.current;
      const dx = target - m.x;
      const v = clamp(dx / 78, -1, 1);
      const { fill, stroke: outline } = skinPaths(m.x, reduce ? 0 : v);
      fillRef.current?.setAttribute("d", fill);
      strokeRef.current?.setAttribute("d", outline);
      const css = rgbToCss(m.rgb);
      beadRef.current?.setAttribute("transform", `translate(${m.x} ${BEAD_Y})`);
      beadRef.current?.querySelector("circle")?.setAttribute("fill", css);
      frameRef.current?.style.setProperty("--x", pct(m.x, W));
      document.documentElement.style.setProperty("--acc", css);
      const slots = frameRef.current?.querySelectorAll<HTMLElement>("[data-x]");
      slots?.forEach((slot) => {
        const slotX = Number(slot.dataset.x);
        const dist = Math.abs(m.x - slotX);
        if (slot.dataset.slot != null) {
          slot.style.opacity = String(clamp((dist - 18) / 18, 0, 1));
        }
        if (slot.dataset.label != null) {
          slot.style.opacity = String(clamp(1 - dist / 22, 0, 1));
        }
      });
    };

    const frame = (now: number) => {
      if (!alive) return;
      const dt = Math.min(0.034, (now - last) / 1000);
      last = now;
      const m = motion.current;
      if (reduce) {
        m.x = target;
        m.rgb = targetRgb;
      } else {
        const follow = 1 - Math.exp(-dt * 6.4);
        m.x += (target - m.x) * follow;
        const colorFollow = 1 - Math.exp(-dt * 8);
        m.rgb = m.rgb.map(
          (channel, i) => channel + (targetRgb[i] - channel) * colorFollow,
        ) as Rgb;
        if (Math.abs(target - m.x) < 0.08) m.x = target;
      }
      paint();
      const settled =
        m.x === target &&
        Math.abs(m.rgb[0] - targetRgb[0]) < 0.4 &&
        Math.abs(m.rgb[1] - targetRgb[1]) < 0.4 &&
        Math.abs(m.rgb[2] - targetRgb[2]) < 0.4;
      if (!settled) raf = requestAnimationFrame(frame);
    };

    paint();
    raf = requestAnimationFrame(frame);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [index]);

  return (
    <div
      className="dockFrame"
      ref={frameRef}
      style={
        {
          "--icon-y": pct(ICON_Y, H),
          "--bead-y": pct(BEAD_Y, H),
          "--label-y": pct(LABEL_Y, H),
          "--x": pct(TAB_X[0], W),
        } as React.CSSProperties
      }
    >
      <div className="ground" />
      <div className="bloom" />
      <svg className="dockSvg" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        <defs>
          <linearGradient id="skinGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#463c52" />
            <stop offset="14%" stopColor="#241c2e" />
            <stop offset="100%" stopColor="#14101b" />
          </linearGradient>
          <radialGradient id="beadShine" cx="32%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.42" />
            <stop offset="42%" stopColor="#fff" stopOpacity="0.08" />
            <stop offset="70%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path ref={fillRef} d={INITIAL.fill} fill="url(#skinGradient)" />
        <path
          ref={strokeRef}
          d={INITIAL.stroke}
          fill="none"
          stroke="rgba(255,255,255,0.32)"
          strokeWidth="1.25"
          strokeLinejoin="round"
          strokeLinecap="butt"
        />
        <g ref={beadRef} transform={`translate(${TAB_X[0]} ${BEAD_Y})`}>
          <circle r={BEAD} fill={TABS[0].color} />
          <circle r={BEAD} fill="url(#beadShine)" />
        </g>
      </svg>
      <div className="overlay">
        {TABS.map((tab, i) => {
          const Icon = ICONS[i];
          return (
            <button
              key={tab.id}
              type="button"
              className="slot"
              style={{
                left: pct(TAB_X[i] - 49, W),
                width: pct(98, W),
              }}
              aria-pressed={i === index}
              aria-label={tab.label}
              onClick={() => onChange(i)}
              onKeyDown={(event) => {
                if (event.key !== "ArrowRight" && event.key !== "ArrowLeft")
                  return;
                event.preventDefault();
                const dir = event.key === "ArrowRight" ? 1 : -1;
                onChange((index + dir + TABS.length) % TABS.length);
              }}
            >
              <span
                className="slotGlyph"
                data-slot=""
                data-x={TAB_X[i]}
                aria-hidden="true"
                style={{ opacity: i === 0 ? 0 : 1 }}
              >
                <Icon />
              </span>
              <span
                className="slotLabel"
                data-label=""
                data-x={TAB_X[i]}
                aria-hidden="true"
                style={{ opacity: i === 0 ? 1 : 0 }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
        <div className="beadIcon" aria-hidden="true">
          {(() => {
            const Icon = ICONS[index];
            return <Icon />;
          })()}
        </div>
      </div>
    </div>
  );
}
