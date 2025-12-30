# Android ANR Detection

A rule pack for detecting ANR (Application Not Responding) issues and native crashes in Android logs.

## Features

- **ANR Trace Detection**: Highlights `ANR in` messages in orange
- **Native Crash Detection**: Highlights `FATAL SIGNAL` messages in red
- **Tombstone Detection**: Highlights tombstone markers for crash analysis

## Usage

1. Subscribe to this pack in Log Compass
2. Open your Android logcat output
3. ANR and crash-related logs will be automatically highlighted

## Filters

| Filter | Pattern | Color | Description |
|--------|---------|-------|-------------|
| ANR Trace | `ANR in` | Orange | Detects ANR start markers |
| Native Crash | `FATAL SIGNAL` | Red | Detects native signal crashes |
| Tombstone | `*** *** ...` | Pink | Detects tombstone headers |

## Contributing

Feel free to submit issues or PRs to improve this pack.

## Maintainers

- [@chgocn](https://github.com/chgocn)
