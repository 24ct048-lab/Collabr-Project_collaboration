# Collabr

> **A Tinder-style developer collaboration platform.** Post projects, swipe interest, get matched.

---

## Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite, Jotai (state), React Router v6, Axios |
| **Styling** | Vanilla CSS with CSS Variables — Satoshi + Syne font pair, Tailwind v4 (utility imports only) |
| **Backend** | Node.js + Express |
| **Database** | MongoDB (Mongoose ODM) |
| **Auth** | JWT (7-day tokens) + bcryptjs password hashing |
| **Dev tooling** | Nodemon, ESLint, Vite HMR |

---

## Project Structure

```
Collabr/
├── client/                 # React + Vite frontend
│   └── src/
│       ├── api/index.js    # Axios client + all API functions
│       ├── atoms/          # Jotai global state atoms
│       ├── components/     # Navbar, ProjectCard, ProtectedRoute, EditProjectModal
│       ├── pages/          # AuthPage, FeedPage, DashboardPage, ProjectDetailPage, IdeasPage
│       └── index.css       # Full design system (CSS variables, tokens, animations)
├── server/                 # Express API
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routers
│   ├── middleware/         # auth.js (JWT verify)
│   ├── seed.js             # Dummy data seeder (6 users, 12 projects, 12 ideas)
│   └── server.js           # Entry point
└── skills/
    ├── DESIGN.md           # Kinetic Minimalist design spec
    └── frontend-skill.md   # Frontend aesthetics guide
```

---

## Database Design

MongoDB database name: **`collabr`**

### Collection: `users`
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Primary key |
| `name` | String | Required |
| `email` | String | Required, unique, lowercase |
| `passwordHash` | String | bcrypt hash |
| `bio` | String | Optional profile bio |
| `skills` | [String] | e.g. `["React", "Python"]` |
| `createdAt` | Date | Auto (timestamps) |
| `updatedAt` | Date | Auto (timestamps) |

### Collection: `projects`
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Primary key |
| `creatorId` | ObjectId → `users` | Required |
| `title` | String | Required |
| `description` | String | Required |
| `techStack` | [String] | e.g. `["React", "Node.js"]` |
| `imageUrl` | String | Optional Unsplash/CDN URL |
| `groupLink` | String | Optional Discord/WhatsApp invite |
| `status` | Enum(`open`,`closed`) | Default `open` |
| `createdAt` / `updatedAt` | Date | Auto |

### Collection: `swipes`
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Primary key |
| `userId` | ObjectId → `users` | Who swiped |
| `projectId` | ObjectId → `projects` | What was swiped on |
| `action` | Enum(`interested`,`pass`) | Swipe direction |
| `createdAt` | Date | Auto |

> **Compound index:** `(userId, projectId)` unique — prevents duplicate swipes. Projects already swiped are excluded from the feed query.

### Collection: `matches`
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Primary key |
| `projectId` | ObjectId → `projects` | The project |
| `applicantId` | ObjectId → `users` | Who expressed interest |
| `ownerId` | ObjectId → `users` | Project creator |
| `status` | Enum(`pending`,`accepted`) | Default `pending` |
| `messageFromOwner` | String | Optional acceptance note |
| `createdAt` / `updatedAt` | Date | Auto |

> Created automatically when a user swipes `interested` on a project.

### Collection: `questions`
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Primary key |
| `projectId` | ObjectId → `projects` | Which project |
| `authorId` | ObjectId → `users` | Who asked |
| `text` | String | Required |
| `answer` | String | Optional — filled by project owner |
| `timestamp` | Date | Default now |

### Collection: `ideas`
| Field | Type | Notes |
|-------|------|-------|
| `_id` | ObjectId | Primary key |
| `authorId` | ObjectId → `users` | Creator |
| `title` | String | Required — "the hook" |
| `description` | String | Required — "the vision" |
| `tags` | [String] | e.g. `["AI", "Fintech"]` |
| `createdAt` / `updatedAt` | Date | Auto |

---

## API Reference

Base URL: `http://localhost:5000/api`  
Protected routes require: `Authorization: Bearer <token>`

### Auth
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/auth/register` | — | Register. Body: `{name, email, password}` |
| `POST` | `/auth/login` | — | Login. Body: `{email, password}` |

### Projects
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/projects/feed` | ✓ | Projects not yet swiped by current user |
| `GET` | `/projects/mine` | ✓ | Projects created by current user |
| `GET` | `/projects/:id` | ✓ | Single project (populates creator) |
| `POST` | `/projects` | ✓ | Create project. Body: `{title, description, techStack, imageUrl?, groupLink?}` |
| `PATCH` | `/projects/:id` | ✓ | Edit project (owner only) |
| `PATCH` | `/projects/:id/status` | ✓ | Toggle open/closed. Body: `{status}` |

