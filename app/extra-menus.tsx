"use client";

import { useRef, type KeyboardEvent } from "react";
import { TABS } from "./dock-menu";
import { ICONS, useIconMotion, type MenuProps } from "./award-board";

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

function sample(centers: number[], at: number) {
  if (!centers.length) return 0;
  const i0 = clamp(Math.floor(at), 0, centers.length - 1);
  const i1 = Math.min(i0 + 1, centers.length - 1);
  const span = at - Math.floor(at);
  return centers[i0] + (centers[i1] - centers[i0]) * (i0 === i1 ? 0 : span);
}

function centers(nodes: HTMLElement[]) {
  return nodes.map((node) => node.offsetLeft + node.offsetWidth / 2);
}

export function RingsMenu({ index, onChange }: MenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const discRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLParagraphElement>(null);

  useIconMotion(index, (at, css, lean) => {
    document.documentElement.style.setProperty("--acc", css);
    const hits = [...(rootRef.current?.querySelectorAll<HTMLElement>(".ringHit") ?? [])];
    const x = sample(centers(hits), at);
    if (discRef.current) {
      discRef.current.style.left = `${x}px`;
      discRef.current.style.transform = `translate(-50%, -50%) scale(${1 + Math.abs(lean) * 0.12})`;
    }
    if (nameRef.current) nameRef.current.style.left = `${x}px`;
    hits.forEach((node) => {
      const glyph = node.querySelector<HTMLElement>("[data-glyph]");
      if (!glyph) return;
      const dist = Math.abs(at - Number(node.dataset.i));
      glyph.style.opacity = String(clamp((dist - 0.2) / 0.3, 0, 1));
      glyph.style.color = dist < 0.28 ? "#1a0d14" : "rgba(255,255,255,0.8)";
    });
  });

  const Active = ICONS[index];

  return (
    <div className="rings">
      <div className="ringsRow" ref={rootRef} role="tablist" aria-label="Rings">
        <div className="ringDisc" ref={discRef}>
          <Active />
        </div>
        {TABS.map((tab, i) => {
          const Icon = ICONS[i];
          return (
            <button
              key={tab.id}
              type="button"
              className="ringHit"
              data-i={i}
              role="tab"
              aria-selected={i === index}
              aria-label={tab.label}
              onClick={() => onChange(i)}
              onKeyDown={(event) => nudge(event, index, onChange)}
            >
              <span className="ringGlyph" data-glyph="">
                <Icon />
              </span>
            </button>
          );
        })}
      </div>
      <p className="ringsName" ref={nameRef}>
        {TABS[index].label}
      </p>
    </div>
  );
}
