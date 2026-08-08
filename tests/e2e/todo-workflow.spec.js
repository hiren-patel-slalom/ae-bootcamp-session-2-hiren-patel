const { test, expect } = require('@playwright/test');

test('user can create and complete a task from the UI', async ({ page }) => {
  await page.goto('http://127.0.0.1:3000');

  await expect(page.getByRole('heading', { name: /todo list/i })).toBeVisible();

  await page.getByLabel('Title').fill('Playwright task');
  await page.getByLabel('Description').fill('Created by Playwright');
  await page.getByLabel('Due Date').fill('2026-09-30');
  await page.getByRole('button', { name: /add task/i }).click();

  await expect(page.getByText(/task added successfully/i)).toBeVisible();

  const taskRow = page.locator('li[aria-label="Task Playwright task"]').first();
  await expect(taskRow).toBeVisible();
  await taskRow.getByRole('button', { name: /mark complete for playwright task/i }).click();

  await expect(page.getByText(/task completed/i)).toBeVisible();
  await expect(page.locator('li[aria-label="Task Playwright task"]').first()).toBeVisible({ timeout: 10000 });
});
