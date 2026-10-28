# StudyFlow

**A personal study planner and academic progress tracker for students.**
Organize subjects, plan tasks and deadlines, see what to do next, and track how your study habits evolve over time, all in the browser with no account and no backend.

![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)
![Frontend only](https://img.shields.io/badge/backend-none-lightgrey)

<!-- TODO: add your deployed link and screenshots before publishing -->
**Live demo:** _add your deployed URL here_

| Dashboard | Progress |
| --- | --- |
| _screenshot_ | _screenshot_ |

| My Tasks | Calendar |
| --- | --- |
| _screenshot_ | _screenshot_ |

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [How it works](#how-it-works)
- [Data storage and limitations](#data-storage-and-limitations)
- [Accessibility and responsiveness](#accessibility-and-responsiveness)
- [Deployment](#deployment)
- [Possible future improvements](#possible-future-improvements)
- [Author](#author)

---

## Features

### Subjects
- Create, edit and delete subjects, each with a name and a color.
- Names are validated (required, length-limited, no case-insensitive duplicates).
- Every subject shows its task count and completion progress.
- **Safe deletion:** when a subject still has tasks, you choose to move them to another subject or delete them together with it.

### Tasks
- Create, edit, delete and complete tasks with a title, description, subject, type (assignment, quiz, exam, revision, other), due date, priority and status.
- Forms use React Hook Form with Zod validation and inline error messages.
- Search by title, filter by subject, priority and type, and sort by due date, priority or recently added.
- **List view** grouped into Overdue, Today, Next 7 days, Later and Completed, plus a **board view**.
- Status tabs (All, Pending, Completed) with live counts.
- Overdue tasks are highlighted, and edits happen in a side drawer so you never leave the page.
- Filters live in the URL (for example `/tasks?subject=...&overdue=true`), so views can be bookmarked and the dashboard cards can deep-link into them.

### Dashboard: "What should I do now?"
- Clickable summary cards (total, pending, completed, overdue).
- **Next up:** the single best task to start with (overdue first, then due today, then priority), with a one-click *Mark done*.
- Today's tasks (overdue first), a compact **Next 7 days** strip, a **Needs attention** list of subjects with overdue or soon-due work, and upcoming deadlines.
- Completion streak and a quick-add card.

### Calendar
- Monthly grid with task indicators, overdue markers and a selected-day panel.
- Create a task straight from a selected date.
- Full keyboard navigation (arrow keys, `Home`/`End`, `PageUp`/`PageDown`, and `Shift` + `PageUp`/`PageDown` for years).
- The selected date is stored in the URL.

### Progress: "How am I doing over time?"
- Overall completion ring and per-subject progress.
- Last 8 weeks trend chart.
- On-time completion rate, current and longest streak, best week and week-over-week change.
- Breakdowns by task type and priority, productivity by weekday, and short auto-generated insights.
- Date range filter: last 7 days, 30 days, 90 days or all time.

### Settings and data
- Light, dark or system theme (follows your OS live), saved across visits and synced between tabs, with no flash of the wrong theme on load.
- Optional display name used in the dashboard greeting.
- Optional sample data to explore the app, always clearly marked as sample.
- Safe **Clear all data** with a confirmation dialog.
- Global task search from anywhere with `Ctrl/⌘ + K`.

---

## Tech stack

| Area | Technology |
| --- | --- |
| UI | [React 19](https://react.dev) |
| Language | [TypeScript](https://www.typescriptlang.org) (type-checked on every build) |
| Build tool | [Vite](https://vite.dev) |
| Routing | [React Router](https://reactrouter.com) |
| Forms and validation | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) |
| Charts | [Recharts](https://recharts.org) |
| Icons | [Lucide](https://lucide.dev) |
| Styling | Plain CSS with design tokens (CSS custom properties), no UI framework |
| Linting | [oxlint](https://oxc.rs/docs/guide/usage/linter) |
| Persistence | Browser `localStorage` (versioned keys, validated on read) |

---

## Getting started

### Prerequisites
- A current LTS version of [Node.js](https://nodejs.org) (20.19+ or 22.12+ recommended) and npm.

### Install and run

```bash
git clone <your-repository-url>
cd studyflow
npm install
npm run dev
```

Open the URL printed in the terminal (usually `http://localhost:5173`).

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the development server with hot reload |
| `npm run build` | Type-checks with `tsc` and creates a production build in `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | Runs oxlint |

### Try it with data
On first launch the app is empty. Open **Settings → Load sample data** to add example subjects and tasks, or use **Clear all data** to start fresh.

---

## Project structure

```text
src/
├── app/                 # App shell: providers (App.tsx) and the route table (router.tsx)
├── components/
│   ├── calendar/        # Month grid and selected-day panel
│   ├── dashboard/       # Next up, Next 7 days, Needs attention, Today's tasks...
│   ├── layout/          # AppLayout, Sidebar, Header, PageHeader, route error screen
│   ├── progress/        # Ring, trend chart, subject progress rows
│   ├── subjects/        # Subject cards, forms and the safe-delete dialog
│   ├── tasks/           # Task rows, filters, form, drawer and modal
│   └── ui/              # Reusable pieces: Button, Badge, Modal, FormField, ProgressBar...
├── context/             # App data (subjects, tasks), theme and toast providers
├── hooks/               # useAppData, useTheme, useToday, useTaskFilters, useStudyStatistics...
├── lib/                 # Pure logic: dates, tasks, statistics, calendar, storage, sample data
├── pages/               # One component per route
├── schemas/             # Zod schemas (the single source of truth for validation)
├── styles/              # tokens.css, global.css, layout.css, components.css, pages.css
└── types/               # Shared TypeScript types
```

---

## How it works

### Architecture
- **State:** a reducer inside an `AppDataProvider` holds subjects and tasks. Every change is written to `localStorage`. Theme and toasts have their own small providers.
- **Pure logic in `lib/`:** dates, filtering, sorting and all statistics are plain functions that take their inputs (including "today") as arguments, which keeps them predictable and easy to test.
- **One source of truth for numbers:** the Dashboard and Progress pages both read from the shared `useStudyStatistics` hook, so the same figure can never be calculated two different ways.
- **Constants drive types and validation:** task types, priorities and limits are defined once and used by both the TypeScript types and the Zod schemas.

### Design decisions
- **Dates are local `YYYY-MM-DD` strings,** never `new Date("YYYY-MM-DD")`, which avoids the classic off-by-one-day timezone bug. Completion timestamps are converted to the user's local day.
- **Weeks start on Sunday.**
- **Everything shown is computed from real tasks and subjects,** never stored or faked. Sample data is optional and always marked.
- **Progress date ranges** use two bases on purpose: activity metrics (on-time rate, best week, weekday productivity) look at *when tasks were completed*, while the ring, subject progress and breakdowns look at *tasks due in the window*, so upcoming work still counts as pending. Streaks and the 8-week trend always use fixed windows.
- **Progress never lies:** partial progress is never rounded up to 100% (or down to 0%).

---

## Data storage and limitations

StudyFlow is a **frontend-only** application. There is no server, no database, no login and no network requests for your data.

**What this means in practice:**

- **Your data lives only in your browser** (`localStorage` under keys prefixed `studyflow:v1:`). Nothing is sent anywhere.
- **It does not sync.** Tasks created on one browser or device will not appear on another.
- **Clearing site data, using a private/incognito window, or switching browsers means starting empty.** There is no account to recover from.
- **Storage is limited** (typically around 5 MB per site). That is far more than a planner needs, but if the browser refuses to save, the app shows a message instead of failing silently.
- **Multiple tabs are kept in sync, but writes are last-write-wins.** Editing the same data in two tabs at the same moment can overwrite changes.
- **If saved data is damaged or invalid,** unreadable items are skipped, a copy of the original is kept under a `:backup` key, and the app shows a message.
- **Fonts:** the Plus Jakarta Sans font is loaded from Google Fonts, so a network connection is needed for that font on first load (the app falls back to system fonts otherwise).

Because of these limits, StudyFlow suits personal use and portfolio demonstration rather than multi-device or collaborative scenarios (see [future improvements](#possible-future-improvements)).

---

## Accessibility and responsiveness

- Responsive layout from small phones to wide desktops, with an off-canvas navigation drawer on smaller screens.
- Semantic landmarks, a skip-to-content link, labelled form controls and icon buttons, and visible focus states.
- Keyboard-friendly dialogs and drawer (focus is trapped while open, `Esc` closes, focus returns to where you were).
- Keyboard-navigable calendar grid.
- Light and dark themes with attention to text contrast, and support for `prefers-reduced-motion`.
- Charts include a text alternative.

---

## Deployment

StudyFlow builds to static files, so any static host works.

```bash
npm run build      # outputs to dist/
npm run preview    # check the production build locally
```

Because the app uses client-side routing (`/tasks`, `/progress`, ...), the host must serve `index.html` for unknown paths, otherwise refreshing a page such as `/progress` shows a 404. This repository includes ready-made configuration:

| Host | Setup |
| --- | --- |
| **Vercel** | Import the repository. Framework preset: Vite. `vercel.json` already contains the rewrite. |
| **Netlify** | Import the repository. `netlify.toml` sets the build command, publish folder and redirect. |
| **Cloudflare Pages** | Build command `npm run build`, output directory `dist`. Single-page-app fallback is on by default when there is no `404.html`. |
| **GitHub Pages** | Possible, but project sites live under a sub-path and Pages has no rewrite support. You would need a `base` setting in `vite.config.ts` and a `404.html` redirect trick, or a hash router. A host from the list above is simpler. |

The optional workflow in `.github/workflows/ci.yml` runs lint and the production build on every push and pull request.

---

## Possible future improvements

These are deliberately **out of scope** for the current version:

- Weekly goal ("complete 8 tasks this week") with progress on the dashboard.
- Pomodoro / focus timer linked to tasks, with study time per subject.
- Browser reminders for tasks due tomorrow and overdue tasks.
- Export and import of data as JSON (a natural backup path for a `localStorage` app).
- Optional grades per task with an average per subject.
- Recurring tasks and subtasks.
- Installable PWA with offline support and a self-hosted font.
- An automated test suite (unit tests for `lib/`, end-to-end tests for key flows).
- Optional account and cloud sync through a backend, to lift the single-browser limitation.

---

## Author

Built by **Hassaan Waqar Butt** as a portfolio project.

<!-- TODO: add links (GitHub, LinkedIn, portfolio) and choose a license, for example MIT -->
