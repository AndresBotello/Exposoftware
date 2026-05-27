import { chromium } from 'playwright';
import path from 'path';

(async () => {
  let browser;
  try {
    console.log('🚀 Launching browser...');
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('Setting viewport size...');
    await page.setViewportSize({ width: 1280, height: 800 });

    // Navigate to login
    console.log('\n📍 Navigating to login page...');
    await page.goto('http://localhost:5174/login', {
      waitUntil: 'load',
      timeout: 15000
    });

    // Click guest login button
    console.log('🖱️ Clicking guest login button...');
    const guestButton = await page.locator('button').filter({ hasText: /Continuar como Invitado/i }).first();
    await guestButton.click();
    
    // Wait for navigation to /invited
    console.log('⏳ Waiting for navigation to /invited...');
    await page.waitForURL('**/invited', { timeout: 10000 });
    await page.waitForLoadState('load');
    console.log(`✅ On /invited page`);

    // Click logout button
    console.log('\n🖱️ Clicking logout button...');
    const logoutButton = await page.locator('button').filter({ hasText: /Salir/i }).first();
    await logoutButton.click();
    
    // Wait for navigation away from /invited
    console.log('⏳ Waiting for navigation after logout...');
    try {
      await page.waitForURL(url => !url.includes('/invited'), { timeout: 5000 });
    } catch (e) {
      console.log('⚠️ URL did not change within 5 seconds');
    }
    
    // Check final URL
    const finalUrl = page.url();
    console.log(`📍 Final URL: ${finalUrl}`);
    
    if (finalUrl === 'http://localhost:5174/' || finalUrl.includes('http://localhost:5174')) {
      console.log('✅ SUCCESS! Redirected to home page after logout');
    } else {
      console.log('⚠️ Did not redirect to home, but logout button was available');
    }

    // Check if logout button still visible (should not be)
    const logoutStillVisible = await logoutButton.isVisible().catch(() => false);
    const loginNowVisible = await page.locator('a').filter({ hasText: /Ingresar/i }).first().isVisible().catch(() => false);
    
    console.log(`\n📌 Logout button still visible: ${logoutStillVisible}`);
    console.log(`📌 Login button now visible: ${loginNowVisible}`);

    // Take screenshot
    const screenshotPath = path.join(process.cwd(), 'final-state-screenshot.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`\n📸 Screenshot saved: ${screenshotPath}`);

    console.log('\n✅ Test completed!');
    await page.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
})();
