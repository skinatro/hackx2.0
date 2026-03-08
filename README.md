# Hackathon Platform Website

A professional, dynamic, and responsive website built specifically to host and manage our upcoming flagship Hackathon. This event is proudly co-organized by two prominent committees: **[CSI SFIT](https://csi-sfit.vercel.app/)** and **GDG SFIT** (Google Developer Group at SFIT). The platform provides all necessary information for participants, sponsors, and visitors, wrapped in a polished, highly uniform design system.

## 🎨 Design System & Architecture

The application is built with a strong emphasis on scalable design and visual uniformity:

- **Dynamic Tile Component (`ui/components/basic/tile.tsx`)**: The core building block of the UI. Everything from text, images, and embedded UI elements is rendered within these flexible tiles. Multiple tiles can be combined to form larger grid sections, ensuring consistent spacing, borders, and rounding across the entire site.
- **Perfect Theming**: Full support for thoughtfully curated **Light** and **Dark mode** palettes. Colors, typography, and contrast ratios are tuned to provide an optimal and accessible viewing experience.
- **Responsive Grid**: Built to organically scale from desktop to mobile screens using the tile structural system.

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: Tailwind CSS (for native dark mode handling and utility classes)
- **Animations**: [Anime.js](https://animejs.com/) (for smooth, lightweight, and complex UI animations, especially in the timeline and tile interactions)
- **Icons**: Lucide React / React Icons (Clean, professional SVG icons)
- **Package Manager**: [pnpm](https://pnpm.io/)

## 🗺️ Site Structure & Pages

The website is divided into the following key pages, heavily utilizing our dynamic tile layout:

### 1. Home Page

- **Hero Section**: Event name, dates, tagline, and primary Call-To-Action (Register Now).
- **Event Highlights**: Quick stats (e.g., total prize pool, expected attendees).
- **About Snippet**: Brief introduction linking to the full About page.

### 2. About

- **Mission & Vision**: The goal of the hackathon and our core values.
- **The Organizers**: Information and background on our organizing committees, **[CSI SFIT](https://csi-sfit.vercel.app/)** and **GDG SFIT**.
- **Organizing Team**: Profile tiles for the core team members across both committees making the event happen.

### 3. Problem Statements

- **Domain Overview**: High-level introduction to the hackathon themes.
- **Challenge Tracks**: Dedicated tiles for each problem statement, detailing the background, requirements, and judgment criteria.

### 4. Timeline

- **Event Schedule**: An interactive, step-by-step chronological roadmap (enhanced by Anime.js transitions).
- **Phases**: Key dates spanning registration opening/closing, kick-off ceremony, hacking duration, submission deadlines, and results announcement.

### 5. Sponsors

- **Sponsorship Tiers**: Segmented grids for Platinum, Gold, Silver, and Bronze partners.
- **Partner Profiles**: Logos and company descriptions.
- **Call for Sponsors**: Documentation and contact points for prospective partners.

### 6. FAQs

- **Interactive Q&A**: Collapsible/expandable tiles categorizing common questions (General, Registration, Team Formation, Submission Rules).

### 7. Contact

- **Support Links**: Embedded contact form or direct email mapping.
- **Community Channels**: Links to Discord, Slack, Twitter, and other social media presence.

## 🛠️ Getting Started

First, install the dependencies using pnpm:

```bash
pnpm install
```

Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. You can start exploring the custom architectural components in `ui/components/basic/tile.tsx`.
