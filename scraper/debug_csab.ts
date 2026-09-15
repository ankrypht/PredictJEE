import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://admissions.nic.in/csabspl/Applicant/SeatAllotmentResult/CurrentORCR.aspx", { timeout: 120000 });
  
  // CSAB does not have a Year dropdown by default on the current page.
  // It starts directly with Round selection.
  await page.locator("[name*='ddlroundno' i]").first().selectOption({ label: "1" });
  await page.waitForTimeout(2000);
  
  await page.locator("[name*='ddlInstype' i]").first().selectOption({ label: "Government Funded Technical Institutions" });
  await page.waitForTimeout(2000);
  
  await page.locator("[name*='ddlInstitute' i]").first().selectOption({ label: "ALL" });
  await page.waitForTimeout(2000);
  
  await page.locator("[name*='ddlBranch' i]").first().selectOption({ label: "ALL" });
  await page.waitForTimeout(2000);
  
  // Seat Type might be optional or dynamically present, try to select if it exists
  if (await page.locator("[name*='ddlSeattype' i]").first().count() > 0) {
    await page.locator("[name*='ddlSeattype' i]").first().selectOption({ label: "ALL" }).catch(() => {});
    await page.waitForTimeout(2000);
  }
  
  await page.locator("[name*='btnSubmit' i]").first().click();
  await page.waitForTimeout(5000);
  
  await page.screenshot({ path: 'test_csab_screenshot.png' });
  const html = await page.content();
  console.log("Does GridView exist?", html.includes("GridView1"));
  
  await browser.close();
})();
