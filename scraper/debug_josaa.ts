import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://josaa.admissions.nic.in/applicant/seatmatrix/openingclosingrankarchieve.aspx", { timeout: 120000 });
  
  await page.locator("[name='ctl00$ContentPlaceHolder1$ddlYear']").selectOption({ label: "2024" });
  await page.waitForTimeout(2000);
  await page.locator("[name='ctl00$ContentPlaceHolder1$ddlroundno']").selectOption({ label: "1" });
  await page.waitForTimeout(2000);
  await page.locator("[name='ctl00$ContentPlaceHolder1$ddlInstype']").selectOption({ label: "Government Funded Technical Institutions" });
  await page.waitForTimeout(2000);
  await page.locator("[name='ctl00$ContentPlaceHolder1$ddlInstitute']").selectOption({ label: "ALL" });
  await page.waitForTimeout(2000);
  await page.locator("[name='ctl00$ContentPlaceHolder1$ddlBranch']").selectOption({ label: "ALL" });
  await page.waitForTimeout(2000);
  await page.locator("[name='ctl00$ContentPlaceHolder1$ddlSeattype']").selectOption({ label: "ALL" });
  await page.waitForTimeout(2000);
  
  await page.locator("[name='ctl00$ContentPlaceHolder1$btnSubmit']").click();
  await page.waitForTimeout(5000);
  
  await page.screenshot({ path: 'test_screenshot.png' });
  const html = await page.content();
  console.log("Does GridView exist?", html.includes("GridView1"));
  
  await browser.close();
})();
