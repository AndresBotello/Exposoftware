const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Set viewport size
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to the page
    console.log('Navigating to page...');
    await page.goto('http://localhost:5174/admin/crear-invitado-egresado', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    console.log('Page loaded successfully!');
    
    // Check for key elements
    console.log('\n=== Checking for page elements ===');
    
    const title = await page.evaluate(() => document.title);
    console.log('Page title:', title);
    
    const mainHeading = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? h1.textContent : 'Not found';
    });
    console.log('Main heading:', mainHeading);
    
    // Take screenshot
    await page.screenshot({ path: 'guest-graduate-page.png', fullPage: true });
    console.log('\nScreenshot saved as guest-graduate-page.png');
    
    // Check for tabs
    const tabs = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.filter(b => b.textContent.includes('Invitados') || b.textContent.includes('Egresados') || b.textContent.includes('Crear') || b.textContent.includes('Ver')).map(b => b.textContent);
    });
    console.log('Found tabs:', tabs);
    
    // Check for form fields
    const formFields = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, select'));
      return inputs.slice(0, 10).map(i => ({type: i.type || i.tagName, name: i.name, placeholder: i.placeholder}));
    });
    console.log('\n=== First 10 form fields ===');
    formFields.forEach((field, i) => {
      console.log(`${i+1}. ${field.type} - ${field.name || field.placeholder}`);
    });
    
    await browser.close();
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
