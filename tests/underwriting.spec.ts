import { test, expect } from "@playwright/test";

test.describe("STR Underwriting Training Platform", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start with deterministic initial state
    await page.addInitScript(() => {
      window.localStorage.clear();
    });
    await page.goto("/");
  });

  test("1. Dashboard renders available properties, metrics, and market filters", async ({ page }) => {
    // Check main title
    await expect(page.locator("h1")).toContainText(/dream residence|Short-Term Rental Property/);

    // Check metric cards
    await expect(page.getByText("Available Cases")).toBeVisible();
    await expect(page.getByText("Completed & Graded")).toBeVisible();
    await expect(page.getByText("Average Accuracy")).toBeVisible();

    // Verify all 6 properties appear
    const cards = page.locator("[id^='property-card-']");
    await expect(cards).toHaveCount(6);

    // Test Market Filtering
    await page.locator("#market-filter-2").click();
    await expect(page.locator("[id^='property-card-']")).toHaveCount(1);
    await expect(page.getByText("88 Lakeshore Ln")).toBeVisible();

    // Reset to All Markets
    await page.locator("#market-filter-all").click();
    await expect(page.locator("[id^='property-card-']")).toHaveCount(6);
  });

  test("2. Primary User Path: Complete underwriting workflow with 100 Best score", async ({ page }) => {
    // 1. Pick Gatlinburg property
    await page.locator("#btn-select-41234567").click();
    await page.waitForURL("**/workspace/41234567");

    // 2. Verify Property and Market context in Workspace
    await expect(page.getByText("1240 Ski View Dr")).toBeVisible();
    await expect(page.locator("#tab-financials")).toBeVisible();

    // 3. Tab 1: Financials - Adjust Purchase & Setup Budget
    await page.locator("#input-purchase-price").fill("660000");

    // 4. Tab 2: Analysis - Set Revenue Forecast matching Senior Analyst benchmark ($125,000)
    await page.locator("#tab-analysis").click();
    await page.locator("#input-low-revenue").fill("105000");
    await page.locator("#input-mid-revenue").fill("125000");
    await page.locator("#input-high-revenue").fill("142000");

    // Verify derived calculations rendered
    await expect(page.locator("#card-scenarios-breakdown")).toBeVisible();
    await expect(page.getByText("Annual Free Cash Flow")).toBeVisible();

    // 5. Tab 3: Deal Tags
    await page.locator("#tab-tags").click();
    await page.locator("#tag-toggle-tax_efficient").click();

    // 6. Tab 4: Review & Submit
    await page.locator("#tab-review").click();
    await expect(page.getByText("Ready to Submit", { exact: true })).toBeVisible();

    // Submit for grading
    await page.locator("#btn-submit-underwriting").click();
    await page.waitForURL("**/evaluation");

    // 7. Verify Evaluation Results
    await expect(page.locator("#card-evaluation-score")).toBeVisible();
    await expect(page.locator("#score-accuracy-display")).toHaveText("100");
    await expect(page.getByText("Best Band (100 pts)")).toBeVisible();
    await expect(page.getByText(/within the ±10% target band/)).toBeVisible();

    // Check Side-by-side breakdown table
    await expect(page.locator("#card-comparison-table")).toBeVisible();

    // Return to dashboard and verify property is marked Submitted with 100 score
    await page.locator("#btn-return-dashboard").click();
    await page.waitForURL("**/");
    await expect(page.locator("#property-card-41234567")).toContainText("Submitted");
    await expect(page.locator("#property-card-41234567")).toContainText("100");
  });

  test("3. Alternate Path: Medium Band Score (70 points) for 20% deviation", async ({ page }) => {
    // Pick Broken Bow property (Reference Mid: $96,000)
    // 20% deviation = $115,200 (within 25% Medium threshold)
    await page.locator("#btn-select-52345678").click();
    await page.waitForURL("**/workspace/52345678");

    await page.locator("#tab-analysis").click();
    await page.locator("#input-low-revenue").fill("90000");
    await page.locator("#input-mid-revenue").fill("115000");
    await page.locator("#input-high-revenue").fill("130000");

    await page.locator("#tab-review").click();
    await page.locator("#btn-submit-underwriting").click();
    await page.waitForURL("**/evaluation");

    // Verify Medium score (70)
    await expect(page.locator("#score-accuracy-display")).toHaveText("70");
    await expect(page.getByText("Medium Band (70 pts)")).toBeVisible();
  });

  test("4. Alternate Path: Low Band Score (40 points) for >25% deviation", async ({ page }) => {
    // Pick Broken Bow property (Reference Mid: $96,000)
    // Guess $180,000 (>25% off)
    await page.locator("#btn-select-52345678").click();
    await page.waitForURL("**/workspace/52345678");

    await page.locator("#tab-analysis").click();
    await page.locator("#input-low-revenue").fill("150000");
    await page.locator("#input-mid-revenue").fill("180000");
    await page.locator("#input-high-revenue").fill("210000");

    await page.locator("#tab-review").click();
    await page.locator("#btn-submit-underwriting").click();
    await page.waitForURL("**/evaluation");

    // Verify Low score (40)
    await expect(page.locator("#score-accuracy-display")).toHaveText("40");
    await expect(page.getByText("Low Band (40 pts)")).toBeVisible();
  });

  test("5. Validation and Edge States: Incomplete Mid forecast blocks submission", async ({ page }) => {
    await page.locator("#btn-select-63456789").click();
    await page.waitForURL("**/workspace/63456789");

    // Go directly to Review without setting Mid revenue
    await page.locator("#tab-review").click();

    // Submit button should be disabled
    const submitBtn = page.locator("#btn-submit-underwriting");
    await expect(submitBtn).toBeDisabled();
    await expect(page.getByText("Required for scoring!")).toBeVisible();
  });

  test("6. Draft Saving & Resuming Workflow", async ({ page }) => {
    await page.locator("#btn-select-74567890").click();
    await page.waitForURL("**/workspace/74567890");

    // Edit purchase price
    await page.locator("#input-purchase-price").fill("710000");

    // Click Save Draft
    await page.locator("#btn-save-draft").click();
    await expect(page.getByText("Draft saved successfully")).toBeVisible();

    // Return to dashboard
    await page.locator("#nav-dashboard-tab").click();
    await page.waitForURL("**/");

    // Check status updated to In Progress
    const card = page.locator("#property-card-74567890");
    await expect(card).toContainText("In Progress");

    // Resume Underwriting
    await card.getByRole("button", { name: /Resume Underwriting/ }).click();
    await page.waitForURL("**/workspace/74567890");
    await expect(page.locator("#input-purchase-price")).toHaveValue("710000");
  });

  test("7. Trainee Leaderboard View and Cohort Standings", async ({ page }) => {
    await page.locator("#nav-leaderboard-tab").click();
    await page.waitForURL("**/leaderboard");

    await expect(page.locator("h1")).toContainText("Analyst Cohort Performance & Leaderboard");
    await expect(page.locator("#card-leaderboard-table")).toBeVisible();
    await expect(page.getByText("You (Analyst Trainee)")).toBeVisible();
    await expect(page.getByText("Sarah Chen")).toBeVisible();
  });
});
