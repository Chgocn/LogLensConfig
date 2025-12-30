const fs = require('fs');
const path = require('path');

const packsDir = path.join(__dirname, '../packs');
const categoriesPath = path.join(__dirname, '../categories.json');
const registryPath = path.join(__dirname, '../registry.json');

// Check if categories.json exists
if (!fs.existsSync(categoriesPath)) {
    console.error('❌ categories.json not found');
    process.exit(1);
}

const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));
const packs = [];

// Check if packs directory exists
if (fs.existsSync(packsDir)) {
    fs.readdirSync(packsDir).forEach(dir => {
        const packPath = path.join(packsDir, dir, 'pack.json');
        if (!fs.existsSync(packPath)) return;

        const pack = JSON.parse(fs.readFileSync(packPath, 'utf-8'));
        const readmePath = path.join(packsDir, dir, 'README.md');

        packs.push({
            id: pack.id,
            name: pack.name,
            version: pack.version,
            author: pack.author,
            description: pack.description || '',
            tags: pack.tags,
            category: pack.tags[0],
            path: `packs/${dir}/pack.json`,
            readme: fs.existsSync(readmePath) ? `packs/${dir}/README.md` : null,
            updatedAt: new Date().toISOString()
        });
    });
}

const registry = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    baseUrl: 'https://raw.githubusercontent.com/log-compass/community-packs/main',
    categories: categories.categories,
    packs: packs.sort((a, b) => a.name.localeCompare(b.name))
};

fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));

console.log(`✅ Generated registry with ${packs.length} pack(s)`);
console.log(`📁 Categories: ${categories.categories.length}`);
