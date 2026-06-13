const { JSDOM } = require('jsdom');
const fetch = require('node-fetch');
const fs = require('fs');

const recipesToSearch = [
  'cantonese steamed fish',
  'tomato egg stir fry',
  'garlic bok choy',
  'sweet and sour pork',
  'steamed garlic soy chicken',
  'beef chow fun',
  'mapo tofu',
  'steamed pork ribs black bean',
  'char siu pork',
  'shrimp fried rice'
];

async function scrapeCookpad(query) {
  try {
    const searchUrl = `https://cookpad.com/eng/search/${encodeURIComponent(query)}`;
    const searchRes = await fetch(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    });
    const searchHtml = await searchRes.text();
    const searchDom = new JSDOM(searchHtml);
    
    // Find first recipe link
    const recipeLink = searchDom.window.document.querySelector('a.block-link__main');
    if (!recipeLink) {
      console.log(`No recipe found for ${query}`);
      return null;
    }
    
    const recipeUrl = 'https://cookpad.com' + recipeLink.href;
    const recipeRes = await fetch(recipeUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const recipeHtml = await recipeRes.text();
    const recipeDom = new JSDOM(recipeHtml);
    const doc = recipeDom.window.document;
    
    // Cover image
    let coverImage = null;
    const coverImgEl = doc.querySelector('#recipe_image img, .recipe-show__image img, picture img');
    if (coverImgEl) coverImage = coverImgEl.src;
    
    // Step images
    const stepImages = [];
    const stepEls = doc.querySelectorAll('ol li[id^="step_"]');
    stepEls.forEach(stepEl => {
      const imgEl = stepEl.querySelector('img');
      if (imgEl && imgEl.src && !imgEl.src.includes('data:image')) {
        stepImages.push(imgEl.src);
      } else if (imgEl && imgEl.dataset && imgEl.dataset.src) {
         stepImages.push(imgEl.dataset.src);
      }
    });
    
    // Fallback: search Bing Images if no step images found
    if (stepImages.length === 0) {
      console.log(`No step images for ${query}, searching alternative...`);
      // We will handle alternative generation later
    }
    
    return { query, coverImage, stepImages };
  } catch (err) {
    console.error(`Error scraping ${query}:`, err.message);
    return null;
  }
}

async function run() {
  const results = {};
  for (const q of recipesToSearch) {
    console.log(`Scraping for ${q}...`);
    const data = await scrapeCookpad(q);
    if (data) {
      results[q] = data;
    }
    // Sleep to avoid rate limits
    await new Promise(r => setTimeout(r, 1500));
  }
  
  fs.writeFileSync('scraping_results.json', JSON.stringify(results, null, 2));
  console.log('Done!');
}

run();
