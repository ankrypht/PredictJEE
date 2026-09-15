import sqlite3
import json
import os
import re
import shutil
from datetime import datetime

# Resolve absolute paths relative to script location
script_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(script_dir, '..', 'cutoffs.db')
public_db_path = os.path.join(script_dir, '..', 'public', 'cutoffs.db')
overrides_path = os.path.join(script_dir, 'manual_state_overrides.json')
ts_output_path = os.path.join(script_dir, '..', 'src', 'data', 'instituteStateMap.ts')
meta_output_path = os.path.join(script_dir, '..', 'src', 'data', 'dbMetadata.ts')
terms_template_path = os.path.join(script_dir, '..', 'public', 'terms.template.html')
terms_output_path = os.path.join(script_dir, '..', 'public', 'terms.html')
json_output_path = os.path.join(script_dir, '..', 'institute_state_map.json')

# 1. Connect to cutoffs.db
if not os.path.exists(db_path):
    print(f"Error: Database file not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get years information
try:
    years_rows = cursor.execute('SELECT DISTINCT year FROM cutoffs ORDER BY year DESC').fetchall()
    all_years = [r[0] for r in years_rows if r[0] is not None]
except Exception as e:
    print(f"Error reading years from database: {e}")
    all_years = [2026, 2025, 2024]

latest_year = all_years[0] if all_years else 2026
counselling_year = latest_year + 1

print(f"Database contains years: {all_years}")
print(f"Latest Year: {latest_year}")
print(f"Counselling Year: {counselling_year}")

# Get institutes list
try:
    insts = cursor.execute('SELECT id, name, type FROM institutes ORDER BY id').fetchall()
except Exception as e:
    print(f"Error reading institutes from database: {e}")
    exit(1)

states_list = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    # UTs
    "Delhi", "Chandigarh", "Jammu & Kashmir", "Puducherry", "Dadra and Nagar Haveli and Daman and Diu",
    "Ladakh", "Lakshadweep", "Andaman and Nicobar Islands"
]
states_list.sort()

# Comprehensive city / hub keyword mapping with regex word boundaries
city_map_patterns = [
    (r'\b(diu|daman)\b', 'Dadra and Nagar Haveli and Daman and Diu'),
    (r'\b(delhi|new delhi)\b', 'Delhi'),
    (r'\bchandigarh\b', 'Chandigarh'),
    (r'\b(pondicherry|puducherry)\b', 'Puducherry'),
    (r'\b(leh|ladakh)\b', 'Ladakh'),
    (r'\b(visakhapatnam|vizag|tirupati|kurnool|chittoor|sri city|vijayawada)\b', 'Andhra Pradesh'),
    (r'\b(itanagar|nirjuli)\b', 'Arunachal Pradesh'),
    (r'\b(silchar|guwahati|tezpur|kokrajar)\b', 'Assam'),
    (r'\b(patna|bhagalpur)\b', 'Bihar'),
    (r'\b(raipur|bilaspur|bhilai|naya raipur)\b', 'Chhattisgarh'),
    (r'\bgoa\b', 'Goa'),
    (r'\b(surat|vadodara|gandhinagar|ahmedabad)\b', 'Gujarat'),
    (r'\b(kundli|sonepat|kurukshetra|kilohrad)\b', 'Haryana'),
    (r'\b(mandi|hamirpur|una)\b', 'Himachal Pradesh'),
    (r'\b(srinagar|jammu|katra|kashmir)\b', 'Jammu & Kashmir'),
    (r'\b(ranchi|dhanbad|jamshedpur|deoghar)\b', 'Jharkhand'),
    (r'\b(surathkal|dharwad|manipal|raichur|bangalore|bengaluru)\b', 'Karnataka'),
    (r'\b(calicut|kottayam|palakkad)\b', 'Kerala'),
    (r'\b(bhopal|indore|gwalior|jabalpur|sagar)\b', 'Madhya Pradesh'),
    (r'\b(bombay|nagpur|pune|aurangabad|mumbai)\b', 'Maharashtra'),
    (r'\b(imphal|senapati)\b', 'Manipur'),
    (r'\bshillong\b', 'Meghalaya'),
    (r'\baizawl\b', 'Mizoram'),
    (r'\bkohima\b', 'Nagaland'),
    (r'\b(rourkela|bhubaneswar)\b', 'Odisha'),
    (r'\b(jalandhar|ropar|bathinda|longowal)\b', 'Punjab'),
    (r'\b(jaipur|jodhpur|kota|ajmer)\b', 'Rajasthan'),
    (r'\bgangtok\b', 'Sikkim'),
    (r'\b(trichy|tiruchirappalli|madras|salem|kancheepuram|thanjavur|chennai)\b', 'Tamil Nadu'),
    (r'\b(warangal|hyderabad)\b', 'Telangana'),
    (r'\bagartala\b', 'Tripura'),
    (r'\b(allahabad|varanasi|amethi|lucknow|gorakhpur|kanpur|noida|greater noida|bhadohi|fursatganj)\b', 'Uttar Pradesh'),
    (r'\b(roorkee|haridwar)\b', 'Uttarakhand'),
    (r'\b(durgapur|shibpur|malda|kolkata|kharagpur|kalyani)\b', 'West Bengal'),
]

