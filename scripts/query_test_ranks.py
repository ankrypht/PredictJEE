import sqlite3
import time

conn = sqlite3.connect('cutoffs.db')
cursor = conn.cursor()

# Test parameters: SC category student
# Main CRL = 60000, Main SC Rank = 4000
# Adv CRL = 15000, Adv SC Rank = 1000 (Let's assume these are entered)
params = {
    'is_female': 0,
    'category': 'SC',
    'jee_main_crl': 60000,
    'jee_main_cat': 4000,
    'jee_adv_crl': 15000,
    'jee_adv_cat': 1000
}

start_time = time.time()

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
  (c.gender = 'Gender-Neutral' OR (:is_female = 1 AND c.gender = 'Female-only (including Supernumerary)'))
  -- Category filter
  AND (c.category = 'OPEN' OR c.category = :category)
  -- Eligible quota types
  AND c.quota IN ('AI', 'All India', 'HS', 'Home State', 'OS', 'Other State', 'GO', 'JK', 'LA', 'Jammu & Kashmir (UT)', 'Ladakh (UT)')
  -- Rank evaluations
  AND (
    (i.type = 'IIT' AND c.rank_type = 'CRL' AND :jee_adv_crl IS NOT NULL AND c.closing_rank >= :jee_adv_crl * 0.9) OR
    (i.type = 'IIT' AND c.rank_type = 'Category_Rank' AND :jee_adv_cat IS NOT NULL AND c.closing_rank >= :jee_adv_cat * 0.9) OR
    (i.type != 'IIT' AND c.rank_type = 'CRL' AND :jee_main_crl IS NOT NULL AND c.closing_rank >= :jee_main_crl * 0.9) OR
    (i.type != 'IIT' AND c.rank_type = 'Category_Rank' AND :jee_main_cat IS NOT NULL AND c.closing_rank >= :jee_main_cat * 0.9)
  )
GROUP BY c.counselling_board, c.institute_id, c.program_id, c.quota, c.category, c.gender, c.rank_type
"""

cursor.execute(query, params)
rows = cursor.fetchall()
elapsed = time.time() - start_time

print(f"Query executed in {elapsed:.3f} seconds. Returned {len(rows)} grouped rows.")

# Check the rank type distribution
crl_count = sum(1 for r in rows if r[9] == 'CRL')
cat_count = sum(1 for r in rows if r[9] == 'Category_Rank')
iit_count = sum(1 for r in rows if r[3] == 'IIT')
non_iit_count = sum(1 for r in rows if r[3] != 'IIT')

print(f"CRL rows: {crl_count}, Category Rank rows: {cat_count}")
print(f"IIT rows: {iit_count}, Non-IIT rows: {non_iit_count}")

# Print a few samples of IIT rows
print("\nIIT Samples:")
iit_samples = [r for r in rows if r[3] == 'IIT']
for r in iit_samples[:5]:
    print(r)

# Print a few samples of Non-IIT rows
print("\nNon-IIT Samples:")
non_iit_samples = [r for r in rows if r[3] != 'IIT']
for r in non_iit_samples[:5]:
    print(r)
