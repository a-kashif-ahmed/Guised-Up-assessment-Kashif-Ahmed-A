# Guised Up — Real Connections Feed (Take-Home Assessment)

Full technical reasoning lives in [`/docs/TSD.md`](./docs/TSD.md). This README covers setup.

## Structure

```
/docs/TSD.md              — Technical Solution Document
/sql/queries.sql           — D1–D4 SQL queries
/backend/                  — Laravel app pieces (migrations, models, controllers, routes, tests)
/embedding-service/         — Python Flask microservice (mocked embeddings)
/mobile/                   — React Native Feed Screen
```

## Setup

### 1. Database
Requires PostgreSQL with the `pgvector` extension available.
```bash
createdb guisedup
# migrations enable the extension automatically on first run
php artisan migrate
```

### 2. Laravel backend
```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed   # seeds 2 test users
php artisan serve
```

### 3. Embedding service (Python)
```bash
cd embedding-service
pip install flask
python app.py   # runs on http://localhost:5001
```

### 4. Mobile app
```bash
cd mobile
npm install
npx react-native run-ios   # or run-android
```
Set `API_BASE_URL` in your environment to point at the running Laravel instance.

### 5. Tests
```bash
php artisan test
```

## What's mocked / simplified (and why)

- **Embeddings**: hash-based deterministic mock instead of a real model, to avoid needing API credits or heavy local downloads under the time limit. Swap is a single function — see `embedding-service/app.py` and TSD Section 4.
- **Authenticity score**: simple heuristic (text length + image presence), not an ML classifier — documented as a known simplification in the TSD.
- **Vector DB**: pgvector (extension inside the same Postgres instance) rather than a separate managed service — reasoning in TSD Section 3.

## AI tools used

Claude was used throughout: architecture/ranking-algorithm design discussion, TSD drafting, and scaffolding the Laravel/Python/SQL boilerplate so implementation time could focus on the ranking logic and schema design rather than repetitive setup.
