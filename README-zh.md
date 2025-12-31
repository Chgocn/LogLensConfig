# Log Compass 社区规则包

[Log Compass](https://github.com/log-compass/log-compass) 的社区维护规则包仓库。

[English](README.md) | 中文

## 📦 什么是规则包？

规则包是预配置的规则集合，包含：
- **过滤器** - 高亮和筛选特定日志模式
- **异常规则** - 检测和分类错误
- **日志格式** - 解析自定义日志格式

## 🚀 快速开始

### 订阅规则包

1. 打开 Log Compass
2. 进入 **设置** → **规则包**
3. 点击 **添加社区源**
4. 输入：`https://raw.githubusercontent.com/log-compass/community-packs/main/registry.json`
5. 浏览并启用规则包

### 使用规则包

订阅后，规则包会根据其分类自动应用。你可以：
- 启用/禁用单个规则包
- 本地自定义规则
- 组合使用多个规则包

## 📚 可用分类

| 分类 | 描述 |
|------|------|
| 📱 Android | Android logcat、崩溃、ANR |
| ☕ Java/JVM | Java 应用、异常 |
| 🌱 Spring Boot | Spring Boot 日志模式 |
| 🐳 Kubernetes | 容器和编排日志 |
| 🌐 Web/HTTP | Web 服务器访问和错误日志 |

## 🤝 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解指南。

### 快速贡献步骤

1. Fork 本仓库
2. 在 `packs/your-pack-name/` 创建你的规则包
3. 使用 `templates/pack-template.json` 作为起点
4. 运行 `npm run validate` 验证规则包
5. 提交 Pull Request

## 📁 仓库结构

```
├── packs/              # 社区规则包
├── filters/            # LogViewer 格式的 filter 文件
├── categories.json     # 可用分类
├── registry.json       # 自动生成的规则包注册表
├── templates/          # 规则包模板
├── scripts/            # 构建和验证脚本
└── .github/            # GitHub Actions 和模板
```

## 🔧 开发者指南

### 本地开发

```bash
# 克隆仓库
git clone https://github.com/log-compass/community-packs.git
cd community-packs

# 安装依赖
npm install

# 验证所有规则包
npm run validate

# 构建注册表
npm run build
```

### 创建新规则包

```bash
# 创建规则包目录
mkdir packs/my-pack

# 复制模板
cp templates/pack-template.json packs/my-pack/pack.json

# 编辑并自定义
```

### 从 LogViewer 转换

如果你有 [tibagni/LogViewer](https://github.com/tibagni/LogViewer) 的 `.filter` 文件，可以使用转换脚本：

```bash
node scripts/convert-logviewer.js your-filters.filter \
  --author your-name \
  --tags android \
  --output packs/your-pack/pack.json
```

## 📄 许可证

MIT 许可证 - 详见 [LICENSE](LICENSE)

## 🔗 链接

- [Log Compass](https://github.com/log-compass/log-compass)
- [文档](https://log-compass.dev/docs)
- [问题追踪](https://github.com/log-compass/community-packs/issues)
