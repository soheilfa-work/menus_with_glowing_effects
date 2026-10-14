"use client";

import { useRef, type KeyboardEvent } from "react";
import { TABS } from "./dock-menu";
import { ICONS, useIconMotion, type MenuProps } from "./award-board";

type Point = { x: number; y: number };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function nudge(event: KeyboardEvent, index: number, onChange: (next: number) => void) {
  const dir =
    event.key === "ArrowRight" || event.key === "ArrowDown"
      ? 1
      : event.key === "ArrowLeft" || event.key === "ArrowUp"
        ? -1
        : 0;
  if (!dir) return;
  event.preventDefault();
  onChange((index + dir + TABS.length) % TABS.length);
}

function swellPoint(t: number): Point {
  return {
    x: 8 + t * 84,
    y: 48 + Math.sin(t * Math.PI * 3) * (8 + t * 20),
  };
}

function curvePath(point: (t: number) => Point) {
  return Array.from({ length: 48 }, (_, i) => {
    const p = point(i / 47);
    return `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
  }).join(" ");
}

export function SwellMenu({ index, onChange }: MenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const beadRef = useRef<HTMLDivElement>(null);
  const d = curvePath(swellPoint);

  useIconMotion(index, (at, css, lean) => {
    document.documentElement.style.setProperty("--acc", css);
    const place = swellPoint(clamp(at, 0, TABS.length - 1) / (TABS.length - 1));
    if (beadRef.current) {
      beadRef.current.style.left = `${place.x}%`;
      beadRef.current.style.top = `${place.y}%`;
      beadRef.current.style.transform = `translate(-50%, -50%) scale(${1 + Math.abs(lean) * 0.08})`;
    }
    rootRef.current?.querySelectorAll<HTMLElement>(".curveHit").forEach((node) => {
      const dist = Math.abs(at - Number(node.dataset.i));
      const glyph = node.querySelector<HTMLElement>("[data-glyph]");
      if (glyph) glyph.style.opacity = String(clamp((dist - 0.22) / 0.32, 0, 1));
    });
  });

  const Active = ICONS[index];

  return (
    <div className="curve" ref={rootRef} role="tablist" aria-label="Swell">
      <svg className="curveSvg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path
          d={d}
          fill="none"
          stroke="rgba(255,255,255,0.38)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="curveBead" ref={beadRef}>
        <Active />
      </div>
      {TABS.map((tab, i) => {
        const Icon = ICONS[i];
        const place = swellPoint(i / (TABS.length - 1));
        return (
          <button
            key={tab.id}
            type="button"
            className="curveHit"
            data-i={i}
            style={{ left: `${place.x}%`, top: `${place.y}%` }}
            role="tab"
            aria-selected={i === index}
            aria-label={tab.label}
            onClick={() => onChange(i)}
            onKeyDown={(event) => nudge(event, index, onChange)}
          >
            <span className="curveGlyph" data-glyph="">
              <Icon />
            </span>
          </button>
        );
      })}
    </div>
  );
}
