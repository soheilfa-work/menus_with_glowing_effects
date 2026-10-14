"use client";

import {
  useLayoutEffect,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { TABS } from "./dock-menu";

type Rgb = [number, number, number];

export type MenuProps = {
  index: number;
  onChange: (index: number) => void;
};

export const MENU_KINDS = [
  { id: "rings", name: "Rings" },
  { id: "signal", name: "Signal" },
  { id: "dock", name: "Dock" },
  { id: "index", name: "Index" },
  { id: "swell", name: "Swell" },
] as const;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function hexToRgb(hex: string): Rgb {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbCss(rgb: Rgb) {
  return `rgb(${Math.round(rgb[0])} ${Math.round(rgb[1])} ${Math.round(rgb[2])})`;
}

function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

function reduced() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function Glyph({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {children}
    </svg>
  );
}

const pen = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Browser() {
  return (
    <Glyph>
      <rect x="3.2" y="4.2" width="17.6" height="15.4" rx="2.2" {...pen} />
      <path d="M3.2 8.5h17.6" {...pen} />
      <path d="M7 12.6h7.4M7 15.6h4.6" {...pen} />
    </Glyph>
  );
}
function Apps() {
  return (
    <Glyph>
      <rect x="7.1" y="2.4" width="9.8" height="19.2" rx="2.2" {...pen} />
      <rect x="9.15" y="6" width="2.35" height="2.35" rx="0.45" {...pen} />
      <rect x="12.5" y="6" width="2.35" height="2.35" rx="0.45" {...pen} />
      <rect x="9.15" y="9.3" width="2.35" height="2.35" rx="0.45" {...pen} />
      <rect x="12.5" y="9.3" width="2.35" height="2.35" rx="0.45" {...pen} />
      <path d="M11 18.7h2" {...pen} />
    </Glyph>
  );
}
function Mark() {
  return (
    <Glyph>
      <path d="M14.6 3.5 20.2 9.1 10.2 19.1H4.6v-5.6z" {...pen} />
      <path d="M12.4 5.7 18 11.3" {...pen} />
      <path d="M4.2 21.2h6.4" {...pen} />
    </Glyph>
  );
}
function Lock() {
  return (
    <Glyph>
      <rect x="5" y="10.2" width="14" height="9.8" rx="2" {...pen} />
      <path d="M8.2 10.2V7.7a3.8 3.8 0 0 1 7.6 0v2.5" {...pen} />
      <circle cx="12" cy="15" r="1.05" fill="currentColor" stroke="none" />
    </Glyph>
  );
}
function Ship() {
  return (
    <Glyph>
      <path
        d="M13.2 14.2 10.2 11.2a18 18 0 0 1 1.7-3.3A10.6 10.6 0 0 1 21 3c0 2.2-.6 6.1-4.8 9a18 18 0 0 1-3 2.2z"
        {...pen}
      />
      <path d="M10.6 11.4H6.4s.5-2.5 1.7-3.3c1.3-.9 4.1 0 4.1 0" {...pen} />
      <path d="M13.1 13.9v4.2s2.5-.5 3.3-1.7c.9-1.3 0-4.1 0-4.1" {...pen} />
      <path
        d="M6.2 15.4c-1.2 1-1.6 4-1.6 4s3-.4 4-1.6c.6-.7.6-1.7-.1-2.3a1.8 1.8 0 0 0-2.3-.1z"
        {...pen}
      />
    </Glyph>
  );
}

export const ICONS = [Browser, Apps, Mark, Lock, Ship];

function nudge(
  event: KeyboardEvent,
  index: number,
  setIndex: (next: number) => void,
) {
  const dir =
    event.key === "ArrowRight" || event.key === "ArrowDown"
      ? 1
      : event.key === "ArrowLeft" || event.key === "ArrowUp"
        ? -1
        : 0;
  if (!dir) return;
  event.preventDefault();
  setIndex((index + dir + TABS.length) % TABS.length);
}

function paintAccent(css: string) {
  document.documentElement.style.setProperty("--acc", css);
}

export function useIconMotion(
  index: number,
  paint: (at: number, css: string, lean: number) => void,
) {
  const at = useRef(index);
  const rgb = useRef<Rgb>(hexToRgb(TABS[index].color));
  const primed = useRef(false);
  const paintRef = useRef(paint);
  paintRef.current = paint;

  useLayoutEffect(() => {
    const reduce = reduced();
    let raf = 0;
    let last = performance.now();
    let alive = true;

    const tick = (now: number) => {
      if (!alive) return false;
      const dt = Math.min(0.034, (now - last) / 1000);
      last = now;
      const goal = index;
      const goalRgb = hexToRgb(TABS[goal].color);
      if (!primed.current || reduce) {
        at.current = goal;
        rgb.current = goalRgb;
        primed.current = true;
      } else {
        at.current += (goal - at.current) * (1 - Math.exp(-dt * 7));
        rgb.current = mix(rgb.current, goalRgb, 1 - Math.exp(-dt * 8));
        if (Math.abs(goal - at.current) < 0.004) at.current = goal;
      }
      const lean = clamp((goal - at.current) / 0.8, -1, 1);
      paintRef.current(
        at.current,
        rgbCss(rgb.current),
        primed.current && !reduce ? lean : 0,
      );
      const settled =
        at.current === goal &&
        Math.abs(rgb.current[0] - goalRgb[0]) < 0.4 &&
        Math.abs(rgb.current[1] - goalRgb[1]) < 0.4 &&
        Math.abs(rgb.current[2] - goalRgb[2]) < 0.4;
      if (!settled) raf = requestAnimationFrame(tick);
      return !settled;
    };

    const moving = tick(last);
    if (moving) raf = requestAnimationFrame(tick);
    const onResize = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("resize", onResize);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [index]);
}

export function IndexMenu({ index, onChange }: MenuProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLSpanElement>(null);
  const hits = useRef<(HTMLButtonElement | null)[]>([]);
  const rgb = useRef<Rgb>(hexToRgb(TABS[index].color));
  const box = useRef({ left: 0, width: 40 });
  const primed = useRef(false);

  useLayoutEffect(() => {
    const reduce = reduced();
    let raf = 0;
    let last = performance.now();
    let alive = true;

    const tick = (now: number) => {
      if (!alive) return;
      const dt = Math.min(0.034, (now - last) / 1000);
      last = now;
      const goalRgb = hexToRgb(TABS[index].color);
      if (reduce) rgb.current = goalRgb;
      else rgb.current = mix(rgb.current, goalRgb, 1 - Math.exp(-dt * 8));
      paintAccent(rgbCss(rgb.current));
      const hit = hits.current[index];
      let settled = true;
      if (hit && markRef.current) {
        const left = hit.offsetLeft;
        const width = hit.offsetWidth;
        if (!primed.current || reduce) {
          box.current.left = left;
          box.current.width = width;
          primed.current = true;
        } else {
          const follow = 1 - Math.exp(-dt * 8);
          box.current.left += (left - box.current.left) * follow;
          box.current.width += (width - box.current.width) * follow;
          if (Math.abs(left - box.current.left) < 0.4) box.current.left = left;
          if (Math.abs(width - box.current.width) < 0.4)
            box.current.width = width;
        }
        if (box.current.left !== left || box.current.width !== width)
          settled = false;
        markRef.current.style.transform = `translateX(${box.current.left}px)`;
        markRef.current.style.width = `${box.current.width}px`;
      }
      const colorSettled =
        Math.abs(rgb.current[0] - goalRgb[0]) < 0.4 &&
        Math.abs(rgb.current[1] - goalRgb[1]) < 0.4 &&
        Math.abs(rgb.current[2] - goalRgb[2]) < 0.4;
      if (!settled || !colorSettled) raf = requestAnimationFrame(tick);
    };

    tick(last);
    raf = requestAnimationFrame(tick);
    const onResize = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("resize", onResize);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [index]);

  return (
    <div className="indexRow" ref={rowRef} role="tablist" aria-label="Index">
      <span className="indexMark" ref={markRef} />
      {TABS.map((tab, i) => {
        const Icon = ICONS[i];
        return (
          <button
            key={tab.id}
            ref={(node) => {
              hits.current[i] = node;
            }}
            type="button"
            className="indexHit"
            role="tab"
            aria-selected={i === index}
            onClick={() => onChange(i)}
            onKeyDown={(event) => nudge(event, index, onChange)}
          >
            <span className="indexIcon">
              <Icon />
            </span>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export function SignalMenu({ index, onChange }: MenuProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const hits = useRef<(HTMLButtonElement | null)[]>([]);
  const rgb = useRef<Rgb>(hexToRgb(TABS[index].color));
  const width = useRef(80);
  const primed = useRef(false);

  useLayoutEffect(() => {
    const reduce = reduced();
    let raf = 0;
    let last = performance.now();
    let alive = true;

    const tick = (now: number) => {
      if (!alive) return;
      const dt = Math.min(0.034, (now - last) / 1000);
      last = now;
      const goalRgb = hexToRgb(TABS[index].color);
      if (reduce) rgb.current = goalRgb;
      else rgb.current = mix(rgb.current, goalRgb, 1 - Math.exp(-dt * 8));
      paintAccent(rgbCss(rgb.current));
      const track = trackRef.current;
      const hit = hits.current[index];
      let settled = true;
      if (track && hit && fillRef.current) {
        const center = hit.offsetLeft + hit.offsetWidth / 2;
        const cap = center + track.clientHeight / 2;
        const goal =
          index === TABS.length - 1
            ? track.clientWidth
            : Math.min(track.clientWidth, cap);
        if (!primed.current || reduce) {
          width.current = goal;
          primed.current = true;
        } else {
          const follow = 1 - Math.exp(-dt * 6.5);
          width.current += (goal - width.current) * follow;
          if (Math.abs(goal - width.current) < 0.4) width.current = goal;
        }
        if (width.current !== goal) settled = false;
        fillRef.current.style.width = `${width.current}px`;
        hits.current.forEach((node) => {
          if (!node) return;
          const icon = node.querySelector<HTMLElement>(".signalIcon");
          if (!icon) return;
          const iconX = node.offsetLeft + node.offsetWidth / 2;
          icon.style.color =
            iconX < width.current - 6 ? "#1a0d14" : "rgba(255,255,255,0.8)";
        });
      }
      const colorSettled =
        Math.abs(rgb.current[0] - goalRgb[0]) < 0.4 &&
        Math.abs(rgb.current[1] - goalRgb[1]) < 0.4 &&
        Math.abs(rgb.current[2] - goalRgb[2]) < 0.4;
      if (!settled || !colorSettled) raf = requestAnimationFrame(tick);
    };

    tick(last);
    raf = requestAnimationFrame(tick);
    const onResize = () => {
      cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("resize", onResize);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [index]);

  return (
    <div className="signal">
      <div
        className="signalTrack"
        ref={trackRef}
        role="tablist"
        aria-label="Signal"
      >
        <div className="signalFill" ref={fillRef} />
        {TABS.map((tab, i) => {
          const Icon = ICONS[i];
          return (
            <button
              key={tab.id}
              ref={(node) => {
                hits.current[i] = node;
              }}
              type="button"
              className="signalHit"
              style={{ left: `${((i + 0.5) / TABS.length) * 100}%` }}
              role="tab"
              aria-selected={i === index}
              aria-label={tab.label}
              onClick={() => onChange(i)}
              onKeyDown={(event) => nudge(event, index, onChange)}
            >
              <span className="signalIcon">
                <Icon />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function MenuSwitch({
  kind,
  onChange,
}: {
  kind: number;
  onChange: (kind: number) => void;
}) {
  const navRef = useRef<HTMLElement>(null);
  const markRef = useRef<HTMLSpanElement>(null);
  const picks = useRef<(HTMLButtonElement | null)[]>([]);

  useLayoutEffect(() => {
    const button = picks.current[kind];
    const mark = markRef.current;
    if (!button || !mark) return;
    mark.style.width = `${button.offsetWidth}px`;
    mark.style.transform = `translateX(${button.offsetLeft}px)`;
    navRef.current?.setAttribute("data-ready", "");
  }, [kind]);

  function onPickKey(event: KeyboardEvent<HTMLButtonElement>, i: number) {
    const dir =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (!dir) return;
    event.preventDefault();
    const next = (i + dir + MENU_KINDS.length) % MENU_KINDS.length;
    onChange(next);
    picks.current[next]?.focus();
  }

  return (
    <nav className="awardNav" ref={navRef} aria-label="Choose a menu">
      <span className="awardMark" ref={markRef} />
      {MENU_KINDS.map((item, i) => (
        <button
          key={item.id}
          ref={(node) => {
            picks.current[i] = node;
          }}
          type="button"
          className="awardPick"
          aria-current={i === kind ? "true" : undefined}
          onClick={() => onChange(i)}
          onKeyDown={(event) => onPickKey(event, i)}
        >
          <span>{String(i + 1).padStart(2, "0")}</span>
          <strong>{item.name}</strong>
        </button>
      ))}
    </nav>
  );
}
