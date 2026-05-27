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

    // Test 1: Access /invited without authentication
    console.log('\n═══════════════════════════════════════════');
    console.log('Test 1: Access /invited without authentication');
    console.log('═══════════════════════════════════════════');
    await page.goto('http://localhost:5174/invited', { waitUntil: 'load' });
    let hasLogoutBtn = await page.locator('button').filter({ hasText: /Salir/i }).first().isVisible().catch(() => false);
    let hasLoginLink = await page.locator('a').filter({ hasText: /Ingresar/i }).first().isVisible().catch(() => false);
    console.log(`✅ Logout button visible: ${hasLogoutBtn} (expected: false)`);
    console.log(`✅ Login button visible: ${hasLoginLink} (expected: true)`);

    // Test 2: Login as guest
    console.log('\n═══════════════════════════════════════════');
    console.log('Test 2: Login as guest');
    console.log('═══════════════════════════════════════════');
    await page.goto('http://localhost:5174/login', { waitUntil: 'load' });
    await page.locator('button').filter({ hasText: /Continuar como Invitado/i }).first().click();
    await page.waitForURL('**/invited', { timeout: 10000 });
    await page.waitForLoadState('load');
    
    hasLogoutBtn = await page.locator('button').filter({ hasText: /Salir/i }).first().isVisible().catch(() => false);
    hasLoginLink = await page.locator('a').filter({ hasText: /Ingresar/i }).first().isVisible().catch(() => false);
    console.log(`✅ Logout button visible: ${hasLogoutBtn} (expected: true)`);
    console.log(`✅ Login button visible: ${hasLoginLink} (expected: false)`);
    console.log(`✅ Current URL: ${page.url()}`);

    // Test 3: Logout
    console.log('\n═══════════════════════════════════════════');
    console.log('Test 3: Logout');
    console.log('═══════════════════════════════════════════');
    const logoutBtn = await page.locator('button').filter({ hasText: /Salir/i }).first();
    await logoutBtn.click();
    await page.waitForTimeout(2000);
    
    const urlAfterLogout = page.url();
    console.log(`✅ Current URL after logout: ${urlAfterLogout}`);
    console.log(`✅ Redirected to home: ${urlAfterLogout === 'http://localhost:5174/' || urlAfterLogout === 'http://localhost:5174'}`);
    
    hasLogoutBtn = await page.locator('button').filter({ hasText: /Salir/i }).first().isVisible().catch(() => false);
    hasLoginLink = await page.locator('a').filter({ hasText: /Ingresar/i }).first().isVisible().catch(() => false);
    console.log(`✅ Logout button visible: ${hasLogoutBtn} (expected: false)`);
    console.log(`✅ Login button visible: ${hasLoginLink} (expected: varies by page)`);

    // Test 4: Direct navigation to /invited after logout (should show login button)
    console.log('\n═══════════════════════════════════════════');
    console.log('Test 4: Navigate back to /invited after logout');
    console.log('═══════════════════════════════════════════');
    await page.goto('http://localhost:5174/invited', { waitUntil: 'load' });
    
    hasLogoutBtn = await page.locator('button').filter({ hasText: /Salir/i }).first().isVisible().catch(() => false);
    hasLoginLink = await page.locator('a').filter({ hasText: /Ingresar/i }).first().isVisible().catch(() => false);
    console.log(`✅ Logout button visible: ${hasLogoutBtn} (expected: false)`);
    console.log(`✅ Login button visible: ${hasLoginLink} (expected: true)`);

    // Take final screenshot
    const screenshotPath = path.join(process.cwd(), 'invited-complete-test.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`\n📸 Screenshot saved: ${screenshotPath}`);

    console.log('\n✅ All tests completed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
})();
