// Sigma Image Downloader v2 - Downloads using CDP Network.getResponseBody
// Navigates through product pages and captures images with full context params
import http from 'http';
import WebSocket from 'ws';
import fs from 'fs';
import path from 'path';

const CDP_PORT = 9222;
const DATA_DIR = 'C:\\Users\\MJ\\projects\\CostPlusChemist\\data';
const IMG_DIR = 'C:\\Users\\MJ\\projects\\CostPlusChemist\\public\\images\\products';
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR, { recursive: true });

async function getTargets() {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${CDP_PORT}/json`, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

let msgId = 0;
function sendCommand(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++msgId;
    const timeout = setTimeout(() => reject(new Error(`Timeout: ${method}`)), 60000);
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

async function evaluate(ws, expression) {
  const result = await sendCommand(ws, 'Runtime.evaluate', {
    expression, returnByValue: true, awaitPromise: true
  });
  return result.result?.value;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Use canvas to convert image to base64 data
async function downloadViaCanvas(ws, imageUrl, code) {
  const js = `
    (async () => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'use-credentials';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          try {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            resolve(JSON.stringify({ok: true, data: dataUrl.split(',')[1], w: img.naturalWidth, h: img.naturalHeight}));
          } catch(e) {
            resolve(JSON.stringify({ok: false, error: 'canvas tainted'}));
          }
        };
        img.onerror = () => resolve(JSON.stringify({ok: false, error: 'load failed'}));
        setTimeout(() => resolve(JSON.stringify({ok: false, error: 'timeout'})), 15000);
        img.src = "${imageUrl}";
      });
    })()
  `;
  
  const resultStr = await evaluate(ws, js);
  if (!resultStr) return false;
  
  const result = JSON.parse(resultStr);
  if (!result.ok || !result.data) return false;
  
  const buffer = Buffer.from(result.data, 'base64');
  if (buffer.length < 1000) return false; // too small, probably an error image
  
  fs.writeFileSync(path.join(IMG_DIR, `${code}.jpg`), buffer);
  return true;
}

async function main() {
  console.log('Sigma Image Downloader v2 (Canvas method)');
  console.log('==========================================\n');
  
  const data = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
  const products = data.products.filter(p => p.imageUrl && p.imageUrl.includes('sigmaconnect'));
  console.log(`Products with Sigma image URLs: ${products.length}`);
  
  // Check existing
  const existing = new Set();
  if (fs.existsSync(IMG_DIR)) {
    fs.readdirSync(IMG_DIR).forEach(f => {
      const stat = fs.statSync(path.join(IMG_DIR, f));
      if (stat.size > 1000) existing.add(f.replace(/\.\w+$/, ''));
    });
  }
  
  const toDownload = products.filter(p => !existing.has(p.code));
  console.log(`Already downloaded: ${existing.size}`);
  console.log(`To download: ${toDownload.length}\n`);
  
  if (toDownload.length === 0) {
    console.log('All done!');
    updatePaths(data);
    return;
  }
  
  // Connect
  const targets = await getTargets();
  const tab = targets.find(t => t.type === 'page' && t.url.includes('sigmaconnect'));
  if (!tab) { console.error('No sigmaconnect tab!'); process.exit(1); }
  
  const ws = await new Promise((r, j) => {
    const w = new WebSocket(tab.webSocketDebuggerUrl);
    w.on('open', () => r(w));
    w.on('error', j);
  });
  
  console.log('Connected to:', tab.url);
  
  // First, navigate to a product page to ensure we're on the right domain
  await sendCommand(ws, 'Page.enable');
  
  let downloaded = 0, failed = 0;
  const startTime = Date.now();
  const failedCodes = [];
  
  // Process in batches - need to add ?context param
  // The working URLs on the page have ?context=... but our stored URLs don't
  // Let's try adding a wildcard context or fetching without it from the same domain
  
  for (let i = 0; i < toDownload.length; i++) {
    const p = toDownload[i];
    
    // Extract barcode from URL to build the correct format
    // URLs look like: .../medias/300Wx300H-baseFormat-9341571004877-front
    // On page they have: ...?context=bWFzdGVy...
    // Try the URL as-is first (we're on the same domain now)
    
    try {
      const ok = await downloadViaCanvas(ws, p.imageUrl, p.code);
      if (ok) {
        downloaded++;
      } else {
        failed++;
        failedCodes.push(p.code);
      }
    } catch (err) {
      failed++;
      failedCodes.push(p.code);
    }
    
    if ((i + 1) % 25 === 0 || i === toDownload.length - 1) {
      const elapsed = (Date.now() - startTime) / 1000;
      const rate = downloaded / (elapsed || 1);
      const remaining = toDownload.length - i - 1;
      const eta = rate > 0 ? (remaining / rate / 60).toFixed(1) : '?';
      console.log(`[${i + 1}/${toDownload.length}] OK: ${downloaded} | FAIL: ${failed} | ${rate.toFixed(1)}/s | ETA: ${eta}m`);
    }
    
    // Small delay every 10 images
    if ((i + 1) % 10 === 0) await sleep(100);
  }
  
  console.log(`\nDone: ${downloaded} downloaded, ${failed} failed`);
  
  if (failedCodes.length > 0) {
    fs.writeFileSync(path.join(DATA_DIR, 'failed_images.json'), JSON.stringify(failedCodes));
  }
  
  updatePaths(data);
  ws.close();
}

function updatePaths(data) {
  console.log('\nUpdating products.json...');
  let updated = 0;
  data.products.forEach(p => {
    const localFile = path.join(IMG_DIR, `${p.code}.jpg`);
    if (fs.existsSync(localFile) && fs.statSync(localFile).size > 1000) {
      p.imageUrl = `/images/products/${p.code}.jpg`;
      updated++;
    }
  });
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2));
  console.log(`Updated ${updated} product image paths`);
}

main().catch(err => { console.error(err); process.exit(1); });
