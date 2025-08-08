import { test, expect } from '@playwright/test'

test('главная открывается и отображает контент', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Ani|Каталог|Anime|Аниме/i)
  await expect(page.getByRole('main')).toBeVisible()
})


