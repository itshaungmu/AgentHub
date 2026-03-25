# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1] - 2026-03-25

### Changed
- **Enhanced verify command**: Colorized output with detailed health checks and actionable suggestions
- **Enhanced update/rollback commands**: Better formatted output with version change information and follow-up hints
- **Improved Chinese localization**: All lifecycle commands now have fully Chinese output

## [0.2.0] - 2026-03-25

### Added
- **OpenClaw-first positioning**: Clear product positioning focused on OpenClaw Agent distribution
- **Improved documentation**: README restructured with 3-step quick start guide
- **Target user clarification**: Added "适合谁/不适合谁" section to README

### Changed
- **README overhaul**: Translated to Chinese, emphasizing OpenClaw Agent distribution workflow
- **Fixed repository URLs**: All links now point to correct GitHub repository (itshaungmu/AgentHub)
- **Added npm badge**: Package version now visible in README header

### Documentation
- Updated CHANGELOG with complete version history
- Fixed GitHub comparison links in CHANGELOG

## [0.1.8] - 2026-03-25

### Added
- Colorized CLI output for better user experience

## [0.1.7] - 2026-03-25

### Changed
- Refactored code for better maintainability
- Extracted `requireArg` helper in CLI
- Extracted `sortByDownloadsAndTime` utility
- Centralized agentSpec parsing with `parseSpec`
- Extracted shared version utilities and management logic

### Removed
- Unused `skill-md.js` file
- Unused `download-stats.js` file

## [0.1.6] - 2026-03-24

### Added
- Remote update/rollback workflow support
- Install verification command (`verify`)
- Remote browse commands support
- Lifecycle commands exposed in CLI
- Install record tracking

### Fixed
- Network request fallback to curl
- Improved remote install error messages
- Allow install without `--target-workspace` (defaults to current directory)

## [0.1.5] - 2026-03-23

### Added
- Remote server install support
- Resilient remote install fetch with Node http fallback

### Fixed
- Download count not incrementing on remote install
- Support both short name and URI format for install command

## [0.1.1] - 2026-03-22

### Fixed
- Install UX improvements: shebang + remote server install support

## [0.1.0] - 2026-03-20

### Added
- Initial release of AgentHub
- `pack` command - Pack OpenClaw workspace into Agent Bundle
- `publish` command - Publish bundle to local registry
- `publish-remote` command - Publish bundle to remote HTTP server
- `search` command - Search agents in registry
- `info` command - View agent details
- `install` command - Install agent to target workspace
- `list` command - List installed agents in workspace
- `versions` command - View agent version history
- `update` command - Update agent to latest version
- `rollback` command - Rollback agent to specified version
- `stats` command - View agent statistics
- `serve` command - Start HTTP server with Web UI and API
- Support for layered memory (public/portable/private)
- HTTP API for remote operations
- Dark-themed Web UI with i18n support (EN/中文)
- Complete test coverage

### Documentation
- README with quick start guide
- CONTRIBUTING guide
- MIT License

[0.2.1]: https://github.com/itshaungmu/AgentHub/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/itshaungmu/AgentHub/compare/v0.1.8...v0.2.0
[0.1.8]: https://github.com/itshaungmu/AgentHub/compare/v0.1.7...v0.1.8
[0.1.7]: https://github.com/itshaungmu/AgentHub/compare/v0.1.6...v0.1.7
[0.1.6]: https://github.com/itshaungmu/AgentHub/compare/v0.1.5...v0.1.6
[0.1.5]: https://github.com/itshaungmu/AgentHub/compare/v0.1.1...v0.1.5
[0.1.1]: https://github.com/itshaungmu/AgentHub/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/itshaungmu/AgentHub/releases/tag/v0.1.0
