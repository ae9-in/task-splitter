# TaskSplitter

> **AI-powered project requirement decomposition tool**  
> Break vague requirement documents into structured Modules → Features → Tasks in seconds.

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18 + TypeScript + Vite 5      |
| Backend   | Node.js + Express + TypeScript      |
| Database  | MongoDB (via Mongoose)              |
| AI        | Anthropic Claude (or OpenAI GPT-4o) |
| Auth      | JWT (httpOnly cookie)               |

---

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Anthropic API key (or OpenAI API key)

---

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
ADMIN_EMAIL=admin@tasksplitter.com
ADMIN_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_change_this_in_production
MONGODB_URI=mongodb://localhost:27017/tasksplitter
ANTHROPIC_API_KEY=sk-ant-api03-...
AI_PROVIDER=anthropic          # or: openai
PORT=5000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Then:

```bash
npm install
npm run dev     # runs on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev     # runs on http://localhost:5173
```

---

## Usage

1. Navigate to `http://localhost:5173` — you'll be redirected to the login page
2. Sign in with the credentials from your `.env` file
3. Click **New Project** → paste a requirement document → click **Split Requirements →**
4. Review the AI-generated breakdown (Modules → Features → Tasks)
5. Inline-edit any title, description, priority, or task type
6. Changes autosave after 1.5 seconds
7. Export as **Markdown**, **JSON**, or **CSV** from the project header

---

## API Reference

### Auth
| Method | Endpoint             | Description          |
|--------|----------------------|----------------------|
| POST   | `/api/auth/login`    | Login, sets JWT cookie |
| POST   | `/api/auth/logout`   | Clears JWT cookie    |
| GET    | `/api/auth/verify`   | Check session        |

### Projects
| Method | Endpoint                      | Description                   |
|--------|-------------------------------|-------------------------------|
| GET    | `/api/projects`               | List all projects (summaries) |
| POST   | `/api/projects`               | Create new project            |
| GET    | `/api/projects/:id`           | Get full project              |
| PATCH  | `/api/projects/:id`           | Update title/description/status |
| DELETE | `/api/projects/:id`           | Delete project                |
| POST   | `/api/projects/:id/split`     | Trigger AI decomposition      |
| PUT    | `/api/projects/:id/structure` | Save full module structure    |
| GET    | `/api/projects/:id/export`    | Export (`?format=json\|markdown\|csv`) |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable            | Required | Description                        |
|---------------------|----------|------------------------------------|
| `ADMIN_EMAIL`       | ✅        | Admin login email                  |
| `ADMIN_PASSWORD`    | ✅        | Admin login password               |
| `JWT_SECRET`        | ✅        | Secret for signing JWTs            |
| `MONGODB_URI`       | ✅        | MongoDB connection string          |
| `ANTHROPIC_API_KEY` | Conditional | Required if `AI_PROVIDER=anthropic` |
| `OPENAI_API_KEY`    | Conditional | Required if `AI_PROVIDER=openai`    |
| `AI_PROVIDER`       | ✅        | `anthropic` or `openai`            |
| `PORT`              | ❌        | Server port (default: 5000)        |
| `FRONTEND_URL`      | ❌        | CORS origin (default: localhost:5173) |

---

## Project Structure

```
tasksplitter/
├── frontend/               # React + TypeScript (Vite)
│   └── src/
│       ├── api/            # Axios API calls
│       ├── components/     # Reusable UI components
│       ├── context/        # Auth + Project React context
│       ├── hooks/          # useAutosave, useDebounce
│       ├── pages/          # Login, Dashboard, New, Detail
│       ├── styles/         # globals.css (design system)
│       ├── types/          # Shared TypeScript interfaces
│       └── utils/          # formatters, exportHelpers
│
└── backend/                # Node.js + Express + TypeScript
    └── src/
        ├── config/         # MongoDB connection
        ├── controllers/    # Auth + Project controllers
        ├── middleware/      # JWT auth middleware
        ├── models/         # Mongoose schemas
        ├── routes/         # Express routes
        └── services/       # AI decomposition service
```
