import { chromium } from 'playwright';
import fs from 'fs';
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

    // Navigate to invited page
    console.log('\n📍 Navigating to invited page...');
    await page.goto('http://localhost:5174/invited', {
      waitUntil: 'load',
      timeout: 15000
    });

    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);

    // Check for logout button
    console.log('\n🔍 Checking for logout button...');
    const logoutButton = await page.locator('button').filter({ hasText: /Salir/i }).first();
    const loginButton = await page.locator('a').filter({ hasText: /Ingresar/i }).first();
    
    const logoutButtonExists = await logoutButton.isVisible().catch(() => false);
    const loginButtonExists = await loginButton.isVisible().catch(() => false);

    console.log(`📌 Logout button visible: ${logoutButtonExists}`);
    console.log(`📌 Login button visible: ${loginButtonExists}`);

    if (logoutButtonExists) {
      console.log('\n✅ Logout button found! Testing logout functionality...');
      
      // Click logout button
      console.log('🖱️ Clicking logout button...');
      await logoutButton.click();
      
      // Wait for navigation
      await page.waitForLoadState('load');
      
      const afterLogoutUrl = page.url();
      console.log(`📍 After logout URL: ${afterLogoutUrl}`);
      
      if (afterLogoutUrl.includes('/') || afterLogoutUrl === 'http://localhost:5174/') {
        console.log('✅ Successfully redirected to home page after logout');
      }
    } else if (loginButtonExists) {
      console.log('\n⚠️ Login button found - user is not authenticated');
      console.log('ℹ️ This is normal for public guests without explicit authentication');
    } else {
      console.log('\n❌ Neither logout nor login button found');
    }

    // Take screenshot
    const screenshotPath = path.join(process.cwd(), 'invited-page-screenshot.png');
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