compiled_cities = [(re.compile(p, re.IGNORECASE), st) for p, st in city_map_patterns]

# Load overrides (now keyed by institute name)
manual_overrides = {}
if os.path.exists(overrides_path):
    with open(overrides_path, 'r', encoding='utf-8') as f:
        manual_overrides = json.load(f)
else:
    print(f"Warning: Overrides file not found at {overrides_path}. Starting fresh.")

# Build case-insensitive override map for robust matching
overrides_lookup = {k.strip().lower(): v for k, v in manual_overrides.items()}

overrides_changed = False
results = {}

for inst_id, name, inst_type in insts:
    state = None
    clean_name = re.sub(r'\s+', ' ', name).strip()
    clean_name_lower = clean_name.lower()

    # 1. Check manual overrides (by institute name)
    if clean_name_lower in overrides_lookup:
        state = overrides_lookup[clean_name_lower]

    # 2. Check special UT locations (e.g. Diu Campus before Vadodara matches Gujarat)
    if not state and re.search(r'\b(diu|daman)\b', clean_name, re.IGNORECASE):
        state = 'Dadra and Nagar Haveli and Daman and Diu'

    # 3. Check State / UT names with word boundaries (longest names first)
    if not state:
        for s in sorted(states_list, key=len, reverse=True):
            if re.search(rf'\b{re.escape(s)}\b', clean_name, re.IGNORECASE):
                state = s
                break

    # 4. Check city / hub patterns with word boundaries
    if not state:
        for pattern, st in compiled_cities:
            if pattern.search(clean_name):
                state = st
                break

    # 5. Fallback: Prompt operator if state is still not found
    if not state:
        print(f"\n--- State mapping needed for new/unmapped institute ---")
        print(f"ID: {inst_id}")
        print(f"Name: {clean_name}")
        print(f"Type: {inst_type}")
        print("Available States/UTs:")
        for idx, s in enumerate(states_list, 1):
            print(f"{idx:2d}. {s}")
        while True:
            choice = input(f"Enter the number (1-{len(states_list)}) for the correct state, or 's' to skip: ").strip()
            if choice.lower() == 's':
                print("Skipping mapping for this institute.")
                state = None
                break
            try:
                num = int(choice)
                if 1 <= num <= len(states_list):
                    state = states_list[num - 1]
                    manual_overrides[clean_name] = state
                    overrides_lookup[clean_name_lower] = state
                    overrides_changed = True
                    print(f"Mapped '{clean_name}' to {state} and saved override.")
                    break
            except ValueError:
                pass
            print("Invalid choice. Try again.")

    if state:
        results[inst_id] = {
            "name": clean_name,
            "type": inst_type,
            "state": state
        }
    else:
        print(f"WARNING: Institute {inst_id} ({clean_name}) remains unmapped!")

