// Runs on Netlify at every deploy. It gathers every product file that the
// dashboard saves in content/products and writes one products.json for the site.
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'content', 'products');
const items = [];

if (fs.existsSync(dir)) {
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.json')) continue;
    try {
      const p = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
      p.id = file.replace(/\.json$/, '').replace(/[^a-zA-Z0-9_-]/g, '-');
      if (!p.title || !(Number(p.price) > 0)) { console.warn('Skipping (needs a name and a price):', file); continue; }
      items.push(p);
    } catch (err) {
      console.warn('Skipping (not valid JSON):', file, err.message);
    }
  }
}

items.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
fs.writeFileSync(path.join(__dirname, 'products.json'), JSON.stringify({ products: items }, null, 1));
console.log('products.json written with ' + items.length + ' products');
