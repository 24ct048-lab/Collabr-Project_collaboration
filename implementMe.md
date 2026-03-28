# implementMe.md — Collabr UI Enhancement: Remaining Work

## Context

**Stack:** React 19 + Vite + Tailwind v4 (client), Express + Mongoose (server)  
**Pattern:** All styling uses inline `style={{}}` props with CSS variables from `index.css` OR the utility classes defined in `index.css`. Do NOT use Tailwind class names for new components — they conflict with the design system.  
**CSS variables available everywhere (defined in `index.css` `:root`):**
- Surfaces: `--surface`, `--surface-low`, `--surface-container`, `--surface-high`, `--surface-highest`, `--surface-bright`
- Text: `--on-surface`, `--on-surface-variant`, `--secondary`
- Accent: `--primary` (#c3c0ff), `--primary-dim`, `--primary-container`
- Utility classes: `.btn-primary`, `.btn-ghost`, `.btn-danger`, `.tag`, `.tag-success`, `.input-field`, `.input-label`, `.animate-fade-up`

**Already completed (do NOT redo):**
- `server/models/Project.js` — has `imageUrl: String`
- `server/models/Idea.js` — created
- `server/routes/ideas.js` — GET `/api/ideas` and POST `/api/ideas`
- `server/server.js` — ideas route registered
- `client/src/api/index.js` — has `getIdeas()` and `createIdea(data)`
- `client/src/index.css` — full dark design system
- `client/src/components/Navbar.jsx` — dark, has Discover/Ideas/Dashboard links
- `client/src/components/ProjectCard.jsx` — dark card with image hero support

---

## Task Checklist

- [ ] Rewrite `client/src/pages/AuthPage.jsx`
- [ ] Rewrite `client/src/pages/FeedPage.jsx`
- [ ] Rewrite `client/src/pages/DashboardPage.jsx`
- [ ] Rewrite `client/src/pages/ProjectDetailPage.jsx`
- [ ] Create `client/src/pages/IdeasPage.jsx`
- [ ] Update `client/src/App.jsx`
- [ ] Update `client/src/App.css` (clear it)

---

## File-by-File Instructions

---

### 1. `client/src/App.css`
**Action:** Replace entire contents with empty string (just a comment `/* reset */`).  
Reason: App.css had conflicting light styles; index.css is the sole source of truth.

---

### 2. `client/src/App.jsx`
**Action:** Overwrite with same structure as current but:
- Import `IdeasPage` from `./pages/IdeasPage`
- Change root `div` className to just `""` (no `bg-gray-50`), or use `style={{ minHeight: '100vh', background: 'var(--surface)' }}`
- Add this protected route: `<Route path="/ideas" element={<ProtectedRoute><IdeasPage /></ProtectedRoute>} />`
- Keep all existing routes unchanged

---

### 3. `client/src/pages/AuthPage.jsx`
**Action:** Overwrite. Keep all state and logic identical. Only change the JSX/styling.

**Visual requirements:**
- Full-page centered layout: `min-height: 100vh`, `background: var(--surface)`, flex center
- Card: `background: var(--surface-container)`, `border-radius: 1rem`, `padding: 2.5rem`, `max-width: 420px`, `box-shadow: var(--shadow-float)`, `animation: fadeUp 0.4s ease`
- Title: "Collabr" with logo bolt emoji ⚡, large bold, `color: var(--on-surface)`
- Subtitle: small text, `color: var(--secondary)`
- Tab toggle (Login/Sign Up): two buttons side by side. Active tab = `.btn-primary` style. Inactive = `color: var(--secondary)`. Container has `background: var(--surface-highest)`, `border-radius: 0.625rem`, padding `0.25rem`
- All inputs: use `.input-field` class, preceded by `<label className="input-label">`
- Error message: `background: var(--error-dim)`, `color: var(--error)`, `border-radius: 0.5rem`, `padding: 0.5rem 0.75rem`, `font-size: 0.8125rem`
- Submit button: `.btn-primary` full width, `width: 100%`, `justify-content: center`

---

### 4. `client/src/pages/FeedPage.jsx`
**Action:** Overwrite. Keep all state/logic identical (feedAtom, handleSwipe, handleInterested, handlePass). Only change rendering.

**Visual requirements:**
- Wrapper: `max-width: 560px`, `margin: 0 auto`, `padding: 3rem 1.5rem`, flex column, align center
- Empty state: centered, dark styled. Icon `🎉` in a circle with `background: var(--surface-container)`. Title `color: var(--on-surface)`. Body text `color: var(--secondary)`. Add a note "Check back later or post your own from Dashboard."
- Feed counter: small `label-md` text above the card
- The `<ProjectCard>` is rendered with `showActions={false}` (actions are below)
- Below card: large action row with 3 buttons centered, ~`margin-top: 1.5rem`, `gap: 1.5rem`
  - **Pass button:** Circle button 56px×56px, `background: var(--surface-container)`, inner `✕` in `color: var(--on-surface-variant)`. Label "SKIP" below in `label-sm`
  - **Interested button:** Circle button 64px×64px (larger), `background: linear-gradient(135deg, var(--primary), var(--primary-container))`, inner `⚡` white. Label "INTERESTED" below in `label-sm` with `color: var(--primary)`
  - **Details button:** Circle button 56px×56px, `background: var(--surface-container)`, inner `→` `color: var(--on-surface-variant)`. Label "DETAILS" below. On click: navigate to `/projects/${topProject._id}` using `useNavigate`
- "+N more after this" text below action row, `color: var(--secondary)`, small

---

### 5. `client/src/pages/DashboardPage.jsx`
**Action:** Overwrite. Keep all state and logic identical (loadMyProjects, loadMatches, handleCreateProject, handleToggleStatus, handleAccept, pendingMatches, acceptedMatches, revealedEmails). Only change styling.

**Visual requirements:**

**Header area:**
- `padding: 2.5rem 2rem 1.5rem`, `max-width: 860px`, `margin: 0 auto`
- Small label: "COLLABR STUDIO" in `label-sm` `color: var(--secondary)`
- H1: "Dashboard" in `display-md` class, `color: var(--on-surface)`
- Subtitle sentence below in `color: var(--secondary)`

**Tab bar:**
- Container: `background: var(--surface-container)`, `border-radius: 0.75rem`, `padding: 0.25rem`, `width: fit-content`, `margin-bottom: 2rem`
- Active tab: `background: var(--surface-highest)`, `color: var(--primary)`, `border-radius: 0.5rem`
- Inactive: `color: var(--secondary)`
- Pending badge: small circle `background: var(--error)`, `color: white`, `font-size: 0.625rem`

**Project creation form** (inside "My Projects" tab):
- Container: `background: var(--surface-container)`, `border-radius: 1rem`, `padding: 1.5rem`, `margin-bottom: 2rem`
- All inputs use `.input-field` class with `.input-label` labels
- Add a field: label "PROJECT IMAGE URL", placeholder "https://... (optional)", maps to state `imageUrl`, sent as `imageUrl` in the createProject call
- In the `createProject(...)` call, also pass `imageUrl: imageUrl` (add `imageUrl` state variable)
- Submit: `.btn-primary`

**My project cards** in the list:
- Each wrapped in `background: var(--surface-container)`, `border-radius: 1rem`, `padding: 1.25rem`, `margin-bottom: 1rem`
- Show project title bold, description truncated (2 lines), tech tags using `.tag`
- Status toggle button: if open → small ghost button "Mark Closed"; if closed → small success-colored button "Reopen"

**Interested Users tab:**
- Section headers: `label-sm` style
- Pending match cards: `background: var(--surface-container)`, `border-radius: 0.875rem`, `padding: 1rem 1.25rem`
  - Applicant name: `title-md` color `var(--on-surface)`
  - "Interested in: ProjectName" small text `color: var(--secondary)`
  - Bio if present: `color: var(--on-surface-variant)` small
  - Skills as `.tag` chips
  - Accept button: `.btn-primary` right side, text "Accept"
- Accepted match cards: `background: var(--success-dim)`, `border-radius: 0.875rem`, `padding: 1rem 1.25rem`
  - Email shown with `color: var(--success)`
  - "Matched" badge: `.tag-success`

---

### 6. `client/src/pages/ProjectDetailPage.jsx`
**Action:** Overwrite. Keep all state and logic identical (project, questions, questionText, handlePostQuestion). Only change styling.

**Visual requirements:**
- Outer wrapper: `max-width: 720px`, `margin: 0 auto`, `padding: 2rem 1.5rem`
- Back link: `← Back to Feed`, `color: var(--primary-dim)`, small, `margin-bottom: 1.5rem`
- **If `project.imageUrl` exists:** full-width image banner `height: 280px`, `border-radius: 1rem`, `overflow: hidden`, `margin-bottom: 1.5rem`, with gradient overlay at bottom
- Project card: `background: var(--surface-container)`, `border-radius: 1rem`, `padding: 1.75rem`, `margin-bottom: 1.5rem`
  - Title: `headline` class, `color: var(--on-surface)`
  - Status badge: `.tag-success` or `.tag`
  - "by CreatorName": `color: var(--secondary)` small
  - Description: `color: var(--on-surface-variant)`, `line-height: 1.7`
  - Tech tags: `.tag` class, `flex-wrap: wrap`, `gap: 0.375rem`
  - Creator bio section: `border-top: 1px solid rgba(66,72,84,0.15)`, `margin-top: 1.25rem`, `padding-top: 1.25rem`
- Q&A card: same card style
  - Header: "Public Q&A" with count, `title-lg`
  - Textarea: `.input-field`, `resize: none`, `rows=2`
  - Submit: `.btn-primary`
  - Each question item: `background: var(--surface-high)`, `border-radius: 0.625rem`, `padding: 0.75rem 1rem`
    - Author name: bold if own question use `color: var(--primary-dim)`
    - Date: `color: var(--secondary)` right aligned
    - Question text: `color: var(--on-surface)` small

---

### 7. `client/src/pages/IdeasPage.jsx` *(NEW FILE)*
**Action:** Create from scratch.

**State needed:**
- `ideas` (array, loaded from API) — default `[]`
- `title`, `description`, `tags` (strings for form) — default `''`
- `formLoading` (bool), `formError` (string), `listLoading` (bool)
- `activeSection`: `'explore'` | `'share'` — default `'explore'`

**On mount:** call `getIdeas()` from `api/index.js`, set `ideas`

**handleSubmit:** call `createIdea({ title, description, tags: tagsArray })` where `tagsArray` is `tags.split(',').map(t => t.trim()).filter(Boolean)`. On success, prepend new idea to `ideas`, clear form fields, switch `activeSection` to `'explore'`.

**Visual requirements:**

**Page header:**
- `padding: 2.5rem 2rem 1.5rem`, `max-width: 860px`, `margin: 0 auto`
- Small label: "COLLABR STUDIO" in `label-sm`
- H1: "Idea Vault" `display-md`, `color: var(--on-surface)`
- Subtitle: "Cast your spark into the vault. No clutter — just the essence of your next project idea." `color: var(--secondary)`

**Section toggle** (two buttons: "Explore Ideas" / "Share a Spark"):
- Same tab bar style as Dashboard
- `margin-bottom: 2rem`

**"Share a Spark" section** (when `activeSection === 'share'`):
- Form card: `background: var(--surface-container)`, `border-radius: 1rem`, `padding: 1.75rem`, `max-width: 560px`, `margin: 0 auto`
- Fields:
  1. Label "THE HOOK", input `.input-field`, placeholder "What's the lightning bolt?"  → `title`
  2. Label "THE VISION", textarea `.input-field` rows=4, placeholder "Paint the picture..." → `description`
  3. Label "TAGS", input `.input-field`, placeholder "AI, Social, Fintech (comma-separated)" → `tags`
- Error if any: same error style as AuthPage
- Submit button: `.btn-primary`, full width `justify-content: center`, text "Release to Vault ⚡"
- Small italic below: "Your idea will be shared with the community."

**"Explore Ideas" section** (when `activeSection === 'explore'`):
- If `listLoading`: show "Loading..." centered, `color: var(--secondary)`
- If `ideas.length === 0`: empty state with 💡 icon, "No ideas yet", subtext "Be the first to share one!"
- Grid: `display: grid`, `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`, `gap: 1rem`
- Each idea card:
  - `background: var(--surface-container)`, `border-radius: 0.875rem`, `padding: 1.25rem`
  - Hover: `background: var(--surface-high)`; `transition: background 0.2s ease`
  - Title: `title-md`, `color: var(--on-surface)`, `margin-bottom: 0.375rem`
  - Description: `body-md`, `color: var(--on-surface-variant)`, truncated 3 lines (`-webkit-line-clamp: 3`)
  - Tags: `.tag` chips, `margin-top: 0.75rem`, `flex-wrap: wrap`, `gap: 0.375rem`
  - Footer: author name (`color: var(--secondary)`) + date right-aligned
  - No interactive actions (read-only cards)

---

## Imports Reference

Every page file needs these standard imports at the top:
```
import { useState, useEffect } from 'react';
```
FeedPage also needs: `import { useAtom } from 'jotai';` and `import { useNavigate } from 'react-router-dom';`  
DashboardPage also needs: `import { getMyProjects, createProject, getIncomingMatches, acceptMatch, updateProjectStatus } from '../api/index';`  
IdeasPage needs: `import { getIdeas, createIdea } from '../api/index';`  

---

## Verification After Implementation

1. Run `cd server && npm run dev` — should start on port 5001, see "Connected to MongoDB"
2. Run `cd client && npm run dev` — should compile with 0 errors on port 5173
3. Open `http://localhost:5173/auth` — should show dark centered form
4. Register/login → redirects to `/feed` — dark feed card visible
5. On `/feed`, click Pass/Interested buttons — card changes
6. On `/dashboard`, click "+ New Project", fill all fields including Image URL, submit → card appears with image
7. Navigate to `/ideas` → "Explore Ideas" tab shown; click "Share a Spark" → fill form → submit → idea appears in explore grid
8. Click "View Details →" on any project → detail page shows image banner + Q&A section dark styled
