import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: /Emerald Ape #042/ })).toBeVisible()
  await page.evaluate(async () => { await fetch('/api/reset', { method: 'POST' }); localStorage.removeItem('kurio-token'); sessionStorage.clear() })
  await page.reload()
})

test('início e detalhes', async ({ page }) => {
  await expect(page.getByRole('link', { name: /Emerald Ape #042/ })).toBeVisible()
  await expect(page).toHaveScreenshot('home.png', { animations: 'disabled', fullPage: true })
  await page.goto('/nft/042')
  await expect(page.getByRole('heading', { name: 'Emerald Ape #042' })).toBeVisible()
  await expect(page).toHaveScreenshot('detail.png', { animations: 'disabled', fullPage: true })
})

test('carrinho e pagamento', async ({ page }) => {
  await page.goto('/nft/042')
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click()
  await page.goto('/cart')
  await expect(page.getByText('1.206 ETH').and(page.locator(':visible')).first()).toBeVisible()
  await expect(page).toHaveScreenshot('cart.png', { animations: 'disabled', fullPage: true })
  await page.goto('/login')
  await page.getByLabel('E-mail').fill('ana@kurio.test')
  await page.getByLabel('Senha').fill('kurio1234')
  await page.getByRole('button', { name: 'Entrar' }).last().click()
  await page.goto('/checkout')
  await expect(page.getByText('1.206 ETH').and(page.locator(':visible')).first()).toBeVisible()
  await expect(page).toHaveScreenshot('checkout.png', { animations: 'disabled', fullPage: true })
})
