# Guised Up — Real Connections Feed (Take-Home Assessment)

A social feed that ranks posts by authenticity and real relationships instead of likes and shares, with natural-language search powered by AI embeddings.

Full write-up of the design decisions is in [`TSD.md`](./TSD.md). This README just covers how to run everything.

## What's in this repo

```
TSD.md               — Technical Solution Document (architecture, schema, ranking logic)
sql/queries.sql        — Required SQL queries (D1–D4)
backend/               — Laravel API (migrations, models, controllers, routes, tests)
embedding-service/      — Python service that turns text into AI embeddings
mobile-ts/              — React Native app (Expo, TypeScript)
```

## How to run it

### 1. Database — PostgreSQL with pgvector

Easiest way on any OS (avoids compiling anything) is Docker:
```bash
docker run --name guisedup-pg -e POSTGRES_PASSWORD=yourpassword -e POSTGRES_DB=guisedup -p 5432:5432 -d pgvector/pgvector:pg16
```

### 2. Laravel backend
```bash
cd backend
composer install
cp .env.example .env
```
Edit `.env` and set:
```
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=guisedup
DB_USERNAME=postgres
DB_PASSWORD=yourpassword
SESSION_DRIVER=database
```
Then:
```bash
php artisan key:generate
php artisan migrate
php artisan serve
```

### 3. Embedding service (Python)
```bash
cd embedding-service
pip install flask sentence-transformers
python app.py   # runs on http://localhost:5001
```
The first run downloads the AI model (`all-MiniLM-L6-v2`) automatically — this only happens once.

### 4. Mobile app (Expo + TypeScript)
```bash
cd mobile-ts
npm install
npx expo start
```
Update the API URL in `constants.ts` to match how you're running the backend:
- Android emulator → `http://10.0.2.2:8000/api`
- iOS simulator → `http://localhost:8000/api`
- Physical device → your computer's LAN IP, e.g. `http://192.168.1.23:8000/api`

### 5. Tests
```bash
cd backend
php artisan test
```

## Honest notes on what's simplified

- **Authenticity scoring** is a simple starting heuristic (e.g. text length), not a trained model. Documented in TSD Section 9.
- **Ranking weights** are sensible defaults, not yet tuned against real usage data.
- Everything else — the embeddings, the database, the ranking logic — is real and working, not mocked.

## AI tools used

Both Claude and ChatGPT were used throughout — for architecture discussion, writing boilerplate faster, and debugging real issues hit while actually running the project (missing config files, a corrupted screen component, unregistered API routes, a missing database table, and a missing native dependency for animations). Details are in TSD Section 8.
