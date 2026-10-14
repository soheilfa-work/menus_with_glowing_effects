"use client";

import { useRef, useState } from "react";
import { IndexMenu, MenuSwitch, SignalMenu } from "./award-board";
import { DockMenu, TABS } from "./dock-menu";
import { SwellMenu } from "./curvy-menus";
import { RingsMenu } from "./extra-menus";

const MENUS = [RingsMenu, SignalMenu, DockMenu, IndexMenu, SwellMenu];

export default function Home() {
  const [index, setIndex] = useState(0);
  const [kind, setKind] = useState(0);
  const paused = useRef(false);
  const tab = TABS[index];
  const ActiveMenu = MENUS[kind] ?? DockMenu;

  function choose(next: number) {
    paused.current = true;
    setIndex(next);
  }

  return (
    <main className="page">
      <MenuSwitch kind={kind} onChange={setKind} />
      <div className="stage">
        <header className="hero">
          <div className="brand">
            <span className="brandDot" />
            <span className="brandName">FARROKH CODES</span>
          </div>
          <h1 key={tab.id}>{tab.title}</h1>
          <p key={tab.subtitle}>{tab.subtitle}</p>
        </header>

        <div className="menuSlot">
          <ActiveMenu index={index} onChange={choose} />
        </div>
      </div>
    </main>
  );
}
