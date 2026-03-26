# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.8] - 2026-03-26

### Documentation
- **Weekly Metrics Dashboard**: Comprehensive tracking template for growth and product KPIs
- Includes 90-day goal tracking and milestone monitoring

## [0.2.7] - 2026-03-26

### Documentation
- **CONTRIBUTING.md**: Complete rewrite with project structure and development guide
- Fixed GitHub repository URLs throughout documentation
- Added commit conventions and code style guidelines

## [0.2.6] - 2026-03-26

### Added
- **Growth Plan**: 4-week external distribution plan with content templates
- **Feedback System**: Comprehensive feedback form and GitHub Issue template

### Documentation
- docs/growth-plan.md: External distribution strategy
- docs/feedback-form.md: User feedback collection template
- .github/ISSUE_TEMPLATE/feedback.md: GitHub Issue template

## [0.2.5] - 2026-03-26

### Documentation
- **FAQ Page**: Comprehensive FAQ covering installation, usage, and troubleshooting
- Updated README with FAQ link

## [0.2.4] - 2026-03-26

### Documentation
- **Team Distribution Guide**: Complete tutorial for team leaders to standardize agent distribution
- **Quick Start 3 Steps**: 10-minute onboarding guide for new users
- Added documentation links in README

### Changed
- Improved README structure with tutorial section

## [0.2.3] - 2026-03-26

### Added
- **Team Knowledge Assistant Sample**: New sample agent for team knowledge Q&A
- **Product Documentation Writer Sample**: New sample agent for creating product docs
- **3 Official Sample Agents**: Now includes code-review, knowledge-assistant, and doc-writer

### Documentation
- Each sample agent includes complete workspace files and README
- Sample agents demonstrate different use cases (code review, knowledge management, documentation)

## [0.2.2] - 2026-03-25

### Added
- **Official Sample Agent**: Added `code-review-assistant` sample agent in `/samples` directory
- **Sample Agent Tutorial**: New "试用样板 Agent" section in README for quick onboarding

### Documentation
- Complete quick start tutorial with step-by-step sample agent workflow
- Sample agent includes AGENTS.md, SOUL.md, USER.md, IDENTITY.md, TOOLS.md

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

[0.2.3]: https://github.com/itshaungmu/AgentHub/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/itshaungmu/AgentHub/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/itshaungmu/AgentHub/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/itshaungmu/AgentHub/compare/v0.1.8...v0.2.0
[0.1.8]: https://github.com/itshaungmu/AgentHub/compare/v0.1.7...v0.1.8
[0.1.7]: https://github.com/itshaungmu/AgentHub/compare/v0.1.6...v0.1.7
[0.1.6]: https://github.com/itshaungmu/AgentHub/compare/v0.1.5...v0.1.6
[0.1.5]: https://github.com/itshaungmu/AgentHub/compare/v0.1.1...v0.1.5
[0.1.1]: https://github.com/itshaungmu/AgentHub/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/itshaungmu/AgentHub/releases/tag/v0.1.0
