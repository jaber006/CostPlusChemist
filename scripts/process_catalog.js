const fs = require('fs');
const path = require('path');

// Read the NDJSON file and filter products
function processCatalog() {
    const inputFile = path.join(__dirname, '..', 'data', 'sigma_catalog.ndjson');
    const outputFile = path.join(__dirname, '..', 'data', 'products.json');
    
    console.log('Processing Sigma catalog...');
    
    const rawData = fs.readFileSync(inputFile, 'utf8');
    const lines = rawData.trim().split('\n');
    
    console.log(`Total lines in NDJSON: ${lines.length}`);
    
    const products = [];
    const categories = new Set();
    const brands = new Set();
    
    let filtered = 0;
    
    for (const line of lines) {
        try {
            const product = JSON.parse(line);
            
            // Filter logic: Only include products with stock or backorder
            // st > 0 = in stock, st = -3 = backorder
            // Exclude: st = -1 (discontinued), st = -2 (cannot supply), st = 0 (unknown)
            if (product.st <= 0 && product.st !== -3) {
                filtered++;
                continue;
            }
            
            // Only include products with valid data
            if (!product.n || !product.p || parseFloat(product.p) <= 0) {
                filtered++;
                continue;
            }
            
            // Calculate pricing
            const wholesalePrice = parseFloat(product.p);
            const listPrice = parseFloat(product.lp) || wholesalePrice * 2;
            const ourPrice = wholesalePrice * 1.20; // 20% markup
            const rrpEstimate = listPrice !== wholesalePrice ? listPrice : wholesalePrice * 2;
            const savings = Math.max(0, rrpEstimate - ourPrice);
            const savingsPercent = rrpEstimate > 0 ? Math.round((savings / rrpEstimate) * 100) : 0;
            
            const processedProduct = {
                code: product.c,
                name: product.n.trim(),
                brand: product.b || '',
                category: product.cat || 'General',
                schedule: product.s || '',
                wholesalePrice: wholesalePrice,
                ourPrice: Math.round(ourPrice * 100) / 100, // Round to 2 decimals
                rrp: Math.round(rrpEstimate * 100) / 100,
                savings: Math.round(savings * 100) / 100,
                savingsPercent: savingsPercent,
                stock: product.st,
                imageUrl: product.i || '',
                searchText: `${product.n} ${product.b} ${product.cat}`.toLowerCase()
            };
            
            products.push(processedProduct);
            categories.add(product.cat || 'General');
            if (product.b) brands.add(product.b);
            
        } catch (e) {
            console.warn(`Error parsing line: ${line.substring(0, 50)}...`);
            filtered++;
        }
    }
    
    // Sort products by name
    products.sort((a, b) => a.name.localeCompare(b.name));
    
    console.log(`Processed products: ${products.length}`);
    console.log(`Filtered out: ${filtered}`);
    console.log(`Categories: ${categories.size}`);
    console.log(`Brands: ${brands.size}`);
    
    // Create output data
    const output = {
        meta: {
            totalProducts: products.length,
            categories: Array.from(categories).sort(),
            brands: Array.from(brands).sort(),
            lastUpdated: new Date().toISOString()
        },
        products: products
    };
    
    // Write to file
    fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
    console.log(`Written ${products.length} products to ${outputFile}`);
    
    // Log some sample categories and their counts
    const categoryCounts = {};
    products.forEach(p => {
        categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });
    
    console.log('\nTop categories:');
    Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([cat, count]) => {
            console.log(`  ${cat}: ${count} products`);
        });
        
    return output;
}

if (require.main === module) {
    processCatalog();
}

module.exports = processCatalog;