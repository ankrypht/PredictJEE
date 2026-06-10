# 🎯 JEE College Predictor

A high-performance, single-page web application to predict candidate admission options for **IITs**, **NITs**, **IIITs**, and **GFTIs** based on historical JoSAA/CSAB counselling cutoffs (2023–2025). 

Created by **Ankush**. 100% Free, Ad-free, and runs entirely client-side in the browser.

---

## ✨ Key Features

*   **100% Client-Side Engine:** We load the historical cutoff SQLite database (~30 MB) directly to your browser's WebAssembly memory. Your ranks and data are never sent to external servers or trackers.
*   **Smart Desirability Index (SDI):** Grouped results are sorted by a dynamic desirability score (out of 100.0) calculated from the normalized base competitiveness of closing ranks, spreading scores naturally using a square-root distribution to prevent score clustering.
*   **Dual-Quota Pooling:** Automatically resolves and selects the best admission quota (Home State vs. Other State) for candidates competing inside their own domicile.
*   **Pure B.Tech/B.E. Predictions:** Automatically filters out programs requiring JEE Main Paper-2 (B.Arch / B.Planning) or JEE Advanced AAT (IIT Architecture) to focus predictions strictly on standard B.Tech, B.E., and Dual Degree courses.
*   **Toggleable Prediction Modes:**
    *   **3-Year Weighted (Recommended):** Uses weighted averages: 70% Latest year (2025), 20% Previous (2024), 10% Before (2023).
    *   **Latest Year Only:** Evaluates cutoffs using strictly the latest academic year (2025) data.
*   **Interactive Live Filters:** Fast client-side searches, state location filters, institute type tabs (IIT, NIT, IIIT, GFTI), and probability filters (High, Medium, Low).
*   **Persistent Wishlist:** Star your target colleges to save them in local storage.

---

## 🛠️ Technical Stack

*   **Core:** React 19 + TypeScript + Vite
*   **Styling:** Tailwind CSS v4 + Lucide Icons + Google Fonts (Inter, Outfit)
*   **Database Engine:** SQL.js (SQLite compiled to WebAssembly via CDN)
*   **Concurrence:** Off-thread database queries executed in a background Web Worker (`src/db.worker.ts`) to ensure the user interface remains completely smooth during scanning.

---

## 💻 Local Development Setup

To run the application locally:

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/your-username/your-repository-name.git
    cd your-repository-name
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    This spins up a local Vite server, typically at `http://localhost:5173/`.

4.  **Production Compilation:**
    ```bash
    npm run build
    ```
    Build files will be generated inside the `/dist` directory.

---

## 🚀 How to Publish on GitHub Pages

Because the app is fully static and runs SQLite locally in the browser, it is perfectly suited for **GitHub Pages** with zero backend hosting costs.

There are two main methods to deploy the application:

### Method A: Automated Deployment via GitHub Actions (Recommended)

We have pre-configured a workflow file at `.github/workflows/deploy.yml` that builds and deploys your site automatically whenever you push code to GitHub.

1.  **Create a New GitHub Repository:**
    Initialize a blank repository on GitHub (do not add a README, license, or gitignore; use your local ones).
2.  **Link and Push Your Code:**
    ```bash
    git init
    git add .
    git commit -m "Initial commit with deployment config"
    git branch -M main
    git remote add origin https://github.com/your-username/your-repository-name.git
    git push -u origin main
    ```
3.  **Enable GitHub Actions Permissions:**
    - Go to your repository on GitHub.
    - Click **Settings** ➔ **Actions** ➔ **General**.
    - Scroll down to **Workflow permissions**, select **Read and write permissions**, and click **Save**.
4.  **Configure GitHub Pages Source:**
    - Go to **Settings** ➔ **Pages**.
    - Under **Build and deployment** ➔ **Source**, select **Deploy from a branch**.
    - Under **Branch**, select **gh-pages** (which is automatically created by the Action) and `/ (root)`, then click **Save**.
    - Your site will be online at `https://your-username.github.io/your-repository-name/` in a few minutes!

---

### Method B: Manual Deployment via `gh-pages` Package

If you prefer to deploy manually from your terminal:

1.  **Install the Deployment Package:**
    ```bash
    npm install -D gh-pages
    ```
2.  **Update `package.json` Scripts:**
    Add these two keys inside the `"scripts"` object:
    ```json
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
    ```
3.  **Run the Deployment Command:**
    ```bash
    npm run deploy
    ```
    This automatically builds the project and pushes the `/dist` bundle contents to the `gh-pages` branch on GitHub.
4.  **Configure Source on GitHub:**
    Follow Step 4 in Method A.

---

## 🧠 Smart Desirability Index (SDI) Algorithm

The Smart Desirability Index (SDI) calculates a dynamic score (out of 100.0) that models the student desirability of each college-branch option based on the competitiveness of its historical cutoff.

### Mathematical Formulation
The score is calculated purely from the normalized base competitiveness of the latest closing rank:

$$\text{SDI} = \left(1 - \sqrt{\frac{\text{closing\_rank}}{\text{Max\_Rank}}}\right) \times 100$$

#### 1. Square Root Distribution
Using a square-root distribution function ensures that ranks are naturally spread out across the 0–100 range. Top-tier programs (very low cutoff ranks) cluster near the high 90s, while normal or lower-tier programs spread smoothly downward all the way to 0, preventing score clustering.

#### 2. Outlier-Filtered Dynamic Normalization
To prevent data anomalies and rare quota distributions (such as North-Eastern home-state seats with closing ranks exceeding 1,000,000) from squishing the scores of mainstream options, the `Max\_Rank` is dynamically computed from the database rows matching the candidate's category and gender, excluding obvious outliers above safe thresholds:
*   **JEE Advanced (IITs / IISc):**
    *   CRL ceiling: 40,000
    *   Category Rank ceiling: 20,000
*   **JEE Main (NITs / IIITs / GFTIs / SFTIs):**
    *   CRL ceiling: 250,000
    *   Category Rank ceilings: SC (40,000), ST (25,000), EWS (25,000), PwD (8,000), OBC-NCL and others (80,000)

#### 3. Quota & Board Normalization
*   **Quota Neutral:** SDI uses the most competitive JoSAA cutoff across Home State (HS) and Other State (OS) quotas for that college-branch combination, ensuring regional quota benefits do not artificially lower a seat's desirability score.
*   **JoSAA Mapping for CSAB:** CSAB options inherit their JoSAA counterpart's desirability score to maintain consistent ranking quality.

---

## ⚖️ Disclaimers & Licensing

All cutoffs are indicative parameters based on JoSAA/CSAB historical counselling rounds. Actual cutoffs may vary. Read the full terms of use on our [Terms Page](public/terms.html).
