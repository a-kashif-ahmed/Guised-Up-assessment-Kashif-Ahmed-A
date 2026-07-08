# Technical Solution Document — Real Connections Feed
**Guised Up | Full-Stack Assessment**

## 1. Overview

The Real Connections Feed ranks content by authenticity, relationship depth, semantic relevance, and recency — explicitly *not* by engagement metrics (likes/shares/comments). This document covers architecture, schema, ranking logic, API design, and trade-offs.

## 2. System Architecture

```
                        ┌─────────────────────┐
                        │   React Native App    │
                        │  (Feed Screen, Search) │
                        └──────────┬────────────┘
                                   │ HTTPS (JSON)
                                   ▼
                        ┌─────────────────────┐
                        │   Laravel API Layer   │
                        │  (Sanctum Auth, CRUD, │
                        │   Feed Orchestration)  │
                        └──────────┬────────────┘
                     ┌─────────────┼──────────────┐
                     ▼             ▼              ▼
              ┌───────────┐ ┌────────────┐ ┌─────────────┐
              │ PostgreSQL │ │  Python     │ │  pgvector    │
              │ (relational│ │  Embedding  │ │  (extension  │
              │  data:     │ │  Service    │ │  on same     │
              │  users,    │ │  (Flask/    │ │  Postgres    │
              │  posts,    │ │  FastAPI —  │ │  DB, stores  │
              │ interactions)│  generates  │ │  vectors)    │
              └───────────┘ │  embeddings)│ └─────────────┘
                             └────────────┘
```

**Flow for a new post:** RN app → Laravel `POST /api/posts` → Laravel saves post row → Laravel calls Python embedding service (internal HTTP call) → Python returns a vector → Laravel stores vector in `post_embeddings` (pgvector column) alongside the post.

**Flow for feed/search:** RN app → Laravel → Laravel queries Postgres (relational filters + interaction stats) and pgvector (semantic similarity) → Laravel combines and ranks → returns paginated JSON.

## 3. Why pgvector (not Pinecone/Weaviate/Qdrant)

- **One database, not two.** Relational data (users, posts, interactions) and vector data live in the same Postgres instance — fewer moving parts, simpler local dev, no extra service to run or pay for.
- **Good enough at this scale.** For a take-home / early-stage product, pgvector's performance is more than sufficient. A managed vector DB (Pinecone, Qdrant) becomes worth the operational overhead at much larger scale (tens of millions of vectors) — not needed here.
- **SQL joins for free.** Because vectors sit in the same DB as relational data, we can combine "posts similar to X" with "posts from people I interact with" in a single query, instead of stitching results from two systems.

**Trade-off acknowledged:** if Guised Up scales to massive vector volume, a dedicated vector DB with more advanced indexing (HNSW at scale, sharding) would eventually be worth migrating to.

## 4. Embeddings — Real Plan vs. Mock Used Here

**Mocked for this submission:** a deterministic hash-based pseudo-embedding (fixed-length numeric vector derived from a hash of the post text) so the pipeline is fully wired end-to-end without needing API credits or heavy local models.

**Real implementation (documented, not built):** use `sentence-transformers` (e.g. `all-MiniLM-L6-v2`, 384 dimensions, runs locally, free, no API key) inside the Python service. Swapping the mock for the real model is a one-function change — `generate_embedding(text)` — because the rest of the pipeline only cares that it gets back a fixed-length float array.

## 5. Database Schema

```sql
users
  id (PK)
  name
  email (unique)
  created_at

posts
  id (PK)
  user_id (FK -> users.id)
  text_content
  image_url (nullable)
  authenticity_score (float, computed at creation — see Section 7)
  created_at

post_embeddings
  post_id (PK, FK -> posts.id)
  embedding (vector(384))   -- pgvector column

interactions
  id (PK)
  user_id (FK -> users.id)          -- the actor
  post_id (FK -> posts.id)
  type (enum: 'view', 'reply', 'reaction')
  created_at

-- Indexes
CREATE INDEX idx_interactions_user_created ON interactions(user_id, created_at);
CREATE INDEX idx_interactions_post ON interactions(post_id);
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at);
CREATE INDEX idx_embeddings_vector ON post_embeddings USING ivfflat (embedding vector_cosine_ops);
```

