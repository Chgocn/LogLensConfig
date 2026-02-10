# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LogLensConfig is a centralized configuration repository for the log analysis ecosystem. It serves as the shared configuration hub between log-compass (GUI) and logsniper (CLI).

## Three-Project Ecosystem Role

LogLensConfig serves as the **Configuration Hub** in the ecosystem:

```
┌─────────────────────────────────────────┐
│  log-compass (React GUI)                 │
│  - Create and test rules                 │
│  - Export rule packs ──────────┐        │
│  - Import shared configs       │        │
└────────────────────────────────┼────────┘
                                 ↓
                  ┌──────────────────────────────┐
                  │  LogLensConfig (Git Repo)    │
                  │  .log-compass/               │
                  │  ├── packs/                  │
                  │  ├── preferences.json        │
                  │  └── projects/               │
                  └──────────────┬───────────────┘
                                 ↓
┌─────────────────────────────────────────┐
│  logsniper (Python CLI)                  │
│  - Read rule packs ─────────────────────┤
│  - Apply to batch analysis               │
│  - Execute commands                      │
└──────────────────────────────────────────┘
```

### Design Philosophy

**LogLensConfig = Single Source of Truth**

**Key Responsibilities:**
1. **Rule Pack Storage**: Store filter and exception rules
2. **Team Collaboration**: Share configurations via git
3. **Version Control**: Track rule evolution over time
4. **Consistency**: Ensure log-compass and logsniper use same rules

## Directory Structure

```
LogLensConfig/
└── .log-compass/
    ├── packs/               # Rule packs (JSON)
    │   ├── business.json    # Business logic filters
    │   ├── speech.json      # Speech recognition rules
    │   └── pack-*.json      # User-created packs
    ├── preferences.json     # User preferences
    └── projects/            # Project-specific configs
        └── project-*/
            └── config.json
```

## File Formats

### Rule Pack Format

**Structure:**
```json
{
  "type": "rule-pack",
  "version": "2.0",
  "app": "log-compass",
  "exportedAt": "2026-01-29T06:17:10.212Z",
  "pack": {
    "id": "speech",
    "name": "Speech Recognition",
    "version": "1.0.0",
    "author": "chgocn",
    "description": "Converted from LogViewer filter file",
    "tags": ["android"],
    "filters": [...],
    "exceptionRules": [...],
    "logFormats": [...],
    "changelog": [...],
    "type": "user"
  }
}
```

**Filter Definition:**
```json
{
  "id": "filter-1",
  "name": "语义结果",
  "pattern": "SrSolution.*ISS_SR_MSG_RESULT",
  "isRegex": true,
  "caseSensitive": false,
  "color": "#006666",
  "enabled": true,
  "description": "语义识别结果，需要记录到分析报告"
}
```

**Key Fields:**
- `pattern`: Regex or literal string to match
- `isRegex`: Whether pattern is regex
- `color`: Highlight color in log-compass
- `description`: Human-readable explanation

### Preferences Format

```json
{
  "type": "preferences",
  "version": "2.0",
  "app": "log-compass",
  "exportedAt": "2026-01-29T06:16:50.151Z",
  "preferences": {
    "isDarkMode": true,
    "showLineNumbers": true,
    "wrapLines": false,
    "autoScrollPauseEnabled": true,
    "encoding": "utf-8",
    "isLogLevelColorEnabled": true,
    "levelColors": {
      "verbose": "220 15% 55%",
      "debug": "199 100% 55%",
      "info": "142 76% 45%",
      "warn": "45 100% 55%",
      "error": "0 100% 65%"
    },
    "activeProjectId": null
  }
}
```

## Usage Workflows

### Creating a New Rule Pack

**In log-compass:**
1. Open log files
2. Create filter rules in UI
3. Test and refine patterns
4. Organize into FilterGroup
5. Add `command` field if automation needed
6. Export to LogLensConfig

**Result:**
- New JSON file in `packs/`
- Available for import in other log-compass instances
- Available for logsniper batch processing

### Using Rule Pack with logsniper

