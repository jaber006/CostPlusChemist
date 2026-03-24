// Extracts all products from the current Sigma Connect category page
// Returns JSON array of products
(() => {
  const products = [];
  const rows = document.querySelectorAll('.item__list');
  
  if (rows.length === 0) {
    // Try alternative selectors
    const altRows = document.querySelectorAll('[class*="product-listing"] li, .product-grid li, .search-list li');
    if (altRows.length === 0) {
      return JSON.stringify({error: 'no_products', selectors_tried: ['.item__list', 'alt'], page_title: document.title, url: window.location.href});
    }
  }
  
  rows.forEach(row => {
    try {
      const product = {};
      
      // PDE code
      const codeEl = row.querySelector('.pde, [class*="pde"], .item__code');
      product.code = codeEl ? codeEl.textContent.trim() : '';
      
      // Name
      const nameEl = row.querySelector('.item__name a, .item__name, [class*="product-name"]');
      product.name = nameEl ? nameEl.textContent.trim() : '';
      
      // Schedule
      const schedEl = row.querySelector('.schedule, [class*="schedule"], .item__schedule');
      product.schedule = schedEl ? schedEl.textContent.trim() : '';
      
      // Price
      const priceEl = row.querySelector('.price, .item__price, [class*="price"]:not([class*="was"])');
      product.wholesalePrice = priceEl ? priceEl.textContent.trim().replace(/[^0-9.]/g, '') : '';
      
      // Was price / RRP
      const wasEl = row.querySelector('.was-price, [class*="was"], .item__was');
      product.wasPrice = wasEl ? wasEl.textContent.trim().replace(/[^0-9.]/g, '') : '';
      
      // Discount
      const discEl = row.querySelector('.discount, [class*="discount"], [class*="saving"]');
      product.discountPercent = discEl ? discEl.textContent.trim().replace(/[^0-9.]/g, '') : '';
      
      // Stock
      const stockEl = row.querySelector('[class*="stock"], .item__stock');
      product.stockStatus = stockEl ? stockEl.textContent.trim() : '';
      
      // Image
      const imgEl = row.querySelector('img');
      product.imageUrl = imgEl ? (imgEl.getAttribute('data-src') || imgEl.src) : '';
      
      // URL
      const linkEl = row.querySelector('a[href*="/p/"]');
      product.url = linkEl ? linkEl.href : '';
      
      // Category from breadcrumb
      product.category = window.location.pathname;
      
      if (product.name) products.push(product);
    } catch(e) {}
  });
  
  // Pagination info
  const pageInfo = document.querySelector('.pagination__count, [class*="pagination"]');
  const nextLink = document.querySelector('a[class*="next"], .pagination-next a, a[rel="next"]');
  
  return JSON.stringify({
    products: products,
    count: products.length,
    hasNext: !!nextLink,
    nextUrl: nextLink ? nextLink.href : null,
    pageInfo: pageInfo ? pageInfo.textContent.trim() : ''
  });
})()
