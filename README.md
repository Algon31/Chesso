# ♟️ Chesso - Real-Time Multiplayer Chess

A production-ready, full-stack real-time multiplayer chess application orchestrated with **Docker Compose**, powered by **Redis-backed Rate Limiting**, and automated via a **GitHub Actions CI/CD** pipeline publishing multi-stage images to **GitHub Container Registry (GHCR)**.

---

## 🚀 Features

* ♟️ **Real-Time Multiplayer Gameplay**: Live move synchronization via Socket.IO.
* 🛡️ **Redis-Backed Rate Limiting**: Distributed brute-force and DDoS protection with graceful in-memory fallback.
* 🎵 **Web Audio Sound Effects**: Zero-latency native audio for moves, captures, checks, invalid moves, and victory/defeat.
* 🔒 **Smart Legal Move Validation**: Real-time illegal piece placement rejection, auto-snapback, legal move dots, and King-in-check indicators.
* ⏱️ **Live Chess Clock**: Synchronized countdown timers with automatic timeout winner declaration.
* 🏳️ **Resignation & Draw Handlers**: Support for checkmate, stalemate, threefold repetition, insufficient material, and resignation.
* 🔐 **Secure Authentication**: Google OAuth 2.0 & JWT-based authentication with persistent user profiles.
* 🐳 **Multi-Stage Dockerization**: Highly optimized, lightweight container images for frontend (Nginx Alpine) and backend (Node.js Alpine with non-root security).
* 🔄 **GitHub Actions CI/CD**: Automated linting, test suites, and Docker image publishing to GHCR.

---

## 🛠️ Tech Stack

### 💻 Core & Languages
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

### 🎨 Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)

### ⚙️ Backend & Real-time
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![Chess.js](https://img.shields.io/badge/Chess.js-2C3E50?style=for-the-badge)

### 🗄️ Database & In-Memory Cache
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

### 🚢 DevOps & Containerization
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Docker Compose](https://img.shields.io/badge/Docker_Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)

---

## 🏗️ 4-Service Architecture

```mermaid
graph TD
    Client[Browser / User] -->|HTTP / SPA & API| FE[1. Frontend - Nginx + React]
    Client -->|WebSockets / Socket.IO| BE[2. Backend - Express & Socket.IO]
    FE -->|Proxy API Calls| BE
    BE -->|Token Bucket Rate Limiting| RD[(3. Redis Rate Limiter)]
    BE -->|User & Match Records| DB[(4. MongoDB Database)]
```

---

## 📂 Project Structure

```text
Chesso/
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # GitHub Actions CI/CD Pipeline (GHCR publish)
│
├── frontend/
│   ├── src/                   # React components, pages, sounds & auth context
│   ├── nginx.conf             # Production Nginx SPA & reverse proxy config
│   ├── Dockerfile             # Multi-stage frontend Dockerfile (Node -> Nginx)
│   └── package.json
│
├── backend/
│   ├── middleware/            # Rate limiting (Redis) & JWT auth verification
│   ├── routes/                # Auth & user API routes
│   ├── Sockets/               # Socket.IO game management & timers
│   ├── utilites/              # Pure chess logic, Redis client, config
│   ├── tests/                 # Automated unit tests for rules & rate limiting
│   ├── Dockerfile             # Multi-stage backend Dockerfile (non-root)
│   ├── server.js              # Express entry point
│   └── package.json
│
├── docker-compose.yml         # 4-service stack orchestration
├── .env.example               # Root environment variables template
└── README.md
```

---

## 🐳 Quick Start with Docker Compose (Recommended)

Run the entire 4-service stack locally with a single command:

### 1. Clone the repository
```bash
git clone https://github.com/Algon31/Chesso.git
cd Chesso
```

### 2. Configure Environment
```bash
cp .env.example .env
```

### 3. Launch the Stack
```bash
docker compose up --build -d
```

| Service | URL / Port | Purpose |
| :--- | :--- | :--- |
| **Frontend** | [http://localhost:80](http://localhost:80) | Nginx serving React SPA |
| **Backend** | [http://localhost:3000](http://localhost:3000) | Express & Socket.IO API |
| **Redis** | `localhost:6379` | Rate limiting in-memory store |
| **MongoDB** | `localhost:27017` | Persistent database |

---

## 💻 Local Development Setup (Without Docker)

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing & Validation

### Run Backend Unit Tests
Executes 8 automated tests covering chess rule enforcement (valid moves, illegal move rejections, checkmate, stalemate, insufficient material, promotion, timeouts, resignations, and Redis rate limiters):

```bash
cd backend
npm test
```

### Run Frontend Production Build
```bash
cd frontend
npm run build
```

---

## 🔄 GitHub Actions CI/CD Pipeline

The repository includes a GitHub Actions workflow (`.github/workflows/ci-cd.yml`):
1. **Automated Testing & Linting**: Spawns an ephemeral Redis service in GitHub Actions and runs both frontend build validation and backend unit test suites on every `push` and `pull_request`.
2. **Multi-Stage Docker Builds**: Builds optimized Docker images for frontend and backend with GitHub Actions cache backend (`type=gha`).
3. **GHCR Publishing**: Automatically tags and pushes images to **GitHub Container Registry (`ghcr.io`)** on every merge to `main`.

---

## 👨‍💻 Author

**Ravi Bhuvan**
* GitHub: [@Algon31](https://github.com/Algon31)
* LinkedIn: [Ravi Bhuvan](https://www.linkedin.com/in/ravi-bhuvan-985399286/)
