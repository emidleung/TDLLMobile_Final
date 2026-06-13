import puppeteer from 'puppeteer';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
       console.log('PAGE ERROR LOG:', msg.text());
    }
  });
  page.on('pageerror', err => console.log('PAGE EXCEPTION STACK:', err.stack));

  try {
    // 1. Visit page directly to see launch page
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    console.log('Page loaded');
    
    // Clear storage to force seeing launch page
    await page.evaluate(() => {
        localStorage.clear();
    });
    
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await wait(2000);
    console.log('Taking screenshot of splash screen');
    await page.screenshot({ path: 'splash-screen-initial.png' });
    
    // Select language
    await page.click('#bg-btn-en');
    await wait(1500); // Wait for GSAP animation to run
    
    console.log('Taking screenshot after selecting language (mid GSAP animation)');
    await page.screenshot({ path: 'splash-screen-animating.png' });
    
  } catch (err) {
    console.error('Script Error:', err);
  } finally {
    await browser.close();
  }
})();
