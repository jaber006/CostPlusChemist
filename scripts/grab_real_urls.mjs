// Grab REAL working image URLs from Sigma product listing pages
// The images on the page have ?context= params that make them work
import http from 'http';
import WebSocket from 'ws';
import fs from 'fs';
import path from 'path';

const CDP_PORT = 9222;
const NDJSON_FILE = 'C:\\Users\\MJ\\projects\\CostPlusChemist\\data\\sigma_catalog.ndjson';

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

// Extract JS that gets product code + FULL image URL (with context param)
const EXTRACT_JS = `(() => {
  const items = document.querySelectorAll('.product-item.js-product-price-item');
  const results = [];
  items.forEach(el => {
    const code = el.getAttribute('data-code') || '';
    const imgEl = el.querySelector('img[src*="medias"]');
    if (imgEl && imgEl.src && code) {
      results.push({code, img: imgEl.src});
    }
  });
  const nextEl = document.querySelector('.pagination-next a');
  return JSON.stringify({results, hasNext: !!nextEl, nextUrl: nextEl ? nextEl.href : null});
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

let mid = 0;
function sendCommand(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++mid;
    const timeout = setTimeout(() => reject(new Error('Timeout')), 30000);
    const handler = (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.id === id) { clearTimeout(timeout); ws.removeListener('message', handler); resolve(msg.result || msg); }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  console.log('Sigma Image URL Collector');
  console.log('========================\n');
  
  const targets = await getTargets();
  const tab = targets.find(t => t.type === 'page' && t.url.includes('sigmaconnect'));
  if (!tab) { console.error('No sigma tab!'); process.exit(1); }
  
  const ws = await new Promise((r,j) => { const w = new WebSocket(tab.webSocketDebuggerUrl); w.on('open',()=>r(w)); w.on('error',j); });
  await sendCommand(ws, 'Page.enable');
  
  // Map: code -> full image URL (from page, with working format)
  const imageMap = {};
  let totalFound = 0;
  
  for (let ci = 0; ci < CATEGORIES.length; ci++) {
    const cat = CATEGORIES[ci];
    console.log(`[${ci+1}/${CATEGORIES.length}] ${cat.name}`);
    
    let pageUrl = `https://www.sigmaconnect.com.au${cat.url}?resultPerPage=50`;
    let page = 0;
    
    while (pageUrl) {
      page++;
      try {
        await sendCommand(ws, 'Page.navigate', { url: pageUrl });
        await sleep(3000);
        
        const result = await sendCommand(ws, 'Runtime.evaluate', {
          expression: EXTRACT_JS, returnByValue: true
        });
        
        const data = JSON.parse(result.result.value);
        
        data.results.forEach(r => {
          if (r.code && r.img) imageMap[r.code] = r.img;
        });
        
        totalFound += data.results.length;
        console.log(`  Page ${page}: ${data.results.length} images (total: ${totalFound})`);
        
        pageUrl = data.hasNext ? data.nextUrl : null;
        await sleep(1500);
      } catch (err) {
        console.error(`  Error: ${err.message}`);
        break;
      }
    }
  }
  
  console.log(`\nTotal image URLs collected: ${Object.keys(imageMap).length}`);
  
  // Save the image map
  fs.writeFileSync(path.join('C:\\Users\\MJ\\projects\\CostPlusChemist\\data', 'image_urls.json'), JSON.stringify(imageMap, null, 2));
  console.log('Saved to data/image_urls.json');
  
  // Now download each image using the browser
  console.log('\nDownloading images...');
  const codes = Object.keys(imageMap);
  const imgDir = 'C:\\Users\\MJ\\projects\\CostPlusChemist\\public\\images\\products';
  if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });
  
  let downloaded = 0, failed = 0;
  const startTime = Date.now();
  
  for (let i = 0; i < codes.length; i++) {
    const code = codes[i];
    const imgPath = path.join(imgDir, `${code}.jpg`);
    
    if (fs.existsSync(imgPath) && fs.statSync(imgPath).size > 1000) {
      downloaded++;
      continue;
    }
    
    const url = imageMap[code];
    
    try {
      // Escape the URL for embedding in JS string
      const safeUrl = url.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      const result = await sendCommand(ws, 'Runtime.evaluate', {
        expression: `
          (async () => {
            return new Promise((resolve) => {
              const img = new Image();
              img.onload = () => {
                const c = document.createElement('canvas');
                const maxSize = 400;
                let w = img.naturalWidth, h = img.naturalHeight;
                if (w > maxSize || h > maxSize) {
                  const scale = maxSize / Math.max(w, h);
                  w = Math.round(w * scale);
                  h = Math.round(h * scale);
                }
                c.width = w; c.height = h;
                c.getContext('2d').drawImage(img, 0, 0, w, h);
                try {
                  resolve(JSON.stringify({ok:true, data: c.toDataURL('image/jpeg', 0.8).split(',')[1]}));
                } catch(e) { resolve(JSON.stringify({ok:false})); }
              };
              img.onerror = () => resolve(JSON.stringify({ok:false}));
              setTimeout(() => resolve(JSON.stringify({ok:false, error:'timeout'})), 15000);
              img.src = "${safeUrl}";
            });
          })()
        `,
        returnByValue: true,
        awaitPromise: true
      });
      
      const r = JSON.parse(result.result.value);
      if (r.ok && r.data) {
        const buf = Buffer.from(r.data, 'base64');
        if (buf.length > 1000) {
          fs.writeFileSync(imgPath, buf);
          downloaded++;
        } else { failed++; }
      } else { failed++; }
    } catch { failed++; }
    
    if ((i + 1) % 50 === 0 || i === codes.length - 1) {
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = downloaded / (elapsed || 1);
      console.log(`[${i+1}/${codes.length}] OK: ${downloaded} | FAIL: ${failed} | ${rate.toFixed(1)}/s`);
    }
    
    if ((i + 1) % 5 === 0) await sleep(50);
  }
  
  console.log(`\nComplete: ${downloaded} downloaded, ${failed} failed`);
  
  // Update products.json
  const prodData = JSON.parse(fs.readFileSync('C:\\Users\\MJ\\projects\\CostPlusChemist\\data\\products.json', 'utf8'));
  let updated = 0;
  prodData.products.forEach(p => {
    const f = path.join(imgDir, `${p.code}.jpg`);
    if (fs.existsSync(f) && fs.statSync(f).size > 1000) {
      p.imageUrl = `/images/products/${p.code}.jpg`;
      updated++;
    }
  });
  fs.writeFileSync('C:\\Users\\MJ\\projects\\CostPlusChemist\\data\\products.json', JSON.stringify(prodData, null, 2));
  console.log(`Updated ${updated} product paths in products.json`);
  
  ws.close();
}

main().catch(err => { console.error(err); process.exit(1); });
