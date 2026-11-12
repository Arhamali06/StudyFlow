# StudyFlow

**A personal study planner and academic progress tracker for students.**
StudyFlow helps students organize courses, plan assignments and deadlines, see what to do next, and track their academic progress over time.

![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/backend-Supabase-3ecf8e?logo=supabase&logoColor=white)


**Live demo:** https://study-flow-zeta-tawny.vercel.app/

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [How it works](#how-it-works)
- [Authentication and data](#authentication-and-data)
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
- Update and persist a profile display name used in the dashboard greeting.
- Change email with Supabase confirmation, update passwords, and sign out of all sessions.
- Export study data as JSON.
- Safely clear all subjects and tasks while preserving the account and profile.
- Permanently delete the account and associated data after password reauthentication.
- Global task search from anywhere with `Ctrl/⌘ + K`.

### Authentication
- Sign up with a display name, email and password.
- Secure login and logout with Supabase Auth.
- Password reset and password update flows.
- Protected application routes and public-only authentication routes.
- Persistent sessions restored through Supabase Auth.
- Email confirmation and email-change verification.

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
| Authentication | [Supabase Auth](https://supabase.com/docs/guides/auth) |
| Database | [Supabase Postgres](https://supabase.com/docs/guides/database) with Row Level Security |
| Edge functions | Supabase Edge Function for authenticated account deletion |

---

## Getting started

### Prerequisites
- A current LTS version of [Node.js](https://nodejs.org) (20.19+ or 22.12+ recommended) and npm.
- A Supabase project with the project URL and publishable key.

### Install and run

```bash
git clone <your-repository-url>
cd studyflow
npm install
npm run dev
```

Open the URL printed in the terminal (usually `http://localhost:5173`).

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Only the publishable key belongs in frontend environment variables. Never expose a Supabase secret or service-role key in the client.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the development server with hot reload |
| `npm run build` | Type-checks with `tsc` and creates a production build in `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | Runs oxlint |

### Try it with data
Create an account, confirm your email if required, and add your courses and tasks. Use **Settings → Data** to export or clear your study data.

---

## Project structure

```text
src/
├── app/                 # App shell: providers (App.tsx) and the route table (router.tsx)
├── components/
│   ├── auth/            # Authentication forms, password controls and route guards
│   ├── calendar/        # Month grid and selected-day panel
│   ├── dashboard/       # Next up, Next 7 days, Needs attention, Today's tasks...
│   ├── layout/          # AppLayout, Sidebar, Header, PageHeader, route error screen
│   ├── progress/        # Ring, trend chart, subject progress rows
│   ├── subjects/        # Subject cards, forms and the safe-delete dialog
│   ├── tasks/           # Task rows, filters, form, drawer and modal
│   └── ui/              # Reusable pieces: Button, Badge, Modal, FormField, ProgressBar...
├── context/             # Auth, profile, app data, theme and toast providers
├── hooks/               # Reusable profile, auth-adjacent, data and UI hooks
├── lib/                 # Pure logic: dates, tasks, statistics, calendar and storage
├── pages/               # Auth, dashboard, planner, progress and settings routes
├── schemas/             # Zod schemas (the single source of truth for validation)
├── styles/              # tokens.css, global.css, layout.css, components.css, pages.css
├── types/               # Shared application and generated database types
└── utils/               # Supabase client and authentication error helpers
supabase/
├── functions/           # Secure account deletion Edge Function
└── migrations/          # Database schema, RLS and account-data migrations
```

---

## How it works

### Architecture
- **State:** a reducer inside an `AppDataProvider` holds subjects and tasks loaded from Supabase. The profile is maintained by `ProfileProvider`; theme and toasts have their own small providers.
- **Authentication:** `AuthProvider` restores the Supabase session and reacts to authentication events. Protected routes are rendered only for authenticated users.
- **Profile source of truth:** the `profiles` table stores the application display name. Supabase Auth owns the account email and authentication metadata.
- **Database security:** profiles, subjects and tasks use authenticated-user RLS policies. Sensitive account deletion uses a Supabase Edge Function with server-side credentials.
- **Pure logic in `lib/`:** dates, filtering, sorting and all statistics are plain functions that take their inputs (including "today") as arguments, which keeps them predictable and easy to test.
- **One source of truth for numbers:** the Dashboard and Progress pages both read from the shared `useStudyStatistics` hook, so the same figure can never be calculated two different ways.
- **Constants drive types and validation:** task types, priorities and limits are defined once and used by both the TypeScript types and the Zod schemas.

### Design decisions
- **Dates are local `YYYY-MM-DD` strings,** never `new Date("YYYY-MM-DD")`, which avoids the classic off-by-one-day timezone bug. Completion timestamps are converted to the user's local day.
- **Weeks start on Sunday.**
- **Everything shown is computed from the user's saved tasks and subjects,** never stored or faked.
- **Progress date ranges** use two bases on purpose: activity metrics (on-time rate, best week, weekday productivity) look at *when tasks were completed*, while the ring, subject progress and breakdowns look at *tasks due in the window*, so upcoming work still counts as pending. Streaks and the 8-week trend always use fixed windows.
- **Progress never lies:** partial progress is never rounded up to 100% (or down to 0%).

---

## Authentication and data

StudyFlow uses a React frontend with Supabase Auth, Postgres and Row Level Security.

**What this means in practice:**

- **Your subjects and tasks are stored in your Supabase account** and protected by per-user RLS policies.
- **Your profile display name is stored in the `profiles` table** and remains separate from the Supabase Auth identity metadata.
- **Account deletion removes the Auth user and related profile, subject and task data.**
- **Clear all data removes subjects and tasks but preserves the account and profile.**
- **Theme preference is local to the browser** and is stored under a versioned `localStorage` key.
- **Email changes require confirmation** through the Supabase email-change flow before the new address becomes active.
- **Fonts:** the Plus Jakarta Sans font is loaded from Google Fonts, so a network connection is needed for that font on first load (the app falls back to system fonts otherwise).

StudyFlow is designed as a personal planner. It does not currently include collaboration, sharing or role-based team workspaces.

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

Configure the same `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` environment variables in the hosting provider. Apply Supabase migrations before using account and data-management features:

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push --remote
```

The account deletion Edge Function must also be deployed and configured with Supabase-managed server secrets. Never place those secrets in frontend environment variables.

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
- Optional grades per task with an average per subject.
- Recurring tasks and subtasks.
- Installable PWA with offline support and a self-hosted font.
- A dedicated automated test suite (unit tests for `lib/`, end-to-end tests for key flows).

---

## Author

Built by **Arham Ali** .
