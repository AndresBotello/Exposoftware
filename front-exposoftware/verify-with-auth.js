import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Set authentication tokens in localStorage before navigating
    console.log('🔐 Setting authentication...');
    await page.goto('http://localhost:5179/', { waitUntil: 'domcontentloaded' });
    
    // Set mock admin user in localStorage
    const mockToken = 'mock_admin_token_' + Date.now();
    await page.evaluate(({ token }) => {
      localStorage.setItem('authToken', token);
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('userId', '1');
      localStorage.setItem('userName', 'Admin Usuario');
      localStorage.setItem('user', JSON.stringify({
        id_usuario: '1',
        rol: 'admin'
      }));
    }, { token: mockToken });
    
    console.log('✅ Auth token set');

    // Now navigate to admin page
    console.log('\n🔵 Navigating to admin page...');
    await page.goto('http://localhost:5179/admin/crear-invitado-egresado', { waitUntil: 'networkidle' });

    // Wait for main content
    await page.waitForTimeout(1000);

    const url = page.url();
    console.log(`📍 Current URL: ${url}`);

    // Get page heading
    const heading = await page.$eval('h1', el => el.textContent).catch(() => 'No h1 found');
    console.log(`📋 Page heading: ${heading}`);

    // Look for tabs
    const buttonTexts = await page.$$eval('button', buttons => buttons.map(b => b.textContent.trim()).filter(t => t));
    console.log(`\n📑 Buttons found (${buttonTexts.length}):`);
    buttonTexts.forEach((text, idx) => {
      if (text) console.log(`  ${idx + 1}. ${text}`);
    });

    // Take screenshot
    console.log('\n🔵 Taking screenshot...');
    const screenshotPath = path.join(__dirname, 'verification-screenshot.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved to: ${screenshotPath}`);

    console.log('\n✅ Verification complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    const errorPath = path.join(__dirname, 'error-screenshot.png');
    try {
      await page.screenshot({ path: errorPath });
      console.log(`📸 Error screenshot: ${errorPath}`);
    } catch (e) {}
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
