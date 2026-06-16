import puppeteer from 'puppeteer';
import { exec } from 'child_process';

async function check() {
  const server = exec('npm run dev -- --port 5174');
  
  // wait for server to start
  await new Promise(r => setTimeout(r, 3000));

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  
  await page.goto('http://localhost:5174');
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
  server.kill();
}
check();
