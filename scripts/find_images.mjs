import http from 'http';
import WebSocket from 'ws';

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

let msgId = 0;
function sendCommand(ws, method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++msgId;
    const timeout = setTimeout(() => reject(new Error('Timeout')), 30000);
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

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const targets = await getTargets();
  const tab = targets.find(t => t.type === 'page' && t.url.includes('sigmaconnect'));
  if (!tab) { console.error('No sigma tab'); process.exit(1); }
  
  const ws = await new Promise((r, j) => {
    const w = new WebSocket(tab.webSocketDebuggerUrl);
    w.on('open', () => r(w));
    w.on('error', j);
  });
  
  await sendCommand(ws, 'Page.enable');
  
  // Navigate to a product listing page
  console.log('Navigating to Pain Relief category...');
  await sendCommand(ws, 'Page.navigate', { url: 'https://www.sigmaconnect.com.au/c/Product/Medicines-OTC-and-FOS/Pain-Relief/c/10003008?resultPerPage=20' });
  await sleep(5000);
  
  // Find all image elements on the page
  const result = await sendCommand(ws, 'Runtime.evaluate', {
    expression: 'JSON.stringify(Array.from(document.querySelectorAll("img")).filter(i => i.src && i.src.length > 10).slice(0, 10).map(i => ({src: i.src, loaded: i.naturalWidth > 0, w: i.naturalWidth, h: i.naturalHeight})))',
    returnByValue: true
  });
  
  console.log('Images on page:');
  const imgs = JSON.parse(result.result.value);
  imgs.forEach(img => console.log(`  ${img.loaded ? 'OK' : 'FAIL'} ${img.w}x${img.h} ${img.src.substring(0, 100)}`));
  
  // Check if images use a different URL pattern now
  const allSrcs = await sendCommand(ws, 'Runtime.evaluate', {
    expression: 'JSON.stringify(Array.from(document.querySelectorAll("[style*=background], [data-src], [data-lazy]")).slice(0,5).map(e => ({tag: e.tagName, style: e.style.backgroundImage?.substring(0,100), dataSrc: e.dataset.src, dataLazy: e.dataset.lazy})))',
    returnByValue: true
  });
  console.log('\nLazy/bg images:', allSrcs.result.value);
  
  // Check product items specifically
  const productImgs = await sendCommand(ws, 'Runtime.evaluate', {
    expression: 'JSON.stringify(Array.from(document.querySelectorAll(".product-item img, .product-image img, [class*=product] img")).slice(0,5).map(i => ({src: i.src, dataSrc: i.dataset?.src, loaded: i.naturalWidth > 0})))',
    returnByValue: true
  });
  console.log('\nProduct images:', productImgs.result.value);
  
  ws.close();
}

main().catch(err => { console.error(err); process.exit(1); });
