import sqlite3
import time

conn = sqlite3.connect('cutoffs.db')
cursor = conn.cursor()

# Test parameters: SC category student with main CRL = 15000, SC rank = 1500
category = 'SC'
gender = 'Gender-Neutral'
is_female = 0
main_crl = 15000
main_cat = 1500
adv_crl = 5000
adv_cat = 500

start_time = time.time()

# The query will join and pivot by year
# We will filter by the user's category (or OPEN) and gender
query = """
SELECT
  c.counselling_board,
  c.institute_id,
  i.name as institute_name,
  i.type as institute_type,
  c.program_id,
  p.name as program_name,
  c.quota,
  c.category,
  c.gender,
  c.rank_type,
  MAX(CASE WHEN c.year = 2025 THEN c.closing_rank END) as closing_2025,
  MAX(CASE WHEN c.year = 2024 THEN c.closing_rank END) as closing_2024,
  MAX(CASE WHEN c.year = 2023 THEN c.closing_rank END) as closing_2023,
  MAX(CASE WHEN c.year = 2025 THEN c.round_no END) as last_round_2025,
  MAX(CASE WHEN c.year = 2024 THEN c.round_no END) as last_round_2024,
  MAX(CASE WHEN c.year = 2023 THEN c.round_no END) as last_round_2023
FROM cutoffs c
JOIN institutes i ON c.institute_id = i.id
JOIN programs p ON c.program_id = p.id
WHERE
  -- Gender filter
  (c.gender = 'Gender-Neutral' OR (? = 1 AND c.gender = 'Female-only (including Supernumerary)'))
  -- Category filter
  AND (c.category = 'OPEN' OR c.category = ?)
  -- Eligible quota types (will filter state specific in Python/JS or basic check here)
  AND c.quota IN ('AI', 'All India', 'HS', 'Home State', 'OS', 'Other State', 'GO', 'JK', 'LA', 'Jammu & Kashmir (UT)', 'Ladakh (UT)')
GROUP BY c.counselling_board, c.institute_id, c.program_id, c.quota, c.category, c.gender, c.rank_type
"""

cursor.execute(query, (is_female, category))
rows = cursor.fetchall()
elapsed = time.time() - start_time

print(f"Query executed in {elapsed:.3f} seconds. Returned {len(rows)} grouped rows.")

# Let's see some samples
for row in rows[:10]:
    print(row)
