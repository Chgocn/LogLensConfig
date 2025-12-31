# Log Compass Community Packs

A community-maintained repository of rule packs for [Log Compass](https://github.com/log-compass/log-compass).

English | [中文](README-zh.md)

## 📦 What are Packs?

Packs are pre-configured collections of:
- **Filters** - Highlight and filter specific log patterns
- **Exception Rules** - Detect and categorize errors
- **Log Formats** - Parse custom log formats

## 🚀 Quick Start

### Subscribing to Packs

1. Open Log Compass
2. Go to **Settings** → **Rule Packs**
3. Click **Add Community Source**
4. Enter: `https://raw.githubusercontent.com/log-compass/community-packs/main/registry.json`
5. Browse and enable packs

### Using Packs

Once subscribed, packs are automatically applied based on their categories. You can:
- Enable/disable individual packs
- Customize pack rules locally
- Combine multiple packs

## 📚 Available Categories

| Category | Description |
|----------|-------------|
| 📱 Android | Android logcat, crashes, ANR |
| ☕ Java/JVM | Java applications, exceptions |
| 🌱 Spring Boot | Spring Boot logging patterns |
| 🐳 Kubernetes | Container and orchestration logs |
| 🌐 Web/HTTP | Web server access and error logs |

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Contribution Steps

1. Fork this repository
2. Create your pack in `packs/your-pack-name/`
3. Use `templates/pack-template.json` as a starting point
4. Run `npm run validate` to check your pack
5. Submit a Pull Request

## 📁 Repository Structure

```
├── packs/              # Community rule packs
├── filters/            # LogViewer format filter files
├── categories.json     # Available categories
├── registry.json       # Auto-generated pack registry
├── templates/          # Pack templates
├── scripts/            # Build and validation scripts
└── .github/            # GitHub Actions and templates
```

## 🔧 For Developers

### Local Development

```bash
# Clone the repository
git clone https://github.com/log-compass/community-packs.git
cd community-packs

# Install dependencies
npm install

# Validate all packs
npm run validate

# Build registry
npm run build
```

### Creating a New Pack

```bash
# Create pack directory
mkdir packs/my-pack

# Copy template
cp templates/pack-template.json packs/my-pack/pack.json

# Edit and customize
```

### Converting from LogViewer

If you have `.filter` files from [tibagni/LogViewer](https://github.com/tibagni/LogViewer), use the conversion script:

```bash
node scripts/convert-logviewer.js your-filters.filter \
  --author your-name \
  --tags android \
  --output packs/your-pack/pack.json
```

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🔗 Links

- [Log Compass](https://github.com/log-compass/log-compass)
- [Documentation](https://log-compass.dev/docs)
- [Issue Tracker](https://github.com/log-compass/community-packs/issues)
