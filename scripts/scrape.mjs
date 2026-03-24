// Sigma Connect Catalog Scraper - CDP Direct
// Connects to existing Chrome browser and scrapes all OTC categories
import http from 'http';
import WebSocket from 'ws';
import fs from 'fs';
import path from 'path';

const CDP_PORT = 18800;
const DATA_DIR = 'C:\\Users\\MJ\\projects\\CostPlusChemist\\data';
const OUTPUT_FILE = path.join(DATA_DIR, 'sigma_catalog.ndjson');
const PROGRESS_FILE = path.join(DATA_DIR, 'scrape_progress.txt');

const CATEGORIES = [
  {name:'Allergy-Hayfever', url:'/c/Product/Medicines-OTC-and-FOS/Allergy-and-Hayfever/c/10003001'},
  {name:'Childrens-Health', url:'/c/Product/Medicines-OTC-and-FOS/Childrens-Health/c/10003003'},
  {name:'Cough-Cold', url:'/c/Product/Medicines-OTC-and-FOS/Cough-and-Cold/c/10003016'},
  {name:'Eye-Ear', url:'/c/Product/Medicines-OTC-and-FOS/Eye-and-Ear/c/10003006'},
  {name:'First-Aid', url:'/c/Product/Medicines-OTC-and-FOS/First-Aid-and-Wound-Care/c/10003015'},
  {name:'General-OTC-S3', url:'/c/Product/Medicines-OTC-and-FOS/General-Otc-S3/c/10003017'},
  {name:'Pain-Relief', url:'/c/Product/Medicines-OTC-and-FOS/Pain-Relief/c/10003008'},
  {name:'Sleeping-Aids', url:'/c/Product/Medicines-OTC-and-FOS/Sleeping-Aids/c/10003011'},
  {name:'Smoking-Cessation', url:'/c/Product/Medicines-OTC-and-FOS/Smoking-Cessation/c/10003012'},
  {name:'Viral-Antifungal', url:'/c/Product/Medicines-OTC-and-FOS/Viral-and-Antifungal/c/10003014'},
  {name:'Digestive-Health', url:'/c/Product/Health-and-Wellbeing/Digestive-Health/c/10004007'},
  {name:'Health-Management', url:'/c/Product/Health-and-Wellbeing/Health-Management/c/10004001'},
  {name:'Medical-Aids', url:'/c/Product/Health-and-Wellbeing/Medical-Aids/c/10004002'},
  {name:'Natural-Medicine', url:'/c/Product/Health-and-Wellbeing/Natural-Medicine/c/10004003'},
  {name:'Nutrition', url:'/c/Product/Health-and-Wellbeing/Nutrition/c/10004004'},
  {name:'Sports-Medicine', url:'/c/Product/Health-and-Wellbeing/Sports-Medicine/c/10004006'},
  {name:'Weight-Management', url:'/c/Product/Health-and-Wellbeing/Weight-Management/c/10004005'},
  {name:'Cosmetics', url:'/c/Product/Beauty-Skincare-and-Haircare/Cosmetics/c/10005001'},
  {name:'Cotton', url:'/c/Product/Beauty-Skincare-and-Haircare/Cotton/c/10005025'},
  {name:'Gifting', url:'/c/Product/Beauty-Skincare-and-Haircare/Gifting-And-Promotion/c/10005026'},
  {name:'Hair-Care', url:'/c/Product/Beauty-Skincare-and-Haircare/Hair-Care/c/10005002'},
  {name:'Medicated-Hair', url:'/c/Product/Beauty-Skincare-and-Haircare/Medicated-Hair-Care/c/10005003'},
  {name:'Medicated-Skin', url:'/c/Product/Beauty-Skincare-and-Haircare/Medicated-Skin/c/10005004'},
  {name:'Skincare', url:'/c/Product/Beauty-Skincare-and-Haircare/Skincare/c/10005005'},
  {name:'Suncare', url:'/c/Product/Beauty-Skincare-and-Haircare/Suncare/c/10005006'},
  {name:'Aromatherapy', url:'/c/Product/Personal-Care/Aromatherapy/c/10006010'},
  {name:'Deodorant', url:'/c/Product/Personal-Care/Deodorant/c/10006001'},
  {name:'Depilatory', url:'/c/Product/Personal-Care/Depilatory/c/10006002'},
  {name:'Family-Planning', url:'/c/Product/Personal-Care/Family-Planning/c/10006003'},
  {name:'Feminine-Hygiene', url:'/c/Product/Personal-Care/Feminine-Hygiene/c/10006004'},
  {name:'Men-Toiletries', url:'/c/Product/Personal-Care/Men-Toiletries/c/10006007'},
  {name:'Oral-Care', url:'/c/Product/Personal-Care/Oral-Care/c/10006009'},
  {name:'Soaps-Bath', url:'/c/Product/Personal-Care/Soaps-and-Bath/c/10006008'},
  {name:'Baby', url:'/c/Product/General-Merchandise-and-Baby/Baby/c/10008001'},
  {name:'Batteries', url:'/c/Product/General-Merchandise-and-Baby/Batteries/c/10008002'},
  {name:'Food-Drink', url:'/c/Product/General-Merchandise-and-Baby/Food-and-Drink/c/10008005'},
  {name:'Footcare', url:'/c/Product/General-Merchandise-and-Baby/Footcare/c/10008006'},
  {name:'Household', url:'/c/Product/General-Merchandise-and-Baby/Household-and-Domestic/c/10008007'},
  {name:'Incontinence', url:'/c/Product/General-Merchandise-and-Baby/Incontinence/c/10008009'},
  {name:'Independent-Living', url:'/c/Product/General-Merchandise-and-Baby/Independent-Living/c/10008008'},
  {name:'Travel', url:'/c/Product/General-Merchandise-and-Baby/Travel/c/10008010'},
];

