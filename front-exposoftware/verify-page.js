import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('🔵 Navigating to page...');
    await page.goto('http://localhost:5179/admin/crear-invitado-egresado', { waitUntil: 'networkidle' });

    await page.waitForSelector('h1', { timeout: 5000 });

    console.log('✅ Page loaded successfully');

    const heading = await page.textContent('h1');
    console.log(`📋 Page heading: ${heading}`);

    // Get all buttons to inspect them
    const buttons = await page.locator('button').allTextContents();
    console.log(`\n📑 Buttons found on page:`);
    buttons.forEach((btn, idx) => {
      console.log(`  ${idx + 1}. "${btn.trim()}"`);
    });

    // Try clicking Ver button with different selectors
    console.log('\n🔵 Testing tab switching...');
    const verButton = page.locator('button', { hasText: /Ver/ });
    const verCount = await verButton.count();
    console.log(`Found "${verCount}" button(s) with "Ver" text`);
    
    if (verCount > 0) {
      await verButton.first().click();
      await page.waitForTimeout(500);
      console.log('✅ Switched to "Ver" tab');

      await page.click('button:has-text("Crear")');
      await page.waitForTimeout(500);
      console.log('✅ Switched back to "Crear" tab');

      console.log('\n🔵 Testing user type switching...');
      await page.click('button', { hasText: /Invitado/ });
      await page.waitForTimeout(500);
      console.log('✅ Switched to Invitado');

      await page.click('button', { hasText: /Egresado/ });
      await page.waitForTimeout(500);
      console.log('✅ Switched to Egresado');

      console.log('\n🔵 Taking screenshot...');
      const screenshotPath = path.join(__dirname, 'verification-screenshot.png');
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`📸 Screenshot saved to: ${screenshotPath}`);
      console.log(`📍 Full path: ${screenshotPath}`);

      console.log('\n✅ Verification complete!');
    } else {
      console.log('⚠️ Could not find Ver button');
    }

  } catch (error) {
    console.error('❌ Error during verification:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