```bash
# Apply saved rules to new logs
logsniper --rule-pack /path/to/LogLensConfig/.log-compass/packs/speech.json \
          --path /var/logs/*.log
```

**What happens:**
1. logsniper reads filter rules from pack
2. Scans logs with those patterns
3. Outputs matched results based on configuration

### Sharing with Team

```bash
# Push to git
cd LogLensConfig
git add .log-compass/packs/new-pack.json
git commit -m "Add OOM analysis rule pack"
git push

# Team members pull
git pull

# Rule pack now available in their log-compass
```

## Best Practices

### Rule Pack Naming

**Good:**
- `speech-recognition.json` - Descriptive
- `android-anr-detection.json` - Specific use case
- `production-errors.json` - Clear scope

**Avoid:**
- `pack-1234567890.json` - Non-descriptive
- `rules.json` - Too generic
- `test.json` - Unclear purpose

### Version Control

**Commit:**
- Rule pack JSON files
- Preferences (if team-shared)
- README documenting packs

**Don't Commit:**
- User-specific preferences (unless shared)
- Temporary/auto-generated packs
- Sensitive credentials

## Integration Points

### log-compass Integration

**Export:**
- Menu: "Export Rule Pack"
- Saves to LogLensConfig/packs/
- Includes filters, exceptions, formats

**Import:**
- Menu: "Import Rule Pack"
- Reads from LogLensConfig/packs/
- Merges into current project

### logsniper Integration

**Reading Rule Packs:**
```python
import json

with open('../LogLensConfig/.log-compass/packs/speech.json') as f:
    pack = json.load(f)

for filter in pack['pack']['filters']:
    pattern = filter['pattern']
    is_regex = filter.get('isRegex', False)
    # Apply pattern matching
```

**Mapping Fields:**
- `filters[].pattern` → extraction pattern
- `filters[].isRegex` → regex mode
- `filters[].name` → rule name
- `filters[].color` → highlight color

## Example Rule Packs

### Speech Recognition Debug
```json
{
  "pack": {
    "id": "speech",
    "name": "Speech Recognition Debug",
    "filters": [
      {
        "name": "语义结果",
        "pattern": "SrSolution.*ISS_SR_MSG_RESULT",
        "isRegex": true,
        "color": "#006666",
        "description": "语义识别结果"
      },
      {
        "name": "唤醒成功",
        "pattern": "MulMvwManager.*onMVWMsgProc_ l is 40003",
        "isRegex": true,
        "color": "#660000",
        "description": "语音唤醒成功事件"
      }
    ]
  }
}
```

### Android Error Tracking
```json
{
  "pack": {
    "id": "android-errors",
    "name": "Android Error Tracking",
    "filters": [
      {
        "name": "ANR",
        "pattern": "ANR in|Application Not Responding",
        "isRegex": true,
        "color": "#ff0000",
        "description": "Application Not Responding"
      },
      {
        "name": "Crash",
        "pattern": "FATAL EXCEPTION",
        "isRegex": false,
        "color": "#dc2626",
        "description": "Fatal exception crashes"
      }
    ]
  }
}
```

## Maintenance

### Updating Rule Packs

1. Open in log-compass
2. Modify rules
3. Re-export to LogLensConfig
4. Commit changes with descriptive message

### Deprecating Old Packs

1. Move to `packs/archived/` folder
2. Update README with deprecation notice
3. Inform team via commit message

### Changelog Management

Rule packs include changelog section:
```json
{
  "changelog": [
    {
      "version": "1.1.0",
      "date": "2024-02-01",
      "changes": [
        "Updated patterns for better matching",
        "Added new filters for performance tracking"
      ]
    }
  ]
}
```

## Related Projects

- **log-compass**: React GUI for rule creation (`../log-compass`)
- **logsniper**: Python CLI for batch processing (`../logsniper`)

## Common Issues

### Rule Pack Not Loading in logsniper

**Check:**
1. JSON syntax is valid
2. File path is correct
3. Required fields present (`filters`, `pattern`)

### Merge Conflicts

**Prevention:**
- Don't manually edit auto-generated fields (`exportedAt`)
- Coordinate pack updates with team
- Use descriptive IDs to avoid collisions
