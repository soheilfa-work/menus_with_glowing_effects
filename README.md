# Animated Menus with Glowing Buttons

A Next.js showcase of five navigation menus. Each style uses the same destinations — **Websites**, **Apps**, **Branding**, **Security**, and **Launch** — with an accent glow that follows the active item.

## Live Demo

**[Open the live demo](https://temporary-spry-opal-6nz1b9t.vercel.app)**

## Menus

Use the numbered switcher at the top of the page:

| # | Style | What it does |
| --- | --- | --- |
| 01 | **Rings** | A glowing disc slides across the icon row |
| 02 | **Signal** | A fill bar grows toward the selected icon |
| 03 | **Dock** | A morphing bar with a lifted bead on the active tab |
| 04 | **Index** | Labeled tabs with a sliding highlight |
| 05 | **Swell** | Icons sit on a curve; the bead travels the path |

## Features

- Switch between five menu treatments without leaving the page
- Arrow keys move between items
- Accent color interpolates as the selection moves
- Honors `prefers-reduced-motion`
- Built with Next.js 16, React 19, Tailwind CSS 4, and TypeScript

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

```bash
npm run build
npm start
```

## Stack

- [Next.js](https://nextjs.org) 16 (App Router)
- [React](https://react.dev) 19
- [Tailwind CSS](https://tailwindcss.com) 4
- TypeScript
