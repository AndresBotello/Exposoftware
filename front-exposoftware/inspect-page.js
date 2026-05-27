import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('Navigating to page...');
    await page.goto('http://localhost:5179/admin/crear-invitado-egresado', { waitUntil: 'networkidle' });

    // Check current URL
    console.log('Current URL:', page.url());

    // Get page content
    const content = await page.content();
    const lines = content.split('\n').slice(0, 100);
    console.log('\n=== Page HTML (first 100 lines) ===');
    lines.forEach((line, idx) => {
      if (line.trim()) console.log(`${idx + 1}: ${line.substring(0, 150)}`);
    });

    // Check for specific text
    const bodyText = await page.textContent('body');
    console.log('\n=== Body Text ===');
    console.log(bodyText.substring(0, 500));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
