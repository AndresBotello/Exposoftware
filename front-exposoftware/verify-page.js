import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    console.log('🚀 Navegando a http://localhost:5174/admin/crear-invitado-egresado...');
    const response = await page.goto('http://localhost:5174/admin/crear-invitado-egresado', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    console.log(`✅ Página cargada: ${response.status()}`);

    // Esperar a que React renderice el contenido
    await page.waitForSelector('main, .min-h-screen', { timeout: 10000 }).catch(() => {
      console.log('⚠️ No se encontró selector específico, continuando...');
    });

    // Captura 1: Página inicial
    console.log('📸 Tomando captura de la página inicial...');
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '01-initial-page.png'),
      fullPage: true
    });
    console.log('✅ Guardada: 01-initial-page.png');

    // Verificar elementos en la página
    console.log('\n🔍 Verificando elementos en la página...');

    const title = await page.$eval('h1', el => el.innerText).catch(() => 'No encontrado');
    console.log(`  Título: ${title}`);

    // Buscar botones de cualquier tipo
    const buttons = await page.$$eval('button', btns => btns.map(b => b.innerText));
    console.log(`  Botones en la página: ${buttons.length > 0 ? buttons.join(', ') : 'ninguno'}`);

    // Buscar elementos de formulario
    console.log('\n🔍 Buscando elementos de formulario...');
    const inputs = await page.$$eval('input', inputs => inputs.map(i => ({ type: i.type, name: i.name, placeholder: i.placeholder })));
    console.log(`  Campos input encontrados: ${inputs.length}`);
    if (inputs.length > 0) {
      inputs.slice(0, 5).forEach((inp, i) => {
        console.log(`    ${i+1}. ${inp.type || 'text'} - ${inp.name || inp.placeholder || 'sin etiqueta'}`);
      });
    }

    // Buscar tablas
    console.log('\n🔍 Buscando tabla de datos...');
    const tables = await page.$$('table');
    console.log(`  Tablas encontradas: ${tables.length}`);
    if (tables.length > 0) {
      const rows = await page.$$eval('table tr', rows => rows.length);
      console.log(`    Filas en tabla: ${rows}`);
    }

    // Intentar cambiar a egresados si existen botones
    if (buttons.length > 1) {
      console.log('\n🔄 Intentando cambiar de tab...');
      const allButtons = await page.$$('button');
      for (let btn of allButtons) {
        const text = await page.evaluate(el => el.innerText, btn);
        if (text.includes('Egresado') || text.includes('egresado')) {
          await btn.click();
          await page.waitForTimeout(500);
          console.log(`✅ Hizo clic en: ${text}`);
          break;
        }
      }

      await page.screenshot({
        path: path.join(SCREENSHOTS_DIR, '02-after-interaction.png'),
        fullPage: true
      });
      console.log('📸 Captura después de interacción: 02-after-interaction.png');
    }

    // Captura final
    console.log('\n📸 Tomando captura final...');
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '03-final-state.png'),
      fullPage: true
    });
    console.log('✅ Guardada: 03-final-state.png');

    console.log('\n✅ Verificación completada exitosamente');
    console.log(`📁 Capturas guardadas en: ${SCREENSHOTS_DIR}`);

  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
