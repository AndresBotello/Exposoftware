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
    console.log('\n📍 Step 1: Navigating to login page...');
    await page.goto('http://localhost:5174/login', {
      waitUntil: 'load',
      timeout: 15000
    });

    // Click guest login button
    console.log('📍 Step 2: Clicking guest login button...');
    const guestButton = await page.locator('button').filter({ hasText: /Continuar como Invitado/i }).first();
    console.log(`   - Guest button found: ${await guestButton.isVisible()}`);
    await guestButton.click();
    
    // Wait for navigation to /invited
    console.log('📍 Step 3: Waiting for navigation to /invited...');
    await page.waitForURL('**/invited', { timeout: 10000 });
    await page.waitForLoadState('load');
    const invitedUrl = page.url();
    console.log(`   ✅ On page: ${invitedUrl}`);

    // Wait a bit for the page to fully render
    await page.waitForTimeout(1000);

    // Check logout button
    console.log('\n📍 Step 4: Looking for logout button...');
    const logoutButton = await page.locator('button').filter({ hasText: /Salir/i }).first();
    const logoutVisible = await logoutButton.isVisible().catch(() => false);
    console.log(`   - Logout button visible: ${logoutVisible}`);

    if (!logoutVisible) {
      console.log('❌ FAIL: Logout button not found, cannot proceed with test');
      process.exit(1);
    }

    // Click logout button
    console.log('\n📍 Step 5: Clicking logout button...');
    await logoutButton.click();
    console.log('   - Button clicked');

    // Wait for potential navigation and page updates
    console.log('📍 Step 6: Waiting for page updates...');
    await page.waitForTimeout(2000);

    // Check current URL
    const afterLogoutUrl = page.url();
    console.log(`   - Current URL after logout: ${afterLogoutUrl}`);

    // Try to find logout button again
    console.log('\n📍 Step 7: Checking if logout button still exists...');
    const logoutStillVisible = await logoutButton.isVisible().catch(() => false);
    const loginVisible = await page.locator('a').filter({ hasText: /Ingresar/i }).first().isVisible().catch(() => false);
    console.log(`   - Logout button still visible: ${logoutStillVisible}`);
    console.log(`   - Login button now visible: ${loginVisible}`);

    // Check page content
    console.log('\n📍 Step 8: Checking page content...');
    const h1 = await page.locator('h1').first().textContent().catch(() => 'not found');
    console.log(`   - Main heading: ${h1}`);

    if (afterLogoutUrl === 'http://localhost:5174/' || afterLogoutUrl === 'http://localhost:5174') {
      console.log('\n✅ SUCCESS: Navigated to home page');
    } else if (!logoutStillVisible && loginVisible) {
      console.log('\n✅ SUCCESS: Logout button disappeared and login button appeared');
    } else if (!logoutStillVisible) {
      console.log('\n⚠️ PARTIAL: Logout button disappeared but not on home page');
    } else {
      console.log('\n❌ FAIL: Still on /invited with logout button visible');
    }

    // Take screenshot
    const screenshotPath = path.join(process.cwd(), 'logout-debug-screenshot.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`\n📸 Screenshot saved: ${screenshotPath}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
})();
