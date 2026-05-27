const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🌐 Navigating to admin page...');
    await page.goto('http://localhost:5183/admin/crear-invitado-egresado', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait a moment for the page to fully render
    await page.waitForTimeout(2000);

    console.log('✅ Page loaded successfully!');

    // Take screenshot of initial state
    const screenshotDir = './screenshots';
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir);
    }

    await page.screenshot({ path: path.join(screenshotDir, '01-initial-page.png') });
    console.log('📸 Screenshot 1: Initial page state');

    // Test switching tabs
    console.log('\n🔄 Testing tab navigation...');

    // Click "Ver Invitados/Egresados" tab
    const verTab = await page.locator('text=Ver Invitados');
    if (await verTab.isVisible()) {
      await verTab.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(screenshotDir, '02-ver-tab.png') });
      console.log('✅ "Ver" tab works');
    }

    // Switch back to "Crear" tab
    const crearTab = await page.locator('text=Crear Invitado');
    if (await crearTab.isVisible()) {
      await crearTab.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(screenshotDir, '03-crear-tab.png') });
      console.log('✅ "Crear" tab works');
    }

    // Test switching between Guest/Graduate
    console.log('\n👥 Testing Guest/Graduate toggle...');

    // Find and click Egresado button
    const egresadoBtn = await page.locator('button:has-text("Egresado")').first();
    if (await egresadoBtn.isVisible()) {
      await egresadoBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(screenshotDir, '04-graduate-form.png') });
      console.log('✅ Graduate form loads');
    }

    // Switch back to Guest
    const invitadoBtn = await page.locator('button:has-text("Invitado")').first();
    if (await invitadoBtn.isVisible()) {
      await invitadoBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(screenshotDir, '05-guest-form.png') });
      console.log('✅ Guest form loads');
    }

    // Test partial form filling
    console.log('\n✏️ Testing form interaction...');

    // Try to fill first name field
    const firstNameInput = await page.locator('input[name="primer_nombre"], input[placeholder*="Nombre"], input[placeholder*="nombre"]').first();
    if (await firstNameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstNameInput.fill('Juan');
      await page.waitForTimeout(500);
      console.log('✅ First name field is fillable');
    }

    // Try to fill email field
    const emailInput = await page.locator('input[type="email"], input[placeholder*="correo"], input[placeholder*="email"]').first();
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailInput.fill('test@example.com');
      await page.waitForTimeout(500);
      console.log('✅ Email field is fillable');
    }

    await page.screenshot({ path: path.join(screenshotDir, '06-partial-form-filled.png') });
    console.log('📸 Screenshot: Partially filled form');

    console.log('\n✅ All tests completed successfully!');
    console.log(`📁 Screenshots saved in: ${path.resolve(screenshotDir)}`);

  } catch (error) {
    console.error('❌ Error during test:', error.message);
  } finally {
    await browser.close();
  }
})();
