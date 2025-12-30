# Contributing to Community Packs

Thank you for your interest in contributing to the Log Compass Community Packs repository! This guide will help you get started.

## Table of Contents

- [Getting Started](#getting-started)
- [Creating a New Pack](#creating-a-new-pack)
- [Pack Structure](#pack-structure)
- [Submission Guidelines](#submission-guidelines)
- [Review Process](#review-process)
- [Code of Conduct](#code-of-conduct)

## Getting Started

1. **Fork the repository** to your own GitHub account
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/community-packs.git
   cd community-packs
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```

## Creating a New Pack

### Step 1: Create Pack Directory

Create a new directory under `packs/` with a lowercase, hyphenated name:

```bash
mkdir packs/your-pack-name
```

### Step 2: Create pack.json

Copy the template and customize it:

```bash
cp templates/pack-template.json packs/your-pack-name/pack.json
```

Edit the file with your pack details. Required fields:

| Field | Description |
|-------|-------------|
| `id` | Unique identifier (must match directory name) |
| `name` | Display name for the pack |
| `version` | Semantic version (e.g., `1.0.0`) |
| `author` | Your GitHub username |
| `tags` | Array of category tags |

### Step 3: Add Documentation

Create a `README.md` in your pack directory describing:

- What the pack does
- Supported log formats
- Example usage
- Filter descriptions

### Step 4: Validate Your Pack

Run validation locally before submitting:

```bash
npm run validate
```

## Pack Structure

```
packs/your-pack-name/
├── pack.json       # Required: Pack definition
├── README.md       # Required: Documentation
└── MAINTAINERS.md  # Optional: Maintainer list
```

### pack.json Schema

```json
{
  "id": "pack-name",
  "name": "Pack Display Name",
  "version": "1.0.0",
  "author": "github-username",
  "description": "Brief description",
  "tags": ["category-id"],
  "filters": [...],
  "exceptionRules": [...],
  "logFormats": [...],
  "changelog": [...]
}
```

## Tags

### Valid Categories

Use tags from `categories.json`:
- `android` - Android logging
- `java` - Java/JVM applications
- `spring-boot` - Spring Boot applications
- `kubernetes` - Kubernetes/containers
- `web` - Web servers and HTTP

### Custom Tags

You can create custom tags with the `custom:` prefix:
- Must be 3-30 characters
- Lowercase letters, numbers, and hyphens only
- Example: `custom:my-framework`

## Submission Guidelines

1. **One pack per PR** - Keep PRs focused
2. **Follow naming conventions** - Use lowercase, hyphenated names
3. **Include documentation** - README.md is required
4. **Test locally** - Run `npm run validate` before submitting
5. **Describe your changes** - Use the PR template

## Review Process

1. Submit your PR using the provided template
2. Automated checks will validate your pack
3. A maintainer will review your submission
4. Address any feedback
5. Once approved, your pack will be merged

### Review Timeline

- Initial review: Within 3 business days
- Follow-up reviews: Within 2 business days

## Code of Conduct

- Be respectful and constructive
- Focus on improving the community
- Help others learn and contribute

## Questions?

- Open an issue with the `question` label
- Check existing issues for answers

Thank you for contributing! 🎉
