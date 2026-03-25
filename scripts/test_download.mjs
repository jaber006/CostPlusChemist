// Test: use CDP Network.getResponseBody to intercept actual image loading
import http from 'http';
import WebSocket from 'ws';
import fs from 'fs';

const CDP_PORT = 9222;

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
function send(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++mid;
    const timeout = setTimeout(() => reject(new Error('Timeout')), 30000);
    const handler = (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.id === id) { clearTimeout(timeout); ws.removeListener('message', handler); resolve(msg); }
    };
    ws.on('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function evaluate(ws, expr) {
  const r = await send(ws, 'Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  return r.result?.result?.value;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const targets = await getTargets();
  const tab = targets.find(t => t.type === 'page' && t.url.includes('sigmaconnect'));
  if (!tab) { console.error('No sigma tab'); process.exit(1); }
  
  const ws = await new Promise((r,j) => { const w = new WebSocket(tab.webSocketDebuggerUrl); w.on('open',()=>r(w)); w.on('error',j); });
  
  // Method: Use fetch with blob, then read via FileReader
  const testUrl = 'https://www.sigmaconnect.com.au/medias/300Wx300H-baseFormat-9314567000597-front';
  
  // Test 1: Direct fetch as blob -> base64 
  console.log('Test 1: fetch blob...');
  const r1 = await evaluate(ws, `
    (async () => {
      try {
        const resp = await fetch("${testUrl}", {credentials: 'include'});
        if (!resp.ok) return JSON.stringify({ok:false, status: resp.status, statusText: resp.statusText});
        const blob = await resp.blob();
        return JSON.stringify({ok:true, size: blob.size, type: blob.type});
      } catch(e) { return JSON.stringify({ok:false, error: e.message}); }
    })()
  `);
  console.log('  Result:', r1);
  
  // Test 2: Navigate to the image URL directly and grab via Page.captureScreenshot
  console.log('Test 2: Check what URL pattern works on the page...');
  
  // Load a product page to see what image URLs the page actually renders
  await send(ws, 'Page.enable');
  await send(ws, 'Page.navigate', { url: 'https://www.sigmaconnect.com.au/c/Product/Medicines-OTC-and-FOS/Pain-Relief/c/10003008' });
  await sleep(4000);
  
  const imgUrls = await evaluate(ws, `
    JSON.stringify(
      Array.from(document.querySelectorAll('img'))
        .filter(i => i.src.includes('medias') && i.naturalWidth > 0)
        .slice(0, 3)
        .map(i => ({src: i.src, w: i.naturalWidth, h: i.naturalHeight}))
    )
  `);
  console.log('  Working images on page:', imgUrls);
  
  // Test 3: Try fetching one of the FULL URLs (with context param) that actually work on the page
  const workingImgs = JSON.parse(imgUrls);
  if (workingImgs.length > 0) {
    const fullUrl = workingImgs[0].src;
    console.log('Test 3: Fetch full URL with context param...');
    console.log('  URL:', fullUrl.substring(0, 120) + '...');
    
    const r3 = await evaluate(ws, `
      (async () => {
        try {
          const resp = await fetch("${fullUrl}", {credentials: 'include'});
          if (!resp.ok) return JSON.stringify({ok:false, status: resp.status});
          const blob = await resp.blob();
          const reader = new FileReader();
          return new Promise(resolve => {
            reader.onload = () => resolve(JSON.stringify({ok:true, size: blob.size, type: blob.type, dataLen: reader.result.length}));
            reader.readAsDataURL(blob);
          });
        } catch(e) { return JSON.stringify({ok:false, error: e.message}); }
      })()
    `);
    console.log('  Result:', r3);
    
    // Test 4: Canvas approach with the FULL url
    console.log('Test 4: Canvas with full URL...');
    const r4 = await evaluate(ws, `
      (async () => {
        return new Promise(resolve => {
          const img = new Image();
          img.crossOrigin = '';
          img.onload = () => {
            const c = document.createElement('canvas');
            c.width = img.naturalWidth; c.height = img.naturalHeight;
            c.getContext('2d').drawImage(img, 0, 0);
            try {
              const d = c.toDataURL('image/jpeg', 0.85);
              resolve(JSON.stringify({ok:true, dataLen: d.length, w: img.naturalWidth}));
            } catch(e) { resolve(JSON.stringify({ok:false, error:'tainted: '+e.message})); }
          };
          img.onerror = () => resolve(JSON.stringify({ok:false, error:'load failed'}));
          setTimeout(() => resolve(JSON.stringify({ok:false, error:'timeout'})), 10000);
          img.src = "${fullUrl}";
        });
      })()
    `);
    console.log('  Result:', r4);
    
    // Test 5: No crossOrigin attribute
    console.log('Test 5: Canvas WITHOUT crossOrigin...');
    const r5 = await evaluate(ws, `
      (async () => {
        return new Promise(resolve => {
          const img = new Image();
          img.onload = () => {
            const c = document.createElement('canvas');
            c.width = img.naturalWidth; c.height = img.naturalHeight;
            c.getContext('2d').drawImage(img, 0, 0);
            try {
              const d = c.toDataURL('image/jpeg', 0.85);
              resolve(JSON.stringify({ok:true, dataLen: d.length, w: img.naturalWidth}));
            } catch(e) { resolve(JSON.stringify({ok:false, error:'tainted: '+e.message})); }
          };
          img.onerror = () => resolve(JSON.stringify({ok:false, error:'load failed'}));
          setTimeout(() => resolve(JSON.stringify({ok:false, error:'timeout'})), 10000);
          img.src = "${fullUrl}";
        });
      })()
    `);
    console.log('  Result:', r5);
  }
  
  ws.close();
}

main().catch(e => { console.error(e); process.exit(1); });
