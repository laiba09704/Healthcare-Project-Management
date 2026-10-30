# SmartCare PMS - Healthcare Project Management System

Comprehensive, full-stack Healthcare Project Management platform featuring all 6 project phases with separated **frontend** and **backend** architecture.

---

## 📁 Project Architecture

```
Healthcare Project Management/
├── frontend/                  # React 19 + Vite Application
│   ├── public/                # Static public assets
│   ├── src/
│   │   ├── components/        # Modules 01 to 06 UI components
│   │   ├── data/              # Core business logic & models
│   │   ├── services/          # API services connecting to backend
│   │   ├── App.jsx            # Main app container & sync
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Design system & color scheme
│   ├── index.html             # HTML entry
│   ├── vite.config.js         # Vite config with backend proxy (/api -> :5000)
│   └── package.json
│
├── backend/                   # Express.js REST API Server
│   ├── data/
│   │   ├── seedData.json      # Default project baseline seed data
│   │   └── projectData.json   # Persistent JSON database
│   ├── server.js              # REST endpoints & data persistence
│   └── package.json
│
├── package.json               # Root workspace orchestrator
└── README.md
```

---

## 🚀 Getting Started

### 1. Install Dependencies
To install dependencies for both frontend and backend at once:
```bash
npm run install:all
```
Or individually:
```bash
cd frontend && npm install
cd ../backend && npm install
```

### 2. Run the Development Servers
From the root directory:

- **Run Frontend (Vite @ http://localhost:5173)**:
  ```bash
  npm run dev:frontend
  ```
- **Run Backend (Express @ http://localhost:5000)**:
  ```bash
  npm run dev:backend
  ```

---

## 🔌 Backend REST APIs

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status check |
| `GET` | `/api/project` | Fetch entire project state |
| `POST` | `/api/project/sync` | Persist full state updates |
| `POST` | `/api/project/reset` | Reset project to baseline seed |
| `GET`/`PUT` | `/api/charter` | Project charter details |
| `GET`/`POST`/`PUT`/`DELETE` | `/api/activities` | Activities & schedule CRUD |
| `GET`/`POST` | `/api/requirements` | Scope & requirements |
| `GET`/`POST` | `/api/defects` | Quality defects tracker |
| `GET`/`POST` | `/api/risks` | Risk register & PDPC |
| `GET` | `/api/reports/summary` | EVM & executive KPI report |