**Relationships:** `users 1—N posts`, `users 1—N interactions`, `posts 1—N interactions`, `posts 1—1 post_embeddings`.

**Why `interactions` is one table, not three:** views/replies/reactions share the same shape (who, on what, when). One table with a `type` enum keeps queries simple and makes the "relationship depth" signal (Section 7) a single aggregation instead of three joins.

## 6. API Design

All endpoints require `Authorization: Bearer {sanctum_token}` except registration/login.

### `POST /api/posts`
Request:
```json
{ "text_content": "string", "image_url": "string|null" }
```
Response `201`:
```json
{ "id": 1, "text_content": "...", "image_url": null, "created_at": "..." }
```
Server-side: saves post → calls embedding service → stores vector.

### `GET /api/feed?page=1`
Response `200`:
```json
{
  "data": [
    { "id": 1, "user": {"id": 2, "name": "..."}, "text_content": "...",
      "created_at": "...", "score": 0.83 }
  ],
  "current_page": 1,
  "per_page": 20,
  "has_more": true
}
```

### `GET /api/search?q={query}`
Response `200`: top 10 posts ranked by cosine similarity between the query's embedding and each post's embedding.

### `POST /api/interactions`
Request:
```json
{ "post_id": 1, "type": "reaction" }
```
Response `201`: `{ "logged": true }`

**Auth strategy:** Laravel Sanctum, token-based (mobile-friendly, no CSRF/cookie complexity). Two seeded test users for local testing.

## 7. Feed Ranking Algorithm

### Plain English

For each candidate post, we compute four independent signals and combine them into one score:

1. **Authenticity** — a score computed at post-creation time from simple heuristics (e.g. text length/genuineness proxy, absence of heavy image filters if metadata is available). Higher = more authentic.
2. **Relationship depth** — how much the *viewing user* has interacted with the *post's author* historically (views + replies + reactions, weighted so replies/reactions count more than passive views). Normalized against that user's max interaction count with anyone, so it's relative, not absolute.
3. **Semantic similarity** — cosine similarity between the post's embedding and a "user interest vector" (built by averaging embeddings of posts the user has recently engaged with).
4. **Time decay** — an exponential decay so newer posts get a boost, but a highly relevant older post can still outrank a mediocre brand-new one.

Final score = weighted sum, weights tunable (defaults below).

### Pseudocode

```
function rank_feed(user, candidate_posts):
    user_interest_vector = average_embedding(
        posts_user_recently_interacted_with(user, limit=20)
    )

    for post in candidate_posts:
        authenticity   = post.authenticity_score               # 0-1, precomputed
        relationship   = relationship_depth(user, post.author)  # 0-1, normalized
        semantic       = cosine_similarity(post.embedding, user_interest_vector) # 0-1
        age_hours      = hours_since(post.created_at)
        time_decay     = exp(-DECAY_RATE * age_hours)            # 0-1

        post.score = (
            0.25 * authenticity +
            0.30 * relationship +
            0.30 * semantic +
            0.15 * time_decay
        )

    return sort(candidate_posts, by=score, descending=True)

function relationship_depth(user, author):
    interactions = interactions_between(user, author, last_days=90)
    weighted = interactions.views * 1 + interactions.replies * 3 + interactions.reactions * 2
    return normalize(weighted, against=user.max_weighted_interaction_with_anyone)
```

**Note on `DECAY_RATE`:** tuned so a post loses ~50% of its "freshness boost" after ~48 hours — recent but not a strict reverse-chronological feed.

## 8. AI Agentic Tools Used

- **Claude** — used to think through architecture options, draft this TSD, and scaffold the Laravel/Python/SQL boilerplate quickly so more time could go into the ranking logic and schema design (the parts that actually needed judgment).
- Iterated with Claude on the ranking formula specifically to avoid the "just sort by engagement" trap the brief explicitly warns against.

## 9. Trade-offs & Assumptions

- Embeddings are mocked (hash-based) due to time constraints; real model swap documented in Section 4.
- Authenticity score is a simplified heuristic, not an ML classifier — a real version would likely use image-metadata analysis (filter detection) and text-genuineness modeling.
- Ranking weights are reasonable defaults, not A/B tested — in production these would be tuned against real engagement/retention data (ironically, without using raw engagement as the ranking signal itself).
- pgvector chosen for simplicity at this scale; noted as a future migration candidate if vector volume grows dramatically.
