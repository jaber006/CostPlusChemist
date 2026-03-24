// Extract all products from current Sigma Connect category page
// Run this via browser evaluate()
(() => {
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
    const img = imgEl ? imgEl.src : '';
    const stockEl = el.querySelector('.availability-text, .stock-text, [class*="availability"] span');
    const stock = stockEl ? stockEl.textContent.trim() : '';
    products.push({code, name, price, listPrice, brand, schedule, stock, img});
  });
  const nextEl = document.querySelector('.pagination-next a');
  const totalEl = document.querySelector('.pagination-bar-results');
  return JSON.stringify({
    count: products.length,
    products: products,
    hasNext: !!nextEl,
    nextUrl: nextEl ? nextEl.href : null,
    total: totalEl ? totalEl.textContent.trim() : ''
  });
})()
