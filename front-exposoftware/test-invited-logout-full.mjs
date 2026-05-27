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

    // Step 1: Navigate to login page
    console.log('\n📍 Step 1: Navigating to login page...');
    await page.goto('http://localhost:5174/login', {
      waitUntil: 'load',
      timeout: 15000
    });
    console.log(`✅ Currently on: ${page.url()}`);

    // Step 2: Click "Continuar como Invitado" button
    console.log('\n📍 Step 2: Looking for guest login button...');
    const guestButton = await page.locator('button').filter({ hasText: /Continuar como Invitado/i }).first();
    const isGuestButtonVisible = await guestButton.isVisible().catch(() => false);
    
    if (isGuestButtonVisible) {
      console.log('✅ Guest login button found');
      console.log('🖱️ Clicking guest login button...');
      await guestButton.click();
      
      // Wait for navigation and page load
      console.log('⏳ Waiting for navigation...');
      await page.waitForURL('**/invited', { timeout: 10000 });
      await page.waitForLoadState('load');
      
      const currentUrl = page.url();
      console.log(`✅ Navigated to: ${currentUrl}`);

      // Step 3: Check for logout button
      console.log('\n📍 Step 3: Checking for logout button...');
      await page.waitForTimeout(1000);
      
      const logoutButton = await page.locator('button').filter({ hasText: /Salir/i }).first();
      const logoutButtonVisible = await logoutButton.isVisible().catch(() => false);
      const loginButton = await page.locator('a').filter({ hasText: /Ingresar/i }).first();
      const loginButtonVisible = await loginButton.isVisible().catch(() => false);

      console.log(`📌 Logout button visible: ${logoutButtonVisible}`);
      console.log(`📌 Login button visible: ${loginButtonVisible}`);

      if (logoutButtonVisible) {
        console.log('✅ SUCCESS! Logout button is visible for authenticated guest');
        
        // Step 4: Test logout functionality
        console.log('\n📍 Step 4: Testing logout functionality...');
        console.log('🖱️ Clicking logout button...');
        await logoutButton.click();
        
        // Wait for navigation
        await page.waitForLoadState('load');
        
        const afterLogoutUrl = page.url();
        console.log(`📍 After logout URL: ${afterLogoutUrl}`);
        
        if (afterLogoutUrl.includes('/') && !afterLogoutUrl.includes('/invited')) {
          console.log('✅ SUCCESS! Logged out and redirected to home page');
        } else {
          console.log('❌ Failed to redirect after logout');
        }
      } else if (loginButtonVisible) {
        console.log('⚠️ FAIL: Login button found instead of logout button');
        console.log('ℹ️ Guest login did not authenticate the user');
      } else {
        console.log('❌ FAIL: Neither logout nor login button found');
      }
    } else {
      console.log('❌ FAIL: Guest login button not found');
    }

    // Take screenshot
    const screenshotPath = path.join(process.cwd(), 'invited-logout-test.png');
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
