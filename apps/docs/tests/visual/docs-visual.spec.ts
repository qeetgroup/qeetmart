import { expect, test, type Page } from "@playwright/test";

async function stabilize(page: Page) {
  await page.addStyleTag({
    content: `
      *,
      *::before,
      *::after {
        animation: none !important;
        transition: none !important;
      }
    `,
  });
}

test("landing page visual baseline", async ({ page }) => {
  await page.goto("/");
  await stabilize(page);

  await expect(page).toHaveScreenshot("landing-page.png", {
    fullPage: true,
  });
});

test("quickstart docs visual baseline", async ({ page }) => {
  await page.goto("/docs/v1/getting-started/quickstart");
  await stabilize(page);

  await expect(page.locator("article")).toBeVisible();
  await expect(page).toHaveScreenshot("quickstart-doc.png", {
    fullPage: true,
  });
});

test("architecture page renders mermaid diagram", async ({ page }) => {
  await page.goto("/docs/v1/architecture/system-overview");
  await stabilize(page);

  await expect(page.locator("figure svg").first()).toBeVisible();
  await expect(page).toHaveScreenshot("architecture-mermaid-doc.png", {
    fullPage: true,
  });
});

test("api reference surfaces visual baseline", async ({ page }) => {
  await page.goto("/reference/v1");
  await stabilize(page);

  await expect(page.locator("article")).toBeVisible();
  await expect(page).toHaveScreenshot("api-reference-index.png", {
    fullPage: true,
  });

  await page.goto("/reference/v1/auth-service?env=local");
  await stabilize(page);

  await expect(page.locator(".swagger-ui")).toBeVisible();
  await expect(page).toHaveScreenshot("api-reference-service.png", {
    fullPage: true,
  });
});
