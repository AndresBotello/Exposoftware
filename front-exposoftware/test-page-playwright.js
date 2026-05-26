const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  let browser;
  try {
    console.log('Launching browser...');
    browser = await chromium.launch();
    const page = await browser.newPage();
    
    console.log('Setting viewport size...');
    await page.setViewportSize({ width: 1280, height: 800 });
    
    console.log('Navigating to http://localhost:5174/admin/crear-invitado-egresado...');
    await page.goto('http://localhost:5174/admin/crear-invitado-egresado', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    console.log('✅ Page loaded successfully!\n');
    
    // Check page title
    const title = await page.title();
    console.log('📄 Page Title:', title);
    
    // Check for main heading
    const mainHeading = await page.locator('h1').first().textContent();
    console.log('📝 Main Heading:', mainHeading);
    
    // Wait for tabs to be visible
    await page.waitForSelector('button', { timeout: 5000 });
    
    // Get all buttons to find tabs
    const buttons = await page.locator('button').allTextContents();
    console.log('\n🔘 Buttons/Tabs Found:', buttons.slice(0, 10).join(', '));
    
    // Check for form sections
    const formSections = await page.locator('h3').allTextContents();
    console.log('\n📋 Form Sections:', formSections.join(' | '));
    
    // Check for specific form fields
    const labels = await page.locator('label').allTextContents();
    console.log('\n📝 Form Labels (first 10):', labels.slice(0, 10).join(', '));
    
    // Test tab switching - click on Egresados tab
    console.log('\n=== Testing Tab Navigation ===');
    const egresadosTab = await page.locator('button:has-text("Egresados")').first();
    if (await egresadosTab.isVisible()) {
      console.log('✅ Egresados tab found');
      await egresadosTab.click();
      await page.waitForTimeout(500);
      const egresadosHeading = await page.locator('h2').first().textContent();
      console.log('✅ After clicking Egresados:', egresadosHeading);
    }
    
    // Test Ver tab
    const verTab = await page.locator('button:has-text("Ver")').first();
    if (await verTab.isVisible()) {
      console.log('✅ Ver tab found');
      await verTab.click();
      await page.waitForTimeout(500);
      const verHeading = await page.locator('h2').first().textContent();
      console.log('✅ After clicking Ver:', verHeading);
    }
    
    // Click back to Crear tab
    const crearTab = await page.locator('button:has-text("Crear")').first();
    await crearTab.click();
    await page.waitForTimeout(500);
    
    // Take screenshot
    const screenshotPath = 'guest-graduate-page-screenshot.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`\n📸 Screenshot saved as: ${screenshotPath}`);
    
    // Test filling in a form field
    console.log('\n=== Testing Form Interaction ===');
    const firstNameInput = await page.locator('input[name="primerNombre"]');
    if (await firstNameInput.isVisible()) {
      await firstNameInput.fill('Juan');
      const value = await firstNameInput.inputValue();
      console.log(`✅ First name field: typed "Juan", value is now "${value}"`);
      
      // Take screenshot of partially filled form
      await page.screenshot({ path: 'partially-filled-form.png', fullPage: true });
      console.log('📸 Partially filled form screenshot saved');
    }
    
    console.log('\n✅ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.error('⚠️  Make sure the dev server is running on localhost:5174');
    }
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
})();
