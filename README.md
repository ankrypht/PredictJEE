# 🎯 JEE College Predictor

A high-performance, single-page web application to predict candidate admission options for **IITs**, **NITs**, **IIITs**, and **GFTIs** based on historical JoSAA/CSAB counselling cutoffs (2023–2025). 

Created by **Ankush**. 100% Free, Ad-free, and runs entirely client-side in the browser.

---

## ✨ Key Features

*   **100% Client-Side Engine:** We load the historical cutoff SQLite database (~30 MB) directly to your browser's WebAssembly memory. Your ranks and data are never sent to external servers or trackers.
*   **Smart Desirability Index (SDI):** Grouped results are sorted by a dynamic desirability score (out of 120.00) calculated from the normalized base competitiveness of closing ranks and institutional tier premiums (+20 for IIT/IISc, +10 for Tier 1 Elite NITs/IIITs, +5 for standard NITs/IIITs, and 0 for GFTIs).
*   **Dual-Quota Pooling:** Automatically resolves and selects the best admission quota (Home State vs. Other State) for candidates competing inside their own domicile.
*   **Toggleable Prediction Modes:**
    *   **3-Year Weighted (Recommended):** Uses weighted averages: 70% Latest year (2025), 20% Previous (2024), 10% Before (2023).
    *   **Latest Year Only:** Evaluates cutoffs using strictly the latest academic year (2025) data.
*   **Interactive Live Filters:** Fast client-side fuzzy searches, multi-state location filtering, and institute type tabs (IIT, NIT, IIIT, GFTI).
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

The Smart Desirability Index (SDI) calculates a dynamic score (out of a maximum of 120.00) that models the student desirability and institutional prestige of each college-branch option.

### Mathematical Formulation
The index combines the base competitiveness score of the cutoff rank and the prestige premium of the institution:

$$\text{Final\_SDI} = \text{Base\_Score} + \text{Tier\_Premium}$$

#### 1. Base Competitiveness Normalization
To align the different rank scales of JEE Advanced and JEE Main, the latest closing rank is normalized against exam-specific bounds:
*   **JEE Advanced (IITs / IISc):**
    $$\text{Base\_Score} = \frac{25000 - \text{closing\_rank}}{25000} \times 100$$
*   **JEE Main (NITs / IIITs / GFTIs):**
    $$\text{Base\_Score} = \frac{100000 - \text{closing\_rank}}{100000} \times 100$$

#### 2. Institutional Tier Premium
Prestige premiums are added to the base score based on the category of the institution:
*   **IIT / IISc:** $+20$ points
*   **Elite Tier-1 NIT/IIIT** (Trichy, Surathkal, Warangal, Calicut, Rourkela, Allahabad): $+10$ points
*   **Standard NIT/IIIT:** $+5$ points
*   **GFTI:** $+0$ points

#### 3. Sorting & Presentation
*   **Sorting:** Flat prediction lists are sorted by the raw $\text{Final\_SDI}$ in descending order (highest score first).
*   **Display:** Visual scores shown on the UI cards are displayed with two-decimal-place precision:
    $$\text{Visual\_Score} = \text{Final\_SDI.toFixed(2)}$$

---

## ⚖️ Disclaimers & Licensing

All cutoffs are indicative parameters based on JoSAA/CSAB historical counselling rounds. Actual cutoffs may vary. Read the full terms of use on our [Terms Page](public/terms.html).
