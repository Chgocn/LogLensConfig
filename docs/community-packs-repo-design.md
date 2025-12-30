# 社区规则包公共仓库设计

## 仓库结构

```
github.com/log-compass/community-packs/
├── .github/
│   ├── workflows/
│   │   ├── validate-pack.yml    # 自动验证 PR
│   │   └── publish.yml          # 合并后自动更新 registry
│   ├── ISSUE_TEMPLATE/
│   │   └── new-pack-request.md
│   └── PULL_REQUEST_TEMPLATE.md
├── registry.json                 # 自动生成
├── categories.json               # 管理者维护
├── packs/
│   ├── android-anr/
│   │   ├── pack.json
│   │   ├── README.md
│   │   └── MAINTAINERS.md
│   └── spring-boot/
├── templates/
│   └── pack-template.json
├── scripts/
│   ├── validate.js
│   └── build-registry.js
├── CONTRIBUTING.md
└── README.md
```

---

## categories.json

```json
{
  "version": "1.0.0",
  "categories": [
    {
      "id": "android",
      "name": "Android",
      "icon": "smartphone",
      "description": "Android logging and crash detection",
      "maintainers": ["chgocn"],
      "acceptingSubmissions": true
    },
    {
      "id": "java",
      "name": "Java/JVM",
      "icon": "coffee",
      "maintainers": ["user123"],
      "acceptingSubmissions": true
    }
  ],
  "customTagsAllowed": true,
  "customTagPrefix": "custom:",
  "customTagRules": {
    "minLength": 3,
    "maxLength": 30,
    "pattern": "^[a-z0-9-]+$",
    "requireApproval": false
  }
}
```

---

## pack.json 模板

```json
{
  "id": "pack-name",
  "name": "Pack Display Name",
  "version": "1.0.0",
  "author": "github-username",
  "description": "Brief description",
  "tags": ["android", "crash"],
  "filters": [],
  "exceptionRules": [],
  "logFormats": [],
  "changelog": [
    { "version": "1.0.0", "date": "2024-12-30", "changes": ["Initial release"] }
  ]
}
```

---

## 贡献流程

```
Contributor          GitHub Actions       Maintainer
    │                      │                  │
    ├── Fork repo          │                  │
    ├── Create pack.json   │                  │
    ├── Submit PR ────────>│                  │
    │                      ├── Validate JSON  │
    │                      ├── Check fields   │
    │                      ├── Validate tags  │
    │                      │                  │
    │<── Report Results ───┤                  │
    │                      │                  │
    │                      │ ─── Notify ─────>│
    │                      │                  ├── Review
    │                      │                  ├── Approve/Request
    │                      │<── Merge ────────┤
    │                      │                  │
    │                      ├── Build registry │
    │                      └── Publish        │
```

---

## GitHub Actions

### validate-pack.yml

```yaml
name: Validate Pack

on:
  pull_request:
    paths:
      - 'packs/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install Dependencies
        run: npm ci
        
      - name: Validate Pack JSON
        run: node scripts/validate.js
        
      - name: Check Required Fields
        run: |
          for dir in packs/*/; do
            if [ -f "$dir/pack.json" ]; then
              node -e "
                const pack = require('./$dir/pack.json');
                const required = ['id', 'name', 'version', 'author', 'tags'];
                required.forEach(f => {
                  if (!pack[f]) throw new Error('Missing: ' + f);
                });
              "
            fi
          done
```

### publish.yml

```yaml
name: Publish Registry

on:
  push:
    branches: [main]
    paths:
      - 'packs/**'
      - 'categories.json'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build Registry
        run: node scripts/build-registry.js
        
      - name: Commit Registry
        run: |
          git config user.name 'github-actions'
          git config user.email 'github-actions@github.com'
          git add registry.json
          git commit -m 'chore: update registry' || exit 0
          git push
```

---

## scripts/validate.js

