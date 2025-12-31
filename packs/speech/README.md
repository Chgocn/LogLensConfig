# Speech Recognition Filters

语音识别相关的日志过滤规则包。

## Features

- 语义结果识别
- 语义外抛 (2.0/3.5)
- TTS 播报
- 唤醒成功检测
- SpeechSdk 日志

## Filters

| Filter | Pattern | Color |
|--------|---------|-------|
| 语义结果 | `SrSolution...` | Teal |
| 语义外抛3.5 | `PlatformMessageAgent...` | Teal |
| 语义外抛2.0 | `PlatformMessageAgent...` | Purple |
| Tts播报 | `TtsService...` | Yellow |
| 唤醒成功 | `MulMvwManager...` | Yellow |
| 智能助理唤醒成功40003 | `MvwSolution...` | Red |
| tts文本 | `TtsPlayer...` | Teal |
| SpeechSdk | `SpeechSdk` | Blue |

## Maintainers

- [@chgocn](https://github.com/chgocn)
