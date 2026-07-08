
-- D1: Top 10 most active users in the last 7 days, ranked by total interactions (views + replies + reactions)

SELECT
    u.id AS user_id,
    u.name,
    u.email,
    COUNT(i.id) AS total_interactions
FROM users u
JOIN interactions i ON i.user_id = u.id
WHERE i.created_at >= NOW() - INTERVAL '7 days'
GROUP BY u.id, u.name, u.email
ORDER BY total_interactions DESC
LIMIT 10;



-- D2: For a given user_id, return all posts from users they  interact with most, ordered by interaction frequency descending, limited to posts from the last 30 days.

WITH interaction_counts AS (
    SELECT
        i.post_id,
        p.user_id AS author_id,
        COUNT(*) OVER (PARTITION BY p.user_id) AS author_interaction_count
    FROM interactions i
    JOIN posts p ON p.id = i.post_id
    WHERE i.user_id = :target_user_id   -- the given user
),
ranked_authors AS (
    SELECT DISTINCT author_id, author_interaction_count
    FROM interaction_counts
)
SELECT
    p.id AS post_id,
    p.user_id AS author_id,
    p.text_content,
    p.created_at,
    ra.author_interaction_count
FROM posts p
JOIN ranked_authors ra ON ra.author_id = p.user_id
WHERE p.created_at >= NOW() - INTERVAL '30 days'
ORDER BY ra.author_interaction_count DESC, p.created_at DESC;


-- D3: Posts viewed more than 100 times but with zero reactions. Return post_id, author_id, view_count, created_at.

SELECT
    p.id AS post_id,
    p.user_id AS author_id,
    COUNT(*) FILTER (WHERE i.type = 'view') AS view_count,
    p.created_at
FROM posts p
JOIN interactions i ON i.post_id = p.id
GROUP BY p.id, p.user_id, p.created_at
HAVING
    COUNT(*) FILTER (WHERE i.type = 'view') > 100
    AND COUNT(*) FILTER (WHERE i.type = 'reaction') = 0;


--- D4: Detect potential spam — users who created more than 20 posts in the last 24 hours. Return email and post count.

SELECT
    u.email,
    COUNT(p.id) AS post_count
FROM users u
JOIN posts p ON p.user_id = u.id
WHERE p.created_at >= NOW() - INTERVAL '24 hours'
GROUP BY u.id, u.email
HAVING COUNT(p.id) > 20
ORDER BY post_count DESC;
