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
    const timeout = setTimeout(() => reject(new Error(`Timeout`)), 30000);
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

async function main() {
  const targets = await getTargets();
  const tab = targets.find(t => t.type === 'page' && t.url.includes('sigmaconnect'));
  if (!tab) { console.error('No sigma tab'); process.exit(1); }
  
  const ws = await new Promise((resolve, reject) => {
    const w = new WebSocket(tab.webSocketDebuggerUrl);
    w.on('open', () => resolve(w));
    w.on('error', reject);
  });
  
  const testUrl = 'https://www.sigmaconnect.com.au/medias/300Wx300H-baseFormat-9341571004877-front';
  console.log('Testing image URL:', testUrl);
  
  // Test 1: Simple fetch
  const r1 = await sendCommand(ws, 'Runtime.evaluate', {
    expression: `
      (async () => {
        try {
          const resp = await fetch("${testUrl}");
          return JSON.stringify({status: resp.status, ok: resp.ok, type: resp.headers.get('content-type'), size: resp.headers.get('content-length')});
        } catch(e) {
          return JSON.stringify({error: e.message});
        }
      })()
    `,
    returnByValue: true,
    awaitPromise: true
  });
  console.log('Fetch result:', r1.result?.value);
  
  // Test 2: Try with credentials
  const r2 = await sendCommand(ws, 'Runtime.evaluate', {
    expression: `
      (async () => {
        try {
          const resp = await fetch("${testUrl}", {credentials: 'include'});
          return JSON.stringify({status: resp.status, ok: resp.ok, type: resp.headers.get('content-type'), size: resp.headers.get('content-length')});
        } catch(e) {
          return JSON.stringify({error: e.message});
        }
      })()
    `,
    returnByValue: true,
    awaitPromise: true
  });
  console.log('Fetch with credentials:', r2.result?.value);
  
  // Test 3: Try loading as img element
  const r3 = await sendCommand(ws, 'Runtime.evaluate', {
    expression: `
      (async () => {
        return new Promise(resolve => {
          const img = new Image();
          img.onload = () => resolve(JSON.stringify({loaded: true, width: img.naturalWidth, height: img.naturalHeight}));
          img.onerror = (e) => resolve(JSON.stringify({loaded: false, error: 'img load failed'}));
          img.src = "${testUrl}";
        });
      })()
    `,
    returnByValue: true,
    awaitPromise: true
  });
  console.log('Image element test:', r3.result?.value);
  
  // Test 4: Get cookies
  const cookies = await sendCommand(ws, 'Network.getCookies', { urls: ['https://www.sigmaconnect.com.au/'] });
  console.log('Cookies:', cookies.cookies?.length, 'cookies found');
  cookies.cookies?.forEach(c => console.log(`  ${c.name}: ${c.value.substring(0,20)}...`));
  
  ws.close();
}

main().catch(err => { console.error(err); process.exit(1); });
