# AI Chatbot

A full-stack chatbot with a **React** UI and a **FastAPI** backend with **PostgreSQL**. Chat completions go through **LangChain** to **Groq**.

```
┌───────────────────┐
│     React App     │
│  localhost:4200   │
└─────────┬─────────┘
          │ REST (Fetch)
          ▼
┌───────────────────┐
│    FastAPI API    │
│  localhost:8000   │
└────┬──────────┬───┘
     │          │ LangChain
     ▼          ▼
┌────────────┐ ┌───────────────┐
│ PostgreSQL │ │ Groq LLM API  │
│    5432    │ │openai/gpt-oss-│
└────────────┘ └───────────────┘
```

```
.
├── backend/           # FastAPI + SQLAlchemy (asyncpg) + LangChain + Groq
├── frontend/          # React + Vite + TypeScript chatbot UI
├── Dockerfile         # Multi-stage: backend (Uvicorn) and frontend (nginx)
└── docker-compose.yml
```

---

## Groq API key

The app needs a Groq key (not Hugging Face). `llama-3.3-70b-versatile` is retired for free/developer accounts.

1. Sign up at [https://console.groq.com](https://console.groq.com)
2. Create a key at [https://console.groq.com/keys](https://console.groq.com/keys)
3. Copy `backend/.env.example` to `backend/.env` and set:

```
GROQ_API_KEY=gsk_your_key_here
GROQ_MODEL=openai/gpt-oss-20b
```

`GROQ_MODEL` is optional; the default is `openai/gpt-oss-20b`.

---

## Run with Docker

From the project root:

```bash
cp backend/.env.example backend/.env   # then add GROQ_API_KEY
docker compose up --build
```

| Service  | URL |
|----------|-----|
| UI       | http://localhost:4200 |
| API      | http://localhost:8000 |
| Swagger  | http://localhost:8000/api/docs/ |

The UI calls `http://localhost:8000`, so keep the API on port **8000**.

```bash
docker compose down
```

---

## Run locally

**Backend** (Python 3.10+):

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .\.venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env               # set GROQ_API_KEY
python manage.py migrate
python manage.py runserver 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm start
```

App: http://localhost:4200

---

## Tech stack

| Layer    | Technology |
|----------|------------|
| Backend  | Django, Django REST Framework, Gunicorn, SQLite |
| AI/LLM   | LangChain, Groq (`openai/gpt-oss-20b`) |
| Frontend | Angular 21, SCSS, HttpClient |
| Deploy   | Docker, docker compose, nginx |