const EXTRACT_JS = `(() => {
  const items = document.querySelectorAll('.product-item.js-product-price-item');
  const products = [];
  items.forEach(el => {
    const code = el.getAttribute('data-code') || '';
    const name = el.getAttribute('data-productname') || '';
    const price = el.getAttribute('data-productprice') || '';
    const listPrice = el.getAttribute('data-listprice') || '';
    const brand = el.getAttribute('data-productbrand') || '';
    const schedEl = el.querySelector('.js-toggle-sashes-schedule');
    const schedule = schedEl ? schedEl.childNodes[0].textContent.trim() : '';
    const imgEl = el.querySelector('img[src*="medias"]');
    const img = imgEl ? imgEl.src.split('?')[0] : '';
    const stockEl = el.querySelector('[class*="availability"] span');
    const stockRaw = stockEl ? stockEl.textContent.trim() : '';
    const stockMatch = stockRaw.match(/(\\d+)\\s+in stock/);
    const stock = stockMatch ? parseInt(stockMatch[1]) : (stockRaw.includes('no longer') ? -1 : (stockRaw.includes('cannot supply') ? -2 : (stockRaw.includes('back order') ? -3 : 0)));
    products.push({c:code,n:name,p:price,lp:listPrice,b:brand,s:schedule,st:stock,i:img});
  });
  const nextEl = document.querySelector('.pagination-next a');
  return JSON.stringify({
    products,
    hasNext: !!nextEl,
    nextUrl: nextEl ? nextEl.href : null,
    count: products.length
  });
})()`;

async function getTargets() {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${CDP_PORT}/json`, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function connectToTab(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    ws.on('open', () => resolve(ws));
    ws.on('error', reject);
  });
}

let msgId = 0;
function sendCommand(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++msgId;
    const timeout = setTimeout(() => reject(new Error(`Timeout: ${method}`)), 30000);
    
    const handler = (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.id === id) {
        clearTimeout(timeout);
        ws.removeListener('message', handler);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function navigate(ws, url) {
  await sendCommand(ws, 'Page.navigate', { url });
  // Wait for page load
  await new Promise(r => setTimeout(r, 3000));
}

async function evaluate(ws, expression) {
  const result = await sendCommand(ws, 'Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: false
  });
  if (result.result && result.result.value) return result.result.value;
  if (result.result && result.result.type === 'string') return result.result.value;
  return null;
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('Sigma Connect Catalog Scraper');
  console.log('=============================');
  
  // Clear output file
  fs.writeFileSync(OUTPUT_FILE, '');
  
  // Get browser targets
  const targets = await getTargets();
  const pageTarget = targets.find(t => t.type === 'page' && t.url.includes('sigmaconnect'));
  
  if (!pageTarget) {
    console.error('No Sigma Connect tab found! Opening one...');
    // Use first available page
    const anyPage = targets.find(t => t.type === 'page');
    if (!anyPage) { console.error('No browser tabs!'); process.exit(1); }
    var ws = await connectToTab(anyPage.webSocketDebuggerUrl);
    await navigate(ws, 'https://www.sigmaconnect.com.au/');
    await sleep(3000);
  } else {
    var ws = await connectToTab(pageTarget.webSocketDebuggerUrl);
  }
  
  await sendCommand(ws, 'Page.enable');
  
  let totalProducts = 0;
  
  for (let i = 0; i < CATEGORIES.length; i++) {
    const cat = CATEGORIES[i];
    console.log(`\n[${i+1}/${CATEGORIES.length}] ${cat.name}`);
    
    let pageUrl = `https://www.sigmaconnect.com.au${cat.url}?resultPerPage=50`;
    let pageNum = 0;
    let catProducts = 0;
    
    while (pageUrl) {
      pageNum++;
      console.log(`  Page ${pageNum}...`);
      
      try {
        await navigate(ws, pageUrl);
        await sleep(2000);
        
        const resultStr = await evaluate(ws, EXTRACT_JS);
        if (!resultStr) {
          console.log('  No result, skipping page');
          break;
        }
        
        const result = JSON.parse(resultStr);
        console.log(`  ${result.count} products`);
        
        if (result.count === 0) break;
        
        // Add category and save each product as NDJSON line
        const lines = result.products.map(p => {
          p.cat = cat.name;
          return JSON.stringify(p);
        }).join('\n') + '\n';
        
        fs.appendFileSync(OUTPUT_FILE, lines);
        catProducts += result.count;
        totalProducts += result.count;
        
        pageUrl = result.hasNext ? result.nextUrl : null;
        
        await sleep(1500);
      } catch (err) {
        console.error(`  Error: ${err.message}`);
        break;
      }
    }
    
    console.log(`  Category done: ${catProducts} products`);
    fs.writeFileSync(PROGRESS_FILE, `Category ${i+1}/${CATEGORIES.length}: ${cat.name}\nTotal products: ${totalProducts}\n`);
  }
  
  console.log(`\n=== COMPLETE ===`);
  console.log(`Total: ${totalProducts} products`);
  console.log(`File: ${OUTPUT_FILE}`);
  
  ws.close();
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