```javascript
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
    logFormats: { type: 'array' }
  }
};

const ajv = new Ajv();
const validate = ajv.compile(packSchema);

const packsDir = path.join(__dirname, '../packs');
const categories = require('../categories.json');
const validTags = categories.categories.map(c => c.id);

let hasError = false;

fs.readdirSync(packsDir).forEach(dir => {
  const packPath = path.join(packsDir, dir, 'pack.json');
  if (!fs.existsSync(packPath)) return;
  
  const pack = JSON.parse(fs.readFileSync(packPath, 'utf-8'));
  
  // Schema validation
  if (!validate(pack)) {
    console.error(`❌ ${dir}: Schema validation failed`);
    console.error(validate.errors);
    hasError = true;
    return;
  }
  
  // Tags validation
  pack.tags.forEach(tag => {
    const isValid = validTags.includes(tag) || 
                   tag.startsWith(categories.customTagPrefix);
    if (!isValid) {
      console.error(`❌ ${dir}: Invalid tag "${tag}"`);
      hasError = true;
    }
  });
  
  console.log(`✅ ${dir}: Valid`);
});

if (hasError) process.exit(1);
```

---

## scripts/build-registry.js

```javascript
const fs = require('fs');
const path = require('path');

const packsDir = path.join(__dirname, '../packs');
const categories = require('../categories.json');

const packs = [];

fs.readdirSync(packsDir).forEach(dir => {
  const packPath = path.join(packsDir, dir, 'pack.json');
  if (!fs.existsSync(packPath)) return;
  
  const pack = JSON.parse(fs.readFileSync(packPath, 'utf-8'));
  
  packs.push({
    id: pack.id,
    name: pack.name,
    version: pack.version,
    author: pack.author,
    description: pack.description || '',
    tags: pack.tags,
    category: pack.tags[0],
    path: `packs/${dir}/pack.json`,
    readme: fs.existsSync(path.join(packsDir, dir, 'README.md'))
      ? `packs/${dir}/README.md`
      : null,
    updatedAt: new Date().toISOString()
  });
});

const registry = {
  version: '1.0.0',
  generatedAt: new Date().toISOString(),
  baseUrl: 'https://raw.githubusercontent.com/log-compass/community-packs/main',
  categories: categories.categories,
  packs: packs.sort((a, b) => a.name.localeCompare(b.name))
};

fs.writeFileSync(
  path.join(__dirname, '../registry.json'),
  JSON.stringify(registry, null, 2)
);

console.log(`✅ Generated registry with ${packs.length} packs`);
```

---

## registry.json (自动生成)

```json
{
  "version": "1.0.0",
  "generatedAt": "2024-12-30T00:00:00Z",
  "baseUrl": "https://raw.githubusercontent.com/log-compass/community-packs/main",
  "categories": [...],
  "packs": [
    {
      "id": "android-anr",
      "name": "ANR Detection",
      "version": "1.2.0",
      "author": "chgocn",
      "description": "Detect ANR and native crashes",
      "tags": ["android", "crash"],
      "category": "android",
      "path": "packs/android-anr/pack.json",
      "readme": "packs/android-anr/README.md",
      "updatedAt": "2024-12-30T00:00:00Z"
    }
  ]
}
```

---

## 权限矩阵

| 操作 | Owner | Maintainer | Contributor |
|------|-------|------------|-------------|
| 创建分类 | ✅ | ❌ | ❌ |
| 编辑分类 | ✅ | ✅ (自己的) | ❌ |
| 审核 PR | ✅ | ✅ (自己分类) | ❌ |
| 提交规则包 | ✅ | ✅ | ✅ |
| 编辑 registry | ✅ (自动) | ❌ | ❌ |

---

## 自定义标签规则

- 必须以 `custom:` 前缀开头
- 长度 3-30 字符
- 只允许小写字母、数字、连字符
- 默认无需审批，`requireApproval: true` 时需 Owner 批准