# Save overrides if updated
if overrides_changed:
    sorted_overrides = {k: manual_overrides[k] for k in sorted(manual_overrides.keys())}
    with open(overrides_path, 'w', encoding='utf-8') as f:
        json.dump(sorted_overrides, f, indent=2)
    print(f"Saved {len(sorted_overrides)} overrides to {overrides_path}")

# Synchronize cutoffs.db to public/cutoffs.db for frontend SQL.js Web Worker
try:
    os.makedirs(os.path.dirname(public_db_path), exist_ok=True)
    shutil.copy2(db_path, public_db_path)
    print(f"Successfully mirrored {db_path} to {public_db_path}")
except Exception as e:
    print(f"Warning: Could not copy database to {public_db_path}: {e}")

# Generate instituteStateMap.ts
os.makedirs(os.path.dirname(ts_output_path), exist_ok=True)
ts_content = """export interface InstituteInfo {
  name: string;
  type: 'IIT' | 'NIT' | 'IIIT' | 'GFTI' | 'SFTI' | 'IISc';
  state: string;
}

export const INSTITUTE_STATE_MAP: Record<number, InstituteInfo> = {
"""

for inst_id, info in sorted(results.items()):
    name_escaped = info['name'].replace("'", "\\'")
    ts_content += f"  {inst_id}: {{\n"
    ts_content += f"    name: '{name_escaped}',\n"
    ts_content += f"    type: '{info['type']}',\n"
    ts_content += f"    state: '{info['state']}'\n"
    ts_content += "  },\n"

ts_content += "};\n"

with open(ts_output_path, 'w', encoding='utf-8') as f:
    f.write(ts_content)
print(f"Successfully generated {ts_output_path} ({len(results)} institutes mapped)")

# Generate institute_state_map.json in root
json_map = {
    str(inst_id): {
        "name": info['name'],
        "type": info['type'],
        "state": info['state']
    }
    for inst_id, info in sorted(results.items())
}
with open(json_output_path, 'w', encoding='utf-8') as f:
    json.dump(json_map, f, indent=2)
print(f"Successfully updated {json_output_path}")

# Generate dbMetadata.ts
meta_content = f"""// Auto-generated by build_mapping.py. Do not edit manually.
export const DB_METADATA = {{
  latestYear: {latest_year},
  allYears: {all_years},
  counsellingYear: {counselling_year},
}};
"""

with open(meta_output_path, 'w', encoding='utf-8') as f:
    f.write(meta_content)
print(f"Successfully generated {meta_output_path}")

# Generate public/terms.html from template
if os.path.exists(terms_template_path):
    with open(terms_template_path, 'r', encoding='utf-8') as f:
        terms_tpl = f.read()
    
    sorted_years = sorted(all_years)
    if len(sorted_years) == 0:
        years_str = ""
    elif len(sorted_years) == 1:
        years_str = str(sorted_years[0])
    elif len(sorted_years) == 2:
        years_str = f"{sorted_years[0]} and {sorted_years[1]}"
    else:
        years_str = ", ".join(map(str, sorted_years[:-1])) + f", and {sorted_years[-1]}"
        
    last_updated_str = datetime.now().strftime("%B %Y")
    
    terms_html = terms_tpl.replace("{{last_updated}}", last_updated_str)
    terms_html = terms_html.replace("{{historical_years}}", years_str)
    terms_html = terms_html.replace("{{counselling_year}}", str(counselling_year))
    
    with open(terms_output_path, 'w', encoding='utf-8') as f:
        f.write(terms_html)
    print(f"Successfully compiled {terms_output_path}")
else:
    print(f"Warning: Terms template not found at {terms_template_path}. Could not build terms.html.")

print("All mapping and compilation steps completed successfully!")
conn.close()