### Swipes
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/swipes` | ✓ | Record swipe. Body: `{projectId, action: "interested"\|"pass"}` |

### Matches
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/matches/incoming` | ✓ | Matches on my projects (populated) |
| `GET` | `/matches/my-applications` | ✓ | Matches where I am the applicant |
| `POST` | `/matches/:id/accept` | ✓ | Accept a match. Body: `{messageFromOwner?}` |

### Questions
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/questions/:projectId` | ✓ | All questions for a project |
| `POST` | `/questions/:projectId` | ✓ | Post a question. Body: `{text}` |
| `PATCH` | `/questions/:id/answer` | ✓ | Answer a question (project owner only). Body: `{answer}` |
| `GET` | `/questions/mine/unanswered` | ✓ | Unanswered Qs on my projects |

### Ideas
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/ideas` | ✓ | All ideas (newest first, populated) |
| `POST` | `/ideas` | ✓ | Share an idea. Body: `{title, description, tags?}` |

---

## Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally on port `27017`

### Backend
```bash
cd server
cp .env.example .env   # set JWT_SECRET
npm install
npm run dev            # → http://localhost:5000
```

### Frontend
```bash
cd client
npm install
npm run dev            # → http://localhost:5173
```

### Seed Dummy Data
```bash
cd server
node seed.js
# Creates 6 users (password: user123) + 12 projects + 12 ideas
```

**Seed accounts:**
| Name | Email | Password |
|------|-------|----------|
| Alex Chen | alex@collabr.dev | user123 |
| Priya Sharma | priya@collabr.dev | user123 |
| Marcus Wright | marcus@collabr.dev | user123 |
| Sofia Reyes | sofia@collabr.dev | user123 |
| James Park | james@collabr.dev | user123 |
| Nadia Kovacs | nadia@collabr.dev | user123 |

---

## User Flow

```
Register/Login → /auth
     ↓
Browse Feed  → /feed
  • Swipe Interested = creates Match (pending)
  • Swipe Skip = hide forever
  • Click Details → /projects/:id (Q&A)
     ↓
Dashboard → /dashboard
  • My Projects tab   — create / edit / toggle status
  • Q&A tab           — answer incoming questions
  • Interested Users  — see applicants, accept matches
  • My Applications   — see your outgoing swipes
     ↓
Ideas → /ideas
  • Explore vault (community idea grid)
  • Share a Spark (post rough idea, no full project needed)
```

---

## Design System

The UI uses a bespoke **Kinetic Minimalist** dark design system (see `skills/DESIGN.md`):

- **Fonts:** [Syne](https://fonts.google.com/specimen/Syne) (display, 600–800) + [Satoshi](https://www.fontshare.com/fonts/satoshi) (body, 300–700) + JetBrains Mono
- **Color palette:** Deep obsidian surfaces (`#08090c` → `#242b3a`) with electric indigo primary (`#b8b5ff`)
- **Approach:** No 1px borders for sectioning — tonal elevation only. Glassmorphism for floating elements. Ambient shadows (not drop shadows).
- **Animations:** Fluid swipe-out (feed), staggered fade-up reveals, floating hero elements, pulsing button rings

---

## Feature Roadmap

### 🚀 Planned Next
| Feature | Description |
|---------|-------------|
| **Real-time chat** | WebSocket-based DM after match acceptance |
| **Project search & filters** | Filter feed by tech stack, status, newness |
| **Drag-to-swipe** | Touch/mouse drag gesture on feed cards (Tinder-style) |
| **Notifications** | In-app + email notifications for matches and Q&A replies |
| **User profiles** | Public `/u/:username` profile page with projects & ideas |
| **Idea upvotes** | Community voting on Ideas Vault entries |
| **Skill matching** | Surface projects matching the logged-in user's skill set |
| **Saved / Bookmarks** | Save projects without swiping interested |
| **Project analytics** | Views, interest count, accept rate for project owners |
| **OAuth login** | GitHub / Google sign-in |
| **Team size tags** | Tag projects with desired team size (solo, 2–3, 4+) |
| **Role requests** | Applicants specify the role they want (Frontend, ML, Design…) |
| **Project stages** | Tag as Idea / In Progress / Beta / Shipped |
| **Markdown descriptions** | Rich text in project and idea descriptions |
| **Mobile PWA** | Installable with swipe gestures and offline support |

---

## Environment Variables

```
# server/.env
MONGO_URI=mongodb://localhost:27017/collabr
JWT_SECRET=your_secret_here
PORT=5000
```

---

## Git History

| Commit | Description |
|--------|-------------|
| `v0.1` | Dark editorial design system, seed data, all pages implemented |
| `v0.2` | Feed redesign (Tinder-style cards), Satoshi+Syne fonts, fluid typography |

---

