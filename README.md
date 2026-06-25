# Aryan Dani Portfolio

A high-contrast, interactive developer portfolio for Aryan Dani, built with React, Vite, Framer Motion, Tailwind CSS v4 tokens, and a custom Canvas tech globe.

Live site: [aryandani.com](https://www.aryandani.com/)

## What It Does

- Presents projects, skills, certifications, experience, contact options, and resume details in a cohesive neo-brutalist interface.
- Uses a custom 3D Canvas globe to visualize the technology stack without adding heavy WebGL dependencies.
- Provides fast navigation through a floating dock, command palette, CLI playground, and Alt-key shortcuts.
- Supports light/dark themes, custom cursor mode, smooth Lenis scrolling, sound feedback, toasts, modals, and first-visit navigation hints.
- Ships with SEO metadata, structured data, lazy-loaded routes, production code splitting, and Vercel Analytics.

## Tech Stack

- React 18, React Router, Vite
- Framer Motion for page transitions, card reveals, modals, and micro-interactions
- Tailwind CSS v4 design tokens with CSS custom properties
- SCSS/CSS utilities for loader, terminal, cursor, noise, and neo-brutalist styling
- Lenis for smooth scrolling
- React Icons for UI and skill icons
- Vercel Analytics

## Project Structure

```text
frontend/
  src/
    components/       Shared UI: dock, header, globe, command palette, loader
    context/          Theme, toast, sound, and smooth-scroll providers
    data/             Projects, skills, experience, certifications
    hooks/            Modal lock, keyboard navigation, visibility helpers
    pages/            Home, Projects, Experience, Skills, About, Contact, etc.
    utils/            Motion presets, paths, icons
```

## Keyboard Shortcuts

- `Ctrl+K`, `Meta+K`, or `Alt+K`: open command palette
- `Alt+1` through `Alt+7`: jump between primary pages
- `?`: open the shortcut guide
- `Tab`: autocomplete commands inside the CLI playground
- `Esc`: close overlays

## Local Development

```sh
cd frontend
npm install
npm run dev
```

The dev server runs on `http://localhost:3000`.

## Scripts

```sh
npm run dev       # Start Vite dev server
npm run build     # Build production assets
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

## Accessibility & Performance

- Keyboard navigation is first-class: dock links, cards, palette commands, modals, and route shortcuts are operable without a mouse.
- Decorative animation respects `prefers-reduced-motion` where practical.
- Routes are lazy-loaded and major vendor libraries are split into chunks.
- The globe uses Canvas with visibility-based pausing and no additional runtime dependency.
- Theme colors are centralized in `frontend/src/index.css` to maintain contrast across light and dark modes.

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

## Contact

- Email: [daniaryan212@gmail.com](mailto:daniaryan212@gmail.com)
- LinkedIn: [Aryan Dani](https://www.linkedin.com/in/aryandani/)
- GitHub: [@aryan-dani](https://github.com/aryan-dani)
