# Collabr MVP

A Tinder-like developer collaboration platform. Post projects, swipe interest, get matched.

## Stack
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT, bcryptjs
- **Frontend**: React (Vite), Recoil, React Router, Tailwind CSS v4, Axios

## Project Structure
```
chrisproject/
  server/   # Express API
  client/   # React frontend
```

## Prerequisites
- Node.js 18+
- MongoDB running locally on port 27017 (or update MONGO_URI in server/.env)

## Setup

### Backend
```bash
cd server
cp .env.example .env   # edit JWT_SECRET as needed
npm install
npm run dev            # runs on http://localhost:5000
```

### Frontend
```bash
cd client
npm install
npm run dev            # runs on http://localhost:5173
```

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Log in |
| GET | /api/projects/feed | Yes | Projects user hasn't swiped |
| POST | /api/projects | Yes | Create project |
| GET | /api/projects/mine | Yes | My projects |
| GET | /api/projects/:id | Yes | Project detail |
| PATCH | /api/projects/:id/status | Yes | Toggle open/closed |
| POST | /api/swipes | Yes | Swipe interested/pass |
| GET | /api/matches/incoming | Yes | Incoming matches |
| POST | /api/matches/:id/accept | Yes | Accept a match |
| GET | /api/questions/:projectId | Yes | Get Q&A |
| POST | /api/questions/:projectId | Yes | Post question |

## User Flow
1. Register/Login → `/auth`
2. Browse feed → click **Interested** or **Pass** → `/feed`
3. Post your own project → Dashboard → My Projects → `/dashboard`
4. See who's interested → Dashboard → Interested Users → click **Accept**
5. Accepted match reveals applicant's email for off-platform contact
6. Ask questions on any project → project detail page → `/projects/:id`
