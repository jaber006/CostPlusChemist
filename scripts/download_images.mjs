// Sigma Image Downloader - uses authenticated Chrome session via CDP
// Downloads product images from SigmaConnect using the browser's cookies
import http from 'http';
import WebSocket from 'ws';
import fs from 'fs';
import path from 'path';

const CDP_PORT = 9222;
const DATA_DIR = 'C:\\Users\\MJ\\projects\\CostPlusChemist\\data';
const IMG_DIR = 'C:\\Users\\MJ\\projects\\CostPlusChemist\\public\\images\\products';
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const BATCH_SIZE = 5; // concurrent downloads
const DELAY_MS = 200; // delay between batches

// Ensure image directory exists
if (!fs.existsSync(IMG_DIR)) {
  fs.mkdirSync(IMG_DIR, { recursive: true });
}

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
    expression,
    returnByValue: true,
    awaitPromise: true
  });
  if (result.result && result.result.value !== undefined) return result.result.value;
  return null;
}

async function downloadImage(ws, url, savePath) {
  // Use browser's fetch to download with cookies, return as base64
  const js = `
    (async () => {
      try {
        const resp = await fetch("${url}");
        if (!resp.ok) return { error: resp.status };
        const blob = await resp.blob();
        const reader = new FileReader();
        return new Promise(resolve => {
          reader.onload = () => resolve({ data: reader.result.split(',')[1], type: blob.type });
          reader.readAsDataURL(blob);
        });
      } catch(e) {
        return { error: e.message };
      }
    })()
  `;
  
  const result = await evaluate(ws, js);
  if (!result || result.error) {
    return false;
  }
  
  const buffer = Buffer.from(result.data, 'base64');
  fs.writeFileSync(savePath, buffer);
  return true;
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('Sigma Image Downloader');
  console.log('======================\n');
  
  // Load products
  const data = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
  const products = data.products.filter(p => p.imageUrl && p.imageUrl.includes('sigmaconnect'));
  console.log(`Products with Sigma image URLs: ${products.length}`);
  
  // Check which images we already have
  const existing = new Set();
  if (fs.existsSync(IMG_DIR)) {
    fs.readdirSync(IMG_DIR).forEach(f => existing.add(f.replace(/\.\w+$/, '')));
  }
  
  const toDownload = products.filter(p => !existing.has(p.code));
  console.log(`Already downloaded: ${existing.size}`);
  console.log(`To download: ${toDownload.length}\n`);
  
  if (toDownload.length === 0) {
    console.log('All images already downloaded!');
    updateProductPaths(data);
    return;
  }
  
  // Connect to Chrome
  const targets = await getTargets();
  const pageTarget = targets.find(t => t.type === 'page' && t.url.includes('sigmaconnect'));
  const target = pageTarget || targets.find(t => t.type === 'page');
  
  if (!target) {
    console.error('No browser tabs found! Make sure Chrome is running with --remote-debugging-port=18800');
    process.exit(1);
  }
  
  console.log(`Connected to: ${target.url}`);
  
  // If not on sigma, navigate there first
  const ws = await connectToTab(target.webSocketDebuggerUrl);
  await sendCommand(ws, 'Page.enable');
  
  if (!target.url.includes('sigmaconnect')) {
    console.log('Navigating to SigmaConnect...');
    await sendCommand(ws, 'Page.navigate', { url: 'https://www.sigmaconnect.com.au/' });
    await sleep(3000);
  }
  
  let downloaded = 0;
  let failed = 0;
  const failedProducts = [];
  const startTime = Date.now();
  
  for (let i = 0; i < toDownload.length; i++) {
    const product = toDownload[i];
    const ext = 'jpg';
    const filename = `${product.code}.${ext}`;
    const savePath = path.join(IMG_DIR, filename);
    
    try {
      const ok = await downloadImage(ws, product.imageUrl, savePath);
      if (ok) {
        downloaded++;
      } else {
        failed++;
        failedProducts.push(product.code);
      }
    } catch (err) {
      failed++;
      failedProducts.push(product.code);
    }
    
    // Progress
    if ((i + 1) % 50 === 0 || i === toDownload.length - 1) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
      const rate = (downloaded / (elapsed || 1)).toFixed(1);
      const eta = ((toDownload.length - i) / (rate || 1) / 60).toFixed(1);
      console.log(`[${i + 1}/${toDownload.length}] Downloaded: ${downloaded} | Failed: ${failed} | ${rate}/sec | ETA: ${eta}min`);
    }
    
    // Small delay to be nice
    if ((i + 1) % BATCH_SIZE === 0) {
      await sleep(DELAY_MS);
    }
  }
  
  console.log(`\n=== COMPLETE ===`);
  console.log(`Downloaded: ${downloaded}`);
  console.log(`Failed: ${failed}`);
  
  if (failedProducts.length > 0) {
    fs.writeFileSync(path.join(DATA_DIR, 'failed_images.json'), JSON.stringify(failedProducts, null, 2));
    console.log(`Failed product codes saved to data/failed_images.json`);
  }
  
  // Update product paths
  updateProductPaths(data);
  
  ws.close();
}

function updateProductPaths(data) {
  console.log('\nUpdating products.json with local image paths...');
  let updated = 0;
  
  data.products.forEach(p => {
    const localPath = `/images/products/${p.code}.jpg`;
    const fullPath = path.join(IMG_DIR, `${p.code}.jpg`);
    
    if (fs.existsSync(fullPath)) {
      p.imageUrl = localPath;
      updated++;
    } else if (p.imageUrl && p.imageUrl.includes('sigmaconnect')) {
      // Keep blank if we couldn't download
      p.imageUrl = '';
    }
  });
  
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data, null, 2));
  console.log(`Updated ${updated} products with local image paths`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
