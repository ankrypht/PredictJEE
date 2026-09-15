import { chromium, type Page } from 'playwright';
import sqlite3 from 'sqlite3';
import { open, type Database } from 'sqlite';

let dbLock = Promise.resolve();
async function runWithLock(fn: () => Promise<void>) {
  const currentLock = dbLock;
  let release: () => void;
  dbLock = new Promise<void>(resolve => release = resolve);
  await currentLock;
  try {
    await fn();
  } finally {
    release!();
  }
}
import * as readline from 'readline/promises';

// JoSAA specific selectors per user request
const JOSAA_SELECTORS = {
  year: "[name='ctl00ContentPlaceHolder1ddlYear' i], #ctl00ContentPlaceHolder1ddlYear, [id$='ddlYear' i], [name$='ddlYear' i]",
  round: "[name='ctl00ContentPlaceHolder1ddlroundno' i], #ctl00ContentPlaceHolder1ddlroundno, [id$='ddlroundno' i], [name$='ddlroundno' i]",
  instType: "[name='ctl00ContentPlaceHolder1ddlInstype' i], #ctl00ContentPlaceHolder1ddlInstype, [id$='ddlInstype' i], [name$='ddlInstype' i]",
  institute: "[name='ctl00ContentPlaceHolder1ddlInstitute' i], #ctl00ContentPlaceHolder1ddlInstitute, [id$='ddlInstitute' i], [name$='ddlInstitute' i]",
  branch: "[name='ctl00ContentPlaceHolder1ddlBranch' i], #ctl00ContentPlaceHolder1ddlBranch, [id$='ddlBranch' i], [name$='ddlBranch' i]",
  seatType: "[name='ctl00ContentPlaceHolder1ddlSeattype' i], #ctl00ContentPlaceHolder1ddlSeattype, [id$='ddlSeattype' i], [name$='ddlSeattype' i]",
  submitBtn: "[name='ctl00ContentPlaceHolder1btnSubmit' i], #ctl00ContentPlaceHolder1btnSubmit, [id$='btnSubmit' i], [name$='btnSubmit' i]",
  table: "#ctl00_ContentPlaceHolder1_GridView1, [id$='GridView1' i]"
};

// CSAB generic pattern-matched selectors
const CSAB_SELECTORS = {
  year: "[name*='ddlYear' i], [id*='ddlYear' i]",
  round: "[name*='ddlroundno' i], [id*='ddlroundno' i]",
  instType: "[name*='ddlInstype' i], [id*='ddlInstype' i]",
  institute: "[name*='ddlInstitute' i], [id*='ddlInstitute' i]",
  branch: "[name*='ddlBranch' i], [id*='ddlBranch' i]",
  seatType: "[name*='ddlSeattype' i], [id*='ddlSeattype' i]",
  submitBtn: "[name*='btnSubmit' i], [id*='btnSubmit' i]",
  table: "[id*='GridView1' i]"
};

// Helper to safely wait for ASP.NET postbacks
async function selectAndWait(page: Page, selector: string, value: string) {
  const locator = page.locator(selector).first();
  if (await locator.count() > 0) {
    try {
      await locator.selectOption({ label: value }, { force: true });
      await page.waitForTimeout(2000);
      await page.waitForLoadState('networkidle', { timeout: 120000 });
    } catch {
      console.error(`Warning: Could not select ${value} or wait timeout for ${selector}`);
    }
  }
}

// Helper to click and wait for ASP.NET postbacks
async function clickAndWait(page: Page, selector: string) {
  const locator = page.locator(selector).first();
  if (await locator.count() > 0) {
    try {
      await locator.click({ force: true });
      await page.waitForTimeout(2000);
      await page.waitForLoadState('networkidle', { timeout: 120000 });
    } catch {
      console.log(`Warning: clickAndWait networkidle timeout for ${selector}`);
    }
  }
}

function getInstituteAcronym(fullName: string, board: string): string {
  const name = fullName.toLowerCase();
  if (board === "CSAB" && name.includes("sfti")) return "SFTI";
  if (name.includes("indian institute of technology")) return "IIT";
  if (name.includes("national institute of technology")) return "NIT";
  if (name.includes("information technology")) return "IIIT";
  if (name.includes("government funded")) return "GFTI";
  return fullName.trim();
}

