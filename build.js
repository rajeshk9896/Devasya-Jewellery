// Runs on Vercel at every deploy (npm run build).
// 1. copies the site into the "public" folder
// 2. gathers every product file saved by the dashboard into public/products.json
// 3. makes small web-sized copies of every product photo (150, 500 and 900 px wide)
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'public');
const SIZES = [150, 500, 900];
const IMG_EXT = /\.(jpe?g|png|webp)$/i;
const safeBase = (file) => file.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '-');

function copyDir(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, entry.name), b = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(a, b); else fs.copyFileSync(a, b);
  }
}

async function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  // 1. site files
  for (const f of ['index.html', 'intro.mp4']) {
    if (fs.existsSync(path.join(ROOT, f))) fs.copyFileSync(path.join(ROOT, f), path.join(OUT, f));
  }
  copyDir(path.join(ROOT, 'admin'), path.join(OUT, 'admin'));

  // 2. products
  const pdir = path.join(ROOT, 'content', 'products');
  const items = [];
  if (fs.existsSync(pdir)) {
    for (const file of fs.readdirSync(pdir)) {
      if (!file.endsWith('.json')) continue;
      try {
        const p = JSON.parse(fs.readFileSync(path.join(pdir, file), 'utf8'));
        p.id = file.replace(/\.json$/, '').replace(/[^a-zA-Z0-9_-]/g, '-');
        if (!p.title || !(Number(p.price) > 0)) { console.warn('Skipping (needs a name and a price):', file); continue; }
        items.push(p);
      } catch (err) {
        console.warn('Skipping (not valid JSON):', file, err.message);
      }
    }
  }
  items.sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
  fs.writeFileSync(path.join(OUT, 'products.json'), JSON.stringify({ products: items }, null, 1));
  console.log('products.json written with ' + items.length + ' products');

  // 3. photos
  const idir = path.join(ROOT, 'images', 'products');
  const files = fs.existsSync(idir) ? fs.readdirSync(idir).filter((f) => !f.startsWith('.')) : [];
  let sharp = null;
  try { sharp = require('sharp'); } catch (e) { console.warn('sharp is not available, copying the original photos instead'); }
  const keepOriginal = (f) => {
    fs.mkdirSync(path.join(OUT, 'images', 'products'), { recursive: true });
    fs.copyFileSync(path.join(idir, f), path.join(OUT, 'images', 'products', f));
  };
  for (const f of files) {
    if (!sharp || !IMG_EXT.test(f)) { keepOriginal(f); continue; }
    try {
      for (const w of SIZES) {
        const dir = path.join(OUT, 'img', String(w));
        fs.mkdirSync(dir, { recursive: true });
        await sharp(path.join(idir, f)).rotate().resize({ width: w, withoutEnlargement: true })
          .webp({ quality: 78 }).toFile(path.join(dir, safeBase(f) + '.webp'));
      }
    } catch (err) {
      console.warn('Could not resize', f, '- using the original:', err.message);
      keepOriginal(f);
    }
  }
  console.log('photos processed: ' + files.length);
}

main().catch((e) => { console.error(e); process.exit(1); });
