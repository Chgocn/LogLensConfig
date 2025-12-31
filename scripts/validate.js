const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const packSchema = {
  type: 'object',
  required: ['id', 'name', 'version', 'author', 'tags'],
  properties: {
    id: { type: 'string', pattern: '^[a-z0-9-]+$' },
    name: { type: 'string', minLength: 1 },
    version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' },
    author: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' }, minItems: 1 },
    description: { type: 'string' },
    filters: { type: 'array' },
    exceptionRules: { type: 'array' },
    logFormats: { type: 'array' },
    changelog: { type: 'array' }
  }
};

const ajv = new Ajv();
const validate = ajv.compile(packSchema);

const packsDir = path.join(__dirname, '../packs');
const categoriesPath = path.join(__dirname, '../categories.json');

// Check if packs directory exists
if (!fs.existsSync(packsDir)) {
  console.log('ℹ️  No packs directory found, skipping validation');
  process.exit(0);
}

// Check if categories.json exists
if (!fs.existsSync(categoriesPath)) {
  console.error('❌ categories.json not found');
  process.exit(1);
}

const categories = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));
const validTags = categories.categories.map(c => c.id);

let hasError = false;
let packCount = 0;

fs.readdirSync(packsDir).forEach(dir => {
  const packPath = path.join(packsDir, dir, 'pack.json');
  if (!fs.existsSync(packPath)) return;

  packCount++;
  const packContent = fs.readFileSync(packPath, 'utf-8');

  let pack;
  try {
    pack = JSON.parse(packContent);
  } catch (e) {
    console.error(`❌ ${dir}: Invalid JSON - ${e.message}`);
    hasError = true;
    return;
  }

  // Schema validation
  if (!validate(pack)) {
    console.error(`❌ ${dir}: Schema validation failed`);
    console.error(validate.errors);
    hasError = true;
    return;
  }

  // ID should match directory name
  if (pack.id !== dir) {
    console.error(`❌ ${dir}: Pack ID "${pack.id}" does not match directory name`);
    hasError = true;
  }

  // Tags validation
  pack.tags.forEach(tag => {
    const isValidCategory = validTags.includes(tag);
    const isCustomTag = tag.startsWith(categories.customTagPrefix);

    if (isCustomTag && categories.customTagsAllowed) {
      const customTag = tag.slice(categories.customTagPrefix.length);
      const rules = categories.customTagRules;

      if (customTag.length < rules.minLength || customTag.length > rules.maxLength) {
        console.error(`❌ ${dir}: Custom tag "${tag}" length must be ${rules.minLength}-${rules.maxLength}`);
        hasError = true;
      }

      if (!new RegExp(rules.pattern).test(customTag)) {
        console.error(`❌ ${dir}: Custom tag "${tag}" does not match pattern ${rules.pattern}`);
        hasError = true;
      }
    } else if (!isValidCategory && !isCustomTag) {
      console.error(`❌ ${dir}: Invalid tag "${tag}". Use a valid category or prefix with "${categories.customTagPrefix}"`);
      hasError = true;
    }
  });

  if (!hasError) {
    console.log(`✅ ${dir}: Valid`);
  }
});

if (packCount === 0) {
  console.log('ℹ️  No packs found to validate');
}

if (hasError) {
  process.exit(1);
} else {
  console.log(`\n✨ All ${packCount} pack(s) validated successfully`);

  // Auto-build registry when validation passes
  console.log('\n🔄 Updating registry...');
  try {
    require('./build-registry.js');
  } catch (e) {
    console.error('⚠️  Failed to update registry:', e.message);
    process.exit(1);
  }
}
