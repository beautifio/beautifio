import { test, expect } from '@playwright/test';

test.describe('Tebak Aku E2E Flow', () => {
  test('should complete a full game from start to finish', async ({ page }) => {
    // 1. Go to the lobby
    await page.goto('/tebak');
    await expect(page.getByRole('heading', { name: 'Tebak Aku' })).toBeVisible();

    // 2. Start matchmaking
    await page.getByRole('button', { name: 'Mulai Bermain' }).click();
    await expect(page).toHaveURL(/\/tebak\/.*/);

    // 3. Wait for matchmaking to complete and game to start (MatchIntro)
    // The bot matchmaking is fast, so we should land in the GameRoom quickly.
    await expect(page.getByRole('heading', { name: 'PERTANDINGAN' })).toBeVisible({ timeout: 20000 });
    
    // 4. Wait for MatchIntro countdown to finish
    await expect(page.getByText('MULAI!')).toBeVisible({ timeout: 15000 });

    // 5. Play through all 10 questions (2 rounds)
    for (let round = 1; round <= 2; round++) {
      for (let i = 1; i <= 5; i++) {
        await page.waitForTimeout(1000); // Wait for animations
        
        // Find the active question card
        const questionCard = page.locator('.animate-slideUpReveal');
        await expect(questionCard.getByText(`Pertanyaan ${i}/5`)).toBeVisible({ timeout: 30000 });

        // Click the first answer option. We don't care about being right or wrong.
        await questionCard.getByRole('button').first().click();

        // Wait for the JedaScreen to appear after the tension moment
        await expect(page.getByText(/Tebakan tepat|Meleset|Waktu habis/)).toBeVisible({ timeout: 10000 });
        
        // Wait for JedaScreen countdown to finish (server-timed, usually 3s)
        // We'll wait for the next question to appear as confirmation.
      }

      if (round === 1) {
        // After 5 questions, expect the RoundResultScreen
        await expect(page.getByRole('heading', { name: 'Babak 1 Selesai' })).toBeVisible({ timeout: 10000 });
        // Wait for it to pass (server-timed, 8s)
      }
    }

    // 6. After 10 questions, expect the WinnerScreen
    await expect(page.getByRole('heading', { name: /Kamu Menang|Kamu Kalah|SERI/ })).toBeVisible({ timeout: 20000 });
    await expect(page.getByText('Tingkat Kecocokan')).toBeVisible();

    // 7. Test the rematch button
    await page.getByRole('button', { name: 'Main Lagi' }).click();
    await expect(page.getByText(/Menunggu/)).toBeVisible();
  });
});