async function getMaxArchiveYear(archiveUrl: string): Promise<number | null> {
  try {
    const response = await fetch(archiveUrl);
    const text = await response.text();
    // Match <option value="2024">2024</option> etc
    const matches = text.match(/<option[^>]*value=["']?(202[0-9])["']?[^>]*>/gi);
    if (matches) {
      const years = matches.map(m => parseInt(m.replace(/[^0-9]/g, ''), 10));
      const validYears = years.filter(y => !isNaN(y) && y > 2000);
      if (validYears.length > 0) {
        return Math.max(...validYears);
      }
    }
  } catch (err) {
    console.error("Could not fetch archive year:", err);
  }
  return null;
}


const KNOWN_INSTITUTE_ALIASES: Record<string, string> = {
  // IIIT Manipur variations across years and boards
  "indian institute of information technology senapati manipur": "INDIAN INSTITUTE OF INFORMATION TECHNOLOGY SENAPATI MANIPUR",
  "indian institute of information technology manipur": "INDIAN INSTITUTE OF INFORMATION TECHNOLOGY SENAPATI MANIPUR",
  "indian institute of information technology, manipur": "INDIAN INSTITUTE OF INFORMATION TECHNOLOGY SENAPATI MANIPUR",
  "iiit senapati manipur": "INDIAN INSTITUTE OF INFORMATION TECHNOLOGY SENAPATI MANIPUR",
  "iiit manipur": "INDIAN INSTITUTE OF INFORMATION TECHNOLOGY SENAPATI MANIPUR",

  // Guru Ghasidas variations
  "institute of technology, guru ghasidas vishwavidyalaya (a central university), bilaspur, (c.g.)": "School of Studies of Engineering and Technology, Guru Ghasidas Vishwavidyalaya, Bilaspur",
  "institute of technology, guru ghasidas vishwavidyalaya, bilaspur": "School of Studies of Engineering and Technology, Guru Ghasidas Vishwavidyalaya, Bilaspur",
  "school of studies of engineering and technology, guru ghasidas vishwavidyalaya, bilaspur": "School of Studies of Engineering and Technology, Guru Ghasidas Vishwavidyalaya, Bilaspur",

  // IIHT Varanasi variations
  "indian institute of handloom technology, varanasi": "Indian Institute of Handloom Technology(IIHT), Varanasi",
  "indian institute of handloom technology(iiht), varanasi": "Indian Institute of Handloom Technology(IIHT), Varanasi",

  // Central University of Jharkhand
  "central university of jharkhand": "CU Jharkhand",
  "cu jharkhand": "CU Jharkhand",
};

function canonicalizeInstituteName(rawName: string): string {
  // 1. Collapse multiple spaces to single space and trim
  const clean = rawName.trim().replace(/\s+/g, ' ');
  const lower = clean.toLowerCase();

  // 2. Check known alias dictionary
  if (KNOWN_INSTITUTE_ALIASES[lower]) {
    return KNOWN_INSTITUTE_ALIASES[lower];
  }

  return clean;
}

function canonicalizeProgramName(rawName: string): string {
  return rawName.trim().replace(/\s+/g, ' ');
}

// In-memory caches to prevent SQLite AUTOINCREMENT sequence inflation and keep IDs contiguous
const instituteCache = new Map<string, number>();
const programCache = new Map<string, number>();

async function initCaches(db: Database) {
  const existingInsts = await db.all<{ id: number; name: string }[]>("SELECT id, name FROM institutes");
  for (const inst of existingInsts) {
    instituteCache.set(inst.name, inst.id);
  }

  const existingProgs = await db.all<{ id: number; name: string }[]>("SELECT id, name FROM programs");
  for (const prog of existingProgs) {
    programCache.set(prog.name, prog.id);
  }
}

async function getOrInsertInstitute(db: Database, rawName: string, rawType: string): Promise<number> {
  const name = canonicalizeInstituteName(rawName);
  if (instituteCache.has(name)) {
    return instituteCache.get(name)!;
  }
  const existing = await db.get<{ id: number }>("SELECT id FROM institutes WHERE name = ?", [name]);
  if (existing) {
    instituteCache.set(name, existing.id);
    return existing.id;
  }
  const result = await db.run("INSERT INTO institutes (name, type) VALUES (?, ?)", [name, rawType]);
  const newId = result.lastID!;
  instituteCache.set(name, newId);
  return newId;
}

async function getOrInsertProgram(db: Database, rawName: string): Promise<number> {
  const name = canonicalizeProgramName(rawName);
  if (programCache.has(name)) {
    return programCache.get(name)!;
  }
  const existing = await db.get<{ id: number }>("SELECT id FROM programs WHERE name = ?", [name]);
  if (existing) {
    programCache.set(name, existing.id);
    return existing.id;
  }
  const result = await db.run("INSERT INTO programs (name) VALUES (?, ?)", [name]);
  const newId = result.lastID!;
  programCache.set(name, newId);
  return newId;
}

async function extractAndSaveTable(
  page: Page,
  db: Database,
  board: string,
  year: string,
  round: string,
  instType: string,
  tableSelector: string,
  testMode: boolean
) {
  console.log(`Extracting rows for ${board} ${year} Round ${round} (${instType})...`);

  try {
    await page.waitForSelector(tableSelector, { state: 'visible', timeout: 120000 });
  } catch {
    console.error(`Warning: Table not found or not visible after submit for ${board} ${year} Round ${round}.`);
    await page.screenshot({ path: `error_${board}_${year}_${round}.png` });
  }

  // Grab all text content in one go to be significantly faster
  const tableData = await page.evaluate((selector) => {
    const rowSelector = selector.split(',').map(s => s.trim() + ' tr').join(', ');
    const rows = Array.from(document.querySelectorAll(rowSelector));
    // Skip header row if rows exist
    return rows.length > 1 ? rows.slice(1).map(row => {
      const cells = Array.from(row.querySelectorAll("td, th"));
      return cells.map(cell => (cell.textContent || "").trim());
    }) : [];
  }, tableSelector);

  console.log(`Found ${tableData.length} rows to process.`);

  await runWithLock(async () => {
    await db.exec("BEGIN TRANSACTION");
    const insertStmt = await db.prepare(`
        INSERT INTO cutoffs (
            counselling_board, year, round_no, is_final_round, 
            institute_id, program_id, quota, 
            category, gender, rank_type, opening_rank, closing_rank
        ) VALUES (?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let insertCount = 0;
    const rowsToProcess = testMode ? tableData.slice(0, 3) : tableData;
    for (const cells of rowsToProcess) {
      if (!cells || cells.length < 7) continue;

      const category = cells[3]!;
      
      // Dynamically calculate rank_type
      let rankType = "Category_Rank";
      if (board === "CSAB") {
        rankType = "CRL";
      } else if (board === "JoSAA") {
        if (category.toUpperCase().includes("OPEN")) {
          rankType = "CRL";
        }
      }

      const rawOpeningCell = cells[5]!;
      const rawClosingCell = cells[6]!;

      // Skip Preparatory Course ranks indicated by 'P' suffix
      if (rawOpeningCell.includes('P') || rawClosingCell.includes('P')) {
        continue;
      }

      // Clean up the ranks
      const rawOpening = rawOpeningCell.replace(/[^0-9]/g, "");
      const rawClosing = rawClosingCell.replace(/[^0-9]/g, "");

      const openingRank = parseInt(rawOpening, 10);
      const finalOpeningRank = isNaN(openingRank) ? null : openingRank;
      const closingRank = parseInt(rawClosing, 10);
      const finalClosingRank = isNaN(closingRank) ? null : closingRank;

      // Skip rows where opening or closing rank is NULL (or missing)
      if (finalOpeningRank === null || finalClosingRank === null) {
        continue;
      }

      const instName = cells[0]!;
      const progName = cells[1]!;
      const instTypeAcronym = getInstituteAcronym(instType, board);
      const instId = await getOrInsertInstitute(db, instName, instTypeAcronym);
      const progId = await getOrInsertProgram(db, progName);

      await insertStmt.run(
        board,
        parseInt(year, 10),
        parseInt(round, 10) || parseInt(round.replace(/[^0-9]/g, ""), 10) || 0,
        instId,
        progId,
        cells[2]!, // quota
        category,  // category
        cells[4]!, // gender
        rankType,
        finalOpeningRank,
        finalClosingRank
      );
      insertCount++;
    }
    await insertStmt.finalize();
    await db.exec("COMMIT");
    console.log(`Saved ${insertCount} rows.`);
  });
}

async function scrapeJoSAA(db: Database, yearsRequested: number, testMode: boolean) {
  console.log("\nStarting JoSAA Scraping...");
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  const S = JOSAA_SELECTORS;
  
  const JOSAA_URLS = [
    "https://josaa.admissions.nic.in/Applicant/SeatAllotmentResult/currentorcr.aspx",
    "https://josaa.admissions.nic.in/applicant/seatmatrix/openingclosingrankarchieve.aspx"
  ];
  let yearsRemaining = yearsRequested;

  try {
    for (const url of JOSAA_URLS) {
      if (yearsRemaining <= 0) break;
      
      try {
        await page.goto(url, { timeout: 60000 });
        await page.waitForSelector(S.round, { state: 'attached', timeout: 10000 });
      } catch {
        console.log(`Skipping ${url} - Not available or no form found.`);
        continue;
      }
      
      const yearLocator = page.locator(S.year).first();
      let yearsToScrape: string[] = [];
      
      if (await yearLocator.count() > 0) {
        const allYears = await yearLocator.locator("option").allInnerTexts();
        const validYears = allYears.filter(y => y.trim() !== "" && !y.includes("Select"));
        yearsToScrape = validYears.slice(0, yearsRemaining);
        yearsRemaining -= yearsToScrape.length;
      } else {
        const archiveUrl = JOSAA_URLS[1]!;
        const maxArchiveYear = await getMaxArchiveYear(archiveUrl);
        const currentYear = maxArchiveYear ? (maxArchiveYear + 1).toString() : new Date().getFullYear().toString();
        
        yearsToScrape = [currentYear];
        yearsRemaining -= 1;
        console.log(`No Year dropdown found. Inferred Current Year from Archive: ${currentYear}`);
      }
      
      for (const year of yearsToScrape) {
        console.log(`\n--- JoSAA Year: ${year} ---`);
        if (await yearLocator.count() > 0) {
          await selectAndWait(page, S.year, year);
        }
      
      const roundLocator = page.locator(S.round).first();
      const allRounds = await roundLocator.locator("option").allInnerTexts();
      const validRounds = allRounds.filter(r => r.trim() !== "" && !r.includes("Select"));
      const roundsToScrape = (testMode && validRounds.length > 1) 
        ? [validRounds[0]!, validRounds[validRounds.length - 1]!] 
        : validRounds;
      
      for (const round of roundsToScrape) {
        if (await page.locator(S.round).count() === 0) {
          console.log("Page appears to have crashed. Attempting to recover state for round...");
          try {
            await page.goto(url, { timeout: 60000 });
            await page.waitForSelector(S.round, { state: 'attached', timeout: 15000 });
            if (await yearLocator.count() > 0) {
              await selectAndWait(page, S.year, year);
            }
          } catch (err) {
            console.error("Failed to recover page state.", err);
          }
        }

        console.log(`Selecting Round: ${round}`);
        await selectAndWait(page, S.round, round);
        
        const instTypeLocator = page.locator(S.instType).first();
        const allInstTypes = await instTypeLocator.locator("option").allInnerTexts();
        const validInstTypes = allInstTypes.filter(i => i.trim() !== "" && !i.includes("Select") && i !== "ALL");
        
        for (const instType of validInstTypes) {
          if (await page.locator(S.instType).count() === 0) {
            console.log("Page appears to have crashed. Attempting to recover state for instType...");
            try {
              await page.goto(url, { timeout: 60000 });
              await page.waitForSelector(S.round, { state: 'attached', timeout: 15000 });
              if (await yearLocator.count() > 0) {
                await selectAndWait(page, S.year, year);
              }
              await selectAndWait(page, S.round, round);
            } catch (err) {
              console.error("Failed to recover page state.", err);
            }
          }

          console.log(`Selecting Institute Type: ${instType}`);
          await selectAndWait(page, S.instType, instType);
          
          // choose 'ALL' for Institute Name, Academic Program, and Seat Type / Category
          await selectAndWait(page, S.institute, "ALL");
          await selectAndWait(page, S.branch, "ALL");
          await selectAndWait(page, S.seatType, "ALL");
          
          await clickAndWait(page, S.submitBtn);
          await extractAndSaveTable(page, db, "JoSAA", year, round, instType, S.table, testMode);
        }
      }
    }
    }
  } catch (error) {
    console.error("Error in scrapeJoSAA:", error);
  } finally {
    await browser.close();
  }
}

async function scrapeCSAB(db: Database, yearsRequested: number, testMode: boolean) {
  console.log("\nStarting CSAB Scraping...");
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  const S = CSAB_SELECTORS;
  
  const CSAB_URLS = [
    "https://admissions.nic.in/csabspl/Applicant/SeatAllotmentResult/CurrentORCR.aspx",
    "https://admissions.nic.in/csabspl/Applicant/seatallotmentresult/openingclosingrankarchieve.aspx"
  ];
  let yearsRemaining = yearsRequested;

  try {
    for (const url of CSAB_URLS) {
      if (yearsRemaining <= 0) break;
      
      try {
        await page.goto(url, { timeout: 60000 });
        await page.waitForSelector(S.round, { state: 'attached', timeout: 10000 });
      } catch {
        console.log(`Skipping ${url} - Not available or no form found.`);
        continue;
      }
      
      const yearLocator = page.locator(S.year).first();
      let yearsToScrape: string[] = [];
      
      if (await yearLocator.count() > 0) {
        const allYears = await yearLocator.locator("option").allInnerTexts();
        const validYears = allYears.filter(y => y.trim() !== "" && !y.includes("Select"));
        yearsToScrape = validYears.slice(0, yearsRemaining);
        yearsRemaining -= yearsToScrape.length;
      } else {
        const archiveUrl = CSAB_URLS[1]!;
        const maxArchiveYear = await getMaxArchiveYear(archiveUrl);
        const currentYear = maxArchiveYear ? (maxArchiveYear + 1).toString() : new Date().getFullYear().toString();
        
        yearsToScrape = [currentYear];
        yearsRemaining -= 1;
        console.log(`No Year dropdown found. Inferred Current Year from Archive: ${currentYear}`);
      }
      
      for (const year of yearsToScrape) {
        console.log(`\n--- CSAB Year: ${year} ---`);
        if (await yearLocator.count() > 0) {
          await selectAndWait(page, S.year, year);
        }
      
      const roundLocator = page.locator(S.round).first();
      const allRounds = await roundLocator.locator("option").allInnerTexts();
      const validRounds = allRounds.filter(r => r.trim() !== "" && !r.includes("Select"));
      const roundsToScrape = (testMode && validRounds.length > 1) 
        ? [validRounds[0]!, validRounds[validRounds.length - 1]!] 
        : validRounds;
      
      for (const round of roundsToScrape) {
        if (await page.locator(S.round).count() === 0) {
          console.log("Page appears to have crashed. Attempting to recover state for round...");
          try {
            await page.goto(url, { timeout: 60000 });
            await page.waitForSelector(S.round, { state: 'attached', timeout: 15000 });
            if (await yearLocator.count() > 0) {
              await selectAndWait(page, S.year, year);
            }
          } catch (err) {
            console.error("Failed to recover page state.", err);
          }
        }

        console.log(`Selecting Round: ${round}`);
        await selectAndWait(page, S.round, round);
        
        const instTypeLocator = page.locator(S.instType).first();
        const allInstTypes = await instTypeLocator.locator("option").allInnerTexts();
        const validInstTypes = allInstTypes.filter(i => i.trim() !== "" && !i.includes("Select") && i !== "ALL");
        
        for (const instType of validInstTypes) {
          if (await page.locator(S.instType).count() === 0) {
            console.log("Page appears to have crashed. Attempting to recover state for instType...");
            try {
              await page.goto(url, { timeout: 60000 });
              await page.waitForSelector(S.round, { state: 'attached', timeout: 15000 });
              if (await yearLocator.count() > 0) {
                await selectAndWait(page, S.year, year);
              }
              await selectAndWait(page, S.round, round);
            } catch (err) {
              console.error("Failed to recover page state.", err);
            }
          }

          console.log(`Selecting Institute Type: ${instType}`);
          await selectAndWait(page, S.instType, instType);
          
          // choose 'ALL' for Institute Name, Academic Program, and Seat Type / Category
          await selectAndWait(page, S.institute, "ALL");
          await selectAndWait(page, S.branch, "ALL");
          
          // For CSAB seat type might be dynamically present
          await selectAndWait(page, S.seatType, "ALL");
          
          await clickAndWait(page, S.submitBtn);
          await extractAndSaveTable(page, db, "CSAB", year, round, instType, S.table, testMode);
        }
      }
    }
    }
  } catch (error) {
    console.error("Error in scrapeCSAB:", error);
  } finally {
    await browser.close();
  }
}

async function startScraping() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const yearsStr = await rl.question("Enter how many years of data you want to fetch (e.g. 3): ");
  const yearsRequested = parseInt(yearsStr.trim(), 10);

  const testModeStr = await rl.question("Run in TEST MODE (fast, 1 round/type only)? (y/n): ");
  const testMode = testModeStr.trim().toLowerCase() === 'y';

  rl.close();

  if (isNaN(yearsRequested) || yearsRequested <= 0) {
    console.error("Invalid number of years entered.");
    return;
  }

  // Initialize DB
  const db = await open({
    filename: "cutoffs.db",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS institutes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      type TEXT
    );
    CREATE TABLE IF NOT EXISTS programs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE
    );
    DROP TABLE IF EXISTS cutoffs;
    CREATE TABLE cutoffs (
        counselling_board TEXT,
        year INTEGER,
        round_no INTEGER,
        is_final_round INTEGER DEFAULT 0,
        institute_id INTEGER,
        program_id INTEGER,
        quota TEXT,
        category TEXT,
        gender TEXT,
        rank_type TEXT,
        opening_rank INTEGER,
        closing_rank INTEGER,
        FOREIGN KEY(institute_id) REFERENCES institutes(id),
        FOREIGN KEY(program_id) REFERENCES programs(id)
    );
  `);
  await initCaches(db);

  try {
    await scrapeJoSAA(db, yearsRequested, testMode);
    await scrapeCSAB(db, yearsRequested, testMode);

    // Post-processing SQL
    console.log("Running post-processing SQL to determine final rounds...");
    
    // Create a temporary index to speed up the correlated subquery
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_temp_year_board ON cutoffs(counselling_board, year, round_no);`);
    
    await db.exec(`
      UPDATE cutoffs
      SET is_final_round = 1
      WHERE round_no = (
        SELECT MAX(round_no)
        FROM cutoffs AS c2
        WHERE c2.year = cutoffs.year AND c2.counselling_board = cutoffs.counselling_board
      );
    `);
    
    // Clean up temporary index
    await db.exec(`DROP INDEX idx_temp_year_board;`);

    // Create App-Specific Indices
    console.log("Creating highly optimized indices for Expo app...");
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_prediction_search 
      ON cutoffs (counselling_board, is_final_round, category, quota, gender, rank_type, institute_id, closing_rank);
    `);

    console.log("Compressing and analyzing database (VACUUM & ANALYZE)...");
    await db.exec(`
      VACUUM;
      ANALYZE;
    `);

    console.log("All scraping and post-processing finished successfully!");
  } catch (error) {
    console.error("An error occurred during execution:", error);
  } finally {
    await db.close();
  }
}

// Run the script
startScraping().catch(console.error);
