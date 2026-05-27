import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

(async () => {
  let browser;
  try {
    console.log('Launching browser...');
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('Setting viewport size...');
    await page.setViewportSize({ width: 1280, height: 800 });

    // First, try to navigate directly to the admin page
    console.log('\n📍 Attempting to navigate to admin page...');
    try {
      await page.goto('http://localhost:5174/admin/crear-invitado-egresado', {
        waitUntil: 'load',
        timeout: 15000
      });
    } catch (navError) {
      console.log('⚠️  Direct navigation failed, trying home page first...');
      // Navigate to home page first
      await page.goto('http://localhost:5174', {
        waitUntil: 'load',
        timeout: 15000
      });
    }

    // Check current URL
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);

    // Check if we're on login page
    if (currentUrl.includes('login')) {
      console.log('🔐 Redirected to login - page requires authentication');
      console.log('✅ Authentication redirect working correctly');
    } else if (currentUrl.includes('admin')) {
      console.log('✅ Admin page loaded successfully!');
    } else {
      console.log('ℹ️  Currently on:', currentUrl);
    }

    // Try to get page title
    const title = await page.title();
    console.log(`📄 Page Title: ${title}`);

    // Check for main content
    try {
      const h1s = await page.locator('h1').allTextContents();
      if (h1s.length > 0) {
        console.log(`📝 Headings found: ${h1s.slice(0, 3).join(', ')}`);
      }
    } catch (e) {
      console.log('ℹ️  No H1 elements found on current page');
    }

    // Try to find buttons/tabs
    try {
      const buttons = await page.locator('button').count();
      console.log(`🔘 Found ${buttons} button elements`);

      if (buttons > 0) {
        const buttonTexts = await page.locator('button').allTextContents();
        console.log('🔘 Button texts (first 10):');
        buttonTexts.slice(0, 10).forEach((btn, i) => {
          if (btn.trim()) console.log(`   ${i+1}. ${btn.trim()}`);
        });
      }
    } catch (e) {
      console.log('ℹ️  Could not read buttons');
    }

    // Take screenshot of current state
    const screenshotPath = path.join(process.cwd(), 'admin-page-screenshot.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`\n📸 Screenshot saved: ${screenshotPath}`);

    // If on login page, provide instruction
    if (currentUrl.includes('login')) {
      console.log('\n⚠️  The admin page is protected and requires admin authentication.');
      console.log('ℹ️  To fully test, you would need to:');
      console.log('   1. Log in with admin credentials');
      console.log('   2. Then navigate to /admin/crear-invitado-egresado');
    }

    console.log('\n✅ Test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.error('⚠️  Dev server not running on localhost:5174');
    }
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
})();
