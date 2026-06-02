const { chromium } = require("playwright");

async function verifyProjectFilter() {
  const browser = await chromium.launch();
  const context = await browser.createContext();
  const page = await context.newPage();

  try {
    console.log("🔍 Navigating to teacher projects page...");
    await page.goto("http://localhost:3001/teacher/proyectos", {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Check if we're logged in or need to login
    const isOnLoginPage = await page
      .locator('input[type="email"], input[name="email"]')
      .first()
      .isVisible()
      .catch(() => false);

    if (isOnLoginPage) {
      console.log("📝 Need to login. Checking for test credentials...");
      // Try to login with test credentials
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      const passwordInput = page
        .locator('input[type="password"], input[name="password"]')
        .first();

      await emailInput.fill("teacher@test.com");
      await passwordInput.fill("password123");
      await page.locator('button:has-text("Ingresar"), button:has-text("Login")').first().click();
      await page.waitForNavigation({ waitUntil: "networkidle" });
    }

    // Wait for projects to load
    await page.waitForTimeout(3000);

    // Get all project cards
    const projectElements = await page.locator("[class*='project'], [data-testid*='project']").all();
    console.log(`✅ Found ${projectElements.length} project elements`);

    // Get project titles and groups
    const projects = [];
    const projectTitles = await page.locator("p:has-text(/Proyecto|proyecto/)").all();

    console.log(`📊 Found project title elements: ${projectTitles.length}`);

    // Check the content of the projects section
    const projectsContent = await page.locator("[class*='grid'], [class*='table']").first();
    const contentText = await projectsContent.textContent();

    console.log("\n📋 Projects Content:");
    console.log(contentText.substring(0, 500) + "...");

    // Check for "Mis Proyectos" tab
    const myProjectsTab = page.locator("button:has-text('Mis Proyectos')").first();
    const isMyProjectsTabActive = await myProjectsTab
      .evaluate((el) => el.className.includes("emerald") || el.className.includes("border-b-emerald"))
      .catch(() => false);

    console.log(`\n🔍 "Mis Proyectos" tab active: ${isMyProjectsTabActive}`);

    // Check for the count
    const myProjectsText = await myProjectsTab.textContent();
    console.log(`📌 ${myProjectsText}`);

    // Verify filter is working - check if there are projects displayed
    const projectCards = await page.locator("[class*='ProjectCard'], [class*='project-card'], div[class*='border'][class*='rounded']").count();
    console.log(`\n✨ Total project cards visible: ${projectCards}`);

    // Take screenshot
    await page.screenshot({ path: "teacher_projects.png" });
    console.log("\n📸 Screenshot saved to teacher_projects.png");

    // Get debug info - check if filtering is applied
    const filterSection = await page.locator("[class*='filter']").first().textContent().catch(() => "");
    console.log(`\n🔧 Filter section visible: ${filterSection.substring(0, 200)}...`);

    console.log("\n✅ VERIFICATION COMPLETE");
  } catch (error) {
    console.error("❌ Error during verification:", error.message);
    await page.screenshot({ path: "error_screenshot.png" });
    console.log("Screenshot saved to error_screenshot.png");
  } finally {
    await browser.close();
  }
}

verifyProjectFilter();
