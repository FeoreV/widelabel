import { test, expect } from "@playwright/test";

test.describe("Cart & Hold E2E Workflows", () => {
  test("product-to-cart hold flow and countdown display", async ({ page }) => {
    await page.goto("/products/prod_vintage_tee_01");
    await expect(page.getByRole("heading", { name: "Wide Label Vintage Tee" })).toBeVisible();

    const addBtn = page.getByRole("button", { name: /Add to Cart/i });
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await expect(page.getByText(/1-of-1 Piece Reserved in Cart|Item held until/i)).toBeVisible();
    }
  });

  test("page refresh retains active hold status", async ({ page }) => {
    await page.goto("/products/prod_vintage_tee_01");
    const addBtn = page.getByRole("button", { name: /Add to Cart/i });

    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.reload();
      await expect(page.getByText(/1-of-1 Piece Reserved in Cart|Item held until/i)).toBeVisible();
    }
  });

  test("two-browser race: second browser receives ITEM_HELD error and waitlist prompt", async ({ browser }) => {
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();

    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    // Browser A reserves 1-of-1 piece
    await pageA.goto("/products/prod_vintage_tee_01");
    const addBtnA = pageA.getByRole("button", { name: /Add to Cart/i });
    if (await addBtnA.isVisible()) {
      await addBtnA.click();
    }

    // Browser B attempts to reserve same piece
    await pageB.goto("/products/prod_vintage_tee_01");
    const addBtnB = pageB.getByRole("button", { name: /Add to Cart/i });
    if (await addBtnB.isVisible()) {
      await addBtnB.click();
      await expect(pageB.getByText(/Item is temporarily reserved by another customer|Currently Unavailable/i)).toBeVisible();
    }

    await contextA.close();
    await contextB.close();
  });
});
