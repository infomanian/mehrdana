# Project Rules & Engineering Guidelines (AGENTS.md)

## 0. Language Policy (Highest Priority)
- **Code & Technical Artifacts:** 100% English (filenames, folders, variables, functions, comments, git commits, console logs, config files, database schemas).
- **UI & User-Facing Content:** 100% Persian (RTL) using `Vazirmatn` font.
- **Chat Communication:** Respond in the user's language (Persian), while keeping all generated files and code strictly in English.

## 1. Project Context & Modular Documentation
We are building a Persian-language (RTL) web platform and PWA for simultaneous in-person and online events (Psychology, Philosophy, Business, Neuroscience, etc.) with real-time event chat rooms and social networking.
- **System Architecture & Database Schema:** Read `docs/architecture.md` before writing backend, auth, payment, or database code.
- **UI/UX & Design System (InterNations Style):** Read `docs/design.md` before building or styling any frontend component or page.
- **Single Source of Truth:** If any other AI tool (Claude, Cursor, Copilot) creates its own instruction file, keep only `@AGENTS.md` inside it.

## 2. Security & Environment Variables (Strict)
- Store all API keys, secrets, and tokens (Supabase, Kavenegar SMS, Stripe, PayPal) exclusively in `.env` at the project root.
- Never hardcode secrets, commit `.env`, or log/print sensitive values.
- Whenever a new variable is added to `.env`, immediately add a placeholder key to `.env.example`.
- Enforce strict Supabase Row Level Security (RLS) so private DMs, Skyroom links, and event chat rooms are accessible only to authorized/verified ticket holders.

## 3. Execution Workflow & Ambiguity Control
- **No Guessing (Plan First):** If requirements, edge cases, or architectural choices have more than one valid approach, stop and ask the user before writing code.
- **Step-by-Step Execution:** Build strictly following the phases in `docs/architecture.md`. Break large features into small, testable subtasks.
- **Self-Review & Verification Loop:** Never mark a task as "done" without verifying it. Run build checks, type checks (`tsc`), and verify there are no regressions or broken RTL layouts.
- **Context Reset:** If fixing a bug fails twice in a row, stop, summarize the root cause, and ask to restart with a clean context.
- **Clean Workspace:** Do not install global runtimes inside the project folder. Remove temporary test/debug files when finishing a phase.

## 4. Git & Risk Management
- Classify changes: Low-risk (isolated UI component), High-risk (auth, payment verification, global config), Destructive (database migrations). Ask for explicit confirmation before applying destructive DB migrations or running `git push` / `reset --hard`.
- Stage and commit only files related to the current subtask using clear English commit messages.

## 5. Communication & Quality Standards
- **Plain Language Communication:** Always explain plans, bugs, trade-offs, and questions in simple, clear, non-technical Persian.
- **Simplicity & Consistency:** Keep UI and features minimal. Reuse existing components and patterns across the site so the codebase stays unified and clean.
- **Performance, SEO & Responsive:** Ensure every page is mobile-first responsive, optimized for SEO (semantic HTML/metadata), and avoids unnecessary database queries.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
