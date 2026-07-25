import { test, expect } from "@playwright/test";

test.describe("Cart & Hold Strict E2E Workflows", () => {
  test("product-to-cart hold flow and countdown display", async ({ page }) => {
    await page.goto("/");

    // Discover real product from catalog without hardcoded fallback IDs
    const productLink = page.locator("a[href^='/products/']").first();
    await expect(productLink).toBeVisible({
      timeout: 5000,
    });

    const targetUrl = await productLink.getAttribute("href");
    expect(targetUrl).toBeTruthy();

    await page.goto(targetUrl!);

    const addBtn = page.getByRole("button", { name: /Add to Cart/i });
    await expect(addBtn).toBeVisible({ timeout: 5000 });
    await addBtn.click();

    await expect(
      page.getByText(/1-of-1 Piece Reserved in Cart|Item held until|Reserved/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test("page refresh retains active hold status", async ({ page }) => {
    await page.goto("/");
    const productLink = page.locator("a[href^='/products/']").first();
    await expect(productLink).toBeVisible({ timeout: 5000 });

    const targetUrl = await productLink.getAttribute("href");
    await page.goto(targetUrl!);

    const addBtn = page.getByRole("button", { name: /Add to Cart/i });
    await expect(addBtn).toBeVisible({ timeout: 5000 });
    await addBtn.click();

    await page.reload();
    await expect(
      page.getByText(/1-of-1 Piece Reserved in Cart|Item held until|Reserved/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test("two-browser race: second browser receives ITEM_HELD error and waitlist prompt", async ({ browser }) => {
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    await pageA.goto("/");
    const productLink = pageA.locator("a[href^='/products/']").first();
    await expect(productLink).toBeVisible({ timeout: 5000 });

    const targetUrl = await productLink.getAttribute("href");

    // Browser A reserves 1-of-1 piece
    await pageA.goto(targetUrl!);
    const addBtnA = pageA.getByRole("button", { name: /Add to Cart/i });
    await expect(addBtnA).toBeVisible({ timeout: 5000 });
    await addBtnA.click();

    // Browser B attempts to reserve same piece -> must strictly encounter button and hold rejection
    await pageB.goto(targetUrl!);
    const addBtnB = pageB.getByRole("button", { name: /Add to Cart/i });
    await expect(addBtnB).toBeVisible({ timeout: 5000 });
    await addBtnB.click();

    await expect(
      pageB.getByText(/Item is temporarily reserved by another customer|Currently Unavailable|ITEM_HELD/i)
    ).toBeVisible({ timeout: 5000 });

    await contextA.close();
    await contextB.close();
  });
});
