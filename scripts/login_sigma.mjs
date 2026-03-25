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

async function evaluate(ws, expression) {
  const result = await sendCommand(ws, 'Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true
  });
  return result.result?.value;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const targets = await getTargets();
  const tab = targets.find(t => t.type === 'page' && !t.url.startsWith('chrome-extension'));
  if (!tab) { console.error('No tab found'); process.exit(1); }
  
  const ws = await new Promise((resolve, reject) => {
    const w = new WebSocket(tab.webSocketDebuggerUrl);
    w.on('open', () => resolve(w));
    w.on('error', reject);
  });
  
  await sendCommand(ws, 'Page.enable');
  
  console.log('Navigating to SigmaConnect...');
  await sendCommand(ws, 'Page.navigate', { url: 'https://www.sigmaconnect.com.au/' });
  await sleep(6000);
  
  let url = await evaluate(ws, 'window.location.href');
  console.log('Current URL:', url);
  
  // Fill login
  console.log('Filling credentials...');
  await evaluate(ws, `
    const fields = document.querySelectorAll('input');
    let userF = null, passF = null;
    fields.forEach(f => {
      if (f.name === 'j_username' || f.id === 'j_username' || f.type === 'email') userF = f;
      if (f.name === 'j_password' || f.id === 'j_password' || f.type === 'password') passF = f;
    });
    if (userF) {
      userF.value = 'leganapharmacy@watsonsgroup.com.au';
      userF.dispatchEvent(new Event('input', {bubbles:true}));
      userF.dispatchEvent(new Event('change', {bubbles:true}));
    }
    if (passF) {
      passF.value = 'Sigma1';
      passF.dispatchEvent(new Event('input', {bubbles:true}));
      passF.dispatchEvent(new Event('change', {bubbles:true}));
    }
    JSON.stringify({user: !!userF, pass: !!passF})
  `);
  
  await sleep(1000);
  
  // Click submit
  console.log('Clicking login...');
  await evaluate(ws, `
    const btn = document.querySelector('button[type="submit"]') || 
                document.querySelector('#loginFormSubmit') ||
                document.querySelector('.btn-login') ||
                document.querySelector('form button') ||
                document.querySelector('[class*="login"] button');
    if (btn) btn.click();
    !!btn
  `);
  
  await sleep(8000);
  
  url = await evaluate(ws, 'window.location.href');
  console.log('After login URL:', url);
  
  const loggedIn = !url.includes('login');
  console.log(loggedIn ? 'LOGIN SUCCESS' : 'LOGIN FAILED - may need manual login');
  
  ws.close();
}

main().catch(err => { console.error(err); process.exit(1); });
