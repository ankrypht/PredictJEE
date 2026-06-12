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
\text{Desirability Score} = \left(1 - \sqrt{\frac{\text{OPEN\_CRL}}{\text{Max\_OPEN\_CRL}}}\right) \times 100
$$

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

## ⚖️ Disclaimers & Licensing

All cutoffs are indicative parameters based on JoSAA/CSAB historical counselling rounds. Actual cutoffs may vary. Open sourced under the **MIT License**.
