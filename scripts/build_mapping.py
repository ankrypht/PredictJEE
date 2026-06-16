import sqlite3
import json
import os
from datetime import datetime

# Resolve absolute paths relative to script location
script_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(script_dir, '..', 'cutoffs.db')
overrides_path = os.path.join(script_dir, 'manual_state_overrides.json')
ts_output_path = os.path.join(script_dir, '..', 'src', 'data', 'instituteStateMap.ts')
meta_output_path = os.path.join(script_dir, '..', 'src', 'data', 'dbMetadata.ts')
terms_template_path = os.path.join(script_dir, '..', 'public', 'terms.template.html')
terms_output_path = os.path.join(script_dir, '..', 'public', 'terms.html')

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
    all_years = [2025, 2024, 2023] # fallback

latest_year = all_years[0] if all_years else 2025
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
states_list.sort() # Ensure sorted order

# Load overrides
manual_overrides = {}
if os.path.exists(overrides_path):
    with open(overrides_path, 'r', encoding='utf-8') as f:
        manual_overrides = json.load(f)
else:
    print(f"Warning: Overrides file not found at {overrides_path}. Starting fresh.")

overrides_changed = False
results = {}

for inst_id, name, inst_type in insts:
    state = None
    inst_id_str = str(inst_id)
    
    # 1. Check overrides
    if inst_id_str in manual_overrides:
        state = manual_overrides[inst_id_str]
    else:
        # 2. State Name in Institute Name
        for s in states_list:
            if s.lower() in name.lower():
                state = s
                break
                
        # 3. Fallbacks based on common names/cities
        if not state:
            name_lower = name.lower()
            if "delhi" in name_lower:
                state = "Delhi"
            elif "pondicherry" in name_lower or "puducherry" in name_lower:
                state = "Puducherry"
            elif any(x in name_lower for x in ["allahabad", "varanasi", "amethi", "lucknow", "gorakhpur", "kanpur", "noida", "greater noida"]):
                state = "Uttar Pradesh"
            elif any(x in name_lower for x in ["rourkela", "bhubaneswar"]):
                state = "Odisha"
            elif any(x in name_lower for x in ["silchar", "guwahati", "tezpur"]):
                state = "Assam"
            elif any(x in name_lower for x in ["surathkal", "dharwad", "manipal", "raichur"]):
                state = "Karnataka"
            elif any(x in name_lower for x in ["ranchi", "dhanbad", "jamshedpur", "deoghar"]):
                state = "Jharkhand"
            elif any(x in name_lower for x in ["trichy", "tiruchirappalli", "madras", "salem", "kancheepuram"]):
                state = "Tamil Nadu"
            elif any(x in name_lower for x in ["warangal", "hyderabad"]):
                state = "Telangana"
            elif any(x in name_lower for x in ["bhopal", "indore", "gwalior", "jabalpur", "sagar"]):
                state = "Madhya Pradesh"
            elif any(x in name_lower for x in ["surat", "vadodara", "gandhinagar"]):
                state = "Gujarat"
            elif "roorkee" in name_lower:
                state = "Uttarakhand"
            elif any(x in name_lower for x in ["bombay", "nagpur", "pune"]):
                state = "Maharashtra"
            elif any(x in name_lower for x in ["patna", "bhagalpur"]):
                state = "Bihar"
            elif any(x in name_lower for x in ["calicut", "kottayam", "palakkad"]):
                state = "Kerala"
            elif "srinagar" in name_lower:
                state = "Jammu & Kashmir"
            elif any(x in name_lower for x in ["jalandhar", "ropar"]):
                state = "Punjab"
            elif any(x in name_lower for x in ["jaipur", "jodhpur", "kota", "ajmer"]):
                state = "Rajasthan"
            elif any(x in name_lower for x in ["raipur", "bilaspur", "bhilai"]):
                state = "Chhattisgarh"

    # 4. Prompt if state is not found
    if not state:
        print(f"\n--- State mapping needed for new/unmapped institute ---")
        print(f"ID: {inst_id}")
        print(f"Name: {name}")
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
                    manual_overrides[inst_id_str] = state
                    overrides_changed = True
                    print(f"Mapped to {state} and saved to memory.")
                    break
            except ValueError:
                pass
            print("Invalid choice. Try again.")

    if state:
        results[inst_id] = {
            "name": name,
            "type": inst_type,
            "state": state
        }

# Save overrides if updated
if overrides_changed:
    sorted_overrides = {k: manual_overrides[k] for k in sorted(manual_overrides.keys(), key=int)}
    with open(overrides_path, 'w', encoding='utf-8') as f:
        json.dump(sorted_overrides, f, indent=2)
    print(f"Saved {len(sorted_overrides)} overrides to {overrides_path}")

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
print(f"Successfully generated {ts_output_path}")

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
    
    # Construct historical years string (e.g. 2023, 2024, and 2025)
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
