# AI Code Auditor & PR Assistant

A SaaS platform where developers submit code snippets or GitHub repository URLs for AI-powered code analysis. The Spring Boot backend orchestrates static analysis using Google Gemini Flash models via the Spring AI framework to evaluate code structure, flag security risks (OWASP Top 10), estimate time/space complexity (O(N) notation), and auto-generate pull request descriptions with optimized refactored code.

## Architecture

```
┌────────────────────────────────┐       ┌─────────────────────────────────┐
│     React JS + Tailwind CSS    │       │     Spring Boot Backend (Java)  │
│  - Code Editor (Monaco Editor) │ ◄───► │  - Spring AI (Gemini Flash API) │
│  - SSE Streaming for results   │       │  - Async Pipeline Processing    │
└────────────────────────────────┘       └────────────────┬────────────────┘
                                                          │
                                         ┌────────────────┴────────────────┐
                                         │       PostgreSQL Database       │
                                         │  - Audit History & Metrics      │
                                         │  - User Authentication (JWT)    │
                                         └─────────────────────────────────┘
```

| Layer     | Technology                                         | Purpose                                    |
|-----------|---------------------------------------------------|--------------------------------------------|
| Frontend  | React, TypeScript, Tailwind CSS v4, Monaco Editor | IDE-like interface with syntax highlighting |
| Backend   | Java 17+, Spring Boot 3, Spring AI 1.0.0          | REST API, JWT auth, AI orchestration       |
| AI Layer  | Google Gemini 2.0 Flash (via Spring AI)            | Code analysis, vulnerability scanning      |
| Database  | PostgreSQL 16                                      | Audit logs, user data, metrics             |

## Prerequisites

- **Java 17+** and **Maven 3.9+**
- **Node.js 18+** and **npm 9+**
- **PostgreSQL 16** (or Docker)
- **At least one free AI API key:**
  | Provider | Model | Get Free Key |
  |----------|-------|-------------|
  | Google Gemini | `gemini-2.0-flash` | [aistudio.google.com](https://aistudio.google.com/) |
  | Groq | `llama-3.3-70b-versatile` | [console.groq.com](https://console.groq.com/) |

## Quick Start

### 1. Start PostgreSQL

Using Docker Compose:
```bash
docker-compose up -d
```

Or create the database manually:
```sql
CREATE DATABASE code_auditor;
```

### 2. Set Environment Variables

```bash
# At least one AI provider is required
export GEMINI_API_KEY=your-gemini-key-here    # from aistudio.google.com
export GROQ_API_KEY=your-groq-key-here        # from console.groq.com  (optional)

# Optional (defaults shown)
export DB_USERNAME=postgres
export DB_PASSWORD=postgres
export JWT_SECRET_KEY=your-base64-encoded-256bit-secret
```

### 3. Start the Backend

```bash
cd backend
mvn spring-boot:run
```

The backend starts on `http://localhost:8080`.

### 4. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend starts on `http://localhost:5173`.

### 5. Open the App

Navigate to `http://localhost:5173` in your browser.

## Features

- 🔐 **JWT Authentication** — Secure user registration and login
- 📝 **Monaco Code Editor** — VS Code-like editing experience with 60+ language support
- 🛡️ **Security Scanning** — OWASP Top 10 vulnerability detection
- ⏱️ **Complexity Analysis** — Big-O time and space complexity estimation
- ♻️ **Code Refactoring** — AI-generated optimized code with diff view
- 📋 **PR Description Generation** — Auto-generated professional pull request summaries
- 📊 **Quality Scoring** — 0-100 code quality score with visual gauge
- 📜 **Audit History** — Track and review past code analyses
- 🌊 **Streaming Results** — Real-time AI response streaming via SSE

## API Endpoints

### Authentication
| Method | Endpoint             | Description         |
|--------|---------------------|---------------------|
| POST   | `/api/auth/register` | Register new user   |
| POST   | `/api/auth/login`    | Login, get JWT      |
| POST   | `/api/auth/refresh`  | Refresh access token|
| POST   | `/api/auth/logout`   | Logout (revoke)     |

### Code Audit
| Method | Endpoint                    | Description                    |
|--------|----------------------------|--------------------------------|
| POST   | `/api/audit/analyze`        | Full code analysis             |
| POST   | `/api/audit/stream`         | Streaming analysis (SSE)       |
| POST   | `/api/audit/pr-description` | Generate PR description        |
| GET    | `/api/audit/history`        | Get audit history (paginated)  |
| GET    | `/api/audit/{id}`           | Get specific audit result      |

## License

MIT
