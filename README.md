# 🎯 JEE College Predictor

A high-performance, client-side web application to predict admission choices for **IITs**, **NITs**, **IIITs**, and **GFTIs** based on historical JoSAA/CSAB counselling rounds. 

🚀 **[Live App: ankrypht.github.io/PredictJEE](https://ankrypht.github.io/PredictJEE/)**

---

<div align="center">

[![Website](https://img.shields.io/badge/Website-GitHub%20Pages-4F46E5?style=for-the-badge&logo=github)](https://ankrypht.github.io/PredictJEE/)

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript 6](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite 8](https://img.shields.io/badge/Vite-8.0-646CFF?style=flat-square&logo=vite)](https://vite.dev/)
[![SQLite WebAssembly](https://img.shields.io/badge/Database-SQLite%20Wasm-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-success?style=flat-square)](https://opensource.org/licenses/MIT)

</div>

---

## ✨ Key Features

*   **100% Client-Side Engine:** Downloads the historical cutoff database (~30 MB SQLite) directly to WebAssembly memory inside your browser. Ranks, selections, and personal data are never sent to external servers.
*   **Desirability Score:** Predictive options are sorted by an objective desirability rating (out of 100.0) calculated from normalized JoSAA OPEN category CRL closing ranks. Spreads scores naturally using a square-root distribution to prevent clustering.
*   **Dual-Quota Domicile Pooling:** Automatically resolves and selects the best admission quota (Home State vs. Other State) for candidates competing inside their own domicile, maximizing admission probability.
*   **Pure B.Tech/B.E. Predictions:** Automatically filters out programs requiring JEE Main Paper-2 (B.Arch / B.Planning) or JEE Advanced AAT (IIT Architecture) to focus predictions strictly on standard B.Tech, B.E., and Dual Degree courses.
*   **Toggleable Prediction Modes:**
    *   **3-Year Weighted (Recommended):** Evaluates cutoffs using weighted averages: 70% Latest year (2025), 20% Previous (2024), 10% Before (2023).
    *   **Latest Year Only:** Evaluates cutoffs using strictly the latest academic year (2025) data.
*   **Interactive Live Filters:** Instant client-side fuzzy search, location-based state filtering, institute type tabs (IIT, NIT, IIIT, GFTI), and probability level filters (High, Medium, Low).
*   **Persistent Wishlist:** Star target choices to save them in local storage.

---

## 🧠 Desirability Score Algorithm

The Desirability Score evaluates the student demand and demand-based prestige of each college-branch combination based on the competitiveness of its historical JoSAA OPEN category CRL cutoff.

### Mathematical Formulation
The score is calculated from the normalized base competitiveness of the JoSAA OPEN category CRL closing rank of the branch:

$$
\text{Desirability Score} = \left(1 - \sqrt{\frac{R}{R_{\max}}}\right) \times 100
$$

where $R$ is the OPEN category CRL closing rank of the branch, and $R_{\max}$ is the dynamic maximum OPEN CRL ceiling.

#### 1. Square Root Distribution
A square-root distribution ensures that ranks are naturally spread out across the 0–100 scale. Top-tier programs (very low cutoff ranks) cluster near the high 90s, while normal or lower-tier programs spread smoothly downward all the way to 0, preventing score clustering.

#### 2. Outlier-Filtered Dynamic Normalization
To prevent data anomalies and rare quota distributions (such as North-Eastern home-state seats with closing ranks exceeding 1,000,000) from squishing the scores of mainstream options, the `Max_OPEN_CRL` is dynamically computed from the JoSAA `OPEN` CRL rows, excluding obvious outliers above safe thresholds:
*   **JEE Advanced (IITs / IISc):** CRL ceiling of 40,000
*   **JEE Main (NITs / IIITs / GFTIs / SFTIs):** CRL ceiling of 250,000

#### 3. Category & Quota Normalization
*   **Category Agnostic:** All category seats of a given branch inherit the exact same desirability score computed from the branch's OPEN category CRL cutoff. This ensures consistent sorting so the actual best seats (e.g. IIT Bombay Computer Science) rank at the top regardless of whether they are accessed via CRL or Category Rank pathways.
*   **Quota Neutral:** The Desirability Score uses the most competitive JoSAA cutoff across Home State and Other State quotas for that college-branch combination, ensuring regional quota benefits do not artificially lower a seat's score.
*   **JoSAA Mapping for CSAB:** CSAB options inherit their JoSAA counterpart's desirability score to maintain consistent ranking quality.

---

## 🛠️ System Architecture

*   **UI Layer:** React 19 single page application styled with Tailwind CSS v4, utilizing responsive glassmorphism designs for mobile-friendly rendering.
*   **Worker Layer:** A Web Worker executes the SQL statements off-thread.
*   **Database Layer:** SQL.js loads the compressed SQLite database (`cutoffs.db`) from standard HTTP byte chunks into memory. All queries run in sub-10ms.

---

## 🔄 Database Update & Auto-Mapping Workflow

The website is fully dynamic. When a new counselling session begins and a new database with updated cutoffs is loaded, the year configurations and state mapping dependencies are automatically resolved.

### Database Setup & Mapping Compilation

The repository includes a Python utility to automate mapping compilation, database metadata creation, and legal terms updates.

#### 1. Place the Database
Overwrite `cutoffs.db` in the project root directory with the new SQLite database. The structure of the database must remain the same:
- Table `institutes` (`id`, `name`, `type`)
- Table `programs` (`id`, `name`)
- Table `cutoffs` (`counselling_board`, `institute_id`, `program_id`, `quota`, `category`, `gender`, `rank_type`, `year`, `round_no`, `closing_rank`)

#### 2. Run the Build Mapping Script
Run the automated script to compile mappings and configurations:
```bash
python scripts/build_mapping.py
```

#### What this script does:
1. **Dynamic Year Detection:** Automatically scans `cutoffs.db` to extract all unique years, sets the default `latestYear` React state to the maximum database year, and calculates the next counselling year (`latestYear + 1`).
2. **State & Location Resolution:** Maps each institute to its home state using:
   - Preserved manual state overrides.
   - Text heuristics matching state names inside the institute title.
   - City keyword matches (e.g., "Rourkela" -> "Odisha").
3. **Interactive Overrides (Fallback):** If a new or renamed institute is found and cannot be resolved automatically, the script pauses and prompts the operator in the terminal with a numbered menu of the 36 Indian States and UTs. Once selected, it appends the override to [manual_state_overrides.json](scripts/manual_state_overrides.json) so the operator is never prompted for that institute again.
4. **Compile Configs & Templates:**
   - Generates [instituteStateMap.ts](src/data/instituteStateMap.ts).
   - Generates [dbMetadata.ts](src/data/dbMetadata.ts).
   - Compiles [terms.html](public/terms.html) from [terms.template.html](public/terms.template.html), substituting placeholders for history years, counselling year, and the "Last updated" month/year.

---

## ⚖️ Disclaimers & Licensing

All cutoffs are indicative parameters based on JoSAA/CSAB historical counselling rounds. Actual cutoffs may vary. Open sourced under the **MIT License**.
